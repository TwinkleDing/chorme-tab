import { ref } from 'vue'
import type { KlineItem } from '@/types/stock'

/**
 * 从腾讯K线API获取数据
 * - 日/周/月: qfqday 前复权接口
 * - 分钟: mkline 接口
 *
 * 开发环境通过 Vite proxy 避免 CORS 问题；
 * 生产环境直接请求（Chrome 扩展页面可跨域）。
 */
export function useKlineData() {
  const loading = ref(false)
  const error = ref('')

  const fetchKline = async (
    code: string,
    period: 'm5' | 'day' | 'week' | 'month' = 'day',
    days: number = 60
  ): Promise<KlineItem[]> => {
    if (!code) return []

    loading.value = true
    error.value = ''

    try {
      if (period === 'm5') {
        return await fetchMinuteKline(code, days)
      }
      return await fetchDayKline(code, period, days)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '获取K线数据失败'
      error.value = message
      return []
    } finally {
      loading.value = false
    }
  }

  /** 日/周/月 K线 */
  async function fetchDayKline(
    code: string,
    period: 'day' | 'week' | 'month',
    days: number
  ): Promise<KlineItem[]> {
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

    const rawData = stockData.qfqday || stockData.day
    if (!Array.isArray(rawData) || rawData.length === 0) {
      throw new Error('暂无K线数据')
    }

    return rawData.map((item: (string | number)[]) => {
      const dateStr = item[0] as string // "YYYY-MM-DD"
      const open = Number(item[1])
      const close = Number(item[2])
      const high = Number(item[3])
      const low = Number(item[4])
      const volume = Number(item[5]) || 0
      return { time: dateStr, open, high, low, close, volume }
    })
  }

  /** 5分钟 K线 */
  async function fetchMinuteKline(
    code: string,
    days: number
  ): Promise<KlineItem[]> {
    const base = import.meta.env.DEV
      ? '/api/mkline'
      : 'http://ifzq.gtimg.cn/appstock/app/kline/mkline'
    const url = `${base}?param=${code},m1,,,${days}`
    const response = await fetch(url)
    if (!response.ok) throw new Error('网络请求失败')

    const json = await response.json()
    if (json.code !== 0 || !json.data) throw new Error('数据获取失败')

    const stockData = json.data[code]
    if (!stockData) throw new Error('股票代码不存在')

    const rawData = stockData.m1
    if (!Array.isArray(rawData) || rawData.length === 0) {
      throw new Error('暂无5分钟K线数据')
    }

    return rawData.map((item: any[]) => {
      // 分钟数据原始格式: ["YYYYMMDDHHMM", open, close, high, low, volume, {}, ...]
      const rawTime = String(item[0])
      // lightweight-charts 分钟级别 time 需要 Unix 时间戳（秒）
      const ts = Math.floor(new Date(
        Number(rawTime.slice(0,4)),
        Number(rawTime.slice(4,6)) - 1,
        Number(rawTime.slice(6,8)),
        Number(rawTime.slice(8,10)),
        Number(rawTime.slice(10,12))
      ).getTime() / 1000)
      const open = Number(item[1])
      const close = Number(item[2])
      const high = Number(item[3])
      const low = Number(item[4])
      const volume = Number(item[5]) || 0
      return { time: ts as any, open, high, low, close, volume }
    })
  }

  return { fetchKline, loading, error }
}
