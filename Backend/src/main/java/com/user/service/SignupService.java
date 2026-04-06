package com.user.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.user.dto.LoginDto;
import com.user.entity.Restuarent;
import com.user.entity.UserEntity;
import com.user.enums.Role;
import com.user.repo.UserRepo;

@Service
public class SignupService {

    @Autowired
    private UserRepo userRepo;
    @Autowired
    private AuthenticationManager authManager;
    
    @Autowired
    private JwtService jwtService;

    @Autowired
    private RestuarentService restuarentService;

    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule())
            .configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    public Object signup(java.util.Map<String, Object> data) {
        UserEntity user = objectMapper.convertValue(data, UserEntity.class);

        if (userRepo.findByUsername(user.getUsername()) != null) {
            throw new RuntimeException("Username already exists");
        }

        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }

        UserEntity savedUser = userRepo.save(user);

        if (savedUser.getRole() == Role.RESTAURANT) {
            Restuarent restuarent = objectMapper.convertValue(data, Restuarent.class);
            restuarent.setId(null); 
            return restuarentService.addRestuarent(restuarent);
        }

        return savedUser;
    }

	public String verify(LoginDto dto) {
		
		Authentication authentication=authManager.authenticate(new UsernamePasswordAuthenticationToken(dto.getUsername(), dto.getPassword()));
		if(authentication == null)
		{
			throw new RuntimeException("Enter valid details");
		}
		
		
		String token=jwtService.generateToken(dto.getUsername(),dto.getPassword());
		return token;
			
	}

    public UserEntity createAdmin(UserEntity user) {
        if (userRepo.findByUsername(user.getUsername()) != null) {
            throw new RuntimeException("Username already exists");
        }
        user.setRole(Role.ADMIN);
        user.setActive(true);
        // In a real app, ensure password hashing here if not handled elsewhere
        return userRepo.save(user);
    }
}

