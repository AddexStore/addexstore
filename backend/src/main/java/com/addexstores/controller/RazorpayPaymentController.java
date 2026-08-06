package com.addexstores.controller;

import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.PaymentStatusResponse;
import com.addexstores.exception.BadRequestException;
import com.addexstores.security.CurrentUser;
import com.addexstores.service.impl.RazorpayPaymentServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments/razorpay")
@RequiredArgsConstructor
@Tag(name = "Razorpay Payments")
public class RazorpayPaymentController {

    private final RazorpayPaymentServiceImpl razorpayPaymentService;

    @PostMapping("/verify")
    @Operation(summary = "Verify Razorpay payment")
    public ApiResponse<PaymentStatusResponse> verifyPayment(
            @CurrentUser Long userId,
            @RequestBody Map<String, String> request) {
        String razorpayPaymentId = request.get("razorpay_payment_id");
        String razorpayOrderId = request.get("razorpay_order_id");
        String razorpaySignature = request.get("razorpay_signature");

        if (razorpayOrderId == null || razorpayOrderId.isBlank()) {
            throw new BadRequestException("razorpay_order_id is required");
        }

        PaymentStatusResponse response = razorpayPaymentService.retrievePayment(razorpayOrderId, userId);
        return ApiResponse.success(response);
    }
}
