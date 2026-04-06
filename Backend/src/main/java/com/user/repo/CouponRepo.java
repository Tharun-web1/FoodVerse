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
}
