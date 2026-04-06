package com.user.dto;

import java.time.LocalDateTime;
import java.util.List;

public class OrderResponseDto {
    private Long id;
    private Long restaurantId;
    private String restaurantName;
    private Double totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private String transaction_id;
    private String deliveryAddress;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String paymentMethod;
    private String razorpayOrderId;
    private Double deliveryFee;
    private Double taxAmount;
    private String deliveryPartnerName;
    private String deliveryPartnerPhone;
    private List<OrderItemResponseDto> items;
    
    private Double deliveryLatitude;
    private Double deliveryLongitude;
    private Double restaurantLatitude;
    private Double restaurantLongitude;
    
    private String couponCode;
    private Double discountAmount;
    private Integer estimatedPrepTime;

    public OrderResponseDto() {}

    public OrderResponseDto(Long id, Long restaurantId, String restaurantName, Double totalAmount, Double deliveryFee, Double taxAmount, String status, LocalDateTime createdAt, String transaction_id, String deliveryAddress, List<OrderItemResponseDto> items) {
        this.id = id;
        this.restaurantId = restaurantId;
        this.restaurantName = restaurantName;
        this.totalAmount = totalAmount;
        this.deliveryFee = deliveryFee;
        this.taxAmount = taxAmount;
        this.status = status;
        this.createdAt = createdAt;
        this.transaction_id = transaction_id;
        this.deliveryAddress = deliveryAddress;
        this.items = items;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRestaurantName() {
        return restaurantName;
    }

    public void setRestaurantName(String restaurantName) {
        this.restaurantName = restaurantName;
    }

    public Long getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(Long restaurantId) {
        this.restaurantId = restaurantId;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
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

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
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

    public String getTransaction_id() {
        return transaction_id;
    }

    public void setTransaction_id(String transaction_id) {
        this.transaction_id = transaction_id;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public List<OrderItemResponseDto> getItems() {
        return items;
    }

    public void setItems(List<OrderItemResponseDto> items) {
        this.items = items;
    }

    public String getDeliveryPartnerName() {
        return deliveryPartnerName;
    }

    public void setDeliveryPartnerName(String deliveryPartnerName) {
        this.deliveryPartnerName = deliveryPartnerName;
    }

    public String getDeliveryPartnerPhone() {
        return deliveryPartnerPhone;
    }

    public void setDeliveryPartnerPhone(String deliveryPartnerPhone) {
        this.deliveryPartnerPhone = deliveryPartnerPhone;
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

    public Double getRestaurantLatitude() {
        return restaurantLatitude;
    }

    public void setRestaurantLatitude(Double restaurantLatitude) {
        this.restaurantLatitude = restaurantLatitude;
    }

    public Double getRestaurantLongitude() {
        return restaurantLongitude;
    }

    public void setRestaurantLongitude(Double restaurantLongitude) {
        this.restaurantLongitude = restaurantLongitude;
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
