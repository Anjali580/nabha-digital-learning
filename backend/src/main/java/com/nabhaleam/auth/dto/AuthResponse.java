package com.nabhaleam.auth.dto;

import com.nabhaleam.users.UserSummary;

/**
 * The token is included as a fallback for browsers that block third-party
 * cookies. The HttpOnly cookie remains the primary session mechanism.
 */
public record AuthResponse(UserSummary user, String token) {
}
