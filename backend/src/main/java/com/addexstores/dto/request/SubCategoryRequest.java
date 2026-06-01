package com.addexstores.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubCategoryRequest {
    @NotBlank
    private String name;

    private String icon;
}
