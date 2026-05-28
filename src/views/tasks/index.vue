<template>
  <div class="task-page">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <span class="top-title">任务管理</span>
      <el-button type="primary" size="small" @click="openAddDialog">
        新增任务
      </el-button>
    </div>

    <div class="task-container">
      <!-- 筛选区 -->
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">紧急程度</span>
          <el-select
            v-model="taskStore.filterUrgency"
            placeholder="全部"
            size="small"
            style="width: 140px"
            @change="taskStore.setFilterUrgency(taskStore.filterUrgency)"
          >
            <el-option label="全部" value="all" />
            <el-option
              v-for="opt in URGENCY_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">任务状态</span>
          <el-select
            v-model="taskStore.filterStatus"
            placeholder="全部"
            size="small"
            style="width: 140px"
            @change="taskStore.setFilterStatus(taskStore.filterStatus)"
          >
            <el-option label="全部" value="all" />
            <el-option
              v-for="opt in STATUS_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>
        <el-button
          v-if="taskStore.filterUrgency !== 'all' || taskStore.filterStatus !== 'all'"
          size="small"
          @click="resetFilters"
        >
          重置筛选
        </el-button>
      </div>

      <!-- 任务列表 -->
      <el-table
        :data="taskStore.pagedTasks"
        stripe
        style="width: 100%"
        height="calc(100vh - 280px)"
        @row-dblclick="(row: TaskItem) => openEditDialog(row)"
      >
        <el-table-column prop="name" label="任务名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="creator" label="创建人" width="100" />
        <el-table-column label="紧急程度" width="120">
          <template #default="{ row }: { row: TaskItem }">
            <el-tag
              :type="urgencyTagType(row.urgency)"
              size="small"
              effect="dark"
            >
              {{ urgencyLabel(row.urgency) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="任务状态" width="120">
          <template #default="{ row }: { row: TaskItem }">
            <el-tag
              :type="statusTagType(row.status)"
              size="small"
              effect="plain"
            >
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }: { row: TaskItem }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }: { row: TaskItem }">
            <el-button link type="primary" size="small" @click="openEditDialog(row)">
              编辑
            </el-button>
            <el-popconfirm
              title="确认删除该任务？"
              confirm-button-text="删除"
              cancel-button-text="取消"
              @confirm="handleDelete(row.id)"
            >
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
        <!-- 空状态 -->
        <template #empty>
          <div class="empty-hint">
            <template v-if="taskStore.filterUrgency !== 'all' || taskStore.filterStatus !== 'all'">
              没有匹配的任务
              <el-button link type="primary" @click="resetFilters">重置筛选</el-button>
            </template>
            <template v-else>
              暂无任务数据，点击"新增任务"添加
            </template>
          </div>
        </template>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="taskStore.currentPage"
          :page-size="taskStore.pageSize"
          :total="taskStore.totalFiltered"
          layout="total, prev, pager, next"
          small
          @current-change="taskStore.setPage"
        />
      </div>
    </div>

    <!-- 新增/编辑 Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑任务' : '新增任务'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="90px"
        label-position="left"
      >
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入任务名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="创建人" prop="creator">
          <el-input v-model="formData.creator" placeholder="请输入创建人" maxlength="20" />
        </el-form-item>
        <el-form-item label="紧急程度" prop="urgency">
          <el-select v-model="formData.urgency" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="opt in URGENCY_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="任务状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="opt in STATUS_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import useTaskStore from "@/store/task";
import type { TaskItem, Urgency, Status } from "@/types/task";
import { URGENCY_OPTIONS, STATUS_OPTIONS } from "@/types/task";

const taskStore = useTaskStore();

// ---- 可编辑任务表单数据类型 ----
interface TaskForm {
  name: string;
  creator: string;
  urgency: Urgency | "";
  status: Status | "";
}

// ---- Dialog 状态 ----
const dialogVisible = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);
const submitting = ref(false);
const formRef = ref<any>(null);

const formData = reactive<TaskForm>({
  name: "",
  creator: "",
  urgency: "",
  status: "",
});

const formRules = {
  name: [
    { required: true, message: "请输入任务名称", trigger: "blur" },
    { max: 50, message: "任务名称不能超过50个字符", trigger: "blur" },
  ],
  creator: [
    { required: true, message: "请输入创建人", trigger: "blur" },
    { max: 20, message: "创建人不能超过20个字符", trigger: "blur" },
  ],
  urgency: [{ required: true, message: "请选择紧急程度", trigger: "change" }],
  status: [{ required: true, message: "请选择任务状态", trigger: "change" }],
};

// ---- 标签辅助函数 ----
function urgencyTagType(urgency: Urgency): "danger" | "warning" | "success" {
  const map: Record<Urgency, "danger" | "warning" | "success"> = {
    high: "danger",
    medium: "warning",
    low: "success",
  };
  return map[urgency];
}

function statusTagType(status: Status): "info" | "primary" | "success" {
  const map: Record<Status, "info" | "primary" | "success"> = {
    pending: "info",
    in_progress: "primary",
    done: "success",
  };
  return map[status];
}

function urgencyLabel(urgency: Urgency): string {
  const map: Record<Urgency, string> = { high: "高", medium: "中", low: "低" };
  return map[urgency];
}

function statusLabel(status: Status): string {
  const map: Record<Status, string> = {
    pending: "待处理",
    in_progress: "进行中",
    done: "已完成",
  };
  return map[status];
}

function formatTime(iso: string): string {
  if (!iso) return "--";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ---- 重置表单 ----
function resetForm() {
  formData.name = "";
  formData.creator = "";
  formData.urgency = "";
  formData.status = "";
  editingId.value = null;
  isEditing.value = false;
}

// ---- 打开新增 Dialog ----
function openAddDialog() {
  resetForm();
  isEditing.value = false;
  dialogVisible.value = true;
}

// ---- 打开编辑 Dialog ----
function openEditDialog(row: TaskItem) {
  resetForm();
  isEditing.value = true;
  editingId.value = row.id;
  formData.name = row.name;
  formData.creator = row.creator;
  formData.urgency = row.urgency;
  formData.status = row.status;
  dialogVisible.value = true;
}

// ---- 提交表单 ----
async function handleSubmit() {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch {
    return;
  }

  submitting.value = true;
  try {
    const data = {
      name: formData.name.trim(),
      creator: formData.creator.trim(),
      urgency: formData.urgency as Urgency,
      status: formData.status as Status,
    };

    if (isEditing.value && editingId.value) {
      taskStore.updateTask(editingId.value, data);
    } else {
      taskStore.addTask(data);
    }

    dialogVisible.value = false;
  } finally {
    submitting.value = false;
  }
}

// ---- 删除 ----
function handleDelete(id: string) {
  taskStore.deleteTask(id);
}

// ---- 重置筛选 ----
function resetFilters() {
  taskStore.setFilterUrgency("all");
  taskStore.setFilterStatus("all");
}

// ---- 生命周期 ----
onMounted(() => {
  taskStore.initMockData();
});
</script>

<style lang="scss" scoped>
.task-page {
  width: 100vw;
  height: 100vh;
  background: #f0f2f5;
  color: #333;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;

  .top-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
}

.task-container {
  flex: 1;
  margin: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  flex-shrink: 0;
}

.empty-hint {
  padding: 40px 0;
  font-size: 14px;
  color: #bbb;
}
</style>
