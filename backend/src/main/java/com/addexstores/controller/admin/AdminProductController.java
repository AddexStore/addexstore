package com.addexstores.controller.admin;

import com.addexstores.dto.request.ProductPatchRequest;
import com.addexstores.dto.request.ProductRequest;
import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.PagedResponse;
import com.addexstores.dto.response.ProductResponse;
import com.addexstores.service.FileUploadService;
import com.addexstores.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Validated
@Tag(name = "Admin Products")
public class AdminProductController {

    private final ProductService productService;
    private final FileUploadService fileUploadService;

    @GetMapping
    @Operation(summary = "Get all products (including inactive) with filtering and pagination")
    public PagedResponse<ProductResponse> getAllProducts(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(required = false) Long category,
            @RequestParam(required = false) Long subcategory,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String stockStatus,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) Boolean trending,
            @RequestParam(required = false) Boolean newArrival,
            @RequestParam(required = false) Boolean onSale,
            @RequestParam(required = false) String search) {
        return productService.getAllProducts(page, size, sort, category, subcategory, brand,
                minPrice, maxPrice, stockStatus, featured, trending, newArrival, onSale, search, true);
    }

    @PostMapping
    @Operation(summary = "Create new product")
    public ApiResponse<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        return ApiResponse.success(productService.createProduct(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update product")
    public ApiResponse<ProductResponse> updateProduct(@PathVariable Long id,
                                                       @RequestBody ProductRequest request) {
        return ApiResponse.success(productService.updateProduct(id, request));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Partially update product fields (flags, stock, price, active)")
    public ApiResponse<ProductResponse> patchProduct(@PathVariable Long id,
                                                     @RequestBody ProductPatchRequest request) {
        return ApiResponse.success(productService.patchProduct(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete product")
    public ApiResponse<String> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ApiResponse.success("Product deleted successfully");
    }

    @PostMapping("/upload-image")
    @Operation(summary = "Upload product image")
    public ApiResponse<String> uploadImage(@RequestParam("file") MultipartFile file) {
        return ApiResponse.success(fileUploadService.uploadFile(file, "products"));
    }

    @DeleteMapping("/image")
    @Operation(summary = "Delete product image")
    public ApiResponse<String> deleteImage(@RequestParam String imageUrl) {
        fileUploadService.deleteFile(imageUrl);
        return ApiResponse.success("Image deleted successfully");
    }
}
