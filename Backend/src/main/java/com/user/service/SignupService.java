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

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule())
            .configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            
    public void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw new RuntimeException("Password must be at least 8 characters long");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new RuntimeException("Password must contain at least one uppercase letter");
        }
        if (!password.matches(".*[a-z].*")) {
            throw new RuntimeException("Password must contain at least one lowercase letter");
        }
        if (!password.matches(".*[0-9].*")) {
            throw new RuntimeException("Password must contain at least one number");
        }
        if (!password.matches(".*[!@#$%^&*(),.?\":{}|<>].*")) {
            throw new RuntimeException("Password must contain at least one special character (!@#$%^&*)");
        }
    }

    public Object signup(java.util.Map<String, Object> data) {
        UserEntity user = objectMapper.convertValue(data, UserEntity.class);

        if (userRepo.findByUsername(user.getUsername()) != null) {
            throw new RuntimeException("Username already exists");
        }

        validatePassword(user.getPassword());
        user.setPassword(passwordEncoder.encode(user.getPassword()));

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
        
        validatePassword(user.getPassword());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        user.setRole(Role.ADMIN);
        user.setActive(true);
        // In a real app, ensure password hashing here if not handled elsewhere
        return userRepo.save(user);
    }

    public void resetPassword(String identifier, String newPassword) {
        UserEntity user = userRepo.findByUsername(identifier);
        if (user == null) user = userRepo.findByMail(identifier);
        if (user == null) user = userRepo.findByPhnno(identifier);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        validatePassword(newPassword);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);
    }
}

