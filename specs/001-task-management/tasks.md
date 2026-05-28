---

description: "Task list for task management page feature"
---

# Tasks: 任务管理页面

**Input**: Design documents from `specs/001-task-management/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 创建基础文件和目录结构

- [x] T001 [P] 创建任务类型定义文件 `src/types/task.ts`（TaskItem 接口、Urgency/Status 枚举）
- [x] T002 [P] 在 `src/utils/constant.ts` 中添加 `TASK_LIST_KEY` 常量

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 核心基础设施，所有 User Story 依赖

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] 创建任务 Pinia Store `src/store/task.ts`（含完整 CRUD、筛选、分页状态、localStorage 持久化、10 条 Mock 数据初始化）
- [x] T004 在 `src/router/index.js` 中添加 `/tasks` 路由，懒加载 `views/tasks/index.vue`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 查看并按条件过滤任务列表 (Priority: P1) 🎯 MVP

**Goal**: 用户进入任务管理页面后能看到完整的任务列表，并通过下拉框筛选紧急程度和状态。

**Independent Test**: 打开 `/tasks` 页面，确认表格显示 10 条 Mock 数据（任务名称、创建人、紧急程度、状态、创建时间）；操作紧急程度下拉框筛选"高"，列表仅显示高紧急程度任务；操作状态筛选"进行中"，列表仅显示进行中任务；组合筛选，列表按交集过滤；分页器翻页正常。

- [x] T005 [P] [US1] 创建任务管理页面 `src/views/tasks/index.vue`（顶部筛选区：紧急程度 + 状态下拉框）
- [x] T006 [P] [US1] 在页面中使用 `el-table` 实现任务列表展示（任务名称、创建人、紧急程度（`el-tag`）、状态（`el-tag`）、创建时间）
- [x] T007 [US1] 在页面底部集成 `el-pagination` 分页器（每页 10 条）
- [x] T008 [US1] 实现筛选与分页联动：筛选结果为空时展示"没有匹配的任务"空状态提示

**Checkpoint**: User Story 1 complete — 用户可以查看和筛选任务列表

---

## Phase 4: User Story 2 - 管理任务数据（新增/编辑/删除）(Priority: P2)

**Goal**: 用户可以在页面上新增、编辑和删除任务。

**Independent Test**: 点击"新增任务"按钮，填写表单提交后列表出现新任务；点击编辑按钮修改字段后列表更新；点击删除按钮并确认后任务从列表移除。

- [x] T009 [US2] 在页面顶部添加"新增任务"按钮，点击弹出 `el-dialog` 包含 `el-form` 表单（任务名称、创建人、紧急程度、状态为必填）
- [x] T010 [US2] 在表格每行添加编辑按钮，点击弹出 `el-dialog` 预填当前数据，保存后更新
- [x] T011 [US2] 在表格每行添加删除按钮，点击弹出 `el-popconfirm` 二次确认，确认后删除

**Checkpoint**: User Story 2 complete — 用户可以完整管理任务数据

---

## Phase 5: User Story 3 - 紧急程度和状态可视化区分 (Priority: P3)

**Goal**: 紧急程度和状态用彩色标签展示，便于视觉快速识别。

**Independent Test**: 查看任务列表中紧急程度列和状态列，确认不同值有不同颜色：紧急程度高(红)/中(黄)/低(绿)；状态待处理(灰)/进行中(蓝)/已完成(绿)。

- [x] T012 [P] [US3] 实现紧急程度彩色 `el-tag`：高=红色、中=黄色、低=绿色
- [x] T013 [P] [US3] 实现状态彩色 `el-tag`：待处理=灰色、进行中=蓝色、已完成=绿色

**Checkpoint**: User Story 3 complete — 所有任务数据可视化区分清晰

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 收尾优化

- [x] T014 验证所有文件创建完整、路由可访问、页面渲染正常
- [x] T015 清理调试代码和注释，确保代码风格符合宪章规范

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 (P1) → US2 (P2) → US3 (P3)：依次递进，US2 依赖 US1 的页面结构
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### Within Each User Story

- T005、T006 可并行（不同筛选区与表格区组件）
- T007 依赖 T006（分页器需绑定表格数据）
- T008 依赖 T007（空状态需筛选逻辑就绪）
- T009、T010、T011 无内部依赖，可顺序实现

### Parallel Opportunities

- T001 和 T002 可并行
- T003 和 T004 可并行
- T005 和 T006 可并行
- T012 和 T013 可并行

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1: Setup（类型定义 + 常量）
2. Complete Phase 2: Foundational（Store + 路由）
3. Complete Phase 3: User Story 1（页面 + 表格 + 筛选 + 分页）
4. **STOP and VALIDATE**: 测试查看和筛选功能
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories
