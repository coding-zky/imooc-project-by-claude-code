package com.lightledger.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.lightledger.admin.mapper.ExpenseRecordMapper;
import com.lightledger.admin.mapper.UserMapper;
import com.lightledger.admin.model.dto.DashboardStats;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    private final UserMapper userMapper;
    private final ExpenseRecordMapper recordMapper;

    public AdminDashboardService(UserMapper userMapper, ExpenseRecordMapper recordMapper) {
        this.userMapper = userMapper;
        this.recordMapper = recordMapper;
    }

    public DashboardStats getDashboardStats() {
        // 用户总数
        Long totalUsers = userMapper.selectCount(null);

        // 今日新增用户
        LocalDate today = LocalDate.now();
        LambdaQueryWrapper<com.lightledger.admin.model.entity.User> todayWrapper = new LambdaQueryWrapper<>();
        todayWrapper.ge(com.lightledger.admin.model.entity.User::getCreatedAt, today.atStartOfDay());
        Long todayNewUsers = userMapper.selectCount(todayWrapper);

        // 全平台消费总额 (status = 1)
        LambdaQueryWrapper<com.lightledger.admin.model.entity.ExpenseRecord> totalExpenseWrapper = new LambdaQueryWrapper<>();
        totalExpenseWrapper.eq(com.lightledger.admin.model.entity.ExpenseRecord::getStatus, 1);
        List<com.lightledger.admin.model.entity.ExpenseRecord> allRecords = recordMapper.selectList(totalExpenseWrapper);
        double totalExpenses = 0.0;
        for (com.lightledger.admin.model.entity.ExpenseRecord r : allRecords) {
            if (r.getAmount() != null) {
                totalExpenses += r.getAmount().doubleValue();
            }
        }

        // 今日消费总额
        LambdaQueryWrapper<com.lightledger.admin.model.entity.ExpenseRecord> todayExpenseWrapper = new LambdaQueryWrapper<>();
        todayExpenseWrapper.eq(com.lightledger.admin.model.entity.ExpenseRecord::getRecordDate, today)
                .eq(com.lightledger.admin.model.entity.ExpenseRecord::getStatus, 1);
        List<com.lightledger.admin.model.entity.ExpenseRecord> todayRecords = recordMapper.selectList(todayExpenseWrapper);
        double todayExpensesVal = 0.0;
        for (com.lightledger.admin.model.entity.ExpenseRecord r : todayRecords) {
            if (r.getAmount() != null) {
                todayExpensesVal += r.getAmount().doubleValue();
            }
        }

        return new DashboardStats(totalUsers, todayNewUsers,
                totalExpenses, todayExpensesVal);
    }

    public List<Map<String, Object>> getRecentExpenseTrend(int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);

        LambdaQueryWrapper<com.lightledger.admin.model.entity.ExpenseRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(com.lightledger.admin.model.entity.ExpenseRecord::getStatus, 1)
                .ge(com.lightledger.admin.model.entity.ExpenseRecord::getRecordDate, startDate)
                .le(com.lightledger.admin.model.entity.ExpenseRecord::getRecordDate, endDate);
        List<com.lightledger.admin.model.entity.ExpenseRecord> records = recordMapper.selectList(wrapper);

        // 按日期分组汇总
        Map<LocalDate, Double> dailyTotals = new java.util.HashMap<>();
        for (com.lightledger.admin.model.entity.ExpenseRecord r : records) {
            LocalDate date = r.getRecordDate();
            double amt = r.getAmount() != null ? r.getAmount().doubleValue() : 0.0;
            dailyTotals.merge(date, amt, Double::sum);
        }
        return dailyTotals.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    java.util.HashMap<String, Object> map = new java.util.HashMap<>();
                    map.put("date", e.getKey().toString());
                    map.put("amount", e.getValue());
                    return map;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getCategoryDistribution() {
        LambdaQueryWrapper<com.lightledger.admin.model.entity.ExpenseRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(com.lightledger.admin.model.entity.ExpenseRecord::getStatus, 1);
        List<com.lightledger.admin.model.entity.ExpenseRecord> records = recordMapper.selectList(wrapper);

        Map<Long, Double> categoryTotals = new java.util.HashMap<>();
        for (com.lightledger.admin.model.entity.ExpenseRecord r : records) {
            Long catId = r.getCategoryId();
            double amt = r.getAmount() != null ? r.getAmount().doubleValue() : 0.0;
            categoryTotals.merge(catId, amt, Double::sum);
        }
        return categoryTotals.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .map(e -> {
                    java.util.HashMap<String, Object> map = new java.util.HashMap<>();
                    map.put("categoryId", e.getKey());
                    map.put("amount", e.getValue());
                    return map;
                })
                .collect(Collectors.toList());
    }
}