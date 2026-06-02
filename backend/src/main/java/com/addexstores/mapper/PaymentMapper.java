package com.addexstores.mapper;

import com.addexstores.dto.response.AdminPaymentResponse;
import com.addexstores.dto.response.PaymentStatusResponse;
import com.addexstores.dto.response.PaymentTransactionResponse;
import com.addexstores.dto.response.RefundResponse;
import com.addexstores.entity.Payment;
import com.addexstores.entity.PaymentTransaction;
import com.addexstores.entity.Refund;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class PaymentMapper {

    public static PaymentStatusResponse toStatusResponse(Payment payment) {
        if (payment == null) return null;
        return PaymentStatusResponse.builder()
                .paymentId(payment.getId())
                .stripePaymentIntentId(payment.getStripePaymentIntentId())
                .status(payment.getStatus())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .orderId(payment.getOrder() != null ? payment.getOrder().getId() : null)
                .orderNumber(payment.getOrder() != null ? payment.getOrder().getOrderNumber() : null)
                .customerEmail(payment.getCustomerEmail())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }

    public static AdminPaymentResponse toAdminResponse(Payment payment) {
        if (payment == null) return null;
        return AdminPaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder() != null ? payment.getOrder().getId() : null)
                .orderNumber(payment.getOrder() != null ? payment.getOrder().getOrderNumber() : null)
                .userId(payment.getUserId())
                .customerEmail(payment.getCustomerEmail())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .stripePaymentIntentId(payment.getStripePaymentIntentId())
                .gatewayOrderId(payment.getGatewayOrderId())
                .gatewayPaymentId(payment.getGatewayPaymentId())
                .baseAmount(payment.getBaseAmount())
                .convertedAmount(payment.getConvertedAmount())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }

    public static AdminPaymentResponse toAdminResponse(Payment payment,
                                                        List<PaymentTransaction> transactions,
                                                        List<Refund> refunds) {
        AdminPaymentResponse resp = toAdminResponse(payment);
        if (resp != null) {
            resp.setTransactions(transactions != null
                    ? transactions.stream().map(PaymentMapper::toTransactionResponse).collect(Collectors.toList())
                    : Collections.emptyList());
            resp.setRefunds(refunds != null
                    ? refunds.stream().map(PaymentMapper::toRefundResponse).collect(Collectors.toList())
                    : Collections.emptyList());
        }
        return resp;
    }

    public static PaymentTransactionResponse toTransactionResponse(PaymentTransaction tx) {
        if (tx == null) return null;
        return PaymentTransactionResponse.builder()
                .id(tx.getId())
                .paymentId(tx.getPayment().getId())
                .transactionId(tx.getTransactionId())
                .gateway(tx.getGateway())
                .currency(tx.getCurrency())
                .amount(tx.getAmount())
                .status(tx.getStatus())
                .responsePayload(tx.getResponsePayload())
                .createdAt(tx.getCreatedAt())
                .build();
    }

    public static RefundResponse toRefundResponse(Refund refund) {
        if (refund == null) return null;
        return RefundResponse.builder()
                .id(refund.getId())
                .paymentId(refund.getPayment().getId())
                .refundId(refund.getRefundId())
                .amount(refund.getAmount())
                .reason(refund.getReason())
                .status(refund.getStatus())
                .createdAt(refund.getCreatedAt())
                .build();
    }
}
