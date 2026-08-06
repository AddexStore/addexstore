package com.addexstores.repository;

import com.addexstores.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    List<PaymentTransaction> findByPaymentIdOrderByCreatedAtDesc(Long paymentId);

    boolean existsByPaymentIdAndTransactionIdAndGateway(Long paymentId, String transactionId, String gateway);
}
