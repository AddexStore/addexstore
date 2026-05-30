package com.addexstores.controller.admin;

import com.addexstores.dto.request.ProductRequest;
import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.ProductResponse;
import com.addexstores.service.FileUploadService;
import com.addexstores.service.ProductService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@Tag(name = "Admin Products")
public class AdminProductController {

    private final ProductService productService;
    private final FileUploadService fileUploadService;

    @PostMapping
    @Operation(summary = "Create new product")
    public ApiResponse<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        return ApiResponse.success(productService.createProduct(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update product")
    public ApiResponse<ProductResponse> updateProduct(@PathVariable Long id,
                                                       @Valid @RequestBody ProductRequest request) {
        return ApiResponse.success(productService.updateProduct(id, request));
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
