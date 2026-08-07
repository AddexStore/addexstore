package com.addexstores.service;

import com.addexstores.dto.request.SettingsRequest;
import com.addexstores.dto.response.PublicSettingsResponse;
import com.addexstores.dto.response.SettingsResponse;
import com.addexstores.entity.Settings;

public interface SettingsService {

    SettingsResponse getSettings();

    PublicSettingsResponse getPublicSettings();

    SettingsResponse updateSettings(SettingsRequest request);

    Settings getSettingsEntity();
}
