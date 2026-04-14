package com.user.entity;

import com.user.enums.PartnerStatus;
import java.util.UUID;
import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "delivery_partners")
public class RiderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // 🔹 Public Rider ID (UUID)
    @Column(unique = true, nullable = false, updatable = false)
    private String riderId;

    @Column(nullable = false)
    private String name;

    private String gender;
    private Integer age;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false)
    private String phone;

    @Column(nullable = false)
    private String password;
    
    private String panNumber;
    private String aadhaarNumber;

    private String vehicleType;
    private String vehicleNumber;
    private String licenseNumber;

    private String bankName;
    private String accountNumber;
    private String ifscCode;
    private String accountHolderName;

    @Enumerated(EnumType.STRING)
    private PartnerStatus status = PartnerStatus.PENDING;

    private Boolean available = true;
    private Double totalEarnings = 0.0;
    private Double bankBalance = 0.0;
    private Double rating = 0.0;
    private Integer totalOrders = 0;

    private Double latitude;
    private Double longitude;

    private LocalDateTime blockedFrom;
    private LocalDateTime blockedUntil;

    public RiderEntity() {
    }
    
    @PrePersist
    public void generateRiderId() {
        if (this.riderId == null) {
            this.riderId = "RID-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        }
    }

	public RiderEntity(Integer id, String riderId, String name, String gender, Integer age, String email, String phone,
			String password, String panNumber, String aadhaarNumber, String vehicleType, String vehicleNumber,
			String licenseNumber, String bankName, String accountNumber, String ifscCode, String accountHolderName, PartnerStatus status, Boolean available, Double totalEarnings, Double bankBalance, Double rating, Integer totalOrders) {
		this.id = id;
		this.riderId = riderId;
		this.name = name;
		this.gender = gender;
		this.age = age;
		this.email = email;
		this.phone = phone;
		this.password = password;
		this.panNumber = panNumber;
		this.aadhaarNumber = aadhaarNumber;
		this.vehicleType = vehicleType;
		this.vehicleNumber = vehicleNumber;
		this.licenseNumber = licenseNumber;
        this.bankName = bankName;
        this.accountNumber = accountNumber;
        this.ifscCode = ifscCode;
        this.accountHolderName = accountHolderName;
		this.status = status;
		this.available = available;
		this.totalEarnings = totalEarnings;
		this.bankBalance = bankBalance;
		this.rating = rating;
		this.totalOrders = totalOrders;
	}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getRiderId() {
		return riderId;
	}

	public void setRiderId(String riderId) {
		this.riderId = riderId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getGender() {
		return gender;
	}

	public void setGender(String gender) {
		this.gender = gender;
	}

	public Integer getAge() {
		return age;
	}

	public void setAge(Integer age) {
		this.age = age;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getPanNumber() {
		return panNumber;
	}

	public void setPanNumber(String panNumber) {
		this.panNumber = panNumber;
	}

	public String getAadhaarNumber() {
		return aadhaarNumber;
	}

	public void setAadhaarNumber(String aadhaarNumber) {
		this.aadhaarNumber = aadhaarNumber;
	}

	public String getVehicleType() {
		return vehicleType;
	}

	public void setVehicleType(String vehicleType) {
		this.vehicleType = vehicleType;
	}

	public String getVehicleNumber() {
		return vehicleNumber;
	}

	public void setVehicleNumber(String vehicleNumber) {
		this.vehicleNumber = vehicleNumber;
	}

	public String getLicenseNumber() {
		return licenseNumber;
	}

	public void setLicenseNumber(String licenseNumber) {
		this.licenseNumber = licenseNumber;
	}

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getIfscCode() {
        return ifscCode;
    }

    public void setIfscCode(String ifscCode) {
        this.ifscCode = ifscCode;
    }

    public String getAccountHolderName() {
        return accountHolderName;
    }

    public void setAccountHolderName(String accountHolderName) {
        this.accountHolderName = accountHolderName;
    }

	public PartnerStatus getStatus() {
		return status;
	}

	public void setStatus(PartnerStatus status) {
		this.status = status;
	}

	public Boolean getAvailable() {
		return available;
	}

	public void setAvailable(Boolean available) {
		this.available = available;
	}

	public Double getTotalEarnings() {
		return totalEarnings;
	}

	public void setTotalEarnings(Double totalEarnings) {
		this.totalEarnings = totalEarnings;
	}

	public Double getBankBalance() {
		return bankBalance;
	}

	public void setBankBalance(Double bankBalance) {
		this.bankBalance = bankBalance;
	}

	public Double getRating() {
		return rating;
	}

	public void setRating(Double rating) {
		this.rating = rating;
	}

	public Integer getTotalOrders() {
		return totalOrders;
	}

	public void setTotalOrders(Integer totalOrders) {
		this.totalOrders = totalOrders;
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

    public LocalDateTime getBlockedFrom() {
        return blockedFrom;
    }

    public void setBlockedFrom(LocalDateTime blockedFrom) {
        this.blockedFrom = blockedFrom;
    }

    public LocalDateTime getBlockedUntil() {
        return blockedUntil;
    }

    public void setBlockedUntil(LocalDateTime blockedUntil) {
        this.blockedUntil = blockedUntil;
    }
}