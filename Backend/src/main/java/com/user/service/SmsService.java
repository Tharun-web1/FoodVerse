package com.user.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class SmsService {

    @Value("${twofactor.api.key:your_2factor_api_key_here}")
    private String apiKey;

    @Value("${twofactor.sms.template:OTPSMS}")
    private String templateName;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendOtpSms(String to, String otp) {
        // Clean up phone number: remove any non-digit characters (like + or spaces)
        String cleanPhone = to.replaceAll("\\D", "");

        // Auto-add 91 prefix for 10-digit Indian numbers to ensure correct routing
        if (cleanPhone.length() == 10) {
            cleanPhone = "91" + cleanPhone;
        }

        System.out.println("Attempting to send real SMS via 2Factor.in to: " + cleanPhone);

        if ("your_2factor_api_key_here".equals(apiKey) || apiKey.isEmpty()) {
            System.out.println("---------- 2FACTOR.IN SMS OTP SIMULATION ----------");
            System.out.println("To: " + cleanPhone);
            System.out.println("OTP: " + otp);
            System.out.println("---------------------------------------------------------");
            System.out.println("Action Required: Configure twofactor.api.key in application.properties for real SMS.");
        } else {
            try {
                // Formatting URL for 2Factor.in API
                // Endpoint: https://2factor.in/API/V1/{api_key}/SMS/{phone_number}/{otp_value}/{template_name}
                String url;
                if (templateName != null && !templateName.isEmpty()) {
                    url = String.format("https://2factor.in/API/V1/%s/SMS/%s/%s/%s", apiKey, cleanPhone, otp, templateName);
                } else {
                    url = String.format("https://2factor.in/API/V1/%s/SMS/%s/%s", apiKey, cleanPhone, otp);
                }

                System.out.println("Calling 2Factor.in SMS API: " + url.replace(apiKey, "HIDDEN"));
                String response = restTemplate.getForObject(url, String.class);
                System.out.println("2Factor.in Response: " + response);

            } catch (Exception e) {
                System.err.println("Failed to send 2Factor.in SMS: " + e.getMessage());
            }
        }
    }
}
