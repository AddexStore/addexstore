package com.addexstores.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CapturePayPalRequest {
    @NotBlank
    private String paypalOrderId;
    @NotBlank
    private String street;
    @NotBlank
    private String city;
    @NotBlank
    private String state;
    @NotBlank
    private String zipCode;
    @NotBlank
    private String country;
    private String notes;
}
