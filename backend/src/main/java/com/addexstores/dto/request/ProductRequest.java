package com.addexstores.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 200, message = "Product name must be at most 200 characters")
    private String name;

    @Size(max = 200, message = "Slug must be at most 200 characters")
    private String slug;

    @Size(max = 5000, message = "Description must be at most 5000 characters")
    private String description;

    @Size(max = 100, message = "Brand must be at most 100 characters")
    private String brand;

    @Size(max = 50, message = "SKU must be at most 50 characters")
    private String sku;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than zero")
    private BigDecimal price;

    @DecimalMin(value = "0.00", message = "Original price cannot be negative")
    private BigDecimal originalPrice;

    @Min(value = 0, message = "Discount percentage cannot be negative")
    @Max(value = 100, message = "Discount percentage cannot exceed 100")
    private Integer discountPercentage;

    @Min(value = 0, message = "Stock cannot be negative")
    private int stock;

    private boolean featured;

    private boolean trending;

    private boolean newArrival;

    private boolean onSale;

    private LocalDateTime saleEndDate;

    private Long categoryId;

    private Long subCategoryId;

    @Size(max = 10, message = "A product can have at most 10 images")
    private List<String> images;

    @Size(max = 50, message = "A product can have at most 50 variants")
    private List<ProductVariantRequest> variants;

    private Boolean active;
}
