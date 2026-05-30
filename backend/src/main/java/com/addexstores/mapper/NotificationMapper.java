package com.addexstores.mapper;

import com.addexstores.dto.response.NotificationResponse;
import com.addexstores.entity.Notification;

import java.util.List;
import java.util.stream.Collectors;

public class NotificationMapper {

    public static NotificationResponse toNotificationResponse(Notification notification) {
        if (notification == null) return null;
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUser().getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    public static List<NotificationResponse> toNotificationResponseList(List<Notification> notifications) {
        return notifications.stream()
                .map(NotificationMapper::toNotificationResponse)
                .collect(Collectors.toList());
    }
}
