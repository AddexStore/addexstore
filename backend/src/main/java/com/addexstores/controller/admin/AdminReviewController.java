package com.addexstores.controller.admin;

import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.PagedResponse;
import com.addexstores.dto.response.ReviewResponse;
import com.addexstores.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
@Tag(name = "Admin Reviews")
public class AdminReviewController {

    private final ReviewService reviewService;

    @GetMapping
    @Operation(summary = "Get all reviews")
    public ApiResponse<PagedResponse<ReviewResponse>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Boolean approved) {
        return ApiResponse.success(reviewService.getAllReviews(page, size, approved));
    }

    @PutMapping("/{id}/approve")
    @Operation(summary = "Approve review")
    public ApiResponse<String> approveReview(@PathVariable Long id) {
        reviewService.approveReview(id);
        return ApiResponse.success("Review approved successfully");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete review")
    public ApiResponse<String> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ApiResponse.success("Review deleted successfully");
    }
}
