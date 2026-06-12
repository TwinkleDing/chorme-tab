import { ref } from 'vue'
import type { StockData } from '@/types/stock'

/** 解析 GTAPI 返回的 GBK 数据，提取所有股票字段 */
function parseGtapiResponse(buffer: ArrayBuffer): StockData[] {
  const decoder = new TextDecoder('gbk')
  const text = decoder.decode(buffer)
  const result: StockData[] = []

  const regex = /v_(\w+)="([^"]+)"/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    const fullCode = match[1]
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

export function useStockRealtime() {
  const data = ref<Record<string, StockData>>({})
  const loading = ref(false)
  let pollTimer: ReturnType<typeof setInterval> | null = null

  async function refresh(codes: string[]) {
    if (codes.length === 0) return
    loading.value = true
    try {
      const response = await fetch(`http://qt.gtimg.cn/q=${codes.join(',')}`)
      if (!response.ok) throw new Error('网络请求失败')
      const buffer = await response.arrayBuffer()
      const list = parseGtapiResponse(buffer)
      const map: Record<string, StockData> = {}
      list.forEach((s) => { map[s.code] = s })
      data.value = map
    } catch (e) {
      console.error('获取实时数据失败:', e)
    } finally {
      loading.value = false
    }
  }

  function startPolling(codes: string[], intervalMs = 1000) {
    stopPolling()
    if (codes.length === 0) return
    refresh(codes)
    pollTimer = setInterval(() => refresh(codes), intervalMs)
  }

  function stopPolling() {
    if (pollTimer !== null) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  return { data, loading, refresh, startPolling, stopPolling }
}
