package com.addexstores.controller;

import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.PublicSettingsResponse;
import com.addexstores.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@Tag(name = "Public Settings")
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    @Operation(summary = "Get public store settings")
    public ApiResponse<PublicSettingsResponse> getPublicSettings() {
        return ApiResponse.success(settingsService.getPublicSettings());
    }
}
