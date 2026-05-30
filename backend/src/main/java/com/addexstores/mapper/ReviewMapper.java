package com.addexstores.mapper;

import com.addexstores.dto.response.ReviewResponse;
import com.addexstores.entity.Review;

import java.util.List;
import java.util.stream.Collectors;

public class ReviewMapper {

    public static ReviewResponse toReviewResponse(Review review) {
        if (review == null) return null;
        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getName())
                .userAvatar(review.getUser().getAvatar())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .rating(review.getRating())
                .comment(review.getComment())
                .approved(review.isApproved())
                .createdAt(review.getCreatedAt())
                .build();
    }

    public static List<ReviewResponse> toReviewResponseList(List<Review> reviews) {
        return reviews.stream()
                .map(ReviewMapper::toReviewResponse)
                .collect(Collectors.toList());
    }
}
