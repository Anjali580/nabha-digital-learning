package com.nabhaleam.search;

import com.nabhaleam.common.ApiResponse;
import com.nabhaleam.students.CurrentStudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/student/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;
    private final CurrentStudentService currentStudentService;

    @GetMapping
    public ApiResponse<SearchResponse> search(@RequestParam(name = "q", defaultValue = "") String query) {
        return ApiResponse.ok(searchService.search(currentStudentService.require(), query));
    }
}
