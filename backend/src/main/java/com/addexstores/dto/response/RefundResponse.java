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
public class RefundResponse {
    private Long id;
    private Long paymentId;
    private String refundId;
    private BigDecimal amount;
    private String reason;
    private String status;
    private LocalDateTime createdAt;
}
