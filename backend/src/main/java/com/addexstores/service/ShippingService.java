package com.addexstores.service;

import com.addexstores.entity.ShippingRule;

import java.math.BigDecimal;

public interface ShippingService {

    ShippingRule getShippingRule(String country);

    BigDecimal calculateShipping(BigDecimal subtotal, String country);
}
