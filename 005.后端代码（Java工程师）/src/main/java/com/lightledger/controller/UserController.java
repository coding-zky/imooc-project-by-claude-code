package com.lightledger.controller;

import com.lightledger.model.dto.ApiResponse;
import com.lightledger.model.dto.UpdatePreferencesRequest;
import com.lightledger.model.entity.User;
import com.lightledger.model.entity.UserPreferences;
import com.lightledger.service.UserService;
import com.lightledger.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 用户控制器
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @Autowired
    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/profile")
    public ApiResponse<User> getProfile() {
        Long userId = jwtUtil.getCurrentUserId();
        User user = userService.getUserById(userId);
        // 清除密码，不返回给前端
        user.setPassword(null);
        return ApiResponse.success(user);
    }

    /**
     * 更新用户资料
     */
    @PutMapping("/profile")
    public ApiResponse<User> updateProfile(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String avatar) {
        Long userId = jwtUtil.getCurrentUserId();
        User user = userService.updateProfile(userId, email, phone, avatar);
        // 清除密码
        user.setPassword(null);
        return ApiResponse.success(user);
    }

    /**
     * 修改密码
     */
    @PutMapping("/password")
    public ApiResponse<Void> changePassword(
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        Long userId = jwtUtil.getCurrentUserId();
        userService.changePassword(userId, oldPassword, newPassword);
        return ApiResponse.success();
    }

    /**
     * 绑定手机号
     */
    @PostMapping("/phone")
    public ApiResponse<Void> bindPhone(@RequestParam String phone) {
        Long userId = jwtUtil.getCurrentUserId();
        userService.bindPhone(userId, phone);
        return ApiResponse.success();
    }

    /**
     * 获取用户偏好设置
     */
    @GetMapping("/preferences")
    public ApiResponse<UserPreferences> getPreferences() {
        Long userId = jwtUtil.getCurrentUserId();
        return ApiResponse.success(userService.getPreferences(userId));
    }

    /**
     * 更新用户偏好设置
     */
    @PutMapping("/preferences")
    public ApiResponse<UserPreferences> updatePreferences(@Valid @RequestBody UpdatePreferencesRequest request) {
        Long userId = jwtUtil.getCurrentUserId();
        return ApiResponse.success(userService.updatePreferences(userId, request));
    }
}
