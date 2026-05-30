package com.addexstores.service;

import com.addexstores.dto.request.ChangePasswordRequest;
import com.addexstores.dto.request.LoginRequest;
import com.addexstores.dto.request.SignupRequest;
import com.addexstores.dto.request.UpdateProfileRequest;
import com.addexstores.dto.response.AuthResponse;
import com.addexstores.dto.response.PagedResponse;
import com.addexstores.dto.response.UserResponse;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    AuthResponse signup(SignupRequest request);

    UserResponse getCurrentUser(Long userId);

    UserResponse updateProfile(Long userId, UpdateProfileRequest request);

    void changePassword(Long userId, ChangePasswordRequest request);

    PagedResponse<UserResponse> getAllUsers(int page, int size);

    UserResponse getUserById(Long id);
}
