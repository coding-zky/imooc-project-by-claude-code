package com.lightledger.admin.model.dto;

public class DashboardStats {
    private Long totalUsers;
    private Long todayNewUsers;
    private Double totalExpenses;
    private Double todayExpenses;

    public DashboardStats() {}

    public DashboardStats(Long totalUsers, Long todayNewUsers, Double totalExpenses, Double todayExpenses) {
        this.totalUsers = totalUsers;
        this.todayNewUsers = todayNewUsers;
        this.totalExpenses = totalExpenses;
        this.todayExpenses = todayExpenses;
    }

    public Long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }
    public Long getTodayNewUsers() { return todayNewUsers; }
    public void setTodayNewUsers(Long todayNewUsers) { this.todayNewUsers = todayNewUsers; }
    public Double getTotalExpenses() { return totalExpenses; }
    public void setTotalExpenses(Double totalExpenses) { this.totalExpenses = totalExpenses; }
    public Double getTodayExpenses() { return todayExpenses; }
    public void setTodayExpenses(Double todayExpenses) { this.todayExpenses = todayExpenses; }
}