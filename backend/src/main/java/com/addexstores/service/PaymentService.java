package com.addexstores.service;

import com.addexstores.dto.request.CapturePayPalRequest;
import com.addexstores.dto.request.CreatePayPalOrderRequest;
import com.addexstores.dto.request.CreateRazorpayOrderRequest;
import com.addexstores.dto.request.VerifyRazorpayRequest;
import com.addexstores.dto.response.PaymentResponse;

public interface PaymentService {

    PaymentResponse createPayPalOrder(Long userId, CreatePayPalOrderRequest request);

    PaymentResponse capturePayPalOrder(Long userId, CapturePayPalRequest request);

    PaymentResponse createRazorpayOrder(Long userId, CreateRazorpayOrderRequest request);

    PaymentResponse verifyRazorpayPayment(Long userId, VerifyRazorpayRequest request);

    PaymentResponse getPaymentByOrderId(Long orderId);
}
