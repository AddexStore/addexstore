package com.addexstores.controller;

import com.addexstores.dto.request.CheckoutQuoteRequest;
import com.addexstores.dto.request.CreatePaymentRequest;
import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.CheckoutQuoteResponse;
import com.addexstores.dto.response.CreatePaymentResponse;
import com.addexstores.security.CurrentUser;
import com.addexstores.service.CheckoutPricingService;
import com.addexstores.service.StripePaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
@Tag(name = "Checkout")
public class CheckoutController {

    private final CheckoutPricingService checkoutPricingService;
    private final StripePaymentService stripePaymentService;

    @PostMapping("/quote")
    @Operation(summary = "Get checkout pricing quote")
    public ApiResponse<CheckoutQuoteResponse> getQuote(
            @CurrentUser Long userId,
            @Valid @RequestBody CheckoutQuoteRequest request) {
        return ApiResponse.success(checkoutPricingService.calculateQuote(request, userId));
    }

    @PostMapping("/create-payment")
    @Operation(summary = "Create order and Stripe PaymentIntent in one call")
    public ApiResponse<CreatePaymentResponse> createPayment(
            @CurrentUser Long userId,
            @Valid @RequestBody CreatePaymentRequest request) {
        return ApiResponse.success(stripePaymentService.createOrderAndPaymentIntent(userId, request));
    }
}
