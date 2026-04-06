package com.user.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.user.entity.Cart;
import com.user.entity.UserEntity;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(UserEntity user);
    void deleteByUser(UserEntity user);
}
