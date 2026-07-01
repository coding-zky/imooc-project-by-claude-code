package com.lightledger.admin.controller;

import com.lightledger.admin.model.dto.AdminAuthResponse;
import com.lightledger.admin.model.dto.AdminLoginRequest;
import com.lightledger.admin.model.dto.ApiResponse;
import com.lightledger.admin.service.AdminAuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private final AdminAuthService authService;

    public AdminAuthController(AdminAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ApiResponse<AdminAuthResponse> login(@RequestBody AdminLoginRequest request) {
        AdminAuthResponse response = authService.login(request);
        return ApiResponse.success(response);
    }
}