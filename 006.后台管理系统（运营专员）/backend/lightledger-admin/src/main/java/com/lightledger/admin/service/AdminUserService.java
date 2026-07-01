package com.lightledger.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lightledger.admin.exception.BusinessException;
import com.lightledger.admin.mapper.ExpenseRecordMapper;
import com.lightledger.admin.mapper.UserMapper;
import com.lightledger.admin.mapper.UserPreferencesMapper;
import com.lightledger.admin.model.dto.PageResult;
import com.lightledger.admin.model.entity.ExpenseRecord;
import com.lightledger.admin.model.entity.User;
import com.lightledger.admin.model.entity.UserPreferences;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminUserService {

    private final UserMapper userMapper;
    private final ExpenseRecordMapper recordMapper;
    private final UserPreferencesMapper preferencesMapper;

    public AdminUserService(UserMapper userMapper, ExpenseRecordMapper recordMapper, UserPreferencesMapper preferencesMapper) {
        this.userMapper = userMapper;
        this.recordMapper = recordMapper;
        this.preferencesMapper = preferencesMapper;
    }

    public PageResult<Map<String, Object>> getUserList(String keyword, Long page, Long pageSize) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(User::getUsername, keyword);
        }
        wrapper.orderByDesc(User::getCreatedAt);

        Page<User> pageResult = new Page<>(page, pageSize);
        Page<User> result = userMapper.selectPage(pageResult, wrapper);

        List<Map<String, Object>> records = result.getRecords().stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", user.getId());
            map.put("username", user.getUsername());
            map.put("email", user.getEmail());
            map.put("phone", user.getPhone());
            map.put("status", user.getStatus());
            map.put("createdAt", user.getCreatedAt());

            // 计算用户消费统计
            LambdaQueryWrapper<ExpenseRecord> recordWrapper = new LambdaQueryWrapper<>();
            recordWrapper.eq(ExpenseRecord::getUserId, user.getId())
                    .eq(ExpenseRecord::getStatus, 1);
            List<ExpenseRecord> records1 = recordMapper.selectList(recordWrapper);

            double totalAmountVal = 0.0;
            for (ExpenseRecord r : records1) {
                if (r.getAmount() != null) {
                    totalAmountVal += r.getAmount().doubleValue();
                }
            }

            map.put("totalAmount", totalAmountVal);
            map.put("recordCount", records1.size());
            return map;
        }).toList();

        return new PageResult<>(records, result.getTotal(), page, pageSize);
    }

    public Map<String, Object> getUserDetail(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("id", user.getId());
        result.put("username", user.getUsername());
        result.put("email", user.getEmail());
        result.put("phone", user.getPhone());
        result.put("status", user.getStatus());
        result.put("createdAt", user.getCreatedAt());

        // 消费统计
        LambdaQueryWrapper<ExpenseRecord> recordWrapper = new LambdaQueryWrapper<>();
        recordWrapper.eq(ExpenseRecord::getUserId, userId)
                .eq(ExpenseRecord::getStatus, 1)
                .orderByDesc(ExpenseRecord::getRecordDate);
        List<ExpenseRecord> records = recordMapper.selectList(recordWrapper);

        double totalAmountVal = 0.0;
        for (ExpenseRecord r : records) {
            if (r.getAmount() != null) {
                totalAmountVal += r.getAmount().doubleValue();
            }
        }

        result.put("totalAmount", totalAmountVal);
        result.put("recordCount", records.size());
        result.put("dailyAverage", records.isEmpty() ? 0 : totalAmountVal / records.size());

        // 最近10条记录
        List<Map<String, Object>> recentRecords = records.stream().limit(10).map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("amount", r.getAmount());
            map.put("categoryId", r.getCategoryId());
            map.put("recordDate", r.getRecordDate());
            map.put("note", r.getNote());
            map.put("status", r.getStatus());
            return map;
        }).toList();
        result.put("recentRecords", recentRecords);

        // 偏好设置
        LambdaQueryWrapper<UserPreferences> prefWrapper = new LambdaQueryWrapper<>();
        prefWrapper.eq(UserPreferences::getUserId, userId);
        UserPreferences preferences = preferencesMapper.selectOne(prefWrapper);
        if (preferences != null) {
            Map<String, Object> prefMap = new HashMap<>();
            prefMap.put("defaultPage", preferences.getDefaultPage());
            prefMap.put("pageSize", preferences.getPageSize());
            prefMap.put("reminderEnabled", preferences.getReminderEnabled());
            result.put("preferences", prefMap);
        }

        return result;
    }

    @Transactional
    public void updateUserStatus(Long userId, Integer status) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        user.setStatus(status);
        userMapper.updateById(user);
    }
}