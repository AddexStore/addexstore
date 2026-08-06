package com.addexstores.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateStripePaymentIntentRequest {

    @NotNull
    private Long orderId;

    @Size(min = 3, max = 3)
    @NotBlank
    private String currency;
}
