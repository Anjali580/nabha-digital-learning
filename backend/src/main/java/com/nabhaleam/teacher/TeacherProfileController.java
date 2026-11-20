package com.nabhaleam.teacher;

import com.nabhaleam.auth.dto.PreferencesDto;
import com.nabhaleam.common.ApiResponse;
import com.nabhaleam.students.StudentProfileService;
import com.nabhaleam.students.dto.*;
import com.nabhaleam.users.UserSummary;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherProfileController {

    private final StudentProfileService profileService;
    private final CurrentTeacherService currentTeacherService;

    @GetMapping("/profile")
    public ApiResponse<ProfileResponse> profile() {
        return ApiResponse.ok(profileService.profile(currentTeacherService.require()));
    }

    @PutMapping("/profile")
    public ApiResponse<ProfileResponse> update(@Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.ok("Profile updated.",
                profileService.update(currentTeacherService.require(), request));
    }

    @PutMapping("/password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        profileService.changePassword(currentTeacherService.require(), request);
        return ApiResponse.message("Password changed successfully.");
    }

    @GetMapping("/preferences")
    public ApiResponse<PreferencesDto> preferences() {
        return ApiResponse.ok(profileService.profile(currentTeacherService.require()).preferences());
    }

    @PutMapping("/preferences")
    public ApiResponse<PreferencesDto> updatePreferences(
            @Valid @RequestBody PreferencesUpdateRequest request) {
        return ApiResponse.ok("Preferences saved.",
                profileService.updatePreferences(currentTeacherService.require(), request));
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<UserSummary> avatar(@RequestPart("file") MultipartFile file) {
        return ApiResponse.ok("Profile photo updated.",
                profileService.updateAvatar(currentTeacherService.require(), file));
    }
}
