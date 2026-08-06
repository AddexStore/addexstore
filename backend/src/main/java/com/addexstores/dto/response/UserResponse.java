package com.addexstores.dto.response;

import com.addexstores.enums.RoleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String avatar;
    private RoleType role;
    private boolean blocked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
