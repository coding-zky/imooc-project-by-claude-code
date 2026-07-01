package com.lightledger.admin.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import java.time.LocalDateTime;

@TableName("user_preferences")
public class UserPreferences {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private Long userId;
    private String defaultPage;
    private Integer pageSize;
    private Integer reminderEnabled;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getDefaultPage() { return defaultPage; }
    public void setDefaultPage(String defaultPage) { this.defaultPage = defaultPage; }
    public Integer getPageSize() { return pageSize; }
    public void setPageSize(Integer pageSize) { this.pageSize = pageSize; }
    public Integer getReminderEnabled() { return reminderEnabled; }
    public void setReminderEnabled(Integer reminderEnabled) { this.reminderEnabled = reminderEnabled; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}