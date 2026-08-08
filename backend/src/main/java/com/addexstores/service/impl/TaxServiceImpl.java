package com.addexstores.service.impl;

import com.addexstores.entity.Settings;
import com.addexstores.entity.TaxRule;
import com.addexstores.repository.TaxRuleRepository;
import com.addexstores.service.SettingsService;
import com.addexstores.service.TaxService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaxServiceImpl implements TaxService {

    private final TaxRuleRepository taxRuleRepository;
    private final SettingsService settingsService;

    @Override
    public TaxRule getTaxRule(String country, String state) {
        if (state != null && !state.isBlank()) {
            java.util.Optional<TaxRule> stateRule = taxRuleRepository
                    .findByCountryAndStateAndActiveTrue(country, state.toUpperCase());
            if (stateRule.isPresent()) {
                return stateRule.get();
            }
        }

        java.util.List<TaxRule> countryRules = taxRuleRepository
                .findByCountryAndActiveTrue(country);
        if (!countryRules.isEmpty()) {
            TaxRule general = countryRules.stream()
                    .filter(r -> r.getState() == null || r.getState().isBlank())
                    .findFirst()
                    .orElse(countryRules.get(0));
            return general;
        }

        Settings settings = settingsService.getSettingsEntity();
        BigDecimal defaultRate = settings.getTaxRate() != null ? settings.getTaxRate() : BigDecimal.ZERO;
        TaxRule fallback = TaxRule.builder()
                .country(country)
                .rate(defaultRate)
                .name("Store Default Tax")
                .build();
        log.warn("No tax rule found for country={}, state={}, using store default rate {}", country, state, defaultRate);
        return fallback;
    }

    @Override
    public BigDecimal calculateTax(BigDecimal subtotal, String country, String state) {
        TaxRule rule = getTaxRule(country, state);
        BigDecimal rate = rule.getRate();
        if (rate.compareTo(BigDecimal.ONE) > 0) {
            rate = rate.divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);
        }
        return subtotal.multiply(rate).setScale(2, RoundingMode.HALF_UP);
    }
}
