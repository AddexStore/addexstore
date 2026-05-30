package com.addexstores.service.impl;

import com.addexstores.dto.request.SettingsRequest;
import com.addexstores.dto.response.SettingsResponse;
import com.addexstores.entity.Settings;
import com.addexstores.mapper.SettingsMapper;
import com.addexstores.repository.SettingsRepository;
import com.addexstores.service.SettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettingsServiceImpl implements SettingsService {

    private final SettingsRepository settingsRepository;

    @Override
    public SettingsResponse getSettings() {
        Settings settings = getSettingsEntity();
        return SettingsMapper.toSettingsResponse(settings);
    }

    @Override
    @Transactional
    public SettingsResponse updateSettings(SettingsRequest request) {
        Settings settings = getSettingsEntity();

        if (request.getSiteName() != null) settings.setSiteName(request.getSiteName());
        if (request.getSiteDescription() != null) settings.setSiteDescription(request.getSiteDescription());
        if (request.getLogo() != null) settings.setLogo(request.getLogo());
        if (request.getFavicon() != null) settings.setFavicon(request.getFavicon());
        if (request.getEmail() != null) settings.setEmail(request.getEmail());
        if (request.getPhone() != null) settings.setPhone(request.getPhone());
        if (request.getAddress() != null) settings.setAddress(request.getAddress());
        if (request.getCurrency() != null) settings.setCurrency(request.getCurrency());
        if (request.getTaxRate() != null) settings.setTaxRate(request.getTaxRate());
        if (request.getShippingCost() != null) settings.setShippingCost(request.getShippingCost());
        if (request.getFreeShippingThreshold() != null) settings.setFreeShippingThreshold(request.getFreeShippingThreshold());
        if (request.getSocialLinks() != null) {
            try {
                settings.setSocialLinks(new ObjectMapper().writeValueAsString(request.getSocialLinks()));
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to serialize social links", e);
            }
        }

        settings = settingsRepository.save(settings);
        log.info("Settings updated");
        return SettingsMapper.toSettingsResponse(settings);
    }

    @Override
    public Settings getSettingsEntity() {
        return settingsRepository.findAll()
                .stream()
                .findFirst()
                .orElseGet(() -> settingsRepository.save(
                        Settings.builder()
                                .siteName("AddexStores")
                                .siteDescription("Your one-stop shop for everything")
                                .currency("USD")
                                .taxRate(new BigDecimal("8.50"))
                                .shippingCost(BigDecimal.ZERO)
                                .build()
                ));
    }
}
