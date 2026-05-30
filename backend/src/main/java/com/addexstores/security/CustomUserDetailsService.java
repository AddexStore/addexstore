package com.addexstores.security;

import com.addexstores.enums.RoleType;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        try {
            Object[] user = (Object[]) entityManager
                    .createQuery("SELECT u.id, u.email, u.password, u.role FROM User u WHERE u.email = :email")
                    .setParameter("email", email)
                    .getSingleResult();

            Long id = (Long) user[0];
            String userEmail = (String) user[1];
            String password = (String) user[2];
            RoleType role = (RoleType) user[3];

            GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role.name());

            return new User(
                    userEmail,
                    password,
                    Collections.singletonList(authority)
            );
        } catch (Exception e) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }
    }
}
