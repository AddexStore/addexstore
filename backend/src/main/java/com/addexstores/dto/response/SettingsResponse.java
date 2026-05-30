package com.addexstores.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettingsResponse {

    private Long id;
    private String siteName;
    private String siteDescription;
    private String logo;
    private String favicon;
    private String email;
    private String phone;
    private String address;
    private String currency;
    private BigDecimal taxRate;
    private BigDecimal shippingCost;
    private BigDecimal freeShippingThreshold;
    private String socialLinks;
}
