package com.user.filter;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.filter.OncePerRequestFilter;

import com.user.service.JwtService;
import com.user.service.MyUserService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class JwtFilter extends OncePerRequestFilter {
	@Autowired
	private JwtService jwtservices;
	@Autowired
	private ApplicationContext context;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		 String path=request.getServletPath();

		 if (path.startsWith("/auth") || path.startsWith("/partner/auth") || path.startsWith("/error")) {
			    filterChain.doFilter(request, response);
			    return;
			}
		 
		 String token=null;
		 String authHeader=request.getHeader("Authorization");
		 String username=null;
		 
		 try {
			 if(authHeader !=null && authHeader.startsWith("Bearer "))
			 {
				 token=authHeader.substring(7);
				 username=jwtservices.extractUsername(token);
			 }
		 } catch (Exception e) {
			 // Log and ignore token extraction errors (like expiration) for endpoints that don't strictly require a valid token here.
			 // Spring Security configuration will handle the actual access control.
			 logger.error("Token extraction failed: " + e.getMessage());
		 }
		
		 
		 if(username !=null && SecurityContextHolder.getContext().getAuthentication()==null)
		 {
			 UserDetails userDetails = null;
			 try {
			 	userDetails = context.getBean(MyUserService.class).loadUserByUsername(username);
			 } catch (Exception e) {
			 	try {
			 		userDetails = context.getBean(com.user.service.RiderService.class).loadRiderByUsername(username);
			 	} catch (Exception ex) {
			 		// User not found in either service
			 	}
			 }
			 
			 if(userDetails != null && jwtservices.validate(userDetails,token))
			 {
			UsernamePasswordAuthenticationToken authToken=new UsernamePasswordAuthenticationToken(userDetails,null,userDetails.getAuthorities());
			
			authToken.setDetails(userDetails);
			
			SecurityContextHolder.getContext().setAuthentication(authToken);
			
			 }
			 
			 
		 }
		 filterChain.doFilter(request, response);
	}	
}