package com.nabhaleam.learningcontent;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Structured learning material for a topic. Content is stored as typed blocks
 * (never raw HTML) so the frontend can render it safely.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "learningContents")
public class LearningContent {

    @Id
    private String id;

    @Indexed(unique = true)
    private String topicId;

    @Builder.Default
    private List<ContentSection> sections = new ArrayList<>();

    @Builder.Default
    private List<ContentDefinition> definitions = new ArrayList<>();

    @Builder.Default
    private List<String> notes = new ArrayList<>();

    @Builder.Default
    private List<ContentExample> examples = new ArrayList<>();

    @Builder.Default
    private List<MediaRef> images = new ArrayList<>();

    @Builder.Default
    private List<MediaRef> videos = new ArrayList<>();

    @Builder.Default
    private List<String> applications = new ArrayList<>();

    @Builder.Default
    private List<String> keyPoints = new ArrayList<>();

    @Builder.Default
    private List<PracticeQuestion> practiceQuestions = new ArrayList<>();

    @Builder.Default
    private List<String> relatedTopicIds = new ArrayList<>();

    @LastModifiedDate
    private Instant updatedAt;

    @Builder.Default
    private boolean seeded = false;
}
