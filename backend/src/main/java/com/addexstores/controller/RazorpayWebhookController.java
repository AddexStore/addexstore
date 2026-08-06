package com.addexstores.controller;

import com.addexstores.service.impl.RazorpayPaymentServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.BufferedReader;

@Slf4j
@RestController
@RequestMapping("/api/payments/razorpay")
@RequiredArgsConstructor
public class RazorpayWebhookController {

    private final RazorpayPaymentServiceImpl razorpayPaymentService;

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(HttpServletRequest request) {
        String payload;
        try {
            StringBuilder sb = new StringBuilder();
            BufferedReader reader = request.getReader();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            payload = sb.toString();
        } catch (Exception e) {
            log.error("Failed to read webhook payload: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Invalid payload");
        }

        String signatureHeader = request.getHeader("X-Razorpay-Signature");
        if (signatureHeader == null || signatureHeader.isBlank()) {
            log.warn("Missing Razorpay webhook signature header");
            return ResponseEntity.badRequest().body("Missing signature");
        }

        JSONObject event;
        try {
            event = razorpayPaymentService.verifyWebhook(payload, signatureHeader);
        } catch (Exception e) {
            log.error("Razorpay webhook signature verification failed: {}", e.getMessage());
            return ResponseEntity.status(400).body("Signature verification failed");
        }

        if (event == null) {
            log.error("Razorpay webhook verification returned no event");
            return ResponseEntity.badRequest().body("Invalid event");
        }

        try {
            razorpayPaymentService.processWebhookEvent(event);
            log.info("Razorpay webhook {} processed successfully", event.optString("event"));
        } catch (Exception e) {
            log.error("Razorpay webhook processing failed: {}", e.getMessage());
            return ResponseEntity.status(500).body("Event processing failed");
        }

        return ResponseEntity.ok("OK");
    }
}
