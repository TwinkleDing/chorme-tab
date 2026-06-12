<template>
  <div v-if="stock" class="chart-card" :style="cardStyle">
    <div class="card-drag-handle" @mousedown.prevent="onDragStart($event)">
      <span class="card-name">{{ stock.name }}</span>
      <span class="card-code">{{ stock.code }}</span>
      <span class="card-drag-icon"><el-icon :size="12"><Rank /></el-icon></span>
    </div>
    <div class="card-main">
      <span :class="['card-price', stock.currentPrice > stock.openPrice ? 'up' : 'down']">
        {{ stock.currentPrice.toFixed(3) }}
        <span class="price-arrow">{{ stock.currentPrice >= stock.openPrice ? '↑' : '↓' }}</span>
      </span>
      <span :class="['card-change', parseFloat(stock.priceChangePercent) < 0 ? 'down' : 'up']">
        {{ stock.priceChangePercent }}
      </span>
    </div>
    <div class="card-grid">
      <div class="card-cell">
        <span class="cell-label">开盘</span>
        <span :class="['cell-value', stock.openPrice > stock.previousClose ? 'up' : 'down']">
          {{ stock.openPrice.toFixed(3) }}
          <span class="cell-arrow">{{ stock.openPrice >= stock.previousClose ? '↑' : '↓' }}</span>
        </span>
      </div>
      <div class="card-cell"><span class="cell-label">最高</span><span class="cell-value">{{ stock.dayHigh.toFixed(3) }}</span></div>
      <div class="card-cell"><span class="cell-label">最低</span><span class="cell-value">{{ stock.dayLow.toFixed(3) }}</span></div>
      <div class="card-cell"><span class="cell-label">昨收</span><span class="cell-value">{{ stock.previousClose.toFixed(3) }}</span></div>
      <div class="card-cell"><span class="cell-label">成交量</span><span class="cell-value">{{ fmtVolume(stock.volume) }}</span></div>
      <div class="card-cell"><span class="cell-label">更新</span><span class="cell-value time">{{ fmtUpdateTime(stock.updateTime) }}</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Rank } from '@element-plus/icons-vue'
import type { StockData } from '@/types/stock'

const props = defineProps<{
  stock: StockData | null
  x: number
  y: number
}>()

const cardStyle = computed(() => ({
  left: props.x + 'px',
  top: props.y + 'px',
}))

function fmtUpdateTime(t: string | undefined): string {
  if (!t || t.length < 8) return '--'
  let s = `${t.slice(0, 4)}-${t.slice(4, 6)}-${t.slice(6, 8)}`
  if (t.length >= 14) s += ` ${t.slice(8, 10)}:${t.slice(10, 12)}:${t.slice(12, 14)}`
  return s
}

function fmtVolume(v: number): string {
  return (v / 10000).toFixed(0) + '万'
}

let dragging = false
let startX = 0, startY = 0
let origX = 0, origY = 0

function onDragStart(e: MouseEvent) {
  dragging = true
  startX = e.clientX
  startY = e.clientY
  origX = props.x
  origY = props.y
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', onDragEnd)
}

function onDrag(e: MouseEvent) {
  if (!dragging) return
  // Can't modify props directly, need to emit
}

function onDragEnd() {
  dragging = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', onDragEnd)
}
</script>

<style lang="scss" scoped>
.chart-card {
  position: absolute;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 10px 14px;
  min-width: 220px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  * { pointer-events: none; }
}

.card-drag-handle {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  cursor: grab;
  user-select: none;
  pointer-events: auto !important;
}

.card-drag-handle:active { cursor: grabbing; }

.card-drag-icon {
  margin-left: auto;
  color: #bbb;
  display: flex;
  align-items: center;
}

.card-name { font-size: 15px; font-weight: 700; color: #333; }
.card-code { font-size: 11px; color: #999; }

.card-main {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.card-price {
  font-size: 22px;
  font-weight: 700;
  &.up { color: #e53935; }
  &.down { color: #009944; }
}

.price-arrow { font-size: 14px; margin-left: 2px; }
.cell-arrow { font-size: 11px; margin-left: 2px; }

.card-change {
  font-size: 14px;
  font-weight: 600;
  &.up { color: #e53935; }
  &.down { color: #009944; }
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 4px 8px;
}

.card-cell {
  text-align: left;
}

.cell-label {
  display: block;
  font-size: 10px;
  color: #bbb;
  line-height: 1.4;
}

.cell-value {
  display: block;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.6;

  &.up { color: #e53935; }
  &.down { color: #009944; }

  &.time {
    font-size: 11px;
    font-weight: 400;
    color: #999;
  }
}
</style>
