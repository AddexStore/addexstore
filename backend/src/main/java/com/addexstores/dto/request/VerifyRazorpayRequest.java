package com.addexstores.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyRazorpayRequest {
    @NotBlank
    private String razorpayOrderId;
    @NotBlank
    private String razorpayPaymentId;
    @NotBlank
    private String razorpaySignature;
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
