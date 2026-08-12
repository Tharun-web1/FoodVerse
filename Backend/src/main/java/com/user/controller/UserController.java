package com.user.controller;

import java.net.MalformedURLException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.user.dto.UserProfileDto;
import com.user.entity.UserEntity;
import com.user.service.FavoriteService;
import com.user.service.MyUserService;
import com.user.service.SignupService;
import com.user.service.Principal;
import com.user.service.ProfileImageService;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@CrossOrigin("*")
public class UserController {
    @Autowired
    private MyUserService myUserService;
    @Autowired
    private ProfileImageService profileImageService;
    @Autowired
    private SignupService signupService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private com.user.repo.ProfileImagerepo profileImageRepo;
    @GetMapping("/users/me")
    public ResponseEntity<UserProfileDto> getMyProfile(Authentication authentication) {
        Principal principal = (Principal) authentication.getPrincipal();
        UserEntity user = principal.getUser();
        return ResponseEntity.ok(UserProfileDto.from(user));
    }
    @PutMapping("/users/me")
    public ResponseEntity<String> updateMyProfile(
           @RequestBody UserProfileDto dto,
            Authentication authentication
    ) {
        Principal principal = (Principal) authentication.getPrincipal();
        UserEntity user = principal.getUser();

        user.setUsername(dto.getUsername());
        user.setMail(dto.getMail());
        user.setPhnno(dto.getPhnno());

        myUserService.save(user);

        return ResponseEntity.ok("Profile updated");
    }


    /** UPDATE / UPLOAD **/
    @PutMapping("/users/me/profile-image")
    public ResponseEntity<String> updateProfileImage(@RequestParam("image") MultipartFile image, Authentication authentication) throws Exception {
        Principal principal = (Principal) authentication.getPrincipal();
        profileImageService.updateProfileImage(image, principal.getUser());
        return ResponseEntity.ok("Profile image updated successfully");
    }
    
    @PostMapping("/users/me/profile-image")
    public ResponseEntity<String> uploadProfileImage(@RequestParam("image") MultipartFile image, Authentication authentication) throws Exception {
        return updateProfileImage(image, authentication);
    }

    /** GET IMAGE **/
    @GetMapping("/users/me/profile-image")
    public ResponseEntity<Resource> getProfileImage(Authentication authentication) throws MalformedURLException {
        Principal principal = (Principal) authentication.getPrincipal();
        Resource image = profileImageService.getProfileImage(principal.getUser());
        
        com.user.entity.ProfileImage dbImage = profileImageRepo.findByUe_Id(principal.getUser().getId());
        String contentType = (dbImage != null && dbImage.getPtype() != null) ? dbImage.getPtype() : "image/png";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(image);
    }

    /** DELETE IMAGE **/
    @DeleteMapping("/users/me/profile-image")
    public ResponseEntity<String> deleteProfileImage(Authentication authentication) throws Exception {
        Principal principal = (Principal) authentication.getPrincipal();
        profileImageService.deleteProfileImage(principal.getUser());
        return ResponseEntity.ok("Profile image deleted successfully");
    }

    /** GET USER PROFILE IMAGE BY ID (PUBLIC) **/
    @GetMapping("/users/{userId}/profile-image")
    public ResponseEntity<Resource> getUserProfileImage(@PathVariable("userId") Long userId) throws MalformedURLException {
        Resource image = profileImageService.getProfileImageByUserId(userId);
        
        com.user.entity.ProfileImage dbImage = profileImageRepo.findByUe_Id(userId);
        String contentType = (dbImage != null && dbImage.getPtype() != null) ? dbImage.getPtype() : "image/png";
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(image);
    }
    
    
    @Autowired
    private FavoriteService favoriteService;

    @PostMapping("/users/favorites/toggle/{restaurantId}")
    public void toggleFavorite(@PathVariable("restaurantId") Long restaurantId, Authentication authentication) {
        Principal principal = (Principal) authentication.getPrincipal();
        favoriteService.toggleFavorite(principal.getUser(), restaurantId);
    }

    @GetMapping("/users/favorites")
    public List<com.user.dto.FavoriteResponseDto> getFavorites(Authentication authentication) {
        Principal principal = (Principal) authentication.getPrincipal();
        return favoriteService.getFavorites(principal.getUser());
    }

    @GetMapping("/users/favorites/check/{restaurantId}")
    public boolean isFavorite(@PathVariable("restaurantId") Long restaurantId, Authentication authentication) {
        Principal principal = (Principal) authentication.getPrincipal();
        return favoriteService.isFavorite(principal.getUser(), restaurantId);
    }

    @Autowired
    private com.user.service.AddressService addressService;

    @GetMapping("/users/addresses")
    public ResponseEntity<List<com.user.dto.AddressDto>> getUserAddresses(Authentication authentication) {
        Principal principal = (Principal) authentication.getPrincipal();
        List<com.user.entity.Address> addresses = addressService.getAddressesByUser(principal.getUser());
        List<com.user.dto.AddressDto> addressDtos = addresses.stream()
                .map(com.user.dto.AddressDto::from)
                .toList();
        return ResponseEntity.ok(addressDtos);
    }

    @PostMapping("/users/addresses/add")
    public ResponseEntity<com.user.dto.AddressDto> addAddress(
            @RequestBody com.user.entity.Address address,
            Authentication authentication
    ) {
        Principal principal = (Principal) authentication.getPrincipal();
        com.user.entity.Address savedAddress = addressService.addAddress(principal.getUser(), address);
        return ResponseEntity.ok(com.user.dto.AddressDto.from(savedAddress));
    }

    @DeleteMapping("/users/addresses/{id}")
    public ResponseEntity<String> deleteAddress(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        Principal principal = (Principal) authentication.getPrincipal();
        addressService.deleteAddress(id, principal.getUser());
        return ResponseEntity.ok("Address deleted successfully");
    }

    @Autowired
    private com.user.service.CartService cartService;

    /**
     * Save user's cart to backend
     */
    @PostMapping("/users/cart/save")
    public ResponseEntity<String> saveCart(
            @RequestBody java.util.Map<String, Object> payload,
            Authentication authentication
    ) {
        try {
            Principal principal = (Principal) authentication.getPrincipal();
            
            // Convert payload to JSON string
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            String cartData = mapper.writeValueAsString(payload.get("items"));
            Long restaurantId = payload.get("restaurantId") != null 
                ? Long.valueOf(payload.get("restaurantId").toString()) 
                : null;
            
            cartService.saveCart(principal.getUser(), cartData, restaurantId);
            return ResponseEntity.ok("Cart saved successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to save cart: " + e.getMessage());
        }
    }

    /**
     * Load user's cart from backend
     */
    @GetMapping("/users/cart/load")
    public ResponseEntity<java.util.Map<String, Object>> loadCart(Authentication authentication) {
        try {
            Principal principal = (Principal) authentication.getPrincipal();
            UserEntity user = principal.getUser();
            String cartData = cartService.loadCart(user);
            Long restaurantId = cartService.getRestaurantId(user);
            
            if (cartData == null) {
                // Return empty cart
                java.util.Map<String, Object> emptyCart = new java.util.HashMap<>();
                emptyCart.put("restaurantId", null);
                emptyCart.put("items", new java.util.ArrayList<>());
                return ResponseEntity.ok(emptyCart);
            }
            
            // Parse JSON and return
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            java.util.List<?> items = mapper.readValue(cartData, java.util.List.class);
            
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("restaurantId", restaurantId);
            response.put("items", items);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Clear user's cart from backend
     */
    @DeleteMapping("/users/cart/clear")
    public ResponseEntity<String> clearCart(Authentication authentication) {
        Principal principal = (Principal) authentication.getPrincipal();
        cartService.clearCart(principal.getUser());
        return ResponseEntity.ok("Cart cleared successfully");
    }

    /**
     * Update user password
     */
    @PutMapping("/users/me/password")
    public ResponseEntity<String> updatePassword(
            @RequestBody java.util.Map<String, String> request,
            Authentication authentication
    ) {
        Principal principal = (Principal) authentication.getPrincipal();
        UserEntity user = principal.getUser();
        String newPassword = request.get("newPassword");

        if (newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body("New password is required");
        }

        try {
            signupService.validatePassword(newPassword);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        myUserService.save(user);
        return ResponseEntity.ok("Password updated successfully");
    }

    /**
     * Add money to user's wallet
     */
    @PostMapping("/users/wallet/add")
    public ResponseEntity<Double> addWalletMoney(
            @RequestBody java.util.Map<String, Double> request,
            Authentication authentication
    ) {
        Principal principal = (Principal) authentication.getPrincipal();
        UserEntity user = principal.getUser();
        Double amount = request.get("amount");
        
        if (amount == null || amount <= 0) {
            return ResponseEntity.badRequest().body(null);
        }

        double currentBalance = user.getWalletBalance() != null ? user.getWalletBalance() : 0.0;
        user.setWalletBalance(currentBalance + amount);
        myUserService.save(user);
        
        return ResponseEntity.ok(user.getWalletBalance());
    }

    @Autowired
    private com.user.repo.UserRepo userRepo;

    @GetMapping("/users/referral-info")
    public ResponseEntity<?> getReferralInfo(Authentication authentication) {
        Principal principal = (Principal) authentication.getPrincipal();
        UserEntity user = principal.getUser();
        UserEntity dbUser = userRepo.findByUsername(user.getUsername());
        if (dbUser == null) dbUser = user;

        if (dbUser.getReferralCode() == null || dbUser.getReferralCode().trim().isEmpty()) {
            dbUser.setReferralCode(signupService.generateUniqueReferralCode(dbUser.getUsername()));
            userRepo.save(dbUser);
        }

        List<UserEntity> referredFriends = userRepo.findByReferredBy(dbUser);
        if (referredFriends == null) {
            referredFriends = java.util.Collections.emptyList();
        }

        long successfulCount = referredFriends.stream().filter(UserEntity::isReferralRewardClaimed).count();
        double totalEarned = referredFriends.stream()
                .filter(UserEntity::isReferralRewardClaimed)
                .mapToDouble(u -> 100.0)
                .sum();

        List<java.util.Map<String, Object>> friendsList = referredFriends.stream().map(f -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("username", f.getUsername());
            map.put("claimed", f.isReferralRewardClaimed());
            map.put("rewardAmount", f.isReferralRewardClaimed() ? 100.0 : 0.0);
            return map;
        }).collect(java.util.stream.Collectors.toList());

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("referralCode", dbUser.getReferralCode());
        response.put("totalEarned", totalEarned);
        response.put("successfulReferredCount", successfulCount);
        response.put("totalFriendsReferred", referredFriends.size());
        response.put("referredFriends", friendsList);

        return ResponseEntity.ok(response);
    }
}
