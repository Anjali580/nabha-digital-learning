package com.nabhaleam.chapters;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "chapters")
@CompoundIndex(name = "chapter_subject_order", def = "{'subjectId': 1, 'order': 1}")
public class Chapter {

    @Id
    private String id;

    private String subjectId;

    private String classId;

    private String title;

    private String description;

    private int order;

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private boolean seeded = false;
}
