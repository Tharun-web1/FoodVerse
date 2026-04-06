package com.user.dto;

public class AddressDto {
    private Long id;
    private String addressLine;
    private String city;
    private String state;
    private String zipCode;
    private String addressType;
    private boolean isDefault;
    private Double latitude;
    private Double longitude;

    public AddressDto() {}

    public AddressDto(Long id, String addressLine, String city, String state, String zipCode, String addressType, boolean isDefault, Double latitude, Double longitude) {
        this.id = id;
        this.addressLine = addressLine;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.addressType = addressType;
        this.isDefault = isDefault;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // Static factory method to create DTO from entity
    public static AddressDto from(com.user.entity.Address address) {
        return new AddressDto(
            address.getId(),
            address.getAddressLine(),
            address.getCity(),
            address.getState(),
            address.getZipCode(),
            address.getAddressType(),
            address.isDefault(),
            address.getLatitude(),
            address.getLongitude()
        );
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAddressLine() {
        return addressLine;
    }

    public void setAddressLine(String addressLine) {
        this.addressLine = addressLine;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public String getAddressType() {
        return addressType;
    }

    public void setAddressType(String addressType) {
        this.addressType = addressType;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean aDefault) {
        isDefault = aDefault;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}
