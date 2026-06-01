package com.addexstores.service;

import com.addexstores.dto.request.CartItemRequest;
import com.addexstores.dto.response.CartResponse;
import java.util.List;

public interface CartService {

    CartResponse getCart(Long userId);

    CartResponse addToCart(Long userId, CartItemRequest request);

    CartResponse updateCartItem(Long userId, Long itemId, CartItemRequest request);

    void removeFromCart(Long userId, Long itemId);

    void clearCart(Long userId);

    CartResponse syncCart(Long userId, List<CartItemRequest> requests);
}
