package com.nabhaleam.quizzes;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "quizzes")
@CompoundIndex(name = "quiz_class_published", def = "{'classId': 1, 'published': 1}")
public class Quiz {

    @Id
    private String id;

    private String title;

    private String description;

    @Indexed
    private String classId;

    @Indexed
    private String subjectId;

    private String chapterId;

    private String topicId;

    @Builder.Default
    private int durationMinutes = 10;

    @Builder.Default
    private int totalMarks = 0;

    @Builder.Default
    private boolean published = true;

    @Builder.Default
    private List<QuizQuestion> questions = new ArrayList<>();

    @Builder.Default
    private boolean seeded = false;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
