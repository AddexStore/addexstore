package com.addexstores.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
public class SettingsRequest {
    @Size(min = 1, max = 255)
    private String siteName;
    @Size(max = 5000)
    private String siteDescription;
    @Size(max = 1000)
    private String logo;
    @Size(max = 1000)
    private String favicon;
    @Email
    @Size(max = 255)
    private String email;
    @Size(max = 50)
    private String phone;
    @Size(max = 2000)
    private String address;
    @Pattern(regexp = "^[A-Za-z]{3}$", message = "Currency must be a 3-letter ISO code")
    private String currency;
    @DecimalMin(value = "0.0")
    private BigDecimal shippingCost;
    @DecimalMin(value = "0.0")
    private BigDecimal freeShippingThreshold;
    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0")
    private BigDecimal taxRate;
    private Map<String, String> socialLinks;
}
