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
            return ResponseEntity.ok("OK");
        }

        String signatureHeader = request.getHeader("X-Razorpay-Signature");
        if (signatureHeader == null) {
            log.warn("Missing Razorpay webhook signature header");
            return ResponseEntity.ok("OK");
        }

        try {
            JSONObject event = razorpayPaymentService.verifyWebhook(payload, signatureHeader);
            if (event != null) {
                razorpayPaymentService.processWebhookEvent(event);
            }
        } catch (Exception e) {
            log.error("Razorpay webhook processing failed: {}", e.getMessage());
        }

        return ResponseEntity.ok("OK");
    }
}
