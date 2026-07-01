package com.lightledger.admin.model.dto;

public class AdminAuthResponse {
    private String token;
    private Long userId;
    private String username;
    private String realName;

    public AdminAuthResponse() {}

    public AdminAuthResponse(String token, Long userId, String username, String realName) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.realName = realName;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getRealName() { return realName; }
    public void setRealName(String realName) { this.realName = realName; }
}