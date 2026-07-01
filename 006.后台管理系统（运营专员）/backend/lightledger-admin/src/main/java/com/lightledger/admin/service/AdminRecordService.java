package com.lightledger.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lightledger.admin.exception.BusinessException;
import com.lightledger.admin.mapper.ExpenseCategoryMapper;
import com.lightledger.admin.mapper.ExpenseRecordMapper;
import com.lightledger.admin.mapper.UserMapper;
import com.lightledger.admin.model.dto.PageResult;
import com.lightledger.admin.model.entity.ExpenseCategory;
import com.lightledger.admin.model.entity.ExpenseRecord;
import com.lightledger.admin.model.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminRecordService {

    private final ExpenseRecordMapper recordMapper;
    private final UserMapper userMapper;
    private final ExpenseCategoryMapper categoryMapper;

    public AdminRecordService(ExpenseRecordMapper recordMapper, UserMapper userMapper, ExpenseCategoryMapper categoryMapper) {
        this.recordMapper = recordMapper;
        this.userMapper = userMapper;
        this.categoryMapper = categoryMapper;
    }

    public PageResult<Map<String, Object>> getRecordList(String keyword, Long categoryId, String month, Long page, Long pageSize) {
        LambdaQueryWrapper<ExpenseRecord> wrapper = new LambdaQueryWrapper<>();

        if (keyword != null && !keyword.isEmpty()) {
            // 通过用户名搜索
            LambdaQueryWrapper<User> userWrapper = new LambdaQueryWrapper<>();
            userWrapper.like(User::getUsername, keyword);
            List<User> users = userMapper.selectList(userWrapper);
            List<Long> userIds = users.stream().map(User::getId).toList();
            if (!userIds.isEmpty()) {
                wrapper.in(ExpenseRecord::getUserId, userIds);
            } else {
                wrapper.eq(ExpenseRecord::getId, -1L); // 无结果
            }
        }

        if (categoryId != null) {
            wrapper.eq(ExpenseRecord::getCategoryId, categoryId);
        }

        if (month != null && !month.isEmpty()) {
            wrapper.likeRight(ExpenseRecord::getRecordDate, month);
        }

        wrapper.orderByDesc(ExpenseRecord::getRecordDate);

        Page<ExpenseRecord> pageResult = new Page<>(page, pageSize);
        Page<ExpenseRecord> result = recordMapper.selectPage(pageResult, wrapper);

        // 预加载所有用户名和分类名
        List<Long> userIds = result.getRecords().stream().map(ExpenseRecord::getUserId).distinct().toList();
        List<Long> categoryIds = result.getRecords().stream().map(ExpenseRecord::getCategoryId).distinct().toList();

        Map<Long, String> userMap = new HashMap<>();
        if (!userIds.isEmpty()) {
            List<User> users = userMapper.selectBatchIds(userIds);
            users.forEach(u -> userMap.put(u.getId(), u.getUsername()));
        }

        Map<Long, String> categoryMap = new HashMap<>();
        if (!categoryIds.isEmpty()) {
            List<ExpenseCategory> categories = categoryMapper.selectBatchIds(categoryIds);
            categories.forEach(c -> categoryMap.put(c.getId(), c.getName()));
        }

        List<Map<String, Object>> records = result.getRecords().stream().map(record -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", record.getId());
            map.put("userId", record.getUserId());
            map.put("username", userMap.getOrDefault(record.getUserId(), "未知"));
            map.put("categoryId", record.getCategoryId());
            map.put("categoryName", categoryMap.getOrDefault(record.getCategoryId(), "未知"));
            map.put("amount", record.getAmount());
            map.put("recordDate", record.getRecordDate());
            map.put("note", record.getNote());
            map.put("status", record.getStatus());
            map.put("createdAt", record.getCreatedAt());
            return map;
        }).toList();

        return new PageResult<>(records, result.getTotal(), page, pageSize);
    }

    public Map<String, Object> getRecordDetail(String recordId) {
        ExpenseRecord record = recordMapper.selectById(recordId);
        if (record == null) {
            throw new BusinessException("记录不存在");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("id", record.getId());
        result.put("userId", record.getUserId());
        result.put("categoryId", record.getCategoryId());
        result.put("amount", record.getAmount());
        result.put("recordDate", record.getRecordDate());
        result.put("note", record.getNote());
        result.put("status", record.getStatus());
        result.put("createdAt", record.getCreatedAt());

        // 用户信息
        User user = userMapper.selectById(record.getUserId());
        if (user != null) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("username", user.getUsername());
            userMap.put("email", user.getEmail());
            result.put("user", userMap);
        }

        // 分类信息
        ExpenseCategory category = categoryMapper.selectById(record.getCategoryId());
        if (category != null) {
            Map<String, Object> categoryMap = new HashMap<>();
            categoryMap.put("id", category.getId());
            categoryMap.put("name", category.getName());
            categoryMap.put("icon", category.getIcon());
            categoryMap.put("color", category.getColor());
            result.put("category", categoryMap);
        }

        return result;
    }

    @Transactional
    public void deleteRecord(String recordId) {
        ExpenseRecord record = recordMapper.selectById(recordId);
        if (record == null) {
            throw new BusinessException("记录不存在");
        }
        record.setStatus(0); // 逻辑删除
        recordMapper.updateById(record);
    }
}