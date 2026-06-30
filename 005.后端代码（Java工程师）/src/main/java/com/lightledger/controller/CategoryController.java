package com.lightledger.controller;

import com.lightledger.model.dto.ApiResponse;
import com.lightledger.model.entity.Category;
import com.lightledger.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * 消费分类控制器
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    @Autowired
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    /**
     * 获取所有分类
     */
    @GetMapping
    public ApiResponse<List<Category>> getCategories() {
        return ApiResponse.success(categoryService.getAllCategories());
    }
}
