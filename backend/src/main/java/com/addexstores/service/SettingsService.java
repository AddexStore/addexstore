package com.addexstores.service;

import com.addexstores.dto.request.SettingsRequest;
import com.addexstores.dto.response.SettingsResponse;
import com.addexstores.entity.Settings;

public interface SettingsService {

    SettingsResponse getSettings();

    SettingsResponse updateSettings(SettingsRequest request);

    Settings getSettingsEntity();
}
