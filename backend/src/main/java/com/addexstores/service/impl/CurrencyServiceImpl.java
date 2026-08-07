package com.addexstores.service.impl;

import com.addexstores.entity.CurrencyRate;
import com.addexstores.entity.Settings;
import com.addexstores.exception.BadRequestException;
import com.addexstores.repository.CurrencyRateRepository;
import com.addexstores.repository.SettingsRepository;
import com.addexstores.service.CurrencyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CurrencyServiceImpl implements CurrencyService {

    private static final String USD = "USD";

    private static final Map<String, String> FALLBACK_SYMBOLS = Map.ofEntries(
            Map.entry("USD", "$"),
            Map.entry("EUR", "€"),
            Map.entry("GBP", "£"),
            Map.entry("AED", "د.إ"),
            Map.entry("INR", "₹"),
            Map.entry("AUD", "$"),
            Map.entry("SAR", "ر.س"),
            Map.entry("CAD", "$"),
            Map.entry("JPY", "¥")
    );

    private final CurrencyRateRepository currencyRateRepository;
    private final SettingsRepository settingsRepository;

    @Override
    public String getBaseCurrency() {
        return settingsRepository.findAll()
                .stream()
                .findFirst()
                .map(Settings::getCurrency)
                .filter(code -> code != null && !code.isBlank())
                .map(code -> code.toUpperCase(Locale.ROOT))
                .orElse(USD);
    }

    @Override
    public boolean isSupportedCurrency(String currencyCode) {
        if (currencyCode == null || currencyCode.isBlank()) {
            return false;
        }
        String code = currencyCode.toUpperCase(Locale.ROOT);
        if (USD.equals(code) || code.equals(getBaseCurrency())) {
            return true;
        }
        return currencyRateRepository.findByCurrencyCodeAndActiveTrue(code).isPresent();
    }

    @Override
    public String getSymbol(String currencyCode) {
        if (currencyCode == null || currencyCode.isBlank()) {
            return currencyCode;
        }
        String code = currencyCode.toUpperCase(Locale.ROOT);
        return currencyRateRepository.findByCurrencyCodeAndActiveTrue(code)
                .map(CurrencyRate::getSymbol)
                .orElseGet(() -> FALLBACK_SYMBOLS.getOrDefault(code, code));
    }

    @Override
    public CurrencyRate getCurrencyRate(String currencyCode) {
        if (currencyCode == null || currencyCode.isBlank()) {
            throw new BadRequestException("Currency code is required");
        }
        String code = currencyCode.toUpperCase(Locale.ROOT);

        if (USD.equals(code)) {
            return identityRate(USD, getSymbol(USD));
        }

        return currencyRateRepository.findByCurrencyCodeAndActiveTrue(code)
                .orElseGet(() -> {
                    if (code.equals(getBaseCurrency())) {
                        return identityRate(code, getSymbol(code));
                    }
                    throw new BadRequestException("Unsupported currency: " + currencyCode);
                });
    }

    @Override
    public BigDecimal convertToUsd(BigDecimal amount, String fromCurrency) {
        if (USD.equalsIgnoreCase(fromCurrency)) {
            return amount;
        }
        CurrencyRate rate = getCurrencyRate(fromCurrency);
        return amount.divide(rate.getRateToUsd(), 6, RoundingMode.HALF_UP)
                .setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal convertFromUsd(BigDecimal usdAmount, String toCurrency) {
        if (USD.equalsIgnoreCase(toCurrency)) {
            return usdAmount;
        }
        CurrencyRate rate = getCurrencyRate(toCurrency);
        return usdAmount.multiply(rate.getRateToUsd()).setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal convert(BigDecimal amount, String fromCurrency, String toCurrency) {
        if (fromCurrency.equalsIgnoreCase(toCurrency)) {
            return amount;
        }
        BigDecimal inUsd = convertToUsd(amount, fromCurrency);
        return convertFromUsd(inUsd, toCurrency);
    }

    @Override
    public BigDecimal convertBaseCurrency(BigDecimal baseAmount, String toCurrency) {
        if (baseAmount == null) {
            return BigDecimal.ZERO;
        }
        if (toCurrency == null || toCurrency.isBlank()) {
            return baseAmount;
        }
        String target = toCurrency.toUpperCase(Locale.ROOT);
        String base = getBaseCurrency();
        if (base.equals(target)) {
            return baseAmount;
        }
        BigDecimal baseRate = getCurrencyRate(base).getRateToUsd();
        BigDecimal inUsd = baseRate.compareTo(BigDecimal.ONE) == 0
                ? baseAmount
                : baseAmount.divide(baseRate, 6, RoundingMode.HALF_UP);
        return convertFromUsd(inUsd, target);
    }

    private CurrencyRate identityRate(String code, String symbol) {
        return CurrencyRate.builder()
                .currencyCode(code)
                .rateToUsd(BigDecimal.ONE)
                .symbol(symbol)
                .build();
    }
}
