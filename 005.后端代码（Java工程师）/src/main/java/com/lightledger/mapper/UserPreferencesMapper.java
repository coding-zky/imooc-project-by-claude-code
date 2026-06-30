package com.lightledger.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lightledger.model.entity.UserPreferences;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserPreferencesMapper extends BaseMapper<UserPreferences> {
}
