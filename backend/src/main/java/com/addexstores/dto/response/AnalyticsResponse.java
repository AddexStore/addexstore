package com.addexstores.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {

    private List<MonthlyRevenue> monthlyRevenue;
    private List<WeeklyOrders> weeklyOrders;
    private List<TopSellingProduct> topSellingProducts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenue {
        private int year;
        private int month;
        private BigDecimal revenue;
        private long orderCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklyOrders {
        private String weekStart;
        private String weekEnd;
        private long orderCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopSellingProduct {
        private Long productId;
        private String productName;
        private long totalQuantity;
    }
}
