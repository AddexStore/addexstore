package com.addexstores.dto.response;

import com.addexstores.enums.NotificationType;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private Long id;
    private Long userId;
    private NotificationType type;
    private String title;
    private String message;
    @JsonProperty("isRead")
    private boolean isRead;
    private LocalDateTime createdAt;
}
