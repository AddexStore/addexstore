package com.addexstores.service;

import com.addexstores.dto.response.PagedResponse;
import com.addexstores.dto.response.UserResponse;
import com.addexstores.enums.RoleType;

public interface AdminUserService {

    PagedResponse<UserResponse> getUsers(int page, int size, String search, RoleType role, Boolean blocked,
                                         String sortBy, String sortDir);

    UserResponse getUserById(Long id);

    UserResponse updateUserStatus(Long id, boolean blocked, Long currentUserId);

    UserResponse updateUserRole(Long id, RoleType role, Long currentUserId);

    void deleteUser(Long id, Long currentUserId);
}
