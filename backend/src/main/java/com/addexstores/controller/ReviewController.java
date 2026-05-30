package com.addexstores.controller;

import com.addexstores.dto.request.ReviewRequest;
import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.PagedResponse;
import com.addexstores.dto.response.ReviewResponse;
import com.addexstores.security.CurrentUser;
import com.addexstores.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    @Operation(summary = "Get product reviews")
    public ApiResponse<PagedResponse<ReviewResponse>> getProductReviews(@PathVariable Long productId,
                                                                         @RequestParam(defaultValue = "0") int page,
                                                                         @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(reviewService.getProductReviews(productId, page, size));
    }

    @PostMapping
    @Operation(summary = "Create product review")
    public ApiResponse<ReviewResponse> createReview(@CurrentUser Long userId,
                                                     @PathVariable Long productId,
                                                     @Valid @RequestBody ReviewRequest request) {
        return ApiResponse.success(reviewService.createReview(userId, productId, request));
    }
}
