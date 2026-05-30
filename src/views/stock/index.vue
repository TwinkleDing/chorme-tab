<template>
  <div class="stock-page" :class="{ 'page-gray': pageGray }">
    <div class="top-bar">
      <Back />
      <span class="top-title">数据看板</span>
    </div>
    <div class="stock-layout">
      <!-- 侧边栏 -->
      <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <h3>自选股</h3>
          <div class="add-stock">
            <el-input
              v-model="newCode"
              placeholder="输入代码如 sh515080"
              size="small"
              :disabled="adding"
              @keyup.enter="addStock"
            />
            <el-button
              type="primary"
              size="small"
              :loading="adding"
              @click="addStock"
            >
              添加
            </el-button>
          </div>
          <div class="sidebar-close" @click="sidebarCollapsed = true">
            <el-icon :size="14"><DArrowLeft /></el-icon>
          </div>
        </div>
        <Watchlist
          :items="stockStore.watchlistData"
          :selected-code="stockStore.selectedCode"
          @select="onSelectStock"
          @remove="stockStore.removeFromWatchlist"
          @reorder="stockStore.moveWatchlistItem"
        />
      </div>
      <div v-show="sidebarCollapsed" class="sidebar-open" @click="sidebarCollapsed = false">
        <el-icon :size="14"><DArrowRight /></el-icon>
      </div>

      <!-- K线图区域 -->
      <div class="chart-area">
        <!-- 选中股票信息 -->
        <div v-if="stockStore.selectedStockData" class="stock-header">
          <span class="stock-name">{{ stockStore.selectedStockData.name }}</span>
          <span class="stock-code">{{ stockStore.selectedStockData.code }}</span>
          <span
            :class="[
              'stock-price',
              parseFloat(stockStore.selectedStockData.priceChangePercent) < 0 ? 'down' : 'up'
            ]"
          >
            {{ stockStore.selectedStockData.currentPrice.toFixed(2) }}
          </span>
          <span
            :class="[
              'stock-change',
              parseFloat(stockStore.selectedStockData.priceChangePercent) < 0 ? 'down' : 'up'
            ]"
          >
            {{ stockStore.selectedStockData.priceChangePercent }}
          </span>
          <el-button size="small" @click="pageGray = !pageGray" class="gray-btn">
            {{ pageGray ? '恢复' : '变灰' }}
          </el-button>
        </div>

        <!-- K线图 -->
        <div class="chart-wrapper">
          <!-- K线图工具栏 -->
          <div class="chart-toolbar">
            <div class="toolbar-group">
              <el-button
                size="small"
                :class="{ active: chartPeriod === 'm5' }"
                @click="switchPeriod('m5')"
              >5分</el-button>
              <el-button
                size="small"
                :class="{ active: chartPeriod === 'day' }"
                @click="switchPeriod('day')"
              >日K</el-button>
            </div>
            <div class="toolbar-group">
              <el-button
                v-for="r in ranges"
                :key="r"
                size="small"
                :class="{ active: chartDays === r }"
                @click="switchRange(r)"
              >{{ r }}日</el-button>
            </div>
            <div class="toolbar-group toolbar-ma">
              <label
                v-for="ma in maOptions"
                :key="ma"
                :class="{ active: activeMas.includes(ma) }"
                @click="toggleMA(ma)"
              >
                MA{{ ma }}
              </label>
            </div>
          </div>
          <!-- 实时数据浮层卡片（可拖拽） -->
          <div v-if="stockStore.selectedCode" class="chart-card" :style="cardStyle">
            <div
              class="card-drag-handle"
              @mousedown.prevent="onCardDragStart($event)"
            >
              <span class="card-name">{{ stockStore.realtimeData[stockStore.selectedCode]?.name || stockStore.selectedCode }}</span>
              <span class="card-code">{{ stockStore.selectedCode }}</span>
              <span class="card-drag-icon"><el-icon size="12"><Rank /></el-icon></span>
            </div>
            <div class="card-main">
              <span
                :class="[
                  'card-price',
                  stockStore.realtimeData[stockStore.selectedCode]?.currentPrice > stockStore.realtimeData[stockStore.selectedCode]?.openPrice ? 'up' : 'down'
                ]"
              >
                {{ stockStore.realtimeData[stockStore.selectedCode]?.currentPrice?.toFixed(3) ?? '-' }}
                <span
                  v-if="stockStore.realtimeData[stockStore.selectedCode]"
                  :class="stockStore.realtimeData[stockStore.selectedCode].currentPrice > stockStore.realtimeData[stockStore.selectedCode].openPrice ? 'arrow-up' : 'arrow-down'"
                  class="price-arrow"
                >
                  {{ stockStore.realtimeData[stockStore.selectedCode].currentPrice >= stockStore.realtimeData[stockStore.selectedCode].openPrice ? '↑' : '↓' }}
                </span>
              </span>
              <span
                :class="['card-change', stockStore.realtimeData[stockStore.selectedCode] && parseFloat(stockStore.realtimeData[stockStore.selectedCode].priceChangePercent) < 0 ? 'down' : 'up']"
              >
                {{ stockStore.realtimeData[stockStore.selectedCode]?.priceChangePercent ?? '--' }}
              </span>
            </div>
            <div class="card-grid">
              <div class="card-cell">
                <span class="cell-label">开盘</span>
                <span
                  :class="[
                    'cell-value',
                    stockStore.realtimeData[stockStore.selectedCode]?.openPrice > stockStore.realtimeData[stockStore.selectedCode]?.previousClose ? 'up' : 'down'
                  ]"
                >
                  {{ stockStore.realtimeData[stockStore.selectedCode]?.openPrice?.toFixed(3) ?? '-' }}
                  <span
                    v-if="stockStore.realtimeData[stockStore.selectedCode]"
                    :class="stockStore.realtimeData[stockStore.selectedCode].openPrice > stockStore.realtimeData[stockStore.selectedCode].previousClose ? 'arrow-up' : 'arrow-down'"
                    class="cell-arrow"
                  >
                    {{ stockStore.realtimeData[stockStore.selectedCode].openPrice >= stockStore.realtimeData[stockStore.selectedCode].previousClose ? '↑' : '↓' }}
                  </span>
                </span>
              </div>
              <div class="card-cell">
                <span class="cell-label">最高</span>
                <span class="cell-value">{{ stockStore.realtimeData[stockStore.selectedCode]?.dayHigh?.toFixed(3) ?? '-' }}</span>
              </div>
              <div class="card-cell">
                <span class="cell-label">最低</span>
                <span class="cell-value">{{ stockStore.realtimeData[stockStore.selectedCode]?.dayLow?.toFixed(3) ?? '-' }}</span>
              </div>
              <div class="card-cell">
                <span class="cell-label">昨收</span>
                <span class="cell-value">{{ stockStore.realtimeData[stockStore.selectedCode]?.previousClose?.toFixed(3) ?? '-' }}</span>
              </div>
              <div class="card-cell">
                <span class="cell-label">成交量</span>
                <span class="cell-value">{{ stockStore.realtimeData[stockStore.selectedCode] ? (stockStore.realtimeData[stockStore.selectedCode].volume / 10000).toFixed(0) + '万' : '-' }}</span>
              </div>
              <div class="card-cell">
                <span class="cell-label">更新</span>
                <span class="cell-value time">{{ fmtUpdateTime(stockStore.realtimeData[stockStore.selectedCode]?.updateTime) }}</span>
              </div>
            </div>
          </div>
          <CandlestickChart
            v-if="stockStore.klineData.length > 0"
            :data="stockStore.klineData"
            :show-volume="true"
            :mas="activeMas"
          />
          <div v-else-if="stockStore.selectedCode" class="chart-placeholder">
            {{ klineLoading ? '加载K线数据中...' : '暂无K线数据' }}
          </div>
          <div v-else class="chart-placeholder">
            请从左侧自选列表中选择一只股票
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Back from '@/components/Back.vue'
import Watchlist from '@/components/Watchlist.vue'
import CandlestickChart from '@/components/CandlestickChart.vue'
import useStockStore from '@/store/stock'
import { useKlineData } from '@/hooks/useKlineData'
import { getStorage, setStorage } from '@/utils'
import { Rank, DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
import type { StockData } from '@/types/stock'

const stockStore = useStockStore()
const { fetchKline, loading: klineLoading } = useKlineData()

const newCode = ref('')
const adding = ref(false)
const sidebarCollapsed = ref(false)
const pageGray = ref(getStorage('pageGray') === 'true')
watch(pageGray, (v) => setStorage('pageGray', v ? 'true' : 'false'))

// K线图控制
const ranges = [60, 120, 240]
const chartPeriod = ref<'m5' | 'day' | 'week' | 'month'>('day')
const chartDays = ref(120)
const maOptions = [5, 10, 20, 30]
const activeMas = ref<number[]>([5, 10, 20])

function toggleMA(ma: number) {
  const idx = activeMas.value.indexOf(ma)
  if (idx >= 0) {
    activeMas.value.splice(idx, 1)
  } else {
    activeMas.value.push(ma)
    activeMas.value.sort((a, b) => a - b)
  }
}

async function switchRange(days: number) {
  chartDays.value = days
  await reloadChart()
}

async function switchPeriod(period: 'm5' | 'day' | 'week' | 'month') {
  chartPeriod.value = period
  await reloadChart()
}

async function reloadChart() {
  if (!stockStore.selectedCode) return
  const data = await fetchKline(stockStore.selectedCode, chartPeriod.value, chartDays.value)
  stockStore.setKlineData(data)
}

// 实时数据卡片拖拽
const cardX = ref(12)
const cardY = ref(42)
let cardDragging = false
let cardDragStartX = 0
let cardDragStartY = 0
let cardDragOrigX = 0
let cardDragOrigY = 0

const cardStyle = computed(() => ({
  left: cardX.value + 'px',
  top: cardY.value + 'px',
}))

function onCardDragStart(e: MouseEvent) {
  cardDragging = true
  cardDragStartX = e.clientX
  cardDragStartY = e.clientY
  cardDragOrigX = cardX.value
  cardDragOrigY = cardY.value
  document.addEventListener('mousemove', onCardDragMove)
  document.addEventListener('mouseup', onCardDragEnd)
}

function onCardDragMove(e: MouseEvent) {
  if (!cardDragging) return
  cardX.value = cardDragOrigX + (e.clientX - cardDragStartX)
  cardY.value = cardDragOrigY + (e.clientY - cardDragStartY)
}

function onCardDragEnd() {
  cardDragging = false
  document.removeEventListener('mousemove', onCardDragMove)
  document.removeEventListener('mouseup', onCardDragEnd)
}

let pollTimer: number | null = null

/** 解析GTAPI返回的GBK数据 */
function parseGtapiResponse(buffer: ArrayBuffer): StockData[] {
  const decoder = new TextDecoder('gbk')
  const text = decoder.decode(buffer)
  const result: StockData[] = []

  // 提取 v_sh515080="..." 中的完整代码和字段数据
  const regex = /v_(\w+)="([^"]+)"/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    const fullCode = match[1] // "sh515080" 带市场前缀
    const params = match[2].split('~')
    if (params.length < 35) continue

    const stock: StockData = {
      name: params[1],
      code: fullCode,
      currentPrice: parseFloat(params[3]),
      previousClose: parseFloat(params[4]),
      openPrice: parseFloat(params[5]),
      priceChange: parseFloat(params[31]),
      priceChangePercent: `${parseFloat(params[32])}%`,
      dayLow: parseFloat(params[34]),
      dayHigh: parseFloat(params[33]),
      current: parseFloat(params[3]),
      volume: parseInt(params[6], 10) || 0,
      updateTime: params[30],
    }
    if (stock.name) result.push(stock)
  }

  return result
}

/** 格式化 updateTime "YYYYMMDDHHmmss" → "YYYY-MM-DD HH:mm:ss" */
function fmtUpdateTime(t: string | undefined): string {
  if (!t || t.length < 8) return '--'
  let s = `${t.slice(0,4)}-${t.slice(4,6)}-${t.slice(6,8)}`
  if (t.length >= 14) s += ` ${t.slice(8,10)}:${t.slice(10,12)}:${t.slice(12,14)}`
  return s
}

/** 当前时间是否在 9:00-15:00 的交易时段内 */
function isTradingTime(): boolean {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  const time = h * 100 + m
  return time >= 900 && time < 1500
}

/** 获取多只股票实时行情 */
async function fetchRealtimeData() {
  if (stockStore.watchlist.length === 0) return

  const codes = stockStore.watchlist.join(',')
  try {
    const response = await fetch(`http://qt.gtimg.cn/q=${codes}`)
    if (!response.ok) throw new Error('网络请求失败')

    const buffer = await response.arrayBuffer()
    const stockList = parseGtapiResponse(buffer)

    const dataMap: Record<string, StockData> = {}
    stockList.forEach((stock) => {
      dataMap[stock.code] = stock
    })
    stockStore.updateRealtimeData(dataMap)
  } catch (e) {
    console.error('获取实时数据失败:', e)
  }
}

/** 添加自选股 */
async function addStock() {
  const code = newCode.value.trim()
  if (!code) return

  adding.value = true
  stockStore.addToWatchlist(code)
  newCode.value = ''

  // 立即获取一次数据
  await fetchRealtimeData()

  // 如果尚未选中股票，自动选中新添加的
  if (!stockStore.selectedCode) {
    stockStore.selectStock(code)
  }
  adding.value = false
}

/** 选中股票 - 加载K线 */
async function onSelectStock(code: string) {
  stockStore.selectStock(code)
  const data = await fetchKline(code, chartPeriod.value, chartDays.value)
  stockStore.setKlineData(data)
}

let watchStop: (() => void) | null = null

onMounted(() => {
  // 立即获取一次实时行情
  fetchRealtimeData()

  // 交易时段内定时轮询
  if (isTradingTime()) {
    pollTimer = window.setInterval(fetchRealtimeData, 1000)
  }

  // 如果有自选股且未选中，默认选中第一个
  if (!stockStore.selectedCode && stockStore.watchlist.length > 0) {
    onSelectStock(stockStore.watchlist[0])
  }

  // 监听选中股票变化，自动加载K线
  watchStop = watch(
    () => stockStore.selectedCode,
    (newCode) => {
      if (newCode) {
        fetchKline(newCode, chartPeriod.value, chartDays.value).then((data) => {
          stockStore.setKlineData(data)
        })
      }
    }
  )
})

onUnmounted(() => {
  if (pollTimer !== null) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  if (watchStop) {
    watchStop()
    watchStop = null
  }
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
  color: #1890ff;
  font-size: 14px;
  flex-shrink: 0;

  .top-title {
    color: #333;
    font-size: 16px;
    font-weight: 600;
  }

  .top-bar > :first-child {
    &:hover {
      color: #40a9ff;
    }
  }
}

.stock-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 320px;
  min-width: 320px;
  background: #fff;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e8e8e8;
  overflow: hidden;
  transition: width 0.25s, min-width 0.25s, padding 0.25s;
}
.sidebar.collapsed {
  width: 0;
  min-width: 0;
  padding: 0;
  border-right: none;
}
.sidebar.collapsed .sidebar-header,
.sidebar.collapsed .watchlist {
  display: none;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
  position: relative;

  h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #1890ff;
  }
}

.sidebar-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  color: #999;
  transition: all 0.15s;
}
.sidebar-close:hover {
  background: #f0f0f0;
  color: #333;
}

.sidebar-open {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-left: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  color: #999;
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 8px;
  transition: all 0.15s;
}
.sidebar-open:hover {
  background: #e6f7ff;
  color: #1890ff;
}

.add-stock {
  display: flex;
  gap: 8px;
}

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
.toolbar-group .el-button {
  font-size: 12px;
  padding: 4px 10px;
  min-height: 0;
}
.toolbar-group .el-button.active {
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

.chart-wrapper {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chart-card {
  position: absolute;
  z-index: 10;
  background: rgba(255,255,255,0.95);
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 10px 14px;
  min-width: 220px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.chart-card * {
  pointer-events: none;
}

.card-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
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
.card-drag-handle:active {
  cursor: grabbing;
}
.card-drag-icon {
  margin-left: auto;
  color: #bbb;
  display: flex;
  align-items: center;
}

.card-name {
  font-size: 15px;
  font-weight: 700;
  color: #333;
}

.card-code {
  font-size: 11px;
  color: #999;
}

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

.price-arrow {
  font-size: 14px;
  margin-left: 2px;
}

.cell-arrow {
  font-size: 11px;
  margin-left: 2px;
}

.arrow-up { color: #e53935; }
.arrow-down { color: #009944; }

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

.card-cell .cell-label {
  display: block;
  font-size: 10px;
  color: #bbb;
  line-height: 1.4;
}

.card-cell .cell-value {
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

.stock-page.page-gray {
  filter: grayscale(1);
}

.chart-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #bbb;
  font-size: 15px;
}

</style>
