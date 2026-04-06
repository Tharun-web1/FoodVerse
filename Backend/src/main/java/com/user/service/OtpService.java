package com.user.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.user.entity.OtpEntity;
import com.user.repo.OtpRepo;
import java.time.LocalDateTime;
import java.util.Random;

@Service
public class OtpService {

    @Autowired
    private OtpRepo otpRepo;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SmsService smsService;

    @Transactional
    public String generateAndSendOtp(String identifier) {
        // Clear old OTP for this identifier
        otpRepo.deleteByIdentifier(identifier);

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(5);

        OtpEntity otpEntity = new OtpEntity(identifier, otp, expiry);
        otpRepo.save(otpEntity);

        // Route to Email or SMS
        if (identifier.contains("@")) {
            emailService.sendOtpEmail(identifier, otp);
        } else {
            smsService.sendOtpSms(identifier, otp);
        }
        return otp;
    }

    public boolean verifyOtp(String identifier, String otp) {
        return otpRepo.findByIdentifier(identifier)
                .map(entity -> {
                    boolean isValid = entity.getOtp().equals(otp) && 
                                      entity.getExpiry().isAfter(LocalDateTime.now());
                    if (isValid) {
                        otpRepo.delete(entity);
                    }
                    return isValid;
                })
                .orElse(false);
    }
}
