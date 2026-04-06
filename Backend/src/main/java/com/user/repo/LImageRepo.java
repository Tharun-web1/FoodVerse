package com.user.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.user.entity.LogoImage;

public interface LImageRepo extends JpaRepository<LogoImage, Integer> {

    java.util.Optional<com.user.entity.LogoImage> findByRestaurant(com.user.entity.Restuarent restaurant);
}
