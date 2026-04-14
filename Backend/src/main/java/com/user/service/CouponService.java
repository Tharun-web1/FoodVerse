package com.user.service;

import com.user.entity.Coupon;
import com.user.repo.CouponRepo;
import com.user.repo.OrderRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

@Service
public class CouponService {

    @Autowired
    private CouponRepo couponRepo;

    @Autowired
    private OrderRepo orderRepo;

    public Optional<Coupon> validateCoupon(String code, double orderTotal, Long userId, Long restaurantId) {
        Optional<Coupon> couponOpt = couponRepo.findByCodeAndActiveTrue(code);
        
        Coupon coupon;
        if (couponOpt.isEmpty()) {
            // Handle virtual/default coupons if not in DB
            if ("WELCOME40".equals(code)) {
                coupon = new Coupon();
                coupon.setCode("WELCOME40");
                coupon.setDiscountType("FIXED");
                coupon.setDiscountValue(40.0);
                coupon.setMinOrderAmount(199.0);
                coupon.setActive(true);
            } else if ("NEW30".equals(code)) {
                coupon = new Coupon();
                coupon.setCode("NEW30");
                coupon.setDiscountType("FIXED");
                coupon.setDiscountValue(30.0);
                coupon.setMinOrderAmount(149.0);
                coupon.setActive(true);
            } else {
                return Optional.empty();
            }
        } else {
            coupon = couponOpt.get();
        }
        
        // Check if active
        if (!coupon.getActive()) return Optional.empty();
        
        // Ownership Check: Coupon must be global (null) or match the provided restaurantId
        if (coupon.getRestuarent() != null && (restaurantId == null || !coupon.getRestuarent().getId().equals(restaurantId))) {
            return Optional.empty();
        }

        // Check expiry
        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            return Optional.empty();
        }
        
        // Check minimum order amount
        if (coupon.getMinOrderAmount() != null && orderTotal < coupon.getMinOrderAmount()) {
            return Optional.empty();
        }

        // First Order Logic
        if ("WELCOME40".equals(code) || "NEW30".equals(code)) {
            if (userId == null || orderRepo.countByUserId(userId) > 0) {
                return Optional.empty();
            }
        }
        
        return Optional.of(coupon);
    }

    public List<Map<String, Object>> getAvailableCoupons(Long userId, double orderTotal, Long restaurantId) {
        List<Map<String, Object>> available = new ArrayList<>();
        boolean showAll = (orderTotal <= 0);
        
        // First Order Logic
        if (userId != null && orderRepo.countByUserId(userId) == 0) {
            if (showAll || orderTotal >= 199.0) {
                Map<String, Object> c = new HashMap<>();
                c.put("code", "WELCOME40");
                c.put("discountAmount", 40.0);
                c.put("description", "First Order special ₹40 off on ₹199+");
                available.add(c);
            }
            if (showAll || orderTotal >= 149.0) {
                Map<String, Object> c = new HashMap<>();
                c.put("code", "NEW30");
                c.put("discountAmount", 30.0);
                c.put("description", "First Order special ₹30 off on ₹149+");
                available.add(c);
            }
        }
        
        // DB Coupons
        deleteExpiredCoupons(); // Lazy Cleanup
        List<Coupon> dbCoupons = couponRepo.findAvailableCoupons(restaurantId, LocalDateTime.now());
        for (Coupon c : dbCoupons) {
            if (Boolean.TRUE.equals(c.getActive())) {
                if (c.getExpiryDate() != null && c.getExpiryDate().isBefore(LocalDateTime.now())) continue;
                if (!showAll && c.getMinOrderAmount() != null && orderTotal < c.getMinOrderAmount()) continue;
                
                Map<String, Object> map = new HashMap<>();
                map.put("code", c.getCode());
                map.put("discountAmount", showAll ? ( "FIXED".equals(c.getDiscountType()) ? c.getDiscountValue() : 0.0 ) : calculateDiscount(c, orderTotal));
                map.put("description", c.getDiscountType() + " " + ( "PERCENTAGE".equals(c.getDiscountType()) ? (c.getDiscountValue() + "%") : ("₹" + c.getDiscountValue()) ) + (c.getMinOrderAmount() != null ? " on ₹" + c.getMinOrderAmount() + "+" : ""));
                available.add(map);
            }
        }
        
        return available;
    }

    public double calculateDiscount(Coupon coupon, double orderTotal) {
        if ("PERCENTAGE".equals(coupon.getDiscountType())) {
            return (orderTotal * coupon.getDiscountValue()) / 100.0;
        } else {
            return Math.min(orderTotal, coupon.getDiscountValue());
        }
    }

    /**
     * Automatically delete expired coupons from the database.
     * Runs every minute for faster responsiveness.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void deleteExpiredCoupons() {
        LocalDateTime now = LocalDateTime.now();
        couponRepo.deleteByExpiryDateBefore(now);
    }
}
