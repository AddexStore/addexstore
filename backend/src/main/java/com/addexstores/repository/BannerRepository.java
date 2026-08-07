package com.addexstores.repository;

import com.addexstores.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {

    List<Banner> findByActiveTrueOrderBySortOrderAsc();

    List<Banner> findAllByOrderBySortOrderAsc();
}
