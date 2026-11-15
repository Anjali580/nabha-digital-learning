package com.nabhaleam.security;

import com.nabhaleam.common.ApiException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static NabhaUserPrincipal currentPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof NabhaUserPrincipal principal)) {
            throw ApiException.unauthorized("Please sign in to continue.");
        }
        return principal;
    }

    public static String currentUserId() {
        return currentPrincipal().getId();
    }

    public static NabhaUserPrincipal currentPrincipalOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof NabhaUserPrincipal principal) {
            return principal;
        }
        return null;
    }

    public static String currentUserIdOrNull() {
        NabhaUserPrincipal principal = currentPrincipalOrNull();
        return principal == null ? null : principal.getId();
    }
}
