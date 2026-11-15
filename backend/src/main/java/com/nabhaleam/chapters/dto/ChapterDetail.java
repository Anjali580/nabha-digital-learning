package com.nabhaleam.chapters.dto;

import com.nabhaleam.topics.dto.TopicSummary;

import java.util.List;

public record ChapterDetail(
        String id,
        String title,
        String description,
        int order,
        String subjectId,
        String subjectName,
        String subjectColor,
        String classId,
        int topicCount,
        int completedCount,
        List<TopicSummary> topics
) {
}
