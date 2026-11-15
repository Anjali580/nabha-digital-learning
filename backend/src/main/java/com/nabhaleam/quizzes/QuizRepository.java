package com.nabhaleam.quizzes;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface QuizRepository extends MongoRepository<Quiz, String> {

    List<Quiz> findByPublishedTrueAndClassId(String classId);

    List<Quiz> findByPublishedTrueAndClassIdAndSubjectId(String classId, String subjectId);

    Optional<Quiz> findByIdAndPublishedTrue(String id);
}
