package com.lightledger.admin.controller;

import com.lightledger.admin.model.dto.ApiResponse;
import com.lightledger.admin.model.dto.PageResult;
import com.lightledger.admin.service.AdminRecordService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/records")
public class AdminRecordController {

    private final AdminRecordService recordService;

    public AdminRecordController(AdminRecordService recordService) {
        this.recordService = recordService;
    }

    @GetMapping
    public ApiResponse<PageResult<Map<String, Object>>> getRecordList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String month,
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "20") Long pageSize) {
        PageResult<Map<String, Object>> result = recordService.getRecordList(keyword, categoryId, month, page, pageSize);
        return ApiResponse.success(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> getRecordDetail(@PathVariable String id) {
        Map<String, Object> detail = recordService.getRecordDetail(id);
        return ApiResponse.success(detail);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteRecord(@PathVariable String id) {
        recordService.deleteRecord(id);
        return ApiResponse.success("删除成功", null);
    }
}