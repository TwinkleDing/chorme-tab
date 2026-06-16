<template>
  <div class="stock-ticker">
    <div v-for="(stock) in stockList" :key="stock.code" class="stock-row">
      <span class="stock-name">{{ stock.name }}</span>
      <span class="stock-price">{{ stock.previousClose }}</span>
      <span :class="stock.openPrice < stock.previousClose ? 'down' : 'up'"> ▲</span>
      <span class="stock-price">{{ stock.openPrice }}</span>
      <span :class="stock.current < stock.openPrice ? 'down' : 'up'">
        {{ stock.current < stock.openPrice ? '▼' : '▲' }}
      </span>
      <span class="stock-price">{{ stock.current }}</span>
      <span :class="[parseFloat(stock.priceChangePercent) < 0 ? 'down' : 'up', 'change-percent']">
        {{ stock.priceChangePercent }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { StockData } from '@/types/stock'

const props = defineProps<{
  data: Record<string, StockData>
  codes: string[]
}>()

const stockList = computed(() =>
  props.codes.map((c) => props.data[c]).filter(Boolean)
)
</script>

<style lang="scss" scoped>
.stock-row {
  display: flex;
  align-items: center;
  height: 32px;
  line-height: 32px;
  margin-bottom: 8px;
}

.stock-name {
  width: 110px;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stock-price {
  width: 40px;
  display: inline-block;
}

.up { color: #e53935; }
.down { color: #009944; }

.change-percent {
  margin-left: 5px;
}
</style>
