package com.addexstores.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannerResponse {

    private Long id;
    private String title;
    private String subtitle;
    private String cta;
    private String imageUrl;
    private String linkUrl;
    private String backgroundColor;
    private int sortOrder;
    private boolean active;
    private LocalDateTime createdAt;
}
