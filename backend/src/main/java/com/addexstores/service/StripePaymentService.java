package com.addexstores.service;

import com.addexstores.dto.request.CreatePaymentRequest;
import com.addexstores.dto.request.RefundPaymentRequest;
import com.addexstores.dto.response.CreatePaymentResponse;
import com.addexstores.dto.response.CreateStripePaymentIntentResponse;
import com.addexstores.dto.response.PaymentStatusResponse;
import com.addexstores.dto.response.RefundResponse;
import com.addexstores.entity.Payment;
import com.stripe.model.Event;

public interface StripePaymentService {

    CreateStripePaymentIntentResponse createPaymentIntent(Long userId, Long orderId, String currency);

    CreatePaymentResponse createOrderAndPaymentIntent(Long userId, CreatePaymentRequest request);

    PaymentStatusResponse retrievePayment(String stripePaymentIntentId);

    PaymentStatusResponse retrievePaymentByOrderId(Long orderId);

    void cancelPayment(String stripePaymentIntentId, Long userId);

    RefundResponse refundPayment(Long adminId, RefundPaymentRequest request);

    Event verifyWebhook(String payload, String signatureHeader);

    Payment processWebhookEvent(Event event);
}
