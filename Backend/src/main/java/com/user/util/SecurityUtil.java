package com.user.util;

import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {
	 private SecurityUtil() {} 

	    public static String getCurrentUsername() {
	        return SecurityContextHolder
	                .getContext()
	                .getAuthentication()
	                .getName();
	    }
}
