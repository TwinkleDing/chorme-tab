<template>
  <div class="chart-toolbar">
    <div class="toolbar-group">
      <el-button size="small" :class="{ active: period === 'm5' }" @click="$emit('update:period', 'm5')">5分</el-button>
      <el-button size="small" :class="{ active: period === 'day' }" @click="$emit('update:period', 'day')">日K</el-button>
    </div>
    <div class="toolbar-group">
      <el-button v-for="r in ranges" :key="r" size="small" :class="{ active: days === r }" @click="$emit('update:days', r)">{{ r }}日</el-button>
    </div>
    <div class="toolbar-group toolbar-ma">
      <label v-for="ma in maOptions" :key="ma" :class="{ active: activeMas.includes(ma) }" @click="$emit('toggleMA', ma)">
        MA{{ ma }}
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
const ranges = [60, 120, 240]
const maOptions = [5, 10, 20, 30]

defineProps<{
  period: 'm5' | 'day' | 'week' | 'month'
  days: number
  activeMas: number[]
}>()

defineEmits<{
  'update:period': [p: 'm5' | 'day' | 'week' | 'month']
  'update:days': [d: number]
  toggleMA: [ma: number]
}>()
</script>

<style lang="scss" scoped>
.chart-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-group :deep(.el-button) {
  font-size: 12px;
  padding: 4px 10px;
  min-height: 0;
}

.toolbar-group :deep(.el-button.active) {
  background: #1890ff;
  color: #fff;
  border-color: #1890ff;
}

.toolbar-ma label {
  display: inline-block;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #d9d9d9;
  color: #666;
  transition: all 0.15s;
  user-select: none;
}

.toolbar-ma label.active {
  background: #1890ff;
  color: #fff;
  border-color: #1890ff;
}
</style>
