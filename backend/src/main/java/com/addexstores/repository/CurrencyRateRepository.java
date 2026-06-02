package com.addexstores.repository;

import com.addexstores.entity.CurrencyRate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CurrencyRateRepository extends JpaRepository<CurrencyRate, Long> {

    Optional<CurrencyRate> findByCurrencyCodeAndActiveTrue(String currencyCode);

    List<CurrencyRate> findByActiveTrue();
}
