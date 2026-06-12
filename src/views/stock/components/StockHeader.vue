<template>
  <div class="stock-header">
    <span class="stock-name">{{ name }}</span>
    <span class="stock-code">{{ code }}</span>
    <span :class="['stock-price', changeClass]">{{ price }}</span>
    <span :class="['stock-change', changeClass]">{{ changePercent }}</span>
    <el-button size="small" class="gray-btn" @click="$emit('toggleGray')">
      {{ gray ? '恢复' : '变灰' }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
  code: string
  price: string
  changePercent: string
  gray: boolean
}>()

defineEmits<{ toggleGray: [] }>()

const changeClass = computed(() =>
  parseFloat(props.changePercent) < 0 ? 'down' : 'up'
)
</script>

<style lang="scss" scoped>
.stock-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 12px;
  background: #e6f7ff;
  border-radius: 6px;
  border: 1px solid #91d5ff;
}

.stock-name {
  font-size: 20px;
  font-weight: 700;
  color: #1890ff;
}

.stock-code {
  font-size: 13px;
  color: #999;
}

.stock-price {
  font-size: 24px;
  font-weight: 700;
  margin-left: auto;

  &.up { color: #e53935; }
  &.down { color: #009944; }
}

.stock-change {
  font-size: 16px;
  font-weight: 600;
  min-width: 60px;
  text-align: right;

  &.up { color: #e53935; }
  &.down { color: #009944; }
}

.gray-btn {
  margin-left: 8px;
}
</style>
