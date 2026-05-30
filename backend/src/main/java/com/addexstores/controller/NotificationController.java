package com.addexstores.controller;

import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.NotificationResponse;
import com.addexstores.security.CurrentUser;
import com.addexstores.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get user notifications")
    public ApiResponse<List<NotificationResponse>> getUserNotifications(@CurrentUser Long userId) {
        return ApiResponse.success(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notifications count")
    public ApiResponse<Long> getUnreadCount(@CurrentUser Long userId) {
        return ApiResponse.success(notificationService.getUnreadCount(userId));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    public ApiResponse<String> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ApiResponse.success("Notification marked as read");
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ApiResponse<String> markAllAsRead(@CurrentUser Long userId) {
        notificationService.markAllAsRead(userId);
        return ApiResponse.success("All notifications marked as read");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete notification")
    public ApiResponse<String> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ApiResponse.success("Notification deleted");
    }
}
