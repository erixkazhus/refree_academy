package com.fibaref.academy.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Multi-tier, memory-bounded per-IP fixed-window rate limiter to mitigate
 * DDoS bursts, bandwidth floods, search amplification, and credential brute-forcing.
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int MAX_TRACKED_KEYS = 20_000;
    private static final long WINDOW_MS = 60_000L;

    private final int authLimitPerMinute;
    private final int heavyLimitPerMinute;
    private final int apiLimitPerMinute;
    private final int mediaLimitPerMinute;
    private final ConcurrentHashMap<String, WindowCounter> counters = new ConcurrentHashMap<>();

    public RateLimitingFilter(
            @Value("${app.rate-limit.auth-requests-per-minute:10}") int authLimitPerMinute,
            @Value("${app.rate-limit.heavy-requests-per-minute:90}") int heavyLimitPerMinute,
            @Value("${app.rate-limit.api-requests-per-minute:240}") int apiLimitPerMinute,
            @Value("${app.rate-limit.media-requests-per-minute:450}") int mediaLimitPerMinute
    ) {
        this.authLimitPerMinute = authLimitPerMinute;
        this.heavyLimitPerMinute = heavyLimitPerMinute;
        this.apiLimitPerMinute = apiLimitPerMinute;
        this.mediaLimitPerMinute = mediaLimitPerMinute;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        if (!path.startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String bucketScope;
        int limit;

        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register")) {
            bucketScope = "auth";
            limit = authLimitPerMinute;
        } else if (path.startsWith("/api/videos/") && "GET".equalsIgnoreCase(request.getMethod())) {
            bucketScope = "media";
            limit = mediaLimitPerMinute;
        } else if (isHeavyEndpoint(path)) {
            bucketScope = "heavy";
            limit = heavyLimitPerMinute;
        } else {
            bucketScope = "api";
            limit = apiLimitPerMinute;
        }

        long now = System.currentTimeMillis();
        if (counters.size() > MAX_TRACKED_KEYS) {
            evictExpired(now);
        }

        String clientKey = bucketScope + ":" + extractClientIp(request);
        WindowCounter counter = counters.computeIfAbsent(clientKey, k -> new WindowCounter(now));
        if (!counter.tryAcquire(now, limit)) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", "60");
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded. Please wait before trying again.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isHeavyEndpoint(String path) {
        return "/api/questions".equals(path)
                || path.startsWith("/api/pdfs/")
                || (path.startsWith("/api/questions/") && path.endsWith("/answer"));
    }

    private void evictExpired(long now) {
        Iterator<Map.Entry<String, WindowCounter>> it = counters.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry<String, WindowCounter> entry = it.next();
            if (now - entry.getValue().windowStartMs.get() >= WINDOW_MS) {
                it.remove();
            }
        }
        // Only trim excess entries if all keys are genuinely active simultaneously
        if (counters.size() > MAX_TRACKED_KEYS) {
            Iterator<String> overflow = counters.keySet().iterator();
            int toDrop = counters.size() - (MAX_TRACKED_KEYS / 2);
            while (overflow.hasNext() && toDrop > 0) {
                overflow.next();
                overflow.remove();
                toDrop--;
            }
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        String remoteAddr = request.getRemoteAddr();
        return remoteAddr != null ? remoteAddr : "unknown";
    }

    private static final class WindowCounter {
        private final AtomicLong windowStartMs;
        private final AtomicInteger count = new AtomicInteger(0);

        WindowCounter(long now) {
            this.windowStartMs = new AtomicLong(now);
        }

        boolean tryAcquire(long now, int limit) {
            long start = windowStartMs.get();
            if (now - start >= WINDOW_MS) {
                if (windowStartMs.compareAndSet(start, now)) {
                    count.set(0);
                }
            }
            return count.incrementAndGet() <= limit;
        }
    }
}
