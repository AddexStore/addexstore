package com.addexstores.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductVariantRequest {

    private Long id;

    @Size(max = 20, message = "Variant size must be at most 20 characters")
    private String size;

    @Size(max = 50, message = "Variant color must be at most 50 characters")
    private String color;

    @Min(value = 0, message = "Variant stock cannot be negative")
    private int stock;

    @DecimalMin(value = "0.00", message = "Variant price cannot be negative")
    private BigDecimal priceOverride;

    @Size(max = 50, message = "Variant SKU must be at most 50 characters")
    private String sku;
}
