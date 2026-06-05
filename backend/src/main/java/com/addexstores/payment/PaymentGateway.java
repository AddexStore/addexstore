package com.addexstores.payment;

import com.addexstores.dto.request.CreatePaymentRequest;
import com.addexstores.dto.request.RefundPaymentRequest;
import com.addexstores.dto.response.CreatePaymentResponse;
import com.addexstores.dto.response.PaymentStatusResponse;
import com.addexstores.dto.response.RefundResponse;

public interface PaymentGateway {

    CreatePaymentResponse createOrderAndPaymentIntent(Long userId, CreatePaymentRequest request);

    PaymentStatusResponse retrievePayment(String gatewayTransactionId);

    PaymentStatusResponse retrievePaymentByOrderId(Long orderId);

    void cancelPayment(String gatewayTransactionId, Long userId);

    RefundResponse refundPayment(Long adminId, RefundPaymentRequest request);

    String getGatewayName();
}
