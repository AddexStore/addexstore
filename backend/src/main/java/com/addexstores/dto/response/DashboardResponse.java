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
public class DashboardResponse {

    private long totalOrders;
    private long totalUsers;
    private long totalProducts;
    private BigDecimal totalRevenue;
    private long lowStockProducts;
    private Map<String, Long> ordersByStatus;
    private List<RecentOrderResponse> recentOrders;
}
