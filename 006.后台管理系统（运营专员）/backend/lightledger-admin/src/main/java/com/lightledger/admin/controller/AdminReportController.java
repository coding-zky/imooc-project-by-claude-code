package com.lightledger.admin.controller;

import com.lightledger.admin.model.dto.ApiResponse;
import com.lightledger.admin.service.AdminReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
public class AdminReportController {

    private final AdminReportService reportService;

    public AdminReportController(AdminReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/trend")
    public ApiResponse<List<Map<String, Object>>> getExpenseTrend(@RequestParam(defaultValue = "7") int days) {
        List<Map<String, Object>> trend = reportService.getExpenseTrend(days);
        return ApiResponse.success(trend);
    }

    @GetMapping("/user-ranking")
    public ApiResponse<List<Map<String, Object>>> getUserRanking(@RequestParam(defaultValue = "20") int limit) {
        List<Map<String, Object>> ranking = reportService.getUserRanking(limit);
        return ApiResponse.success(ranking);
    }

    @GetMapping("/category-ranking")
    public ApiResponse<List<Map<String, Object>>> getCategoryRanking() {
        List<Map<String, Object>> ranking = reportService.getCategoryRanking();
        return ApiResponse.success(ranking);
    }

    @GetMapping("/user-trend")
    public ApiResponse<List<Map<String, Object>>> getUserTrend(@RequestParam(defaultValue = "30") int days) {
        List<Map<String, Object>> trend = reportService.getUserTrend(days);
        return ApiResponse.success(trend);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportExcel(@RequestParam(defaultValue = "7") int days) {
        byte[] data = reportService.exportExcel(days);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "lightledger_admin_report.xlsx");
        return ResponseEntity.ok().headers(headers).body(data);
    }
}