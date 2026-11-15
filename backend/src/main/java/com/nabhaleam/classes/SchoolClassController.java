package com.nabhaleam.classes;

import com.nabhaleam.common.ApiResponse;
import com.nabhaleam.common.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class SchoolClassController {

    private final SchoolClassRepository repository;

    @GetMapping
    public ApiResponse<List<SchoolClassDto>> list() {
        return ApiResponse.ok(repository.findByActiveTrueOrderByLevelAsc().stream()
                .map(SchoolClassDto::from)
                .toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<SchoolClassDto> get(@PathVariable String id) {
        SchoolClass schoolClass = repository.findById(id)
                .filter(SchoolClass::isActive)
                .orElseThrow(() -> ApiException.notFound("Class not found."));
        return ApiResponse.ok(SchoolClassDto.from(schoolClass));
    }

    public record SchoolClassDto(String id, String name, int level, String description) {
        public static SchoolClassDto from(SchoolClass schoolClass) {
            return new SchoolClassDto(schoolClass.getId(), schoolClass.getName(),
                    schoolClass.getLevel(), schoolClass.getDescription());
        }
    }
}
