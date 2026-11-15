package com.nabhaleam.students.dto;

import com.nabhaleam.auth.dto.PreferencesDto;
import com.nabhaleam.users.UserSummary;

public record ProfileResponse(UserSummary user, PreferencesDto preferences) {
}
