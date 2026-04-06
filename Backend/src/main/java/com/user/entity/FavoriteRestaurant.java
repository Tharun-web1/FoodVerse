package com.user.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "user_favorites")
public class FavoriteRestaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restuarent restaurant;

    private LocalDateTime createdAt = LocalDateTime.now();

    public FavoriteRestaurant() {}

    public FavoriteRestaurant(Long id, UserEntity user, Restuarent restaurant, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.restaurant = restaurant;
        this.createdAt = createdAt;
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

    public Restuarent getRestaurant() {
        return restaurant;
    }

    public void setRestaurant(Restuarent restaurant) {
        this.restaurant = restaurant;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
