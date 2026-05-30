package com.addexstores.mapper;

import com.addexstores.dto.response.CategoryResponse;
import com.addexstores.dto.response.SubCategoryResponse;
import com.addexstores.entity.Category;
import com.addexstores.entity.SubCategory;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class CategoryMapper {

    public static CategoryResponse toCategoryResponse(Category category) {
        if (category == null) return null;
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .icon(category.getIcon())
                .image(category.getImage())
                .productCount(category.getProductCount())
                .subCategories(category.getSubCategories() != null
                        ? category.getSubCategories().stream()
                            .map(CategoryMapper::toSubCategoryResponse)
                            .collect(Collectors.toList())
                        : Collections.emptyList())
                .build();
    }

    public static SubCategoryResponse toSubCategoryResponse(SubCategory subCategory) {
        if (subCategory == null) return null;
        return SubCategoryResponse.builder()
                .id(subCategory.getId())
                .name(subCategory.getName())
                .slug(subCategory.getSlug())
                .productCount(subCategory.getProductCount())
                .build();
    }

    public static List<CategoryResponse> toCategoryResponseList(List<Category> categories) {
        if (categories == null) return Collections.emptyList();
        return categories.stream()
                .map(CategoryMapper::toCategoryResponse)
                .collect(Collectors.toList());
    }
}
