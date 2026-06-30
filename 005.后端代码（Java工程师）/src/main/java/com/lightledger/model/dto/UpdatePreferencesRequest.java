package com.lightledger.model.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

public class UpdatePreferencesRequest {

    private String defaultPage;

    @Min(value = 5, message = "每页条数最小为5")
    @Max(value = 100, message = "每页条数最大为100")
    private Integer pageSize;

    private Boolean reminderEnabled;

    private String reminderTime;

    private String currency;

    private String language;

    public String getDefaultPage() { return defaultPage; }
    public void setDefaultPage(String defaultPage) { this.defaultPage = defaultPage; }
    public Integer getPageSize() { return pageSize; }
    public void setPageSize(Integer pageSize) { this.pageSize = pageSize; }
    public Boolean getReminderEnabled() { return reminderEnabled; }
    public void setReminderEnabled(Boolean reminderEnabled) { this.reminderEnabled = reminderEnabled; }
    public String getReminderTime() { return reminderTime; }
    public void setReminderTime(String reminderTime) { this.reminderTime = reminderTime; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
