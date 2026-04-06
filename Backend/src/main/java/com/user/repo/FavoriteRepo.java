package com.user.repo;

import com.user.entity.FavoriteRestaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface FavoriteRepo extends JpaRepository<FavoriteRestaurant, Long> {
    List<FavoriteRestaurant> findByUser_Id(Long userId);
    Optional<FavoriteRestaurant> findByUser_IdAndRestaurant_Id(Long userId, Long restaurantId);
    boolean existsByUser_IdAndRestaurant_Id(Long userId, Long restaurantId);
}
