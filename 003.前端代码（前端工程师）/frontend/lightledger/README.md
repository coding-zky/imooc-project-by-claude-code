# 轻账本 (LightLedger)

简洁、高效、专业的个人财务管理工具。

## 技术栈

- **框架:** React 18 + Vite
- **样式:** Tailwind CSS
- **路由:** React Router v6
- **图表:** 原生 SVG（轻量级实现）
- **存储:** localStorage（本地存储）

## 功能特性

- ✅ 用户注册 / 登录
- ✅ 记录消费（金额、分类、日期、备注）
- ✅ 消费明细（筛选、删除）
- ✅ 统计报表（趋势图、分类占比）
- ✅ 个人设置（资料、安全、偏好）
- ✅ 响应式设计（桌面 + 移动端）

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 页面路由

| 路径 | 页面 |
|------|------|
| `/login` | 登录页 |
| `/register` | 注册页 |
| `/` | 首页/仪表盘 |
| `/add` | 记录消费 |
| `/records` | 消费明细 |
| `/stats` | 统计报表 |
| `/settings/profile` | 个人资料 |
| `/settings/security` | 账户安全 |
| `/settings/preferences` | 偏好设置 |

## 数据存储

数据存储在浏览器 `localStorage` 中：

- `lightledger_users` - 用户列表
- `lightledger_session` - 当前会话
- `lightledger_records_{username}` - 用户消费记录

## 设计规范

详见 [DESIGN.md](./DESIGN.md)