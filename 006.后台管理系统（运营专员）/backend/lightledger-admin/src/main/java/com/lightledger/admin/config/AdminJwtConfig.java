package com.lightledger.admin.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "jwt")
public class AdminJwtConfig {
    private String adminSecret;
    private Long adminExpiration;

    public String getAdminSecret() { return adminSecret; }
    public void setAdminSecret(String adminSecret) { this.adminSecret = adminSecret; }
    public Long getAdminExpiration() { return adminExpiration; }
    public void setAdminExpiration(Long adminExpiration) { this.adminExpiration = adminExpiration; }
}