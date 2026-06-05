package com.addexstores.security;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TokenUser {
    private Long id;
    private String email;
    private String role;
}
