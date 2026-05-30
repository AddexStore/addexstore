package com.addexstores.service.impl;

import com.addexstores.dto.request.NotificationRequest;
import com.addexstores.dto.response.NotificationResponse;
import com.addexstores.entity.Notification;
import com.addexstores.entity.User;
import com.addexstores.exception.ResourceNotFoundException;
import com.addexstores.mapper.NotificationMapper;
import com.addexstores.enums.NotificationType;
import com.addexstores.repository.NotificationRepository;
import com.addexstores.repository.UserRepository;
import com.addexstores.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public List<NotificationResponse> getUserNotifications(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return NotificationMapper.toNotificationResponseList(notifications);
    }

    @Override
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    @Transactional
    public void deleteNotification(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        notificationRepository.delete(notification);
        log.info("Notification {} deleted", id);
    }

    @Override
    @Transactional
    public NotificationResponse createNotification(NotificationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getUserId()));

        Notification notification = Notification.builder()
                .user(user)
                .type(NotificationType.valueOf(request.getType()))
                .title(request.getTitle())
                .message(request.getMessage())
                .build();

        notification = notificationRepository.save(notification);
        log.info("Notification created for user {}: {}", request.getUserId(), request.getTitle());
        return NotificationMapper.toNotificationResponse(notification);
    }
}
