package com.nabhaleam.assignments;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface AssignmentRepository extends MongoRepository<Assignment, String> {

    List<Assignment> findByClassIdAndPublishedTrueOrderByDueDateAsc(String classId);

    List<Assignment> findByPublishedTrue();

    Optional<Assignment> findByIdAndPublishedTrue(String id);

    long countByClassIdAndPublishedTrue(String classId);
}
