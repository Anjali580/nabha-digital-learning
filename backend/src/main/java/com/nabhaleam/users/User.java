package com.nabhaleam.users;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String fullName;

    private String passwordHash;

    @Indexed
    private Role role;

    private boolean active;

    private String schoolName;

    private String classId;

    private String className;

    /** Teacher qualification, for example "M.Sc., B.Ed." */
    private String degree;

    private String preferredLanguage;

    private String avatarFileId;

    private boolean demo;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
