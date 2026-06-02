package com.addexstores.service.impl;

import com.addexstores.entity.CurrencyRate;
import com.addexstores.exception.BadRequestException;
import com.addexstores.repository.CurrencyRateRepository;
import com.addexstores.service.CurrencyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class CurrencyServiceImpl implements CurrencyService {

    private static final String USD = "USD";

    private final CurrencyRateRepository currencyRateRepository;

    @Override
    public CurrencyRate getCurrencyRate(String currencyCode) {
        if (USD.equalsIgnoreCase(currencyCode)) {
            return CurrencyRate.builder()
                    .currencyCode(USD)
                    .rateToUsd(BigDecimal.ONE)
                    .symbol("$")
                    .build();
        }

        return currencyRateRepository.findByCurrencyCodeAndActiveTrue(currencyCode.toUpperCase())
                .orElseThrow(() -> new BadRequestException("Unsupported currency: " + currencyCode));
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
}
