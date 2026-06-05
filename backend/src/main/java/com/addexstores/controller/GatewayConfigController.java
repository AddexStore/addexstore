package com.addexstores.controller;

import com.addexstores.dto.request.GatewayConfigRequest;
import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.GatewayConfigResponse;
import com.addexstores.entity.PaymentGatewayConfig;
import com.addexstores.repository.PaymentGatewayConfigRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/payment-gateways")
@RequiredArgsConstructor
@Tag(name = "Admin Payment Gateways")
public class GatewayConfigController {

    private final PaymentGatewayConfigRepository configRepository;

    @GetMapping
    @Operation(summary = "Get all payment gateway configurations")
    public ApiResponse<List<GatewayConfigResponse>> getAll() {
        List<PaymentGatewayConfig> configs = configRepository.findAll();
        List<GatewayConfigResponse> responses = configs.stream()
                .map(this::toResponse)
                .toList();
        return ApiResponse.success(responses);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment gateway configuration by ID")
    public ApiResponse<GatewayConfigResponse> getById(@PathVariable Long id) {
        PaymentGatewayConfig config = configRepository.findById(id)
                .orElseThrow(() -> new com.addexstores.exception.ResourceNotFoundException("PaymentGatewayConfig", id));
        return ApiResponse.success(toResponse(config));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update payment gateway configuration")
    public ApiResponse<GatewayConfigResponse> update(@PathVariable Long id, @RequestBody GatewayConfigRequest request) {
        PaymentGatewayConfig config = configRepository.findById(id)
                .orElseThrow(() -> new com.addexstores.exception.ResourceNotFoundException("PaymentGatewayConfig", id));

        config.setEnabled(request.isEnabled());
        config.setSortOrder(request.getSortOrder());
        if (request.getDisplayName() != null) config.setDisplayName(request.getDisplayName());
        if (request.getSupportedMethods() != null) config.setSupportedMethods(request.getSupportedMethods());

        config = configRepository.save(config);
        return ApiResponse.success(toResponse(config));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Toggle payment gateway enabled/disabled")
    public ApiResponse<GatewayConfigResponse> toggle(@PathVariable Long id) {
        PaymentGatewayConfig config = configRepository.findById(id)
                .orElseThrow(() -> new com.addexstores.exception.ResourceNotFoundException("PaymentGatewayConfig", id));
        config.setEnabled(!config.isEnabled());
        config = configRepository.save(config);
        return ApiResponse.success(toResponse(config));
    }

    private GatewayConfigResponse toResponse(PaymentGatewayConfig config) {
        return GatewayConfigResponse.builder()
                .id(config.getId())
                .gateway(config.getGateway())
                .enabled(config.isEnabled())
                .sortOrder(config.getSortOrder())
                .displayName(config.getDisplayName())
                .supportedMethods(config.getSupportedMethods())
                .build();
    }
}
