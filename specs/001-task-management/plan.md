# Implementation Plan: 任务管理页面

**Branch**: `001-task-management` | **Date**: 2026-05-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-task-management/spec.md`

## Summary

在 Chrome Tab 项目中新增一个任务管理页面，顶部放紧急程度和状态下拉筛选框，下方使用 Element Plus 的 `el-table` 展示任务列表（任务名称、创建人、紧急程度、状态、创建时间），支持 `el-pagination` 分页，默认填充 10 条静态 Mock 数据。数据通过 Pinia + localStorage 持久化。

## Technical Context

**Language/Version**: Vue 3.3.4+ / TypeScript 5.6.3+

**Primary Dependencies**: Element Plus 2.11.1 (`el-table`, `el-select`, `el-pagination`, `el-tag`, `el-button`, `el-form`, `el-option`), Pinia 2.2.6, Vue Router 4

**Storage**: Pinia + localStorage（与现有 `store/stock.ts` 持久化模式一致）

**Testing**: 当前项目未配置测试框架（宪章 XXX 节推荐 Vitest，本次不涉及）

**Target Platform**: Chrome 浏览器（Chrome 新标签页扩展）

**Project Type**: 前端 SPA（Chrome 扩展 / Vite 构建）

**Performance Goals**: 50 条以内数据 2 秒内展示完成，筛选操作 500ms 内响应

**Constraints**: 纯前端实现，无后端 API，数据持久化仅依赖 `localStorage`

**Scale/Scope**: 个人任务管理，单用户，预期数据量 < 100 条

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 宪章条目 | 检查结果 | 说明 |
|----------|----------|------|
| III. 目录划分 | ✅ | `views/tasks/index.vue` + `store/task.ts` + `types/task.ts` |
| IV. 模块边界 | ✅ | Store 封装数据逻辑，视图只做编排 |
| V. 命名规范 | ✅ | 组件 PascalCase，CSS kebab-case |
| VI. 类型定义 | ✅ | `types/task.ts` 定义 `TaskItem` 接口 |
| VII. 语法偏好 | ✅ | `<script setup lang="ts">` |
| IX. 模板规范 | ✅ | `el-table` column 渲染 + `v-if` 空状态 |
| X. CSS 组织 | ✅ | `<style lang="scss" scoped>` |
| XX. 边界情况 | ✅ | 空列表/空筛选结果展示占位提示 |
| XXVII. 代码分割 | ✅ | 路由 `() => import()` 懒加载 |
| Governance | ✅ | 功能分支 `001-task-management` |

**GATE RESULT: PASS** — 无违规项。

## Project Structure

### Documentation (this feature)

```text
specs/001-task-management/
├── plan.md              # 本文件
├── spec.md              # 功能规格
├── research.md          # Phase 0 输出
├── data-model.md        # Phase 1 输出
├── quickstart.md        # Phase 1 输出
└── contracts/           # Phase 1 输出
```

### Source Code (repository root)

```text
src/
├── views/
│   └── tasks/
│       └── index.vue         # 任务管理页面
├── store/
│   └── task.ts               # Pinia Store（数据 + 筛选 + CRUD）
├── types/
│   └── task.ts               # TaskItem 接口定义
├── router/
│   └── index.js              # + /tasks 路由（懒加载）
└── utils/
    └── constant.ts           # + TASK_LIST_KEY 常量
```

**Structure Decision**: 严格遵循项目现有目录规范。页面单文件组件（不拆分子组件），Store 按业务领域拆分，类型定义独立文件，路由在现有 `router/index.js` 中追加。

## Complexity Tracking

> 本功能为标准 CRUD + 列表展示，复杂度低，无需额外说明。

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 无 | — | — |
