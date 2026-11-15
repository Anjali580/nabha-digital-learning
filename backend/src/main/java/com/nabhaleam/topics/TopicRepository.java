package com.nabhaleam.topics;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TopicRepository extends MongoRepository<Topic, String> {

    List<Topic> findByChapterIdAndActiveTrueOrderByOrderAsc(String chapterId);

    List<Topic> findBySubjectIdAndActiveTrueOrderByOrderAsc(String subjectId);

    List<Topic> findByClassIdAndActiveTrue(String classId);

    Optional<Topic> findByIdAndActiveTrue(String id);

    long countByClassIdAndActiveTrue(String classId);

    long countBySubjectIdAndActiveTrue(String subjectId);

    long countByChapterIdAndActiveTrue(String chapterId);
}
