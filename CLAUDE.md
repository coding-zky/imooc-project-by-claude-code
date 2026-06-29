# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multi-disciplinary workspace for **LightLedger** (轻账本), a personal finance tracking tool. The project is organized into three separate work directories:

| Directory | Purpose |
|-----------|---------|
| `001.产品PRD（产品经理）/` | Product Requirements Document |
| `002.产品UI原型（美术设计）/` | UI design prototypes and design system |
| `003.前端代码（前端工程师）/` | Frontend implementation |

## Frontend Architecture

The frontend (in `003.前端代码（前端工程师）/frontend/lightledger_modern_minimalist/`) is a **React SPA** built with:

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS with a custom design system (see `DESIGN.md`)
- **Routing:** React Router v6
- **Charts:** ECharts or Recharts
- **Storage:** localStorage (no backend in V1.0)

### Data Storage Schema

```javascript
// Users key: 'lightledger_users'
{ "users": [{ "username": "string", "password": "string", "createdAt": "timestamp" }] }

// Records key: 'lightledger_records_{username}'
{ "records": [{ "id": "uuid", "amount": 0.00, "category": "string", "date": "YYYY-MM-DD", "note": "string", "createdAt": "timestamp" }] }

// Login state: 'lightledger_session'
{ "username": "string", "loginAt": "timestamp" }
```

### Design System

The UI follows a Modern Minimalist design philosophy ("Efficiency through Clarity"):

- **Primary Color:** `#2563EB` (blue)
- **Background:** `#F9FAFB` (cool gray)
- **Typography:** Inter + PingFang SC (Chinese)
- **Grid:** 4px base unit
- **Card Radius:** 12px | Button: 8px | Input: 6px
- **Elevation:** Flat design with 1px borders; soft shadows only for modals/dropdowns

### Preset Expense Categories

| Emoji | Category |
|-------|----------|
| 🍜 | 餐饮 (Food) |
| 🚗 | 交通 (Transport) |
| 🛒 | 购物 (Shopping) |
| 🎮 | 娱乐 (Entertainment) |
| 🏠 | 居住 (Housing) |
| 💊 | 医疗 (Medical) |
| 📚 | 教育 (Education) |
| 📱 | 通讯 (通讯) |
| 🎁 | 社交 (Social) |
| 📌 | 其他 (Other) |

## Common Commands

Since the frontend is not yet initialized, typical commands will be:

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Important Notes

- V1.0 is **frontend-only** with localStorage — no backend, no JWT, no cloud sync
- All user data is isolated by username key prefix in localStorage
- The `DESIGN.md` in the frontend folder contains the complete design system spec (colors, typography, spacing, component styles)