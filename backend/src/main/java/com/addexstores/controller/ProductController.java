package com.addexstores.controller;

import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.PagedResponse;
import com.addexstores.dto.response.ProductResponse;
import com.addexstores.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get all products with filtering and pagination")
    public PagedResponse<ProductResponse> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(required = false) Long category,
            @RequestParam(required = false) Long subcategory,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) Boolean trending,
            @RequestParam(required = false) Boolean newArrival,
            @RequestParam(required = false) Boolean onSale,
            @RequestParam(required = false) String search) {
        return productService.getAllProducts(page, size, sort, category, subcategory, brand,
                minPrice, maxPrice, featured, trending, newArrival, onSale, search);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID")
    public ApiResponse<ProductResponse> getProductById(@PathVariable Long id) {
        return ApiResponse.success(productService.getProductById(id));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get product by slug")
    public ApiResponse<ProductResponse> getProductBySlug(@PathVariable String slug) {
        return ApiResponse.success(productService.getProductBySlug(slug));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured products")
    public PagedResponse<ProductResponse> getFeaturedProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return productService.getFeaturedProducts(page, size);
    }

    @GetMapping("/trending")
    @Operation(summary = "Get trending products")
    public PagedResponse<ProductResponse> getTrendingProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return productService.getTrendingProducts(page, size);
    }

    @GetMapping("/new-arrivals")
    @Operation(summary = "Get new arrivals")
    public PagedResponse<ProductResponse> getNewArrivals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return productService.getNewArrivals(page, size);
    }

    @GetMapping("/sales")
    @Operation(summary = "Get products on sale")
    public PagedResponse<ProductResponse> getOnSaleProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return productService.getOnSaleProducts(page, size);
    }
}
