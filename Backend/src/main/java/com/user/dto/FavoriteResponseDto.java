package com.user.dto;

public class FavoriteResponseDto {
    private Long id;
    private Long restaurantId;

    public FavoriteResponseDto() {}

    public FavoriteResponseDto(Long id, Long restaurantId) {
        this.id = id;
        this.restaurantId = restaurantId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRestaurantId() { return restaurantId; }
    public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }
}
