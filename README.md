# Mini Mall — 微型电商平台

基于 Next.js 16 的微型电商网站，涵盖商城前台（商品浏览、搜索、购物车、下单）、用户中心（个人主页、订单管理）和后台管理（商品/分类/订单 CRUD）。

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript |
| 数据库 | SQLite + Prisma 5 |
| 样式 | TailwindCSS 4 |
| 认证 | JWT (jose) + bcryptjs |
| 表单 | react-hook-form + zod |
| 构建 | Webpack |

## 快速开始

```bash
npm install
cp .env.example .env          # 如果存在 .env.example
npx prisma db push            # 同步数据库 schema
npx prisma db seed            # 填充种子数据
npm run dev                   # 启动开发服务器 → http://localhost:3000
```

## 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@minimall.com | admin123 |
| 普通用户 | 自行注册 | — |

管理后台入口：http://localhost:3000/admin

## 项目结构

```
src/
├── app/                      # Next.js App Router 页面
│   ├── (shop)/               # 商城前台：首页、商品详情、购物车、结算、订单、个人主页
│   ├── (auth)/               # 认证：登录、注册
│   ├── admin/                # 后台管理：商品/分类/订单 CRUD
│   └── api/                  # API 路由
├── lib/                      # 工具库：Prisma、Auth、Validations
├── hooks/                    # 客户端 Context：购物车、Toast
├── components/               # 组件
│   ├── layout/               # Header、Footer、AdminSidebar
│   ├── shop/                 # ProductCard、ProductGrid、SearchBar、Pagination...
│   ├── admin/                # DataTable、ProductForm、StatCard...
│   └── ui/                   # Button、Input、Badge、Card、Modal...
└── actions/                  # Server Actions
```

## 数据模型

| 模型 | 说明 |
|------|------|
| User | 用户（CUSTOMER / ADMIN） |
| Category | 商品分类（电子产品、服装、图书、家居） |
| Product | 商品（关联分类） |
| Order | 订单（关联用户，支持多状态流转） |
| OrderItem | 订单明细（商品快照） |

订单状态：待处理 → 已确认 → 已发货 → 已签收，可取消

## 实现阶段

| Phase | 内容 | 状态 |
|---|---|---|
| 1 | 基础设施（Next.js + Prisma + TailwindCSS + hooks） | ✅ |
| 2 | 商城前台（商品列表、详情、分类筛选、分页） | ✅ |
| 3 | 认证系统（JWT 登录/注册、中间件权限控制） | ✅ |
| 4 | 购物车（客户端 Context + 服务端同步） | ✅ |
| 5 | 订单系统（下单、订单列表、订单详情、状态管理） | ✅ |
| 6 | 后台管理（商品/分类/订单 CRUD） | ✅ |
| 7 | 搜索 + 个人主页 | ✅ |
