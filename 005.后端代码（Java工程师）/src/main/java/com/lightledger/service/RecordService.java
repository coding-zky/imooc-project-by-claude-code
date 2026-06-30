package com.lightledger.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lightledger.exception.BusinessException;
import com.lightledger.mapper.CategoryMapper;
import com.lightledger.mapper.RecordMapper;
import com.lightledger.model.dto.CreateRecordRequest;
import com.lightledger.model.dto.PageResponse;
import com.lightledger.model.dto.QueryRecordsRequest;
import com.lightledger.model.dto.UpdateRecordRequest;
import com.lightledger.model.entity.Category;
import com.lightledger.model.entity.Record;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 消费记录服务类
 */
@Service
public class RecordService {

    private static final Logger log = LoggerFactory.getLogger(RecordService.class);

    private final RecordMapper recordMapper;
    private final CategoryMapper categoryMapper;

    @Autowired
    public RecordService(RecordMapper recordMapper, CategoryMapper categoryMapper) {
        this.recordMapper = recordMapper;
        this.categoryMapper = categoryMapper;
    }

    /**
     * 分页查询消费记录
     *
     * @param userId 用户ID
     * @param query 查询条件
     * @return 分页结果
     */
    @Transactional(readOnly = true)
    public PageResponse<Map<String, Object>> queryRecords(Long userId, QueryRecordsRequest query) {
        log.info("查询消费记录：userId={}, month={}, categoryId={}", userId, query.getMonth(), query.getCategoryId());

        LambdaQueryWrapper<Record> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Record::getUserId, userId);
        wrapper.eq(Record::getStatus, 1);

        // 月份筛选
        if (StringUtils.hasText(query.getMonth())) {
            YearMonth yearMonth = YearMonth.parse(query.getMonth());
            LocalDate startDate = yearMonth.atDay(1);
            LocalDate endDate = yearMonth.atEndOfMonth();
            wrapper.ge(Record::getRecordDate, startDate.atStartOfDay());
            wrapper.le(Record::getRecordDate, endDate.atTime(LocalTime.MAX));
        }

        // 分类筛选
        if (query.getCategoryId() != null) {
            wrapper.eq(Record::getCategoryId, query.getCategoryId());
        }

        // 日期范围筛选
        if (StringUtils.hasText(query.getStartDate())) {
            LocalDate startDate = LocalDate.parse(query.getStartDate());
            wrapper.ge(Record::getRecordDate, startDate.atStartOfDay());
        }
        if (StringUtils.hasText(query.getEndDate())) {
            LocalDate endDate = LocalDate.parse(query.getEndDate());
            wrapper.le(Record::getRecordDate, endDate.atTime(LocalTime.MAX));
        }

        // 排序
        if ("asc".equalsIgnoreCase(query.getSortOrder())) {
            wrapper.orderByAsc(Record::getRecordDate);
        } else {
            wrapper.orderByDesc(Record::getRecordDate);
        }

        // 分页
        int page = query.getPage() != null ? query.getPage() : 1;
        int pageSize = query.getPageSize() != null ? query.getPageSize() : 20;
        Page<Record> pageResult = recordMapper.selectPage(new Page<>(page, pageSize), wrapper);

        // 查询分类信息
        List<Record> records = pageResult.getRecords();
        Set<Long> categoryIds = records.stream()
                .map(Record::getCategoryId)
                .collect(Collectors.toSet());
        final Map<Long, Category> categoryMap;
        if (!categoryIds.isEmpty()) {
            List<Category> categories = categoryMapper.selectBatchIds(categoryIds);
            categoryMap = categories.stream()
                    .collect(Collectors.toMap(Category::getId, c -> c));
        } else {
            categoryMap = new HashMap<>();
        }

        // 转换结果
        final Map<Long, Category> finalCategoryMap = categoryMap;
        List<Map<String, Object>> resultRecords = records.stream().map(record -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", record.getId());
            map.put("amount", record.getAmount());
            map.put("recordDate", record.getRecordDate());
            map.put("note", record.getNote());
            map.put("categoryId", record.getCategoryId());
            Category cat = finalCategoryMap.get(record.getCategoryId());
            if (cat != null) {
                map.put("category", cat);
            }
            return map;
        }).collect(Collectors.toList());

        PageResponse<Map<String, Object>> pageResponse = new PageResponse<>();
        pageResponse.setRecords(resultRecords);
        PageResponse.Pagination pagination = new PageResponse.Pagination();
        pagination.setPage(page);
        pagination.setPageSize(pageSize);
        pagination.setTotal(pageResult.getTotal());
        pagination.setTotalPages((int) pageResult.getPages());
        pageResponse.setPagination(pagination);

        log.info("查询成功：userId={}, 共{}条记录", userId, pageResult.getTotal());
        return pageResponse;
    }

    /**
     * 获取单条消费记录
     *
     * @param userId 用户ID
     * @param recordId 记录ID
     * @return 消费记录
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getRecord(Long userId, String recordId) {
        log.info("获取消费记录：userId={}, recordId={}", userId, recordId);

        Record record = recordMapper.selectById(recordId);
        if (record == null) {
            log.warn("记录不存在：recordId={}", recordId);
            throw new BusinessException("记录不存在");
        }
        if (!record.getUserId().equals(userId)) {
            log.warn("无权访问：userId={}, recordId={}", userId, recordId);
            throw new BusinessException("无权访问此记录");
        }

        Category category = categoryMapper.selectById(record.getCategoryId());
        Map<String, Object> result = new HashMap<>();
        result.put("id", record.getId());
        result.put("amount", record.getAmount());
        result.put("recordDate", record.getRecordDate());
        result.put("note", record.getNote());
        result.put("categoryId", record.getCategoryId());
        result.put("category", category);

        log.info("获取成功：recordId={}", recordId);
        return result;
    }

    /**
     * 创建消费记录
     *
     * @param userId 用户ID
     * @param request 创建请求
     * @return 消费记录
     */
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> createRecord(Long userId, CreateRecordRequest request) {
        log.info("创建消费记录：userId={}, amount={}, categoryId={}", userId, request.getAmount(), request.getCategoryId());

        // 验证分类存在
        Category category = categoryMapper.selectById(request.getCategoryId());
        if (category == null) {
            log.warn("创建失败：分类不存在，categoryId={}", request.getCategoryId());
            throw new BusinessException("分类不存在");
        }

        Record record = new Record();
        record.setId(UUID.randomUUID().toString());
        record.setUserId(userId);
        record.setCategoryId(request.getCategoryId());
        record.setAmount(request.getAmount());
        record.setRecordDate(LocalDateTime.parse(request.getRecordDate() + "T00:00:00"));
        record.setNote(request.getNote());
        record.setStatus(1);
        record.setCreatedAt(LocalDateTime.now());
        record.setUpdatedAt(LocalDateTime.now());
        recordMapper.insert(record);

        log.info("消费记录创建成功：id={}", record.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("id", record.getId());
        result.put("amount", record.getAmount());
        result.put("recordDate", record.getRecordDate());
        result.put("note", record.getNote());
        result.put("category", category);
        return result;
    }

    /**
     * 更新消费记录
     *
     * @param userId 用户ID
     * @param recordId 记录ID
     * @param request 更新请求
     * @return 更新后的记录
     */
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> updateRecord(Long userId, String recordId, UpdateRecordRequest request) {
        log.info("更新消费记录：userId={}, recordId={}", userId, recordId);

        Record record = recordMapper.selectById(recordId);
        if (record == null) {
            log.warn("更新失败：记录不存在，recordId={}", recordId);
            throw new BusinessException("记录不存在");
        }
        if (!record.getUserId().equals(userId)) {
            log.warn("更新失败：无权访问，userId={}, recordId={}", userId, recordId);
            throw new BusinessException("无权修改此记录");
        }

        if (request.getAmount() != null) record.setAmount(request.getAmount());
        if (request.getCategoryId() != null) record.setCategoryId(request.getCategoryId());
        if (StringUtils.hasText(request.getRecordDate())) {
            record.setRecordDate(LocalDateTime.parse(request.getRecordDate() + "T00:00:00"));
        }
        if (request.getNote() != null) record.setNote(request.getNote());
        record.setUpdatedAt(LocalDateTime.now());
        recordMapper.updateById(record);

        Category category = categoryMapper.selectById(record.getCategoryId());
        log.info("消费记录更新成功：id={}", recordId);

        Map<String, Object> result = new HashMap<>();
        result.put("id", record.getId());
        result.put("amount", record.getAmount());
        result.put("recordDate", record.getRecordDate());
        result.put("note", record.getNote());
        result.put("category", category);
        return result;
    }

    /**
     * 删除消费记录（逻辑删除）
     *
     * @param userId 用户ID
     * @param recordId 记录ID
     */
    @Transactional(rollbackFor = Exception.class)
    public void deleteRecord(Long userId, String recordId) {
        log.info("删除消费记录：userId={}, recordId={}", userId, recordId);

        Record record = recordMapper.selectById(recordId);
        if (record == null) {
            log.warn("删除失败：记录不存在，recordId={}", recordId);
            throw new BusinessException("记录不存在");
        }
        if (!record.getUserId().equals(userId)) {
            log.warn("删除失败：无权删除，userId={}, recordId={}", userId, recordId);
            throw new BusinessException("无权删除此记录");
        }

        // 逻辑删除
        record.setStatus(0);
        record.setUpdatedAt(LocalDateTime.now());
        recordMapper.updateById(record);

        log.info("消费记录删除成功：id={}", recordId);
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
                .collect(Collectors.groupingBy(
                        r -> r.getRecordDate().toLocalDate(),
                        Collectors.reducing(BigDecimal.ZERO, Record::getAmount, BigDecimal::add)
                ));

        // 构建每日数据
        List<Map<String, Object>> dailyData = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            LocalDate date = startDate.plusDays(i);
            BigDecimal amount = dailyAmounts.getOrDefault(date, BigDecimal.ZERO);
            Map<String, Object> day = new HashMap<>();
            day.put("date", date.toString());
            day.put("label", getDayLabel(date));
            day.put("amount", amount);
            dailyData.add(day);
        }

        // 按分类汇总
        Map<Long, BigDecimal> categoryAmounts = records.stream()
                .collect(Collectors.groupingBy(
                        Record::getCategoryId,
                        Collectors.reducing(BigDecimal.ZERO, Record::getAmount, BigDecimal::add)
                ));

        // 获取分类信息并计算占比
        List<Category> categories = categoryMapper.selectList(null);
        Map<Long, Category> categoryMap = categories.stream()
                .collect(Collectors.toMap(Category::getId, c -> c));

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
                        ? entry.getValue().divide(totalAmount, 4, java.math.RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100))
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
        BigDecimal avgDaily = days > 0 ? totalAmount.divide(BigDecimal.valueOf(days), 2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO;

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
     * 获取日期标签
     */
    private String getDayLabel(LocalDate date) {
        LocalDate today = LocalDate.now();
        if (date.equals(today)) return "今天";
        if (date.equals(today.minusDays(1))) return "昨天";
        String[] dayNames = {"周日", "周一", "周二", "周三", "周四", "周五", "周六"};
        return dayNames[date.getDayOfWeek().getValue() % 7];
    }
}
