<!--
  Sync Impact Report
  ==================
  Version change: (template) 0.0.0 → 1.0.0
  Reason: MAJOR bump — first populated version of the constitution,
  replacing all placeholders with project-specific content.

  Modified principles: N/A (all new)
  Added sections:
    - 核心技术栈约定
    - 代码结构
    - 命名规则
    - 代码风格
    - 组件设计
    - 网络请求
    - 错误处理
    - 安全基线
    - 性能优化
    - 测试策略
    - Git 工作流
    - AI 使用指引
    - MCP 使用指南
  Removed sections: N/A

  Templates requiring updates:
    - .specify/templates/plan-template.md → ⚠ pending (Constitution Check section)
    - .specify/templates/spec-template.md → ⚠ pending (add technology stack constraints)
    - .specify/templates/tasks-template.md → ✅ no change needed
    - .specify/templates/checklist-template.md → ✅ no change needed

  Follow-up TODOs: None
-->

# Chrome Tab 项目宪章

> 本宪章定义项目开发的所有非 negotiable 规则。
> 所有提交的代码 MUST 遵守本宪章规定，Code Review 时逐条核验。

## 核心技术栈约定

### I. 框架与版本（MUST）

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue | ^3.3.4 |
| 构建 | Vite | ^4.4.5 |
| 语言 | TypeScript | ^5.6.3 |
| 包管理 | npm | latest |
| 状态管理 | Pinia | ^2.2.6 |
| 路由 | Vue Router | 4 |
| UI 库 | Element Plus | ^2.11.1 |
| 样式方案 | SCSS（scoped） | ^1.69.5 |
| HTTP 客户端 | Axios / fetch | ^1.7.7 |
| 图表 | lightweight-charts | ^5.2.0 |

- **框架版本锁定**: `package.json` 中 MUST 使用精确版本号或 `^` 范围，禁止 `*`。
- **路径别名**: MUST 使用 `@/` 映射 `src/`（已在 `vite.config.js` / `tsconfig.json` 中配置）。
- **包管理**: MUST 使用 npm，提交 `package-lock.json` 到版本控制。
- **ESLint**: MUST 配置 `@typescript-eslint` 规则集（依赖已安装），SHOULD 在 CI 中执行 lint 检查。
- **MAY** 使用 `unplugin-auto-import` 和 `unplugin-vue-components` 自动按需引入 Element Plus 组件。

### II. 构建约定（MUST）

- 开发服务器 MUST 使用 Vite 代理解决跨域，配置在 `vite.config.js` 的 `server.proxy` 中。
- 生产构建 MUST 通过 `vite build` 输出到 `dist/` 目录。
- 禁止提交 `dist/`、`node_modules/`、`.env` 文件到版本控制。

## 代码结构

### III. 目录划分（MUST）

```
src/
├── assets/          # 静态资源（图片、全局样式）
├── components/      # 公共组件（PascalCase 命名）
├── hooks/           # 组合式函数（useXxx 命名）
├── router/          # 路由配置
├── store/           # Pinia 状态仓库（按功能模块拆分）
├── types/           # TypeScript 类型定义
├── utils/           # 工具函数（const 常量、helper 函数）
├── views/           # 页面级组件（按功能模块分文件夹）
│   ├── home/
│   ├── draw/
│   ├── stock/
│   ├── story/
│   └── puzzle/
└── App.vue          # 根组件（仅包含 <router-view />）
```

- 每个视图模块 MUST 独立文件夹，内部包含 `index.vue` 作为入口。
- 组件 MUST 放在 `components/` 目录，除非仅在单个页面中使用（可放在 `views/[module]/` 下）。
- 状态仓库 MUST 按业务领域拆分（如 `stock.ts`、`ai.ts`、`img.ts`），禁止单一全局 Store。
- 路由文件 MUST 保持单一 `router/index.js`，使用 `import()` 懒加载页面组件。

### IV. 模块边界（MUST）

- `views/` 层 SHOULD 只做组合编排，业务逻辑委托给 `hooks/` 或 `store/`。
- `hooks/` 层 SHOULD 封装可复用的有状态逻辑（如 `useKlineData`、`useMouseEvent`）。
- `store/` 层 MUST 通过 Pinia 管理全局状态，持久化逻辑封装在 Store actions 内部。
- `utils/` 层 MUST 只包含纯函数和常量，禁止副作用。
- `components/` 组件 MUST 通过 Props + Emits 通信，禁止直接引用 Store（Smart 组件除外）。

## 命名规则

### V. 命名规范（MUST）

| 类别 | 规则 | 示例 |
|------|------|------|
| Vue 组件 | PascalCase | `StockList.vue`, `CandlestickChart.vue` |
| 组件目录/文件 | PascalCase | `StockList.vue`, `TimeClock.vue` |
| 组合式函数 | camelCase + `use` 前缀 | `useKlineData`, `useMouseEvent` |
| 普通函数 | camelCase | `fetchRealtimeData`, `parseGtapiResponse` |
| 变量 | camelCase | `stockList`, `currentPrice` |
| 常量 | SCREAMING_SNAKE_CASE | `FULL_SCREEN`, `GRID_SCREEN` |
| 类型/接口 | PascalCase | `StockData`, `KlineItem` |
| Pinia Store | camelCase 文件名 | `stock.ts`, `ai.ts` |
| CSS 类名 | kebab-case | `.stock-page`, `.chart-area` |
| 私有函数 | camelCase，无 `_` 前缀 | `parseGtapiResponse`（模块内部可见即可） |

### VI. 类型定义（MUST）

- 所有接口类型 MUST 集中定义在 `types/` 目录下，按模块拆分（如 `types/stock.ts`）。
- 组件 Props 类型 MUST 使用 `defineProps<Type>()` 泛型语法（Vue 3.3+）。
- 组件 Emits 类型 MUST 使用 `defineEmits<{ (e: string, payload: Type): void }>()` 语法。
- 禁止使用 `any`，SHOULD 使用 `unknown` + 类型守卫。

## 代码风格

### VII. 语法偏好（MUST）

- 组件 MUST 使用 `<script setup lang="ts">` 语法（Composition API）。
- 禁止 Options API（`data`、`methods`、`computed` 对象写法）—— 除非 Pinia Store（Options API 风格可接受）。
- 字符串 MUST 使用双引号（`"`）。
- 语句 MUST 以分号结尾。
- 使用 `const` / `let`，禁止 `var`。
- 箭头函数优先于 `function` 关键字声明（除顶级函数）。

### VIII. 组件内部顺序（MUST）

```typescript
// 1. 类型导入 + 运行时导入（先外后内）
import { ref, onMounted } from "vue"
import type { StockData } from "@/types/stock"

// 2. 组件/Store/Hooks 导入
import useStockStore from "@/store/stock"
import { useKlineData } from "@/hooks/useKlineData"

// 3. 常量/工具函数导入
import { FULL_SCREEN } from "@/utils/constant"

// 4. defineProps / defineEmits
defineProps<{ data: KlineItem[] }>()
defineEmits<{ select: [code: string] }>()

// 5. ref / reactive 响应式状态
const searchValue = ref<string>("")

// 6. computed

// 7. watch

// 8. 普通函数

// 9. 生命周期钩子 (onMounted, onUnmounted)
onMounted(() => {})
```

### IX. 模板/JSX 规范（SHOULD）

- 模板 MUST 使用 `v-if` / `v-else-if` / `v-else` 条件渲染，禁止在模板中写三元表达式。
- `v-for` MUST 绑定 `:key`，key 优先使用业务 ID 而非索引。
- 禁止在模板中调用函数（每次渲染都会执行），SHOULD 使用 computed 或变量缓存。
- 事件绑定优先使用 `@click` 语法而非 `v-on:click`。

### X. CSS 组织（MUST）

- 组件样式 MUST 使用 `<style lang="scss" scoped>` 限定作用域。
- 禁止在组件中编写全局样式，全局样式统一放在 `assets/css/` 下。
- 类名 MUST 使用 kebab-case。
- 嵌套深度 SHOULD 不超过 4 层。
- CSS 变量 MAY 用于主题色统一管理。

## 组件设计

### XI. 粒度原则（SHOULD）

- 一个组件做一件事。超过 200 行的模板 SHOULD 考虑拆分子组件。
- 页面级组件（`views/`）SHOULD 只做布局编排和数据协调。
- 展示型组件（`components/`）MUST 通过 Props 接收数据，禁止直接调用 Store 或 API。
- 容器组件可以混合展示 + 逻辑，但 SHOULD 优先拆分为「容器组件 + 展示组件」模式。

### XII. Props 设计（MUST）

- Props MUST 定义类型，禁止无类型声明。
- 使用 `defineProps<Type>()` 泛型语法。
- 布尔类型的 Props SHOULD 默认值为 `false`。
- 复杂对象 Props MUST 定义接口类型。

### XIII. 性能优化（SHOULD）

- 大数据列表 SHOULD 使用虚拟滚动（可引入 `vue-virtual-scroller`）。
- 频繁触发的函数（如 `mousewheel`）SHOULD 使用节流/防抖。
- 组件卸载时 MUST 清除定时器（`clearInterval`）、事件监听（`removeEventListener`）、watch 取消。
- 使用 `v-if` 替代 `v-show` 控制频繁切换以外的大块 DOM。

## 网络请求

### XIV. 客户端封装（MUST）

- API 请求 SHOULD 统一封装，推荐使用 `Axios` 实例 + 拦截器模式。
- 目前项目中混合使用 `fetch` 和 Axios，SHOULD 逐步收敛到 Axios。
- 基础 URL、超时时间、请求头 MUST 在 Axios 实例中统一配置。
- 请求/响应拦截器 MUST 统一处理 Token 注入、错误码、Loading 状态。

### XV. 类型安全（MUST）

- 每个 API 响应 MUST 定义对应的 TypeScript 接口。
- 接口定义集中放在 `types/` 目录下。
- 泛型工具类型如 `ApiResponse<T>` MAY 用于统一包装后端响应结构。

### XVI. 错误码处理（SHOULD）

- 后端错误码 MUST 在响应拦截器中统一处理，按业务码分发错误类型。
- 网络错误（超时、断网）MUST 提供用户可读的提示。
- 401 未授权 MUST 在拦截器中统一跳转登录或刷新 Token。

### XVII. 缓存策略（SHOULD）

- 静态数据（如股票代码列表）MAY 使用 `localStorage` 持久化（当前项目已采用）。
- K 线数据等频繁更新的数据不建议本地缓存，应以实时请求为准。
- 缓存 key MUST 使用常量定义在 `utils/constant.ts` 中。

### XVIII. 请求取消（SHOULD）

- 组件卸载时 SHOULD 取消未完成的请求，使用 `AbortController`（fetch）或 `CancelToken`（Axios）。
- 轮询请求 MUST 在组件 `onUnmounted` 中停止。

## 错误处理

### XIX. API 层错误处理（MUST）

- 所有 `async` 请求 MUST 使用 `try/catch` 包裹。
- API 错误 MUST 在 Service/Hooks 层捕获和处理，不要抛到组件层。
- 错误信息 MUST 用户友好，禁止直接展示 `Error.message` 或技术栈信息。

### XX. 边界情况处理（MUST）

- 空数据 MUST 提供占位提示（如 "暂无自选股"、"暂无K线数据"）。
- 加载中 MUST 展示 Loading 状态（Element Plus `v-loading` 或自定义）。
- 网络超时 MUST 有重试或降级展示。
- 列表为空时 MUST 展示空状态组件或提示文字。

### XXI. 全局兜底（SHOULD）

- MAY 注册 Vue 全局 `errorHandler` 捕获未处理异常。
- `console.error` MAY 用于开发调试，生产环境 SHOULD 上报错误。

## 安全基线

### XXII. 认证与 Token 管理（MUST）

- Token MUST 存储在 `localStorage` 或 `sessionStorage` 中，禁止硬编码在代码中。
- Token 刷新逻辑 MUST 使用 Axios 响应拦截器统一处理 401。
- 请求拦截器 MUST 自动为每个请求注入 `Authorization` 头。

### XXIII. 输入验证（MUST）

- 用户输入 MUST 进行基本验证（非空、长度、格式）。
- 搜索框输入 MUST 在使用前校验（如 `goBook` 中的 URL 正则校验）。
- 避免将用户输入直接拼接到 URL 或 HTML 中。

### XXIV. XSS 防护（MUST）

- 禁止使用 `v-html` 渲染用户输入内容。
- 用户输入插入 DOM 时 MUST 使用 Vue 模板语法（`{{ }}`）自动转义。
- URL 参数 MUST 使用 `encodeURIComponent` 编码。

### XXV. 敏感信息（MUST）

- API Key、密钥 MUST 通过环境变量（`import.meta.env.VITE_*`）注入，禁止硬编码。
- `.env` 文件 MUST 加入 `.gitignore`，仅提交 `.env.example` 模板。
- 客户端日志禁止输出用户敏感信息。

### XXVI. CORS/CSRF（SHOULD）

- 开发环境 MUST 使用 Vite Proxy 避免跨域问题（已在 `vite.config.js` 中配置）。
- 生产环境 MUST 确保后端配置正确的 CORS 头。

## 性能优化

### XXVII. 代码分割（MUST）

- 路由级懒加载 MUST 使用 `() => import()` 语法（当前项目已采用）。
- 非首屏组件 MAY 使用 `defineAsyncComponent` 异步加载。
- 第三方库（如 `lightweight-charts`）MUST 按需引入，禁止全量导入。

### XXVIII. 渲染优化（SHOULD）

- 大数据量列表 SHOULD 使用虚拟滚动或分页。
- 避免不必要的响应式包装，仅对需要响应式的数据使用 `ref` / `reactive`。
- `v-once` MAY 用于纯静态内容优化。

### XXIX. 资源优化（SHOULD）

- 图片资源 SHOULD 使用 CDN 或压缩格式。
- 字体图标 SHOULD 使用 SVG（当前项目已使用 `@element-plus/icons-vue`）。

## 测试策略

### XXX. 测试体系（SHOULD）

> 当前项目尚无测试框架。以下是推荐策略：

- **单元测试**: Vitest + `@vue/test-utils`，覆盖 Hooks 和工具函数。
- **组件测试**: Vitest，覆盖 Props 渲染和 Emits 触发。
- **E2E 测试**: Playwright 或 Cypress，覆盖核心用户流程。
- 测试文件 SHOULD 放在 `__tests__/` 目录下或与被测文件同目录的 `*.spec.ts`。
- 测试覆盖率 SHOULD 达到 60%+（单元 + 组件）。

### XXXI. Mock 方案（SHOULD）

- API 请求 SHOULD 使用 `msw`（Mock Service Worker）或 Vitest Mock。
- `localStorage` 操作 SHOULD 在测试中 Mock。

## Git 工作流

### XXXII. 分支策略（MUST）

- 主分支：`main` —— 生产就绪代码。
- 功能分支：从 `main` 切出，命名格式 `feature/[short-description]`。
- 修复分支：`fix/[short-description]`。
- 禁止直接向 `main` 推送代码，MUST 通过 PR/Merge Request。

### XXXIII. 提交规范（SHOULD）

- 提交信息 MUST 使用中文或英文，清晰描述改动目的（"why" 而非 "what"）。
- 建议格式：
  - `feat: 新增股票K线图功能`
  - `fix: 修复showStockList初始化取值类型比较错误`
  - `refactor: 重构数据获取逻辑`
  - `chore: 更新依赖版本`
  - `docs: 补充API文档`

### XXXIV. 发布流程（SHOULD）

- 版本号遵循 `MAJOR.MINOR.PATCH` 语义化版本。
- 每次发布 MUST 更新 `package.json` 版本号并打 Git Tag。

## AI 使用指引

### XXXV. 模糊澄清（MUST）

- 当需求描述不明确时，AI MUST 主动提出问题边界确认，而非自行假设。
- AI 实现的每个功能 MUST 对应明确的需求描述或 Issue。

### XXXVI. TDD 实践（SHOULD）

- 核心逻辑推荐 TDD 流程：编写测试 → 测试失败 → 实现 → 测试通过 → 重构。
- 测试 MUST 先于实现代码提交。

### XXXVII. 可读性优先（MUST）

- 代码可读性优先于"巧妙"实现。
- 变量名和函数名 MUST 自文档化。
- 复杂逻辑 MUST 拆分为命名清晰的小函数。

### XXXVIII. 组件规范遵守（MUST）

- AI 生成的组件 MUST 遵守本宪章的所有组件设计规则。
- Props 类型定义、命名规范、模板写法 MUST 与项目现有风格一致。

### XXXIX. TODO 标注（SHOULD）

- 临时代码或待完善部分 MUST 标注 `TODO(原因): 说明` 格式。
- TODO MUST 关联 Issue 或任务 ID。

## MCP 使用指南

### XL. 设计系统集成（SHOULD）

- MCP 工具调用 MUST 与项目设计系统保持一致。
- 组件生成 SHOULD 复用 Element Plus 现有组件，避免重复造轮子。

### XLI. 接口对接（MUST）

- MCP 调用的 API MUST 有类型定义。
- 接口数据 MUST 经过类型转换/校验后再注入 Store 或组件。

### XLII. 部署工具（MAY）

- MAY 使用 MCP 部署工具（如 Vercel、Netlify MCP）自动化部署流程。
- 部署前 MUST 通过本地 `vite build` 验证构建无错误。

## Governance

- 本宪章是对项目所有开发实践的最终权威，优先于个人习惯和外部模板。
- 修正案 MUST 通过 Pull Request 提交，经过至少一人 Review 后合并。
- 版本遵循语义化版本（MAJOR.MINOR.PATCH）：
  - MAJOR：治理原则删除或向后不兼容的修改。
  - MINOR：新增原则或实质性扩展规则。
  - PATCH：措辞澄清、笔误修正、非语义优化。
- 每次修改 MUST 更新 `LAST_AMENDED_DATE` 和版本号，并在文件顶部维护 Sync Impact Report。
- Code Review MUST 逐条核验本宪章相关条款的合规性。
- 新加入项目的成员 MUST 阅读并理解本宪章。
- 复杂度 MUST 被证明合理，禁止不必要的抽象。

**Version**: 1.0.0 | **Ratified**: 2026-05-28 | **Last Amended**: 2026-05-28
