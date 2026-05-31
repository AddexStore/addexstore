package com.addexstores.repository;

import com.addexstores.entity.Payment;
import com.addexstores.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(Long orderId);
    Optional<Payment> findByGatewayOrderId(String gatewayOrderId);
    List<Payment> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Payment> findByStatus(PaymentStatus status);
}
