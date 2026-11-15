package com.nabhaleam.auth.dto;

import com.nabhaleam.users.UserSummary;

public record MeResponse(UserSummary user, PreferencesDto preferences) {
}
