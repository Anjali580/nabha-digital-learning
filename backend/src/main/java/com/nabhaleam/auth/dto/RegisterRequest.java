package com.nabhaleam.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Full name is required.")
        @Size(min = 2, max = 80, message = "Full name must be between 2 and 80 characters.")
        String fullName,

        @NotBlank(message = "Email is required.")
        @Email(message = "Enter a valid email address.")
        @Size(max = 160, message = "Email is too long.")
        String email,

        @NotBlank(message = "Password is required.")
        @Size(min = 8, max = 72, message = "Password must be 8 to 72 characters long.")
        String password,

        @NotBlank(message = "Please confirm your password.")
        String confirmPassword,

        @NotBlank(message = "Please select your class.")
        String classId,

        @Size(max = 120, message = "School name is too long.")
        String schoolName,

        @Pattern(regexp = "en|hi|pa", message = "Choose English, Hindi or Punjabi.")
        String preferredLanguage
) {
}
