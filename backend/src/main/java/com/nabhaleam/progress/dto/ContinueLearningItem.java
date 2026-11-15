package com.nabhaleam.progress.dto;

import java.time.Instant;

public record ContinueLearningItem(
        String topicId,
        String title,
        String subjectId,
        String subjectName,
        String subjectIcon,
        String subjectColor,
        String chapterId,
        String chapterTitle,
        int estimatedMinutes,
        boolean completed,
        Instant accessedAt
) {
}
