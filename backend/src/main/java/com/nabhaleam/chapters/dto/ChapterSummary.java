package com.nabhaleam.chapters.dto;

public record ChapterSummary(
        String id,
        String title,
        String description,
        int order,
        int topicCount,
        int completedCount
) {
}
