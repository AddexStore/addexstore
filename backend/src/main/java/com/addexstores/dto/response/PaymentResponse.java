package com.addexstores.dto.response;

import com.addexstores.enums.PaymentMethod;
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
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private String orderNumber;
    private BigDecimal amount;
    private String currency;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
    private String gatewayOrderId;
    private String gatewayPaymentId;
    private String approvalUrl;
    private LocalDateTime createdAt;
}
