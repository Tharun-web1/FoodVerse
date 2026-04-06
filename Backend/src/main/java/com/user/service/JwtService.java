package com.user.service;

import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
	// Static key to prevent token invalidation on every restart
	private static final String SECRET_KEY = "SreekanthInternProjectFoodAppCouponSystemSecretKey2026!!!";

	public JwtService() {
		// Constructor no longer needs to generate a random key
	}
	
	public SecretKey getKey() {
		return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
	}
	

	public String generateToken(String username, String password) {
		Map<String,String> claims=new HashMap<>();
		return Jwts
		.builder()
		.addClaims(claims)
		.subject(username)
		.issuedAt( new Date(System.currentTimeMillis()))
		.expiration(new Date(System.currentTimeMillis()+1000*60*60*24))
		.signWith(getKey())
		.compact();
		
	}

public String extractUsername(String token) {
		
		return extractClaims(token,Claims::getSubject);
	}

	private <T>T extractClaims(String token, Function<Claims, T> claimResolver) {
		Claims claims=extractAllClaims(token);
		return claimResolver.apply(claims);
	}
	private Claims extractAllClaims(String token) {
		
		return Jwts
				.parser()
				.verifyWith(getKey())
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}

	public boolean validate(UserDetails userDetails, String token) {
		 String username=extractUsername(token);
			return ((username.equals(userDetails.getUsername())) && !isTokenExpried(token));
	
	}

	private boolean isTokenExpried(String token) {
		
		return extractExpration(token).before(new Date());
	}

	private Date extractExpration(String token) {
		return extractClaims(token,Claims::getExpiration);
	}

}
