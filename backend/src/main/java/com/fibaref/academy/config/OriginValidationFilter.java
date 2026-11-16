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
import java.net.URI;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Validates Origin/Referer on state-changing API requests (POST, PUT, PATCH, DELETE)
 * to mitigate cross-site request forgery (CSRF) on cookie-authenticated endpoints.
 */
@Component
public class OriginValidationFilter extends OncePerRequestFilter {

    private static final Set<String> SAFE_METHODS = Set.of("GET", "HEAD", "OPTIONS", "TRACE");
    private final Set<String> allowedOrigins;

    public OriginValidationFilter(@Value("${app.cors.allowed-origins}") String allowedOriginsCsv) {
        this.allowedOrigins = Arrays.stream(allowedOriginsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(OriginValidationFilter::normalizeOrigin)
                .collect(Collectors.toSet());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        if (path.startsWith("/api/") && !SAFE_METHODS.contains(method.toUpperCase())) {
            String origin = request.getHeader("Origin");
            if (origin != null && !origin.isBlank()) {
                if (!isAllowedOrigin(origin, request)) {
                    rejectCrossOrigin(response);
                    return;
                }
            } else {
                String referer = request.getHeader("Referer");
                if (referer != null && !referer.isBlank() && !isAllowedOrigin(referer, request)) {
                    rejectCrossOrigin(response);
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAllowedOrigin(String rawOriginOrUrl, HttpServletRequest request) {
        String normalized = normalizeOrigin(rawOriginOrUrl);
        if (normalized == null) {
            return false;
        }
        if (allowedOrigins.contains(normalized)) {
            return true;
        }
        String serverOrigin = normalizeOrigin(
                request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort()
        );
        return normalized.equals(serverOrigin);
    }

    private static String normalizeOrigin(String url) {
        try {
            URI uri = URI.create(url.trim());
            if (uri.getScheme() == null || uri.getHost() == null) {
                return null;
            }
            int port = uri.getPort();
            String portSuffix = port > 0 ? ":" + port : "";
            return (uri.getScheme() + "://" + uri.getHost() + portSuffix).toLowerCase();
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private void rejectCrossOrigin(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"status\":403,\"error\":\"Forbidden\",\"message\":\"Cross-origin state-changing request rejected.\"}");
    }
}
