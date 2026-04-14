package com.user.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.user.dto.OrderRequestDto;
import com.user.dto.OrderResponseDto;
import com.user.service.OrderService;
import com.user.service.CouponService;

@RestController
@RequestMapping("/orders")
@CrossOrigin("*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private CouponService couponService;

    @Autowired
    private com.user.repo.UserRepo userRepo;


    @PostMapping("/place")
    public OrderResponseDto placeOrder(@RequestBody OrderRequestDto request) {
    	String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return orderService.placeOrder(username, request);
    }
    @GetMapping("/my-orders")
    public List<OrderResponseDto> myOrders() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return orderService.fetchOrdersByUser(username);
    }

    @GetMapping("/restaurant/{restaurantId}")
    public List<OrderResponseDto> getOrdersByRestaurant(@PathVariable("restaurantId") Long restaurantId) {
        return orderService.fetchOrdersByRestaurant(restaurantId);
    }

    @PutMapping("/{orderId}/status")
    public void updateOrderStatus(@PathVariable("orderId") Long orderId, 
                                @org.springframework.web.bind.annotation.RequestParam String status,
                                @org.springframework.web.bind.annotation.RequestParam(required = false) Integer prepTime) {
        orderService.updateOrderStatus(orderId, status, prepTime);
    }
 
    @PostMapping("/verify")
    public OrderResponseDto verifyPayment(@RequestBody java.util.Map<String, String> paymentDetails) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return orderService.verifyPayment(username, paymentDetails);
    }

    @PutMapping("/{orderId}/cancel")
    public OrderResponseDto cancelOrder(@PathVariable("orderId") Long orderId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return orderService.cancelOrder(orderId, username);
    }

    @PostMapping("/validate-coupon")
    public org.springframework.http.ResponseEntity<?> validateCoupon(
            @org.springframework.web.bind.annotation.RequestParam String code, 
            @org.springframework.web.bind.annotation.RequestParam double total,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long restaurantId) {
        
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        com.user.entity.UserEntity user = userRepo.findByUsername(username);
        Long userId = (user != null) ? user.getId() : null;

        return couponService.validateCoupon(code, total, userId, restaurantId)
                .map(coupon -> {
                    double discount = couponService.calculateDiscount(coupon, total);
                    return org.springframework.http.ResponseEntity.ok(java.util.Map.of(
                        "code", coupon.getCode(),
                        "discountAmount", discount,
                        "discountType", coupon.getDiscountType(),
                        "discountValue", coupon.getDiscountValue()
                    ));
                })
                .orElse(org.springframework.http.ResponseEntity.badRequest().body(java.util.Map.of("message", "Invalid or expired coupon")));
    }

    @GetMapping("/available-coupons")
    public List<java.util.Map<String, Object>> getAvailableCoupons(
            @org.springframework.web.bind.annotation.RequestParam double total,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long restaurantId) {
        
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        com.user.entity.UserEntity user = userRepo.findByUsername(username);
        Long userId = (user != null) ? user.getId() : null;
        return couponService.getAvailableCoupons(userId, total, restaurantId);
    }
    @GetMapping("/is-first-order")
    public boolean checkIsFirstOrder() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return orderService.isFirstOrder(username);
    }
}
