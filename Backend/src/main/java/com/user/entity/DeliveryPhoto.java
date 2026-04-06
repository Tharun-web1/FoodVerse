package com.user.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class DeliveryPhoto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    private String imageName;
    private String imageType;
    private String imagePath;
    
    @JsonIgnore
    @OneToOne(mappedBy = "deliveryPhoto")
    private DeliveryOrder deliveryOrder;

    public DeliveryPhoto() {}

    public DeliveryPhoto(String imageName, String imageType, String imagePath) {
        this.imageName = imageName;
        this.imageType = imageType;
        this.imagePath = imagePath;
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getImageName() { return imageName; }
    public void setImageName(String imageName) { this.imageName = imageName; }
    public String getImageType() { return imageType; }
    public void setImageType(String imageType) { this.imageType = imageType; }
    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }
    public DeliveryOrder getDeliveryOrder() { return deliveryOrder; }
    public void setDeliveryOrder(DeliveryOrder deliveryOrder) { this.deliveryOrder = deliveryOrder; }
}
