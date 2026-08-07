package com.addexstores.service.impl;

import com.addexstores.dto.request.CartItemRequest;
import com.addexstores.dto.response.CartResponse;
import com.addexstores.entity.Cart;
import com.addexstores.entity.CartItem;
import com.addexstores.entity.Product;
import com.addexstores.entity.User;
import com.addexstores.exception.ResourceNotFoundException;
import com.addexstores.mapper.CartMapper;
import com.addexstores.repository.CartItemRepository;
import com.addexstores.repository.CartRepository;
import com.addexstores.repository.ProductRepository;
import com.addexstores.repository.UserRepository;
import com.addexstores.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartMapper cartMapper;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return cartMapper.toCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addToCart(Long userId, CartItemRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.getProductId()));

        Cart cart = getOrCreateCart(userId);

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(request.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .price(product.getPrice())
                    .build();
            cart.getItems().add(newItem);
            cartRepository.save(cart);
        }

        log.info("Added product {} to cart for user {}", request.getProductId(), userId);
        return cartMapper.toCartResponse(cartRepository.findById(cart.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart", cart.getId())));
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(Long userId, Long itemId, CartItemRequest request) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new ResourceNotFoundException("CartItem", itemId);
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        log.info("Updated cart item {} quantity to {}", itemId, request.getQuantity());
        return cartMapper.toCartResponse(cart);
    }

    @Override
    @Transactional
    public void removeFromCart(Long userId, Long itemId) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new ResourceNotFoundException("CartItem", itemId);
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        log.info("Removed item {} from cart for user {}", itemId, userId);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
        log.info("Cart cleared for user {}", userId);
    }

    @Override
    @Transactional
    public CartResponse syncCart(Long userId, List<CartItemRequest> requests) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);

        for (CartItemRequest request : requests) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", request.getProductId()));

            CartItem item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .price(product.getPrice())
                    .build();

            cart.getItems().add(item);
        }

        cart = cartRepository.save(cart);
        log.info("Cart synced for user {} with {} items", userId, requests.size());
        return cartMapper.toCartResponse(cart);
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
                    Cart newCart = Cart.builder()
                            .user(user)
                            .items(new ArrayList<>())
                            .build();
                    return cartRepository.save(newCart);
                });
    }
}
