package com.addexstores.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequest {

    @Size(max = 100, message = "Category name must be at most 100 characters")
    private String name;

    @Size(max = 100, message = "Slug must be at most 100 characters")
    @Pattern(regexp = "^$|^[a-z0-9]+(?:-[a-z0-9]+)*$",
            message = "Slug may only contain lowercase letters, numbers and hyphens")
    private String slug;

    @Size(max = 1000, message = "Description must be at most 1000 characters")
    private String description;

    @Size(max = 20000, message = "Icon content is too large")
    private String icon;

    @Size(max = 500, message = "Image URL must be at most 500 characters")
    private String image;

    private Boolean active;
}
