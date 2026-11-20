package com.nabhaleam.users;

import java.time.Instant;

public record UserSummary(
        String id,
        String fullName,
        String email,
        String role,
        String classId,
        String className,
        String degree,
        String schoolName,
        String preferredLanguage,
        String avatarUrl,
        boolean demo
) {
    public static UserSummary from(User user) {
        String avatarUrl = user.getAvatarFileId() == null ? null : "/api/files/" + user.getAvatarFileId();
        return new UserSummary(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                user.getClassId(),
                user.getClassName(),
                user.getDegree(),
                user.getSchoolName(),
                user.getPreferredLanguage(),
                avatarUrl,
                user.isDemo());
    }
}
