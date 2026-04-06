package com.user.entity;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @JsonBackReference
    @ManyToOne
    private UserEntity user;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    @JsonBackReference
    @ManyToOne
    private Restuarent restaurant;
 
    private String deliveryAddress;
 
    private Double totalAmount;
    private Double deliveryFee;
    private Double taxAmount;
    private String status;
 
    private String transactionId;
    private String paymentMethod;
    private Boolean paid;
 
    // Razorpay specific fields
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
 
    private Double deliveryLatitude;
    private Double deliveryLongitude;
    private String couponCode;
    private Double discountAmount = 0.0;

    private LocalDateTime createdAt = LocalDateTime.now();
    private Integer estimatedPrepTime;
    @JsonManagedReference
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;
    public Order() {}
	public Order(Long id, UserEntity user, String customerName, String customerPhone, Restuarent restaurant,
			String deliveryAddress, Double totalAmount, Double deliveryFee, Double taxAmount, String status, String transactionId, String paymentMethod,
			Boolean paid, LocalDateTime createdAt, List<OrderItem> items) {
		this.id = id;
		this.user = user;
		this.customerName = customerName;
		this.customerPhone = customerPhone;
		this.restaurant = restaurant;
		this.deliveryAddress = deliveryAddress;
		this.totalAmount = totalAmount;
		this.deliveryFee = deliveryFee;
		this.taxAmount = taxAmount;
		this.status = status;
		this.transactionId = transactionId;
		this.paymentMethod = paymentMethod;
		this.paid = paid;
		this.createdAt = createdAt;
		this.items = items;
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
	public String getCustomerName() {
		return customerName;
	}
	public void setCustomerName(String customerName) {
		this.customerName = customerName;
	}
	public String getCustomerPhone() {
		return customerPhone;
	}
	public void setCustomerPhone(String customerPhone) {
		this.customerPhone = customerPhone;
	}
	public Restuarent getRestaurant() {
		return restaurant;
	}
	public void setRestaurant(Restuarent restaurant) {
		this.restaurant = restaurant;
	}
	public String getDeliveryAddress() {
		return deliveryAddress;
	}
	public void setDeliveryAddress(String deliveryAddress) {
		this.deliveryAddress = deliveryAddress;
	}
	public Double getTotalAmount() {
		return totalAmount;
	}
	public void setTotalAmount(Double totalAmount) {
		this.totalAmount = totalAmount;
	}
	public Double getDeliveryFee() {
		return deliveryFee;
	}
	public void setDeliveryFee(Double deliveryFee) {
		this.deliveryFee = deliveryFee;
	}
	public Double getTaxAmount() {
		return taxAmount;
	}
	public void setTaxAmount(Double taxAmount) {
		this.taxAmount = taxAmount;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public String getTransactionId() {
		return transactionId;
	}
	public void setTransactionId(String transactionId) {
		this.transactionId = transactionId;
	}
	public String getPaymentMethod() {
		return paymentMethod;
	}
	public void setPaymentMethod(String paymentMethod) {
		this.paymentMethod = paymentMethod;
	}
	public Boolean getPaid() {
		return paid;
	}
	public void setPaid(Boolean paid) {
		this.paid = paid;
	}
	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
	public String getCustomerEmail() {
		return customerEmail;
	}
	public void setCustomerEmail(String customerEmail) {
		this.customerEmail = customerEmail;
	}
	public String getRazorpayOrderId() {
		return razorpayOrderId;
	}
	public void setRazorpayOrderId(String razorpayOrderId) {
		this.razorpayOrderId = razorpayOrderId;
	}
	public String getRazorpayPaymentId() {
		return razorpayPaymentId;
	}
	public void setRazorpayPaymentId(String razorpayPaymentId) {
		this.razorpayPaymentId = razorpayPaymentId;
	}
	public String getRazorpaySignature() {
		return razorpaySignature;
	}
	public void setRazorpaySignature(String razorpaySignature) {
		this.razorpaySignature = razorpaySignature;
	}
	public List<OrderItem> getItems() {
		return items;
	}
	public void setItems(List<OrderItem> items) {
		this.items = items;
	}
	public Double getDeliveryLatitude() {
		return deliveryLatitude;
	}
	public void setDeliveryLatitude(Double deliveryLatitude) {
		this.deliveryLatitude = deliveryLatitude;
	}
    public Double getDeliveryLongitude() {
        return deliveryLongitude;
    }
    public void setDeliveryLongitude(Double deliveryLongitude) {
        this.deliveryLongitude = deliveryLongitude;
    }
    public String getCouponCode() {
        return couponCode;
    }
    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }
    public Double getDiscountAmount() {
        return discountAmount;
    }
    public void setDiscountAmount(Double discountAmount) {
        this.discountAmount = discountAmount;
    }
    public Integer getEstimatedPrepTime() {
        return estimatedPrepTime;
    }
    public void setEstimatedPrepTime(Integer estimatedPrepTime) {
        this.estimatedPrepTime = estimatedPrepTime;
    }
    
}

