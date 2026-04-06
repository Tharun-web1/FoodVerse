package com.user.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.user.entity.Restuarent;
import com.user.entity.RestuarentImage;

public interface RImageRepo extends JpaRepository<RestuarentImage, Integer> {

    Optional<RestuarentImage> findByRestaurant(Restuarent restaurant);
}
