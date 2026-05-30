package com.addexstores.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationRequest {
    @NotNull
    private Long userId;

    @NotBlank
    private String type;

    @NotBlank
    private String title;

    @NotBlank
    private String message;
}
