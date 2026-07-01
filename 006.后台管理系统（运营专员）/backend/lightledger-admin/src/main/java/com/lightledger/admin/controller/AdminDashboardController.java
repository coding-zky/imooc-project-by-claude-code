package com.lightledger.admin.controller;

import com.lightledger.admin.model.dto.ApiResponse;
import com.lightledger.admin.model.dto.DashboardStats;
import com.lightledger.admin.service.AdminDashboardService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    public AdminDashboardController(AdminDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ApiResponse<DashboardStats> getDashboardStats() {
        DashboardStats stats = dashboardService.getDashboardStats();
        return ApiResponse.success(stats);
    }

    @GetMapping("/trend")
    public ApiResponse<List<Map<String, Object>>> getRecentTrend(@RequestParam(defaultValue = "7") int days) {
        List<Map<String, Object>> trend = dashboardService.getRecentExpenseTrend(days);
        return ApiResponse.success(trend);
    }

    @GetMapping("/category-distribution")
    public ApiResponse<List<Map<String, Object>>> getCategoryDistribution() {
        List<Map<String, Object>> distribution = dashboardService.getCategoryDistribution();
        return ApiResponse.success(distribution);
    }
}