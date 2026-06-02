package com.addexstores.dto.response;

import com.addexstores.enums.PaymentMethod;
import com.addexstores.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPaymentResponse {
    private Long id;
    private Long orderId;
    private String orderNumber;
    private Long userId;
    private String customerEmail;
    private String customerName;
    private BigDecimal amount;
    private String currency;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
    private String stripePaymentIntentId;
    private String gatewayOrderId;
    private String gatewayPaymentId;
    private BigDecimal baseAmount;
    private BigDecimal convertedAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PaymentTransactionResponse> transactions;
    private List<RefundResponse> refunds;
}
