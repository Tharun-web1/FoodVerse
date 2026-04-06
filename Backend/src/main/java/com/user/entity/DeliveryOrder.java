package com.user.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.user.enums.DeliveryStatus;

@Entity
@Table(name = "delivery_orders")
public class DeliveryOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private Integer orderId;

    private String restaurantName;
    private String pickupAddress;
    private String pickupContact;

    private String customerName;
    private String deliveryAddress;
    private String customerPhone;

    @ManyToOne
    @JoinColumn(name = "partner_id")
    private RiderEntity partner;

    private Double orderAmount;
    private Double deliveryFee;

    // Delivery Status
    @Enumerated(EnumType.STRING)
    private DeliveryStatus status = DeliveryStatus.ASSIGNED;

    // Time Tracking
    private LocalDateTime assignedTime;
    private LocalDateTime pickedUpTime;
    private LocalDateTime deliveredTime;
    
    @OneToOne(cascade = jakarta.persistence.CascadeType.ALL)
    @jakarta.persistence.JoinColumn(name = "delivery_photo_id")
    private DeliveryPhoto deliveryPhoto;

    // Distance (optional for analytics)
    private Double distanceKm;

    private Double deliveryLatitude;
    private Double deliveryLongitude;
    private Double restaurantLatitude;
    private Double restaurantLongitude;

    public DeliveryOrder() {
    }

    public DeliveryOrder(Integer id, Integer orderId,
                         String restaurantName,
                         String pickupAddress,
                         String pickupContact,
                         String customerName,
                         String deliveryAddress,
                         String customerPhone,
                         RiderEntity partner,
                         Double orderAmount,
                         Double deliveryFee,
                         DeliveryStatus status,
                         LocalDateTime assignedTime,
                         LocalDateTime pickedUpTime,
                         LocalDateTime deliveredTime,
                         Double distanceKm) {
        this.id = id;
        this.orderId = orderId;
        this.restaurantName = restaurantName;
        this.pickupAddress = pickupAddress;
        this.pickupContact = pickupContact;
        this.customerName = customerName;
        this.deliveryAddress = deliveryAddress;
        this.customerPhone = customerPhone;
        this.partner = partner;
        this.orderAmount = orderAmount;
        this.deliveryFee = deliveryFee;
        this.status = status;
        this.assignedTime = assignedTime;
        this.pickedUpTime = pickedUpTime;
        this.deliveredTime = deliveredTime;
        this.distanceKm = distanceKm;
    }


    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getOrderId() {
        return orderId;
    }

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }

    public String getRestaurantName() {
        return restaurantName;
    }

    public void setRestaurantName(String restaurantName) {
        this.restaurantName = restaurantName;
    }

    public String getPickupAddress() {
        return pickupAddress;
    }

    public void setPickupAddress(String pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public String getPickupContact() {
        return pickupContact;
    }

    public void setPickupContact(String pickupContact) {
        this.pickupContact = pickupContact;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public RiderEntity getPartner() {
        return partner;
    }

    public void setPartner(RiderEntity partner) {
        this.partner = partner;
    }

    public Double getOrderAmount() {
        return orderAmount;
    }

    public void setOrderAmount(Double orderAmount) {
        this.orderAmount = orderAmount;
    }

    public Double getDeliveryFee() {
        return deliveryFee;
    }

    public void setDeliveryFee(Double deliveryFee) {
        this.deliveryFee = deliveryFee;
    }

    public DeliveryStatus getStatus() {
        return status;
    }

    public void setStatus(DeliveryStatus status) {
        this.status = status;
    }

    public LocalDateTime getAssignedTime() {
        return assignedTime;
    }

    public void setAssignedTime(LocalDateTime assignedTime) {
        this.assignedTime = assignedTime;
    }

    public LocalDateTime getPickedUpTime() {
        return pickedUpTime;
    }

    public void setPickedUpTime(LocalDateTime pickedUpTime) {
        this.pickedUpTime = pickedUpTime;
    }

    public LocalDateTime getDeliveredTime() {
        return deliveredTime;
    }

    public void setDeliveredTime(LocalDateTime deliveredTime) {
        this.deliveredTime = deliveredTime;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
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

    public DeliveryPhoto getDeliveryPhoto() {
        return deliveryPhoto;
    }

    public void setDeliveryPhoto(DeliveryPhoto deliveryPhoto) {
        this.deliveryPhoto = deliveryPhoto;
        if (deliveryPhoto != null) {
            deliveryPhoto.setDeliveryOrder(this);
        }
    }
}
