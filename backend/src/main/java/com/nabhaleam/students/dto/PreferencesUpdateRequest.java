package com.nabhaleam.students.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;

public record PreferencesUpdateRequest(
        @Pattern(regexp = "en|hi|pa", message = "Choose English, Hindi or Punjabi.")
        String language,

        @Pattern(regexp = "light|dark", message = "Choose a light or dark theme.")
        String theme,

        boolean emailNotifications,

        boolean assignmentReminders,

        @Min(value = 1, message = "Set a goal of at least 1 topic per day.")
        @Max(value = 10, message = "Set a goal of no more than 10 topics per day.")
        int dailyGoalTopics
) {
}
