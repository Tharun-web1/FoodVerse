package com.user.dto;

import com.user.entity.UserEntity;
import com.user.enums.Role;

public class UserAdminDto {
    private Long id;
    private String username;
    private String phnno;
    private String mail;
    private Role role;
    private boolean active;

    public static UserAdminDto from(UserEntity user) {
        UserAdminDto dto = new UserAdminDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setPhnno(user.getPhnno());
        dto.setMail(user.getMail());
        dto.setRole(user.getRole());
        dto.setActive(user.isActive());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPhnno() { return phnno; }
    public void setPhnno(String phnno) { this.phnno = phnno; }
    public String getMail() { return mail; }
    public void setMail(String mail) { this.mail = mail; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
