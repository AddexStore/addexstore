package com.addexstores.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutQuoteResponse {

    private String currency;
    private String currencySymbol;
    private BigDecimal conversionRate;
    private BigDecimal subtotal;
    private BigDecimal subtotalInUsd;
    private BigDecimal taxRate;
    private String taxName;
    private BigDecimal tax;
    private BigDecimal shippingCost;
    private String shippingName;
    private boolean freeShipping;
    private BigDecimal total;
    private BigDecimal totalInUsd;
    private List<QuoteItemDetail> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuoteItemDetail {
        private Long productId;
        private String productName;
        private String productImage;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }
}
