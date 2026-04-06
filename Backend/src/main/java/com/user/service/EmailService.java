package com.user.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom("support@foodapp.com");
                message.setTo(to);
                message.setSubject("Your FoodApp Login OTP");
                message.setText("Your verification code is: " + otp + "\nValid for 5 minutes.");
                mailSender.send(message);
                System.out.println("Real Email sent successfully to: " + to);
            } catch (Exception e) {
                System.err.println("Failed to send real email: " + e.getMessage());
            }
        } else {
            System.out.println("---------- EMAIL OTP SIMULATION (CHECK CONSOLE) ----------");
            System.out.println("To: " + to);
            System.out.println("OTP: " + otp);
            System.out.println("---------------------------------------------------------");
            System.out.println("Action Required: Configure spring.mail properties in application.properties for real delivery.");
        }
    }
}
