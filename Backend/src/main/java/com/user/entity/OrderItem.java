package com.user.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Double price;
    @JsonBackReference 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="order_id",nullable=false)
    private Order order;
    @ManyToOne
    @JoinColumn(
        name = "item_id",
        referencedColumnName = "id",
        nullable = false
    )
    private RestuarentItems item;

    private Integer quantity;


    public OrderItem() {}

	public OrderItem(Long id, Order order, RestuarentItems item, Integer quantity ,Double price) {
		this.id = id;
		this.order = order;
		this.item = item;
		this.quantity = quantity;
		this.price=price;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Order getOrder() {
		return order;
	}

	public void setOrder(Order order) {
		this.order = order;
	}

	public RestuarentItems getItem() {
		return item;
	}

	public void setItem(RestuarentItems item) {
		this.item = item;
	}

	public Integer getQuantity() {
		return quantity;
	}

	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}

	public Double getPrice() {
		return price;
	}

	public void setPrice(Double price) {
		this.price = price;
	};
	
    
}

