<template>
  <div ref="chartContainer" class="chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts'
import type { IChartApi, ISeriesApi } from 'lightweight-charts'
import type { KlineItem } from '@/types/stock'

const props = defineProps<{
  data: KlineItem[]
}>()

const chartContainer = ref<HTMLDivElement>()
let chart: IChartApi | null = null
let series: ISeriesApi<'Candlestick'> | null = null

function initChart() {
  if (!chartContainer.value) return

  const container = chartContainer.value

  chart = createChart(container, {
    layout: {
      background: { type: ColorType.Solid, color: '#ffffff' },
      textColor: '#666',
    },
    grid: {
      vertLines: { color: '#f0f0f0' },
      horzLines: { color: '#f0f0f0' },
    },
    width: container.clientWidth,
    height: container.clientHeight,
    crosshair: {
      mode: 0,
    },
    timeScale: {
      borderColor: '#e8e8e8',
    },
    rightPriceScale: {
      borderColor: '#e8e8e8',
    },
  })

  series = chart.addSeries(CandlestickSeries, {
    upColor: '#666',
    downColor: '#bbb',
    borderUpColor: '#666',
    borderDownColor: '#bbb',
    wickUpColor: '#666',
    wickDownColor: '#bbb',
  })

  if (props.data.length > 0) {
    series.setData(props.data)
    chart.timeScale().fitContent()
  }

  // 自适应容器大小
  const observer = new ResizeObserver(() => {
    if (chart && container) {
      chart.applyOptions({
        width: container.clientWidth,
        height: container.clientHeight,
      })
    }
  })
  observer.observe(container)
  // 将 observer 存到 container 上以便销毁
  ;(container as any).__resizeObserver = observer
}

watch(
  () => props.data,
  (newData) => {
    if (series && newData.length > 0) {
      series.setData(newData)
      chart?.timeScale().fitContent()
    }
  },
  { deep: true }
)

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (chart) {
    chart.remove()
    chart = null
    series = null
  }
  if (chartContainer.value) {
    const observer = (chartContainer.value as any).__resizeObserver
    if (observer) observer.disconnect()
  }
})
</script>

<style lang="scss" scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
</style>
