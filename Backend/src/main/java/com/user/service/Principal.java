package com.user.service;

import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;


import com.user.entity.UserEntity;

@SuppressWarnings("serial")
public class Principal implements UserDetails{
     
	private final UserEntity user;
     public Principal(UserEntity user) {
    	 this.user=user;
    	 
     }
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		// TODO Auto-generated method stub
		return List.of(new SimpleGrantedAuthority("ROLE_"+user.getRole())); 
		}
	

	@Override
	public String getPassword() {
		// TODO Auto-generated method stub
		return user.getPassword();
	}

	@Override
	public String getUsername() {
		// TODO Auto-generated method stub
		return user.getUsername();
	}

    public UserEntity getUser() {
        return user;
    }

}
