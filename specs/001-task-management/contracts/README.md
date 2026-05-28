# Contracts: 任务管理页面

本功能为纯前端特性，无外部 API 或服务接口。所有数据交互均通过 Pinia Store + localStorage 实现，不涉及网络层契约。

## 内部接口

### Pinia Store: `useTaskStore`

```
State:
  tasks: TaskItem[]
  filterUrgency: string
  filterStatus: string
  currentPage: number
  pageSize: number

Getters:
  filteredTasks: TaskItem[]
  pagedTasks: TaskItem[]
  totalFiltered: number

Actions:
  addTask(data), updateTask(id, data), deleteTask(id)
  setFilterUrgency(val), setFilterStatus(val), setPage(val)
  loadFromStorage(), saveToStorage(), initMockData()
```

详见 [data-model.md](../data-model.md) 的完整定义。
