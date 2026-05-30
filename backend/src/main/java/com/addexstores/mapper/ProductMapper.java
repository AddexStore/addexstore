package com.addexstores.mapper;

import com.addexstores.dto.response.CategoryResponse;
import com.addexstores.dto.response.ProductResponse;
import com.addexstores.dto.response.SubCategoryResponse;
import com.addexstores.entity.Product;
import com.addexstores.entity.ProductImage;
import com.addexstores.entity.ProductVariant;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class ProductMapper {

    public static ProductResponse toProductResponse(Product product) {
        if (product == null) return null;

        Integer discount = null;
        if (product.getOriginalPrice() != null && product.getOriginalPrice().compareTo(BigDecimal.ZERO) > 0) {
            discount = product.getOriginalPrice()
                    .subtract(product.getPrice())
                    .multiply(BigDecimal.valueOf(100))
                    .divide(product.getOriginalPrice(), 0, RoundingMode.HALF_UP)
                    .intValue();
        }

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .brand(product.getBrand())
                .sku(product.getSku())
                .price(product.getPrice())
                .originalPrice(product.getOriginalPrice())
                .discountPercentage(discount)
                .stock(product.getStock())
                .rating(product.getRating())
                .totalReviews(product.getTotalReviews())
                .featured(product.isFeatured())
                .trending(product.isTrending())
                .isNewArrival(product.isNewArrival())
                .isOnSale(product.isOnSale())
                .saleEndDate(product.getSaleEndDate())
                .category(product.getCategory() != null
                        ? CategoryMapper.toCategoryResponse(product.getCategory())
                        : null)
                .subCategory(product.getSubCategory() != null
                        ? SubCategoryResponse.builder()
                            .id(product.getSubCategory().getId())
                            .name(product.getSubCategory().getName())
                            .slug(product.getSubCategory().getSlug())
                            .productCount(product.getSubCategory().getProductCount())
                            .build()
                        : null)
                .images(product.getImages() != null
                        ? product.getImages().stream()
                            .map(ProductMapper::toImageResponse)
                            .collect(Collectors.toList())
                        : Collections.emptyList())
                .variants(product.getVariants() != null
                        ? product.getVariants().stream()
                            .map(ProductMapper::toVariantResponse)
                            .collect(Collectors.toList())
                        : Collections.emptyList())
                .createdAt(product.getCreatedAt())
                .build();
    }

    public static ProductResponse.ImageResponse toImageResponse(ProductImage image) {
        if (image == null) return null;
        return ProductResponse.ImageResponse.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .isPrimary(image.isPrimary())
                .sortOrder(image.getSortOrder())
                .build();
    }

    public static ProductResponse.VariantResponse toVariantResponse(ProductVariant variant) {
        if (variant == null) return null;
        return ProductResponse.VariantResponse.builder()
                .id(variant.getId())
                .size(variant.getSize())
                .color(variant.getColor())
                .stock(variant.getStock())
                .priceOverride(variant.getPriceOverride())
                .sku(variant.getSku())
                .build();
    }

    public static List<ProductResponse> toProductResponseList(List<Product> products) {
        if (products == null) return Collections.emptyList();
        return products.stream()
                .map(ProductMapper::toProductResponse)
                .collect(Collectors.toList());
    }
}
