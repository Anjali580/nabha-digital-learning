package com.nabhaleam.explore;

import com.nabhaleam.bookmarks.BookmarkService;
import com.nabhaleam.bookmarks.BookmarkTargetType;
import com.nabhaleam.common.ApiException;
import com.nabhaleam.common.PageResponse;
import com.nabhaleam.explore.dto.ExploreCategoryDto;
import com.nabhaleam.explore.dto.ExploreDetail;
import com.nabhaleam.explore.dto.ExploreSummary;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ExploreService {

    private static final int MAX_PAGE_SIZE = 30;

    private final ExploreContentRepository repository;
    private final MongoTemplate mongoTemplate;
    private final BookmarkService bookmarkService;

    public List<ExploreCategoryDto> categories() {
        return Arrays.stream(ExploreCategory.values())
                .map(category -> ExploreCategoryDto.from(category,
                        repository.countByCategoryAndPublishedTrue(category.name())))
                .toList();
    }

    public PageResponse<ExploreSummary> list(String categorySlug, String q, int page, int size, String studentId) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, MAX_PAGE_SIZE));

        List<Criteria> filters = new ArrayList<>();
        filters.add(Criteria.where("published").is(true));

        if (categorySlug != null && !categorySlug.isBlank() && !"all".equalsIgnoreCase(categorySlug)) {
            ExploreCategory category = ExploreCategory.fromSlug(categorySlug);
            if (category == null) {
                throw ApiException.badRequest("Unknown explore category.");
            }
            filters.add(Criteria.where("category").is(category.name()));
        }
        if (q != null && !q.isBlank()) {
            Pattern pattern = Pattern.compile(Pattern.quote(q.trim()), Pattern.CASE_INSENSITIVE);
            filters.add(new Criteria().orOperator(
                    Criteria.where("title").regex(pattern),
                    Criteria.where("shortDescription").regex(pattern),
                    Criteria.where("tags").regex(pattern)));
        }

        Query query = new Query(new Criteria().andOperator(filters));
        long total = mongoTemplate.count(query, ExploreContent.class);
        query.with(PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt")));
        List<ExploreContent> content = mongoTemplate.find(query, ExploreContent.class);

        List<String> ids = content.stream().map(ExploreContent::getId).toList();
        Map<String, String> bookmarkIds = bookmarkService.bookmarkIdsFor(studentId,
                BookmarkTargetType.EXPLORE, ids);
        List<ExploreSummary> summaries = content.stream()
                .map(item -> toSummary(item, bookmarkIds.get(item.getId())))
                .toList();

        int totalPages = safeSize == 0 ? 0 : (int) Math.ceil((double) total / safeSize);
        return new PageResponse<>(summaries, safePage, safeSize, total, totalPages,
                safePage + 1 >= totalPages);
    }

    public ExploreDetail detail(String idOrSlug, String studentId) {
        ExploreContent content = repository.findByIdAndPublishedTrue(idOrSlug)
                .or(() -> repository.findBySlugAndPublishedTrue(idOrSlug))
                .orElseThrow(() -> ApiException.notFound("Explore article not found."));

        ExploreCategory category = ExploreCategory.fromSlug(content.getCategory());
        List<ExploreSummary> related = related(content, studentId);
        String bookmarkId = studentId == null ? null
                : bookmarkService.bookmarkIdFor(studentId, BookmarkTargetType.EXPLORE, content.getId());

        return new ExploreDetail(
                content.getId(), content.getSlug(), content.getTitle(), content.getShortDescription(),
                category == null ? content.getCategory() : category.getSlug(),
                category == null ? "Explore" : category.getTitle(),
                category == null ? "sparkles" : category.getIcon(),
                category == null ? "#0E9F6E" : category.getColor(),
                content.getCoverImage(), content.getReadingTimeMinutes(), content.getSections(),
                content.getDefinitions(), content.getPracticalExamples(), content.getImages(),
                content.getVideos(), content.getKeyTakeaways(), content.getTags(), related, bookmarkId);
    }

    private List<ExploreSummary> related(ExploreContent content, String studentId) {
        Set<String> ids = new LinkedHashSet<>(content.getRelatedIds());
        if (ids.size() < 3 && content.getCategory() != null) {
            repository.findAll().stream()
                    .filter(c -> c.isPublished() && content.getCategory().equals(c.getCategory()))
                    .filter(c -> !c.getId().equals(content.getId()))
                    .forEach(c -> ids.add(c.getId()));
        }
        List<String> limited = ids.stream().limit(3).toList();
        Map<String, String> bookmarkIds = bookmarkService.bookmarkIdsFor(studentId,
                BookmarkTargetType.EXPLORE, limited);
        return repository.findByIdInAndPublishedTrue(limited).stream()
                .map(c -> toSummary(c, bookmarkIds.get(c.getId())))
                .toList();
    }

    private ExploreSummary toSummary(ExploreContent content, String bookmarkId) {
        ExploreCategory category = ExploreCategory.fromSlug(content.getCategory());
        return new ExploreSummary(
                content.getId(), content.getSlug(), content.getTitle(), content.getShortDescription(),
                category == null ? content.getCategory() : category.getSlug(),
                category == null ? "Explore" : category.getTitle(),
                category == null ? "sparkles" : category.getIcon(),
                category == null ? "#0E9F6E" : category.getColor(),
                content.getCoverImage(), content.getReadingTimeMinutes(),
                content.getTags() == null ? List.of() : content.getTags(), bookmarkId);
    }
}
