package com.lightledger.model.dto;

import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public class UpdateRecordRequest {
    @Positive(message = "金额必须为正数")
    private BigDecimal amount;
    private Long categoryId;
    private String recordDate;
    private String note;

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getRecordDate() { return recordDate; }
    public void setRecordDate(String recordDate) { this.recordDate = recordDate; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
