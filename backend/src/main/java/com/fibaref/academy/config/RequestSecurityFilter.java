package com.fibaref.academy.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Defense-in-depth HTTP request/response filter:
 * 1. Blocks null bytes, CRLF injection, path traversal, and common SQL injection probe syntax in query/path parameters.
 * 2. Strips unnecessary identifying response headers (Server, X-Powered-By, etc.) to reduce reconnaissance exposure.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestSecurityFilter extends OncePerRequestFilter {

    private static final Pattern PATH_TRAVERSAL_PATTERN = Pattern.compile("(\\.\\./|\\.\\.\\\\|%2e%2e)", Pattern.CASE_INSENSITIVE);
    private static final Pattern SQLI_PROBE_PATTERN = Pattern.compile(
            "(?i)(\\bunion\\s+(all\\s+)?select\\b|\\bwaitfor\\s+delay\\b|\\b(pg_)?sleep\\s*\\(|\\bbenchmark\\s*\\(|;\\s*(drop|alter|truncate|delete|insert|update)\\b|['\\\"]\\s*(or|and)\\s+['\\\"]?\\d+['\\\"]?\\s*=\\s*['\\\"]?\\d+|--\\s|/\\*.*\\*/)"
    );
    private static final Set<String> HIDDEN_RESPONSE_HEADERS = Set.of(
            "server",
            "x-powered-by",
            "x-aspnet-version",
            "x-aspnetmvc-version",
            "x-generator"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestUri = request.getRequestURI();
        String queryString = request.getQueryString();
        if (containsUnsafeSequence(requestUri) || containsUnsafeQueryPayload(queryString)) {
            rejectSuspiciousRequest(response);
            return;
        }

        // Reject null bytes or CRLF sequences in parameter values (skipping multipart binary bodies)
        String contentType = request.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("multipart/")) {
            Enumeration<String> paramNames = request.getParameterNames();
            while (paramNames.hasMoreElements()) {
                String name = paramNames.nextElement();
                String[] values = request.getParameterValues(name);
                if (values != null) {
                    for (String v : values) {
                        if (containsControlOrSqli(v)) {
                            rejectSuspiciousRequest(response);
                            return;
                        }
                    }
                }
            }
        }

        HttpServletResponse sanitizedResponse = new HeaderSanitizingResponseWrapper(response);
        filterChain.doFilter(request, sanitizedResponse);
    }

    private boolean containsUnsafeSequence(String rawPath) {
        if (rawPath == null) {
            return false;
        }
        if (rawPath.indexOf('\0') >= 0 || rawPath.contains("%00")) {
            return true;
        }
        String decoded = decodeLeniently(rawPath);
        return PATH_TRAVERSAL_PATTERN.matcher(rawPath).find()
                || PATH_TRAVERSAL_PATTERN.matcher(decoded).find()
                || decoded.indexOf('\0') >= 0;
    }

    private boolean containsUnsafeQueryPayload(String rawQuery) {
        if (rawQuery == null || rawQuery.isBlank()) {
            return false;
        }
        if (rawQuery.indexOf('\0') >= 0 || rawQuery.contains("%00")) {
            return true;
        }
        String decoded = decodeLeniently(rawQuery);
        return SQLI_PROBE_PATTERN.matcher(rawQuery).find()
                || SQLI_PROBE_PATTERN.matcher(decoded).find()
                || PATH_TRAVERSAL_PATTERN.matcher(decoded).find();
    }

    private boolean containsControlOrSqli(String val) {
        if (val == null) {
            return false;
        }
        if (val.indexOf('\0') >= 0) {
            return true;
        }
        return SQLI_PROBE_PATTERN.matcher(val).find()
                || PATH_TRAVERSAL_PATTERN.matcher(val).find();
    }

    private String decodeLeniently(String input) {
        try {
            return URLDecoder.decode(input, StandardCharsets.UTF_8);
        } catch (IllegalArgumentException ex) {
            return input;
        }
    }

    private void rejectSuspiciousRequest(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.BAD_REQUEST.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"status\":400,\"error\":\"Bad Request\",\"message\":\"Request contains invalid or disallowed characters.\"}");
    }

    private static final class HeaderSanitizingResponseWrapper extends HttpServletResponseWrapper {

        HeaderSanitizingResponseWrapper(HttpServletResponse response) {
            super(response);
        }

        @Override
        public void setHeader(String name, String value) {
            if (name != null && HIDDEN_RESPONSE_HEADERS.contains(name.toLowerCase())) {
                return;
            }
            super.setHeader(name, value);
        }

        @Override
        public void addHeader(String name, String value) {
            if (name != null && HIDDEN_RESPONSE_HEADERS.contains(name.toLowerCase())) {
                return;
            }
            super.addHeader(name, value);
        }
    }
}
