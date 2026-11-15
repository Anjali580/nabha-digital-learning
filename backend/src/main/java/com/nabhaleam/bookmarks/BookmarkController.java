package com.nabhaleam.bookmarks;

import com.nabhaleam.bookmarks.dto.BookmarkDto;
import com.nabhaleam.bookmarks.dto.CreateBookmarkRequest;
import com.nabhaleam.common.ApiResponse;
import com.nabhaleam.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @GetMapping
    public ApiResponse<List<BookmarkDto>> list(@RequestParam(required = false) BookmarkTargetType type) {
        return ApiResponse.ok(bookmarkService.list(SecurityUtils.currentUserId(), type));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookmarkDto>> add(@Valid @RequestBody CreateBookmarkRequest request) {
        BookmarkDto bookmark = bookmarkService.add(SecurityUtils.currentUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Saved to your bookmarks.", bookmark));
    }

    @DeleteMapping("/{bookmarkId}")
    public ApiResponse<Void> delete(@PathVariable String bookmarkId) {
        bookmarkService.delete(SecurityUtils.currentUserId(), bookmarkId);
        return ApiResponse.message("Bookmark removed.");
    }
}
