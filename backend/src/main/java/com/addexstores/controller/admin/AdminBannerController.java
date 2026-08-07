package com.addexstores.controller.admin;

import com.addexstores.dto.request.BannerRequest;
import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.BannerResponse;
import com.addexstores.service.BannerService;
import com.addexstores.service.FileUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/banners")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Banners")
public class AdminBannerController {

    private final BannerService bannerService;
    private final FileUploadService fileUploadService;

    @GetMapping
    @Operation(summary = "Get all banners")
    public ApiResponse<List<BannerResponse>> getAllBanners() {
        return ApiResponse.success(bannerService.getAllBanners());
    }

    @PostMapping
    @Operation(summary = "Create new banner")
    public ApiResponse<BannerResponse> createBanner(@Valid @RequestBody BannerRequest request) {
        return ApiResponse.success(bannerService.createBanner(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update banner")
    public ApiResponse<BannerResponse> updateBanner(@PathVariable Long id,
                                                     @Valid @RequestBody BannerRequest request) {
        return ApiResponse.success(bannerService.updateBanner(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete banner")
    public ApiResponse<String> deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
        return ApiResponse.success("Banner deleted successfully");
    }

    @PutMapping("/reorder")
    @Operation(summary = "Reorder banners")
    public ApiResponse<String> reorderBanners(@RequestBody List<Long> bannerIds) {
        bannerService.reorderBanners(bannerIds);
        return ApiResponse.success("Banners reordered successfully");
    }

    @PostMapping("/upload-image")
    @Operation(summary = "Upload banner image and return its URL")
    public ApiResponse<String> uploadImage(@RequestParam("file") MultipartFile file) {
        return ApiResponse.success(fileUploadService.uploadFile(file, "banners"));
    }
}
