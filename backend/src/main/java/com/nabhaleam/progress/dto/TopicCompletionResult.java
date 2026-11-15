package com.nabhaleam.progress.dto;

import java.time.Instant;

public record TopicCompletionResult(
        String topicId,
        Instant completedAt,
        boolean alreadyCompleted,
        int completedTopics,
        int totalTopics,
        double overallPercentage,
        String subjectId,
        int subjectCompletedTopics,
        int subjectTotalTopics,
        double subjectPercentage
) {
}
