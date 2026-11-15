package com.nabhaleam.quizzes;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface QuizAttemptRepository extends MongoRepository<QuizAttempt, String> {

    Optional<QuizAttempt> findByIdAndStudentId(String id, String studentId);

    Optional<QuizAttempt> findFirstByStudentIdAndQuizIdAndStatusOrderByStartedAtDesc(
            String studentId, String quizId, AttemptStatus status);

    List<QuizAttempt> findByStudentIdAndStatusOrderBySubmittedAtDesc(String studentId, AttemptStatus status);

    Page<QuizAttempt> findByStudentIdAndStatus(String studentId, AttemptStatus status, Pageable pageable);

    List<QuizAttempt> findByStudentIdAndQuizIdAndStatusOrderBySubmittedAtDesc(
            String studentId, String quizId, AttemptStatus status);

    long countByStudentIdAndStatus(String studentId, AttemptStatus status);

    void deleteByStudentId(String studentId);
}
