package com.lightledger.service;

import com.lightledger.mapper.CategoryMapper;
import com.lightledger.model.entity.Category;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * 分类服务类
 */
@Service
public class CategoryService {

    private static final Logger log = LoggerFactory.getLogger(CategoryService.class);

    private final CategoryMapper categoryMapper;

    @Autowired
    public CategoryService(CategoryMapper categoryMapper) {
        this.categoryMapper = categoryMapper;
    }

    /**
     * 获取所有分类
     *
     * @return 分类列表
     */
    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryMapper.selectList(null);
    }

    /**
     * 根据ID获取分类
     *
     * @param categoryId 分类ID
     * @return 分类信息
     */
    @Transactional(readOnly = true)
    public Category getCategoryById(Long categoryId) {
        Category category = categoryMapper.selectById(categoryId);
        if (category == null) {
            throw new RuntimeException("分类不存在");
        }
        return category;
    }
}
