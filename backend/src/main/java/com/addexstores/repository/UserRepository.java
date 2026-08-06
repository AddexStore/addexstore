package com.addexstores.repository;

import com.addexstores.entity.User;
import com.addexstores.enums.RoleType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Page<User> findByRole(RoleType role, Pageable pageable);

    long countByRole(RoleType role);

    @Query("select count(u) from User u where u.role = :role and u.isBlocked = :blocked")
    long countByRoleAndBlocked(@Param("role") RoleType role, @Param("blocked") boolean blocked);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<User> findTop8ByOrderByCreatedAtDesc();
}
