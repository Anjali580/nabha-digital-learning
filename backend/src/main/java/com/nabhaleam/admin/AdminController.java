package com.nabhaleam.admin;

import com.nabhaleam.admin.dto.AdminDashboardDto;
import com.nabhaleam.admin.dto.AdminUserDto;
import com.nabhaleam.admin.dto.AdminUserStatusRequest;
import com.nabhaleam.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ApiResponse<AdminDashboardDto> dashboard() {
        adminService.requireAdmin();
        return ApiResponse.ok(adminService.dashboard());
    }

    @GetMapping("/users")
    public ApiResponse<List<AdminUserDto>> users(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String q) {
        adminService.requireAdmin();
        return ApiResponse.ok(adminService.users(role, q));
    }

    @PutMapping("/users/{userId}/status")
    public ApiResponse<AdminUserDto> updateStatus(
            @PathVariable String userId,
            @Valid @RequestBody AdminUserStatusRequest request) {
        return ApiResponse.ok("Account updated.",
                adminService.setActive(userId, Boolean.TRUE.equals(request.active())));
    }
}
