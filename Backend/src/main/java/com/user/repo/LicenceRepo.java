package com.user.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.user.entity.LicenceImage;

public interface LicenceRepo extends JpaRepository<LicenceImage, Integer> {

    java.util.Optional<com.user.entity.LicenceImage> findByRestaurant(com.user.entity.Restuarent restaurant);
}
