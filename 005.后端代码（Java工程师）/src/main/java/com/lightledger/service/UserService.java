package com.lightledger.service;

import com.lightledger.exception.BusinessException;
import com.lightledger.mapper.UserMapper;
import com.lightledger.mapper.UserPreferencesMapper;
import com.lightledger.model.dto.UpdatePreferencesRequest;
import com.lightledger.model.entity.User;
import com.lightledger.model.entity.UserPreferences;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

/**
 * 用户服务类
 */
@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserMapper userMapper;
    private final UserPreferencesMapper preferencesMapper;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserMapper userMapper, UserPreferencesMapper preferencesMapper, PasswordEncoder passwordEncoder) {
        this.userMapper = userMapper;
        this.preferencesMapper = preferencesMapper;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * 获取用户信息
     *
     * @param userId 用户ID
     * @return 用户信息
     */
    @Transactional(readOnly = true)
    public User getUserById(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        return user;
    }

    /**
     * 更新用户资料
     *
     * @param userId 用户ID
     * @param email 邮箱
     * @param phone 手机号
     * @param avatar 头像
     * @return 更新后的用户信息
     */
    @Transactional(rollbackFor = Exception.class)
    public User updateProfile(Long userId, String email, String phone, String avatar) {
        log.info("更新用户资料：userId={}", userId);

        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        if (email != null) user.setEmail(email);
        if (phone != null) user.setPhone(phone);
        if (avatar != null) user.setAvatar(avatar);
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.updateById(user);

        log.info("用户资料更新成功：userId={}", userId);
        return user;
    }

    /**
     * 修改密码
     *
     * @param userId 用户ID
     * @param oldPassword 旧密码
     * @param newPassword 新密码
     */
    @Transactional(rollbackFor = Exception.class)
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        log.info("修改密码请求：userId={}", userId);

        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            log.warn("修改密码失败：原密码错误，userId={}", userId);
            throw new BusinessException("原密码错误");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.updateById(user);

        log.info("密码修改成功：userId={}", userId);
    }

    /**
     * 绑定手机号
     *
     * @param userId 用户ID
     * @param phone 手机号
     */
    @Transactional(rollbackFor = Exception.class)
    public void bindPhone(Long userId, String phone) {
        log.info("绑定手机号请求：userId={}, phone={}", userId, phone);

        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        user.setPhone(phone);
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.updateById(user);

        log.info("手机号绑定成功：userId={}", userId);
    }

    /**
     * 获取用户偏好设置
     *
     * @param userId 用户ID
     * @return 用户偏好设置
     */
    @Transactional(readOnly = true)
    public UserPreferences getPreferences(Long userId) {
        log.info("获取用户偏好设置：userId={}", userId);

        UserPreferences preferences = preferencesMapper.selectOne(
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<UserPreferences>()
                .eq(UserPreferences::getUserId, userId)
        );

        // 如果不存在，创建默认设置
        if (preferences == null) {
            preferences = new UserPreferences();
            preferences.setUserId(userId);
            preferences.setDefaultPage("dashboard");
            preferences.setPageSize(20);
            preferences.setReminderEnabled(0);
            preferences.setCurrency("CNY");
            preferences.setLanguage("zh-CN");
            preferences.setCreatedAt(LocalDateTime.now());
            preferences.setUpdatedAt(LocalDateTime.now());
            preferencesMapper.insert(preferences);
            log.info("创建默认用户偏好设置：userId={}", userId);
        }

        return preferences;
    }

    /**
     * 更新用户偏好设置
     *
     * @param userId 用户ID
     * @param request 更新请求
     * @return 更新后的偏好设置
     */
    @Transactional(rollbackFor = Exception.class)
    public UserPreferences updatePreferences(Long userId, UpdatePreferencesRequest request) {
        log.info("更新用户偏好设置：userId={}", userId);

        UserPreferences preferences = getPreferences(userId);

        if (request.getDefaultPage() != null) {
            preferences.setDefaultPage(request.getDefaultPage());
        }
        if (request.getPageSize() != null) {
            preferences.setPageSize(request.getPageSize());
        }
        if (request.getReminderEnabled() != null) {
            preferences.setReminderEnabled(request.getReminderEnabled() ? 1 : 0);
        }
        if (request.getReminderTime() != null) {
            preferences.setReminderTime(request.getReminderTime());
        }
        if (request.getCurrency() != null) {
            preferences.setCurrency(request.getCurrency());
        }
        if (request.getLanguage() != null) {
            preferences.setLanguage(request.getLanguage());
        }
        preferences.setUpdatedAt(LocalDateTime.now());
        preferencesMapper.updateById(preferences);

        log.info("用户偏好设置更新成功：userId={}", userId);
        return preferences;
    }
}
