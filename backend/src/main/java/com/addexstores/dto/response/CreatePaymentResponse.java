package com.addexstores.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentResponse {

    private String clientSecret;
    private String paymentIntentId;
    private Long paymentId;
    private Long orderId;
    private String orderNumber;
    private String currency;
    private Long amount;
    private String status;
}
