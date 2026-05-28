# Quickstart: 任务管理页面

**Phase**: 1 | **Date**: 2026-05-28

## 启动方式

```bash
# 1. 确保依赖已安装
npm install

# 2. 启动开发服务器
npm run dev

# 3. 浏览器访问
# http://localhost:520/#/tasks
```

## 新增文件清单

创建以下文件：

1. `src/types/task.ts` — 任务类型定义
2. `src/store/task.ts` — 任务 Pinia Store
3. `src/views/tasks/index.vue` — 任务管理页面

## 修改文件清单

更新以下文件：

1. `src/router/index.js` — 添加 `/tasks` 路由
2. `src/utils/constant.ts` — 添加 `TASK_LIST_KEY` 常量

## 验证方式

1. 打开浏览器访问 `/tasks`，应看到 10 条 Mock 任务数据以表格展示
2. 下拉框筛选紧急程度"高"，列表仅显示高紧急程度任务
3. 下拉框筛选状态"进行中"，列表仅显示进行中任务
4. 组合筛选两个条件，列表按交集过滤
5. 分页器翻页正常（超过 10 条数据时）
6. 新增/编辑/删除任务后刷新页面，数据保留
