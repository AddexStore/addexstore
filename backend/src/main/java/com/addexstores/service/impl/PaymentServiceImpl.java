package com.addexstores.service.impl;

import com.addexstores.dto.response.PaymentResponse;
import com.addexstores.entity.Payment;
import com.addexstores.exception.ResourceNotFoundException;
import com.addexstores.repository.PaymentRepository;
import com.addexstores.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;

    @Override
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", String.valueOf(orderId)));
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder() != null ? payment.getOrder().getId() : null)
                .orderNumber(payment.getOrder() != null ? payment.getOrder().getOrderNumber() : null)
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .gatewayOrderId(payment.getGatewayOrderId())
                .gatewayPaymentId(payment.getGatewayPaymentId())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}