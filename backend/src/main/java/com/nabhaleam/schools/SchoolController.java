package com.nabhaleam.schools;

import com.nabhaleam.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/schools")
@RequiredArgsConstructor
public class SchoolController {

    private final SchoolRepository repository;

    @GetMapping
    public ApiResponse<List<SchoolDto>> list() {
        return ApiResponse.ok(repository.findAllByOrderByNameAsc().stream()
                .map(SchoolDto::from)
                .toList());
    }

    public record SchoolDto(String id, String name, String village, String district, boolean demo) {
        public static SchoolDto from(School school) {
            return new SchoolDto(school.getId(), school.getName(), school.getVillage(),
                    school.getDistrict(), school.isDemo());
        }
    }
}
