package com.nabhaleam.subjects.dto;

public record SubjectDto(
        String id,
        String classId,
        String name,
        String slug,
        String description,
        String icon,
        String color,
        int chapterCount,
        int topicCount
) {
}
