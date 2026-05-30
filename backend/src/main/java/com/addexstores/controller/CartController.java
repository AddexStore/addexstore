package com.addexstores.controller;

import com.addexstores.dto.request.CartItemRequest;
import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.CartResponse;
import com.addexstores.security.CurrentUser;
import com.addexstores.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Cart")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get current user cart")
    public ApiResponse<CartResponse> getCart(@CurrentUser Long userId) {
        return ApiResponse.success(cartService.getCart(userId));
    }

    @PostMapping
    @Operation(summary = "Add item to cart")
    public ApiResponse<CartResponse> addToCart(@CurrentUser Long userId,
                                                @Valid @RequestBody CartItemRequest request) {
        return ApiResponse.success(cartService.addToCart(userId, request));
    }

    @PutMapping("/{itemId}")
    @Operation(summary = "Update cart item")
    public ApiResponse<CartResponse> updateCartItem(@CurrentUser Long userId,
                                                     @PathVariable Long itemId,
                                                     @Valid @RequestBody CartItemRequest request) {
        return ApiResponse.success(cartService.updateCartItem(userId, itemId, request));
    }

    @DeleteMapping("/{itemId}")
    @Operation(summary = "Remove item from cart")
    public ApiResponse<String> removeFromCart(@CurrentUser Long userId,
                                            @PathVariable Long itemId) {
        cartService.removeFromCart(userId, itemId);
        return ApiResponse.success("Item removed from cart");
    }

    @DeleteMapping
    @Operation(summary = "Clear cart")
    public ApiResponse<String> clearCart(@CurrentUser Long userId) {
        cartService.clearCart(userId);
        return ApiResponse.success("Cart cleared");
    }
}
