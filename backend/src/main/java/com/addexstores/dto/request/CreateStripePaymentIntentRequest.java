package com.addexstores.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateStripePaymentIntentRequest {

    @NotNull
    private Long orderId;

    @NotBlank
    private String currency;

    @NotNull
    @Positive
    private BigDecimal amount;
}
