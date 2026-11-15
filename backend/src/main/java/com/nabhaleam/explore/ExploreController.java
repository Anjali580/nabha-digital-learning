package com.nabhaleam.explore;

import com.nabhaleam.common.ApiResponse;
import com.nabhaleam.common.PageResponse;
import com.nabhaleam.explore.dto.ExploreCategoryDto;
import com.nabhaleam.explore.dto.ExploreDetail;
import com.nabhaleam.explore.dto.ExploreSummary;
import com.nabhaleam.security.NabhaUserPrincipal;
import com.nabhaleam.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/explore")
@RequiredArgsConstructor
public class ExploreController {

    private final ExploreService service;

    @GetMapping("/categories")
    public ApiResponse<List<ExploreCategoryDto>> categories() {
        return ApiResponse.ok(service.categories());
    }

    @GetMapping
    public ApiResponse<PageResponse<ExploreSummary>> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false, name = "q") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {
        return ApiResponse.ok(service.list(category, query, page, size, studentId()));
    }

    @GetMapping("/search")
    public ApiResponse<PageResponse<ExploreSummary>> search(
            @RequestParam(name = "q") String query,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {
        return ApiResponse.ok(service.list(category, query, page, size, studentId()));
    }

    @GetMapping("/{idOrSlug}")
    public ApiResponse<ExploreDetail> detail(@PathVariable String idOrSlug) {
        return ApiResponse.ok(service.detail(idOrSlug, studentId()));
    }

    private String studentId() {
        NabhaUserPrincipal principal = SecurityUtils.currentPrincipalOrNull();
        return principal == null ? null : principal.getId();
    }
}
