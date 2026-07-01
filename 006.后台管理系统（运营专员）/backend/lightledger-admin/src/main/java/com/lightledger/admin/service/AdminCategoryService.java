package com.lightledger.admin.service;

import com.lightledger.admin.exception.BusinessException;
import com.lightledger.admin.mapper.ExpenseCategoryMapper;
import com.lightledger.admin.model.entity.ExpenseCategory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminCategoryService {

    private final ExpenseCategoryMapper categoryMapper;

    public AdminCategoryService(ExpenseCategoryMapper categoryMapper) {
        this.categoryMapper = categoryMapper;
    }

    public List<ExpenseCategory> getCategoryList() {
        return categoryMapper.selectList(null);
    }

    @Transactional
    public void updateCategoryStatus(Long categoryId, Integer status) {
        ExpenseCategory category = categoryMapper.selectById(categoryId);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        category.setStatus(status);
        categoryMapper.updateById(category);
    }
}