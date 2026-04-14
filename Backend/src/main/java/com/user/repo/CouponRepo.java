package com.user.repo;

import com.user.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Optional;

public interface CouponRepo extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCode(String code);

    @Modifying
    @Transactional
    @Query("DELETE FROM Coupon c WHERE c.expiryDate < :expiryDate")
    void deleteByExpiryDateBefore(LocalDateTime expiryDate);

    java.util.List<Coupon> findByRestuarentId(Long restuarentId);

    Optional<Coupon> findByCodeAndRestuarentId(String code, Long restuarentId);

    @Query("SELECT c FROM Coupon c WHERE (c.restuarent.id = :restaurantId OR c.restuarent IS NULL) AND c.active = true AND (c.expiryDate IS NULL OR c.expiryDate > :now)")
    java.util.List<Coupon> findAvailableCoupons(Long restaurantId, java.time.LocalDateTime now);

    Optional<Coupon> findByCodeAndActiveTrue(String code);
}
