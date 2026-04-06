package com.user.controller;

import com.user.dto.UserAdminDto;
import com.user.entity.UserEntity;
import com.user.enums.Role;
import com.user.repo.UserRepo;
import com.user.service.SignupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin("*")
public class AdministratorController {

    @Autowired
    private SignupService signupService;

    @Autowired
    private UserRepo userRepo;

    @PostMapping("/create")
    public ResponseEntity<UserEntity> addAdmin(@RequestBody UserEntity user) {
        System.out.println("AdministratorController: Received request to add admin: " + user.getUsername());
        try {
            UserEntity created = signupService.createAdmin(user);
            System.out.println("AdministratorController: Admin created successfully: " + created.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            System.out.println("AdministratorController: Error creating admin: " + e.getMessage());
            throw e;
        }
    }

    @GetMapping("/list")
    public List<UserAdminDto> getAllAdmins() {
        return userRepo.findByRole(Role.ADMIN).stream()
                .map(UserAdminDto::from)
                .collect(Collectors.toList());
    }
}
