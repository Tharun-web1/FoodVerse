package com.user.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "withdrawal_requests")
public class WithdrawalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "rider_id", nullable = false)
    private RiderEntity rider;

    @Column(nullable = false)
    private Double amount;

    private String bankName;
    private String accountNumber;
    private String ifscCode;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    private LocalDateTime requestTime = LocalDateTime.now();

    public WithdrawalRequest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public RiderEntity getRider() { return rider; }
    public void setRider(RiderEntity rider) { this.rider = rider; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getIfscCode() { return ifscCode; }
    public void setIfscCode(String ifscCode) { this.ifscCode = ifscCode; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getRequestTime() { return requestTime; }
    public void setRequestTime(LocalDateTime requestTime) { this.requestTime = requestTime; }
}
