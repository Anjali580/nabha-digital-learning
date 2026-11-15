package com.nabhaleam.auth.dto;

import com.nabhaleam.users.UserSummary;

public record AuthResponse(UserSummary user) {
}
