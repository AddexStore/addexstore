package com.addexstores.mapper;

import com.addexstores.dto.response.CategoryResponse;
import com.addexstores.dto.response.SubCategoryResponse;
import com.addexstores.entity.Category;
import com.addexstores.entity.SubCategory;
import com.addexstores.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CategoryMapper {

    private final FileUploadService fileUploadService;

    public CategoryResponse toCategoryResponse(Category category) {
        if (category == null) return null;
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .icon(fileUploadService.getFileUrl(category.getIcon()))
                .image(fileUploadService.getFileUrl(category.getImage()))
                .productCount(category.getProductCount())
                .active(category.isActive())
                .subCategories(category.getSubCategories() != null
                        ? category.getSubCategories().stream()
                            .map(this::toSubCategoryResponse)
                            .collect(Collectors.toList())
                        : Collections.emptyList())
                .build();
    }

    public SubCategoryResponse toSubCategoryResponse(SubCategory subCategory) {
        if (subCategory == null) return null;
        return SubCategoryResponse.builder()
                .id(subCategory.getId())
                .name(subCategory.getName())
                .slug(subCategory.getSlug())
                .productCount(subCategory.getProductCount())
                .icon(fileUploadService.getFileUrl(subCategory.getIcon()))
                .build();
    }

    public List<CategoryResponse> toCategoryResponseList(List<Category> categories) {
        if (categories == null) return Collections.emptyList();
        return categories.stream()
                .map(this::toCategoryResponse)
                .collect(Collectors.toList());
    }
}
