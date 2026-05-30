package com.addexstores.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentOrderResponse {
    private Long id;
    private String orderNumber;
    private String customerName;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime createdAt;
}
