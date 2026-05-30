package com.addexstores.controller.admin;

import com.addexstores.dto.request.CategoryRequest;
import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.CategoryResponse;
import com.addexstores.dto.response.SubCategoryResponse;
import com.addexstores.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
@Tag(name = "Admin Categories")
public class AdminCategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @Operation(summary = "Create new category")
    public ApiResponse<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ApiResponse.success(categoryService.createCategory(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update category")
    public ApiResponse<CategoryResponse> updateCategory(@PathVariable Long id,
                                                         @Valid @RequestBody CategoryRequest request) {
        return ApiResponse.success(categoryService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete category")
    public ApiResponse<String> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ApiResponse.success("Category deleted successfully");
    }

    @PostMapping("/{categoryId}/subcategories")
    @Operation(summary = "Add subcategory to category")
    public ApiResponse<SubCategoryResponse> addSubCategory(@PathVariable Long categoryId,
                                                          @RequestBody Map<String, String> body) {
        return ApiResponse.success(categoryService.addSubCategory(categoryId, body.get("name")));
    }

    @DeleteMapping("/subcategories/{subCategoryId}")
    @Operation(summary = "Delete subcategory")
    public ApiResponse<String> deleteSubCategory(@PathVariable Long subCategoryId) {
        categoryService.deleteSubCategory(subCategoryId);
        return ApiResponse.success("Subcategory deleted successfully");
    }
}
