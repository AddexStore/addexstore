package com.addexstores.mapper;

import com.addexstores.dto.response.BannerResponse;
import com.addexstores.entity.Banner;
import com.addexstores.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class BannerMapper {

    private final FileUploadService fileUploadService;

    public BannerResponse toBannerResponse(Banner banner) {
        if (banner == null) return null;
        return BannerResponse.builder()
                .id(banner.getId())
                .title(banner.getTitle())
                .subtitle(banner.getSubtitle())
                .cta(banner.getCta())
                .imageUrl(fileUploadService.getFileUrl(banner.getImageUrl()))
                .linkUrl(banner.getLinkUrl())
                .backgroundColor(banner.getBackgroundColor())
                .sortOrder(banner.getSortOrder())
                .active(banner.isActive())
                .createdAt(banner.getCreatedAt())
                .build();
    }

    public List<BannerResponse> toBannerResponseList(List<Banner> banners) {
        return banners.stream()
                .map(this::toBannerResponse)
                .collect(Collectors.toList());
    }
}
