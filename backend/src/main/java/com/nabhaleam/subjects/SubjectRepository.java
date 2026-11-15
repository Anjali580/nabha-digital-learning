package com.nabhaleam.subjects;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends MongoRepository<Subject, String> {

    List<Subject> findByClassIdAndActiveTrueOrderByOrderAsc(String classId);

    Optional<Subject> findByIdAndActiveTrue(String id);

    long countByClassIdAndActiveTrue(String classId);
}
