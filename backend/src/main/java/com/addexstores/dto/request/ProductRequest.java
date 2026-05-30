package com.addexstores.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String slug;

    private String description;

    private String brand;

    private String sku;

    @NotNull
    private BigDecimal price;

    private BigDecimal originalPrice;

    private Integer discountPercentage;

    private int stock;

    private boolean featured;

    private boolean trending;

    private boolean newArrival;

    private boolean onSale;

    private LocalDateTime saleEndDate;

    private Long categoryId;

    private Long subCategoryId;

    private List<String> images;

    private List<ProductVariantRequest> variants;

    private boolean active;
}
