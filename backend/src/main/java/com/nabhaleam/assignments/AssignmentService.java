package com.nabhaleam.assignments;

import com.nabhaleam.assignments.dto.AssignmentDetail;
import com.nabhaleam.assignments.dto.AssignmentSummary;
import com.nabhaleam.assignments.dto.SubmissionDto;
import com.nabhaleam.common.ApiException;
import com.nabhaleam.files.FilePurpose;
import com.nabhaleam.files.FileStorageService;
import com.nabhaleam.files.StoredFile;
import com.nabhaleam.files.StoredFileRepository;
import com.nabhaleam.notifications.NotificationService;
import com.nabhaleam.notifications.NotificationType;
import com.nabhaleam.subjects.Subject;
import com.nabhaleam.subjects.SubjectRepository;
import com.nabhaleam.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private static final int MAX_TEXT_LENGTH = 2000;

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final SubjectRepository subjectRepository;
    private final FileStorageService fileStorageService;
    private final StoredFileRepository fileRepository;
    private final NotificationService notificationService;

    public List<AssignmentSummary> list(User student, String statusFilter) {
        List<Assignment> assignments = assignmentRepository
                .findByClassIdAndPublishedTrueOrderByDueDateAsc(student.getClassId());
        Map<String, AssignmentSubmission> submissions = new HashMap<>();
        submissionRepository.findByStudentIdOrderBySubmittedAtDesc(student.getId())
                .forEach(submission -> submissions.put(submission.getAssignmentId(), submission));
        Map<String, Subject> subjects = new HashMap<>();
        subjectRepository.findAllById(assignments.stream()
                        .map(Assignment::getSubjectId)
                        .filter(Objects::nonNull)
                        .distinct()
                        .toList())
                .forEach(subject -> subjects.put(subject.getId(), subject));

        return assignments.stream()
                .map(assignment -> toSummary(assignment, subjects.get(assignment.getSubjectId()),
                        submissions.get(assignment.getId())))
                .filter(summary -> matchesFilter(summary, statusFilter))
                .toList();
    }

    public AssignmentDetail detail(User student, String assignmentId) {
        Assignment assignment = assignmentRepository.findByIdAndPublishedTrue(assignmentId)
                .orElseThrow(() -> ApiException.notFound("Assignment not found."));
        if (!assignment.getClassId().equals(student.getClassId())) {
            throw ApiException.forbidden("This assignment is not available for your class.");
        }
        Subject subject = assignment.getSubjectId() == null ? null
                : subjectRepository.findById(assignment.getSubjectId()).orElse(null);
        AssignmentSubmission submission = submissionRepository
                .findByAssignmentIdAndStudentId(assignmentId, student.getId()).orElse(null);
        AssignmentSummary summary = toSummary(assignment, subject, submission);
        boolean canSubmit = submission == null
                || submission.getStatus() == SubmissionStatus.SUBMITTED
                || submission.getStatus() == SubmissionStatus.LATE;

        List<AssignmentDetail.AttachmentDto> attachments = assignment.getAttachments() == null ? List.of()
                : assignment.getAttachments().stream()
                .map(attachment -> new AssignmentDetail.AttachmentDto(attachment.getName(),
                        attachment.getUrl(), attachment.getContentType()))
                .toList();

        return new AssignmentDetail(summary, assignment.getInstructions() == null ? List.of()
                : assignment.getInstructions(), attachments,
                submission == null ? null : toDto(submission), canSubmit);
    }

    public SubmissionDto submit(User student, String assignmentId, String text, MultipartFile file) {
        Assignment assignment = assignmentRepository.findByIdAndPublishedTrue(assignmentId)
                .orElseThrow(() -> ApiException.notFound("Assignment not found."));
        if (!assignment.getClassId().equals(student.getClassId())) {
            throw ApiException.forbidden("This assignment is not available for your class.");
        }

        String cleanText = text == null ? null : text.trim();
        if (cleanText != null && cleanText.length() > MAX_TEXT_LENGTH) {
            throw ApiException.badRequest("Your written response must be 2000 characters or fewer.");
        }
        boolean hasText = cleanText != null && !cleanText.isBlank();
        boolean hasFile = file != null && !file.isEmpty();
        if (!hasText && !hasFile) {
            throw ApiException.badRequest("Add a written response or attach a PDF or image before submitting.");
        }

        AssignmentSubmission submission = submissionRepository
                .findByAssignmentIdAndStudentId(assignmentId, student.getId())
                .orElseGet(() -> AssignmentSubmission.builder()
                        .assignmentId(assignmentId)
                        .studentId(student.getId())
                        .build());
        if (submission.getStatus() == SubmissionStatus.REVIEWED) {
            throw ApiException.conflict("This assignment has already been reviewed and cannot be changed.");
        }

        String previousFileId = submission.getFileId();
        if (hasFile) {
            StoredFile stored = fileStorageService.store(file, student.getId(), FilePurpose.ASSIGNMENT_SUBMISSION);
            submission.setFileId(stored.getId());
            submission.setFileName(stored.getOriginalName());
            submission.setContentType(stored.getContentType());
            submission.setFileSize(stored.getSize());
        }
        if (hasText) {
            submission.setText(cleanText);
        }
        submission.setSubmittedAt(Instant.now());
        submission.setStatus(assignment.getDueDate() != null && Instant.now().isAfter(assignment.getDueDate())
                ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED);
        submission.setFeedback(null);
        submission.setMarks(null);
        submission.setReviewedAt(null);
        submission.setReviewedBy(null);
        AssignmentSubmission saved = submissionRepository.save(submission);

        if (hasFile && previousFileId != null && !previousFileId.equals(saved.getFileId())) {
            fileRepository.findById(previousFileId).ifPresent(fileStorageService::deleteQuietly);
        }

        notificationService.notify(student.getId(), NotificationType.SUBMISSION_RECEIVED,
                "Assignment submitted",
                "We received your submission for \"" + assignment.getTitle() + "\".",
                "/app/assignments/" + assignmentId);

        return toDto(saved);
    }

    public List<SubmissionDto> submissions(User student) {
        return submissionRepository.findByStudentIdOrderBySubmittedAtDesc(student.getId()).stream()
                .map(this::toDto)
                .toList();
    }

    private boolean matchesFilter(AssignmentSummary summary, String filter) {
        if (filter == null || filter.isBlank() || "all".equalsIgnoreCase(filter)) {
            return true;
        }
        return switch (filter.toLowerCase()) {
            case "pending" -> "PENDING".equals(summary.status()) || "LATE".equals(summary.status());
            case "submitted" -> "SUBMITTED".equals(summary.status()) || "UNDER_REVIEW".equals(summary.status());
            case "reviewed" -> "REVIEWED".equals(summary.status());
            default -> true;
        };
    }

    private AssignmentSummary toSummary(Assignment assignment, Subject subject, AssignmentSubmission submission) {
        String status = submission == null ? "PENDING" : submission.getStatus().name();
        boolean overdue = submission == null && assignment.getDueDate() != null
                && Instant.now().isAfter(assignment.getDueDate());
        return new AssignmentSummary(assignment.getId(), assignment.getTitle(), assignment.getDescription(),
                assignment.getSubjectId(), subject == null ? "Subject" : subject.getName(),
                subject == null ? "assignment" : subject.getIcon(),
                subject == null ? "#0E9F6E" : subject.getColor(),
                assignment.getAssignedDate(), assignment.getDueDate(), assignment.getMaxMarks(), status,
                submission == null ? null : submission.getSubmittedAt(),
                submission == null ? null : submission.getMarks(),
                submission != null && submission.getFeedback() != null,
                overdue,
                assignment.getAttachments() == null ? 0 : assignment.getAttachments().size());
    }

    private SubmissionDto toDto(AssignmentSubmission submission) {
        return new SubmissionDto(submission.getId(), submission.getAssignmentId(), submission.getText(),
                submission.getFileId(), submission.getFileName(),
                submission.getFileId() == null ? null : "/api/files/" + submission.getFileId(),
                submission.getFileSize(), submission.getSubmittedAt(),
                submission.getStatus().name(), submission.getMarks(), submission.getFeedback(),
                submission.getReviewedAt());
    }
}
