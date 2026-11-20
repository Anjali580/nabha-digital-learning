package com.nabhaleam.admin.dto;

import java.util.List;

public record AdminDashboardDto(
        long totalStudents,
        long activeStudents,
        long totalTeachers,
        long activeTeachers,
        long totalAdmins,
        long activeAdmins,
        long totalClasses,
        long totalSubjects,
        long totalTopics,
        long totalQuizzes,
        long publishedAssignments,
        long totalSubmissions,
        long pendingReviews,
        List<ClassRow> classes,
        List<AdminUserDto> recentUsers
) {
    public record ClassRow(
            String id,
            String name,
            int level,
            long students,
            long assignments
    ) {
    }
}
