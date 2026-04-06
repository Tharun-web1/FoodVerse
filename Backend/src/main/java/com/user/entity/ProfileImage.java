package com.user.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

@Entity
public class ProfileImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String pname; // filename
    private String ppath; // path on server
    private String ptype; // MIME type

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private UserEntity ue;

    public ProfileImage() {}

    public ProfileImage(String pname, String ppath, String ptype, UserEntity ue) {
        this.pname = pname;
        this.ppath = ppath;
        this.ptype = ptype;
        this.ue = ue;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPname() { return pname; }
    public void setPname(String pname) { this.pname = pname; }

    public String getPpath() { return ppath; }
    public void setPpath(String ppath) { this.ppath = ppath; }

    public String getPtype() { return ptype; }
    public void setPtype(String ptype) { this.ptype = ptype; }

    public UserEntity getUe() { return ue; }
    public void setUe(UserEntity ue) { this.ue = ue; }
}
