package com.addexstores.service;

import com.addexstores.dto.response.PaymentResponse;

public interface PaymentService {

    PaymentResponse getPaymentByOrderId(Long orderId);
}
