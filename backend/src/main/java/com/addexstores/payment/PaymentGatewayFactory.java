package com.addexstores.payment;

import com.addexstores.entity.PaymentGatewayConfig;
import com.addexstores.enums.PaymentMethod;
import com.addexstores.exception.PaymentGatewayException;
import com.addexstores.repository.PaymentGatewayConfigRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentGatewayFactory {

    private final List<PaymentGateway> gatewayList;
    private final PaymentGatewayConfigRepository configRepository;
    private final Map<PaymentMethod, PaymentGateway> gatewayMap = new EnumMap<>(PaymentMethod.class);

    @PostConstruct
    public void init() {
        for (PaymentGateway gateway : gatewayList) {
            for (PaymentMethod method : PaymentMethod.values()) {
                if (method.name().equalsIgnoreCase(gateway.getGatewayName())) {
                    gatewayMap.put(method, gateway);
                    break;
                }
            }
        }
        log.info("Registered payment gateways: {}", gatewayMap.keySet());
    }

    public PaymentGateway getGateway(PaymentMethod method) {
        PaymentGatewayConfig config = configRepository.findByGateway(method.name())
                .orElse(null);

        if (config != null && !config.isEnabled()) {
            PaymentGateway fallback = findFallback(method);
            if (fallback != null) {
                log.warn("Gateway {} is disabled, falling back to {}", method, fallback.getGatewayName());
                return fallback;
            }
            throw new PaymentGatewayException("Payment gateway " + method + " is disabled and no fallback available");
        }

        PaymentGateway gateway = gatewayMap.get(method);
        if (gateway == null) {
            throw new PaymentGatewayException("No implementation found for payment method: " + method);
        }
        return gateway;
    }

    public PaymentGateway getActiveGateway() {
        List<PaymentGatewayConfig> configs = configRepository.findByEnabledTrueOrderBySortOrderAsc();
        if (!configs.isEmpty()) {
            for (PaymentGatewayConfig config : configs) {
                try {
                    PaymentMethod method = PaymentMethod.valueOf(config.getGateway());
                    PaymentGateway gateway = gatewayMap.get(method);
                    if (gateway != null) {
                        return gateway;
                    }
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid payment method in config: {}", config.getGateway());
                }
            }
        }

        if (!gatewayMap.isEmpty()) {
            return gatewayMap.values().iterator().next();
        }

        throw new PaymentGatewayException("No active payment gateway available");
    }

    public PaymentMethod getActivePaymentMethod() {
        PaymentGateway gateway = getActiveGateway();
        for (Map.Entry<PaymentMethod, PaymentGateway> entry : gatewayMap.entrySet()) {
            if (entry.getValue().equals(gateway)) {
                return entry.getKey();
            }
        }
        return PaymentMethod.STRIPE;
    }

    private PaymentGateway findFallback(PaymentMethod disabledMethod) {
        return gatewayMap.entrySet().stream()
                .filter(entry -> entry.getKey() != disabledMethod)
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse(null);
    }
}
