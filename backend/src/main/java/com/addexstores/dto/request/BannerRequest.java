package com.addexstores.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BannerRequest {
    @NotBlank
    private String title;

    private String subtitle;

    private String cta;

    @NotBlank
    private String imageUrl;

    private String linkUrl;

    private String textColor;

    private Integer sortOrder;

    private Boolean active;
}
