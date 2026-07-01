package com.lightledger.admin.service;

import com.lightledger.admin.mapper.ExpenseCategoryMapper;
import com.lightledger.admin.mapper.ExpenseRecordMapper;
import com.lightledger.admin.mapper.UserMapper;
import com.lightledger.admin.model.entity.ExpenseCategory;
import com.lightledger.admin.model.entity.ExpenseRecord;
import com.lightledger.admin.model.entity.User;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.*;

@Service
public class AdminReportService {

    private final ExpenseRecordMapper recordMapper;
    private final UserMapper userMapper;
    private final ExpenseCategoryMapper categoryMapper;

    public AdminReportService(ExpenseRecordMapper recordMapper, UserMapper userMapper, ExpenseCategoryMapper categoryMapper) {
        this.recordMapper = recordMapper;
        this.userMapper = userMapper;
        this.categoryMapper = categoryMapper;
    }

    public List<Map<String, Object>> getExpenseTrend(int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);

        var wrapper = new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<ExpenseRecord>();
        wrapper.eq(ExpenseRecord::getStatus, 1)
                .ge(ExpenseRecord::getRecordDate, startDate)
                .le(ExpenseRecord::getRecordDate, endDate);
        List<ExpenseRecord> records = recordMapper.selectList(wrapper);

        Map<LocalDate, Double> dailyTotals = new HashMap<>();
        for (ExpenseRecord r : records) {
            LocalDate date = r.getRecordDate();
            double amt = r.getAmount() != null ? r.getAmount().doubleValue() : 0.0;
            dailyTotals.merge(date, amt, Double::sum);
        }

        return dailyTotals.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("date", e.getKey().toString());
                    map.put("amount", e.getValue());
                    return map;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    public List<Map<String, Object>> getUserRanking(int limit) {
        var wrapper = new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<ExpenseRecord>();
        wrapper.eq(ExpenseRecord::getStatus, 1);
        List<ExpenseRecord> records = recordMapper.selectList(wrapper);

        Map<Long, Double> userTotals = new HashMap<>();
        for (ExpenseRecord r : records) {
            double amt = r.getAmount() != null ? r.getAmount().doubleValue() : 0.0;
            userTotals.merge(r.getUserId(), amt, Double::sum);
        }

        List<Long> userIds = userTotals.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(java.util.stream.Collectors.toList());

        Map<Long, String> userNames = new HashMap<>();
        if (!userIds.isEmpty()) {
            userMapper.selectBatchIds(userIds).forEach(u -> userNames.put(u.getId(), u.getUsername()));
        }

        return userTotals.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .limit(limit)
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("userId", e.getKey());
                    map.put("username", userNames.getOrDefault(e.getKey(), "未知"));
                    map.put("totalAmount", e.getValue());
                    return map;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    public List<Map<String, Object>> getCategoryRanking() {
        var wrapper = new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<ExpenseRecord>();
        wrapper.eq(ExpenseRecord::getStatus, 1);
        List<ExpenseRecord> records = recordMapper.selectList(wrapper);

        Map<Long, Double> categoryTotals = new HashMap<>();
        for (ExpenseRecord r : records) {
            double amt = r.getAmount() != null ? r.getAmount().doubleValue() : 0.0;
            categoryTotals.merge(r.getCategoryId(), amt, Double::sum);
        }

        List<Long> categoryIds = new ArrayList<>(categoryTotals.keySet());
        Map<Long, String> categoryNames = new HashMap<>();
        if (!categoryIds.isEmpty()) {
            categoryMapper.selectBatchIds(categoryIds).forEach(c -> categoryNames.put(c.getId(), c.getName()));
        }

        return categoryTotals.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("categoryId", e.getKey());
                    map.put("categoryName", categoryNames.getOrDefault(e.getKey(), "未知"));
                    map.put("totalAmount", e.getValue());
                    return map;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    public List<Map<String, Object>> getUserTrend(int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);

        var wrapper = new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<User>();
        wrapper.ge(User::getCreatedAt, startDate.atStartOfDay())
                .le(User::getCreatedAt, endDate.plusDays(1).atStartOfDay());
        List<User> users = userMapper.selectList(wrapper);

        Map<LocalDate, Long> dailyCounts = new HashMap<>();
        for (User u : users) {
            if (u.getCreatedAt() != null) {
                LocalDate date = u.getCreatedAt().toLocalDate();
                dailyCounts.merge(date, 1L, Long::sum);
            }
        }

        return dailyCounts.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("date", e.getKey().toString());
                    map.put("count", e.getValue());
                    return map;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    public byte[] exportExcel(int days) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet1 = workbook.createSheet("概览");
            createOverviewSheet(sheet1);

            Sheet sheet2 = workbook.createSheet("消费趋势");
            createTrendSheet(sheet2, days);

            Sheet sheet3 = workbook.createSheet("用户排行");
            createUserRankingSheet(sheet3);

            Sheet sheet4 = workbook.createSheet("分类排行");
            createCategoryRankingSheet(sheet4);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("导出Excel失败: " + e.getMessage());
        }
    }

    private void createOverviewSheet(Sheet sheet) {
        Row row = sheet.createRow(0);
        row.createCell(0).setCellValue("轻账本后台管理系统 - 数据概览");

        Row row1 = sheet.createRow(2);
        row1.createCell(0).setCellValue("统计项目");
        row1.createCell(1).setCellValue("数值");

        Long totalUsers = userMapper.selectCount(null);
        var recordWrapper = new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<ExpenseRecord>();
        recordWrapper.eq(ExpenseRecord::getStatus, 1);
        List<ExpenseRecord> allRecords = recordMapper.selectList(recordWrapper);
        double totalAmount = 0.0;
        for (ExpenseRecord r : allRecords) {
            if (r.getAmount() != null) {
                totalAmount += r.getAmount().doubleValue();
            }
        }

        Row row2 = sheet.createRow(3);
        row2.createCell(0).setCellValue("注册用户总数");
        row2.createCell(1).setCellValue(totalUsers);

        Row row3 = sheet.createRow(4);
        row3.createCell(0).setCellValue("消费记录总数");
        row3.createCell(1).setCellValue(allRecords.size());

        Row row4 = sheet.createRow(5);
        row4.createCell(0).setCellValue("消费总额");
        row4.createCell(1).setCellValue(totalAmount);

        sheet.setColumnWidth(0, 5000);
        sheet.setColumnWidth(1, 3000);
    }

    private void createTrendSheet(Sheet sheet, int days) {
        Row row = sheet.createRow(0);
        row.createCell(0).setCellValue("日期");
        row.createCell(1).setCellValue("消费金额");

        List<Map<String, Object>> trend = getExpenseTrend(days);
        for (int i = 0; i < trend.size(); i++) {
            Map<String, Object> item = trend.get(i);
            Row dataRow = sheet.createRow(i + 1);
            dataRow.createCell(0).setCellValue(item.get("date").toString());
            dataRow.createCell(1).setCellValue((Double) item.get("amount"));
        }

        sheet.setColumnWidth(0, 3000);
        sheet.setColumnWidth(1, 3000);
    }

    private void createUserRankingSheet(Sheet sheet) {
        Row row = sheet.createRow(0);
        row.createCell(0).setCellValue("用户名");
        row.createCell(1).setCellValue("消费总额");

        List<Map<String, Object>> ranking = getUserRanking(20);
        for (int i = 0; i < ranking.size(); i++) {
            Map<String, Object> item = ranking.get(i);
            Row dataRow = sheet.createRow(i + 1);
            dataRow.createCell(0).setCellValue(item.get("username").toString());
            dataRow.createCell(1).setCellValue((Double) item.get("totalAmount"));
        }

        sheet.setColumnWidth(0, 3000);
        sheet.setColumnWidth(1, 3000);
    }

    private void createCategoryRankingSheet(Sheet sheet) {
        Row row = sheet.createRow(0);
        row.createCell(0).setCellValue("分类名称");
        row.createCell(1).setCellValue("消费总额");

        List<Map<String, Object>> ranking = getCategoryRanking();
        for (int i = 0; i < ranking.size(); i++) {
            Map<String, Object> item = ranking.get(i);
            Row dataRow = sheet.createRow(i + 1);
            dataRow.createCell(0).setCellValue(item.get("categoryName").toString());
            dataRow.createCell(1).setCellValue((Double) item.get("totalAmount"));
        }

        sheet.setColumnWidth(0, 3000);
        sheet.setColumnWidth(1, 3000);
    }
}