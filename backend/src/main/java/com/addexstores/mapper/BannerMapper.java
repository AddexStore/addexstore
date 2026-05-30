package com.addexstores.mapper;

import com.addexstores.dto.response.BannerResponse;
import com.addexstores.entity.Banner;

import java.util.List;
import java.util.stream.Collectors;

public class BannerMapper {

    public static BannerResponse toBannerResponse(Banner banner) {
        if (banner == null) return null;
        return BannerResponse.builder()
                .id(banner.getId())
                .title(banner.getTitle())
                .subtitle(banner.getSubtitle())
                .imageUrl(banner.getImageUrl())
                .linkUrl(banner.getLinkUrl())
                .sortOrder(banner.getSortOrder())
                .active(banner.isActive())
                .createdAt(banner.getCreatedAt())
                .build();
    }

    public static List<BannerResponse> toBannerResponseList(List<Banner> banners) {
        return banners.stream()
                .map(BannerMapper::toBannerResponse)
                .collect(Collectors.toList());
    }
}
