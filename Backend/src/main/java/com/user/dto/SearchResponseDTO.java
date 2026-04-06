package com.user.dto;

import java.util.List;
import com.user.entity.Restuarent;

public class SearchResponseDTO {
    private List<Restuarent> restaurants;
    private List<ItemCategoryResponseDTO> dishes;

    public SearchResponseDTO() {}

    public SearchResponseDTO(List<Restuarent> restaurants, List<ItemCategoryResponseDTO> dishes) {
        this.restaurants = restaurants;
        this.dishes = dishes;
    }

    public List<Restuarent> getRestaurants() {
        return restaurants;
    }

    public void setRestaurants(List<Restuarent> restaurants) {
        this.restaurants = restaurants;
    }

    public List<ItemCategoryResponseDTO> getDishes() {
        return dishes;
    }

    public void setDishes(List<ItemCategoryResponseDTO> dishes) {
        this.dishes = dishes;
    }
}
