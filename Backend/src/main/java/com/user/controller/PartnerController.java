package com.user.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.user.entity.RiderEntity;
import com.user.entity.WithdrawalRequest;
import com.user.service.RiderService;

@RestController
@RequestMapping("/partner")
@CrossOrigin("*")
public class PartnerController {

    @Autowired
    private RiderService service;

    @GetMapping("/profile")
    public RiderEntity getProfile(Authentication authentication) {
        String email = authentication.getName();
        return service.getProfile(email);
    }

    @PostMapping("/vehicle")
    public RiderEntity updateVehicle(@RequestBody RiderEntity details, Authentication authentication) {
        String email = authentication.getName();
        return service.updateVehicleDetails(email, details);
    }
    @PostMapping("/documents")
    public RiderEntity updateDocuments(@RequestBody RiderEntity details, Authentication authentication) {
        String email = authentication.getName();
        return service.updatedDocumentNumbers(email, details);
    }

    @PostMapping("/bank")
    public RiderEntity updateBank(@RequestBody RiderEntity details, Authentication authentication) {
        String email = authentication.getName();
        return service.updateBankDetails(email, details);
    }

    @PostMapping("/withdraw")
    public WithdrawalRequest withdraw(@RequestParam("amount") Double amount, Authentication authentication) {
        String email = authentication.getName();
        return service.requestWithdrawal(email, amount);
    }

    @GetMapping("/withdrawals")
    public List<WithdrawalRequest> getWithdrawals(Authentication authentication) {
        String email = authentication.getName();
        return service.getWithdrawals(email);
    }
}
