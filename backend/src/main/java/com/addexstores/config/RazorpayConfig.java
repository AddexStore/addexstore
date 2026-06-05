package com.addexstores.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class RazorpayConfig {

    @Value("${payment.razorpay.key-id:}")
    private String keyId;

    @Value("${payment.razorpay.key-secret:}")
    private String keySecret;

    @Value("${payment.razorpay.webhook-secret:}")
    private String webhookSecret;

    public String getKeyId() {
        return keyId;
    }

    public String getKeySecret() {
        return keySecret;
    }

    public String getWebhookSecret() {
        return webhookSecret;
    }

    @PostConstruct
    public void init() {
        if (keyId.isBlank() || keySecret.isBlank()) {
            log.warn("Razorpay credentials not configured. Razorpay payments will be unavailable.");
        } else {
            log.info("Razorpay configured successfully");
        }
    }
}
