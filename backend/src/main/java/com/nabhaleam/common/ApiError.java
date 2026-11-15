package com.nabhaleam.common;

import java.time.Instant;
import java.util.Map;

public record ApiError(boolean success, String message, Map<String, String> errors, Instant timestamp) {

    public static ApiError of(String message) {
        return new ApiError(false, message, null, Instant.now());
    }

    public static ApiError of(String message, Map<String, String> errors) {
        return new ApiError(false, message, errors, Instant.now());
    }
}
