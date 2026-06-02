package com.addexstores.service.impl;

import com.addexstores.entity.ShippingRule;
import com.addexstores.repository.ShippingRuleRepository;
import com.addexstores.service.ShippingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShippingServiceImpl implements ShippingService {

    private final ShippingRuleRepository shippingRuleRepository;

    @Override
    public ShippingRule getShippingRule(String country) {
        List<ShippingRule> rules = shippingRuleRepository.findByCountryAndActiveTrue(country);
        if (!rules.isEmpty()) {
            return rules.get(0);
        }

        ShippingRule fallback = ShippingRule.builder()
                .country(country)
                .cost(new BigDecimal("9.99"))
                .name("Standard Shipping")
                .build();
        log.warn("No shipping rule found for country={}, using default $9.99", country);
        return fallback;
    }

    @Override
    public BigDecimal calculateShipping(BigDecimal subtotal, String country) {
        ShippingRule rule = getShippingRule(country);
        if (rule.getFreeShippingThreshold() != null
                && subtotal.compareTo(rule.getFreeShippingThreshold()) >= 0) {
            return BigDecimal.ZERO;
        }
        return rule.getCost();
    }
}
