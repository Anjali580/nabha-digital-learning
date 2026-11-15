package com.nabhaleam.quizzes;

import com.nabhaleam.common.ApiResponse;
import com.nabhaleam.quizzes.dto.*;
import com.nabhaleam.students.CurrentStudentService;
import com.nabhaleam.users.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;
    private final CurrentStudentService currentStudentService;

    @GetMapping
    public ApiResponse<List<QuizSummary>> list(@RequestParam(required = false) String subjectId) {
        User student = currentStudentService.require();
        return ApiResponse.ok(quizService.listForStudent(student, subjectId));
    }

    @GetMapping("/{quizId}")
    public ApiResponse<QuizDetail> detail(@PathVariable String quizId) {
        return ApiResponse.ok(quizService.detail(currentStudentService.require(), quizId));
    }

    @PostMapping("/{quizId}/start")
    public ApiResponse<QuizStartResponse> start(@PathVariable String quizId) {
        QuizStartResponse start = quizService.start(currentStudentService.require(), quizId);
        return ApiResponse.ok(start.resumed() ? "Resuming your quiz attempt." : "Quiz started. Good luck!", start);
    }

    @PostMapping("/{quizId}/submit")
    public ApiResponse<QuizResult> submit(@PathVariable String quizId,
                                          @Valid @RequestBody SubmitQuizRequest request) {
        QuizResult result = quizService.submit(currentStudentService.require(), quizId, request);
        return ApiResponse.ok("Quiz submitted successfully.", result);
    }
}
