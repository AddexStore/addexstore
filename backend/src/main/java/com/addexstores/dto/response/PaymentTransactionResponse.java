package com.addexstores.dto.response;

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
public class PaymentTransactionResponse {
    private Long id;
    private Long paymentId;
    private String transactionId;
    private String gateway;
    private String currency;
    private BigDecimal amount;
    private String status;
    private String responsePayload;
    private LocalDateTime createdAt;
}
