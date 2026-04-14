package com.user.service;
 
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
 
import com.user.utils.LocationUtils;
import com.user.entity.Coupon;
import com.user.service.CouponService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
 
import com.user.dto.OrderItemRequest;
import com.user.dto.OrderItemResponseDto;
import com.user.dto.OrderRequestDto;
import com.user.dto.OrderResponseDto;
import com.user.entity.Order;
import com.user.entity.OrderItem;
import com.user.entity.Restuarent;
import com.user.entity.RestuarentItems;
import com.user.entity.UserEntity;
import com.user.repo.AddressRepo;
import com.user.repo.OrderRepo;
import com.user.repo.RestuarentItemsRepo;
import com.user.repo.RestuarentRepo;
import com.user.repo.UserRepo;
import com.user.repo.DeliveryOrderRepo;
import com.user.entity.DeliveryOrder;
import com.user.enums.DeliveryStatus;
import java.util.Optional;

@Service
@Transactional
public class OrderService {

    @Autowired private OrderRepo orderRepo;
    @Autowired private UserRepo userRepo;
    @Autowired private RestuarentRepo restRepo;
    @Autowired private RestuarentItemsRepo itemRepo;
    @Autowired private AddressRepo addressRepo;
    @Autowired private DeliveryOrderRepo deliveryOrderRepo;
    @Autowired private CouponService couponService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;
 
    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;
 
    public OrderResponseDto placeOrder(String username, OrderRequestDto request) {
        UserEntity user = userRepo.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
 
        Restuarent restaurant = restRepo.findById(request.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
 
        Order order = new Order();
        order.setUser(user);
        order.setRestaurant(restaurant);
        order.setStatus("PLACED");
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaid(false);
 
        // Store customer details at the time of order
        order.setCustomerName(user.getUsername());
        order.setCustomerPhone(user.getPhnno());
        order.setCustomerEmail(user.getMail());
 
        // Save Address as a snapshot string
        System.out.println("Placing Order for Restaurant: " + request.getRestaurantId());
        System.out.println("Address ID: " + request.getAddressId());
        System.out.println("Delivery Address Str: " + request.getDeliveryAddress());

        if (request.getAddressId() != null && request.getAddressId() > 0) {
            com.user.entity.Address addr = addressRepo.findById(request.getAddressId())
                    .orElseThrow(() -> new RuntimeException("Address not found"));
            String fullAddr = addr.getAddressLine() + ", " + addr.getCity() + ", " + addr.getState() + " " + addr.getZipCode();
            System.out.println("Using Saved Address: " + fullAddr);
            order.setDeliveryAddress(fullAddr);
            order.setDeliveryLatitude(addr.getLatitude());
            order.setDeliveryLongitude(addr.getLongitude());
        } else if (request.getDeliveryAddress() != null && !request.getDeliveryAddress().isEmpty()) {
            System.out.println("Using Manual Address: " + request.getDeliveryAddress());
            order.setDeliveryAddress(request.getDeliveryAddress());
            order.setDeliveryLatitude(request.getLatitude());
            order.setDeliveryLongitude(request.getLongitude());
        } else {
            System.out.println("WARNING: No delivery address provided in request!");
        }
 
        List<OrderItem> orderItems = new ArrayList<>();
        double total = 0;
 
        for (OrderItemRequest req : request.getItems()) {
            RestuarentItems item = itemRepo.findById(req.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item not found"));
 
            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setItem(item);
            oi.setQuantity(req.getQty());
            oi.setPrice(item.getPrice());
 
            total += item.getPrice() * req.getQty();
            orderItems.add(oi);
        }
 
        order.setItems(orderItems);
  
        final double subtotal = total; 
        double discount = 0;
        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            couponService.validateCoupon(request.getCouponCode(), subtotal, user.getId(), request.getRestaurantId())
                .ifPresent(coupon -> {
                    double d = couponService.calculateDiscount(coupon, subtotal);
                    order.setCouponCode(coupon.getCode());
                    order.setDiscountAmount(d);
                });
            discount = order.getDiscountAmount() != null ? order.getDiscountAmount() : 0;
        }

        double dFee = request.getDeliveryFee() != null ? request.getDeliveryFee() : 0.0;
        
        // 🚀 ENFORCE: Zero Delivery Fee for First Order
        if (isFirstOrder(username)) {
            System.out.println("First Order Detected for " + username + "! Setting delivery fee to 0.");
            dFee = 0.0;
        }

        double tAmt = request.getTaxAmount() != null ? request.getTaxAmount() : 0.0;
        double pendingFee = user.getPendingCancellationFee() != null ? user.getPendingCancellationFee() : 0.0;
        
        order.setTotalAmount(total + dFee + tAmt + pendingFee - discount);
        order.setDeliveryFee(dFee);
        order.setTaxAmount(tAmt);
 
        // Reset pending fee after applying it to the order
        if (pendingFee > 0) {
            user.setPendingCancellationFee(0.0);
            userRepo.save(user);
        }
 
        // Handle Payment Methods with Partial Wallet Support
        double totalAmount = order.getTotalAmount();
        double totalToPay = totalAmount;
        double walletContribution = 0.0;

        if (request.isUseWallet()) {
            double walletBalance = user.getWalletBalance() != null ? user.getWalletBalance() : 0.0;
            walletContribution = Math.min(walletBalance, totalAmount);
            
            if (walletContribution > 0) {
                user.setWalletBalance(walletBalance - walletContribution);
                userRepo.save(user);
                order.setWalletAmountDeducted(walletContribution);
                totalToPay = totalAmount - walletContribution;
                System.out.println("Partial Wallet Payment: Deducting " + walletContribution + " from balance. Remaining: " + totalToPay);
            }
        }

        if (totalToPay <= 0) {
            order.setPaid(true);
            order.setStatus("ACCEPTED");
            order.setEstimatedPrepTime(30);
        } else {
            if ("COD".equalsIgnoreCase(request.getPaymentMethod())) {
                order.setStatus("ACCEPTED");
                order.setPaid(false);
                order.setEstimatedPrepTime(30);
            } else {
                // Online Payment via Razorpay
                try {
                    RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
                    JSONObject orderRequest = new JSONObject();
                    orderRequest.put("amount", (int) (totalToPay * 100)); // amount in paise
                    orderRequest.put("currency", "INR");
                    orderRequest.put("receipt", "order_rcptid_" + System.currentTimeMillis());
                    com.razorpay.Order razorpayOrder = razorpay.orders.create(orderRequest);
                    order.setRazorpayOrderId(razorpayOrder.get("id"));
                    System.out.println("Created Razorpay Order for remaining: " + totalToPay);
                } catch (RazorpayException e) {
                    throw new RuntimeException("Error creating Razorpay order: " + e.getMessage());
                }
            }
        }
 
        Order savedOrder = orderRepo.save(order);
        if ("ACCEPTED".equalsIgnoreCase(savedOrder.getStatus())) {
            createDeliveryOrder(savedOrder);
        }
        return convertToResponseDto(savedOrder);
    }
 
    public OrderResponseDto verifyPayment(String username, Map<String, String> paymentDetails) {
        String razorpayOrderId = paymentDetails.get("razorpayOrderId");
        String razorpayPaymentId = paymentDetails.get("razorpayPaymentId");
        String razorpaySignature = paymentDetails.get("razorpaySignature");
 
        try {
 
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);
 
            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);
 
            if (isValid) {
                Order order = orderRepo.findByRazorpayOrderId(razorpayOrderId)
                        .orElseThrow(() -> new RuntimeException("Order not found with Razorpay ID: " + razorpayOrderId));

                order.setRazorpayPaymentId(razorpayPaymentId);
                order.setRazorpaySignature(razorpaySignature);
                order.setTransactionId(razorpayPaymentId); // Set transactionId for display
                order.setPaid(true);
                order.setStatus("ACCEPTED");
                order.setEstimatedPrepTime(30);
                
                Order updatedOrder = orderRepo.save(order);
                createDeliveryOrder(updatedOrder);
                System.out.println("Payment Validated for Order ID: " + order.getId() + ". Auto-accepted.");
                System.out.println("Order saved successfully. New transactionId: " + updatedOrder.getTransactionId());
                return convertToResponseDto(updatedOrder);
            } else {
                throw new RuntimeException("Invalid payment signature");
            }
        } catch (RazorpayException e) {
            throw new RuntimeException("Payment verification failed: " + e.getMessage());
        }
    }
 
    public List<OrderResponseDto> fetchOrdersByUser(String username) {
        UserEntity user = userRepo.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
 
        List<Order> orders = orderRepo.findByUserIdWithItems(user.getId());
        return orders.stream().map(this::convertToResponseDto).collect(Collectors.toList());
    }

    public boolean isFirstOrder(String username) {
        UserEntity user = userRepo.findByUsername(username);
        if (user == null) return true; // Treat as new if not found
        return orderRepo.countByUserId(user.getId()) == 0;
    }
 
    public List<OrderResponseDto> fetchOrdersByRestaurant(Long restaurantId) {
        List<Order> orders = orderRepo.findByRestaurantId(restaurantId);
        return orders.stream().map(this::convertToResponseDto).collect(Collectors.toList());
    }
 
    public Double getTotalRevenue() {
        Double revenue = orderRepo.getTotalRevenue();
        return revenue != null ? revenue : 0.0;
    }

    public org.springframework.data.domain.Page<OrderResponseDto> getAllOrders(int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return orderRepo.findAll(pageable).map(this::convertToResponseDto);
    }

    public OrderResponseDto updateOrderStatus(Long orderId, String status, Integer prepTime) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        if (prepTime != null) {
            order.setEstimatedPrepTime(prepTime);
        }
        Order updated = orderRepo.save(order);

        // If Restaurant Accepts, create a DeliveryOrder
        if ("ACCEPTED".equalsIgnoreCase(status)) {
            createDeliveryOrder(order);
        }
        return convertToResponseDto(updated);
    }

    public OrderResponseDto cancelOrder(Long orderId, String username) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to cancel this order");
        }

        String currentStatus = order.getStatus().toUpperCase();
        if ("DELIVERED".equals(currentStatus) || "CANCELLED".equals(currentStatus)) {
            throw new RuntimeException("Order cannot be cancelled in its current state: " + currentStatus);
        }

        // Check if delivery partner is assigned
        int intOrderId = order.getId().intValue();
        Optional<DeliveryOrder> doOpt = deliveryOrderRepo.findByOrderId(intOrderId);
        
        if (doOpt.isPresent()) {
            DeliveryOrder deliveryOrder = doOpt.get();
            // If partner is assigned or order is picked up, etc, apply fee
            if (deliveryOrder.getPartner() != null) {
                UserEntity user = order.getUser();
                double currentFee = user.getPendingCancellationFee() != null ? user.getPendingCancellationFee() : 0.0;
                user.setPendingCancellationFee(currentFee + 59.0);
                userRepo.save(user);
            }
            
            // Update DeliveryOrder status to CANCELLED
            deliveryOrder.setStatus(DeliveryStatus.CANCELLED);
            deliveryOrderRepo.save(deliveryOrder);
        }

        // Refund logic for cancelled orders
        double refundAmount = 0.0;
        if (order.getPaid() != null && order.getPaid()) {
            refundAmount = order.getTotalAmount();
        } else if (order.getWalletAmountDeducted() != null && order.getWalletAmountDeducted() > 0) {
            refundAmount = order.getWalletAmountDeducted();
        }

        if (refundAmount > 0) {
            UserEntity user = order.getUser();
            double currentBalance = user.getWalletBalance() != null ? user.getWalletBalance() : 0.0;
            user.setWalletBalance(currentBalance + refundAmount);
            userRepo.save(user);
            System.out.println("Refunded " + refundAmount + " to " + user.getUsername() + "'s wallet. (Paid: " + order.getPaid() + ")");
        }

        order.setStatus("CANCELLED");
        Order cancelledOrder = orderRepo.save(order);
        return convertToResponseDto(cancelledOrder);
    }

    private void createDeliveryOrder(Order order) {
        // Check if already exists to avoid duplicates
        if (deliveryOrderRepo.findByOrderId(order.getId().intValue()).isPresent()) {
            return;
        }

        DeliveryOrder doOrder = new DeliveryOrder();
        doOrder.setOrderId(order.getId().intValue());
        doOrder.setRestaurantName(order.getRestaurant().getName());
        doOrder.setPickupAddress(order.getRestaurant().getLocation());
        doOrder.setPickupContact(order.getRestaurant().getPhnno());

        doOrder.setCustomerName(order.getCustomerName());
        doOrder.setDeliveryAddress(order.getDeliveryAddress());
        doOrder.setCustomerPhone(order.getCustomerPhone());

        doOrder.setOrderAmount(order.getTotalAmount());

        // Calculate Distance and Earning
        double resLat = 0, resLon = 0;
        if (order.getRestaurant() != null) {
            try {
                if (order.getRestaurant().getR_lat() != null) {
                    resLat = Double.parseDouble(order.getRestaurant().getR_lat());
                }
                if (order.getRestaurant().getR_lon() != null) {
                    resLon = Double.parseDouble(order.getRestaurant().getR_lon());
                }
            } catch (Exception e) {}
        }

        double userLat = order.getDeliveryLatitude() != null ? order.getDeliveryLatitude() : 0;
        double userLon = order.getDeliveryLongitude() != null ? order.getDeliveryLongitude() : 0;

        double distance = LocationUtils.calculateDistance(resLat, resLon, userLat, userLon);
        doOrder.setDistanceKm(distance);

        // Earnings: 15 per km, minimum 20.
        double earnings = Math.max(20.0, Math.round(distance * 15.0));
        doOrder.setDeliveryFee(earnings);
        doOrder.setStatus(DeliveryStatus.ASSIGNED);

        // Populate Coordinates
        doOrder.setDeliveryLatitude(order.getDeliveryLatitude());
        doOrder.setDeliveryLongitude(order.getDeliveryLongitude());
        if (order.getRestaurant() != null) {
            try {
                if (order.getRestaurant().getR_lat() != null) {
                    doOrder.setRestaurantLatitude(Double.parseDouble(order.getRestaurant().getR_lat()));
                }
                if (order.getRestaurant().getR_lon() != null) {
                    doOrder.setRestaurantLongitude(Double.parseDouble(order.getRestaurant().getR_lon()));
                }
            } catch (Exception e) {
                System.err.println("Error parsing restaurant coordinates for DeliveryOrder: " + e.getMessage());
            }
        }

        deliveryOrderRepo.save(doOrder);
    }

    public OrderResponseDto convertToResponseDto(Order order) {
        OrderResponseDto dto = new OrderResponseDto();
        try {
            dto.setId(order.getId());
            
            // Safe Restaurant Access
            if (order.getRestaurant() != null) {
                try {
                    dto.setRestaurantId(order.getRestaurant().getId());
                    dto.setRestaurantName(order.getRestaurant().getName());
                    
                    // Robust Coordinate Parsing
                    if (order.getRestaurant().getR_lat() != null && !order.getRestaurant().getR_lat().isEmpty()) {
                        dto.setRestaurantLatitude(Double.parseDouble(order.getRestaurant().getR_lat()));
                    }
                    if (order.getRestaurant().getR_lon() != null && !order.getRestaurant().getR_lon().isEmpty()) {
                        dto.setRestaurantLongitude(Double.parseDouble(order.getRestaurant().getR_lon()));
                    }
                } catch (Exception e) {
                    System.err.println("Warning: Could not fully populate restaurant info for order " + order.getId() + ": " + e.getMessage());
                    if (dto.getRestaurantName() == null) dto.setRestaurantName("Unknown Restaurant");
                }
            } else {
                dto.setRestaurantName("Unknown Restaurant");
            }

            dto.setTotalAmount(order.getTotalAmount() != null ? order.getTotalAmount() : 0.0);
            dto.setStatus(order.getStatus());
            dto.setCreatedAt(order.getCreatedAt());
            dto.setTransaction_id(order.getTransactionId() != null ? order.getTransactionId() : order.getRazorpayPaymentId());
            dto.setDeliveryAddress(order.getDeliveryAddress());

            dto.setCustomerName(order.getCustomerName());
            dto.setCustomerPhone(order.getCustomerPhone());
            dto.setCustomerEmail(order.getCustomerEmail());
            dto.setPaymentMethod(order.getPaymentMethod());
            dto.setRazorpayOrderId(order.getRazorpayOrderId());
            dto.setDeliveryFee(order.getDeliveryFee() != null ? order.getDeliveryFee() : 0.0);
            dto.setTaxAmount(order.getTaxAmount() != null ? order.getTaxAmount() : 0.0);
            
            dto.setDeliveryLatitude(order.getDeliveryLatitude());
            dto.setDeliveryLongitude(order.getDeliveryLongitude());
            dto.setCouponCode(order.getCouponCode());
            dto.setDiscountAmount(order.getDiscountAmount());
            dto.setEstimatedPrepTime(order.getEstimatedPrepTime());

            // Safe Item Conversion
            List<OrderItemResponseDto> itemDtos = new ArrayList<>();
            if (order.getItems() != null) {
                for (OrderItem oi : order.getItems()) {
                    try {
                        OrderItemResponseDto itemDto = new OrderItemResponseDto();
                        itemDto.setId(oi.getId());
                        
                        if (oi.getItem() != null) {
                            itemDto.setItemName(oi.getItem().getItemName());
                            itemDto.setImageUrl("http://localhost:8082/restaurants/" + oi.getItem().getId() + "/itemimg");
                        } else {
                            itemDto.setItemName("Removed Item");
                        }
                        
                        itemDto.setPrice(oi.getPrice() != null ? oi.getPrice() : 0.0);
                        itemDto.setQuantity(oi.getQuantity() != null ? oi.getQuantity() : 0);
                        itemDtos.add(itemDto);
                    } catch (Exception e) {
                        System.err.println("Warning: Skipping corrupted item in order " + order.getId() + ": " + e.getMessage());
                    }
                }
            }
            dto.setItems(itemDtos);

            // Safe Delivery Partner Lookup
            try {
                if (order.getId() != null) {
                    // Safe conversion to int if ID is small, or use a better query
                    int intId = order.getId().intValue();
                    Optional<DeliveryOrder> doOpt = deliveryOrderRepo.findByOrderId(intId);
                    if (doOpt.isPresent()) {
                        DeliveryOrder dOrder = doOpt.get();
                        if (dOrder.getPartner() != null) {
                            dto.setDeliveryPartnerName(dOrder.getPartner().getName());
                            dto.setDeliveryPartnerPhone(dOrder.getPartner().getPhone());
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Warning: Could not fetch partner info for order " + order.getId());
            }

        } catch (Exception e) {
            System.err.println("CRITICAL ERROR converting order " + order.getId() + " to DTO: " + e.getMessage());
            e.printStackTrace();
        }
        return dto;
    }
}
