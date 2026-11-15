package com.nabhaleam.users;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "studentPreferences")
@CompoundIndex(name = "student_preferences_unique", def = "{'studentId': 1}", unique = true)
public class StudentPreferences {

    @Id
    private String id;

    private String studentId;

    @Builder.Default
    private String language = "en";

    @Builder.Default
    private String theme = "light";

    @Builder.Default
    private boolean emailNotifications = true;

    @Builder.Default
    private boolean assignmentReminders = true;

    @Builder.Default
    private int dailyGoalTopics = 2;

    @LastModifiedDate
    private Instant updatedAt;
}
