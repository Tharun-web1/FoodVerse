package com.user.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "otps")
public class OtpEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String identifier; // Email or Phone

    @Column(nullable = false)
    private String otp;

    @Column(nullable = false)
    private LocalDateTime expiry;

    public OtpEntity() {}

    public OtpEntity(String identifier, String otp, LocalDateTime expiry) {
        this.identifier = identifier;
        this.otp = otp;
        this.expiry = expiry;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public LocalDateTime getExpiry() { return expiry; }
    public void setExpiry(LocalDateTime expiry) { this.expiry = expiry; }
}
