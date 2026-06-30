package com.lightledger.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lightledger.model.entity.Category;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CategoryMapper extends BaseMapper<Category> {
}
