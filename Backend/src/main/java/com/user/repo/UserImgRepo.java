package com.user.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.user.entity.RiderEntity;
import com.user.entity.UserImage;

public interface UserImgRepo extends JpaRepository<UserImage, Integer> {

	Optional<UserImage> findByRd(RiderEntity rd);
	
}
