package com.addexstores.controller.admin;

import com.addexstores.dto.response.AnalyticsResponse;
import com.addexstores.dto.response.ApiResponse;
import com.addexstores.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
@Tag(name = "Admin Analytics")
public class AdminAnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    @Operation(summary = "Get analytics data")
    public ApiResponse<AnalyticsResponse> getAnalytics() {
        return ApiResponse.success(analyticsService.getAnalytics());
    }
}
