package com.user.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.user.entity.PanImage;
import com.user.entity.RiderEntity;

public interface PanRepo extends JpaRepository<PanImage, Integer> {
	Optional<PanImage> findByRd(RiderEntity rd);

}
