package com.nabhaleam.learningcontent.dto;

import com.nabhaleam.learningcontent.*;

import java.util.List;

public record LearningContentDto(
        List<ContentSection> sections,
        List<ContentDefinition> definitions,
        List<String> notes,
        List<ContentExample> examples,
        List<MediaRef> images,
        List<MediaRef> videos,
        List<String> applications,
        List<String> keyPoints,
        List<PracticeQuestion> practiceQuestions
) {
    public static LearningContentDto from(LearningContent content) {
        if (content == null) {
            return new LearningContentDto(List.of(), List.of(), List.of(), List.of(),
                    List.of(), List.of(), List.of(), List.of(), List.of());
        }
        return new LearningContentDto(content.getSections(), content.getDefinitions(), content.getNotes(),
                content.getExamples(), content.getImages(), content.getVideos(),
                content.getApplications(), content.getKeyPoints(), content.getPracticeQuestions());
    }
}
