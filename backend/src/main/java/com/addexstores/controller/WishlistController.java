package com.addexstores.controller;

import com.addexstores.dto.request.WishlistRequest;
import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.ProductResponse;
import com.addexstores.security.CurrentUser;
import com.addexstores.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    @Operation(summary = "Get user wishlist")
    public ApiResponse<List<ProductResponse>> getUserWishlist(@CurrentUser Long userId) {
        return ApiResponse.success(wishlistService.getUserWishlist(userId));
    }

    @PostMapping
    @Operation(summary = "Add product to wishlist")
    public ApiResponse<String> addToWishlist(@CurrentUser Long userId,
                                           @Valid @RequestBody WishlistRequest request) {
        wishlistService.addToWishlist(userId, request.getProductId());
        return ApiResponse.success("Product added to wishlist");
    }

    @DeleteMapping("/{productId}")
    @Operation(summary = "Remove product from wishlist")
    public ApiResponse<String> removeFromWishlist(@CurrentUser Long userId,
                                                @PathVariable Long productId) {
        wishlistService.removeFromWishlist(userId, productId);
        return ApiResponse.success("Product removed from wishlist");
    }
}
