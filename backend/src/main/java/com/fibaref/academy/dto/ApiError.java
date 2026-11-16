package com.fibaref.academy.dto;

import java.time.Instant;
import java.util.Map;

public record ApiError(
        int status,
        String error,
        String message,
        Map<String, String> fieldErrors,
        Instant timestamp
) {
    public ApiError(int status, String error, String message) {
        this(status, error, message, null, Instant.now());
    }
}
