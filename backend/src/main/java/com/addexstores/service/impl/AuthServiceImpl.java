package com.addexstores.service.impl;

import com.addexstores.dto.request.ChangePasswordRequest;
import com.addexstores.dto.request.LoginRequest;
import com.addexstores.dto.request.RefreshTokenRequest;
import com.addexstores.dto.request.SignupRequest;
import com.addexstores.dto.request.UpdateProfileRequest;
import com.addexstores.dto.response.AuthResponse;
import com.addexstores.dto.response.UserResponse;
import com.addexstores.entity.User;
import com.addexstores.exception.BadRequestException;
import com.addexstores.exception.ResourceNotFoundException;
import com.addexstores.exception.UnauthorizedException;
import com.addexstores.mapper.UserMapper;
import com.addexstores.repository.UserRepository;

import com.addexstores.security.JwtTokenProvider;
import com.addexstores.security.TokenRevocationService;
import com.addexstores.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenRevocationService tokenRevocationService;

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        if (user.isBlocked()) {
            throw new BadRequestException("Account is blocked. Please contact support.");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name(), user.isBlocked());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        tokenRevocationService.storeRefreshToken(user.getId(), refreshToken);
        log.info("User logged in: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .user(UserMapper.toUserResponse(user))
                .build();
    }

    @Override
    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name(), user.isBlocked());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        tokenRevocationService.storeRefreshToken(user.getId(), refreshToken);
        log.info("User registered: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .user(UserMapper.toUserResponse(user))
                .build();
    }

    @Override
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshTokenValue = request.getRefreshToken();

        if (!jwtTokenProvider.validateToken(refreshTokenValue)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        if (tokenRevocationService.isTokenRevoked(refreshTokenValue)) {
            throw new UnauthorizedException("Refresh token has been revoked");
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(refreshTokenValue);

        String storedRefreshToken = tokenRevocationService.getStoredRefreshToken(userId);
        if (storedRefreshToken == null || !storedRefreshToken.equals(refreshTokenValue)) {
            throw new UnauthorizedException("Refresh token has been revoked");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (user.isBlocked()) {
            throw new BadRequestException("Account is blocked. Please contact support.");
        }

        tokenRevocationService.revokeRefreshToken(refreshTokenValue);

        String newToken = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name(), user.isBlocked());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        tokenRevocationService.storeRefreshToken(user.getId(), newRefreshToken);
        log.info("Token refreshed for user: {}", user.getEmail());

        return AuthResponse.builder()
                .token(newToken)
                .refreshToken(newRefreshToken)
                .user(UserMapper.toUserResponse(user))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return UserMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }

        user = userRepository.save(user);
        log.info("User profile updated: {}", user.getEmail());
        return UserMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user: {}", user.getEmail());
    }

    @Override
    public void logout(Long userId, String accessToken) {
        if (accessToken != null) {
            tokenRevocationService.revokeAccessToken(accessToken);
        }
        tokenRevocationService.revokeAllUserTokens(userId);
        log.info("User logged out: {}", userId);
    }
}
