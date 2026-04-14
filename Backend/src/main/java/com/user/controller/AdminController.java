package com.user.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.user.dto.AdminStatsDto;
import com.user.dto.OrderResponseDto;
import com.user.dto.UserAdminDto;
import com.user.entity.Restuarent;
import com.user.entity.UserEntity;
import com.user.enums.Role;
import com.user.repo.OrderRepo;
import com.user.repo.RestuarentRepo;
import com.user.repo.RiderRepo;
import com.user.repo.UserRepo;
import com.user.service.OrderService;
import com.user.service.ReviewService;
import com.user.service.RestuarentService;
import com.user.service.SignupService;
import com.user.entity.Coupon;
import com.user.repo.CouponRepo;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/admin")
@CrossOrigin("*")
public class AdminController {

    @Autowired
    private SignupService signupService;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private RestuarentService restuarentService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private RestuarentRepo restuarentRepo;

    @Autowired
    private RiderRepo riderRepo;

    @Autowired
    private CouponRepo couponRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // --- STATS ---

    @GetMapping("/stats")
    public AdminStatsDto getStats() {
        long totalUsers = userRepo.countByRole(Role.USER);
        long activeUsers = userRepo.countByRoleAndActive(Role.USER, true);
        long totalRiders = riderRepo.count();
        long activeRiders = riderRepo.countByStatus(com.user.enums.PartnerStatus.ACTIVE);
        long totalRestaurants = restuarentRepo.countByStatus("APPROVED");
        long activeRestaurants = restuarentRepo.countByActiveAndStatus(true, "APPROVED");
        long inactiveRestaurants = totalRestaurants - activeRestaurants;
        long totalOrders = orderRepo.count();
        double totalRevenue = orderService.getTotalRevenue();

        return new AdminStatsDto(
                totalUsers, activeUsers, totalRiders, activeRiders,
                totalRestaurants, activeRestaurants, inactiveRestaurants,
                totalOrders, totalRevenue);
    }

    // --- USERS ---

    @GetMapping("/users")
    public Page<UserAdminDto> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, size);
        if (search != null && !search.trim().isEmpty()) {
            return userRepo.searchByRole(Role.USER, search, pageable)
                    .map(UserAdminDto::from);
        }
        return userRepo.findByRole(Role.USER, pageable)
                .map(UserAdminDto::from);
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserAdminDto> toggleUserStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        UserEntity user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setActive(active);
        if (active) {
            user.setBlockedFrom(null);
            user.setBlockedUntil(null);
        }
        UserEntity saved = userRepo.save(user);
        return ResponseEntity.ok(UserAdminDto.from(saved));
    }

    @PutMapping("/users/block/{id}")
    public ResponseEntity<UserAdminDto> blockUser(
            @PathVariable Long id,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime from,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime until) {
        UserEntity user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setActive(false);
        user.setBlockedFrom(from);
        user.setBlockedUntil(until);

        UserEntity saved = userRepo.save(user);
        return ResponseEntity.ok(UserAdminDto.from(saved));
    }

    @PutMapping("/users/approve/{id}")
    public ResponseEntity<UserAdminDto> approveUser(@PathVariable Long id) {
        UserEntity user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setActive(true);
        user.setBlockedFrom(null);
        user.setBlockedUntil(null);

        UserEntity saved = userRepo.save(user);
        return ResponseEntity.ok(UserAdminDto.from(saved));
    }

    // --- RIDERS ---

    @GetMapping("/riders")
    public Page<UserAdminDto> getAllRiders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, size);
        if (search != null && !search.trim().isEmpty()) {
            return userRepo.searchByRole(Role.RIDER, search, pageable)
                    .map(UserAdminDto::from);
        }
        return userRepo.findByRole(Role.RIDER, pageable)
                .map(UserAdminDto::from);
    }

    // --- RESTAURANTS ---

    @GetMapping("/restaurants")
    public Page<Restuarent> getAllRestaurants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active) {
        Pageable pageable = PageRequest.of(page, size);
        boolean hasSearch = search != null && !search.trim().isEmpty();
        String status = "APPROVED";

        if (active != null) {
            if (hasSearch) {
                return restuarentRepo.searchByStatusAndActive(status, active, search, pageable);
            }
            return restuarentRepo.findByStatusAndActive(status, active, pageable);
        }

        if (hasSearch) {
            return restuarentRepo.searchByStatus(status, search, pageable);
        }
        return restuarentRepo.findByStatus(status, pageable);
    }

    @PutMapping("/restaurants/{id}/status")
    public ResponseEntity<Restuarent> toggleRestaurantStatus(
            @PathVariable Long id,
            @RequestParam boolean active,
            @RequestParam(required = false) Integer hours) {
        Restuarent updated = restuarentService.updateStatus(id, active, hours);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/restaurants/{id}")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable Long id) {
        restuarentService.deleteRestaurant(id);
        return ResponseEntity.ok().build();
    }

    // --- RESTAURANT REQUESTS ---

    @GetMapping("/restaurants/requests")
    public List<Restuarent> getPendingRestaurants() {
        return restuarentService.getByStatus("PENDING");
    }

    @PutMapping("/restaurants/{id}/approve")
    public ResponseEntity<Restuarent> approveRestaurant(@PathVariable Long id) {
        Restuarent approved = restuarentService.approveRestaurant(id);
        return ResponseEntity.ok(approved);
    }

    @PutMapping("/restaurants/{id}/block")
    public ResponseEntity<Restuarent> blockRestaurant(@PathVariable Long id) {
        Restuarent blocked = restuarentService.blockRestaurant(id);
        return ResponseEntity.ok(blocked);
    }

    // --- ORDERS ---

    @GetMapping("/orders")
    public Page<OrderResponseDto> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return orderService.getAllOrders(page, size);
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<OrderResponseDto> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        OrderResponseDto updated = orderService.updateOrderStatus(id, status, null);
        return ResponseEntity.ok(updated);
    }

    // --- REVIEWS ---

    @GetMapping("/reviews")
    public List<com.user.dto.ReviewResponseDto> getAllReviews() {
        return reviewService.getAllReviews();
    }

    @GetMapping("/analytics/revenue")
    public List<java.util.Map<String, Object>> getRevenueAnalytics() {
        return orderRepo.getDailyRevenue().stream().map(row -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("date", row[0].toString());
            map.put("amount", row[1]);
            return map;
        }).collect(Collectors.toList());
    }

    @GetMapping("/recent-activity")
    public List<java.util.Map<String, Object>> getRecentActivities() {
        List<java.util.Map<String, Object>> activities = new java.util.ArrayList<>();

        // Latest 3 Users
        Pageable pageable = PageRequest.of(0, 3, org.springframework.data.domain.Sort.by("id").descending());
        userRepo.findAll(pageable).forEach(user -> {
            java.util.Map<String, Object> activity = new java.util.HashMap<>();
            activity.put("type", "USER");
            activity.put("title", "New User Registered");
            activity.put("subtitle", user.getUsername() + " joined the platform");
            activity.put("time", "Recently");
            activities.add(activity);
        });

        // Latest 3 Restaurants
        restuarentRepo.findAll(pageable).forEach(res -> {
            java.util.Map<String, Object> activity = new java.util.HashMap<>();
            activity.put("type", "RESTAURANT");
            activity.put("title",
                    res.getStatus().equals("PENDING") ? "New Onboarding Request" : "New Restaurant Partner");
            activity.put("subtitle", res.getName() + " in " + res.getLocation());
            activity.put("time", "Recently");
            activities.add(activity);
        });

        // Latest 3 Orders
        orderRepo.findAll(pageable).forEach(order -> {
            java.util.Map<String, Object> activity = new java.util.HashMap<>();
            activity.put("type", "ORDER");
            activity.put("title", "New Order Placed");
            activity.put("subtitle", "Order #" + order.getId() + " - \u20B9" + order.getTotalAmount());
            activity.put("time", "Recently");
            activities.add(activity);
        });

        // Sort by some criteria if needed, but here we just shuffle or keep as is.
        // For simplicity, we just return them.
        return activities;
    }

    @PostMapping("/add-admin")
    public ResponseEntity<UserEntity> addAdmin(@RequestBody UserEntity user) {
        System.out.println("Received request to add admin: " + user.getUsername());
        try {
            UserEntity created = signupService.createAdmin(user);
            System.out.println("Admin created successfully: " + created.getUsername());
            return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            System.out.println("Error creating admin: " + e.getMessage());
            throw e;
        }
    }

    @GetMapping("/admins")
    public List<UserAdminDto> getAllAdmins() {
        return userRepo.findByRole(Role.ADMIN).stream()
                .map(UserAdminDto::from)
                .collect(Collectors.toList());
    }

    @PutMapping("/admins/{id}")
    public ResponseEntity<UserEntity> updateAdmin(@PathVariable Long id, @RequestBody UserEntity userDetails) {
        UserEntity admin = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));

        // Ensure we are only updating admins
        if (admin.getRole() != Role.ADMIN) {
            throw new RuntimeException("User is not an admin");
        }

        admin.setUsername(userDetails.getUsername());
        admin.setMail(userDetails.getMail());
        admin.setPhnno(userDetails.getPhnno());

        // Only update password if provided
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            try {
                signupService.validatePassword(userDetails.getPassword());
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(e.getMessage());
            }
            admin.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        UserEntity updatedAdmin = userRepo.save(admin);
        return ResponseEntity.ok(updatedAdmin);
    }

    @DeleteMapping("/admins/{id}")
    public ResponseEntity<java.util.Map<String, Boolean>> deleteAdmin(@PathVariable Long id) {
        UserEntity admin = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));

        if (admin.getRole() != Role.ADMIN) {
            throw new RuntimeException("User is not an admin");
        }

        userRepo.delete(admin);
        java.util.Map<String, Boolean> response = new java.util.HashMap<>();
        response.put("deleted", Boolean.TRUE);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/coupons")
    public ResponseEntity<Coupon> createCoupon(@RequestBody Coupon coupon) {
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(couponRepo.save(coupon));
    }

    @GetMapping("/coupons")
    public List<Coupon> getAllCoupons() {
        return couponRepo.findAll();
    }
}
