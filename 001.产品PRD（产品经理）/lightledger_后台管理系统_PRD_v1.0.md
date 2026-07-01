# 轻账本 LightLedger 后台管理系统 PRD

> **版本：** v1.0
> **创建日期：** 2026-06-30
> **产品经理：** 轻账本团队
> **适用范围：** 轻账本后台管理系统（Admin Dashboard）

---

## 目录

1. [项目背景与目标](#1-项目背景与目标)
2. [系统概述](#2-系统概述)
3. [功能模块设计](#3-功能模块设计)
4. [数据设计](#4-数据设计)
5. [页面设计](#5-页面设计)
6. [技术方案建议](#6-技术方案建议)

---

## 1. 项目背景与目标

### 1.1 背景

轻账本（LightLedger）是一款面向个人用户的记账应用，现有功能包括：用户注册/登录、消费记录增删改查、消费统计报表、分类管理、用户偏好设置等。随着用户增长，需要一套后台管理系统来支撑运营效率和数据分析需求。

### 1.2 目标

构建一个独立的后台管理系统，使超级管理员能够：

- 查看和管理所有注册用户
- 查看和管理所有消费记录
- 查看全局消费数据统计（全平台维度）
- 管理消费分类（启用/禁用等）

### 1.3 约束条件

1. **禁止修改现有数据库表结构** — 所有功能基于现有表实现
2. **超级管理员独立存储** — 新建 `admin_users` 表，专用于后台登录认证
3. **后台与前台独立** — 后台拥有独立登录页面、独立Token机制，不与前台用户系统混用

---

## 2. 系统概述

### 2.1 架构概览

```
┌──────────────────────────────────────────────┐
│              浏览器（前端）                      │
│  ┌─────────────────┐  ┌─────────────────────┐ │
│  │  前台应用 (3001)  │  │  后台管理 (3002)      │ │
│  │  React SPA       │  │  React SPA (独立)     │ │
│  └────────┬─────────┘  └──────────┬──────────┘ │
└───────────┼───────────────────────┼────────────┘
            │          /api/*       │  /api/admin/*
            ▼                       ▼
┌─────────────────────────────────────────────────┐
│              Java 后端 (后台后端独立Java项目）                   │
│  ┌─────────────────┐  ┌──────────────────────┐  │
│  │  前台 API 控制器  │  │  后台 Admin API 控制器 （独立项目） │  │
│  │  /api/auth/*     │  │  /api/admin/auth/*     │  │
│  │  /api/records/*  │  │  /api/admin/users/*    │  │
│  │  /api/stats/*    │  │  /api/admin/records/*  │  │
│  │  /api/users/*    │  │  /api/admin/stats/*    │  │
│  └────────┬─────────┘  └──────────┬───────────┘  │
│           │                       │              │
│           ▼                       ▼              │
│  ┌──────────────────────────────────────────┐   │
│  │              MySQL 数据库                    │   │
│  │  users / expense_records / ...            │   │
│  │  + admin_users (新增)                     │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### 2.2 用户角色

| 角色       | 说明                           | 登录入口           |
| ---------- | ------------------------------ | ------------------ |
| 普通用户   | 使用轻账本记账的注册用户       | 前台`/login`       |
| 超级管理员 | 运营管理者，一个账号管理全平台 | 后台`/admin/login` |

> **设计说明：** 超级管理员是一个独立体系，不与普通用户表混用。这样即使前台用户表有何变化，不影响管理员登录。

---

## 3. 功能模块设计

### 3.1 功能全景图

```
后台管理系统
├── 1. 管理员认证
│   ├── 1.1 管理员登录
│   └── 1.2 管理员登出
├── 2. 仪表盘（首页概览）
│   ├── 2.1 用户总数 / 今日新增 / 活跃用户
│   ├── 2.2 全平台消费总额 / 今日消费总额
│   ├── 2.3 近7天消费趋势图
│   └── 2.4 消费分类占比饼图
├── 3. 用户管理
│   ├── 3.1 用户列表（搜索、分页）
│   ├── 3.2 查看用户详情（含消费统计）
│   └── 3.3 禁用/启用用户（status 字段）
├── 4. 消费记录管理
│   ├── 4.1 全平台记录列表（搜索、筛选、分页）
│   ├── 4.2 查看记录详情
│   └── 4.3 逻辑删除记录（status=0）
├── 5. 分类管理
│   ├── 5.1 分类列表
│   └── 5.2 启用/禁用分类
└── 6. 数据报表
    ├── 6.1 全平台消费趋势（按天/月）
    ├── 6.2 按用户消费排行
    ├── 6.3 按分类消费排行
    └── 6.4 导出Excel报表（复用现有导出逻辑）
```

### 3.2 功能详细说明

---

#### 3.2.1 管理员认证

| 功能      | 说明                                                             |
| --------- | ---------------------------------------------------------------- |
| 登录      | 独立登录页面，使用`admin_users` 表验证，返回 JWT Token           |
| 登出      | 清除 Token，跳回登录页                                           |
| Token机制 | 独立于前台用户Token，使用不同的 JWT secret（`jwt.admin-secret`） |

**登录页面元素：**

- 用户名输入框
- 密码输入框
- 登录按钮
- 错误提示

---

#### 3.2.2 仪表盘（Dashboard）

**数据卡片（4个）：**

| 指标           | 数据来源            | 计算方式                                          |
| -------------- | ------------------- | ------------------------------------------------- |
| 注册用户总数   | `users` 表          | `COUNT(*)`                                        |
| 今日新增用户   | `users` 表          | `WHERE created_at >= 今天0点`                     |
| 全平台消费总额 | 查`expense_records` | `SUM(amount) WHERE status=1`                      |
| 今日消费总额   | 查`expense_records` | `SUM(amount) WHERE record_date=今天 AND status=1` |

**图表（2个）：**

- **近7天消费趋势柱状图** — X轴: 日期, Y轴: 消费金额
- **消费分类占比饼图** — 全平台所有用户汇总

---

#### 3.2.3 用户管理

**用户列表页：**

| 功能     | 说明                                                       |
| -------- | ---------------------------------------------------------- |
| 列表字段 | 用户ID、用户名、邮箱、注册时间、状态、消费总金额、消费笔数 |
| 搜索     | 按用户名模糊搜索                                           |
| 排序     | 按注册时间 / 消费总额排序                                  |
| 分页     | 每页20条                                                   |
| 操作     | 查看详情、禁用/启用                                        |
| 状态切换 | 将`users.status` 设为 1(正常) 或 0(禁用)                   |

> **注意：** 禁用用户后，该用户在前台应无法登录（现有 AuthService 未检查 status 字段，**需在前端 Java 后端添加 status 校验**，但这不是数据库表结构改动）

**用户详情抽屉/弹窗：**

- 基本信息：用户名、邮箱、注册时间
- 消费统计：累计消费总额、消费笔数、日均消费
- 最近10条消费记录
- 偏好设置：默认页面、每页条数、提醒开关

---

#### 3.2.4 消费记录管理

**记录列表页：**

| 功能     | 说明                                         |
| -------- | -------------------------------------------- |
| 列表字段 | 记录ID、用户名、分类、金额、日期、备注、状态 |
| 搜索     | 按用户名搜索                                 |
| 筛选     | 按月份、按分类筛选                           |
| 分页     | 每页20条                                     |
| 操作     | 查看详情、删除（逻辑删除 status=0）          |
| 排序     | 按日期倒序                                   |

**记录详情弹窗：**

- 完整记录信息
- 所属用户信息

---

#### 3.2.5 分类管理

**分类列表页：**

| 功能     | 说明                                                |
| -------- | --------------------------------------------------- |
| 列表字段 | 分类ID、图标、名称、排序、类型（系统/自定义）、状态 |
| 操作     | 启用/禁用分类                                       |

> **注意：** 目前分类表 `expense_categories` 的 `status` 字段已存在，但前台未使用。禁用分类后，**建议在前台添加记录时过滤掉已禁用的分类**（这不影响数据库表结构）。

---

#### 3.2.6 数据报表

| 报表               | 说明                         |
| ------------------ | ---------------------------- |
| 全平台消费趋势     | 按日期汇总，支持切换7天/30天 |
| 用户消费排行 TOP20 | 按消费总额降序排列用户       |
| 分类消费排行       | 按消费总额降序排列分类       |
| 每日新增用户趋势   | 近30天每日注册用户数         |

**导出功能：**

- 复用现有 `StatsService.exportExcel()` 的逻辑
- 支持按时间范围导出全平台消费数据

---

## 4. 数据设计

### 4.1 新增表：`admin_users`（超级管理员表）

```sql
-- 超级管理员用户表（独立于前台用户表）
CREATE TABLE IF NOT EXISTS `admin_users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
    `username` VARCHAR(50) NOT NULL COMMENT '登录用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码（BCrypt加密）',
    `real_name` VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `role` VARCHAR(20) NOT NULL DEFAULT 'admin' COMMENT '角色：admin=超级管理员',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1=正常，0=禁用',
    `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
    `last_login_ip` VARCHAR(50) DEFAULT NULL COMMENT '最后登录IP',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='超级管理员表';

-- 预设一个初始管理员账号（密码: admin123）
INSERT INTO `admin_users` (`username`, `password`, `real_name`, `role`) VALUES
('admin', '$2a$10$...', '系统管理员', 'admin');
```

> **设计要点：**
>
> - 独立于 `users` 表，不依赖任何现有表的外键
> - 初始管理员通过 SQL 脚本预先插入，密码 BCrypt 加密后存储
> - 后续如需多管理员，可直接通过数据库添加

### 4.2 现有表利用（只读 / 仅修改 status 字段值）

| 表名                 | 用途               | 操作类型                  |
| -------------------- | ------------------ | ------------------------- |
| `users`              | 用户列表、用户详情 | 只读 + 修改`status`       |
| `expense_records`    | 全平台记录列表     | 只读 + 修改`status`(删除) |
| `expense_categories` | 分类列表管理       | 只读 + 修改`status`       |
| `user_preferences`   | 用户详情中展示     | 只读                      |
| `v_monthly_summary`  | 仪表盘统计         | 只读                      |
| `v_category_summary` | 分类消费报表       | 只读                      |

---

## 5. 页面设计

### 5.1 页面路由结构

```
/admin/login              → 管理员登录页
/admin/dashboard          → 仪表盘（首页）
/admin/users              → 用户管理列表
/admin/users/:id          → 用户详情
/admin/records            → 消费记录管理列表
/admin/categories         → 分类管理
/admin/reports            → 数据报表
```

### 5.2 页面布局

**后台布局采用经典的"侧边栏 + 内容区"结构：**

```
┌──────────────────────────────────────┐
│  Admin Header (顶部栏)                │
├──────────┬───────────────────────────┤
│ Sidebar  │                          │
│          │                          │
│ 📊 仪表盘 │      内容区域              │
│ 👥 用户   │                          │
│ 📝 记录   │                          │
│ 🏷️ 分类   │                          │
│ 📈 报表   │                          │
│          │                          │
└──────────┴───────────────────────────┘
```

**侧边栏菜单项：**

| 图标 | 菜单项   | 路由                |
| ---- | -------- | ------------------- |
| 📊   | 仪表盘   | `/admin/dashboard`  |
| 👥   | 用户管理 | `/admin/users`      |
| 📝   | 消费记录 | `/admin/records`    |
| 🏷️   | 分类管理 | `/admin/categories` |
| 📈   | 数据报表 | `/admin/reports`    |

### 5.3 页面说明

#### 5.3.1 登录页

- 居中卡片式登录表单
- 与前台登录页风格统一（使用相同的设计语言）
- 明确标识"轻账本 · 后台管理系统"

#### 5.3.2 仪表盘

- 顶部4个统计卡片（用户总数、今日新增、消费总额、今日消费）
- 下方2个图表并排：7天趋势柱状图 + 分类饼图
- 可复用前台 Dashboard 的图表组件模式

#### 5.3.3 用户管理

- 表格列表 + 搜索框 + 分页器
- 点击用户行展开详情面板 / 跳转详情页
- 状态切换按钮（启用/禁用）

#### 5.3.4 消费记录管理

- 表格列表 + 月份筛选 + 分类筛选 + 分页器
- 删除按钮（确认弹窗）
- 可复用前台 Records.jsx 的筛选和分页模式

#### 5.3.5 分类管理

- 表格列表展示所有分类
- 状态切换按钮（启用/禁用）

#### 5.3.6 数据报表

- 时间范围切换（7天/30天）
- 趋势折线图
- 用户消费排行柱状图
- 分类消费排行柱状图
- 导出Excel按钮

---

## 6. 技术方案建议

### 6.1 前端

| 技术 | 说明                                |
| ---- | ----------------------------------- |
| 框架 | React 18 + Vite（新建独立项目）     |
| 样式 | Tailwind CSS（复用前台设计 Token）  |
| 路由 | React Router v6                     |
| 图表 | ECharts / Recharts（与前台一致）    |
| 请求 | 独立 ApiService，调用`/api/admin/*` |

前端包结构：保持和前台项目“003.前端代码（前端工程师）/frontend/lightledger"架构结构一致

**前端项目目录：** `006.后台管理系统（运营专员）/frontend/lightledger-admin/`

### 6.2 后端

| 技术 | 说明                              |
| ---- | --------------------------------- |
| 框架 | Spring Boot 3.3.2（新建独立项目） |
| ORM  | MyBatis-Plus 3.5.7                |
| 认证 | JWT（独立 secret，独立 Token）    |

**后端包结构：**

```
com.lightledger.admin/
├── controller/
│   ├── AdminAuthController.java
│   ├── AdminDashboardController.java
│   ├── AdminUserController.java
│   ├── AdminRecordController.java
│   ├── AdminCategoryController.java
│   └── AdminReportController.java
├── service/
│   ├── AdminAuthService.java
│   └── AdminDashboardService.java
├── mapper/
│   └── AdminUserMapper.java
├── model/
│   ├── entity/AdminUser.java
│   └── dto/
│       ├── AdminLoginRequest.java
│       ├── AdminAuthResponse.java
│       └── ...
└── config/
    └── AdminJwtInterceptor.java

后端项目目录：`006.后台管理系统（运营专员）/backend/lightledger-admin/`
```

### 6.3 API 端点设计

```
# 管理员认证（无需Token）
POST   /api/admin/auth/login          → 管理员登录

# 仪表盘（需要Admin Token）
GET    /api/admin/dashboard            → 仪表盘数据

# 用户管理（需要Admin Token）
GET    /api/admin/users                → 用户列表（分页、搜索）
GET    /api/admin/users/{id}           → 用户详情（含统计）
PUT    /api/admin/users/{id}/status    → 禁用/启用用户

# 记录管理（需要Admin Token）
GET    /api/admin/records              → 全平台记录列表（分页、筛选）
GET    /api/admin/records/{id}         → 记录详情
DELETE /api/admin/records/{id}         → 逻辑删除

# 分类管理（需要Admin Token）
GET    /api/admin/categories           → 分类列表
PUT    /api/admin/categories/{id}/status  → 启用/禁用分类

# 报表（需要Admin Token）
GET    /api/admin/reports/trend        → 消费趋势
GET    /api/admin/reports/user-ranking  → 用户排行
GET    /api/admin/reports/category-ranking → 分类排行
GET    /api/admin/reports/export       → 导出Excel
```

### 6.4 实施步骤建议

| 阶段   | 内容                                                  | 预估     |
| ------ | ----------------------------------------------------- | -------- |
| 第一步 | 创建`admin_users` 表 + 预设管理员                     | SQL脚本  |
| 第二步 | 创建J`lightledger-admin` 后端项目，实现所有 Admin API | 后端代码 |
| 第三步 | 创建`lightledger-admin` 前端项目，实现所有 Admin 页面 | 前端代码 |
| 第四步 | 前后端联调测试                                        | 测试验证 |

---

> **文档版本：** v1.0
> **下次审查：** 2026-07-30
