<template>
  <div class="watchlist">
    <div
      v-for="(item, index) in items"
      :key="item.code"
      :class="['watchlist-item', { active: item.code === selectedCode, 'drag-over': dragOverIndex === index }]"
      draggable="true"
      @dragstart="onDragStart($event, index)"
      @dragover="onDragOver($event, index)"
      @dragleave="onDragLeave"
      @drop="onDrop($event, index)"
      @dragend="onDragEnd"
      @click="$emit('select', item.code)"
    >
      <div
        class="drag-handle"
        @mousedown.stop
      >
        <el-icon size="12"><Rank /></el-icon>
      </div>
      <div class="item-info">
        <span class="item-name">{{ item.name }}</span>
        <span class="item-code">{{ item.code }}</span>
      </div>
      <div class="item-price">
        <span class="price">{{ item.currentPrice.toFixed(3) }}</span>
        <span
          :class="[
            'change',
            parseFloat(item.priceChangePercent) < 0 ? 'down' : 'up'
          ]"
        >
          {{ item.priceChangePercent }}
        </span>
      </div>
      <div class="item-remove" @click.stop="$emit('remove', item.code)">
        <el-icon size="14"><Close /></el-icon>
      </div>
    </div>
    <div v-if="items.length === 0" class="empty-hint">
      暂无自选股，在上方添加
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { StockData } from '@/types/stock'
import { Close, Rank } from '@element-plus/icons-vue'

const props = defineProps<{
  items: StockData[]
  selectedCode: string
}>()

const emit = defineEmits<{
  select: [code: string]
  remove: [code: string]
  reorder: [from: number, to: number]
}>()

const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function onDragStart(e: DragEvent, index: number) {
  dragIndex.value = index
  dragOverIndex.value = null
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }
}

function onDragOver(e: DragEvent, index: number) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  if (index !== dragIndex.value) {
    dragOverIndex.value = index
  }
}

function onDragLeave() {
  dragOverIndex.value = null
}

function onDrop(e: DragEvent, toIndex: number) {
  e.preventDefault()
  if (dragIndex.value !== null && dragIndex.value !== toIndex) {
    emit('reorder', dragIndex.value, toIndex)
  }
  dragIndex.value = null
  dragOverIndex.value = null
}

function onDragEnd() {
  dragIndex.value = null
  dragOverIndex.value = null
}
</script>

<style lang="scss" scoped>
.watchlist {
  flex: 1;
  overflow-y: auto;
  padding: 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #d9d9d9;
    border-radius: 2px;
  }
}

.watchlist-item {
  display: flex;
  align-items: center;
  padding: 8px 8px 8px 4px;
  cursor: pointer;
  border-radius: 6px;
  margin-bottom: 2px;
  transition: all 0.15s;
  position: relative;

  &:hover {
    background: #e6f7ff;

    .item-remove {
      opacity: 1;
    }
    .drag-handle {
      opacity: 1;
    }
  }

  &.active {
    background: #bae7ff;
    outline: 1px solid #1890ff;
  }

  &.drag-over {
    outline: 2px dashed #1890ff;
    outline-offset: -2px;
    background: #e6f7ff;
  }
}

.drag-handle {
  opacity: 0;
  color: #bbb;
  cursor: grab;
  padding: 4px 6px 4px 2px;
  transition: opacity 0.15s;
  flex-shrink: 0;
  user-select: none;

  &:active {
    cursor: grabbing;
  }
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  display: block;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-code {
  display: block;
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.item-price {
  text-align: right;
  margin-right: 8px;
}

.price {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.change {
  display: block;
  font-size: 12px;
  margin-top: 2px;

  &.up {
    color: #666;
  }
  &.down {
    color: #999;
  }
}

.item-remove {
  opacity: 0;
  transition: opacity 0.15s;
  color: #bbb;
  cursor: pointer;

  &:hover {
    color: #f5222d;
  }
}

.empty-hint {
  text-align: center;
  color: #bbb;
  padding: 40px 0;
  font-size: 14px;
}
</style>
