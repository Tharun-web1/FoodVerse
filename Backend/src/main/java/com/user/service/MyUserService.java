package com.user.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.user.entity.UserEntity;
import com.user.repo.UserRepo;

@Service
public class MyUserService implements UserDetailsService{
            @Autowired
            private UserRepo userRepo;
            public void save(UserEntity user) {
                userRepo.save(user);
            }
            
    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        // Try finding by username first
        UserEntity user = userRepo.findByUsername(identifier);
        
        // Fallback to mail
        if (user == null) {
            user = userRepo.findByMail(identifier);
        }
        
        // Fallback to phnno
        if (user == null) {
            user = userRepo.findByPhnno(identifier);
        }

        if (user == null) {
            throw new UsernameNotFoundException("User not found with identifier: " + identifier);
        }
        
        checkAndAutoUnblock(user);
        
        if (!user.isActive()) {
            if (user.getBlockedUntil() != null) {
                java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
                throw new RuntimeException("Account is blocked until " + user.getBlockedUntil().format(formatter));
            }
            throw new RuntimeException("Account is currently disabled");
        }
        
        return new Principal(user);
    }
            
    public UserEntity getCurrentUser(String identifier) {
        UserEntity user = userRepo.findByUsername(identifier);
        if (user == null) {
            user = userRepo.findByMail(identifier);
        }
        if (user == null) {
            user = userRepo.findByPhnno(identifier);
        }
        
        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + identifier);
        }
        
        checkAndAutoUnblock(user);
        
        if (!user.isActive()) {
            if (user.getBlockedUntil() != null) {
                java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
                throw new RuntimeException("Account is blocked until " + user.getBlockedUntil().format(formatter));
            }
            throw new RuntimeException("Account is currently disabled");
        }
        
        return user;
    }

    private void checkAndAutoUnblock(UserEntity user) {
        if (!user.isActive() && 
            user.getBlockedUntil() != null && 
            java.time.LocalDateTime.now().isAfter(user.getBlockedUntil())) {
            
            user.setActive(true);
            user.setBlockedFrom(null);
            user.setBlockedUntil(null);
            userRepo.save(user);
        }
    }
}
