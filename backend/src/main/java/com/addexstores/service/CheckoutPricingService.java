package com.addexstores.service;

import com.addexstores.dto.request.CheckoutQuoteRequest;
import com.addexstores.dto.response.CheckoutQuoteResponse;

public interface CheckoutPricingService {

    CheckoutQuoteResponse calculateQuote(CheckoutQuoteRequest request, Long userId);
}
