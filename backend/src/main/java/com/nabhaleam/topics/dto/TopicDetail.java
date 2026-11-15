package com.nabhaleam.topics.dto;

import com.nabhaleam.learningcontent.dto.LearningContentDto;

import java.util.List;

public record TopicDetail(
        String id,
        String chapterId,
        String chapterTitle,
        String subjectId,
        String subjectName,
        String subjectIcon,
        String subjectColor,
        String classId,
        String title,
        String summary,
        int order,
        int estimatedMinutes,
        boolean completed,
        String bookmarkId,
        LearningContentDto content,
        String previousTopicId,
        String previousTopicTitle,
        String nextTopicId,
        String nextTopicTitle,
        List<TopicSummary> relatedTopics,
        boolean seeded
) {
}
