import { ref } from 'vue'
import type { KlineItem } from '@/types/stock'

/**
 * 从腾讯前复权K线API获取数据
 * API: http://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${code},${period},,,${days},qfq
 *
 * 开发环境通过 Vite proxy (/api/kline) 避免 CORS 问题；
 * 生产环境直接请求（Chrome 扩展页面可跨域）。
 */
export function useKlineData() {
  const loading = ref(false)
  const error = ref('')

  const fetchKline = async (
    code: string,
    period: 'day' | 'week' | 'month' = 'day',
    days: number = 60
  ): Promise<KlineItem[]> => {
    if (!code) return []

    loading.value = true
    error.value = ''

    try {
      // 开发环境用 Vite proxy，生产环境直接请求
      const base = import.meta.env.DEV
        ? '/api/kline'
        : 'https://web.ifzq.gtimg.cn/appstock/app/fqkline'
      const url = `${base}/get?param=${code},${period},,,${days},qfq`
      const response = await fetch(url)
      if (!response.ok) throw new Error('网络请求失败')

      const json = await response.json()
      if (json.code !== 0 || !json.data) throw new Error('数据获取失败')

      const stockData = json.data[code]
      if (!stockData) throw new Error('股票代码不存在')

      // 优先使用前复权数据，其次使用日数据
      const rawData = stockData.qfqday || stockData.day
      if (!Array.isArray(rawData) || rawData.length === 0) {
        throw new Error('暂无K线数据')
      }

      const result: KlineItem[] = rawData.map((item: (string | number)[]) => {
        const dateStr = item[0] as string // "YYYY-MM-DD"
        const open = Number(item[1])
        const close = Number(item[2])
        const high = Number(item[3])
        const low = Number(item[4])
        const volume = Number(item[5]) || 0

        // 日K线直接使用日期字符串，兼容 lightweight-charts v5
        return { time: dateStr, open, high, low, close, volume }
      })

      return result
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '获取K线数据失败'
      error.value = message
      return []
    } finally {
      loading.value = false
    }
  }

  return { fetchKline, loading, error }
}
