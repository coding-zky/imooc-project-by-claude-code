package com.lightledger.model.dto;

public class QueryRecordsRequest {
    private String month;
    private Long categoryId;
    private String startDate;
    private String endDate;
    private Integer page = 1;
    private Integer pageSize = 20;
    private String sortBy = "recordDate";
    private String sortOrder = "desc";

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    public Integer getPage() { return page; }
    public void setPage(Integer page) { this.page = page; }
    public Integer getPageSize() { return pageSize; }
    public void setPageSize(Integer pageSize) { this.pageSize = pageSize; }
    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }
    public String getSortOrder() { return sortOrder; }
    public void setSortOrder(String sortOrder) { this.sortOrder = sortOrder; }
}
