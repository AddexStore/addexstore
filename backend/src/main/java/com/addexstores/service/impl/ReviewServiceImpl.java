package com.addexstores.service.impl;

import com.addexstores.dto.request.ReviewRequest;
import com.addexstores.dto.response.PagedResponse;
import com.addexstores.dto.response.ReviewResponse;
import com.addexstores.entity.Product;
import com.addexstores.entity.Review;
import com.addexstores.entity.User;
import com.addexstores.exception.BadRequestException;
import com.addexstores.exception.ResourceNotFoundException;
import com.addexstores.mapper.ReviewMapper;
import com.addexstores.repository.ProductRepository;
import com.addexstores.repository.ReviewRepository;
import com.addexstores.repository.UserRepository;
import com.addexstores.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    public PagedResponse<ReviewResponse> getProductReviews(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Review> reviews = reviewRepository.findByProductIdAndApprovedTrue(productId, pageable);

        List<ReviewResponse> content = ReviewMapper.toReviewResponseList(reviews.getContent());
        return PagedResponse.<ReviewResponse>builder()
                .content(content)
                .page(reviews.getNumber())
                .size(reviews.getSize())
                .totalElements(reviews.getTotalElements())
                .totalPages(reviews.getTotalPages())
                .last(reviews.isLast())
                .first(reviews.isFirst())
                .build();
    }

    @Override
    @Transactional
    public ReviewResponse createReview(Long userId, Long productId, ReviewRequest request) {
        if (reviewRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new BadRequestException("You have already reviewed this product");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .approved(false)
                .build();

        review = reviewRepository.save(review);
        log.info("Review created for product {} by user {}", productId, userId);
        return ReviewMapper.toReviewResponse(review);
    }

    @Override
    public PagedResponse<ReviewResponse> getAllReviews(int page, int size, Boolean approved) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Review> reviews;
        if (approved != null) {
            reviews = reviewRepository.findByApproved(approved, pageable);
        } else {
            reviews = reviewRepository.findAll(pageable);
        }

        List<ReviewResponse> content = ReviewMapper.toReviewResponseList(reviews.getContent());
        return PagedResponse.<ReviewResponse>builder()
                .content(content)
                .page(reviews.getNumber())
                .size(reviews.getSize())
                .totalElements(reviews.getTotalElements())
                .totalPages(reviews.getTotalPages())
                .last(reviews.isLast())
                .first(reviews.isFirst())
                .build();
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void approveReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", id));

        review.setApproved(true);
        reviewRepository.save(review);

        recalculateProductRating(review.getProduct().getId());
        log.info("Review {} approved", id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void deleteReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", id));

        Long productId = review.getProduct().getId();
        reviewRepository.delete(review);

        recalculateProductRating(productId);
        log.info("Review {} deleted", id);
    }

    private void recalculateProductRating(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        Double avgRating = reviewRepository.getAverageRatingByProductId(productId);
        int reviewCount = reviewRepository.getReviewCountByProductId(productId);

        product.setRating(avgRating != null ? avgRating : 0.0);
        product.setTotalReviews(reviewCount);
        productRepository.save(product);
    }
}
