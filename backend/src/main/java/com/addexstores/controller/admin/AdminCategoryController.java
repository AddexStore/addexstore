package com.addexstores.controller.admin;

import com.addexstores.dto.request.CategoryRequest;
import com.addexstores.dto.request.SubCategoryRequest;
import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.CategoryResponse;
import com.addexstores.dto.response.SubCategoryResponse;
import com.addexstores.service.CategoryService;
import com.addexstores.service.FileUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Categories")
public class AdminCategoryController {

    private final CategoryService categoryService;
    private final FileUploadService fileUploadService;

    @GetMapping
    @Operation(summary = "Get all categories including inactive")
    public ApiResponse<List<CategoryResponse>> getAllAdminCategories() {
        return ApiResponse.success(categoryService.getAllAdminCategories());
    }

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
                                                           @Valid @RequestBody SubCategoryRequest request) {
        return ApiResponse.success(categoryService.addSubCategory(categoryId, request));
    }

    @PutMapping("/subcategories/{subCategoryId}")
    @Operation(summary = "Update subcategory")
    public ApiResponse<SubCategoryResponse> updateSubCategory(@PathVariable Long subCategoryId,
                                                               @Valid @RequestBody SubCategoryRequest request) {
        return ApiResponse.success(categoryService.updateSubCategory(subCategoryId, request));
    }

    @DeleteMapping("/subcategories/{subCategoryId}")
    @Operation(summary = "Delete subcategory")
    public ApiResponse<String> deleteSubCategory(@PathVariable Long subCategoryId) {
        categoryService.deleteSubCategory(subCategoryId);
        return ApiResponse.success("Subcategory deleted successfully");
    }

    @PostMapping("/upload-icon")
    @Operation(summary = "Upload category icon image and return its path")
    public ApiResponse<String> uploadIcon(@RequestParam("file") MultipartFile file) {
        return ApiResponse.success(fileUploadService.uploadFile(file, "categories"));
    }

    @PostMapping("/{categoryId}/upload-icon")
    @Operation(summary = "Upload and set category icon")
    public ApiResponse<CategoryResponse> uploadCategoryIcon(@PathVariable Long categoryId,
                                                             @RequestParam("file") MultipartFile file) {
        String path = fileUploadService.uploadFile(file, "categories");
        CategoryRequest request = new CategoryRequest();
        request.setIcon(path);
        return ApiResponse.success(categoryService.updateCategory(categoryId, request));
    }

    @PostMapping("/subcategories/{subCategoryId}/upload-icon")
    @Operation(summary = "Upload and set subcategory icon")
    public ApiResponse<SubCategoryResponse> uploadSubCategoryIcon(@PathVariable Long subCategoryId,
                                                                   @RequestParam("file") MultipartFile file) {
        String path = fileUploadService.uploadFile(file, "categories");
        SubCategoryRequest request = new SubCategoryRequest();
        request.setIcon(path);
        return ApiResponse.success(categoryService.updateSubCategory(subCategoryId, request));
    }
}
