package com.addexstores.repository;

import com.addexstores.entity.PaymentGatewayConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentGatewayConfigRepository extends JpaRepository<PaymentGatewayConfig, Long> {
    Optional<PaymentGatewayConfig> findByGateway(String gateway);
    List<PaymentGatewayConfig> findByEnabledTrueOrderBySortOrderAsc();
}
