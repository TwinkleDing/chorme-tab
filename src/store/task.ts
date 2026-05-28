import { defineStore } from "pinia";
import { getStorage, setStorage } from "@/utils";
import { TASK_LIST_KEY } from "@/utils/constant";
import type { TaskItem, Urgency, Status } from "@/types/task";

/** 生成 Mock 任务数据 */
function generateMockTasks(): TaskItem[] {
  const now = Date.now();
  const mockData: Array<{
    name: string;
    creator: string;
    urgency: Urgency;
    status: Status;
  }> = [
    { name: "完成项目需求文档", creator: "张三", urgency: "high", status: "in_progress" },
    { name: "修复登录页面样式Bug", creator: "李四", urgency: "high", status: "pending" },
    { name: "编写单元测试用例", creator: "王五", urgency: "medium", status: "pending" },
    { name: "数据库表结构设计", creator: "张三", urgency: "high", status: "done" },
    { name: "Code Review 前端PR", creator: "赵六", urgency: "medium", status: "in_progress" },
    { name: "更新API接口文档", creator: "李四", urgency: "low", status: "pending" },
    { name: "搭建CI/CD流水线", creator: "王五", urgency: "medium", status: "done" },
    { name: "用户权限模块开发", creator: "张三", urgency: "high", status: "in_progress" },
    { name: "优化首页加载速度", creator: "赵六", urgency: "low", status: "pending" },
    { name: "每周项目进度汇报", creator: "张三", urgency: "medium", status: "done" },
  ];
  return mockData.map((item, index) => ({
    id: String(now + index),
    ...item,
    createdAt: new Date(now - index * 86400000).toISOString(),
  }));
}

export default defineStore("task", {
  state: () => ({
    /** 全部任务列表 */
    tasks: [] as TaskItem[],
    /** 紧急程度筛选值，"all" 表示全部 */
    filterUrgency: "all" as string,
    /** 状态筛选值，"all" 表示全部 */
    filterStatus: "all" as string,
    /** 当前页码 */
    currentPage: 1,
    /** 每页条数 */
    pageSize: 10,
  }),

  getters: {
    /** 按筛选条件过滤后的任务列表 */
    filteredTasks(state): TaskItem[] {
      return state.tasks.filter((task) => {
        const matchUrgency =
          state.filterUrgency === "all" || task.urgency === state.filterUrgency;
        const matchStatus =
          state.filterStatus === "all" || task.status === state.filterStatus;
        return matchUrgency && matchStatus;
      });
    },

    /** 当前分页的任务数据 */
    pagedTasks(): TaskItem[] {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredTasks.slice(start, start + this.pageSize);
    },

    /** 筛选后的总数（供分页器使用） */
    totalFiltered(): number {
      return this.filteredTasks.length;
    },
  },

  actions: {
    /** 新增任务 */
    addTask(data: Omit<TaskItem, "id" | "createdAt">): void {
      const task: TaskItem = {
        id: String(Date.now()),
        ...data,
        createdAt: new Date().toISOString(),
      };
      this.tasks.unshift(task);
      this.saveToStorage();
    },

    /** 编辑任务 */
    updateTask(id: string, data: Partial<TaskItem>): void {
      const index = this.tasks.findIndex((t) => t.id === id);
      if (index !== -1) {
        this.tasks[index] = { ...this.tasks[index], ...data };
        this.saveToStorage();
      }
    },

    /** 删除任务 */
    deleteTask(id: string): void {
      this.tasks = this.tasks.filter((t) => t.id !== id);
      this.saveToStorage();
      // 如果当前页没有数据了，回退到上一页
      if (this.pagedTasks.length === 0 && this.currentPage > 1) {
        this.currentPage--;
      }
    },

    /** 设置紧急程度筛选 */
    setFilterUrgency(value: string): void {
      this.filterUrgency = value;
      this.currentPage = 1;
    },

    /** 设置状态筛选 */
    setFilterStatus(value: string): void {
      this.filterStatus = value;
      this.currentPage = 1;
    },

    /** 设置当前页码 */
    setPage(page: number): void {
      this.currentPage = page;
    },

    /** 从 localStorage 加载数据 */
    loadFromStorage(): void {
      const saved = getStorage(TASK_LIST_KEY);
      if (saved) {
        try {
          this.tasks = JSON.parse(saved);
        } catch {
          this.tasks = [];
        }
      }
    },

    /** 持久化到 localStorage */
    saveToStorage(): void {
      setStorage(TASK_LIST_KEY, JSON.stringify(this.tasks));
    },

    /** 初始化 Mock 数据（首次使用时填充） */
    initMockData(): void {
      this.loadFromStorage();
      if (this.tasks.length === 0) {
        this.tasks = generateMockTasks();
        this.saveToStorage();
      }
    },
  },
});
