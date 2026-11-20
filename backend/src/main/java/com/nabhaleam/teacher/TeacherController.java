package com.nabhaleam.teacher;

import com.nabhaleam.common.ApiResponse;
import com.nabhaleam.teacher.dto.*;
import com.nabhaleam.users.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;
    private final CurrentTeacherService currentTeacherService;

    @GetMapping("/dashboard")
    public ApiResponse<TeacherDashboardResponse> dashboard() {
        return ApiResponse.ok(teacherService.dashboard(currentTeacherService.require()));
    }

    @GetMapping("/students")
    public ApiResponse<List<TeacherDashboardResponse.StudentRow>> students() {
        return ApiResponse.ok(teacherService.students());
    }

    @GetMapping("/assignments")
    public ApiResponse<List<TeacherAssignmentRow>> assignments() {
        return ApiResponse.ok(teacherService.assignments());
    }

    @PostMapping("/assignments")
    public ApiResponse<TeacherAssignmentRow> createAssignment(
            @Valid @RequestBody CreateAssignmentRequest request) {
        User teacher = currentTeacherService.require();
        return ApiResponse.ok("Assignment published.", teacherService.createAssignment(teacher, request));
    }

    @GetMapping("/assignments/{assignmentId}")
    public ApiResponse<TeacherAssignmentDetail> assignment(@PathVariable String assignmentId) {
        return ApiResponse.ok(teacherService.assignment(assignmentId));
    }

    @PutMapping("/submissions/{submissionId}/review")
    public ApiResponse<TeacherSubmissionRow> reviewSubmission(
            @PathVariable String submissionId,
            @Valid @RequestBody ReviewSubmissionRequest request) {
        User teacher = currentTeacherService.require();
        return ApiResponse.ok("Review saved.", teacherService.review(teacher, submissionId, request));
    }
}
