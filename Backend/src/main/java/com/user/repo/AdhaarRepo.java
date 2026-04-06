package com.user.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.user.entity.AdhaarImage;
import com.user.entity.RiderEntity;

public interface AdhaarRepo extends JpaRepository<AdhaarImage, Integer> {
	Optional<AdhaarImage> findByRd(RiderEntity rd);

}
