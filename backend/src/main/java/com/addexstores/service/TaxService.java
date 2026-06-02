package com.addexstores.service;

import com.addexstores.entity.TaxRule;

import java.math.BigDecimal;

public interface TaxService {

    TaxRule getTaxRule(String country, String state);

    BigDecimal calculateTax(BigDecimal subtotal, String country, String state);
}
