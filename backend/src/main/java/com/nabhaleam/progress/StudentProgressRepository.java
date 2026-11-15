package com.nabhaleam.progress;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface StudentProgressRepository extends MongoRepository<StudentProgress, String> {

    Optional<StudentProgress> findByStudentId(String studentId);

    List<StudentProgress> findByStudentIdIn(Collection<String> studentIds);
}
