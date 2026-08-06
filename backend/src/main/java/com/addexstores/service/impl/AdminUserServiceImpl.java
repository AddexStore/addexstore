package com.addexstores.service.impl;

import com.addexstores.dto.response.PagedResponse;
import com.addexstores.dto.response.UserResponse;
import com.addexstores.entity.User;
import com.addexstores.enums.RoleType;
import com.addexstores.exception.BadRequestException;
import com.addexstores.exception.ForbiddenException;
import com.addexstores.exception.ResourceNotFoundException;
import com.addexstores.mapper.UserMapper;
import com.addexstores.repository.UserRepository;
import com.addexstores.security.TokenRevocationService;
import com.addexstores.service.AdminUserService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private static final Map<String, String> SORT_FIELDS = Map.of(
            "id", "id",
            "name", "name",
            "email", "email",
            "role", "role",
            "createdAt", "createdAt",
            "updatedAt", "updatedAt",
            "blocked", "isBlocked"
    );

    private final UserRepository userRepository;
    private final TokenRevocationService tokenRevocationService;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getUsers(int page, int size, String search, RoleType role, Boolean blocked,
                                                String sortBy, String sortDir) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Sort sort = resolveSort(sortBy, sortDir);
        PageRequest pageable = PageRequest.of(safePage, safeSize, sort);

        Page<User> userPage = userRepository.findAll(buildSpecification(search, role, blocked), pageable);

        List<UserResponse> users = userPage.getContent().stream()
                .map(UserMapper::toUserResponse)
                .toList();

        return PagedResponse.<UserResponse>builder()
                .content(users)
                .page(userPage.getNumber())
                .size(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .last(userPage.isLast())
                .first(userPage.isFirst())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return UserMapper.toUserResponse(getUserEntity(id));
    }

    @Override
    @Transactional
    public UserResponse updateUserStatus(Long id, boolean blocked, Long currentUserId) {
        User user = getUserEntity(id);
        guardSelfModification(id, currentUserId, "modify your own account status");
        guardLastActiveAdmin(user, "block the last active admin");

        if (user.isBlocked() != blocked) {
            user.setBlocked(blocked);
            userRepository.save(user);
            if (blocked) {
                tokenRevocationService.revokeAllUserTokens(user.getId());
                log.info("User blocked and tokens revoked: {}", user.getEmail());
            } else {
                log.info("User unblocked: {}", user.getEmail());
            }
        }

        return UserMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUserRole(Long id, RoleType role, Long currentUserId) {
        if (role == null) {
            throw new BadRequestException("Role is required");
        }

        User user = getUserEntity(id);
        guardSelfModification(id, currentUserId, "change your own role");

        if (user.getRole() == role) {
            return UserMapper.toUserResponse(user);
        }

        if (user.getRole() == RoleType.ADMIN && role == RoleType.CUSTOMER) {
            guardLastActiveAdmin(user, "demote the last active admin");
        }

        user.setRole(role);
        userRepository.save(user);
        log.info("User role updated: {} -> {} ({})", user.getEmail(), role, currentUserId);
        return UserMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long id, Long currentUserId) {
        User user = getUserEntity(id);
        guardSelfModification(id, currentUserId, "delete your own account");
        guardLastActiveAdmin(user, "delete the last active admin");

        userRepository.delete(user);
        tokenRevocationService.revokeAllUserTokens(user.getId());
        log.info("User deleted: {}", user.getEmail());
    }

    private User getUserEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    private void guardSelfModification(Long id, Long currentUserId, String action) {
        if (currentUserId != null && currentUserId.equals(id)) {
            throw new ForbiddenException("You cannot " + action);
        }
    }

    private void guardLastActiveAdmin(User user, String action) {
        boolean isActiveAdmin = user.getRole() == RoleType.ADMIN && !user.isBlocked();
        if (isActiveAdmin && userRepository.countByRoleAndBlocked(RoleType.ADMIN, false) <= 1) {
            throw new ForbiddenException("You cannot " + action);
        }
    }

    private Specification<User> buildSpecification(String search, RoleType role, Boolean blocked) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String pattern = "%" + escapeLike(search.trim().toLowerCase()) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern)
                ));
            }

            if (role != null) {
                predicates.add(cb.equal(root.get("role"), role));
            }

            if (blocked != null) {
                predicates.add(cb.equal(root.get("isBlocked"), blocked));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }

    private Sort resolveSort(String sortBy, String sortDir) {
        String field = SORT_FIELDS.getOrDefault(sortBy == null ? "createdAt" : sortBy, "createdAt");
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(direction, field);
    }
}
