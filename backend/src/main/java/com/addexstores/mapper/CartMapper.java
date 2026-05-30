package com.addexstores.mapper;

import com.addexstores.dto.response.CartItemResponse;
import com.addexstores.dto.response.CartResponse;
import com.addexstores.entity.Cart;
import com.addexstores.entity.CartItem;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class CartMapper {

    public static CartResponse toCartResponse(Cart cart) {
        if (cart == null) return null;

        List<CartItemResponse> itemResponses = cart.getItems() != null
                ? cart.getItems().stream()
                    .map(CartMapper::toCartItemResponse)
                    .collect(Collectors.toList())
                : Collections.emptyList();

        int totalItems = itemResponses.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        BigDecimal totalPrice = itemResponses.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .items(itemResponses)
                .totalItems(totalItems)
                .totalPrice(totalPrice)
                .build();
    }

    public static CartItemResponse toCartItemResponse(CartItem item) {
        if (item == null) return null;

        String image = null;
        if (item.getProduct().getImages() != null && !item.getProduct().getImages().isEmpty()) {
            image = item.getProduct().getImages().stream()
                    .filter(img -> img.isPrimary())
                    .findFirst()
                    .map(img -> img.getImageUrl())
                    .orElse(item.getProduct().getImages().get(0).getImageUrl());
        }

        return CartItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productSlug(item.getProduct().getSlug())
                .productImage(image)
                .price(item.getPrice())
                .quantity(item.getQuantity())
                .subtotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .build();
    }
}
