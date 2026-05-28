# Research: 任务管理页面

**Phase**: 0 | **Date**: 2026-05-28

## Summary

本功能为纯前端任务管理页面，无后端依赖。技术选型完全基于项目现有技术栈（Vue 3 + Element Plus + Pinia），无需引入新依赖。

## Technology Decisions

### UI 组件方案

- **Decision**: 使用 Element Plus `el-table` + `el-select` + `el-pagination`
- **Rationale**: 项目已引入 Element Plus 并全局注册，`el-table` 自带列模板、排序、分页功能，与现有项目风格一致
- **Alternatives considered**: 手写原生 table（维护成本高）、其他 UI 库（增加包体积）

### 数据持久化

- **Decision**: Pinia + localStorage（与 `store/stock.ts` 模式一致）
- **Rationale**: 项目已有成熟的 localStorage 工具函数 `getStorage` / `setStorage`，Pinia 已全局注册
- **Alternatives considered**: IndexedDB（过度设计）、纯内存（刷新丢失数据）

### 路由方案

- **Decision**: 在 `router/index.js` 新增 `/tasks` 路由，懒加载 `views/tasks/index.vue`
- **Rationale**: 项目已使用 Vue Router 4 Hash 模式 + 懒加载模式
- **Alternatives considered**: 嵌入 home 页面（耦合度高）

### Mock 数据

- **Decision**: Store 初始化时填充 10 条静态 Mock 数据
- **Rationale**: 用户明确要求"默认填充 10 条静态数据"，Mock 数据帮助用户快速体验功能

### 筛选实现

- **Decision**: 前端 computed 实时过滤 + `el-pagination` 分页
- **Rationale**: 数据量小（< 100 条），纯前端过滤性能足够，无需后端支持

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| 浏览器 localStorage 容量限制 | 低 | 任务数据量小，远未达到 5MB 上限 |
| 页面刷新后筛选条件丢失 | 低 | 非核心功能，用户可重新选择 |
