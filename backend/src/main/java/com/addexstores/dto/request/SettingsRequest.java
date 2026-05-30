package com.addexstores.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
public class SettingsRequest {
    private String siteName;
    private String siteDescription;
    private String logo;
    private String favicon;
    private String email;
    private String phone;
    private String address;
    private String currency;
    private BigDecimal shippingCost;
    private BigDecimal freeShippingThreshold;
    private BigDecimal taxRate;
    private Map<String, String> socialLinks;
}
