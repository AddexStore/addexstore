package com.addexstores.service;

import com.addexstores.dto.response.ProductResponse;

import java.util.List;

public interface WishlistService {

    List<ProductResponse> getUserWishlist(Long userId);

    void addToWishlist(Long userId, Long productId);

    void removeFromWishlist(Long userId, Long productId);
}
