package com.addexstores.service;

import com.addexstores.dto.request.BannerRequest;
import com.addexstores.dto.response.BannerResponse;

import java.util.List;

public interface BannerService {

    List<BannerResponse> getActiveBanners();

    List<BannerResponse> getAllBanners();

    BannerResponse createBanner(BannerRequest request);

    BannerResponse updateBanner(Long id, BannerRequest request);

    void deleteBanner(Long id);

    void reorderBanners(List<Long> bannerIds);
}
