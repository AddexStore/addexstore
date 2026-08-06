package com.addexstores.service.impl;

import com.addexstores.dto.response.DashboardOverviewResponse;
import com.addexstores.dto.response.DashboardResponse;
import com.addexstores.dto.response.RecentOrderResponse;
import com.addexstores.entity.User;
import com.addexstores.enums.OrderStatus;
import com.addexstores.repository.OrderItemRepository;
import com.addexstores.repository.OrderRepository;
import com.addexstores.repository.ProductRepository;
import com.addexstores.repository.UserRepository;
import com.addexstores.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private static final int LOW_STOCK_THRESHOLD = 10;
    private static final int MONTHS = 12;
    private static final int DAYS = 7;
    private static final int RECENT_LIMIT = 8;
    private static final int TOP_PRODUCTS = 5;
    private static final int TREND_WINDOW_DAYS = 30;

    private static final Set<OrderStatus> COMPLETED_STATUSES =
            Set.of(OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED);

    private static final Set<OrderStatus> OPEN_STATUSES =
            Set.of(OrderStatus.PENDING, OrderStatus.PENDING_PAYMENT,
                    OrderStatus.PROCESSING, OrderStatus.SHIPPED);

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    public DashboardResponse getDashboardStats() {
        long totalOrders = orderRepository.count();
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        BigDecimal totalRevenue = orderRepository.getTotalRevenue();
        long lowStockProducts = productRepository.countByActiveTrueAndStockLessThan(LOW_STOCK_THRESHOLD);

        Map<String, Long> ordersByStatus = new HashMap<>();
        for (Object[] row : orderRepository.countOrdersByStatus()) {
            String status = row[0] != null ? ((OrderStatus) row[0]).name() : "UNKNOWN";
            Long count = row[1] != null ? (Long) row[1] : 0L;
            ordersByStatus.put(status, count);
        }
        for (OrderStatus s : OrderStatus.values()) {
            ordersByStatus.putIfAbsent(s.name(), 0L);
        }

        List<RecentOrderResponse> recentOrders = orderRepository.findRecentWithUser(PageRequest.of(0, RECENT_LIMIT))
                .stream()
                .map(this::toRecentOrderResponse)
                .collect(Collectors.toList());

        log.info("Dashboard stats retrieved");
        return DashboardResponse.builder()
                .totalOrders(totalOrders)
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .totalRevenue(totalRevenue)
                .lowStockProducts(lowStockProducts)
                .ordersByStatus(ordersByStatus)
                .recentOrders(recentOrders)
                .build();
    }

    @Override
    @Cacheable(cacheNames = "dashboardOverview", key = "'overview'")
    public DashboardOverviewResponse getDashboardOverview() {
        LocalDateTime now = LocalDateTime.now();

        long totalOrders = orderRepository.count();
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long lowStockProducts = productRepository.countByActiveTrueAndStockLessThan(LOW_STOCK_THRESHOLD);
        long deliveredOrders = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long pendingOrders = orderRepository.countByStatusIn(OPEN_STATUSES);
        BigDecimal totalRevenue = orderRepository.getTotalRevenue();

        BigDecimal avgOrderValue = deliveredOrders == 0
                ? BigDecimal.ZERO
                : totalRevenue.divide(BigDecimal.valueOf(deliveredOrders), 2, RoundingMode.HALF_UP);

        LocalDateTime thirtyDaysAgo = now.minusDays(TREND_WINDOW_DAYS);
        LocalDateTime sixtyDaysAgo = now.minusDays(TREND_WINDOW_DAYS * 2L);

        double revenueChange = percentChange(
                orderRepository.getRevenueBetween(thirtyDaysAgo, now),
                orderRepository.getRevenueBetween(sixtyDaysAgo, thirtyDaysAgo));
        double ordersChange = percentChange(
                orderRepository.countOrdersBetween(thirtyDaysAgo, now),
                orderRepository.countOrdersBetween(sixtyDaysAgo, thirtyDaysAgo));
        double usersChange = percentChange(
                userRepository.countByCreatedAtBetween(thirtyDaysAgo, now),
                userRepository.countByCreatedAtBetween(sixtyDaysAgo, thirtyDaysAgo));

        LocalDateTime seriesStart = YearMonth.from(now).minusMonths(MONTHS - 1L).atDay(1).atStartOfDay();
        List<Object[]> dailyRows = orderRepository.getDailySummary(seriesStart);

        Map<YearMonth, BigDecimal> monthlyRevenue = new TreeMap<>();
        Map<YearMonth, Long> monthlyCounts = new TreeMap<>();
        for (int i = MONTHS - 1; i >= 0; i--) {
            YearMonth ym = YearMonth.from(now).minusMonths(i);
            monthlyRevenue.put(ym, BigDecimal.ZERO);
            monthlyCounts.put(ym, 0L);
        }

        LocalDate today = now.toLocalDate();
        Map<LocalDate, Long> dailyCounts = new HashMap<>();
        for (int i = DAYS - 1; i >= 0; i--) {
            dailyCounts.put(today.minusDays(i), 0L);
        }

        for (Object[] row : dailyRows) {
            LocalDate date = toLocalDate(row[0]);
            OrderStatus status = row[1] instanceof OrderStatus ? (OrderStatus) row[1] : null;
            BigDecimal amount = row[2] instanceof BigDecimal ? (BigDecimal) row[2] : BigDecimal.ZERO;
            long count = toLong(row[3]);

            YearMonth ym = YearMonth.from(date);
            if (monthlyRevenue.containsKey(ym)) {
                if (status == OrderStatus.DELIVERED) {
                    monthlyRevenue.put(ym, monthlyRevenue.get(ym).add(amount != null ? amount : BigDecimal.ZERO));
                }
                monthlyCounts.put(ym, monthlyCounts.get(ym) + count);
            }

            if (dailyCounts.containsKey(date)) {
                dailyCounts.put(date, dailyCounts.get(date) + count);
            }
        }

        List<DashboardOverviewResponse.RevenuePoint> revenueSeries = new ArrayList<>();
        for (Map.Entry<YearMonth, BigDecimal> entry : monthlyRevenue.entrySet()) {
            YearMonth ym = entry.getKey();
            revenueSeries.add(DashboardOverviewResponse.RevenuePoint.builder()
                    .year(ym.getYear())
                    .month(ym.getMonthValue())
                    .label(ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                    .revenue(entry.getValue())
                    .orderCount(monthlyCounts.getOrDefault(ym, 0L))
                    .build());
        }

        List<DashboardOverviewResponse.DailyOrderPoint> dailyOrders = new ArrayList<>();
        for (int i = DAYS - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            dailyOrders.add(DashboardOverviewResponse.DailyOrderPoint.builder()
                    .date(date)
                    .label(date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                    .orderCount(dailyCounts.getOrDefault(date, 0L))
                    .build());
        }

        List<DashboardOverviewResponse.TopProduct> topProducts = orderItemRepository
                .findTopSellingProductsByStatuses(COMPLETED_STATUSES)
                .stream()
                .limit(TOP_PRODUCTS)
                .map(row -> DashboardOverviewResponse.TopProduct.builder()
                        .productId(toLong(row[0]))
                        .productName(row[1] != null ? String.valueOf(row[1]) : "Unknown")
                        .totalQuantity(toLong(row[2]))
                        .build())
                .collect(Collectors.toList());

        List<RecentOrderResponse> recentOrders = orderRepository.findRecentWithUser(PageRequest.of(0, RECENT_LIMIT))
                .stream()
                .map(this::toRecentOrderResponse)
                .collect(Collectors.toList());

        List<DashboardOverviewResponse.ActivityItem> recentActivity = buildActivityFeed(recentOrders);

        DashboardOverviewResponse.Summary summary = DashboardOverviewResponse.Summary.builder()
                .totalRevenue(totalRevenue)
                .revenueChange(revenueChange)
                .totalOrders(totalOrders)
                .ordersChange(ordersChange)
                .totalUsers(totalUsers)
                .usersChange(usersChange)
                .totalProducts(totalProducts)
                .lowStockProducts(lowStockProducts)
                .pendingOrders(pendingOrders)
                .avgOrderValue(avgOrderValue)
                .build();

        log.info("Dashboard overview retrieved");
        return DashboardOverviewResponse.builder()
                .summary(summary)
                .revenueSeries(revenueSeries)
                .dailyOrders(dailyOrders)
                .topProducts(topProducts)
                .recentOrders(recentOrders)
                .recentActivity(recentActivity)
                .build();
    }

    private List<DashboardOverviewResponse.ActivityItem> buildActivityFeed(List<RecentOrderResponse> recentOrders) {
        List<DashboardOverviewResponse.ActivityItem> items = new ArrayList<>();
        for (RecentOrderResponse order : recentOrders) {
            items.add(DashboardOverviewResponse.ActivityItem.builder()
                    .id(order.getId())
                    .type("order")
                    .text("Order " + order.getOrderNumber() + " placed")
                    .createdAt(order.getCreatedAt())
                    .build());
        }
        for (User user : userRepository.findTop8ByOrderByCreatedAtDesc()) {
            items.add(DashboardOverviewResponse.ActivityItem.builder()
                    .id(user.getId())
                    .type("user")
                    .text(user.getName() + " registered")
                    .createdAt(user.getCreatedAt())
                    .build());
        }
        items.sort(Comparator.comparing(DashboardOverviewResponse.ActivityItem::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        return items.stream().limit(RECENT_LIMIT).collect(Collectors.toList());
    }

    private RecentOrderResponse toRecentOrderResponse(com.addexstores.entity.Order order) {
        return RecentOrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerName(order.getUser() != null ? order.getUser().getName() : "Guest")
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .createdAt(order.getCreatedAt())
                .build();
    }

    private double percentChange(BigDecimal current, BigDecimal previous) {
        if (current == null) current = BigDecimal.ZERO;
        if (previous == null || previous.signum() == 0) {
            return current.signum() == 0 ? 0.0 : 100.0;
        }
        return (current.doubleValue() - previous.doubleValue()) / previous.doubleValue() * 100.0;
    }

    private double percentChange(long current, long previous) {
        if (previous == 0) {
            return current == 0 ? 0.0 : 100.0;
        }
        return (double) (current - previous) / previous * 100.0;
    }

    private long toLong(Object value) {
        return value instanceof Number ? ((Number) value).longValue() : 0L;
    }

    private LocalDate toLocalDate(Object value) {
        if (value instanceof LocalDate) {
            return (LocalDate) value;
        }
        if (value instanceof java.sql.Date) {
            return ((java.sql.Date) value).toLocalDate();
        }
        if (value instanceof Timestamp) {
            return ((Timestamp) value).toLocalDateTime().toLocalDate();
        }
        throw new IllegalArgumentException("Unexpected date type: " + (value == null ? "null" : value.getClass().getName()));
    }
}
