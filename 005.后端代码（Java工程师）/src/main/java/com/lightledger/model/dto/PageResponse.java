package com.lightledger.model.dto;

import java.util.List;

public class PageResponse<T> {
    private List<T> records;
    private Pagination pagination;

    public List<T> getRecords() { return records; }
    public void setRecords(List<T> records) { this.records = records; }
    public Pagination getPagination() { return pagination; }
    public void setPagination(Pagination pagination) { this.pagination = pagination; }

    public static class Pagination {
        private Integer page;
        private Integer pageSize;
        private Long total;
        private Integer totalPages;

        public Integer getPage() { return page; }
        public void setPage(Integer page) { this.page = page; }
        public Integer getPageSize() { return pageSize; }
        public void setPageSize(Integer pageSize) { this.pageSize = pageSize; }
        public Long getTotal() { return total; }
        public void setTotal(Long total) { this.total = total; }
        public Integer getTotalPages() { return totalPages; }
        public void setTotalPages(Integer totalPages) { this.totalPages = totalPages; }
    }
}
