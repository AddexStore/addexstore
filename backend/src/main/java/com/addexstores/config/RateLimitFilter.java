package com.addexstores.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Slf4j
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Bandwidth GENERAL_LIMIT =
            Bandwidth.classic(100, Refill.greedy(100, Duration.ofMinutes(1)));
    private static final Bandwidth AUTH_LIMIT =
            Bandwidth.classic(10, Refill.greedy(10, Duration.ofMinutes(1)));

    private final ConcurrentMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket createGeneralBucket() {
        return Bucket.builder().addLimit(GENERAL_LIMIT).build();
    }

    private Bucket createAuthBucket() {
        return Bucket.builder().addLimit(AUTH_LIMIT).build();
    }

    private Bucket resolveBucket(String key, boolean isAuth) {
        return buckets.computeIfAbsent(key, k -> isAuth ? createAuthBucket() : createGeneralBucket());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String clientIp = getClientIP(request);
        String path = request.getRequestURI();

        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/signup")) {
            Bucket authBucket = resolveBucket("auth:" + clientIp, true);
            ConsumptionProbe probe = authBucket.tryConsumeAndReturnRemaining(1);
            if (probe.isConsumed()) {
                response.addHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
                filterChain.doFilter(request, response);
            } else {
                long waitTime = probe.getNanosToWaitForRefill() / 1_000_000;
                response.addHeader("X-Rate-Limit-Retry-After-Milliseconds", String.valueOf(waitTime));
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"success\":false,\"message\":\"Rate limit exceeded. Please try again later.\"}");
            }
            return;
        }

        Bucket generalBucket = resolveBucket("general:" + clientIp, false);
        ConsumptionProbe probe = generalBucket.tryConsumeAndReturnRemaining(1);
        if (probe.isConsumed()) {
            response.addHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
            filterChain.doFilter(request, response);
        } else {
            long waitTime = probe.getNanosToWaitForRefill() / 1_000_000;
            response.addHeader("X-Rate-Limit-Retry-After-Milliseconds", String.valueOf(waitTime));
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"Rate limit exceeded. Please try again later.\"}");
        }
    }

    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}
