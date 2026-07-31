package com.addexstores.controller;

import com.addexstores.dto.request.ChangePasswordRequest;
import com.addexstores.dto.request.LoginRequest;
import com.addexstores.dto.request.RefreshTokenRequest;
import com.addexstores.dto.request.SignupRequest;
import com.addexstores.dto.request.UpdateProfileRequest;
import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.AuthResponse;
import com.addexstores.dto.response.UserResponse;
import com.addexstores.security.CurrentUser;
import com.addexstores.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login user")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/signup")
    @Operation(summary = "Register new user")
    public AuthResponse signup(@Valid @RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public AuthResponse refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refreshToken(request);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ApiResponse<UserResponse> getCurrentUser(@CurrentUser Long userId) {
        return ApiResponse.success(authService.getCurrentUser(userId));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile")
    public ApiResponse<UserResponse> updateProfile(@CurrentUser Long userId,
                                                    @Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.success(authService.updateProfile(userId, request));
    }

    @PutMapping("/password")
    @Operation(summary = "Change user password")
    public ApiResponse<String> changePassword(@CurrentUser Long userId,
                                            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(userId, request);
        return ApiResponse.success("Password changed successfully");
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user and revoke tokens")
    public ApiResponse<String> logout(@CurrentUser Long userId, HttpServletRequest request) {
        String accessToken = null;
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            accessToken = bearerToken.substring(7);
        }
        authService.logout(userId, accessToken);
        return ApiResponse.success("Logged out successfully");
    }
}
