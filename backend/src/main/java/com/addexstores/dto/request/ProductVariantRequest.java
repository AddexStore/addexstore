package com.addexstores.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductVariantRequest {
    private String size;
    private String color;
    private int stock;
    private BigDecimal priceOverride;
    private String sku;
}
