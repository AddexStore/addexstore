package com.addexstores.repository;

import com.addexstores.entity.TaxRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaxRuleRepository extends JpaRepository<TaxRule, Long> {

    List<TaxRule> findByCountryAndActiveTrue(String country);

    Optional<TaxRule> findByCountryAndStateAndActiveTrue(String country, String state);

    List<TaxRule> findByActiveTrue();
}
