package com.lightledger.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.lightledger.config.JwtConfig;
import com.lightledger.exception.BusinessException;
import com.lightledger.mapper.UserMapper;
import com.lightledger.model.dto.AuthResponse;
import com.lightledger.model.dto.LoginRequest;
import com.lightledger.model.dto.RegisterRequest;
import com.lightledger.model.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

/**
 * 认证服务类
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserMapper userMapper;
    private final JwtConfig jwtConfig;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthService(UserMapper userMapper, JwtConfig jwtConfig, PasswordEncoder passwordEncoder) {
        this.userMapper = userMapper;
        this.jwtConfig = jwtConfig;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * 用户注册
     *
     * @param request 注册请求
     * @return 认证响应（包含Token）
     */
    @Transactional(rollbackFor = Exception.class)
    public AuthResponse register(RegisterRequest request) {
        log.info("用户注册请求：username={}", request.getUsername());

        // 检查用户名是否存在
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, request.getUsername());
        if (userMapper.selectCount(wrapper) > 0) {
            log.warn("注册失败：用户名[{}]已存在", request.getUsername());
            throw new BusinessException("用户名已存在");
        }

        // 创建用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setStatus(1);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.insert(user);

        // 生成Token
        String token = jwtConfig.generateToken(user.getId(), user.getUsername());

        log.info("用户注册成功：username={}, userId={}", request.getUsername(), user.getId());

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        return response;
    }

    /**
     * 用户登录
     *
     * @param request 登录请求
     * @return 认证响应（包含Token）
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        log.info("用户登录请求：username={}", request.getUsername());

        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, request.getUsername());
        User user = userMapper.selectOne(wrapper);

        if (user == null) {
            log.warn("登录失败：用户[{}]不存在", request.getUsername());
            throw new BusinessException(401, "用户名或密码错误");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("登录失败：用户[{}]密码错误", request.getUsername());
            throw new BusinessException(401, "用户名或密码错误");
        }

        if (user.getStatus() != 1) {
            log.warn("登录失败：用户[{}]已被禁用", request.getUsername());
            throw new BusinessException(403, "账户已被禁用");
        }

        String token = jwtConfig.generateToken(user.getId(), user.getUsername());

        log.info("用户登录成功：username={}, userId={}", request.getUsername(), user.getId());

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        return response;
    }
}
