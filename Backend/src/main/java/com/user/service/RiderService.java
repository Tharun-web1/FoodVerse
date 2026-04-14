package com.user.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.stereotype.Service;

import com.user.entity.RiderEntity;
import com.user.enums.PartnerStatus;
import com.user.enums.DeliveryStatus;
import com.user.repo.RiderRepo;
import com.user.repo.DeliveryOrderRepo;
import com.user.repo.WithdrawalRepo;
import com.user.entity.WithdrawalRequest;

@Service
public class RiderService {

    @Autowired
    private DeliveryOrderRepo deliveryOrderRepo;

    @Autowired
    private RiderRepo repo;

    @Autowired
    private WithdrawalRepo withdrawalRepo;

    // 📝 Register Partner
    public RiderEntity registerPartner(RiderEntity dp) {

        dp.setEmail(dp.getEmail().trim());
        dp.setPhone(dp.getPhone().trim());

        System.out.println("Registering partner: " + dp.getEmail());

        repo.findByEmail(dp.getEmail()).ifPresent(e -> {
            throw new RuntimeException("Email already registered");
        });

        repo.findByPhone(dp.getPhone()).ifPresent(p -> {
            throw new RuntimeException("Phone already registered");
        });

        dp.setStatus(PartnerStatus.ACTIVE);
        dp.setAvailable(false);
        dp.setTotalEarnings(0.0);
        dp.setRating(0.0);
        dp.setTotalOrders(0);

        RiderEntity saved = repo.save(dp);
        System.out.println("Partner registered successfully: " + saved.getId());
        return saved;
    }

    // 🔐 Login
    public RiderEntity login(String identifier, String password) {

        String trimmedId = identifier.trim();
        System.out.println("Attempting login for: " + trimmedId);

        // Try find by email
        RiderEntity partner = repo.findByEmail(trimmedId).orElse(null);
        
        // Fallback to phone
        if (partner == null) {
            partner = repo.findByPhone(trimmedId).orElse(null);
        }
        
        // Fallback to name
        if (partner == null) {
            partner = repo.findByName(trimmedId).orElse(null);
        }

        if (partner == null) {
            throw new RuntimeException("Invalid Identifier: " + trimmedId);
        }

        if (!partner.getPassword().equals(password)) {
            throw new RuntimeException("Invalid Password");
        }

        if (partner.getStatus() != PartnerStatus.ACTIVE) {
            checkAndAutoUnblock(partner);
            
            // Re-check after potential auto-unblock
            if (partner.getStatus() != PartnerStatus.ACTIVE) {
                String message = "Account not approved yet";
                if (partner.getStatus() == PartnerStatus.BLOCKED) {
                    if (partner.getBlockedFrom() != null && partner.getBlockedUntil() != null) {
                        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
                        message = "Your account is blocked from " + 
                                  partner.getBlockedFrom().format(formatter) + " to " + 
                                  partner.getBlockedUntil().format(formatter);
                    } else {
                        message = "Your account is permanently blocked";
                    }
                }
                throw new RuntimeException(message);
            }
        }

        return partner;
    }

    // 📋 Get Profile (Used in JWT auth)
    public RiderEntity getProfile(String identifier) {
        RiderEntity partner = repo.findByEmail(identifier).orElse(null);
        if (partner == null) partner = repo.findByPhone(identifier).orElse(null);
        if (partner == null) partner = repo.findByName(identifier).orElse(null);

        if (partner == null) {
            throw new RuntimeException("Partner not found");
        }

        checkAndAutoUnblock(partner);

        if (partner.getStatus() == PartnerStatus.BLOCKED) {
            if (partner.getBlockedFrom() != null && partner.getBlockedUntil() != null) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
                throw new RuntimeException("Your account is blocked until " + partner.getBlockedUntil().format(formatter));
            } else {
                throw new RuntimeException("Your account is permanently blocked");
            }
        }

        // 📈 Sync totalOrders from history for accuracy
        long count = deliveryOrderRepo.countByPartnerIdAndStatus(partner.getId(), DeliveryStatus.DELIVERED);
        partner.setTotalOrders((int) count);

        return partner;
    }

    // 🚗 Update Vehicle Details
    public RiderEntity updateVehicleDetails(
            String identifier,
            RiderEntity details) {

        RiderEntity partner = getProfile(identifier);

        partner.setVehicleType(details.getVehicleType());
        partner.setVehicleNumber(details.getVehicleNumber());
        partner.setLicenseNumber(details.getLicenseNumber());

        return repo.save(partner);
    }
    public RiderEntity updatedDocumentNumbers(
            String identifier,
            RiderEntity details) {

        RiderEntity partner = getProfile(identifier);

        partner.setPanNumber(details.getPanNumber());
        partner.setAadhaarNumber(details.getAadhaarNumber());

        return repo.save(partner);
    }

    public RiderEntity updateBankDetails(String identifier, RiderEntity details) {
        RiderEntity partner = getProfile(identifier);

        partner.setBankName(details.getBankName());
        partner.setAccountNumber(details.getAccountNumber());
        partner.setIfscCode(details.getIfscCode());
        partner.setAccountHolderName(details.getAccountHolderName());

        return repo.save(partner);
    }

    // 📋 All partners
    public List<RiderEntity> getAllPartners() {
        List<RiderEntity> partners = repo.findAll();
        partners.forEach(this::checkAndAutoUnblock);
        return partners;
    }

    // ✅ Approve Partner
    public RiderEntity approvePartner(Integer id) {

        RiderEntity dp = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Partner not found"));

        dp.setStatus(PartnerStatus.ACTIVE);
        return repo.save(dp);
    }

    // 🚫 Block Partner
    public RiderEntity blockPartner(Integer id, LocalDateTime from, LocalDateTime to) {

        RiderEntity dp = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Partner not found"));

        dp.setStatus(PartnerStatus.BLOCKED);
        dp.setAvailable(false);
        dp.setBlockedFrom(from);
        dp.setBlockedUntil(to);

        return repo.save(dp);
    }

    // 🟢 Toggle Availability
    public RiderEntity updateAvailability(
            Integer id,
            Boolean available) {

        RiderEntity dp = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Partner not found"));

        dp.setAvailable(available);
        return repo.save(dp);
    }

    // 📍 Update Location
    public RiderEntity updateLocation(String identifier, Double lat, Double lng) {
        RiderEntity partner = getProfile(identifier);

        partner.setLatitude(lat);
        partner.setLongitude(lng);
        return repo.save(partner);
    }

    // 💰 Add Earnings
    public void addEarnings(Integer partnerId,
            Double amount) {

        RiderEntity dp = repo.findById(partnerId)
                .orElseThrow(() -> new RuntimeException("Partner not found"));

        dp.setTotalEarnings(
                dp.getTotalEarnings() + amount);

        repo.save(dp);
    }

    // 🔐 Spring Security Authentication fallback logic
    public UserDetails loadRiderByUsername(
            String identifier)
            throws UsernameNotFoundException {

        RiderEntity user = repo.findByEmail(identifier).orElse(null);
        if (user == null) user = repo.findByPhone(identifier).orElse(null);
        if (user == null) user = repo.findByName(identifier).orElse(null);

        if (user == null) {
            throw new UsernameNotFoundException("Rider not found");
        }

        return new RiderPrincipal(user); // using the renamed RiderPrincipal class
    }
    public RiderEntity getRiderById(Integer id) {
        RiderEntity rider = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Rider not found with id: " + id));
        checkAndAutoUnblock(rider);
        return rider;
    }

    // 📈 Total Orders Increment
    public void incrementTotalOrders(Integer partnerId) {
        RiderEntity dp = repo.findById(partnerId)
                .orElseThrow(() -> new RuntimeException("Partner not found"));
        
        Integer currentOrders = dp.getTotalOrders();
        if (currentOrders == null) currentOrders = 0;
        dp.setTotalOrders(currentOrders + 1);
        
        repo.save(dp);
    }

    public WithdrawalRequest requestWithdrawal(String identifier, Double amount) {
        RiderEntity partner = getProfile(identifier);

        if (amount <= 0 || amount > partner.getTotalEarnings()) {
            throw new RuntimeException("Invalid withdrawal amount");
        }

        WithdrawalRequest request = new WithdrawalRequest();
        request.setRider(partner);
        request.setAmount(amount);
        request.setBankName(partner.getBankName());
        request.setAccountNumber(partner.getAccountNumber());
        request.setIfscCode(partner.getIfscCode());
        request.setStatus("COMPLETED");

        // Simulate instant transfer to bank account
        partner.setTotalEarnings(partner.getTotalEarnings() - amount);
        partner.setBankBalance(partner.getBankBalance() + amount);
        repo.save(partner);

        return withdrawalRepo.save(request);
    }

    public List<WithdrawalRequest> getWithdrawals(String identifier) {
        RiderEntity partner = getProfile(identifier);
        return withdrawalRepo.findByRiderOrderByRequestTimeDesc(partner);
    }

    private void checkAndAutoUnblock(RiderEntity partner) {
        if (partner.getStatus() == PartnerStatus.BLOCKED && 
            partner.getBlockedUntil() != null && 
            LocalDateTime.now().isAfter(partner.getBlockedUntil())) {
            
            partner.setStatus(PartnerStatus.ACTIVE);
            partner.setBlockedFrom(null);
            partner.setBlockedUntil(null);
            repo.save(partner);
        }
    }
}
