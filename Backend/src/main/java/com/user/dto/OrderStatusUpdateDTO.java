package com.user.dto;

import com.user.enums.DeliveryStatus;

public class OrderStatusUpdateDTO {

    private Integer orderId;
    private DeliveryStatus status;

    // Constructors
    public OrderStatusUpdateDTO() {
    }

    public OrderStatusUpdateDTO(Integer orderId,
                                DeliveryStatus status) {
        this.orderId = orderId;
        this.status = status;
    }

    // Getters & Setters
    public Integer getOrderId() {
        return orderId;
    }

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }

    public DeliveryStatus getStatus() {
        return status;
    }

    public void setStatus(DeliveryStatus status) {
        this.status = status;
    }
}
