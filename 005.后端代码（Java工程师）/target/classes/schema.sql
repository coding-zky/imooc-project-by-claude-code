-- LightLedger 数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS lightledger DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE lightledger;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(20) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    avatar VARCHAR(255) COMMENT '头像URL',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 消费分类表
CREATE TABLE IF NOT EXISTS expense_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    emoji VARCHAR(10) NOT NULL COMMENT '分类图标',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消费分类表';

-- 消费记录表
CREATE TABLE IF NOT EXISTS expense_records (
    id VARCHAR(36) PRIMARY KEY COMMENT '记录ID(UUID)',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    category_id BIGINT NOT NULL COMMENT '分类ID',
    amount DECIMAL(12, 2) NOT NULL COMMENT '金额',
    record_date DATETIME NOT NULL COMMENT '消费日期',
    note VARCHAR(200) COMMENT '备注',
    status TINYINT DEFAULT 1 COMMENT '状态：1正常，0已删除',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_category_id (category_id),
    INDEX idx_record_date (record_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消费记录表';

-- 初始化消费分类数据
INSERT INTO expense_categories (name, emoji, sort_order) VALUES
('餐饮', '🍜', 1),
('交通', '🚗', 2),
('购物', '🛒', 3),
('娱乐', '🎮', 4),
('居住', '🏠', 5),
('医疗', '💊', 6),
('教育', '📚', 7),
('通讯', '📱', 8),
('社交', '🎁', 9),
('其他', '📌', 10);
