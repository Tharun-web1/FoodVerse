package com.user.entity;

import com.user.enums.Role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class UserEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String username;
	private String phnno;
	private String mail;
	@Enumerated(EnumType.STRING)
	@Column(name="role")
	private Role role;
	private String password;
	private boolean active = true;
	private java.time.LocalDateTime blockedFrom;
	private java.time.LocalDateTime blockedUntil;
	private Double pendingCancellationFee = 0.0;
	private Double walletBalance = 0.0;

	public UserEntity() {
        // JPA requirement
    }
	public UserEntity(Long id, String username, String phnno, String mail, Role role, String password) {
		this.id = id;
		this.username = username;
		this.phnno = phnno;
		this.mail = mail;
		this.role = role;
		this.password = password;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getPhnno() {
		return phnno;
	}
	public void setPhnno(String phnno) {
		this.phnno = phnno;
	}
	public String getMail() {
		return mail;
	}
	public void setMail(String mail) {
		this.mail = mail;
	}
	public Role getRole() {
		return role;
	}
	public void setRole(Role string) {
		this.role = string;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	
	public boolean isActive() {
		return active;
	}
	public void setActive(boolean active) {
		this.active = active;
	}
	
	public java.time.LocalDateTime getBlockedFrom() {
		return blockedFrom;
	}
	public void setBlockedFrom(java.time.LocalDateTime blockedFrom) {
		this.blockedFrom = blockedFrom;
	}
	public java.time.LocalDateTime getBlockedUntil() {
		return blockedUntil;
	}
	public void setBlockedUntil(java.time.LocalDateTime blockedUntil) {
		this.blockedUntil = blockedUntil;
	}
	public Double getPendingCancellationFee() {
		return pendingCancellationFee;
	}
	public void setPendingCancellationFee(Double pendingCancellationFee) {
		this.pendingCancellationFee = pendingCancellationFee;
	}
	public Double getWalletBalance() {
		return walletBalance;
	}
	public void setWalletBalance(Double walletBalance) {
		this.walletBalance = walletBalance;
	}
	

}
