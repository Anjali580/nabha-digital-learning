package com.nabhaleam.dashboard;

import com.nabhaleam.common.ApiResponse;
import com.nabhaleam.progress.dto.ContinueLearningItem;
import com.nabhaleam.students.CurrentStudentService;
import com.nabhaleam.progress.TopicProgressService;
import com.nabhaleam.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final CurrentStudentService currentStudentService;
    private final TopicProgressService topicProgressService;

    @GetMapping("/dashboard")
    public ApiResponse<DashboardResponse> dashboard() {
        User student = currentStudentService.require();
        return ApiResponse.ok(dashboardService.dashboard(student));
    }

    @GetMapping("/continue-learning")
    public ApiResponse<List<ContinueLearningItem>> continueLearning() {
        User student = currentStudentService.require();
        return ApiResponse.ok(topicProgressService.continueLearning(student.getId(), student.getClassId()));
    }
}
