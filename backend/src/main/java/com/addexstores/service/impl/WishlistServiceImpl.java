package com.addexstores.service.impl;

import com.addexstores.dto.response.ProductResponse;
import com.addexstores.entity.Product;
import com.addexstores.entity.User;
import com.addexstores.entity.Wishlist;
import com.addexstores.exception.BadRequestException;
import com.addexstores.exception.ResourceNotFoundException;
import com.addexstores.mapper.ProductMapper;
import com.addexstores.repository.ProductRepository;
import com.addexstores.repository.UserRepository;
import com.addexstores.repository.WishlistRepository;
import com.addexstores.service.WishlistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    public List<ProductResponse> getUserWishlist(Long userId) {
        List<Wishlist> wishlistItems = wishlistRepository.findByUserId(userId);
        return wishlistItems.stream()
                .map(item -> ProductMapper.toProductResponse(item.getProduct()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void addToWishlist(Long userId, Long productId) {
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new BadRequestException("Product is already in your wishlist");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .product(product)
                .build();

        wishlistRepository.save(wishlist);
        log.info("Added product {} to wishlist for user {}", productId, userId);
    }

    @Override
    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        Wishlist wishlist = wishlistRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist item not found"));

        wishlistRepository.delete(wishlist);
        log.info("Removed product {} from wishlist for user {}", productId, userId);
    }
}
