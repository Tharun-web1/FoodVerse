package com.user.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "carts")
public class Cart {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;
    
    @Column(name = "restaurant_id")
    private Long restaurantId;
    
    @Column(columnDefinition = "TEXT")
    private String cartData; // JSON string of cart items
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public Cart() {}
    
    public Cart(UserEntity user, Long restaurantId, String cartData, LocalDateTime updatedAt) {
        this.user = user;
        this.restaurantId = restaurantId;
        this.cartData = cartData;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public Long getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(Long restaurantId) {
        this.restaurantId = restaurantId;
    }

    public String getCartData() {
        return cartData;
    }

    public void setCartData(String cartData) {
        this.cartData = cartData;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
