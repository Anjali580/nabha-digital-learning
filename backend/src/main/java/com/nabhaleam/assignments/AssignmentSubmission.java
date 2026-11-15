package com.nabhaleam.assignments;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "assignmentSubmissions")
@CompoundIndex(name = "submission_unique", def = "{'assignmentId': 1, 'studentId': 1}", unique = true)
public class AssignmentSubmission {

    @Id
    private String id;

    @Indexed
    private String assignmentId;

    @Indexed
    private String studentId;

    private String text;

    private String fileId;

    private String fileName;

    private String contentType;

    private long fileSize;

    private Instant submittedAt;

    private SubmissionStatus status;

    private Integer marks;

    private String feedback;

    private Instant reviewedAt;

    private String reviewedBy;
}
