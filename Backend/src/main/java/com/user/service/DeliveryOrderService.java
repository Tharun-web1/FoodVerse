package com.user.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.user.entity.DeliveryOrder;
import com.user.entity.RiderEntity;
import com.user.enums.DeliveryStatus;
import com.user.repo.DeliveryOrderRepo;
import com.user.repo.RiderRepo;
import com.user.repo.OrderRepo;
import com.user.entity.Order;
import com.user.entity.DeliveryPhoto;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.*;
import java.util.UUID;
import java.io.IOException;

@Service
@Transactional
public class DeliveryOrderService {
    private static final Logger logger = LoggerFactory.getLogger(DeliveryOrderService.class);

    @Autowired
    private DeliveryOrderRepo orderRepo;

    @Autowired
    private RiderRepo partnerRepo;

    @Autowired
    private RiderService partnerService;

    @Autowired
    private OrderRepo mainOrderRepo;

    private final String UPLOAD_DIR = "uploads/delivery_proofs/";

    // 📦 Assign Order to Partner (Admin)
    public DeliveryOrder assignOrder(
            Integer orderId,
            Integer partnerId,
            DeliveryOrder orderDetails) {

        RiderEntity partner = partnerRepo
                .findById(partnerId)
                .orElseThrow(() ->
                        new RuntimeException("Partner not found"));

        orderDetails.setOrderId(orderId);
        orderDetails.setPartner(partner);
        orderDetails.setStatus(DeliveryStatus.ASSIGNED);
        orderDetails.setAssignedTime(LocalDateTime.now());

        syncCoordinates(orderDetails);

        return orderRepo.save(orderDetails);
    }

    // 🙋 Accept Order by Partner
    public DeliveryOrder acceptOrder(Integer id, Integer partnerId) {
        DeliveryOrder dOrder = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery Order not found"));
        
        RiderEntity partner = partnerRepo.findById(partnerId)
                .orElseThrow(() -> new RuntimeException("Partner not found"));

        dOrder.setPartner(partner);
        dOrder.setStatus(DeliveryStatus.ACCEPTED);
        dOrder.setAssignedTime(LocalDateTime.now());

        syncCoordinates(dOrder);

        return orderRepo.save(dOrder);
    }

    private void syncCoordinates(DeliveryOrder dOrder) {
        if (dOrder.getOrderId() == null) return;
        
        Optional<Order> mainOrderOpt = mainOrderRepo.findById(dOrder.getOrderId().longValue());
        if (mainOrderOpt.isPresent()) {
            Order mainOrder = mainOrderOpt.get();
            
            // Sync Delivery Coordinates
            if (dOrder.getDeliveryLatitude() == null) {
                dOrder.setDeliveryLatitude(mainOrder.getDeliveryLatitude());
                dOrder.setDeliveryLongitude(mainOrder.getDeliveryLongitude());
            }
            
            // Sync Restaurant Coordinates
            if (dOrder.getRestaurantLatitude() == null && mainOrder.getRestaurant() != null) {
                try {
                    String rLat = mainOrder.getRestaurant().getR_lat();
                    String rLon = mainOrder.getRestaurant().getR_lon();
                    if (rLat != null && !rLat.isEmpty()) {
                        dOrder.setRestaurantLatitude(Double.parseDouble(rLat));
                    }
                    if (rLon != null && !rLon.isEmpty()) {
                        dOrder.setRestaurantLongitude(Double.parseDouble(rLon));
                    }
                } catch (Exception e) {
                    logger.error("Error syncing restaurant coordinates: " + e.getMessage());
                }
            }
        }
    }

    // 🔍 Get Available Orders
    public List<DeliveryOrder> getAvailableOrders() {
        return orderRepo.findByStatus(DeliveryStatus.ASSIGNED);
    }


    // 📋 Orders for Partner
    public List<DeliveryOrder> getOrdersByPartner(Integer partnerId) {
        List<DeliveryOrder> orders = orderRepo.findByPartnerId(partnerId);
        orders.forEach(this::syncCoordinates);
        return orders;
    }

    // 🔄 Update Delivery Status
    public DeliveryOrder updateStatus(
            Integer deliveryOrderId,
            DeliveryStatus status) {

        DeliveryOrder dOrder = orderRepo.findById(deliveryOrderId)
                .orElseThrow(() ->
                        new RuntimeException("Delivery Order not found"));

        dOrder.setStatus(status);

        // Time tracking
        if (status == DeliveryStatus.PICKED_UP) {
            dOrder.setPickedUpTime(LocalDateTime.now());
            
            // Sync to main Order
            syncToMainOrder(dOrder, "OUT_FOR_DELIVERY");
        }

        if (status == DeliveryStatus.DELIVERED) {
            dOrder.setDeliveredTime(LocalDateTime.now());

            // Add earnings to partner
            partnerService.addEarnings(
                    dOrder.getPartner().getId(),
                    dOrder.getDeliveryFee());

            // 📈 Increment Total Orders
            partnerService.incrementTotalOrders(dOrder.getPartner().getId());

            // SYNC back to main Order table
            syncToMainOrder(dOrder, "DELIVERED");
        }

        logger.info("Updated DeliveryOrder {} to {}", deliveryOrderId, status);
        return orderRepo.save(dOrder);
    }

    private void syncToMainOrder(DeliveryOrder dOrder, String mainStatus) {
        if (dOrder.getOrderId() == null) return;
        
        Optional<Order> mainOrderOpt = mainOrderRepo.findById(dOrder.getOrderId().longValue());
        if (mainOrderOpt.isPresent()) {
            Order mainOrder = mainOrderOpt.get();
            mainOrder.setStatus(mainStatus);
            mainOrderRepo.save(mainOrder);
            logger.info("Synced main order {} to {}", dOrder.getOrderId(), mainStatus);
        } else {
            logger.warn("Main order {} not found for sync", dOrder.getOrderId());
        }
    }

    // 📊 Orders by Status
    public List<DeliveryOrder> getOrdersByStatus(
            DeliveryStatus status) {

        return orderRepo.findByStatus(status);
    }

    // ❌ Cancel Order
    public DeliveryOrder cancelOrder(Integer id) {

        DeliveryOrder order = orderRepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        order.setStatus(DeliveryStatus.CANCELLED);
        return orderRepo.save(order);
    }

    public DeliveryOrder getDeliveryByOrderId(Integer orderId) {
        return orderRepo.findByOrderId(orderId).orElse(null);
    }

    // 📸 Upload Delivery Photo Proof
    public DeliveryOrder uploadDeliveryPhoto(Integer deliveryOrderId, MultipartFile file) throws IOException {
        DeliveryOrder dOrder = orderRepo.findById(deliveryOrderId)
                .orElseThrow(() -> new RuntimeException("Delivery Order not found"));

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        // Create directory if not exists
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Save Photo Entity
        DeliveryPhoto photo = new DeliveryPhoto();
        photo.setImageName(fileName);
        photo.setImageType(file.getContentType());
        photo.setImagePath(UPLOAD_DIR + fileName);
        
        dOrder.setDeliveryPhoto(photo);
        
        logger.info("Uploaded delivery proof for order {}: {}", deliveryOrderId, fileName);
        return orderRepo.save(dOrder);
    }
}
