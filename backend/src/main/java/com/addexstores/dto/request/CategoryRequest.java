package com.addexstores.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank
    private String name;

    private String slug;

    private String description;

    private String icon;

    private String image;

    private boolean active;
}
