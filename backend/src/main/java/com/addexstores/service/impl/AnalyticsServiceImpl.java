package com.addexstores.service.impl;

import com.addexstores.dto.response.AnalyticsResponse;
import com.addexstores.entity.Product;
import com.addexstores.repository.OrderItemRepository;
import com.addexstores.repository.OrderRepository;
import com.addexstores.repository.ProductRepository;
import com.addexstores.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    @Override
    public AnalyticsResponse getAnalytics() {
        List<AnalyticsResponse.MonthlyRevenue> monthlyRevenue = getMonthlyRevenue();
        List<AnalyticsResponse.WeeklyOrders> weeklyOrders = getWeeklyOrders();
        List<AnalyticsResponse.TopSellingProduct> topSellingProducts = getTopSellingProducts();

        log.info("Analytics retrieved");
        return AnalyticsResponse.builder()
                .monthlyRevenue(monthlyRevenue)
                .weeklyOrders(weeklyOrders)
                .topSellingProducts(topSellingProducts)
                .build();
    }

    private List<AnalyticsResponse.MonthlyRevenue> getMonthlyRevenue() {
        List<AnalyticsResponse.MonthlyRevenue> result = new ArrayList<>();
        LocalDate now = LocalDate.now();

        for (int i = 11; i >= 0; i--) {
            LocalDate monthStart = now.minusMonths(i).withDayOfMonth(1);
            LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());

            BigDecimal revenue = orderRepository.getRevenueBetween(
                    monthStart.atStartOfDay(),
                    monthEnd.atTime(LocalTime.MAX));

            long orderCount = orderRepository.countOrdersBetween(
                    monthStart.atStartOfDay(),
                    monthEnd.atTime(LocalTime.MAX));

            result.add(AnalyticsResponse.MonthlyRevenue.builder()
                    .year(monthStart.getYear())
                    .month(monthStart.getMonthValue())
                    .revenue(revenue != null ? revenue : BigDecimal.ZERO)
                    .orderCount(orderCount)
                    .build());
        }

        return result;
    }

    private List<AnalyticsResponse.WeeklyOrders> getWeeklyOrders() {
        List<AnalyticsResponse.WeeklyOrders> result = new ArrayList<>();
        LocalDate now = LocalDate.now();

        for (int i = 3; i >= 0; i--) {
            LocalDate weekStart = now.minusWeeks(i).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate weekEnd = weekStart.plusDays(6);

            long orderCount = orderRepository.countOrdersBetween(
                    weekStart.atStartOfDay(),
                    weekEnd.atTime(LocalTime.MAX));

            result.add(AnalyticsResponse.WeeklyOrders.builder()
                    .weekStart(weekStart.toString())
                    .weekEnd(weekEnd.toString())
                    .orderCount(orderCount)
                    .build());
        }

        return result;
    }

    private List<AnalyticsResponse.TopSellingProduct> getTopSellingProducts() {
        List<Object[]> results = orderItemRepository.findTopSellingProducts();

        return results.stream()
                .limit(10)
                .map(row -> {
                    Long productId = (Long) row[0];
                    long totalQty = ((Number) row[1]).longValue();
                    String productName = productRepository.findById(productId)
                            .map(Product::getName)
                            .orElse("Unknown");
                    return AnalyticsResponse.TopSellingProduct.builder()
                            .productId(productId)
                            .productName(productName)
                            .totalQuantity(totalQty)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
