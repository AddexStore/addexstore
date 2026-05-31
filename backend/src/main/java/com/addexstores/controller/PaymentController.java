package com.addexstores.controller;

import com.addexstores.dto.request.*;
import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.OrderResponse;
import com.addexstores.dto.response.PaymentResponse;
import com.addexstores.security.CurrentUser;
import com.addexstores.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/paypal/create")
    @Operation(summary = "Create PayPal order")
    public ApiResponse<PaymentResponse> createPayPalOrder(@CurrentUser Long userId,
                                                           @Valid @RequestBody CreatePayPalOrderRequest request) {
        return ApiResponse.success(paymentService.createPayPalOrder(userId, request));
    }

    @PostMapping("/paypal/capture")
    @Operation(summary = "Capture PayPal payment and create order")
    public ApiResponse<PaymentResponse> capturePayPalOrder(@CurrentUser Long userId,
                                                            @Valid @RequestBody CapturePayPalRequest request) {
        return ApiResponse.success(paymentService.capturePayPalOrder(userId, request));
    }

    @PostMapping("/razorpay/create")
    @Operation(summary = "Create Razorpay order")
    public ApiResponse<PaymentResponse> createRazorpayOrder(@CurrentUser Long userId,
                                                             @Valid @RequestBody CreateRazorpayOrderRequest request) {
        return ApiResponse.success(paymentService.createRazorpayOrder(userId, request));
    }

    @PostMapping("/razorpay/verify")
    @Operation(summary = "Verify Razorpay payment and create order")
    public ApiResponse<PaymentResponse> verifyRazorpayPayment(@CurrentUser Long userId,
                                                               @Valid @RequestBody VerifyRazorpayRequest request) {
        return ApiResponse.success(paymentService.verifyRazorpayPayment(userId, request));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get payment by order ID")
    public ApiResponse<PaymentResponse> getPaymentByOrderId(@PathVariable Long orderId) {
        return ApiResponse.success(paymentService.getPaymentByOrderId(orderId));
    }
}
