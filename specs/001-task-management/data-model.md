# Data Model: 任务管理

**Phase**: 1 | **Date**: 2026-05-28

## Entity: TaskItem

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `id` | `string` | ✅ | 自动生成 (Date.now().toString()) | 唯一标识 |
| `name` | `string` | ✅ | — | 任务名称，1-50 字符 |
| `creator` | `string` | ✅ | — | 创建人，1-20 字符 |
| `urgency` | `Urgency` | ✅ | `medium` | 紧急程度枚举 |
| `status` | `Status` | ✅ | `pending` | 任务状态枚举 |
| `createdAt` | `string` | ✅ | new Date().toISOString() | ISO 日期字符串 |

### Enums

```typescript
type Urgency = "high" | "medium" | "low"

type Status = "pending" | "in_progress" | "done"
```

### Display Mapping

```typescript
const urgencyLabel: Record<Urgency, string> = {
  high: "高",
  medium: "中",
  low: "低",
}

const statusLabel: Record<Status, string> = {
  pending: "待处理",
  in_progress: "进行中",
  done: "已完成",
}
```

### Validation Rules

- `name`: 1-50 字符，非空，去除首尾空格
- `creator`: 1-20 字符，非空
- `urgency`: 必须是 `high` / `medium` / `low` 之一
- `status`: 必须是 `pending` / `in_progress` / `done` 之一

## Store Schema (Pinia)

```typescript
interface TaskStoreState {
  tasks: TaskItem[]           // 全部任务列表，持久化到 localStorage
  filterUrgency: string       // 紧急程度筛选值（"all" 表示全部）
  filterStatus: string        // 状态筛选值（"all" 表示全部）
  currentPage: number         // 当前页码
  pageSize: number            // 每页条数，固定 10
}
```

### Computed

- `filteredTasks`: 按 `filterUrgency` + `filterStatus` 筛选后的任务列表
- `pagedTasks`: 对 `filteredTasks` 进行分页截取后的当前页数据
- `totalFiltered`: 筛选后的总数（供分页器使用）

### Actions

- `addTask(task: Omit<TaskItem, "id" | "createdAt">)`: 新增任务
- `updateTask(id: string, data: Partial<TaskItem>)`: 编辑任务
- `deleteTask(id: string)`: 删除任务
- `setFilterUrgency(value: string)`: 设置紧急程度筛选
- `setFilterStatus(value: string)`: 设置状态筛选
- `setPage(page: number)`: 设置当前页码
- `loadFromStorage()`: 初始化时从 localStorage 加载数据
- `saveToStorage()`: 数据变更后持久化到 localStorage
- `initMockData()`: 首次使用时填充 10 条默认数据
