package com.lightledger.admin.controller;

import com.lightledger.admin.model.dto.ApiResponse;
import com.lightledger.admin.model.dto.PageResult;
import com.lightledger.admin.service.AdminUserService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService userService;

    public AdminUserController(AdminUserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ApiResponse<PageResult<Map<String, Object>>> getUserList(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "20") Long pageSize) {
        PageResult<Map<String, Object>> result = userService.getUserList(keyword, page, pageSize);
        return ApiResponse.success(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> getUserDetail(@PathVariable Long id) {
        Map<String, Object> detail = userService.getUserDetail(id);
        return ApiResponse.success(detail);
    }

    @PutMapping("/{id}/status")
    public ApiResponse<Void> updateUserStatus(@PathVariable Long id, @RequestParam Integer status) {
        userService.updateUserStatus(id, status);
        return ApiResponse.success("状态更新成功", null);
    }
}