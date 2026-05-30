package com.addexstores.service;

import com.addexstores.dto.request.ReviewRequest;
import com.addexstores.dto.response.PagedResponse;
import com.addexstores.dto.response.ReviewResponse;

public interface ReviewService {

    PagedResponse<ReviewResponse> getProductReviews(Long productId, int page, int size);

    ReviewResponse createReview(Long userId, Long productId, ReviewRequest request);

    PagedResponse<ReviewResponse> getAllReviews(int page, int size, Boolean approved);

    void approveReview(Long id);

    void deleteReview(Long id);
}
