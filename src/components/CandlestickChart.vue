<template>
  <div class="chart-wrapper" ref="chartWrapper">
    <div ref="chartContainer" class="chart-container" :class="{ 'is-gray': grayscale }"></div>
    <div v-show="tooltip.visible" class="chart-tooltip" :style="tooltip.style">
      <div class="tooltip-time">{{ tooltip.time }}</div>
      <div class="tooltip-row">开 <b>{{ tooltip.open }}</b></div>
      <div class="tooltip-row">高 <b>{{ tooltip.high }}</b></div>
      <div class="tooltip-row">低 <b>{{ tooltip.low }}</b></div>
      <div class="tooltip-row">收 <b>{{ tooltip.close }}</b></div>
      <div class="tooltip-row">幅 <b :class="tooltip.change.startsWith('-') ? 'down' : 'up'">{{ tooltip.change }}</b></div>
      <div class="tooltip-row" v-if="tooltip.volume !== undefined">量 <b>{{ tooltip.volume }}</b></div>
      <div class="tooltip-row" v-if="tooltip.maValues.length">MA <b>{{ tooltip.maValues.join('  ') }}</b></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import {
  createChart, ColorType, CandlestickSeries, LineSeries, HistogramSeries
} from 'lightweight-charts'
import type { IChartApi, ISeriesApi } from 'lightweight-charts'
import type { KlineItem } from '@/types/stock'

const props = defineProps<{
  data: KlineItem[]
  grayscale?: boolean
  chartType?: 'candlestick' | 'line'
  showVolume?: boolean
  mas?: number[]   // eg. [5, 10, 20, 30]
}>()

const chartContainer = ref<HTMLDivElement>()
const chartWrapper = ref<HTMLDivElement>()
let chart: IChartApi | null = null
let mainSeries: ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | null = null
let volumeSeries: ISeriesApi<'Histogram'> | null = null
let maSeries: ISeriesApi<'Line'>[] = []

const tooltip = ref({
  visible: false,
  style: {} as Record<string, string>,
  time: '',
  open: '',
  high: '',
  low: '',
  close: '',
  change: '',
  volume: undefined as string | undefined,
  maValues: [] as string[],
})

const MA_COLORS = ['#f59e0b', '#8b5cf6', '#06b6d4', '#f97316']

function calcMA(data: KlineItem[], period: number): (KlineItem & { value: number })[] {
  const result: (KlineItem & { value: number })[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push({ ...data[i], value: 0 })
      continue
    }
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close
    }
    result.push({ ...data[i], value: sum / period })
  }
  return result
}

function formatVolume(v: number): string {
  if (v >= 1e8) return (v / 1e8).toFixed(2) + '亿'
  if (v >= 10000) return (v / 10000).toFixed(1) + '万'
  return v.toFixed(0)
}

function buildChart() {
  if (!chartContainer.value || !chart) return

  const container = chartContainer.value

  // 移除旧 series
  if (mainSeries) { chart.removeSeries(mainSeries); mainSeries = null }
  if (volumeSeries) { chart.removeSeries(volumeSeries); volumeSeries = null }
  maSeries.forEach(s => chart!.removeSeries(s))
  maSeries = []

  // 主图 series
  if (props.chartType === 'line') {
    mainSeries = chart.addSeries(LineSeries, {
      color: '#e53935',
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: 3,
        minMove: 0.001,
      },
      lastValueVisible: false,
      priceLineVisible: false,
    })
  } else {
    mainSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#e53935',
      downColor: '#009944',
      borderUpColor: '#e53935',
      borderDownColor: '#009944',
      wickUpColor: '#e53935',
      wickDownColor: '#009944',
      priceFormat: {
        type: 'price',
        precision: 3,
        minMove: 0.001,
      },
      lastValueVisible: false,
      priceLineVisible: false,
    })
  }

  if (props.data.length > 0) {
    mainSeries.setData(props.data as any)
  }

  // 成交量
  if (props.showVolume) {
    volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
      color: '#26a69a',
    })
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    })
    if (props.data.length > 0) {
      const volData = props.data.map(d => ({
        time: d.time,
        value: d.volume ?? 0,
        color: d.close >= d.open ? '#e5393580' : '#00994480',
      }))
      volumeSeries.setData(volData as any)
    }
  }

  // MA 线
  if (props.mas && props.mas.length > 0 && props.data.length > 0) {
    props.mas.forEach((period, idx) => {
      const maData = calcMA(props.data, period)
      const line = chart!.addSeries(LineSeries, {
        color: MA_COLORS[idx % MA_COLORS.length],
        lineWidth: 1,
        lastValueVisible: false,
        priceLineVisible: false,
        priceFormat: {
          type: 'price',
          precision: 3,
          minMove: 0.001,
        },
      })
      const plotData = maData
        .filter(d => d.value > 0)
        .map(d => ({ time: d.time, value: d.value }))
      if (plotData.length > 0) line.setData(plotData as any)
      maSeries.push(line)
    })
  }

  chart.timeScale().fitContent()
}

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
    localization: {
      locale: 'zh-CN',
      dateFormat: 'yyyy-MM-dd',
    },
  })

  buildChart()

  // 悬浮 tooltip
  chart.subscribeCrosshairMove((param) => {
    if (!param.point || !param.time || !mainSeries) {
      tooltip.value.visible = false
      return
    }
    const data = param.seriesData.get(mainSeries) as any
    if (!data) {
      tooltip.value.visible = false
      return
    }

    const wrapper = chartWrapper.value
    if (!wrapper) return
    const rect = wrapper.getBoundingClientRect()
    const x = param.point.x
    const y = param.point.y

    let left = x + 15
    let top = y - 10
    if (left + 160 > rect.width) {
      left = x - 175
    }
    if (top < 0) top = 0
    if (top + 150 > rect.height) top = rect.height - 150

    // 收集 MA values at this point
    // 格式化时间显示
    let timeStr: string
    if (typeof data.time === 'number') {
      const d = new Date(data.time * 1000)
      const pad = (n: number) => String(n).padStart(2, '0')
      timeStr = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    } else {
      timeStr = typeof data.time === 'string' ? data.time : String(data.time)
    }
    const maValues: string[] = []
    // 查找当前数据点在原数组中的位置
    const lookup = typeof data.time === 'number' ? data.time : timeStr
    const idx = (props.data as any[]).findIndex(d => Number(d.time) === lookup || d.time === lookup)
    if (props.mas) {
      if (idx >= 0) {
        props.mas.forEach((period, mi) => {
          if (idx >= period - 1 && props.data.length > 0) {
            let sum = 0
            for (let j = idx - period + 1; j <= idx; j++) {
              sum += props.data[j].close
            }
            const avg = sum / period
            maValues.push(`MA${period} ${avg.toFixed(3)}`)
          }
        })
      }
    }

    tooltip.value = {
      visible: true,
      style: {
        left: left + 'px',
        top: top + 'px',
      },
      time: timeStr,
      open: data.open?.toFixed(3) ?? data.value?.toFixed(3),
      high: data.high?.toFixed(3) ?? '-',
      low: data.low?.toFixed(3) ?? '-',
      close: data.close?.toFixed(3) ?? data.value?.toFixed(3),
      change: (() => {
        const prevClose = idx > 0 ? props.data[idx - 1].close : 0
        const curClose = data.close ?? data.value
        if (prevClose && curClose != null) return ((curClose - prevClose) / prevClose * 100).toFixed(2) + '%'
        return '--'
      })(),
      volume: props.data.find(d => d.time === timeStr)?.volume !== undefined
        ? formatVolume(props.data.find(d => d.time === timeStr)!.volume!)
        : undefined,
      maValues,
    }
  })

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
  ;(container as any).__resizeObserver = observer
}

watch(
  () => [props.data, props.chartType, props.showVolume, props.mas] as const,
  () => {
    if (chart) buildChart()
  },
  { deep: true, immediate: true }
)

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (chart) {
    chart.remove()
    chart = null
    mainSeries = null
    volumeSeries = null
    maSeries = []
  }
  if (chartContainer.value) {
    const observer = (chartContainer.value as any).__resizeObserver
    if (observer) observer.disconnect()
  }
})
</script>

<style lang="scss" scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
}
.chart-container {
  width: 100%;
  height: 100%;
  transition: filter 0.3s;
}
.chart-container.is-gray {
  filter: grayscale(1);
}

.chart-tooltip {
  position: absolute;
  z-index: 20;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.8;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.tooltip-time {
  font-size: 13px;
  color: #999;
  margin-bottom: 4px;
}
.tooltip-row {
  color: #666;
}
.tooltip-row b {
  margin-left: 6px;
  font-weight: 600;
}
.tooltip-row b.up { color: #e53935; }
.tooltip-row b.down { color: #009944; }
</style>
