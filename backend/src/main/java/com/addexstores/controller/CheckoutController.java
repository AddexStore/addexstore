package com.addexstores.controller;

import com.addexstores.dto.request.CheckoutQuoteRequest;
import com.addexstores.dto.request.CreatePaymentRequest;
import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.CheckoutQuoteResponse;
import com.addexstores.dto.response.CreatePaymentResponse;
import com.addexstores.enums.PaymentMethod;
import com.addexstores.payment.PaymentGateway;
import com.addexstores.payment.PaymentGatewayFactory;
import com.addexstores.security.CurrentUser;
import com.addexstores.service.CheckoutPricingService;
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
    private final PaymentGatewayFactory gatewayFactory;

    @PostMapping("/quote")
    @Operation(summary = "Get checkout pricing quote")
    public ApiResponse<CheckoutQuoteResponse> getQuote(
            @CurrentUser Long userId,
            @Valid @RequestBody CheckoutQuoteRequest request) {
        return ApiResponse.success(checkoutPricingService.calculateQuote(request, userId));
    }

    @PostMapping("/create-payment")
    @Operation(summary = "Create order and payment via active gateway")
    public ApiResponse<CreatePaymentResponse> createPayment(
            @CurrentUser Long userId,
            @Valid @RequestBody CreatePaymentRequest request) {
        PaymentMethod method = PaymentMethod.STRIPE;
        if (request.getPaymentMethod() != null) {
            try {
                method = PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
            } catch (IllegalArgumentException e) {
                method = gatewayFactory.getActivePaymentMethod();
            }
        }
        PaymentGateway gateway = gatewayFactory.getGateway(method);
        return ApiResponse.success(gateway.createOrderAndPaymentIntent(userId, request));
    }
}
