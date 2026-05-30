package com.addexstores.repository;

import com.addexstores.entity.Order;
import com.addexstores.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'DELIVERED'")
    BigDecimal getTotalRevenue();

    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    java.util.List<Object[]> countOrdersByStatus();

    @Query("SELECT o FROM Order o ORDER BY o.createdAt DESC")
    java.util.List<Order> findTop10Recent(Pageable pageable);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'DELIVERED' AND o.createdAt BETWEEN :start AND :end")
    BigDecimal getRevenueBetween(@org.springframework.data.repository.query.Param("start") LocalDateTime start,
                                 @org.springframework.data.repository.query.Param("end") LocalDateTime end);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt BETWEEN :start AND :end")
    long countOrdersBetween(@org.springframework.data.repository.query.Param("start") LocalDateTime start,
                            @org.springframework.data.repository.query.Param("end") LocalDateTime end);
}
