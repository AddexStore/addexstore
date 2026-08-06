package com.addexstores.controller.admin;

import com.addexstores.dto.request.UpdateUserRoleRequest;
import com.addexstores.dto.request.UpdateUserStatusRequest;
import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.PagedResponse;
import com.addexstores.dto.response.UserResponse;
import com.addexstores.enums.RoleType;
import com.addexstores.security.CurrentUser;
import com.addexstores.service.AdminUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin Users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    @Operation(summary = "Get users with search, filter, sort and pagination")
    public ApiResponse<PagedResponse<UserResponse>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) RoleType role,
            @RequestParam(required = false) Boolean blocked,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir) {
        return ApiResponse.success(adminUserService.getUsers(page, size, search, role, blocked, sortBy, sortDir));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ApiResponse<UserResponse> getUserById(@PathVariable Long id) {
        return ApiResponse.success(adminUserService.getUserById(id));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Block or unblock a user")
    public ApiResponse<UserResponse> updateUserStatus(@PathVariable Long id,
                                                      @Valid @RequestBody UpdateUserStatusRequest request,
                                                      @CurrentUser Long currentUserId) {
        return ApiResponse.success(adminUserService.updateUserStatus(id, request.getBlocked(), currentUserId));
    }

    @PatchMapping("/{id}/role")
    @Operation(summary = "Update a user's role")
    public ApiResponse<UserResponse> updateUserRole(@PathVariable Long id,
                                                    @Valid @RequestBody UpdateUserRoleRequest request,
                                                    @CurrentUser Long currentUserId) {
        return ApiResponse.success(adminUserService.updateUserRole(id, request.getRole(), currentUserId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a user")
    public ApiResponse<Void> deleteUser(@PathVariable Long id, @CurrentUser Long currentUserId) {
        adminUserService.deleteUser(id, currentUserId);
        return ApiResponse.success();
    }
}
