package com.addexstores.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SubCategoryRequest {

    @Size(max = 100, message = "Subcategory name must be at most 100 characters")
    private String name;

    @Size(max = 20000, message = "Icon content is too large")
    private String icon;
}
