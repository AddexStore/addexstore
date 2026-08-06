package com.addexstores.controller;

import com.addexstores.dto.request.CreateStripePaymentIntentRequest;
import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.CreateStripePaymentIntentResponse;
import com.addexstores.dto.response.PaymentStatusResponse;
import com.addexstores.security.CurrentUser;
import com.addexstores.service.StripePaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments/stripe")
@RequiredArgsConstructor
@Tag(name = "Stripe Payments")
public class StripePaymentController {

    private final StripePaymentService stripePaymentService;

    @PostMapping("/create-intent")
    @Operation(summary = "Create Stripe PaymentIntent")
    public ApiResponse<CreateStripePaymentIntentResponse> createPaymentIntent(
            @CurrentUser Long userId,
            @Valid @RequestBody CreateStripePaymentIntentRequest request) {
        return ApiResponse.success(stripePaymentService.createPaymentIntent(userId, request.getOrderId(), request.getCurrency()));
    }

    @GetMapping("/status/{paymentIntentId}")
    @Operation(summary = "Get payment status by PaymentIntent ID")
    public ApiResponse<PaymentStatusResponse> getPaymentStatus(
            @CurrentUser Long userId,
            @PathVariable @NotBlank String paymentIntentId) {
        return ApiResponse.success(stripePaymentService.retrievePayment(paymentIntentId, userId));
    }

    @PostMapping("/cancel/{paymentIntentId}")
    @Operation(summary = "Cancel a pending PaymentIntent")
    public ApiResponse<Void> cancelPayment(
            @CurrentUser Long userId,
            @PathVariable @NotBlank String paymentIntentId) {
        stripePaymentService.cancelPayment(paymentIntentId, userId);
        return ApiResponse.success();
    }
}
