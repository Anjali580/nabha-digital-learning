package com.nabhaleam.subjects.dto;

import com.nabhaleam.chapters.dto.ChapterSummary;

import java.util.List;

public record SubjectDetail(
        String id,
        String classId,
        String name,
        String slug,
        String description,
        String icon,
        String color,
        int chapterCount,
        int topicCount,
        int completedTopics,
        double progressPercentage,
        List<ChapterSummary> chapters
) {
}
