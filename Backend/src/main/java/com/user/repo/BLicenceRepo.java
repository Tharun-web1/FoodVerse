package com.user.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.user.entity.BikeLicenceImage;
import com.user.entity.RiderEntity;

public interface BLicenceRepo extends JpaRepository<BikeLicenceImage, Integer> {
	
	Optional<BikeLicenceImage> findByRd(RiderEntity rd);

}
