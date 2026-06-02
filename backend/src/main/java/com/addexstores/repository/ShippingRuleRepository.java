package com.addexstores.repository;

import com.addexstores.entity.ShippingRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShippingRuleRepository extends JpaRepository<ShippingRule, Long> {

    List<ShippingRule> findByCountryAndActiveTrue(String country);

    Optional<ShippingRule> findByCountryAndNameAndActiveTrue(String country, String name);
}
