package com.nabhaleam.teacher.dto;

import java.time.Instant;
import java.util.List;

public record TeacherDashboardResponse(
        String firstName,
        String fullName,
        String degree,
        String schoolName,
        long totalStudents,
        long totalClasses,
        long totalAssignments,
        long pendingReviews,
        long unreadNotifications,
        List<ClassSummary> classes,
        List<AssignmentRow> assignments,
        List<StudentRow> students,
        List<SubmissionRow> recentSubmissions
) {
    public record ClassSummary(
            String id,
            String name,
            int level,
            long studentCount,
            long assignmentCount
    ) {
    }

    public record AssignmentRow(
            String id,
            String title,
            String classId,
            String className,
            String subjectName,
            Instant dueDate,
            long submittedCount,
            long totalStudents,
            long pendingReviews
    ) {
    }

    public record StudentRow(
            String id,
            String fullName,
            String email,
            String classId,
            String className,
            String schoolName,
            int completedTopics,
            long quizAttempts,
            double averageQuizPercentage,
            long submittedAssignments,
            long pendingAssignments,
            Instant lastActiveAt
    ) {
    }

    public record SubmissionRow(
            String id,
            String assignmentId,
            String assignmentTitle,
            String studentId,
            String studentName,
            Instant submittedAt,
            String status,
            Integer marks,
            int maxMarks
    ) {
    }
}
