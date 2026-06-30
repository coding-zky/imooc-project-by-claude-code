package com.lightledger.controller;

import com.lightledger.model.dto.ApiResponse;
import com.lightledger.service.StatsService;
import com.lightledger.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * 统计控制器
 */
@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;
    private final JwtUtil jwtUtil;

    @Autowired
    public StatsController(StatsService statsService, JwtUtil jwtUtil) {
        this.statsService = statsService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * 获取消费统计
     * @param days 统计天数，默认7天
     */
    @GetMapping
    public ApiResponse<Map<String, Object>> getStats(@RequestParam(defaultValue = "7") Integer days) {
        Long userId = jwtUtil.getCurrentUserId();
        return ApiResponse.success(statsService.getStats(userId, days));
    }

    /**
     * 导出消费统计Excel报表
     * @param days 统计天数，默认7天
     */
    @GetMapping("/export")
    @ResponseBody
    public org.springframework.http.ResponseEntity<byte[]> exportExcel(@RequestParam(defaultValue = "7") Integer days) throws Exception {
        Long userId = jwtUtil.getCurrentUserId();
        byte[] excelData = statsService.exportExcel(userId, days);

        String filename = URLEncoder.encode(
                "轻账本统计报表_" + days + "天_" + java.time.LocalDate.now() + ".xlsx",
                StandardCharsets.UTF_8
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", filename);

        return new org.springframework.http.ResponseEntity<>(excelData, headers, org.springframework.http.HttpStatus.OK);
    }
}
