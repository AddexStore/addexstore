package com.addexstores.controller;

import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.PaymentResponse;
import com.addexstores.security.CurrentUser;
import com.addexstores.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments")
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get payment by order ID")
    public ApiResponse<PaymentResponse> getPaymentByOrderId(
            @CurrentUser Long userId,
            @PathVariable Long orderId) {
        return ApiResponse.success(paymentService.getPaymentByOrderId(orderId, userId));
    }
}
