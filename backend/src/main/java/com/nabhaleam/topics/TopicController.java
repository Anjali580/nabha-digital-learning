package com.nabhaleam.topics;

import com.nabhaleam.common.ApiResponse;
import com.nabhaleam.common.ApiException;
import com.nabhaleam.progress.TopicProgressService;
import com.nabhaleam.progress.dto.TopicCompletionResult;
import com.nabhaleam.security.SecurityUtils;
import com.nabhaleam.students.CurrentStudentService;
import com.nabhaleam.topics.dto.TopicDetail;
import com.nabhaleam.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicController {

    private final TopicService topicService;
    private final TopicProgressService progressService;
    private final CurrentStudentService currentStudentService;
    private final TopicRepository topicRepository;

    @GetMapping("/{topicId}")
    public ApiResponse<TopicDetail> detail(@PathVariable String topicId) {
        return ApiResponse.ok(topicService.detail(topicId, SecurityUtils.currentUserIdOrNull()));
    }

    @PostMapping("/{topicId}/complete")
    public ApiResponse<TopicCompletionResult> complete(@PathVariable String topicId) {
        User student = currentStudentService.require();
        Topic topic = topicRepository.findByIdAndActiveTrue(topicId)
                .orElseThrow(() -> ApiException.notFound("Topic not found."));
        TopicCompletionResult result = progressService.complete(student.getId(), student.getClassId(), topic);
        String message = result.alreadyCompleted()
                ? "This topic is already completed."
                : "Topic marked as complete. Well done!";
        return ApiResponse.ok(message, result);
    }
}
