package com.addexstores.dto.request;

import com.addexstores.enums.RoleType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserRoleRequest {

    @NotNull
    private RoleType role;
}
