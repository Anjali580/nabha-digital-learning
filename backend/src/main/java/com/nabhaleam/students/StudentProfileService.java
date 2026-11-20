package com.nabhaleam.students;

import com.nabhaleam.auth.dto.PreferencesDto;
import com.nabhaleam.classes.SchoolClass;
import com.nabhaleam.classes.SchoolClassRepository;
import com.nabhaleam.common.ApiException;
import com.nabhaleam.config.AppProperties;
import com.nabhaleam.files.FilePurpose;
import com.nabhaleam.files.FileStorageService;
import com.nabhaleam.files.StoredFile;
import com.nabhaleam.files.StoredFileRepository;
import com.nabhaleam.students.dto.*;
import com.nabhaleam.users.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StudentProfileService {

    private static final String PASSWORD_PATTERN = "^(?=.*[A-Za-z])(?=.*\\d).{8,72}$";

    private final UserRepository userRepository;
    private final StudentPreferencesRepository preferencesRepository;
    private final SchoolClassRepository classRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;
    private final StoredFileRepository fileRepository;

    public ProfileResponse profile(User student) {
        StudentPreferences preferences = preferencesRepository.findByStudentId(student.getId()).orElse(null);
        return new ProfileResponse(UserSummary.from(student), PreferencesDto.from(preferences));
    }

    public ProfileResponse update(User student, UpdateProfileRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        Map<String, String> errors = new LinkedHashMap<>();

        boolean emailChanged = !email.equalsIgnoreCase(student.getEmail());
        if (emailChanged) {
            if (request.currentPassword() == null || request.currentPassword().isBlank()
                    || !passwordEncoder.matches(request.currentPassword(), student.getPasswordHash())) {
                errors.put("currentPassword", "Enter your current password to change your email address.");
            }
            userRepository.findByEmailIgnoreCase(email)
                    .filter(other -> !other.getId().equals(student.getId()))
                    .ifPresent(other -> errors.put("email", "Another account already uses this email address."));
        }

        boolean teacher = student.getRole() == Role.TEACHER;
        boolean staff = teacher || student.getRole() == Role.ADMIN;
        SchoolClass schoolClass = null;
        if (teacher) {
            if (request.degree() == null || request.degree().isBlank()) {
                errors.put("degree", "Please add your teaching degree or qualification.");
            }
        } else if (!staff) {
            schoolClass = classRepository.findById(request.classId() == null ? "" : request.classId())
                    .filter(SchoolClass::isActive)
                    .orElse(null);
            if (schoolClass == null) {
                errors.put("classId", "Please choose a valid class.");
            }
        }
        if (!errors.isEmpty()) {
            throw ApiException.validation(errors);
        }

        student.setFullName(request.fullName().trim());
        student.setEmail(email);
        if (staff) {
            student.setClassId(null);
            student.setClassName(null);
            if (request.degree() != null) {
                student.setDegree(request.degree().isBlank() ? null : request.degree().trim());
            }
        } else {
            student.setClassId(schoolClass.getId());
            student.setClassName(schoolClass.getName());
        }
        student.setSchoolName(request.schoolName() == null || request.schoolName().isBlank()
                ? null : request.schoolName().trim());
        if (request.preferredLanguage() != null) {
            student.setPreferredLanguage(request.preferredLanguage());
        }
        User saved = userRepository.save(student);

        StudentPreferences preferences = preferencesRepository.findByStudentId(student.getId())
                .orElseGet(() -> StudentPreferences.builder().studentId(student.getId()).build());
        if (request.preferredLanguage() != null) {
            preferences.setLanguage(request.preferredLanguage());
            preferencesRepository.save(preferences);
        }
        return new ProfileResponse(UserSummary.from(saved), PreferencesDto.from(preferences));
    }

    public void changePassword(User student, ChangePasswordRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        if (!passwordEncoder.matches(request.currentPassword(), student.getPasswordHash())) {
            errors.put("currentPassword", "Your current password is incorrect.");
        }
        if (!request.newPassword().equals(request.confirmPassword())) {
            errors.put("confirmPassword", "The new passwords do not match.");
        }
        if (!request.newPassword().matches(PASSWORD_PATTERN)) {
            errors.put("newPassword", "Use at least 8 characters with at least one letter and one number.");
        }
        if (request.currentPassword().equals(request.newPassword())) {
            errors.put("newPassword", "Choose a password that is different from your current one.");
        }
        if (!errors.isEmpty()) {
            throw ApiException.validation(errors);
        }
        student.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(student);
    }

    public PreferencesDto updatePreferences(User student, PreferencesUpdateRequest request) {
        StudentPreferences preferences = preferencesRepository.findByStudentId(student.getId())
                .orElseGet(() -> StudentPreferences.builder()
                        .studentId(student.getId())
                        .language("en")
                        .theme("light")
                        .emailNotifications(true)
                        .assignmentReminders(true)
                        .dailyGoalTopics(2)
                        .build());
        if (request.language() != null) {
            preferences.setLanguage(request.language());
            student.setPreferredLanguage(request.language());
            userRepository.save(student);
        }
        if (request.theme() != null) {
            preferences.setTheme(request.theme());
        }
        preferences.setEmailNotifications(request.emailNotifications());
        preferences.setAssignmentReminders(request.assignmentReminders());
        preferences.setDailyGoalTopics(request.dailyGoalTopics());
        return PreferencesDto.from(preferencesRepository.save(preferences));
    }

    public UserSummary updateAvatar(User student, MultipartFile file) {
        StoredFile stored = fileStorageService.store(file, student.getId(), FilePurpose.AVATAR);
        String previous = student.getAvatarFileId();
        student.setAvatarFileId(stored.getId());
        User saved = userRepository.save(student);
        if (previous != null && !previous.equals(stored.getId())) {
            fileRepository.findById(previous).ifPresent(fileStorageService::deleteQuietly);
        }
        return UserSummary.from(saved);
    }
}
