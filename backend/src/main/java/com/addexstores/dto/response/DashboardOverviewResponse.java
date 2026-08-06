package com.addexstores.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOverviewResponse {

    private Summary summary;
    private List<RevenuePoint> revenueSeries;
    private List<DailyOrderPoint> dailyOrders;
    private List<TopProduct> topProducts;
    private List<RecentOrderResponse> recentOrders;
    private List<ActivityItem> recentActivity;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private BigDecimal totalRevenue;
        private double revenueChange;
        private long totalOrders;
        private double ordersChange;
        private long totalUsers;
        private double usersChange;
        private long totalProducts;
        private long lowStockProducts;
        private long pendingOrders;
        private BigDecimal avgOrderValue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenuePoint {
        private int year;
        private int month;
        private String label;
        private BigDecimal revenue;
        private long orderCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyOrderPoint {
        private LocalDate date;
        private String label;
        private long orderCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProduct {
        private Long productId;
        private String productName;
        private long totalQuantity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityItem {
        private Long id;
        private String type;
        private String text;
        private LocalDateTime createdAt;
    }
}
