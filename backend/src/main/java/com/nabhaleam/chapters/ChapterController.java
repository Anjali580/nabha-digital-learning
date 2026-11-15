package com.nabhaleam.chapters;

import com.nabhaleam.chapters.dto.ChapterDetail;
import com.nabhaleam.common.ApiResponse;
import com.nabhaleam.topics.dto.TopicSummary;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chapters")
@RequiredArgsConstructor
public class ChapterController {

    private final ChapterService chapterService;

    @GetMapping("/{chapterId}")
    public ApiResponse<ChapterDetail> detail(@PathVariable String chapterId) {
        return ApiResponse.ok(chapterService.detail(chapterId));
    }

    @GetMapping("/{chapterId}/topics")
    public ApiResponse<List<TopicSummary>> topics(@PathVariable String chapterId) {
        return ApiResponse.ok(chapterService.topics(chapterId));
    }
}
