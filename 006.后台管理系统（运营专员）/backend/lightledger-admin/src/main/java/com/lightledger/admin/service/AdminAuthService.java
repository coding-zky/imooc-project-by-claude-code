package com.lightledger.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.lightledger.admin.config.AdminJwtService;
import com.lightledger.admin.exception.BusinessException;
import com.lightledger.admin.mapper.AdminUserMapper;
import com.lightledger.admin.model.dto.AdminAuthResponse;
import com.lightledger.admin.model.dto.AdminLoginRequest;
import com.lightledger.admin.model.entity.AdminUser;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AdminAuthService {

    private final AdminUserMapper adminUserMapper;
    private final PasswordEncoder passwordEncoder;
    private final AdminJwtService jwtService;

    public AdminAuthService(AdminUserMapper adminUserMapper, PasswordEncoder passwordEncoder, AdminJwtService jwtService) {
        this.adminUserMapper = adminUserMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AdminAuthResponse login(AdminLoginRequest request) {
        LambdaQueryWrapper<AdminUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AdminUser::getUsername, request.getUsername());
        AdminUser admin = adminUserMapper.selectOne(wrapper);

        if (admin == null) {
            throw new BusinessException("用户名或密码错误");
        }

        if (admin.getStatus() == 0) {
            throw new BusinessException("账号已被禁用");
        }

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }

        // 更新最后登录信息
        admin.setLastLoginAt(LocalDateTime.now());
        adminUserMapper.updateById(admin);

        String token = jwtService.generateToken(admin.getId(), admin.getUsername());
        return new AdminAuthResponse(token, admin.getId(), admin.getUsername(), admin.getRealName());
    }
}