package com.addexstores.service.impl;

import com.addexstores.dto.response.DashboardResponse;
import com.addexstores.dto.response.RecentOrderResponse;
import com.addexstores.enums.OrderStatus;
import com.addexstores.repository.OrderRepository;
import com.addexstores.repository.ProductRepository;
import com.addexstores.repository.UserRepository;
import com.addexstores.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    public DashboardResponse getDashboardStats() {
        long totalOrders = orderRepository.count();
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        BigDecimal totalRevenue = orderRepository.getTotalRevenue();
        long lowStockProducts = productRepository.findByActiveTrueAndStockLessThan(10).size();

        Map<String, Long> ordersByStatus = new HashMap<>();
        List<Object[]> statusCounts = orderRepository.countOrdersByStatus();
        for (Object[] row : statusCounts) {
            String status = row[0] != null ? ((OrderStatus) row[0]).name() : "UNKNOWN";
            Long count = row[1] != null ? (Long) row[1] : 0L;
            ordersByStatus.put(status, count);
        }
        Arrays.stream(OrderStatus.values()).forEach(s -> ordersByStatus.putIfAbsent(s.name(), 0L));

        List<RecentOrderResponse> recentOrders = orderRepository.findTop10Recent(PageRequest.of(0, 10))
                .stream()
                .map(order -> RecentOrderResponse.builder()
                        .id(order.getId())
                        .orderNumber(order.getOrderNumber())
                        .customerName(order.getUser().getName())
                        .totalAmount(order.getTotalAmount())
                        .status(order.getStatus().name())
                        .createdAt(order.getCreatedAt())
                        .build())
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
}
