package com.addexstores.mapper;

import com.addexstores.dto.response.ProductResponse;
import com.addexstores.dto.response.SubCategoryResponse;
import com.addexstores.entity.Product;
import com.addexstores.entity.ProductImage;
import com.addexstores.entity.ProductVariant;
import com.addexstores.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProductMapper {

    private final CategoryMapper categoryMapper;
    private final FileUploadService fileUploadService;

    public ProductResponse toProductResponse(Product product) {
        if (product == null) return null;

        Integer discount = product.getDiscountPercentage();
        if (discount == null
                && product.getOriginalPrice() != null
                && product.getOriginalPrice().compareTo(BigDecimal.ZERO) > 0
                && product.getPrice() != null) {
            discount = product.getOriginalPrice()
                    .subtract(product.getPrice())
                    .multiply(BigDecimal.valueOf(100))
                    .divide(product.getOriginalPrice(), 0, RoundingMode.HALF_UP)
                    .intValue();
            if (discount < 0) {
                discount = 0;
            }
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
                .active(product.isActive())
                .category(product.getCategory() != null
                        ? categoryMapper.toCategoryResponse(product.getCategory())
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
                            .map(this::toImageResponse)
                            .collect(Collectors.toList())
                        : Collections.emptyList())
                .variants(product.getVariants() != null
                        ? product.getVariants().stream()
                            .map(this::toVariantResponse)
                            .collect(Collectors.toList())
                        : Collections.emptyList())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    public ProductResponse.ImageResponse toImageResponse(ProductImage image) {
        if (image == null) return null;
        return ProductResponse.ImageResponse.builder()
                .id(image.getId())
                .imageUrl(fileUploadService.getFileUrl(image.getImageUrl()))
                .isPrimary(image.isPrimary())
                .sortOrder(image.getSortOrder())
                .build();
    }

    public ProductResponse.VariantResponse toVariantResponse(ProductVariant variant) {
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

    public List<ProductResponse> toProductResponseList(List<Product> products) {
        if (products == null) return Collections.emptyList();
        return products.stream()
                .map(this::toProductResponse)
                .collect(Collectors.toList());
    }
}
