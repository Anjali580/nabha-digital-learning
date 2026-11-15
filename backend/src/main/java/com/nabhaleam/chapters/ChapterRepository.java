package com.nabhaleam.chapters;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ChapterRepository extends MongoRepository<Chapter, String> {

    List<Chapter> findBySubjectIdAndActiveTrueOrderByOrderAsc(String subjectId);

    Optional<Chapter> findByIdAndActiveTrue(String id);

    long countBySubjectIdAndActiveTrue(String subjectId);
}
