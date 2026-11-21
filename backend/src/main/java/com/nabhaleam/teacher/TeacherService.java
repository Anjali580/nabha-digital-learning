package com.nabhaleam.teacher;

import com.nabhaleam.assignments.Assignment;
import com.nabhaleam.assignments.AssignmentRepository;
import com.nabhaleam.assignments.AssignmentSubmission;
import com.nabhaleam.assignments.AssignmentSubmissionRepository;
import com.nabhaleam.assignments.SubmissionStatus;
import com.nabhaleam.classes.SchoolClass;
import com.nabhaleam.classes.SchoolClassRepository;
import com.nabhaleam.common.ApiException;
import com.nabhaleam.notifications.NotificationService;
import com.nabhaleam.notifications.NotificationType;
import com.nabhaleam.progress.StudentProgress;
import com.nabhaleam.progress.StudentProgressRepository;
import com.nabhaleam.quizzes.QuizAttempt;
import com.nabhaleam.quizzes.QuizAttemptRepository;
import com.nabhaleam.subjects.Subject;
import com.nabhaleam.subjects.SubjectRepository;
import com.nabhaleam.teacher.dto.*;
import com.nabhaleam.users.Role;
import com.nabhaleam.users.User;
import com.nabhaleam.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final UserRepository userRepository;
    private final SchoolClassRepository classRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final SubjectRepository subjectRepository;
    private final StudentProgressRepository progressRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final NotificationService notificationService;

    public TeacherDashboardResponse dashboard(User teacher) {
        List<User> students = userRepository.findByRoleAndActiveTrue(Role.STUDENT);
        List<SchoolClass> classes = classRepository.findByActiveTrueOrderByLevelAsc();
        List<Assignment> assignments = assignmentRepository.findByPublishedTrue();
        List<AssignmentSubmission> submissions = submissionRepository.findAll();

        Map<String, SchoolClass> classById = classes.stream()
                .collect(Collectors.toMap(SchoolClass::getId, c -> c));
        Map<String, Subject> subjectById = subjectsFor(assignments);
        Map<String, List<AssignmentSubmission>> submissionsByAssignment = submissions.stream()
                .collect(Collectors.groupingBy(AssignmentSubmission::getAssignmentId));
        Map<String, List<QuizAttempt>> attemptsByStudent = quizAttemptRepository
                .findByStudentIdIn(students.stream().map(User::getId).toList()).stream()
                .collect(Collectors.groupingBy(QuizAttempt::getStudentId));
        Map<String, StudentProgress> progressByStudent = progressRepository
                .findByStudentIdIn(students.stream().map(User::getId).toList()).stream()
                .collect(Collectors.toMap(StudentProgress::getStudentId, p -> p));

        long pendingReviews = submissions.stream().filter(this::needsReview).count();

        List<TeacherDashboardResponse.AssignmentRow> assignmentRows = assignments.stream()
                .map(assignment -> new TeacherDashboardResponse.AssignmentRow(
                        assignment.getId(),
                        assignment.getTitle(),
                        assignment.getClassId(),
                        className(classById, assignment.getClassId()),
                        subjectName(subjectById, assignment.getSubjectId()),
                        assignment.getDueDate(),
                        submissionsByAssignment.getOrDefault(assignment.getId(), List.of()).size(),
                        students.stream().filter(s -> Objects.equals(s.getClassId(), assignment.getClassId())).count(),
                        submissionsByAssignment.getOrDefault(assignment.getId(), List.of()).stream()
                                .filter(this::needsReview).count()))
                .sorted(Comparator.comparing(TeacherDashboardResponse.AssignmentRow::dueDate,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();

        List<TeacherDashboardResponse.StudentRow> studentRows = buildStudentRows(
                students, assignments, submissions, progressByStudent, attemptsByStudent);

        List<TeacherDashboardResponse.SubmissionRow> recentSubmissions = submissions.stream()
                .filter(s -> s.getSubmittedAt() != null)
                .sorted(Comparator.comparing(AssignmentSubmission::getSubmittedAt).reversed())
                .limit(6)
                .map(submission -> {
                    Assignment assignment = assignments.stream()
                            .filter(a -> a.getId().equals(submission.getAssignmentId()))
                            .findFirst().orElse(null);
                    User student = students.stream()
                            .filter(s -> s.getId().equals(submission.getStudentId()))
                            .findFirst().orElse(null);
                    return new TeacherDashboardResponse.SubmissionRow(
                            submission.getId(),
                            submission.getAssignmentId(),
                            assignment == null ? "Assignment" : assignment.getTitle(),
                            submission.getStudentId(),
                            student == null ? "Student" : student.getFullName(),
                            submission.getSubmittedAt(),
                            submission.getStatus() == null ? "SUBMITTED" : submission.getStatus().name(),
                            submission.getMarks(),
                            assignment == null ? 0 : assignment.getMaxMarks());
                })
                .toList();

        List<TeacherDashboardResponse.ClassSummary> classSummaries = classes.stream()
                .map(schoolClass -> new TeacherDashboardResponse.ClassSummary(
                        schoolClass.getId(),
                        schoolClass.getName(),
                        schoolClass.getLevel(),
                        students.stream().filter(s -> schoolClass.getId().equals(s.getClassId())).count(),
                        assignments.stream().filter(a -> schoolClass.getId().equals(a.getClassId())).count()))
                .toList();

        return new TeacherDashboardResponse(
                firstName(teacher.getFullName()),
                teacher.getFullName(),
                teacher.getDegree(),
                teacher.getSchoolName(),
                students.size(),
                classes.size(),
                assignments.size(),
                pendingReviews,
                notificationService.unreadCount(teacher.getId()),
                classSummaries,
                assignmentRows,
                studentRows,
                recentSubmissions);
    }

    public List<TeacherDashboardResponse.StudentRow> students() {
        List<User> students = userRepository.findByRoleAndActiveTrue(Role.STUDENT);
        List<Assignment> assignments = assignmentRepository.findByPublishedTrue();
        List<AssignmentSubmission> submissions = submissionRepository.findAll();
        Map<String, List<QuizAttempt>> attemptsByStudent = quizAttemptRepository
                .findByStudentIdIn(students.stream().map(User::getId).toList()).stream()
                .collect(Collectors.groupingBy(QuizAttempt::getStudentId));
        Map<String, StudentProgress> progressByStudent = progressRepository
                .findByStudentIdIn(students.stream().map(User::getId).toList()).stream()
                .collect(Collectors.toMap(StudentProgress::getStudentId, p -> p));
        return buildStudentRows(students, assignments, submissions, progressByStudent, attemptsByStudent);
    }

    public List<TeacherAssignmentRow> assignments() {
        List<SchoolClass> classes = classRepository.findByActiveTrueOrderByLevelAsc();
        List<User> students = userRepository.findByRoleAndActiveTrue(Role.STUDENT);
        List<Assignment> assignments = assignmentRepository.findByPublishedTrue();
        List<AssignmentSubmission> submissions = submissionRepository.findAll();
        Map<String, SchoolClass> classById = classes.stream()
                .collect(Collectors.toMap(SchoolClass::getId, c -> c));
        Map<String, Subject> subjectById = subjectsFor(assignments);
        Map<String, List<AssignmentSubmission>> submissionsByAssignment = submissions.stream()
                .collect(Collectors.groupingBy(AssignmentSubmission::getAssignmentId));

        return assignments.stream()
                .map(assignment -> toAssignmentRow(assignment, classById, subjectById,
                        submissionsByAssignment.getOrDefault(assignment.getId(), List.of()), students))
                .sorted(Comparator.comparing(TeacherAssignmentRow::dueDate,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    public TeacherAssignmentDetail assignment(String assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> ApiException.notFound("Assignment not found."));
        SchoolClass schoolClass = classRepository.findById(assignment.getClassId()).orElse(null);
        Subject subject = assignment.getSubjectId() == null ? null
                : subjectRepository.findById(assignment.getSubjectId()).orElse(null);
        List<User> students = userRepository.findByRoleAndActiveTrue(Role.STUDENT);
        List<AssignmentSubmission> submissions = submissionRepository.findByAssignmentId(assignmentId);

        TeacherAssignmentRow row = toAssignmentRow(assignment,
                schoolClass == null ? Map.of() : Map.of(schoolClass.getId(), schoolClass),
                subject == null ? Map.of() : Map.of(subject.getId(), subject),
                submissions, students);

        Map<String, User> studentById = students.stream()
                .collect(Collectors.toMap(User::getId, s -> s));
        List<TeacherSubmissionRow> submissionRows = submissions.stream()
                .sorted(Comparator.comparing(AssignmentSubmission::getSubmittedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(submission -> toSubmissionRow(submission, studentById.get(submission.getStudentId())))
                .toList();

        return new TeacherAssignmentDetail(row,
                assignment.getInstructions() == null ? List.of() : assignment.getInstructions(),
                submissionRows);
    }

    public TeacherAssignmentRow createAssignment(User teacher, CreateAssignmentRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        SchoolClass schoolClass = classRepository.findById(request.classId())
                .filter(SchoolClass::isActive)
                .orElse(null);
        if (schoolClass == null) {
            errors.put("classId", "Choose a valid class.");
        }
        Subject subject = null;
        if (request.subjectId() != null && !request.subjectId().isBlank()) {
            subject = subjectRepository.findByIdAndActiveTrue(request.subjectId()).orElse(null);
            if (subject == null) {
                errors.put("subjectId", "Choose a valid subject.");
            }
        }
        if (!errors.isEmpty()) {
            throw ApiException.validation(errors);
        }

        List<String> instructions = request.instructions() == null ? List.of()
                : request.instructions().stream()
                .filter(item -> item != null && !item.isBlank())
                .map(String::trim)
                .toList();

        Assignment assignment = assignmentRepository.save(Assignment.builder()
                .classId(schoolClass.getId())
                .subjectId(subject == null ? null : subject.getId())
                .title(request.title().trim())
                .description(request.description() == null || request.description().isBlank()
                        ? null : request.description().trim())
                .instructions(instructions)
                .assignedDate(Instant.now())
                .dueDate(request.dueDate())
                .maxMarks(request.maxMarks())
                .published(request.published() == null || request.published())
                .seeded(false)
                .build());

        List<User> students = userRepository.findByRoleAndClassIdAndActiveTrue(Role.STUDENT, schoolClass.getId());
        String dueText = assignment.getDueDate() == null
                ? "No due date set. "
                : "Due " + Duration.between(Instant.now(), assignment.getDueDate()).toDays() + " days from now. ";
        for (User student : students) {
            notificationService.notify(student.getId(), NotificationType.ASSIGNMENT_NEW,
                    "New assignment: " + assignment.getTitle(),
                    dueText + "Open the assignment to read the instructions.",
                    "/app/assignments/" + assignment.getId(),
                    "assignment-new:" + assignment.getId());
        }

        return toAssignmentRow(assignment, Map.of(schoolClass.getId(), schoolClass),
                subject == null ? Map.of() : Map.of(subject.getId(), subject),
                List.of(), students);
    }

    public TeacherSubmissionRow review(User teacher, String submissionId, ReviewSubmissionRequest request) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> ApiException.notFound("Submission not found."));
        Assignment assignment = assignmentRepository.findById(submission.getAssignmentId())
                .orElseThrow(() -> ApiException.notFound("Assignment not found."));
        if (request.marks() > assignment.getMaxMarks()) {
            throw ApiException.validation(Map.of("marks",
                    "Marks cannot be more than " + assignment.getMaxMarks() + "."));
        }

        submission.setMarks(request.marks());
        submission.setFeedback(request.feedback() == null || request.feedback().isBlank()
                ? null : request.feedback().trim());
        submission.setStatus(SubmissionStatus.REVIEWED);
        submission.setReviewedAt(Instant.now());
        submission.setReviewedBy(teacher.getId());
        AssignmentSubmission saved = submissionRepository.save(submission);

        User student = userRepository.findById(saved.getStudentId()).orElse(null);
        notificationService.notify(saved.getStudentId(), NotificationType.SUBMISSION_REVIEWED,
                "Assignment reviewed: " + assignment.getTitle(),
                "You scored " + saved.getMarks() + "/" + assignment.getMaxMarks() + "."
                        + (saved.getFeedback() == null ? "" : " " + saved.getFeedback()),
                "/app/assignments/" + assignment.getId(),
                "submission-reviewed:" + saved.getId());

        return toSubmissionRow(saved, student);
    }

    private List<TeacherDashboardResponse.StudentRow> buildStudentRows(
            List<User> students,
            List<Assignment> assignments,
            List<AssignmentSubmission> submissions,
            Map<String, StudentProgress> progressByStudent,
            Map<String, List<QuizAttempt>> attemptsByStudent) {
        Map<String, List<Assignment>> assignmentsByClass = assignments.stream()
                .collect(Collectors.groupingBy(Assignment::getClassId));
        Map<String, List<AssignmentSubmission>> submissionsByStudent = submissions.stream()
                .collect(Collectors.groupingBy(AssignmentSubmission::getStudentId));

        return students.stream()
                .map(student -> {
                    StudentProgress progress = progressByStudent.get(student.getId());
                    List<AssignmentSubmission> studentSubmissions = submissionsByStudent
                            .getOrDefault(student.getId(), List.of());
                    List<Assignment> classAssignments = assignmentsByClass
                            .getOrDefault(student.getClassId(), List.of());
                    Set<String> submittedAssignmentIds = studentSubmissions.stream()
                            .map(AssignmentSubmission::getAssignmentId)
                            .collect(Collectors.toSet());
                    List<QuizAttempt> attempts = attemptsByStudent.getOrDefault(student.getId(), List.of());
                    double average = attempts.isEmpty() ? 0
                            : attempts.stream().mapToDouble(QuizAttempt::getPercentage).average().orElse(0);
                    Instant lastActive = progress == null ? null : progress.getUpdatedAt();
                    for (AssignmentSubmission submission : studentSubmissions) {
                        if (submission.getSubmittedAt() != null
                                && (lastActive == null || submission.getSubmittedAt().isAfter(lastActive))) {
                            lastActive = submission.getSubmittedAt();
                        }
                    }
                    int completed = progress == null || progress.getCompletedTopicIds() == null
                            ? 0 : progress.getCompletedTopicIds().size();
                    long pending = classAssignments.stream()
                            .filter(a -> !submittedAssignmentIds.contains(a.getId()))
                            .count();
                    return new TeacherDashboardResponse.StudentRow(
                            student.getId(),
                            student.getFullName(),
                            student.getEmail(),
                            student.getClassId(),
                            student.getClassName(),
                            student.getSchoolName(),
                            completed,
                            attempts.size(),
                            Math.round(average * 10.0) / 10.0,
                            studentSubmissions.size(),
                            pending,
                            lastActive);
                })
                .sorted(Comparator.comparing(TeacherDashboardResponse.StudentRow::fullName,
                        String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    private TeacherAssignmentRow toAssignmentRow(
            Assignment assignment,
            Map<String, SchoolClass> classById,
            Map<String, Subject> subjectById,
            List<AssignmentSubmission> submissions,
            List<User> students) {
        long totalStudents = students.stream()
                .filter(student -> Objects.equals(student.getClassId(), assignment.getClassId()))
                .count();
        long reviewed = submissions.stream()
                .filter(submission -> submission.getStatus() == SubmissionStatus.REVIEWED)
                .count();
        return new TeacherAssignmentRow(
                assignment.getId(),
                assignment.getTitle(),
                assignment.getDescription(),
                assignment.getClassId(),
                className(classById, assignment.getClassId()),
                assignment.getSubjectId(),
                subjectName(subjectById, assignment.getSubjectId()),
                assignment.getAssignedDate(),
                assignment.getDueDate(),
                assignment.getMaxMarks(),
                assignment.isPublished(),
                totalStudents,
                submissions.size(),
                reviewed,
                submissions.stream().filter(this::needsReview).count());
    }

    private TeacherSubmissionRow toSubmissionRow(AssignmentSubmission submission, User student) {
        return new TeacherSubmissionRow(
                submission.getId(),
                submission.getStudentId(),
                student == null ? "Student" : student.getFullName(),
                student == null ? null : student.getEmail(),
                submission.getText(),
                submission.getFileName(),
                submission.getFileId() == null ? null : "/api/files/" + submission.getFileId(),
                submission.getFileSize(),
                submission.getSubmittedAt(),
                submission.getStatus() == null ? "SUBMITTED" : submission.getStatus().name(),
                submission.getMarks(),
                submission.getFeedback());
    }

    private Map<String, Subject> subjectsFor(List<Assignment> assignments) {
        List<String> subjectIds = assignments.stream()
                .map(Assignment::getSubjectId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        return subjectRepository.findAllById(subjectIds).stream()
                .collect(Collectors.toMap(Subject::getId, s -> s));
    }

    private boolean needsReview(AssignmentSubmission submission) {
        return submission.getStatus() != SubmissionStatus.REVIEWED;
    }

    private String className(Map<String, SchoolClass> classById, String classId) {
        SchoolClass schoolClass = classById.get(classId);
        return schoolClass == null ? "Class" : schoolClass.getName();
    }

    private String subjectName(Map<String, Subject> subjectById, String subjectId) {
        Subject subject = subjectId == null ? null : subjectById.get(subjectId);
        return subject == null ? "General" : subject.getName();
    }

    private String firstName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return "Teacher";
        }
        return fullName.trim().split("\\s+")[0];
    }
}
