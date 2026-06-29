-- ================================================
-- 轻账本 (LightLedger) 数据库设计 V1.0
-- 基于 MySQL 8.0+
-- 创建时间: 2026-06-29
-- ================================================

-- ----------------------------------------
-- 1. 创建数据库
-- ----------------------------------------
CREATE DATABASE IF NOT EXISTS `lightledger`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `lightledger`;

-- ----------------------------------------
-- 2. 用户表 (users)
-- ----------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名，4-20字符',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '电子邮箱',
  `avatar` TEXT DEFAULT NULL COMMENT '头像URL（Base64或云存储路径）',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1=正常，0=禁用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ----------------------------------------
-- 3. 消费分类表 (expense_categories)
-- ----------------------------------------
DROP TABLE IF EXISTS `expense_categories`;
CREATE TABLE `expense_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` VARCHAR(20) NOT NULL COMMENT '分类名称',
  `name_en` VARCHAR(30) DEFAULT NULL COMMENT '英文名称',
  `emoji` VARCHAR(10) NOT NULL COMMENT '表情图标',
  `icon_name` VARCHAR(50) DEFAULT NULL COMMENT 'Material图标名称',
  `color` VARCHAR(20) DEFAULT NULL COMMENT '主题色值',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
  `is_system` TINYINT NOT NULL DEFAULT 1 COMMENT '是否系统预设：1=是，0=自定义',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1=启用，0=禁用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_is_system` (`is_system`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消费分类表';

-- 插入预设消费分类
INSERT INTO `expense_categories` (`name`, `name_en`, `emoji`, `icon_name`, `color`, `sort_order`, `is_system`) VALUES
('餐饮', 'Dining', '🍜', 'restaurant', '#EF4444', 1, 1),
('交通', 'Transport', '🚗', 'directions_car', '#F59E0B', 2, 1),
('购物', 'Shopping', '🛒', 'shopping_bag', '#8B5CF6', 3, 1),
('娱乐', 'Entertainment', '🎮', 'sports_esports', '#EC4899', 4, 1),
('居住', 'Housing', '🏠', 'home', '#10B981', 5, 1),
('医疗', 'Medical', '💊', 'medical_services', '#EF4444', 6, 1),
('教育', 'Education', '📚', 'school', '#3B82F6', 7, 1),
('通讯', 'Communication', '📱', 'phone', '#6366F1', 8, 1),
('社交', 'Social', '🎁', 'card_giftcard', '#F97316', 9, 1),
('其他', 'Others', '📌', 'more_horiz', '#6B7280', 10, 1);

-- ----------------------------------------
-- 4. 消费记录表 (expense_records)
-- ----------------------------------------
DROP TABLE IF EXISTS `expense_records`;
CREATE TABLE `expense_records` (
  `id` CHAR(36) NOT NULL COMMENT '记录ID（UUID）',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `category_id` BIGINT UNSIGNED NOT NULL COMMENT '分类ID',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '消费金额',
  `record_date` DATE NOT NULL COMMENT '消费日期',
  `note` VARCHAR(200) DEFAULT NULL COMMENT '备注说明',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1=正常，0=已删除',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_record_date` (`record_date`),
  KEY `idx_user_date` (`user_id`, `record_date`),
  KEY `idx_user_category` (`user_id`, `category_id`),
  CONSTRAINT `fk_records_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_records_category` FOREIGN KEY (`category_id`) REFERENCES `expense_categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消费记录表';

-- ----------------------------------------
-- 5. 用户会话表 (user_sessions) - 可选
-- ----------------------------------------
DROP TABLE IF EXISTS `user_sessions`;
CREATE TABLE `user_sessions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '会话ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `session_token` VARCHAR(255) NOT NULL COMMENT '会话Token',
  `ip_address` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` VARCHAR(500) DEFAULT NULL COMMENT '浏览器User-Agent',
  `expires_at` DATETIME NOT NULL COMMENT '过期时间',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1=有效，0=已失效',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_session_token` (`session_token`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户会话表';

-- ----------------------------------------
-- 6. 用户偏好设置表 (user_preferences)
-- ----------------------------------------
DROP TABLE IF EXISTS `user_preferences`;
CREATE TABLE `user_preferences` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '设置ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `default_page` VARCHAR(50) DEFAULT 'dashboard' COMMENT '默认页面：dashboard=首页，records=明细',
  `page_size` INT DEFAULT 20 COMMENT '每页显示条数',
  `reminder_enabled` TINYINT DEFAULT 0 COMMENT '每日提醒：0=关闭，1=开启',
  `reminder_time` TIME DEFAULT NULL COMMENT '提醒时间',
  `currency` VARCHAR(10) DEFAULT 'CNY' COMMENT '货币类型',
  `language` VARCHAR(10) DEFAULT 'zh-CN' COMMENT '语言',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  CONSTRAINT `fk_preferences_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户偏好设置表';

-- ----------------------------------------
-- 7. 索引优化（可选）
-- ----------------------------------------
-- 对于大数据量，可添加以下复合索引提升查询性能
-- ALTER TABLE `expense_records` ADD INDEX `idx_user_category_date` (`user_id`, `category_id`, `record_date`);

-- ----------------------------------------
-- 8. 视图示例（便于统计查询）
-- ----------------------------------------
-- 月度消费汇总视图
CREATE OR REPLACE VIEW `v_monthly_summary` AS
SELECT
  r.user_id,
  DATE_FORMAT(r.record_date, '%Y-%m') AS month,
  COUNT(*) AS record_count,
  SUM(r.amount) AS total_amount,
  AVG(r.amount) AS avg_amount,
  MAX(r.amount) AS max_amount,
  MIN(r.amount) AS min_amount
FROM expense_records r
WHERE r.status = 1
GROUP BY r.user_id, DATE_FORMAT(r.record_date, '%Y-%m');

-- 分类消费汇总视图
CREATE OR REPLACE VIEW `v_category_summary` AS
SELECT
  r.user_id,
  r.category_id,
  c.name AS category_name,
  c.emoji,
  COUNT(*) AS record_count,
  SUM(r.amount) AS total_amount,
  AVG(r.amount) AS avg_amount
FROM expense_records r
JOIN expense_categories c ON r.category_id = c.id
WHERE r.status = 1
GROUP BY r.user_id, r.category_id, c.name, c.emoji;

-- ----------------------------------------
-- 9. 测试数据（可选）
-- ----------------------------------------
-- 插入测试用户
INSERT INTO `users` (`username`, `password`, `email`) VALUES
('testuser', '$2b$10$abcdefghijklmnopqrstuv', 'test@example.com');

-- 插入测试消费记录
INSERT INTO `expense_records` (`id`, `user_id`, `category_id`, `amount`, `record_date`, `note`) VALUES
(UUID(), 1, 1, 35.00, CURDATE(), '午餐'),
(UUID(), 1, 2, 12.00, CURDATE(), '地铁上班'),
(UUID(), 1, 3, 128.00, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '办公用品');

-- 插入用户偏好
INSERT INTO `user_preferences` (`user_id`, `default_page`, `page_size`) VALUES
(1, 'dashboard', 20);

-- ================================================
-- 执行完成
-- ================================================
