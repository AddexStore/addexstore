package com.addexstores.service;

import com.addexstores.entity.CurrencyRate;

import java.math.BigDecimal;

public interface CurrencyService {

    String getBaseCurrency();

    boolean isSupportedCurrency(String currencyCode);

    String getSymbol(String currencyCode);

    CurrencyRate getCurrencyRate(String currencyCode);

    BigDecimal convertToUsd(BigDecimal amount, String fromCurrency);

    BigDecimal convertFromUsd(BigDecimal usdAmount, String toCurrency);

    BigDecimal convert(BigDecimal amount, String fromCurrency, String toCurrency);

    BigDecimal convertBaseCurrency(BigDecimal baseAmount, String toCurrency);
}
