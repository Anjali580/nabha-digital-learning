package com.nabhaleam.progress;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "studentProgress")
public class StudentProgress {

    @Id
    private String id;

    @Indexed(unique = true)
    private String studentId;

    @Builder.Default
    private List<String> completedTopicIds = new ArrayList<>();

    @Builder.Default
    private List<TopicCompletion> completions = new ArrayList<>();

    @Builder.Default
    private List<TopicAccess> recentAccess = new ArrayList<>();

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopicCompletion {
        private String topicId;
        private String subjectId;
        private Instant completedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopicAccess {
        private String topicId;
        private String subjectId;
        private Instant accessedAt;
    }
}
