package com.addexstores.config;

import com.addexstores.entity.User;
import com.addexstores.enums.RoleType;
import com.addexstores.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrap implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_EMAIL:}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:}")
    private String adminPassword;

    @Value("${ADMIN_NAME:Administrator}")
    private String adminName;

    @Override
    public void run(String... args) {
        if (!StringUtils.hasText(adminEmail) || !StringUtils.hasText(adminPassword)) {
            log.info("Admin bootstrap skipped: ADMIN_EMAIL and ADMIN_PASSWORD not both configured.");
            return;
        }
        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Admin bootstrap skipped: user with email {} already exists.", adminEmail);
            return;
        }

        User admin = User.builder()
                .name(adminName)
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(RoleType.ADMIN)
                .isBlocked(false)
                .build();

        userRepository.save(admin);
        log.info("Admin bootstrap created ADMIN user: {}", adminEmail);
    }
}
