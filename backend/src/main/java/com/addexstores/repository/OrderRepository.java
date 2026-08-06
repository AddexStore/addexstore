package com.addexstores.repository;

import com.addexstores.entity.Order;
import com.addexstores.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    @Override
    @EntityGraph(attributePaths = "user")
    Page<Order> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "user")
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = "user")
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    @EntityGraph(attributePaths = "user")
    @Query("SELECT o FROM Order o WHERE LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :text, '%')) " +
           "OR LOWER(o.user.name) LIKE LOWER(CONCAT('%', :text, '%')) " +
           "OR LOWER(o.user.email) LIKE LOWER(CONCAT('%', :text, '%'))")
    Page<Order> search(@Param("text") String text, Pageable pageable);

    @EntityGraph(attributePaths = "user")
    @Query("SELECT o FROM Order o WHERE o.status = :status AND " +
           "(LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :text, '%')) " +
           "OR LOWER(o.user.name) LIKE LOWER(CONCAT('%', :text, '%')) " +
           "OR LOWER(o.user.email) LIKE LOWER(CONCAT('%', :text, '%')))")
    Page<Order> searchByStatus(@Param("status") OrderStatus status, @Param("text") String text, Pageable pageable);

    long countByStatus(OrderStatus status);

    long countByStatusIn(Collection<OrderStatus> statuses);

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

    @Query("SELECT o FROM Order o JOIN FETCH o.user ORDER BY o.createdAt DESC")
    List<Order> findRecentWithUser(Pageable pageable);

    @Query("SELECT cast(o.createdAt as date) AS day, o.status, SUM(o.totalAmount) AS revenue, COUNT(o) AS cnt " +
           "FROM Order o WHERE o.createdAt >= :start " +
           "GROUP BY cast(o.createdAt as date), o.status")
    List<Object[]> getDailySummary(@org.springframework.data.repository.query.Param("start") LocalDateTime start);
}
