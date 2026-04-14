package com.user.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import com.user.dto.LoginDto;
import com.user.service.SignupService;
import com.user.service.OtpService;
import com.user.service.MyUserService;
import com.user.service.JwtService;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class SignupController {

    @Autowired
    private SignupService signupService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private MyUserService myUserService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, Object> signupData) {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(signupService.signup(signupData));
    }

    @PostMapping("/adminsignup")
    public ResponseEntity<?> adminsignup(@RequestBody Map<String, Object> signupData) {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(signupService.signup(signupData));
    }

    // 📤 Request OTP
    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(@RequestBody Map<String, String> request) {
        String identifier = request.get("identifier");
        
        if (identifier == null || identifier.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("message", "Identifier is required"));
        }

        // 🛡️ Validation: Only Email or Phone Number allowed for OTP login
        boolean isEmail = identifier.contains("@");
        boolean isPhone = identifier.matches("\\d+"); // Matches only numeric digits

        if (!isEmail && !isPhone) {
            return ResponseEntity.status(400).body(Map.of("message", "OTP login is only available for Email or Phone Number. Names/Usernames cannot receive OTPs."));
        }

        try {
            // Verify user exists first
            myUserService.loadUserByUsername(identifier);
            otpService.generateAndSendOtp(identifier);
            return ResponseEntity.ok(Map.of(
                "message", "OTP sent successfully! Please check your Email or Phone Number."
            ));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found with this identifier"));
        }
    }

    // 🔑 Login with OTP
    @PostMapping("/login-otp")
    public ResponseEntity<?> loginWithOtp(@RequestBody Map<String, String> request) {
        String identifier = request.get("identifier");
        String otp = request.get("otp");

        if (otpService.verifyOtp(identifier, otp)) {
            // Fetch the actual user details to get the primary username
            org.springframework.security.core.userdetails.UserDetails userDetails = myUserService.loadUserByUsername(identifier);
            // Generate token with the REAL username to ensure consistency in JwtFilter/JwtService
            String token = jwtService.generateToken(userDetails.getUsername(), null);
            return ResponseEntity.ok(token);
        } else {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired OTP"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginDto dto) {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(signupService.verify(dto));
    }


    // 🔄 Forgot Password: Step 1 - Request OTP
    @PostMapping("/forgot-password/request")
    public ResponseEntity<?> forgotPasswordRequest(@RequestBody Map<String, String> request) {
        String identifier = request.get("identifier");
        if (identifier == null || identifier.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("message", "Identifier is required"));
        }

        try {
            // Reusing the same OTP logic (which now sends to both Email + Phone)
            otpService.generateAndSendOtp(identifier);
            return ResponseEntity.ok(Map.of("message", "Recovery code sent! Please check your Email and Phone Number."));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }
    }

    // 🔄 Forgot Password: Step 2 - Verify & Reset
    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> forgotPasswordReset(@RequestBody Map<String, String> request) {
        String identifier = request.get("identifier");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        if (otpService.verifyOtp(identifier, otp)) {
            try {
                signupService.resetPassword(identifier, newPassword);
                return ResponseEntity.ok(Map.of("message", "Password reset successful! You can now login."));
            } catch (Exception e) {
                return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
            }
        } else {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired recovery code"));
        }
    }
}
