package com.user.repo;

import com.user.entity.WithdrawalRequest;
import com.user.entity.RiderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WithdrawalRepo extends JpaRepository<WithdrawalRequest, Long> {
    List<WithdrawalRequest> findByRiderOrderByRequestTimeDesc(RiderEntity rider);
}
