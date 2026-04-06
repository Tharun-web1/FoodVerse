package com.user.repo;

import com.user.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AddressRepo extends JpaRepository<Address, Long> {
    List<Address> findByUserId(@Param("userId") Long userId);
}
