package com.nabhaleam.auth;

import com.nabhaleam.auth.dto.*;
import com.nabhaleam.common.ApiResponse;
import com.nabhaleam.security.SecurityUtils;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuthCookieService cookieService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request,
                                                              HttpServletResponse response) {
        AuthService.AuthResult result = authService.register(request);
        response.addHeader(HttpHeaders.SET_COOKIE, cookieService.create(result.token()).toString());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Your account is ready. Welcome to NabhaLearn!", new AuthResponse(result.user())));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request,
                                                           HttpServletResponse response) {
        AuthService.AuthResult result = authService.login(request);
        response.addHeader(HttpHeaders.SET_COOKIE, cookieService.create(result.token()).toString());
        return ResponseEntity.ok(ApiResponse.ok("Signed in successfully.", new AuthResponse(result.user())));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookieService.clear().toString());
        return ResponseEntity.ok(ApiResponse.message("You have been signed out."));
    }

    @GetMapping("/me")
    public ApiResponse<MeResponse> me() {
        return ApiResponse.ok(authService.me(SecurityUtils.currentUserId()));
    }
}
