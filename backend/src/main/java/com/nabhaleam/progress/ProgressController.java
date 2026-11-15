package com.nabhaleam.progress;

import com.nabhaleam.common.ApiResponse;
import com.nabhaleam.progress.dto.ProgressOverview;
import com.nabhaleam.security.SecurityUtils;
import com.nabhaleam.students.CurrentStudentService;
import com.nabhaleam.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressAnalyticsService analyticsService;
    private final CurrentStudentService currentStudentService;

    @GetMapping
    public ApiResponse<ProgressOverview> overview() {
        User student = currentStudentService.require();
        return ApiResponse.ok(analyticsService.overview(student));
    }

    @GetMapping("/subjects")
    public ApiResponse<List<ProgressOverview.SubjectProgress>> subjects() {
        User student = currentStudentService.require();
        return ApiResponse.ok(analyticsService.subjectProgress(student));
    }

    @GetMapping("/history")
    public ApiResponse<List<ProgressOverview.HistoryItem>> history(
            @RequestParam(defaultValue = "30") int limit) {
        return ApiResponse.ok(analyticsService.history(SecurityUtils.currentUserId(),
                Math.max(1, Math.min(limit, 100))));
    }

    @GetMapping("/weak-topics")
    public ApiResponse<List<ProgressOverview.WeakTopic>> weakTopics() {
        return ApiResponse.ok(analyticsService.weakTopics(SecurityUtils.currentUserId()));
    }
}
