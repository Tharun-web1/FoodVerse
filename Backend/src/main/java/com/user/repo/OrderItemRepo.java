package com.user.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.user.entity.OrderItem;

import com.user.entity.RestuarentItems;

public interface OrderItemRepo extends JpaRepository<OrderItem, Long>{
    boolean existsByItem(RestuarentItems item);
}
