/** 任务管理 - 类型定义 */

export type Urgency = "high" | "medium" | "low"

export type Status = "pending" | "in_progress" | "done"

/** 任务项 */
export interface TaskItem {
  id: string
  name: string
  creator: string
  urgency: Urgency
  status: Status
  createdAt: string
}

export const URGENCY_OPTIONS = [
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
] as const

export const STATUS_OPTIONS = [
  { value: "pending", label: "待处理" },
  { value: "in_progress", label: "进行中" },
  { value: "done", label: "已完成" },
] as const
