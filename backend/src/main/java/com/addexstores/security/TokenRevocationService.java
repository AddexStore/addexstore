package com.addexstores.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenRevocationService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String REVOKED_TOKEN_PREFIX = "revoked_token:";
    private static final String REFRESH_TOKEN_PREFIX = "refresh_token:";

    public void revokeAccessToken(String token) {
        redisTemplate.opsForValue().set(REVOKED_TOKEN_PREFIX + token, "revoked", 24, TimeUnit.HOURS);
        log.debug("Access token revoked");
    }

    public void revokeRefreshToken(String token) {
        redisTemplate.opsForValue().set(REVOKED_TOKEN_PREFIX + token, "revoked", 7, TimeUnit.DAYS);
        log.debug("Refresh token revoked");
    }

    public boolean isTokenRevoked(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(REVOKED_TOKEN_PREFIX + token));
    }

    public void storeRefreshToken(Long userId, String refreshToken) {
        redisTemplate.opsForValue().set(REFRESH_TOKEN_PREFIX + userId, refreshToken, 7, TimeUnit.DAYS);
    }

    public String getStoredRefreshToken(Long userId) {
        Object token = redisTemplate.opsForValue().get(REFRESH_TOKEN_PREFIX + userId);
        return token != null ? token.toString() : null;
    }

    public void removeRefreshToken(Long userId) {
        redisTemplate.delete(REFRESH_TOKEN_PREFIX + userId);
    }

    public void revokeAllUserTokens(Long userId) {
        removeRefreshToken(userId);
        log.info("All tokens revoked for user: {}", userId);
    }
}
