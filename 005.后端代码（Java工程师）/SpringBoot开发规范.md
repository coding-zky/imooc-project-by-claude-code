# Spring Boot 项目开发规范

> **版本：** v1.0
> **最后更新：** 2026-06-30
> **适用范围：** 轻账本 LightLedger 后端服务
> **制定原则：** 保障代码可读性、可维护性、一致性，兼顾开发效率

---

## 目录

1. [项目管理规范](#1-项目管理规范)
2. [项目结构规范](#2-项目结构规范)
3. [命名规范](#3-命名规范)
4. [代码编写规范](#4-代码编写规范)
5. [分层架构规范](#5-分层架构规范)
6. [RESTful API 规范](#6-restful-api-规范)
7. [数据库规范](#7-数据库规范)
8. [异常处理规范](#8-异常处理规范)
9. [日志规范](#9-日志规范)
10. [配置管理规范](#10-配置管理规范)
11. [安全规范](#11-安全规范)
12. [Git 提交规范](#12-git-提交规范)

---

## 1. 项目管理规范

### 1.1 Maven 项目结构

```
<project>
    <groupId>com.lightledger</groupId>          <!-- 公司/组织域名反写 -->
    <artifactId>lightledger-backend</artifactId> <!-- 项目名-模块名 -->
    <version>1.0.0-SNAPSHOT</version>          <!-- 主版本号.次版本号.修订号 -->
    <packaging>jar</packaging>
</project>
```

**版本号规则（语义化版本）：**

| 阶段   | 格式             | 说明              |
| ------ | ---------------- | ----------------- |
| 开发版 | `1.0.0-SNAPSHOT` | 开发中不稳定版本  |
| 发布版 | `1.0.0`          | 正式发布版本      |
| 预发布 | `1.0.0-RC1`      | Release Candidate |

### 1.2 依赖管理

```xml
<!-- 统一版本管理 -->
<properties>
    <java.version>17</java.version>
    <spring-boot.version>3.3.2</spring-boot.version>
    <mybatis-plus.version>3.5.7</mybatis-plus.version>
</properties>

<!-- 依赖顺序：先Spring生态，再第三方，最后自研 -->
<dependencies>
    <!-- Spring Boot Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- MyBatis-Plus -->
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
        <version>${mybatis-plus.version}</version>
    </dependency>

    <!-- 排除不必要的传递依赖 -->
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>fastjson2</artifactId>
        <exclusions>
            <exclusion>
                <groupId>com.google.guava</groupId>
                <artifactId>guava</artifactId>
            </exclusion>
        </exclusions>
    </dependency>
</dependencies>
```

### 1.3 插件管理

```xml
<build>
    <plugins>
        <!-- Java 编译插件 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.13.0</version>
            <configuration>
                <source>17</source>
                <target>17</target>
                <encoding>UTF-8</encoding>
            </configuration>
        </plugin>

        <!-- Spring Boot 打包插件 -->
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```

---

## 2. 项目结构规范

### 2.1 标准包结构

```
com.lightledger
├── LightLedgerApplication.java          # 启动类（必须放在根包下）
├── config/                               # 配置类
│   ├── CorsConfig.java                  # 跨域配置
│   ├── JwtConfig.java                   # JWT配置
│   ├── WebConfig.java                   # Web配置
│   └── MybatisPlusConfig.java           # ORM配置
├── controller/                           # 控制器层（对外接口）
│   ├── AuthController.java
│   ├── UserController.java
│   └── RecordController.java
├── service/                              # 业务层
│   ├── AuthService.java
│   ├── impl/                            # 业务实现（复杂业务拆分）
│   │   └── AuthServiceImpl.java
│   └── mapper/                         # 若使用XML，XML放此处
├── mapper/                              # 数据访问层
│   ├── UserMapper.java
│   └── RecordMapper.java
├── model/                               # 数据模型
│   ├── entity/                         # 数据库实体（与表一一对应）
│   │   ├── User.java
│   │   └── Record.java
│   ├── dto/                            # 数据传输对象
│   │   ├── request/                    # 请求DTO
│   │   │   ├── LoginRequest.java
│   │   │   └── CreateRecordRequest.java
│   │   └── response/                   # 响应DTO
│   │       ├── ApiResponse.java
│   │       └── AuthResponse.java
│   └── vo/                             # 视图对象（前端专用）
│       └── RecordVO.java
├── util/                               # 工具类
│   ├── JwtUtil.java
│   └── DateUtil.java
└── exception/                          # 异常定义
    ├── BusinessException.java
    └── GlobalExceptionHandler.java
```

### 2.2 分层职责

| 层级       | 职责                            | 禁止出现                 |
| ---------- | ------------------------------- | ------------------------ |
| Controller | 参数校验、调用Service、返回响应 | 业务逻辑、SQL            |
| Service    | 业务逻辑、事务管理              | HTTP处理、直接操作数据库 |
| Mapper     | 数据增删改查                    | 业务逻辑                 |
| Entity     | 数据库表映射                    | 业务字段                 |
| DTO        | 数据传输                        | 业务逻辑                 |

---

## 3. 命名规范

### 3.1 Java 文件命名

| 类型   | 规范                      | 示例                              |
| ------ | ------------------------- | --------------------------------- |
| 类名   | UpperCamelCase            | `UserService`, `RecordController` |
| 接口名 | UpperCamelCase，可加I前缀 | `UserService` 或 `IUserService`   |
| 方法名 | lowerCamelCase            | `getUserById`, `createRecord`     |
| 变量名 | lowerCamelCase            | `userId`, `recordList`            |
| 常量名 | UPPER_SNAKE_CASE          | `MAX_PAGE_SIZE`, `DEFAULT_STATUS` |
| 枚举名 | UpperCamelCase            | `OrderStatus`, `UserRole`         |
| 枚举值 | UPPER_SNAKE_CASE          | `ORDER_STATUS.PENDING`            |

### 3.2 数据库表命名

| 类型     | 规范                  | 示例                         |
| -------- | --------------------- | ---------------------------- |
| 表名     | 小写下划线，模块前缀  | `expense_record`, `sys_user` |
| 字段名   | 小写下划线            | `user_id`, `created_at`      |
| 主键     | `id` 或 `{表名}_id`   | `id`, `user_id`              |
| 外键     | `{参照表名}_id`       | `category_id`, `user_id`     |
| 索引     | `idx_{表名}_{字段名}` | `idx_user_username`          |
| 唯一索引 | `uk_{表名}_{字段名}`  | `uk_user_username`           |

### 3.3 包命名

```
com.imooc.lightledger              # 公司域名反写 + 项目名
├── controller               # 控制器
├── service                  # 服务
├── mapper                   # 数据访问
├── model.entity             # 实体
├── model.dto                # 数据传输对象
├── config                   # 配置
├── util                     # 工具类
└── exception                # 异常
```

### 3.4 命名负面清单

```
❌ 禁止：userName, UserName, username
✅ 正确：userName (lowerCamelCase)

❌ 禁止：getUserById(), selectUserById(), queryUser()
✅ 正确：getUserById()  [Mapper层用 select/query, Service层用 get/find]

❌ 禁止：recordDAO, RecordDAO, recordDao
✅ 正确：RecordMapper (Mapper比DAO更简洁)

❌ 禁止：List<User> userList, ArrayList<User> users
✅ 正确：List<User> users (类型已表达复数含义)
```

---

## 4. 代码编写规范

### 4.1 类编写规范

```java
// ✅ 正确的类声明顺序
public class UserService {

    // 1. 静态常量
    private static final int MAX_RETRY_COUNT = 3;

    // 2. 成员变量（@Autowired 在构造函数中注入更佳）
    private final UserMapper userMapper;
    private final JwtConfig jwtConfig;

    // 3. 构造函数（推荐使用构造器注入）
    @Autowired
    public UserService(UserMapper userMapper, JwtConfig jwtConfig) {
        this.userMapper = userMapper;
        this.jwtConfig = jwtConfig;
    }

    // 4. 公有方法
    public User getUserById(Long userId) {
        return userMapper.selectById(userId);
    }

    // 5. 私有方法（紧跟其调用者）
    private void validateUser(User user) {
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
    }
}
```

### 4.2 方法编写规范

```java
// ✅ 方法编写模板
/**
 * 根据用户ID获取用户信息
 *
 * @param userId 用户ID
 * @return 用户信息
 * @throws BusinessException 当用户不存在时抛出
 */
public User getUserById(Long userId) {
    // 1. 参数校验
    if (userId == null || userId <= 0) {
        throw new IllegalArgumentException("用户ID不合法");
    }

    // 2. 执行逻辑
    User user = userMapper.selectById(userId);

    // 3. 结果校验
    if (user == null) {
        throw new BusinessException("用户不存在");
    }

    // 4. 返回结果
    return user;
}
```

### 4.3 方法长度规范

| 方法行数 | 评价      | 处理方式 |
| -------- | --------- | -------- |
| < 20行   | ✅ 最佳   | 保持     |
| 20-50行  | ⚠️ 可接受 | 考虑拆分 |
| 50-100行 | ❌ 警告   | 必须拆分 |
| > 100行  | ❌ 禁止   | 重构     |

### 4.4 参数校验规范

```java
// ✅ 使用 @Valid 进行参数校验
@PostMapping("/users")
public ApiResponse<User> createUser(@Valid @RequestBody CreateUserRequest request) {
    // ...
}

// ✅ DTO 中定义校验规则
public class CreateUserRequest {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 20, message = "用户名长度在3-20个字符")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 20, message = "密码长度在6-20个字符")
    private String password;

    @Email(message = "邮箱格式不正确")
    private String email;

    @Min(value = 0, message = "年龄不能为负数")
    @Max(value = 150, message = "年龄不能超过150")
    private Integer age;
}
```

### 4.5 集合处理规范

```java
// ✅ 使用 Lambda 和 Stream API
List<User> users = userMapper.selectList(null);

// 筛选
List<User> activeUsers = users.stream()
    .filter(u -> u.getStatus() == 1)
    .collect(Collectors.toList());

// 映射
List<Long> userIds = users.stream()
    .map(User::getId)
    .collect(Collectors.toList());

// 分组
Map<Long, List<User>> userMap = users.stream()
    .collect(Collectors.groupingBy(User::getDepartmentId));

// ✅ 避免 NullPointerException
// 差：users.stream().filter(u -> u.getName().equals("test"))
// 好：users.stream().filter(u -> "test".equals(u.getName()))

// ✅ 使用 Map 的 getOrDefault
Map<String, Integer> scoreMap = new HashMap<>();
int score = scoreMap.getOrDefault(userName, 0);

// ✅ 集合判空
if (CollectionUtils.isEmpty(userList)) {
    return Collections.emptyList();
}
```

---

## 5. 分层架构规范

### 5.1 Controller 层

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * 获取用户详情
     * @param id 用户ID
     * @return 用户信息
     */
    @GetMapping("/{id}")
    public ApiResponse<User> getUserById(@PathVariable Long id) {
        return ApiResponse.success(userService.getUserById(id));
    }

    /**
     * 创建用户
     * @param request 创建请求
     * @return 创建结果
     */
    @PostMapping
    public ApiResponse<User> createUser(@Valid @RequestBody CreateUserRequest request) {
        try {
            User user = userService.createUser(request);
            return ApiResponse.success(user);
        } catch (BusinessException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }
}
```

**Controller 禁止：**

- ❌ 禁止写业务逻辑
- ❌ 禁止直接操作数据库
- ❌ 禁止返回 Map、List 等通用类型（使用 DTO）

### 5.2 Service 层

```java
@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    @Transactional(rollbackFor = Exception.class)
    public User createUser(CreateUserRequest request) {
        // 1. 校验用户名唯一性
        if (isUsernameExists(request.getUsername())) {
            throw new BusinessException("用户名已存在");
        }

        // 2. 构建实体
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setCreatedAt(LocalDateTime.now());

        // 3. 保存
        userMapper.insert(user);

        // 4. 返回
        return user;
    }

    @Transactional(readOnly = true)
    public List<User> getActiveUsers() {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getStatus, 1);
        wrapper.orderByDesc(User::getCreatedAt);
        return userMapper.selectList(wrapper);
    }

    private boolean isUsernameExists(String username) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, username);
        return userMapper.selectCount(wrapper) > 0;
    }
}
```

**Service 规范：**

- ✅ 事务注解 `@Transactional` 标注在 Service 方法上
- ✅ 读方法使用 `readOnly = true`
- ✅ 复杂业务拆分为多个 private 方法
- ✅ 使用 `@Autowired` 构造器注入

### 5.3 Mapper 层

```java
@Mapper
public interface UserMapper extends BaseMapper<User> {

    // 自定义查询方法
    @Select("SELECT * FROM users WHERE username = #{username} AND status = 1")
    User selectByUsername(@Param("username") String username);

    // 使用 XML
    User selectUserWithDept(@Param("userId") Long userId);
}
```

**Mapper XML 规范：**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.lightledger.mapper.UserMapper">

    <resultMap id="BaseResultMap" type="com.lightledger.model.entity.User">
        <id column="id" property="id" jdbcType="BIGINT"/>
        <result column="username" property="username" jdbcType="VARCHAR"/>
        <result column="created_at" property="createdAt" jdbcType="TIMESTAMP"/>
    </resultMap>

    <select id="selectUserWithDept" resultMap="BaseResultMap">
        SELECT u.*, d.name as dept_name
        FROM users u
        LEFT JOIN departments d ON u.dept_id = d.id
        WHERE u.id = #{userId}
    </select>

</mapper>
```

---

## 6. RESTful API 规范

### 6.1 URL 规范

| 操作     | HTTP方法 | URL示例           |
| -------- | -------- | ----------------- |
| 查询列表 | GET      | `/api/users`      |
| 查询单个 | GET      | `/api/users/{id}` |
| 创建     | POST     | `/api/users`      |
| 更新     | PUT      | `/api/users/{id}` |
| 部分更新 | PATCH    | `/api/users/{id}` |
| 删除     | DELETE   | `/api/users/{id}` |

### 6.2 响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "zhangsan"
  }
}
```

### 6.3 HTTP 状态码

| 状态码 | 含义                  | 使用场景           |
| ------ | --------------------- | ------------------ |
| 200    | OK                    | 成功               |
| 201    | Created               | 创建成功           |
| 400    | Bad Request           | 参数错误、业务错误 |
| 401    | Unauthorized          | 未登录             |
| 403    | Forbidden             | 无权限             |
| 404    | Not Found             | 资源不存在         |
| 500    | Internal Server Error | 服务器内部错误     |

### 6.4 分页响应

```json
{
    "code": 200,
    "message": "success",
    "data": {
        "records": [...],
        "pagination": {
            "page": 1,
            "pageSize": 20,
            "total": 100,
            "totalPages": 5
        }
    }
}
```

### 6.5 API 版本管理

```
/api/v1/users      # v1版本
/api/v2/users      # v2版本
```

---

## 7. 数据库规范

### 7.1 表设计规范

```sql
-- ✅ 标准化表结构
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(20) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    avatar VARCHAR(255) COMMENT '头像URL',
    status TINYINT DEFAULT 1 COMMENT '状态：1启用，0禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标记',

    INDEX idx_username (username),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
```

### 7.2 字段类型选择

| 数据类型 | 使用场景   | 注意事项               |
| -------- | ---------- | ---------------------- |
| BIGINT   | 主键、金额 | 金额用 DECIMAL         |
| VARCHAR  | 字符串     | 指定长度               |
| TEXT     | 长文本     | 超过255字符            |
| DATETIME | 日期时间   | 使用 CURRENT_TIMESTAMP |
| TINYINT  | 状态、布尔 | 明确注释含义           |
| DECIMAL  | 金额       | 禁止用 FLOAT/DOUBLE    |

### 7.3 索引规范

```
✅ SELECT u.* FROM users u WHERE u.username = 'test'
   → 需要在 username 上建索引

❌ SELECT * FROM users WHERE YEAR(created_at) = 2026
   → 函数导致索引失效

✅ SELECT * FROM users WHERE created_at BETWEEN '2026-01-01' AND '2026-12-31'
   → 范围查询可以使用索引
```

### 7.4 SQL 编写规范

```sql
-- ✅ 使用参数化查询
SELECT * FROM users WHERE username = #{username}

-- ❌ 禁止 SQL 拼接
SELECT * FROM users WHERE username = '${username}'

-- ✅ 使用 LIMIT 分页
SELECT * FROM users ORDER BY created_at DESC LIMIT 20 OFFSET 0

-- ✅ 避免 SELECT *
SELECT id, username, email FROM users WHERE id = #{id}

-- ✅ 批量操作
INSERT INTO users (username, email) VALUES
('user1', 'user1@test.com'),
('user2', 'user2@test.com');
```

---

## 8. 异常处理规范

### 8.1 异常分类

```java
// 业务异常（可预知，需要提示用户）
public class BusinessException extends RuntimeException {
    private final int code;

    public BusinessException(String message) {
        super(message);
        this.code = 400;
    }

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }
}

// 系统异常（不可预知，记录日志）
public class SystemException extends RuntimeException {
    public SystemException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

### 8.2 全局异常处理器

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * 业务异常处理
     */
    @ExceptionHandler(BusinessException.class)
    public ApiResponse<Void> handleBusinessException(BusinessException e) {
        log.warn("业务异常：{}", e.getMessage());
        return ApiResponse.error(e.getCode(), e.getMessage());
    }

    /**
     * 参数校验异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ApiResponse<Void> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        log.warn("参数校验异常：{}", message);
        return ApiResponse.error(400, message);
    }

    /**
     * SQL异常
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ApiResponse<Void> handleDataIntegrityException(DataIntegrityViolationException e) {
        log.error("数据完整性异常", e);
        return ApiResponse.error(400, "数据操作失败，请检查输入");
    }

    /**
     * 通用异常处理
     */
    @ExceptionHandler(Exception.class)
    public ApiResponse<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return ApiResponse.error(500, "系统繁忙，请稍后重试");
    }
}
```

### 8.3 异常规范

- ✅ 业务异常使用 `BusinessException`
- ✅ 系统异常记录完整堆栈信息
- ✅ 异常信息对用户友好，不暴露内部实现
- ❌ 禁止 `try-catch` 吞掉异常不处理
- ❌ 禁止抛出 `Exception`

---

## 9. 日志规范

### 9.1 日志级别使用

| 级别  | 场景             | 示例                                           |
| ----- | ---------------- | ---------------------------------------------- |
| ERROR | 错误，影响功能   | `log.error("数据库连接失败", e)`               |
| WARN  | 警告，可能有问题 | `log.warn("密码校验失败，用户：{}", username)` |
| INFO  | 重要业务节点     | `log.info("用户登录成功：{}", username)`       |
| DEBUG | 调试信息         | `log.debug("查询参数：{}", params)`            |

### 9.2 日志输出规范

```java
// ✅ 正确的日志格式
log.info("用户[{}]创建订单[{}]成功", userId, orderId);
log.warn("用户[{}]尝试次数过多，当前次数：{}", userId, retryCount);
log.error("订单[{}]支付失败", orderId, e);

// ❌ 禁止的日志格式
log.info("创建用户成功");
log.info("user:" + user.toString());
log.info("{}", user, order);  // 参数顺序错误
```

### 9.3 日志规范

```java
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    public User createUser(CreateUserRequest request) {
        log.info("创建用户，请求参数：username={}", request.getUsername());

        try {
            // 业务逻辑
            log.info("用户[{}]创建成功", user.getId());
            return user;
        } catch (DuplicateKeyException e) {
            log.warn("用户名[{}]已存在", request.getUsername());
            throw new BusinessException("用户名已存在");
        } catch (Exception e) {
            log.error("创建用户异常，请求参数：{}", request, e);
            throw new SystemException("创建用户失败", e);
        }
    }
}
```

---

## 10. 配置管理规范

### 10.1 多环境配置

```
src/main/resources/
├── application.yml              # 主配置（公共配置）
├── application-dev.yml          # 开发环境
├── application-test.yml         # 测试环境
├── application-prod.yml        # 生产环境
└── application-local.yml         # 本地环境
```

### 10.2 配置优先级

```
命令行参数 > application-{profile}.yml > application.yml
```

### 10.3 配置示例

```yaml
# application.yml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  application:
    name: lightledger-backend
  profiles:
    active: dev
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/lightledger
    username: root
    password: ${DB_PASSWORD:}

mybatis-plus:
  mapper-locations: classpath:mapper/*.xml
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl

jwt:
  secret: ${JWT_SECRET}
  expiration: ${JWT_EXPIRATION:86400000}

logging:
  level:
    com.lightledger: INFO
    org.springframework: WARN
```

### 10.4 敏感信息处理

```yaml
# ❌ 禁止在代码库中明文存储密码
password: admin123

# ✅ 使用环境变量
password: ${DB_PASSWORD}

# ✅ 使用配置中心
password: ${配置中心密钥}
```

---

## 11. 安全规范

### 11.1 认证授权

```java
// ✅ JWT Token 验证
public class JwtInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            response.setStatus(401);
            return false;
        }
        // 验证Token有效性
        // ...
        return true;
    }
}
```

### 11.2 密码安全

```java
// ✅ 使用 BCrypt 加密
@Autowired
private BCryptPasswordEncoder passwordEncoder;

public void register(RegisterRequest request) {
    String encodedPassword = passwordEncoder.encode(request.getPassword());
    // 存储加密后的密码
}

// ✅ 密码校验
public boolean validatePassword(String rawPassword, String encodedPassword) {
    return passwordEncoder.matches(rawPassword, encodedPassword);
}
```

### 11.3 SQL 注入防护

```java
// ✅ 使用 MyBatis Parameter
@Select("SELECT * FROM users WHERE username = #{username}")
User findByUsername(@Param("username") String username);

// ❌ 禁止字符串拼接
@Select("SELECT * FROM users WHERE username = '" + username + "'")
```

### 11.4 接口安全

```java
// ✅ 限流
@Configuration
public class RateLimiterConfig {
    @Bean
    public FilterRegistrationBean<RateLimitFilter> rateLimitFilter() {
        // 限流逻辑
    }
}

// ✅ CORS 配置
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");
        // ...
    }
}
```

---

## 12. Git 提交规范

### 12.1 Commit Message 格式

```
<type>: <subject>

<body>

<footer>
```

### 12.2 Type 类型

| Type     | 说明                   |
| -------- | ---------------------- |
| feat     | 新功能                 |
| fix      | Bug修复                |
| docs     | 文档更新               |
| style    | 代码格式（不影响功能） |
| refactor | 重构                   |
| perf     | 性能优化               |
| test     | 测试相关               |
| chore    | 构建/工具相关          |

### 12.3 提交示例

```
feat: 添加用户注册登录功能

- 实现用户注册接口
- 实现用户登录接口
- 添加JWT Token认证

Closes #123
```

### 12.4 分支命名

```
main                    # 主分支（生产环境）
develop                 # 开发分支
feature/user-auth       # 功能分支
fix/order-bug           # 修复分支
release/v1.0.0         # 发布分支
hotfix/payment-crash    # 热修复分支
```

---

## 附录

### A. 常用注解

| 注解              | 所属            | 说明       |
| ----------------- | --------------- | ---------- |
| `@RestController` | Spring          | REST控制器 |
| `@Service`        | Spring          | 业务层组件 |
| `@Mapper`         | MyBatis         | 数据访问层 |
| `@Autowired`      | Spring          | 依赖注入   |
| `@Transactional`  | Spring          | 事务管理   |
| `@Valid`          | Bean Validation | 参数校验   |
| `@PathVariable`   | Spring          | 路径参数   |
| `@RequestBody`    | Spring          | 请求体     |
| `@RequestParam`   | Spring          | 请求参数   |

### B. 常用工具类

```java
// Spring
CollectionUtils.isEmpty(collection)
StringUtils.hasText(string)
ObjectUtils.isEmpty(obj)

// MyBatis-Plus
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getUsername, username);
wrapper.like(User::getEmail, "%@test.com");
wrapper.in(User::getStatus, statusList);
```

### C. 代码审查清单

```
□ 参数校验是否完整？
□ 异常是否被正确处理？
□ 事务是否正确标注？
□ SQL是否有性能问题？
□ 日志是否规范？
□ 命名是否符合规范？
□ 是否有硬编码？
□ 单元测试是否覆盖？
```

---

> **文档版本：** v1.0
> **维护人：** LightLedger 开发团队
> **下次审查：** 2026-12-30
