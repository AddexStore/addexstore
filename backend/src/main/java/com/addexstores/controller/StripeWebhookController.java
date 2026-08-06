package com.addexstores.controller;

import com.addexstores.service.StripePaymentService;
import com.stripe.model.Event;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.BufferedReader;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/payments/stripe")
@RequiredArgsConstructor
@Tag(name = "Stripe Webhook")
public class StripeWebhookController {

    private final StripePaymentService stripePaymentService;

    @PostMapping("/webhook")
    @Operation(summary = "Stripe webhook endpoint")
    public ResponseEntity<String> handleWebhook(HttpServletRequest request) {
        String payload;
        try (BufferedReader reader = request.getReader()) {
            payload = reader.lines().collect(Collectors.joining());
        } catch (Exception e) {
            log.error("Failed to read webhook payload: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Invalid payload");
        }

        String signatureHeader = request.getHeader("Stripe-Signature");
        if (signatureHeader == null || signatureHeader.isBlank()) {
            log.warn("Missing Stripe-Signature header");
            return ResponseEntity.badRequest().body("Missing signature");
        }

        Event event;
        try {
            event = stripePaymentService.verifyWebhook(payload, signatureHeader);
        } catch (Exception e) {
            log.error("Webhook verification failed: {}", e.getMessage());
            return ResponseEntity.status(400).body("Signature verification failed");
        }

        if (event == null) {
            log.error("Webhook verification returned no event");
            return ResponseEntity.badRequest().body("Invalid event");
        }

        try {
            stripePaymentService.processWebhookEvent(event);
            log.info("Webhook {} processed successfully", event.getType());
        } catch (Exception e) {
            log.error("Failed to process webhook event: {}", e.getMessage());
            return ResponseEntity.status(500).body("Event processing failed");
        }

        return ResponseEntity.ok("Webhook received");
    }
}
