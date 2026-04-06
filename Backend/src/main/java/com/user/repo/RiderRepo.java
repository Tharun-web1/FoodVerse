package com.user.repo;

import java.util.Optional;
import org.springframework.data.repository.query.Param;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.user.entity.RiderEntity;
import com.user.enums.PartnerStatus;

@Repository
public interface RiderRepo extends JpaRepository<RiderEntity, Integer> {

    // Login
    Optional<RiderEntity> findByEmail(@Param("email") String email);

    Optional<RiderEntity> findByName(@Param("name") String name);

    // Check phone duplicate
    Optional<RiderEntity> findByPhone(@Param("phone") String phone);

    // Get all ACTIVE partners
    java.util.List<RiderEntity> findByStatus(PartnerStatus status);

    // Available partners (Online)
    java.util.List<RiderEntity> findByAvailableTrue();

    long countByStatus(PartnerStatus status);

}
