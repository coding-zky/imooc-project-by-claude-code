package com.lightledger.admin.controller;

import com.lightledger.admin.model.dto.ApiResponse;
import com.lightledger.admin.model.entity.ExpenseCategory;
import com.lightledger.admin.service.AdminCategoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {

    private final AdminCategoryService categoryService;

    public AdminCategoryController(AdminCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ApiResponse<List<ExpenseCategory>> getCategoryList() {
        List<ExpenseCategory> categories = categoryService.getCategoryList();
        return ApiResponse.success(categories);
    }

    @PutMapping("/{id}/status")
    public ApiResponse<Void> updateCategoryStatus(@PathVariable Long id, @RequestParam Integer status) {
        categoryService.updateCategoryStatus(id, status);
        return ApiResponse.success("状态更新成功", null);
    }
}