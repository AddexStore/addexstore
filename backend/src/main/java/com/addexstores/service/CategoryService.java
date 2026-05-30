package com.addexstores.service;

import com.addexstores.dto.request.CategoryRequest;
import com.addexstores.dto.response.CategoryResponse;
import com.addexstores.dto.response.SubCategoryResponse;

import java.util.List;

public interface CategoryService {

    List<CategoryResponse> getAllCategories();

    CategoryResponse getCategoryBySlug(String slug);

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    void deleteCategory(Long id);

    SubCategoryResponse addSubCategory(Long categoryId, String name);

    void deleteSubCategory(Long subCategoryId);
}
