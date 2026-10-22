<template>
  <div class="stock-page" :class="{ 'page-gray': pageGray }">
    <div class="top-bar">
      <BackButton />
      <span class="top-title">数据看板</span>
    </div>
    <div class="stock-layout">
      <!-- 侧边栏 -->
      <div class="sidebar" :class="{ collapsed }">
        <div class="sidebar-header">
          <h3>自选股</h3>
          <div class="add-stock">
            <el-input v-model="newCode" placeholder="输入代码如 sh515080" size="small" :disabled="adding" @keyup.enter="addStock" />
            <el-button type="primary" size="small" :loading="adding" @click="addStock">添加</el-button>
          </div>
          <div class="sidebar-close" @click="collapsed = true"><el-icon :size="14"><DArrowLeft /></el-icon></div>
        </div>
        <Watchlist
          :items="stockStore.watchlistData"
          :selected-code="stockStore.selectedCode"
          @select="onSelectStock"
          @remove="stockStore.removeFromWatchlist"
          @reorder="stockStore.moveWatchlistItem"
        />
      </div>
      <div v-show="collapsed" class="sidebar-open" @click="collapsed = false"><el-icon :size="14"><DArrowRight /></el-icon></div>

      <!-- 图表区域 -->
      <div class="chart-area">
        <StockHeader
          v-if="stockStore.selectedStockData"
          :name="stockStore.selectedStockData.name"
          :code="stockStore.selectedStockData.code"
          :price="stockStore.selectedStockData.currentPrice.toFixed(2)"
          :change-percent="stockStore.selectedStockData.priceChangePercent"
          :gray="pageGray"
          @toggle-gray="pageGray = !pageGray"
        />

        <div class="chart-wrapper">
          <ChartToolbar
            :period="chartPeriod"
            :days="chartDays"
            :active-mas="activeMas"
            @update:period="switchPeriod"
            @update:days="switchRange"
            @toggle-ma="toggleMA"
          />

          <RealtimeCard
            v-if="stockStore.selectedCode"
            :stock="stockStore.realtimeData[stockStore.selectedCode] ?? null"
            :x="cardX"
            :y="cardY"
          />

          <CandlestickChart
            v-if="stockStore.klineData.length > 0"
            :data="stockStore.klineData"
            :show-volume="true"
            :mas="activeMas"
          />
          <div v-else-if="stockStore.selectedCode" class="chart-placeholder">
            {{ stockStore.klineLoading ? '加载K线数据中...' : klineError || '暂无K线数据' }}
          </div>
          <div v-else class="chart-placeholder">请从左侧自选列表中选择一只股票</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { setStorage, getStorage } from '@/utils/storage'
import { DArrowLeft, DArrowRight } from '@element-plus/icons-vue'

import BackButton from '@/components/shared/BackButton.vue'
import Watchlist from '@/components/Watchlist.vue'
import CandlestickChart from '@/components/CandlestickChart.vue'
import StockHeader from './components/StockHeader.vue'
import ChartToolbar from './components/ChartToolbar.vue'
import RealtimeCard from './components/RealtimeCard.vue'

import useStockStore from '@/stores/stock'
import { useKlineData } from '@/composables/useKlineData'
import { useStockRealtime } from '@/composables/useStockRealtime'

const stockStore = useStockStore()
const { fetchKline, error: klineError } = useKlineData()
const { data: rtData, startPolling, stopPolling } = useStockRealtime()

// 实时数据同步到 store（data 每轮整体替换，无需 deep）
watch(rtData, (newData) => {
  stockStore.updateRealtimeData(newData)
})

const newCode = ref('')
const adding = ref(false)
const collapsed = ref(false)
const pageGray = ref(getStorage('pageGray') === 'true')
watch(pageGray, (v) => setStorage('pageGray', v ? 'true' : 'false'))

const chartPeriod = ref<'m5' | 'day' | 'week' | 'month'>('day')
const chartDays = ref(120)
const activeMas = ref<number[]>([5, 10, 20])

const cardX = ref(12)
const cardY = ref(42)

function toggleMA(ma: number) {
  // 替换数组而非原地修改，让子组件的 watch 无需 deep 即可感知
  activeMas.value = activeMas.value.includes(ma)
    ? activeMas.value.filter((m) => m !== ma)
    : [...activeMas.value, ma].sort((a, b) => a - b)
}

function switchRange(days: number) {
  chartDays.value = days
}

function switchPeriod(period: 'm5' | 'day' | 'week' | 'month') {
  chartPeriod.value = period
}

// 股票、周期、范围共用一个请求入口；失效请求不能覆盖当前图表。
watch(
  [() => stockStore.selectedCode, chartPeriod, chartDays],
  async ([code, period, days], _previous, onCleanup) => {
    const controller = new AbortController()
    let active = true
    onCleanup(() => { active = false; controller.abort() })
    stockStore.setKlineData([])
    stockStore.setKlineLoading(Boolean(code))
    if (!code) return
    const data = await fetchKline(code, period, days, controller.signal)
    if (active) {
      stockStore.setKlineData(data)
      stockStore.setKlineLoading(false)
    }
  },
  { immediate: true }
)

async function addStock() {
  const code = newCode.value.trim()
  if (!code) return
  adding.value = true
  stockStore.addToWatchlist(code)
  newCode.value = ''
  if (!stockStore.selectedCode) stockStore.selectStock(code)
  adding.value = false
}

async function onSelectStock(code: string) {
  stockStore.selectStock(code)
}

let watchStop: (() => void) | null = null

onMounted(() => {
  watchStop = watch(
    () => [...stockStore.watchlist],
    codes => startPolling(codes, 1000),
    { immediate: true }
  )
  if (!stockStore.selectedCode && stockStore.watchlist.length > 0) {
    onSelectStock(stockStore.watchlist[0])
  }
})

onUnmounted(() => {
  stopPolling()
  if (watchStop) { watchStop(); watchStop = null }
})
</script>

<style lang="scss" scoped>
.stock-page {
  width: 100vw;
  height: 100vh;
  background: #f0f2f5;
  color: #333;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.top-bar {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  gap: 12px;
  font-size: 14px;
  flex-shrink: 0;

  .top-title { color: #333; font-size: 16px; font-weight: 600; }
}

.stock-layout { display: flex; flex: 1; overflow: hidden; }

.sidebar {
  width: 320px;
  min-width: 320px;
  background: #fff;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e8e8e8;
  overflow: hidden;
  transition: width 0.25s, min-width 0.25s, padding 0.25s;

  &.collapsed { width: 0; min-width: 0; padding: 0; border-right: none; }
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
  position: relative;

  h3 { margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1890ff; }
}

.sidebar-close {
  position: absolute;
  top: 8px; right: 8px;
  width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 4px; cursor: pointer; color: #999;

  &:hover { background: #f0f0f0; color: #333; }
}

.sidebar-open {
  width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center;
  background: #f5f5f5; border: 1px solid #e8e8e8; border-left: none;
  border-radius: 0 4px 4px 0; cursor: pointer; color: #999;
  flex-shrink: 0; align-self: flex-start; margin-top: 8px;

  &:hover { background: #e6f7ff; color: #1890ff; }
}

.add-stock { display: flex; gap: 8px; }

.chart-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  min-width: 0;
  background: #fff;
  margin: 8px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.chart-wrapper {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.stock-page.page-gray { filter: grayscale(1); }

.chart-placeholder {
  display: flex; align-items: center; justify-content: center;
  height: 100%; color: #bbb; font-size: 15px;
}
</style>
