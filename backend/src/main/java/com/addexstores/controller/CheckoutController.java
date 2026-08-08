package com.addexstores.controller;

import com.addexstores.dto.request.CheckoutQuoteRequest;
import com.addexstores.dto.request.CreatePaymentRequest;
import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.CheckoutQuoteResponse;
import com.addexstores.dto.response.CreatePaymentResponse;
import com.addexstores.dto.response.PaymentMethodInfo;
import com.addexstores.entity.PaymentGatewayConfig;
import com.addexstores.enums.PaymentMethod;
import com.addexstores.payment.PaymentGateway;
import com.addexstores.payment.PaymentGatewayFactory;
import com.addexstores.repository.PaymentGatewayConfigRepository;
import com.addexstores.security.CurrentUser;
import com.addexstores.service.CheckoutPricingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
@Tag(name = "Checkout")
public class CheckoutController {

    private final CheckoutPricingService checkoutPricingService;
    private final PaymentGatewayFactory gatewayFactory;
    private final PaymentGatewayConfigRepository gatewayConfigRepository;

    @GetMapping("/payment-methods")
    @Operation(summary = "List payment methods available at checkout")
    public ApiResponse<List<PaymentMethodInfo>> getPaymentMethods() {
        List<PaymentGatewayConfig> configs = gatewayConfigRepository.findByEnabledTrueOrderBySortOrderAsc();
        List<PaymentMethodInfo> methods = new ArrayList<>();
        for (PaymentGatewayConfig config : configs) {
            try {
                PaymentMethod.valueOf(config.getGateway());
            } catch (IllegalArgumentException e) {
                continue;
            }
            methods.add(PaymentMethodInfo.builder()
                    .code(config.getGateway())
                    .label(config.getDisplayName() != null && !config.getDisplayName().isBlank()
                            ? config.getDisplayName()
                            : config.getGateway())
                    .description(config.getSupportedMethods() != null && !config.getSupportedMethods().isBlank()
                            ? "Supported: " + config.getSupportedMethods()
                            : null)
                    .build());
        }
        return ApiResponse.success(methods);
    }

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
