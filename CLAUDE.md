# Mini Mall — 微型电商平台

## 项目概述

基于 Next.js 16 App Router 的微型电商网站，涵盖商城前台（商品浏览、搜索、购物车、下单）和后台管理（商品/分类/订单 CRUD）。

## 技术栈

| 层 | 技术 | 版本 |
|---|---|---|
| 框架 | Next.js (App Router) | 16.x |
| 语言 | TypeScript | 5.x |
| 数据库 | SQLite | — |
| ORM | Prisma | 5.x |
| 样式 | TailwindCSS | 4.x |
| 认证 | JWT (jose) + bcryptjs | jose 6.x, bcryptjs 3.x |
| 表单 | react-hook-form + zod | RHF 7.x, zod 4.x |

## 常用命令

```bash
npm run dev          # 启动开发服务器 (http://localhost:3000)
npm run build        # 生产构建
npx prisma db push   # 同步 schema 到 SQLite
npx prisma db seed   # 运行种子数据（管理员 + 4 分类 + 13 商品）
npx prisma studio    # 数据库管理界面
npm run lint         # ESLint 检查
```

## 目录结构

```
src/
├── app/                      # Next.js App Router 页面
│   ├── layout.tsx            # 根布局：字体 + CartProvider + ToastProvider
│   ├── page.tsx              # 首页（占位，Phase 2 完善）
│   ├── globals.css           # TailwindCSS 4 主题配置
│   ├── (shop)/               # 商城前台路由组（共享 Header/Footer）
│   ├── (auth)/               # 认证路由组（居中卡片布局）
│   ├── admin/                # 后台管理（侧边栏布局）
│   └── api/                  # API 路由
├── lib/
│   ├── prisma.ts             # PrismaClient 单例（globalThis 缓存）
│   └── validations.ts        # Zod schema + 常量（ORDER_STATUSES 等）
├── hooks/
│   ├── useCart.tsx           # 购物车 Context + useReducer + localStorage
│   └── useToast.tsx          # Toast 通知 Context
├── components/
│   ├── layout/               # Header, Footer, AdminSidebar
│   ├── shop/                 # ProductCard, ProductGrid, SearchBar, CartDrawer...
│   ├── admin/                # DataTable, ProductForm, StatCard...
│   └── ui/                   # Button, Input, Badge, Card, Modal...
└── actions/                  # Server Actions（auth, products, orders...）
```

## 数据模型

5 个模型：**User → Order → OrderItem ← Product → Category**

- **User**: id, email, password(bcrypt), name, role(CUSTOMER|ADMIN)
- **Category**: id, name, slug(unique), description
- **Product**: id, name, slug(unique), description, price, imageUrl, stock, categoryId
- **Order**: id, userId, status(PENDING→CONFIRMED→SHIPPED→DELIVERED, CANCELLED), totalAmount, shipping*, paymentStatus
- **OrderItem**: 订单快照（productId, quantity, price, name, imageUrl ——下单时固化）

> SQLite 不支持 enum 类型，所有枚举字段用 String + Zod 常量约束。

## 关键架构决策

### Server / Client Component 划分

- **Server Component（默认）**：直接 `prisma.xxx()` 查库，无交互，无浏览器 API
- **Client Component**：含 `onClick`/`useState`/`useEffect`/`localStorage`/表单输入

**必须为 Client Component 的文件**：
- `Header.tsx`（购物车徽标、用户菜单）
- `SearchBar.tsx`（受控输入 + 防抖）
- `ProductCard.tsx`（"加入购物车"）
- `CartDrawer.tsx`、购物车页面、结算页面
- 所有管理后台表单（ProductForm、CategoryForm）
- `DataTable.tsx`、`Pagination.tsx`、`AdminSidebar.tsx`

### 数据流

```
读：Server Component → prisma 直接查库 → 渲染 HTML
写：Client Component → Server Action → Zod 校验 → prisma 写入 → revalidatePath/redirect
购物车：纯客户端 Context → useReducer → localStorage 同步（不经过服务端）
搜索建议：SearchBar → fetch /api/search?q= → prisma → JSON 下拉结果
```

### 认证

JWT + httpOnly Cookie 方案，不依赖第三方 auth 服务：

1. `src/lib/auth.ts` — `signToken()` / `getSession()` / `setTokenCookie()` / `deleteTokenCookie()`
2. `src/middleware.ts` — 读取 cookie → `jwtVerify` → 按路由权限矩阵 allow/redirect
3. `src/actions/auth.ts` — `registerAction` / `loginAction` / `logoutAction`（Server Actions）

权限矩阵：
| 路径 | 权限 |
|---|---|
| `/` `/products/*` `/cart` `/api/search` | 公开 |
| `/login` `/register` | 公开（已登录→跳首页） |
| `/checkout` `/orders/*` | 需登录 |
| `/admin/*` | 需 ADMIN 角色 |

### TailwindCSS 4

CSS-first 配置，无 `tailwind.config.ts`。自定义主题在 `globals.css` 的 `@theme inline` 块中定义：
- `--color-primary`, `--color-accent`, `--color-success`, `--color-warning`, `--color-danger`

## 实施阶段

| Phase | 内容 | 状态 |
|---|---|---|
| 1 | 基础设施（Next.js + Prisma + TailwindCSS + hooks） | ✅ 完成 |
| 2 | 商城前台（UI 组件 + 首页 + 商品详情） | ⏳ 待开始 |
| 3 | 认证系统（JWT + 中间件 + 登录注册页） | ⏳ 待开始 |
| 4 | 购物车 + 结算 | ⏳ 待开始 |
| 5 | 订单管理（订单列表 + 详情） | ⏳ 待开始 |
| 6 | 后台管理（CRUD 商品/分类/订单） | ⏳ 待开始 |
| 7 | 搜索 + 打磨（Toast/错误边界/SEO） | ⏳ 待开始 |

## 编码规范

- 中文注释、中文 UI 文案；变量名、函数名、文件路径用英文
- 页面组件默认 async Server Component，需要交互时才加 `"use client"`
- 表单校验用 Zod schema 定义在 `src/lib/validations.ts`，Server Action 中调用 `safeParse`
- Server Action 返回 `{ success: true, data } | { success: false, errors }` 判别联合
- 订单状态/支付状态等枚举值使用 `src/lib/validations.ts` 中的常量数组，不硬编码
- Prisma 查询默认 `findMany` + `include` 关联，需要分页时加 `skip`/`take`
- 不需要 `try-catch` 包裹 Server Component 数据查询——error.tsx 边界处理

<!-- superpowers-zh:begin (do not edit between these markers) -->
# Superpowers-ZH 中文增强版

本项目已安装 superpowers-zh 技能框架（20 个 skills）。

## 核心规则

1. **收到任务时，先检查是否有匹配的 skill** — 哪怕只有 1% 的可能性也要检查
2. **设计先于编码** — 收到功能需求时，先用 brainstorming skill 做需求分析
3. **测试先于实现** — 写代码前先写测试（TDD）
4. **验证先于完成** — 声称完成前必须运行验证命令

## 可用 Skills

Skills 位于 `.claude/skills/` 目录，每个 skill 有独立的 `SKILL.md` 文件。

- **brainstorming**: 在任何创造性工作之前必须使用此技能——创建功能、构建组件、添加功能或修改行为。在实现之前先探索用户意图、需求和设计。
- **chinese-code-review**: 中文 review 沟通参考——话术模板、分级标注（必须修复/建议修改/仅供参考）、国内团队常见反模式应对。仅在用户显式 /chinese-code-review 时调用，不要根据上下文自动触发。
- **chinese-commit-conventions**: 中文 commit 与 changelog 配置参考——Conventional Commits 中文适配、commitlint/husky/commitizen 中文模板、conventional-changelog 中文配置。仅在用户显式 /chinese-commit-conventions 时调用，不要根据上下文自动触发。
- **chinese-documentation**: 中文文档排版参考——中英文空格、全半角标点、术语保留、链接格式、中文文案排版指北约定。仅在用户显式 /chinese-documentation 时调用，不要根据上下文自动触发。
- **chinese-git-workflow**: 国内 Git 平台配置参考——Gitee、Coding.net、极狐 GitLab、CNB 的 SSH/HTTPS/凭据/CI 接入差异与镜像同步配置。仅在用户显式 /chinese-git-workflow 时调用，不要根据上下文自动触发。
- **dispatching-parallel-agents**: 当面对 2 个以上可以独立进行、无共享状态或顺序依赖的任务时使用
- **executing-plans**: 当你有一份书面实现计划需要在单独的会话中执行，并设有审查检查点时使用
- **finishing-a-development-branch**: 当实现完成、所有测试通过、需要决定如何集成工作时使用——通过提供合并、PR 或清理等结构化选项来引导开发工作的收尾
- **mcp-builder**: MCP 服务器构建方法论 — 系统化构建生产级 MCP 工具，让 AI 助手连接外部能力
- **receiving-code-review**: 收到代码审查反馈后、实施建议之前使用，尤其当反馈不明确或技术上有疑问时——需要技术严谨性和验证，而非敷衍附和或盲目执行
- **requesting-code-review**: 完成任务、实现重要功能或合并前使用，用于验证工作成果是否符合要求
- **subagent-driven-development**: 当在当前会话中执行包含独立任务的实现计划时使用
- **systematic-debugging**: 遇到任何 bug、测试失败或异常行为时使用，在提出修复方案之前执行
- **test-driven-development**: 在实现任何功能或修复 bug 时使用，在编写实现代码之前
- **using-git-worktrees**: 当需要开始与当前工作区隔离的功能开发，或在执行实现计划之前使用——通过原生工具或 git worktree 回退机制确保隔离工作区存在
- **using-superpowers**: 在开始任何对话时使用——确立如何查找和使用技能，要求在任何响应（包括澄清性问题）之前调用 Skill 工具
- **verification-before-completion**: 在宣称工作完成、已修复或测试通过之前使用，在提交或创建 PR 之前——必须运行验证命令并确认输出后才能声称成功；始终用证据支撑断言
- **workflow-runner**: 在 Claude Code / OpenClaw / Cursor 中直接运行 agency-orchestrator YAML 工作流——无需 API key，使用当前会话的 LLM 作为执行引擎。当用户提供 .yaml 工作流文件或要求多角色协作完成任务时触发。
- **writing-plans**: 当你有规格说明或需求用于多步骤任务时使用，在动手写代码之前
- **writing-skills**: 当创建新技能、编辑现有技能或在部署前验证技能是否有效时使用

## 如何使用

当任务匹配某个 skill 时，使用 `Skill` 工具加载对应 skill 并严格遵循其流程。绝不要用 Read 工具读取 SKILL.md 文件。

如果你认为哪怕只有 1% 的可能性某个 skill 适用于你正在做的事情，你必须调用该 skill 检查。
<!-- superpowers-zh:end -->
