package com.addexstores.service.impl;

import com.addexstores.entity.Settings;
import com.addexstores.entity.ShippingRule;
import com.addexstores.repository.ShippingRuleRepository;
import com.addexstores.service.CurrencyService;
import com.addexstores.service.SettingsService;
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

    private static final String USD = "USD";

    private final ShippingRuleRepository shippingRuleRepository;
    private final SettingsService settingsService;
    private final CurrencyService currencyService;

    @Override
    public ShippingRule getShippingRule(String country) {
        List<ShippingRule> rules = shippingRuleRepository.findByCountryAndActiveTrue(country);
        if (!rules.isEmpty()) {
            return toBaseCurrency(rules.get(0));
        }

        Settings settings = settingsService.getSettingsEntity();
        ShippingRule fallback = ShippingRule.builder()
                .country(country)
                .cost(settings.getShippingCost() != null ? settings.getShippingCost() : BigDecimal.ZERO)
                .freeShippingThreshold(settings.getFreeShippingThreshold())
                .name("Standard Shipping")
                .build();
        log.warn("No shipping rule found for country={}, using store default shipping", country);
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

    private ShippingRule toBaseCurrency(ShippingRule rule) {
        String base = currencyService.getBaseCurrency();
        if (base == null || base.isBlank() || base.equalsIgnoreCase(USD)) {
            return rule;
        }
        BigDecimal cost = currencyService.convertFromUsd(rule.getCost(), base);
        BigDecimal threshold = rule.getFreeShippingThreshold() != null
                ? currencyService.convertFromUsd(rule.getFreeShippingThreshold(), base)
                : null;
        return ShippingRule.builder()
                .id(rule.getId())
                .country(rule.getCountry())
                .minOrderAmount(rule.getMinOrderAmount())
                .cost(cost)
                .freeShippingThreshold(threshold)
                .name(rule.getName())
                .active(rule.isActive())
                .build();
    }
}
