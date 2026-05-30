package com.addexstores.mapper;

import com.addexstores.dto.response.SettingsResponse;
import com.addexstores.entity.Settings;

public class SettingsMapper {

    public static SettingsResponse toSettingsResponse(Settings settings) {
        if (settings == null) return null;
        return SettingsResponse.builder()
                .id(settings.getId())
                .siteName(settings.getSiteName())
                .siteDescription(settings.getSiteDescription())
                .logo(settings.getLogo())
                .favicon(settings.getFavicon())
                .email(settings.getEmail())
                .phone(settings.getPhone())
                .address(settings.getAddress())
                .currency(settings.getCurrency())
                .taxRate(settings.getTaxRate())
                .shippingCost(settings.getShippingCost())
                .freeShippingThreshold(settings.getFreeShippingThreshold())
                .socialLinks(settings.getSocialLinks())
                .build();
    }
}
