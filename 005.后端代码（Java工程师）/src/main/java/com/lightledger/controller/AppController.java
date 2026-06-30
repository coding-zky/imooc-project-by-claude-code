package com.lightledger.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

/**
 * 应用控制器 - 健康检查
 */
@RestController
public class AppController {

    /**
     * 健康检查接口
     */
    @GetMapping("/")
    public Map<String, Object> healthCheck() {
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "LightLedger API is running");
        result.put("timestamp", System.currentTimeMillis());
        return result;
    }
}
