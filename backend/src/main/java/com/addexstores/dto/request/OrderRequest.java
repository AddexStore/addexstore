package com.addexstores.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrderRequest {

    @NotBlank
    private String shippingAddress;

    @NotBlank
    private String paymentMethod;

    private String notes;
}
