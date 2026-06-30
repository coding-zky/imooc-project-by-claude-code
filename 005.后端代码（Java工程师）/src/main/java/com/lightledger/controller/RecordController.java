package com.lightledger.controller;

import com.lightledger.model.dto.ApiResponse;
import com.lightledger.model.dto.CreateRecordRequest;
import com.lightledger.model.dto.PageResponse;
import com.lightledger.model.dto.QueryRecordsRequest;
import com.lightledger.model.dto.UpdateRecordRequest;
import com.lightledger.service.RecordService;
import com.lightledger.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * 消费记录控制器
 */
@RestController
@RequestMapping("/api/records")
public class RecordController {

    private final RecordService recordService;
    private final JwtUtil jwtUtil;

    @Autowired
    public RecordController(RecordService recordService, JwtUtil jwtUtil) {
        this.recordService = recordService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * 查询消费记录列表
     */
    @GetMapping
    public ApiResponse<PageResponse<Map<String, Object>>> getRecords(QueryRecordsRequest query) {
        Long userId = jwtUtil.getCurrentUserId();
        return ApiResponse.success(recordService.queryRecords(userId, query));
    }

    /**
     * 获取单条消费记录
     */
    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> getRecord(@PathVariable String id) {
        Long userId = jwtUtil.getCurrentUserId();
        return ApiResponse.success(recordService.getRecord(userId, id));
    }

    /**
     * 创建消费记录
     */
    @PostMapping
    public ApiResponse<Map<String, Object>> createRecord(@Valid @RequestBody CreateRecordRequest request) {
        Long userId = jwtUtil.getCurrentUserId();
        return ApiResponse.success(recordService.createRecord(userId, request));
    }

    /**
     * 更新消费记录
     */
    @PutMapping("/{id}")
    public ApiResponse<Map<String, Object>> updateRecord(
            @PathVariable String id,
            @Valid @RequestBody UpdateRecordRequest request) {
        Long userId = jwtUtil.getCurrentUserId();
        return ApiResponse.success(recordService.updateRecord(userId, id, request));
    }

    /**
     * 删除消费记录
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteRecord(@PathVariable String id) {
        Long userId = jwtUtil.getCurrentUserId();
        recordService.deleteRecord(userId, id);
        return ApiResponse.success();
    }
}
