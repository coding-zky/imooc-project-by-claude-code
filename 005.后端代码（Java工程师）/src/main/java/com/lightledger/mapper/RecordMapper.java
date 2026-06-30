package com.lightledger.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lightledger.model.entity.Record;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Mapper
public interface RecordMapper extends BaseMapper<Record> {

    @Select("SELECT COUNT(*) FROM expense_records WHERE user_id = #{userId} AND status = 1")
    Long countByUserId(@Param("userId") Long userId);

    @Select("SELECT SUM(amount) FROM expense_records WHERE user_id = #{userId} AND status = 1")
    java.math.BigDecimal sumAmountByUserId(@Param("userId") Long userId);
}
