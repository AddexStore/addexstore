package com.addexstores.controller.admin;

import com.addexstores.dto.request.NotificationRequest;
import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.NotificationResponse;
import com.addexstores.security.CurrentUser;
import com.addexstores.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
@Tag(name = "Admin Notifications")
public class AdminNotificationController {

    private final NotificationService notificationService;

    @PostMapping("/send")
    @Operation(summary = "Send notification to user")
    public ApiResponse<NotificationResponse> sendNotification(@CurrentUser Long adminId,
                                                               @Valid @RequestBody NotificationRequest request) {
        return ApiResponse.success(notificationService.createNotification(request));
    }
}
