package com.user.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "user_reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id")
    private Restuarent restaurant;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private RestuarentItems item;

    private int rating; // 1 to 5
    
    @Column(columnDefinition = "TEXT")
    private String comment;
    
    private LocalDateTime createdAt = LocalDateTime.now();

    public Review() {}

    public Review(Long id, UserEntity user, Restuarent restaurant, RestuarentItems item, int rating, String comment, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.restaurant = restaurant;
        this.item = item;
        this.rating = rating;
        this.comment = comment;
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

    public RestuarentItems getItem() {
        return item;
    }

    public void setItem(RestuarentItems item) {
        this.item = item;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
