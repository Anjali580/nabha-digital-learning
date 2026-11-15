package com.nabhaleam.subjects;

import com.nabhaleam.chapters.dto.ChapterSummary;
import com.nabhaleam.common.ApiResponse;
import com.nabhaleam.subjects.dto.SubjectDetail;
import com.nabhaleam.subjects.dto.SubjectDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping
    public ApiResponse<List<SubjectDto>> list(@RequestParam String classId) {
        return ApiResponse.ok(subjectService.listByClass(classId));
    }

    @GetMapping("/{id}")
    public ApiResponse<SubjectDetail> detail(@PathVariable String id) {
        return ApiResponse.ok(subjectService.detail(id));
    }

    @GetMapping("/{id}/chapters")
    public ApiResponse<List<ChapterSummary>> chapters(@PathVariable String id) {
        return ApiResponse.ok(subjectService.detail(id).chapters());
    }
}
