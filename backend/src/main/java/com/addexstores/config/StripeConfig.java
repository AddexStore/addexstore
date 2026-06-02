package com.addexstores.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class StripeConfig {

    @Value("${payment.stripe.secret-key:}")
    private String secretKey;

    @PostConstruct
    public void init() {
        if (!secretKey.isBlank()) {
            com.stripe.Stripe.apiKey = secretKey;
            log.info("Stripe API initialized");
        } else {
            log.warn("Stripe secret key not configured");
        }
    }
}
