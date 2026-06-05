package com.addexstores.repository;

import com.addexstores.entity.Payment;
import com.addexstores.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(Long orderId);
    Optional<Payment> findByGatewayOrderId(String gatewayOrderId);
    Optional<Payment> findByGatewayPaymentId(String gatewayPaymentId);
    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);
    List<Payment> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Payment> findByStatus(PaymentStatus status);
    boolean existsByOrderIdAndStatusIn(Long orderId, List<PaymentStatus> statuses);

    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.order WHERE p.stripePaymentIntentId = :piId")
    Optional<Payment> findByStripePaymentIntentIdWithOrder(@Param("piId") String piId);

    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.order ORDER BY p.createdAt DESC")
    Page<Payment> findAllWithOrder(Pageable pageable);

    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.order WHERE p.status = :status ORDER BY p.createdAt DESC")
    Page<Payment> findByStatusWithOrder(@Param("status") PaymentStatus status, Pageable pageable);

    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.order WHERE " +
           "(:search IS NULL OR p.order.orderNumber LIKE %:search% OR " +
           "p.stripePaymentIntentId LIKE %:search% OR p.gatewayOrderId LIKE %:search% OR " +
           "p.customerEmail LIKE %:search%) ORDER BY p.createdAt DESC")
    Page<Payment> searchWithOrder(@Param("search") String search, Pageable pageable);
}
