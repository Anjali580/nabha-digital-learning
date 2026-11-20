package com.nabhaleam.admin.dto;

import com.nabhaleam.users.User;

import java.time.Instant;

public record AdminUserDto(
        String id,
        String fullName,
        String email,
        String role,
        String className,
        String degree,
        String schoolName,
        boolean active,
        boolean demo,
        Instant createdAt
) {
    public static AdminUserDto from(User user) {
        return new AdminUserDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                user.getClassName(),
                user.getDegree(),
                user.getSchoolName(),
                user.isActive(),
                user.isDemo(),
                user.getCreatedAt());
    }
}
