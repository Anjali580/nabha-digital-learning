package com.nabhaleam.topics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "topics")
@CompoundIndex(name = "topic_chapter_order", def = "{'chapterId': 1, 'order': 1}")
@CompoundIndex(name = "topic_subject_order", def = "{'subjectId': 1, 'order': 1}")
public class Topic {

    @Id
    private String id;

    private String chapterId;

    @Indexed
    private String subjectId;

    @Indexed
    private String classId;

    private String title;

    private String summary;

    private int order;

    @Builder.Default
    private int estimatedMinutes = 10;

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private boolean seeded = false;
}
