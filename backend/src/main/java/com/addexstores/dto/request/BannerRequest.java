package com.addexstores.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BannerRequest {
    @NotBlank
    private String title;

    private String subtitle;

    @NotBlank
    private String imageUrl;

    private String linkUrl;

    private String backgroundColor;

    private String textColor;

    private int sortOrder;

    private boolean active;
}
