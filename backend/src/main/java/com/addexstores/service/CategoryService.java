package com.addexstores.service;

import com.addexstores.dto.request.CategoryRequest;
import com.addexstores.dto.request.SubCategoryRequest;
import com.addexstores.dto.response.CategoryResponse;
import com.addexstores.dto.response.SubCategoryResponse;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface CategoryService {

    @Transactional(readOnly = true)
    List<CategoryResponse> getAllCategories();

    @Transactional(readOnly = true)
    CategoryResponse getCategoryBySlug(String slug);

    @Transactional
    CategoryResponse createCategory(CategoryRequest request);

    @Transactional
    CategoryResponse updateCategory(Long id, CategoryRequest request);

    @Transactional
    void deleteCategory(Long id);

    @Transactional
    SubCategoryResponse addSubCategory(Long categoryId, SubCategoryRequest request);

    @Transactional
    SubCategoryResponse updateSubCategory(Long subCategoryId, SubCategoryRequest request);

    @Transactional
    void deleteSubCategory(Long subCategoryId);
}
