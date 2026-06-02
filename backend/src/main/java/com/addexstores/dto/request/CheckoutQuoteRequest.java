package com.addexstores.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutQuoteRequest {

    @NotBlank
    private String country;

    private String state;

    private String currency;

    private List<QuoteItem> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuoteItem {
        private Long productId;
        private int quantity;
        private java.math.BigDecimal price;
    }
}
