package com.user.repo;

import com.user.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import java.util.List;

import com.user.entity.RestuarentItems;

public interface ReviewRepo extends JpaRepository<Review, Long> {
    List<Review> findByRestaurantId(@Param("restaurantId") Long restaurantId);
    List<Review> findByItemId(@Param("itemId") Long itemId);
    List<Review> findByUserId(@Param("userId") Long userId);
    boolean existsByItem(RestuarentItems item);
}
