package com.user.dto;

import com.user.entity.UserEntity;

public class UserProfileDto {

    private String username;
    private String phnno;
    private String mail;
    private String profileImageUrl;

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
	private void setMail(String mail) {
		this.mail=mail;
		
	}

    public String getProfileImageUrl() {
        return profileImageUrl;
    }
 
    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }


    public static UserProfileDto from(UserEntity user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setUsername(user.getUsername());
        dto.setMail(user.getMail());
        dto.setPhnno(user.getPhnno());
        dto.setProfileImageUrl("/users/" + user.getId() + "/profile-image");
        return dto;
    }


}
