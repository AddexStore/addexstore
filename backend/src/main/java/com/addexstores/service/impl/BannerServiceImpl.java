package com.addexstores.service.impl;

import com.addexstores.dto.request.BannerRequest;
import com.addexstores.dto.response.BannerResponse;
import com.addexstores.entity.Banner;
import com.addexstores.exception.ResourceNotFoundException;
import com.addexstores.mapper.BannerMapper;
import com.addexstores.repository.BannerRepository;
import com.addexstores.service.BannerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.IntStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class BannerServiceImpl implements BannerService {

    private final BannerRepository bannerRepository;
    private final BannerMapper bannerMapper;

    @Override
    public List<BannerResponse> getActiveBanners() {
        List<Banner> banners = bannerRepository.findByActiveTrueOrderBySortOrderAsc();
        return bannerMapper.toBannerResponseList(banners);
    }

    @Override
    public List<BannerResponse> getAllBanners() {
        List<Banner> banners = bannerRepository.findAll();
        return bannerMapper.toBannerResponseList(banners);
    }

    @Override
    @Transactional
    public BannerResponse createBanner(BannerRequest request) {
        Banner banner = Banner.builder()
                .title(request.getTitle())
                .subtitle(request.getSubtitle())
                .imageUrl(request.getImageUrl())
                .linkUrl(request.getLinkUrl())
                .sortOrder(request.getSortOrder())
                .active(request.isActive())
                .build();

        banner = bannerRepository.save(banner);
        log.info("Banner created: {}", banner.getTitle());
        return bannerMapper.toBannerResponse(banner);
    }

    @Override
    @Transactional
    public BannerResponse updateBanner(Long id, BannerRequest request) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner", id));

        if (request.getTitle() != null) banner.setTitle(request.getTitle());
        if (request.getSubtitle() != null) banner.setSubtitle(request.getSubtitle());
        if (request.getImageUrl() != null) banner.setImageUrl(request.getImageUrl());
        if (request.getLinkUrl() != null) banner.setLinkUrl(request.getLinkUrl());
        banner.setSortOrder(request.getSortOrder());
        banner.setActive(request.isActive());

        banner = bannerRepository.save(banner);
        log.info("Banner updated: {}", banner.getTitle());
        return bannerMapper.toBannerResponse(banner);
    }

    @Override
    @Transactional
    public void deleteBanner(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner", id));
        bannerRepository.delete(banner);
        log.info("Banner deleted: {}", banner.getTitle());
    }

    @Override
    @Transactional
    public void reorderBanners(List<Long> bannerIds) {
        List<Banner> banners = bannerRepository.findAllById(bannerIds);
        IntStream.range(0, bannerIds.size()).forEach(i -> {
            Long bannerId = bannerIds.get(i);
            banners.stream()
                    .filter(b -> b.getId().equals(bannerId))
                    .findFirst()
                    .ifPresent(b -> b.setSortOrder(i));
        });
        bannerRepository.saveAll(banners);
        log.info("Banners reordered");
    }
}
