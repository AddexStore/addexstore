package com.addexstores.controller.admin;

import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.PagedResponse;
import com.addexstores.dto.response.UserResponse;
import com.addexstores.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin Users")
public class AdminUserController {

    private final AuthService authService;

    @GetMapping
    @Operation(summary = "Get all users")
    public ApiResponse<PagedResponse<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(authService.getAllUsers(page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ApiResponse<UserResponse> getUserById(@PathVariable Long id) {
        return ApiResponse.success(authService.getUserById(id));
    }
}
