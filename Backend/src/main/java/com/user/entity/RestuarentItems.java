package com.user.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name="restuarent_items")
public class RestuarentItems {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

    private String itemName;
    private String description;
    private double price;
    private boolean available = true;
    private String category;
    private String type;
    private String serves;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restuarent_id", nullable = false)
    @JsonBackReference
    private Restuarent restuarent;
    public RestuarentItems() {
    	
    }
	public RestuarentItems(Long id, String itemName, String description, double price, boolean available,
			String category, String type, String serves, Restuarent restaurant) {
		this.id = id;
		this.itemName = itemName;
		this.description = description;
		this.price = price;
		this.available = available;
		this.category = category;
		this.type = type;
		this.serves = serves;
		this.restuarent = restaurant;
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
	public Restuarent getRestuarent() {
		return restuarent;
	}
	public void setRestuarent(Restuarent restaurant) {
		this.restuarent = restaurant;
	}
}
