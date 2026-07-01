package com.lightledger.admin.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lightledger.admin.model.entity.UserPreferences;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserPreferencesMapper extends BaseMapper<UserPreferences> {
}