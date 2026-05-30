package com.addexstores.controller.admin;

import com.addexstores.dto.request.SettingsRequest;
import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.SettingsResponse;
import com.addexstores.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
@Tag(name = "Admin Settings")
public class AdminSettingsController {

    private final SettingsService settingsService;

    @GetMapping
    @Operation(summary = "Get settings")
    public ApiResponse<SettingsResponse> getSettings() {
        return ApiResponse.success(settingsService.getSettings());
    }

    @PutMapping
    @Operation(summary = "Update settings")
    public ApiResponse<SettingsResponse> updateSettings(@Valid @RequestBody SettingsRequest request) {
        return ApiResponse.success(settingsService.updateSettings(request));
    }
}
