package com.lightledger.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.lightledger.mapper.CategoryMapper;
import com.lightledger.mapper.RecordMapper;
import com.lightledger.model.entity.Category;
import com.lightledger.model.entity.Record;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 统计服务类
 */
@Service
public class StatsService {

    private static final Logger log = LoggerFactory.getLogger(StatsService.class);

    private final RecordMapper recordMapper;
    private final CategoryMapper categoryMapper;

    @Autowired
    public StatsService(RecordMapper recordMapper, CategoryMapper categoryMapper) {
        this.recordMapper = recordMapper;
        this.categoryMapper = categoryMapper;
    }

    /**
     * 获取消费统计
     *
     * @param userId 用户ID
     * @param days 统计天数
     * @return 统计数据
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStats(Long userId, int days) {
        log.info("获取消费统计：userId={}, days={}", userId, days);

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);

        // 查询日期范围内的所有记录
        LambdaQueryWrapper<Record> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Record::getUserId, userId);
        wrapper.eq(Record::getStatus, 1);
        wrapper.ge(Record::getRecordDate, startDate.atStartOfDay());
        wrapper.le(Record::getRecordDate, endDate.atTime(LocalTime.MAX));
        List<Record> records = recordMapper.selectList(wrapper);

        // 计算总金额
        BigDecimal totalAmount = records.stream()
                .map(Record::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 按日期分组计算每日金额
        Map<LocalDate, BigDecimal> dailyAmounts = records.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        r -> r.getRecordDate().toLocalDate(),
                        java.util.stream.Collectors.reducing(BigDecimal.ZERO, Record::getAmount, BigDecimal::add)
                ));

        // 构建每日数据
        List<Map<String, Object>> dailyData = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            LocalDate date = startDate.plusDays(i);
            BigDecimal amount = dailyAmounts.getOrDefault(date, BigDecimal.ZERO);
            Map<String, Object> day = new HashMap<>();
            day.put("date", date.toString());
            day.put("label", date.format(DateTimeFormatter.ofPattern("MM-dd")));
            day.put("amount", amount);
            dailyData.add(day);
        }

        // 按分类汇总
        Map<Long, BigDecimal> categoryAmounts = records.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        Record::getCategoryId,
                        java.util.stream.Collectors.reducing(BigDecimal.ZERO, Record::getAmount, BigDecimal::add)
                ));

        // 获取分类信息并计算占比
        List<Category> categories = categoryMapper.selectList(null);
        Map<Long, Category> categoryMap = categories.stream()
                .collect(java.util.stream.Collectors.toMap(Category::getId, c -> c));

        List<Map<String, Object>> categoryData = new ArrayList<>();
        for (Map.Entry<Long, BigDecimal> entry : categoryAmounts.entrySet()) {
            Category cat = categoryMap.get(entry.getKey());
            if (cat != null) {
                Map<String, Object> catData = new HashMap<>();
                catData.put("categoryId", cat.getId());
                catData.put("name", cat.getName());
                catData.put("emoji", cat.getEmoji());
                catData.put("amount", entry.getValue());
                catData.put("percentage", totalAmount.compareTo(BigDecimal.ZERO) > 0
                        ? entry.getValue().divide(totalAmount, 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100))
                                .setScale(1, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO);
                categoryData.add(catData);
            }
        }

        // 按金额降序排序
        categoryData.sort((a, b) -> {
            BigDecimal amtA = (BigDecimal) a.get("amount");
            BigDecimal amtB = (BigDecimal) b.get("amount");
            return amtB.compareTo(amtA);
        });

        // 计算日均
        BigDecimal avgDaily = days > 0 ? totalAmount.divide(BigDecimal.valueOf(days), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        Map<String, Object> result = new HashMap<>();
        result.put("totalAmount", totalAmount);
        result.put("recordCount", records.size());
        result.put("avgDaily", avgDaily);
        result.put("dailyData", dailyData);
        result.put("categoryData", categoryData);

        log.info("统计获取成功：userId={}, totalAmount={}, recordCount={}", userId, totalAmount, records.size());
        return result;
    }

    /**
     * 导出Excel报表
     *
     * @param userId 用户ID
     * @param days 统计天数
     * @return Excel文件的字节数组
     */
    @Transactional(readOnly = true)
    public byte[] exportExcel(Long userId, int days) {
        log.info("导出Excel报表：userId={}, days={}", userId, days);

        // 获取统计数据
        Map<String, Object> stats = getStats(userId, days);
        List<Map<String, Object>> dailyData = (List<Map<String, Object>>) stats.get("dailyData");
        List<Map<String, Object>> categoryData = (List<Map<String, Object>>) stats.get("categoryData");

        // 查询原始记录
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);
        LambdaQueryWrapper<Record> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Record::getUserId, userId);
        wrapper.eq(Record::getStatus, 1);
        wrapper.ge(Record::getRecordDate, startDate.atStartOfDay());
        wrapper.le(Record::getRecordDate, endDate.atTime(LocalTime.MAX));
        wrapper.orderByDesc(Record::getRecordDate);
        List<Record> records = recordMapper.selectList(wrapper);

        // 获取分类映射
        List<Category> categories = categoryMapper.selectList(null);
        Map<Long, Category> categoryMap = categories.stream()
                .collect(java.util.stream.Collectors.toMap(Category::getId, c -> c));

        try (Workbook workbook = new XSSFWorkbook()) {

            // ========== Sheet 1: 概览 ==========
            Sheet summarySheet = workbook.createSheet("概览");
            summarySheet.setColumnWidth(0, 20 * 256);
            summarySheet.setColumnWidth(1, 20 * 256);

            Row row0 = summarySheet.createRow(0);
            row0.createCell(0).setCellValue("轻账本消费统计报表");
            row0.getCell(0).setCellStyle(createHeaderStyle(workbook));

            Row row1 = summarySheet.createRow(1);
            row1.createCell(0).setCellValue("统计周期");
            row1.createCell(1).setCellValue("最近" + days + "天");

            Row row2 = summarySheet.createRow(2);
            row2.createCell(0).setCellValue("总支出");
            row2.createCell(1).setCellValue("¥ " + stats.get("totalAmount"));

            Row row3 = summarySheet.createRow(3);
            row3.createCell(0).setCellValue("日均消费");
            row3.createCell(1).setCellValue("¥ " + stats.get("avgDaily"));

            Row row4 = summarySheet.createRow(4);
            row4.createCell(0).setCellValue("记录笔数");
            row4.createCell(1).setCellValue((Integer) stats.get("recordCount"));

            // ========== Sheet 2: 每日趋势 ==========
            Sheet dailySheet = workbook.createSheet("每日趋势");
            dailySheet.setColumnWidth(0, 15 * 256);
            dailySheet.setColumnWidth(1, 15 * 256);

            Row dailyHeader = dailySheet.createRow(0);
            dailyHeader.createCell(0).setCellValue("日期");
            dailyHeader.createCell(1).setCellValue("支出金额");
            dailyHeader.getCell(0).setCellStyle(createHeaderStyle(workbook));
            dailyHeader.getCell(1).setCellStyle(createHeaderStyle(workbook));

            for (int i = 0; i < dailyData.size(); i++) {
                Map<String, Object> day = dailyData.get(i);
                Row row = dailySheet.createRow(i + 1);
                row.createCell(0).setCellValue((String) day.get("date"));
                row.createCell(1).setCellValue(((BigDecimal) day.get("amount")).doubleValue());
            }

            // ========== Sheet 3: 分类占比 ==========
            Sheet catSheet = workbook.createSheet("分类占比");
            catSheet.setColumnWidth(0, 15 * 256);
            catSheet.setColumnWidth(1, 8 * 256);
            catSheet.setColumnWidth(2, 15 * 256);
            catSheet.setColumnWidth(3, 10 * 256);

            Row catHeader = catSheet.createRow(0);
            catHeader.createCell(0).setCellValue("分类");
            catHeader.createCell(1).setCellValue("图标");
            catHeader.createCell(2).setCellValue("金额");
            catHeader.createCell(3).setCellValue("占比%");
            for (int i = 0; i < 4; i++) {
                catHeader.getCell(i).setCellStyle(createHeaderStyle(workbook));
            }

            for (int i = 0; i < categoryData.size(); i++) {
                Map<String, Object> cat = categoryData.get(i);
                Row row = catSheet.createRow(i + 1);
                row.createCell(0).setCellValue((String) cat.get("name"));
                row.createCell(1).setCellValue((String) cat.get("emoji"));
                row.createCell(2).setCellValue(((BigDecimal) cat.get("amount")).doubleValue());
                row.createCell(3).setCellValue(((BigDecimal) cat.get("percentage")).doubleValue());
            }

            // ========== Sheet 4: 消费记录 ==========
            Sheet recordsSheet = workbook.createSheet("消费记录");
            recordsSheet.setColumnWidth(0, 15 * 256);
            recordsSheet.setColumnWidth(1, 15 * 256);
            recordsSheet.setColumnWidth(2, 12 * 256);
            recordsSheet.setColumnWidth(3, 30 * 256);

            Row recHeader = recordsSheet.createRow(0);
            recHeader.createCell(0).setCellValue("日期");
            recHeader.createCell(1).setCellValue("分类");
            recHeader.createCell(2).setCellValue("金额");
            recHeader.createCell(3).setCellValue("备注");
            for (int i = 0; i < 4; i++) {
                recHeader.getCell(i).setCellStyle(createHeaderStyle(workbook));
            }

            for (int i = 0; i < records.size(); i++) {
                Record record = records.get(i);
                Category cat = categoryMap.get(record.getCategoryId());
                Row row = recordsSheet.createRow(i + 1);
                row.createCell(0).setCellValue(record.getRecordDate().toLocalDate().toString());
                row.createCell(1).setCellValue((cat != null ? cat.getEmoji() + " " + cat.getName() : "未知"));
                row.createCell(2).setCellValue(record.getAmount().doubleValue());
                row.createCell(3).setCellValue(record.getNote() != null ? record.getNote() : "");
            }

            // 写入字节数组
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            log.info("Excel导出成功：userId={}, 记录数={}", userId, records.size());
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Excel导出失败：userId={}", userId, e);
            throw new RuntimeException("导出Excel失败：" + e.getMessage());
        }
    }

    /**
     * 创建表头样式
     */
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }
}
