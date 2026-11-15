package com.nabhaleam.assignments;

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
@Document(collection = "assignments")
@CompoundIndex(name = "assignment_class_due", def = "{'classId': 1, 'dueDate': 1}")
public class Assignment {

    @Id
    private String id;

    @Indexed
    private String classId;

    private String subjectId;

    private String title;

    private String description;

    @Builder.Default
    private List<String> instructions = new ArrayList<>();

    private Instant assignedDate;

    private Instant dueDate;

    @Builder.Default
    private int maxMarks = 10;

    @Builder.Default
    private List<AssignmentAttachment> attachments = new ArrayList<>();

    @Builder.Default
    private boolean published = true;

    @Builder.Default
    private boolean seeded = false;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignmentAttachment {
        private String name;
        private String url;
        private String contentType;
    }
}
