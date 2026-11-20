package com.nabhaleam.auth;

import com.nabhaleam.auth.dto.*;
import com.nabhaleam.classes.SchoolClass;
import com.nabhaleam.classes.SchoolClassRepository;
import com.nabhaleam.common.ApiException;
import com.nabhaleam.config.AppProperties;
import com.nabhaleam.notifications.NotificationService;
import com.nabhaleam.notifications.NotificationType;
import com.nabhaleam.security.JwtService;
import com.nabhaleam.users.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String PASSWORD_PATTERN = "^(?=.*[A-Za-z])(?=.*\\d).{8,72}$";

    private final UserRepository users;
    private final StudentPreferencesRepository preferencesRepository;
    private final SchoolClassRepository classRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final NotificationService notificationService;
    private final AppProperties properties;

    public AuthResult register(RegisterRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        Role role = parseRole(request.role());
        boolean admin = role == Role.ADMIN;
        boolean teacher = role == Role.TEACHER;

        if (!request.password().equals(request.confirmPassword())) {
            errors.put("confirmPassword", "Passwords do not match.");
        }
        if (!request.password().matches(PASSWORD_PATTERN)) {
            errors.put("password", "Use at least 8 characters with at least one letter and one number.");
        }
        if (users.existsByEmailIgnoreCase(email)) {
            errors.put("email", "An account with this email already exists.");
        }

        SchoolClass schoolClass = null;
        if (role == Role.STUDENT) {
            schoolClass = classRepository.findById(request.classId() == null ? "" : request.classId())
                    .filter(SchoolClass::isActive)
                    .orElse(null);
            if (schoolClass == null) {
                errors.put("classId", "Please choose a valid class.");
            }
        } else if (teacher) {
            if (request.degree() == null || request.degree().isBlank()) {
                errors.put("degree", "Please add your teaching degree or qualification.");
            }
        } else if (admin) {
            String expected = properties.getDemo().getAdminInviteCode();
            if (expected != null && !expected.isBlank()
                    && (request.adminCode() == null || !request.adminCode().trim().equalsIgnoreCase(expected))) {
                errors.put("adminCode", "Enter the admin invite code from your school office.");
            }
        }

        if (!errors.isEmpty()) {
            throw ApiException.validation(errors);
        }

        String language = request.preferredLanguage() == null ? "en" : request.preferredLanguage();
        User user = User.builder()
                .email(email)
                .fullName(request.fullName().trim())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(role)
                .active(true)
                .schoolName(blankToNull(request.schoolName()))
                .classId(schoolClass == null ? null : schoolClass.getId())
                .className(schoolClass == null ? null : schoolClass.getName())
                .degree(teacher ? request.degree().trim() : null)
                .preferredLanguage(language)
                .demo(false)
                .build();
        user = users.save(user);

        preferencesRepository.save(StudentPreferences.builder()
                .studentId(user.getId())
                .language(language)
                .theme("light")
                .emailNotifications(true)
                .assignmentReminders(true)
                .dailyGoalTopics(2)
                .build());

        notifyWelcome(user);
        log.info("Registered new {} {}", role.name().toLowerCase(Locale.ROOT), user.getId());
        return new AuthResult(UserSummary.from(user), jwtService.generateToken(user.getId(), user.getRole().name()));
    }

    private Role parseRole(String value) {
        if (value == null) return Role.STUDENT;
        try {
            return Role.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return Role.STUDENT;
        }
    }

    private void notifyWelcome(User user) {
        String name = firstName(user.getFullName());
        switch (user.getRole()) {
            case TEACHER -> notificationService.notify(user.getId(), NotificationType.WELCOME,
                    "Welcome to NabhaLearn, " + name + "!",
                    "Your teacher workspace is ready. Review classes, create assignments and follow student progress.",
                    "/app/teacher/dashboard", "welcome:" + user.getId());
            case ADMIN -> notificationService.notify(user.getId(), NotificationType.WELCOME,
                    "Welcome to NabhaLearn, " + name + "!",
                    "Your administrator workspace is ready. Manage school accounts, classes and teacher tools.",
                    "/app/admin/dashboard", "welcome:" + user.getId());
            default -> notificationService.notify(user.getId(), NotificationType.WELCOME,
                    "Welcome to NabhaLearn, " + name + "!",
                    "Start with a subject in Learn, then explore something new beyond your textbook.",
                    "/app/learn", "welcome:" + user.getId());
        }
    }

    public AuthResult login(LoginRequest request) {
        User user = users.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password."));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw ApiException.unauthorized("Invalid email or password.");
        }
        if (!user.isActive()) {
            throw ApiException.forbidden("This account has been disabled. Please contact your school.");
        }
        return new AuthResult(UserSummary.from(user), jwtService.generateToken(user.getId(), user.getRole().name()));
    }

    public MeResponse me(String userId) {
        User user = users.findById(userId)
                .orElseThrow(() -> ApiException.unauthorized("Your account could not be found."));
        StudentPreferences preferences = preferencesRepository.findByStudentId(userId).orElse(null);
        return new MeResponse(UserSummary.from(user), PreferencesDto.from(preferences));
    }

    private String firstName(String fullName) {
        return fullName == null ? "learner" : fullName.trim().split("\\s+")[0];
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    public record AuthResult(UserSummary user, String token) {
    }
}
