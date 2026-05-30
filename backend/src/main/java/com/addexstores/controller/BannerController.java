package com.addexstores.controller;

import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.BannerResponse;
import com.addexstores.service.BannerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
@Tag(name = "Banners")
public class BannerController {

    private final BannerService bannerService;

    @GetMapping
    @Operation(summary = "Get active banners")
    public ApiResponse<List<BannerResponse>> getActiveBanners() {
        return ApiResponse.success(bannerService.getActiveBanners());
    }
}
