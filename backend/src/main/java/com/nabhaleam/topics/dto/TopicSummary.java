package com.nabhaleam.topics.dto;

public record TopicSummary(
        String id,
        String title,
        String summary,
        int order,
        int estimatedMinutes,
        String chapterId,
        boolean completed
) {
}
