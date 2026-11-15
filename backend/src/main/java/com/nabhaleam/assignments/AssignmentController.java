package com.nabhaleam.assignments;

import com.nabhaleam.assignments.dto.AssignmentDetail;
import com.nabhaleam.assignments.dto.AssignmentSummary;
import com.nabhaleam.assignments.dto.SubmissionDto;
import com.nabhaleam.common.ApiResponse;
import com.nabhaleam.students.CurrentStudentService;
import com.nabhaleam.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final CurrentStudentService currentStudentService;

    @GetMapping("/assignments")
    public ApiResponse<List<AssignmentSummary>> assignments(@RequestParam(required = false) String status) {
        User student = currentStudentService.require();
        return ApiResponse.ok(assignmentService.list(student, status));
    }

    @GetMapping("/assignments/{assignmentId}")
    public ApiResponse<AssignmentDetail> detail(@PathVariable String assignmentId) {
        User student = currentStudentService.require();
        return ApiResponse.ok(assignmentService.detail(student, assignmentId));
    }

    @PostMapping(value = "/assignments/{assignmentId}/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<SubmissionDto> submit(@PathVariable String assignmentId,
                                             @RequestParam(required = false) String text,
                                             @RequestPart(required = false) MultipartFile file) {
        User student = currentStudentService.require();
        SubmissionDto submission = assignmentService.submit(student, assignmentId, text, file);
        return ApiResponse.ok("Assignment submitted successfully.", submission);
    }

    @GetMapping("/assignment-submissions")
    public ApiResponse<List<SubmissionDto>> submissions() {
        User student = currentStudentService.require();
        return ApiResponse.ok(assignmentService.submissions(student));
    }
}
