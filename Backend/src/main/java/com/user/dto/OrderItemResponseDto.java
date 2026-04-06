package com.user.dto;

public class OrderItemResponseDto {
    private Long id;
    private String itemName;
    private Double price;
    private Integer quantity;
    private String imageUrl;

    public OrderItemResponseDto() {}

    public OrderItemResponseDto(Long id, String itemName, Double price, Integer quantity, String imageUrl) {
        this.id = id;
        this.itemName = itemName;
        this.price = price;
        this.quantity = quantity;
        this.imageUrl = imageUrl;
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

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
