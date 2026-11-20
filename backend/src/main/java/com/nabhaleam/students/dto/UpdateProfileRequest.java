package com.nabhaleam.students.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "Full name is required.")
        @Size(min = 2, max = 80, message = "Full name must be between 2 and 80 characters.")
        String fullName,

        @NotBlank(message = "Email is required.")
        @Email(message = "Enter a valid email address.")
        @Size(max = 160, message = "Email is too long.")
        String email,

        String classId,

        @Size(max = 120, message = "Degree is too long.")
        String degree,

        @Size(max = 120, message = "School name is too long.")
        String schoolName,

        @Pattern(regexp = "en|hi|pa", message = "Choose English, Hindi or Punjabi.")
        String preferredLanguage,

        /** Required only when the email address is being changed. */
        String currentPassword
) {
}
