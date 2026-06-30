# 轻账本 LightLedger - Java 后端

基于 Spring Boot + MyBatis-Plus 的轻账本后端 API 服务。

## 技术栈

| 技术 | 说明 |
|------|------|
| Spring Boot 3.3.2 | Web 框架 |
| MyBatis-Plus 3.5.7 | ORM 框架 |
| MySQL 8.0 | 数据库 |
| JWT (jjwt 0.12.6) | 身份认证 |
| BCrypt | 密码加密 |
| Lombok | 简化代码 |

## 项目结构

```
src/main/java/com/lightledger/
├── LightLedgerApplication.java    # 启动类
├── config/                         # 配置类
│   ├── JwtConfig.java             # JWT 配置
│   ├── JwtInterceptor.java        # JWT 拦截器
│   ├── CorsConfig.java            # 跨域配置
│   ├── WebConfig.java             # Web 配置
│   └── MybatisPlusConfig.java     # MyBatis-Plus 配置
├── controller/                     # 控制器层
│   ├── AuthController.java        # 认证接口
│   ├── UserController.java        # 用户接口
│   ├── CategoryController.java    # 分类接口
│   ├── RecordController.java      # 记录接口
│   └── StatsController.java       # 统计接口
├── service/                        # 业务层
│   ├── AuthService.java
│   ├── UserService.java
│   ├── CategoryService.java
│   └── RecordService.java
├── mapper/                         # 数据层
│   ├── UserMapper.java
│   ├── CategoryMapper.java
│   └── RecordMapper.java
├── model/
│   ├── entity/                     # 实体类
│   └── dto/                        # 数据传输对象
└── util/                           # 工具类
    └── JwtUtil.java
```

## 快速开始

### 1. 环境要求

- JDK 17+
- Maven 3.9+
- MySQL 8.0+

### 2. 初始化数据库

```bash
mysql -u root -p < src/main/resources/schema.sql
```

### 3. 配置数据库连接

编辑 `src/main/resources/application.yml`：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/lightledger?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&useSSL=false
    username: root
    password: your_password
```

### 4. 启动服务

```bash
mvn spring-boot:run
```

服务地址: http://localhost:8080

## API 接口

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |

### 分类接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/categories | 获取所有分类（无需认证） |

### 记录接口（需认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/records | 查询记录（分页、筛选） |
| POST | /api/records | 添加记录 |
| PUT | /api/records/{id} | 更新记录 |
| DELETE | /api/records/{id} | 删除记录 |

### 统计接口（需认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/stats?days=7 | 获取统计数据 |

### 用户接口（需认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/users/profile | 获取用户信息 |
| PUT | /api/users/profile | 更新用户信息 |
| PUT | /api/users/password | 修改密码 |
| POST | /api/users/phone | 绑定手机号 |

## 请求示例

### 注册

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'
```

### 添加记录

```bash
curl -X POST http://localhost:8080/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{"amount":100.00,"categoryId":1,"recordDate":"2026-06-30","note":"午餐"}'
```

## 配置说明

### JWT 配置

```yaml
jwt:
  secret: your-secret-key-change-in-production
  expiration: 86400000  # 24小时
```

### 分页配置

默认分页大小: 20条
最大分页大小: 100条
