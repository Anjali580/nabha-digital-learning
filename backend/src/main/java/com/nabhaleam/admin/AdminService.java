package com.nabhaleam.admin;

import com.nabhaleam.admin.dto.AdminDashboardDto;
import com.nabhaleam.admin.dto.AdminUserDto;
import com.nabhaleam.assignments.AssignmentRepository;
import com.nabhaleam.assignments.AssignmentSubmissionRepository;
import com.nabhaleam.assignments.SubmissionStatus;
import com.nabhaleam.classes.SchoolClass;
import com.nabhaleam.classes.SchoolClassRepository;
import com.nabhaleam.common.ApiException;
import com.nabhaleam.quizzes.QuizRepository;
import com.nabhaleam.security.SecurityUtils;
import com.nabhaleam.subjects.SubjectRepository;
import com.nabhaleam.topics.TopicRepository;
import com.nabhaleam.users.Role;
import com.nabhaleam.users.User;
import com.nabhaleam.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private static final List<SubmissionStatus> PENDING_STATUSES = List.of(
            SubmissionStatus.SUBMITTED, SubmissionStatus.UNDER_REVIEW, SubmissionStatus.LATE);

    private final UserRepository users;
    private final SchoolClassRepository classes;
    private final SubjectRepository subjects;
    private final TopicRepository topics;
    private final QuizRepository quizzes;
    private final AssignmentRepository assignments;
    private final AssignmentSubmissionRepository submissions;

    public User requireAdmin() {
        User user = users.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> ApiException.unauthorized("Your account could not be found."));
        if (user.getRole() != Role.ADMIN) {
            throw ApiException.forbidden("This area is available to administrators only.");
        }
        return user;
    }

    public AdminDashboardDto dashboard() {
        List<SchoolClass> activeClasses = classes.findByActiveTrueOrderByLevelAsc();
        List<AdminDashboardDto.ClassRow> classRows = activeClasses.stream()
                .map(item -> new AdminDashboardDto.ClassRow(
                        item.getId(),
                        item.getName(),
                        item.getLevel(),
                        users.findByRoleAndClassIdAndActiveTrue(Role.STUDENT, item.getId()).size(),
                        assignments.countByClassIdAndPublishedTrue(item.getId())))
                .toList();

        return new AdminDashboardDto(
                users.countByRole(Role.STUDENT),
                users.countByRoleAndActiveTrue(Role.STUDENT),
                users.countByRole(Role.TEACHER),
                users.countByRoleAndActiveTrue(Role.TEACHER),
                users.countByRole(Role.ADMIN),
                users.countByRoleAndActiveTrue(Role.ADMIN),
                activeClasses.size(),
                subjects.count(),
                topics.count(),
                quizzes.count(),
                assignments.findByPublishedTrue().size(),
                submissions.count(),
                submissions.countByStatusIn(PENDING_STATUSES),
                classRows,
                recentUsers(6));
    }

    public List<AdminUserDto> users(String roleFilter, String query) {
        Role filter = parseRole(roleFilter);
        String needle = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        return users.findAll().stream()
                .filter(user -> filter == null || user.getRole() == filter)
                .filter(user -> needle.isEmpty() || searchText(user).contains(needle))
                .sorted(newestFirst())
                .map(AdminUserDto::from)
                .toList();
    }

    public AdminUserDto setActive(String userId, boolean active) {
        User current = requireAdmin();
        User target = users.findById(userId)
                .orElseThrow(() -> ApiException.notFound("That account could not be found."));
        if (!active) {
            if (target.getId().equals(current.getId())) {
                throw ApiException.validation(Map.of("active", "You cannot deactivate your own account."));
            }
            if (target.getRole() == Role.ADMIN && users.countByRoleAndActiveTrue(Role.ADMIN) <= 1) {
                throw ApiException.validation(Map.of("active", "Keep at least one active administrator."));
            }
        }
        target.setActive(active);
        return AdminUserDto.from(users.save(target));
    }

    private List<AdminUserDto> recentUsers(int limit) {
        return users.findAll().stream()
                .sorted(newestFirst())
                .limit(limit)
                .map(AdminUserDto::from)
                .toList();
    }

    private static Comparator<User> newestFirst() {
        return Comparator.comparing(User::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder()));
    }

    private static String searchText(User user) {
        return String.join(" ",
                user.getFullName() == null ? "" : user.getFullName(),
                user.getEmail() == null ? "" : user.getEmail(),
                user.getClassName() == null ? "" : user.getClassName(),
                user.getRole() == null ? "" : user.getRole().name())
                .toLowerCase(Locale.ROOT);
    }

    private static Role parseRole(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Role.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
