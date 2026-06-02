package com.addexstores.dto.response;

import com.addexstores.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatusResponse {
    private Long paymentId;
    private String stripePaymentIntentId;
    private PaymentStatus status;
    private BigDecimal amount;
    private String currency;
    private Long orderId;
    private String orderNumber;
    private String customerEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
