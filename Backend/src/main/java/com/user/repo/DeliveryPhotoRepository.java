package com.user.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.user.entity.DeliveryPhoto;

public interface DeliveryPhotoRepository extends JpaRepository<DeliveryPhoto, Integer> {
}
