package com.user.dto;

public class ItemCategoryResponseDTO {

    private Long id;
    private String itemName;
    private String description;
    private double price;
    private boolean available;
    private String category;
    private String type;
    private String serves;
    private Long restaurantId;
    private String restaurantName;
    private Double rating;

    public ItemCategoryResponseDTO() {}



	public ItemCategoryResponseDTO(Long id, String itemName, String description, double price, boolean available,
			String category, String type, String serves, Long restaurantId, String restaurantName, Double rating) {
		this.id = id;
		this.itemName = itemName;
		this.description = description;
		this.price = price;
		this.available = available;
		this.category = category;
		this.type = type;
		this.serves = serves;
		this.restaurantId = restaurantId;
		this.restaurantName = restaurantName;
		this.rating = rating;
	}



	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getItemName() {
		return itemName;
	}

	public void setItemName(String itemName) {
		this.itemName = itemName;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public double getPrice() {
		return price;
	}

	public void setPrice(double price) {
		this.price = price;
	}

	public boolean isAvailable() {
		return available;
	}

	public void setAvailable(boolean available) {
		this.available = available;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getServes() {
		return serves;
	}

	public void setServes(String serves) {
		this.serves = serves;
	}

	public Long getRestaurantId() {
		return restaurantId;
	}

	public void setRestaurantId(Long restaurantId) {
		this.restaurantId = restaurantId;
	}

	public String getRestaurantName() {
		return restaurantName;
	}

	public void setRestaurantName(String restaurantName) {
		this.restaurantName = restaurantName;
	}

	public Double getRating() {
		return rating;
	}

	public void setRating(Double rating) {
		this.rating = rating;
	}

   
}

