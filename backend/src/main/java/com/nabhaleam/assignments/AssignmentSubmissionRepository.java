package com.nabhaleam.assignments;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface AssignmentSubmissionRepository extends MongoRepository<AssignmentSubmission, String> {

    Optional<AssignmentSubmission> findByAssignmentIdAndStudentId(String assignmentId, String studentId);

    List<AssignmentSubmission> findByStudentIdOrderBySubmittedAtDesc(String studentId);

    List<AssignmentSubmission> findByAssignmentId(String assignmentId);

    List<AssignmentSubmission> findByStudentIdAndStatusIn(String studentId, Collection<SubmissionStatus> statuses);

    long countByStudentIdAndStatusIn(String studentId, Collection<SubmissionStatus> statuses);

    boolean existsByAssignmentIdAndStudentId(String assignmentId, String studentId);
}
