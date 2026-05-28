<template>
  <div class="watchlist">
    <div
      v-for="item in items"
      :key="item.code"
      :class="['watchlist-item', { active: item.code === selectedCode }]"
      @click="$emit('select', item.code)"
    >
      <div class="item-info">
        <span class="item-name">{{ item.name }}</span>
        <span class="item-code">{{ item.code }}</span>
      </div>
      <div class="item-price">
        <span class="price">{{ item.currentPrice.toFixed(2) }}</span>
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
import type { StockData } from '@/types/stock'
import { Close } from '@element-plus/icons-vue'

defineProps<{
  items: StockData[]
  selectedCode: string
}>()

defineEmits<{
  select: [code: string]
  remove: [code: string]
}>()
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
  padding: 8px 12px;
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
  }

  &.active {
    background: #bae7ff;
    outline: 1px solid #1890ff;
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
