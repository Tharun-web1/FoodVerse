package com.user.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.user.entity.OtpEntity;
import java.util.Optional;

@Repository
public interface OtpRepo extends JpaRepository<OtpEntity, Long> {
    Optional<OtpEntity> findByIdentifier(String identifier);
    void deleteByIdentifier(String identifier);
}
