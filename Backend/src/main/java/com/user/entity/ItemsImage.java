package com.user.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

@Entity
public class ItemsImage {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String image_name;
	private String image_path;
	private String image_type;
	@OneToOne
    @JoinColumn(
        name = "ri_id",
        referencedColumnName = "id",
        nullable = false
    )
	private RestuarentItems ri;
	public ItemsImage() {
		
	}
	public ItemsImage(Long id, String image_name, String image_path, String image_type, RestuarentItems ri) {
		this.id = id;
		this.image_name = image_name;
		this.image_path = image_path;
		this.image_type = image_type;
		this.ri = ri;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getImage_name() {
		return image_name;
	}
	public void setImage_name(String image_name) {
		this.image_name = image_name;
	}
	public String getImage_path() {
		return image_path;
	}
	public void setImage_path(String image_path) {
		this.image_path = image_path;
	}
	public String getImage_type() {
		return image_type;
	}
	public void setImage_type(String image_type) {
		this.image_type = image_type;
	}
	public RestuarentItems getRi() {
		return ri;
	}
	public void setRi(RestuarentItems ri) {
		this.ri = ri;
	}
	
}
