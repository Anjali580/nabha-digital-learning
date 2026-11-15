package com.nabhaleam.auth.dto;

import com.nabhaleam.users.StudentPreferences;

public record PreferencesDto(
        String language,
        String theme,
        boolean emailNotifications,
        boolean assignmentReminders,
        int dailyGoalTopics
) {
    public static PreferencesDto from(StudentPreferences preferences) {
        if (preferences == null) {
            return new PreferencesDto("en", "light", true, true, 2);
        }
        return new PreferencesDto(preferences.getLanguage(), preferences.getTheme(),
                preferences.isEmailNotifications(), preferences.isAssignmentReminders(),
                preferences.getDailyGoalTopics());
    }
}
