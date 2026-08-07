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
public class PublicSettingsResponse {

    private String siteName;
    private String siteDescription;
    private String logo;
    private String favicon;
    private String currency;
    private String currencySymbol;
    private BigDecimal taxRate;
    private BigDecimal shippingCost;
    private BigDecimal freeShippingThreshold;
}
