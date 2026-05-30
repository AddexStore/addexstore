package com.addexstores.service;

import com.addexstores.dto.request.NotificationRequest;
import com.addexstores.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {

    List<NotificationResponse> getUserNotifications(Long userId);

    long getUnreadCount(Long userId);

    void markAsRead(Long notificationId);

    void markAllAsRead(Long userId);

    void deleteNotification(Long id);

    NotificationResponse createNotification(NotificationRequest request);
}
