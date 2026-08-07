package com.addexstores.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private String brand;
    private String sku;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Integer discountPercentage;
    private int stock;
    private double rating;
    private int totalReviews;
    private boolean featured;
    private boolean trending;
    @JsonProperty("isNewArrival")
    private boolean isNewArrival;
    @JsonProperty("isOnSale")
    private boolean isOnSale;
    private LocalDateTime saleEndDate;
    private CategoryResponse category;
    private SubCategoryResponse subCategory;
    private List<ImageResponse> images;
    private List<VariantResponse> variants;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean active;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImageResponse {
        private Long id;
        private String imageUrl;
        @JsonProperty("isPrimary")
        private boolean isPrimary;
        private int sortOrder;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VariantResponse {
        private Long id;
        private String size;
        private String color;
        private int stock;
        private BigDecimal priceOverride;
        private String sku;
    }
}
