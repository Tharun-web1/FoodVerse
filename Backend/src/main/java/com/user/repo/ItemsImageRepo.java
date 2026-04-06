package com.user.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.user.entity.ItemsImage;
import com.user.entity.RestuarentItems;


public interface ItemsImageRepo extends JpaRepository<ItemsImage, Long> {
	
	Optional<ItemsImage> findByRi(RestuarentItems ri);

}
