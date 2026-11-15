package com.nabhaleam.quizzes;

import com.nabhaleam.common.ApiResponse;
import com.nabhaleam.common.PageResponse;
import com.nabhaleam.quizzes.dto.AttemptSummary;
import com.nabhaleam.quizzes.dto.QuizResult;
import com.nabhaleam.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student/quiz-attempts")
@RequiredArgsConstructor
public class QuizAttemptController {

    private final QuizService quizService;

    @GetMapping
    public ApiResponse<PageResponse<AttemptSummary>> attempts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok(quizService.attempts(SecurityUtils.currentUserId(), page, size));
    }

    @GetMapping("/{attemptId}")
    public ApiResponse<QuizResult> result(@PathVariable String attemptId) {
        return ApiResponse.ok(quizService.attemptResult(SecurityUtils.currentUserId(), attemptId));
    }
}
