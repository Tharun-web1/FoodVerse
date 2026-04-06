package com.user.entity;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.user.enums.Role;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class Restuarent {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String username;
	private String phnno;
	private String mail;
	@Enumerated(EnumType.STRING)
	@Column(name = "role")
	private Role role;
	private String password;
	private boolean active = false;
	private String status = "PENDING";
	private String name;
	private String location;
	private String r_min;
	private String r_max;
	private String r_cuisine;
	private String r_zone;
	private String r_lat;
	private String r_lon;
	private String r_fName;
	private String r_lName;
	private String r_tin;
	private String r_exp;
	private String r_llNo;
	private String r_llExp;
	private Integer review;
	private Double rating;
	private String discription;
	private String share;
	private String whishlist;
	@Column(name = "opening_time")
    private LocalTime openingTime;
	@Column(name = "closing_time")
    private LocalTime closingTime;

	@Column(name = "suspension_expiry")
	private LocalDateTime suspensionExpiry;

	@OneToMany(mappedBy = "restuarent", cascade = CascadeType.ALL)
	@JsonManagedReference
    private List<RestuarentItems> items = new ArrayList<>();
	public Restuarent() {}
	public Restuarent(Long id, String username, String phnno, String mail, Role role, String password, String name,
			String location, String r_min, String r_max, String r_cuisine, String r_zone, String r_lat,
			String r_lon, String r_fName, String r_lName, String r_tin, String r_exp, String r_llNo, String r_llExp,
			Integer review, Double rating, String discription, String share, String whishlist, LocalTime openingTime,
			LocalTime closingTime, List<RestuarentItems> items) {
		this.id = id;
		this.username = username;
		this.phnno = phnno;
		this.mail = mail;
		this.role = role;
		this.password = password;
		this.name = name;
		this.location = location;
		this.r_min = r_min;
		this.r_max = r_max;
		
		this.r_cuisine = r_cuisine;
		this.r_zone = r_zone;
		this.r_lat = r_lat;
		this.r_lon = r_lon;
		this.r_fName = r_fName;
		this.r_lName = r_lName;
		this.r_tin = r_tin;
		this.r_exp = r_exp;
		this.r_llNo = r_llNo;
		this.r_llExp = r_llExp;
		this.review = review;
		this.rating = rating;
		this.discription = discription;
		this.share = share;
		this.whishlist = whishlist;
		this.openingTime = openingTime;
		this.closingTime = closingTime;
		this.items = items;
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
	public void setRole(Role role) {
		this.role = role;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getLocation() {
		return location;
	}
	public void setLocation(String location) {
		this.location = location;
	}
	public String getR_min() {
		return r_min;
	}
	public void setR_min(String r_min) {
		this.r_min = r_min;
	}
	public String getR_max() {
		return r_max;
	}
	public void setR_max(String r_max) {
		this.r_max = r_max;
	}
	
	public String getR_cuisine() {
		return r_cuisine;
	}
	public void setR_cuisine(String r_cuisine) {
		this.r_cuisine = r_cuisine;
	}
	public String getR_zone() {
		return r_zone;
	}
	public void setR_zone(String r_zone) {
		this.r_zone = r_zone;
	}
	public String getR_lat() {
		return r_lat;
	}
	public void setR_lat(String r_lat) {
		this.r_lat = r_lat;
	}
	public String getR_lon() {
		return r_lon;
	}
	public void setR_lon(String r_lon) {
		this.r_lon = r_lon;
	}
	public String getR_fName() {
		return r_fName;
	}
	public void setR_fName(String r_fName) {
		this.r_fName = r_fName;
	}
	public String getR_lName() {
		return r_lName;
	}
	public void setR_lName(String r_lName) {
		this.r_lName = r_lName;
	}
	public String getR_tin() {
		return r_tin;
	}
	public void setR_tin(String r_tin) {
		this.r_tin = r_tin;
	}
	public String getR_exp() {
		return r_exp;
	}
	public void setR_exp(String r_exp) {
		this.r_exp = r_exp;
	}
	public String getR_llNo() {
		return r_llNo;
	}
	public void setR_llNo(String r_llNo) {
		this.r_llNo = r_llNo;
	}
	public String getR_llExp() {
		return r_llExp;
	}
	public void setR_llExp(String r_llExp) {
		this.r_llExp = r_llExp;
	}
	public Integer getReview() {
		return review;
	}
	public void setReview(Integer review) {
		this.review = review;
	}
	public Double getRating() {
		return rating;
	}
	public void setRating(Double rating) {
		this.rating = rating;
	}
	public String getDiscription() {
		return discription;
	}
	public void setDiscription(String discription) {
		this.discription = discription;
	}
	public String getShare() {
		return share;
	}
	public void setShare(String share) {
		this.share = share;
	}
	public String getWhishlist() {
		return whishlist;
	}
	public void setWhishlist(String whishlist) {
		this.whishlist = whishlist;
	}
	public LocalTime getOpeningTime() {
		return openingTime;
	}
	public void setOpeningTime(LocalTime openingTime) {
		this.openingTime = openingTime;
	}
	public LocalTime getClosingTime() {
		return closingTime;
	}
	public void setClosingTime(LocalTime closingTime) {
		this.closingTime = closingTime;
	}
	public List<RestuarentItems> getItems() {
		return items;
	}
	public void setItems(List<RestuarentItems> items) {
		this.items = items;
	}
	
	public boolean isActive() {
		return active;
	}
	public void setActive(boolean active) {
		this.active = active;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}

	public LocalDateTime getSuspensionExpiry() {
		return suspensionExpiry;
	}

	public void setSuspensionExpiry(LocalDateTime suspensionExpiry) {
		this.suspensionExpiry = suspensionExpiry;
	}
	
	
	
}