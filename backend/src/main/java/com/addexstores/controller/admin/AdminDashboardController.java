package com.addexstores.controller.admin;

import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.DashboardOverviewResponse;
import com.addexstores.dto.response.DashboardResponse;
import com.addexstores.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@Tag(name = "Admin Dashboard")
public class AdminDashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Get dashboard statistics")
    public ApiResponse<DashboardResponse> getDashboardStats() {
        return ApiResponse.success(dashboardService.getDashboardStats());
    }

    @GetMapping("/overview")
    @Operation(summary = "Get aggregated dashboard overview")
    public ApiResponse<DashboardOverviewResponse> getDashboardOverview() {
        return ApiResponse.success(dashboardService.getDashboardOverview());
    }
}
