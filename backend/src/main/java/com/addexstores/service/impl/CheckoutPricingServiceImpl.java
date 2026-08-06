package com.addexstores.service.impl;

import com.addexstores.dto.request.CheckoutQuoteRequest;
import com.addexstores.dto.response.CheckoutQuoteResponse;
import com.addexstores.entity.*;
import com.addexstores.repository.CartRepository;
import com.addexstores.repository.ProductRepository;
import com.addexstores.service.CheckoutPricingService;
import com.addexstores.service.CurrencyService;
import com.addexstores.service.ShippingService;
import com.addexstores.service.TaxService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CheckoutPricingServiceImpl implements CheckoutPricingService {

    private static final String DEFAULT_CURRENCY = "USD";

    private final TaxService taxService;
    private final ShippingService shippingService;
    private final CurrencyService currencyService;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public CheckoutQuoteResponse calculateQuote(CheckoutQuoteRequest request, Long userId) {
        String currencyCode = request.getCurrency() != null ? request.getCurrency().toUpperCase() : DEFAULT_CURRENCY;
        CurrencyRate currencyRate = currencyService.getCurrencyRate(currencyCode);

        BigDecimal subtotal;
        List<CheckoutQuoteResponse.QuoteItemDetail> itemDetails;

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            itemDetails = calculateFromRequestItems(request.getItems());
        } else if (userId != null) {
            itemDetails = calculateFromCart(userId);
        } else {
            itemDetails = new ArrayList<>();
        }

        subtotal = itemDetails.stream()
                .map(CheckoutQuoteResponse.QuoteItemDetail::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal taxUsd = taxService.calculateTax(subtotal, request.getCountry(), request.getState());
        BigDecimal shippingUsd = shippingService.calculateShipping(subtotal, request.getCountry());
        BigDecimal totalUsd = subtotal.add(taxUsd).add(shippingUsd);

        BigDecimal taxRate = taxService.getTaxRule(request.getCountry(), request.getState()).getRate();
        if (taxRate.compareTo(BigDecimal.ONE) > 0) {
            taxRate = taxRate.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        }
        String taxName = taxService.getTaxRule(request.getCountry(), request.getState()).getName();
        BigDecimal tax = currencyService.convertFromUsd(taxUsd, currencyCode);

        ShippingRule shippingRule = shippingService.getShippingRule(request.getCountry());
        boolean freeShipping = shippingUsd.compareTo(BigDecimal.ZERO) == 0;
        String shippingName = freeShipping ? "Free Shipping" : shippingRule.getName();
        BigDecimal shippingCost = currencyService.convertFromUsd(shippingUsd, currencyCode);

        BigDecimal subtotalInTarget = currencyService.convertFromUsd(subtotal, currencyCode);
        BigDecimal total = currencyService.convertFromUsd(totalUsd, currencyCode);

        return CheckoutQuoteResponse.builder()
                .currency(currencyCode)
                .currencySymbol(currencyRate.getSymbol())
                .conversionRate(currencyRate.getRateToUsd())
                .subtotal(subtotalInTarget)
                .subtotalInUsd(subtotal)
                .taxRate(taxRate)
                .taxName(taxName)
                .tax(tax)
                .shippingCost(shippingCost)
                .shippingName(shippingName)
                .freeShipping(freeShipping)
                .total(total)
                .totalInUsd(totalUsd)
                .items(itemDetails)
                .build();
    }

    private List<CheckoutQuoteResponse.QuoteItemDetail> calculateFromRequestItems(
            List<CheckoutQuoteRequest.QuoteItem> requestItems) {
        List<CheckoutQuoteResponse.QuoteItemDetail> details = new ArrayList<>();
        for (CheckoutQuoteRequest.QuoteItem item : requestItems) {
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            if (product == null) continue;

            BigDecimal price = item.getPrice() != null ? item.getPrice() : product.getPrice();
            BigDecimal lineSubtotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));

            String image = null;
            if (product.getImages() != null && !product.getImages().isEmpty()) {
                image = product.getImages().stream()
                        .filter(ProductImage::isPrimary)
                        .findFirst()
                        .map(ProductImage::getImageUrl)
                        .orElse(product.getImages().get(0).getImageUrl());
            }

            details.add(CheckoutQuoteResponse.QuoteItemDetail.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .productImage(image)
                    .quantity(item.getQuantity())
                    .unitPrice(price)
                    .subtotal(lineSubtotal)
                    .build());
        }
        return details;
    }

    private List<CheckoutQuoteResponse.QuoteItemDetail> calculateFromCart(Long userId) {
        List<CheckoutQuoteResponse.QuoteItemDetail> details = new ArrayList<>();
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart == null || cart.getItems() == null) return details;

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            String image = null;
            if (product.getImages() != null && !product.getImages().isEmpty()) {
                image = product.getImages().stream()
                        .filter(ProductImage::isPrimary)
                        .findFirst()
                        .map(ProductImage::getImageUrl)
                        .orElse(product.getImages().get(0).getImageUrl());
            }

            details.add(CheckoutQuoteResponse.QuoteItemDetail.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .productImage(image)
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getPrice())
                    .subtotal(cartItem.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                    .build());
        }
        return details;
    }
}
