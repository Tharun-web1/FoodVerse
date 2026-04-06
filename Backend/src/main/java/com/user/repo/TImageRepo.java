package com.user.repo;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.user.entity.Restuarent;
import com.user.entity.TinImage;
public interface TImageRepo extends JpaRepository<TinImage, Integer>{
	Optional<TinImage> findByRestaurant(Restuarent restaurant);
}
