import { defineStore } from 'pinia'
import { setStorage, getStorage } from '@/utils'
import type { StockData, KlineItem } from '@/types/stock'

export default defineStore('stock', {
  state: () => ({
    /** 自选股代码列表（持久化到 stockCode，逗号分隔） */
    watchlist: (() => {
      const saved = getStorage('stockCode')
      if (saved) {
        return saved.split(',').filter(Boolean)
      }
      // 默认值并持久化
      setStorage('stockCode', 'sh515080')
      return ['sh515080']
    })() as string[],

    /** 实时行情数据 keyed by stock code */
    realtimeData: {} as Record<string, StockData>,

    /** 当前选中的股票代码 */
    selectedCode: '' as string,

    /** K线数据 */
    klineData: [] as KlineItem[],

    /** K线加载状态 */
    klineLoading: false,
  }),

  getters: {
    /** 当前选中股票的实时行情 */
    selectedStockData(state): StockData | null {
      return state.selectedCode ? state.realtimeData[state.selectedCode] || null : null
    },

    /** 按 watchlist 顺序排列的实时数据（过滤无效数据） */
    watchlistData(state): StockData[] {
      return state.watchlist
        .map((code: string) => state.realtimeData[code])
        .filter(Boolean)
    },
  },

  actions: {
    /** 添加自选股 */
    addToWatchlist(code: string) {
      const c = code.trim()
      if (!c || this.watchlist.includes(c)) return
      this.watchlist.push(c)
      setStorage('stockCode', this.watchlist.join(','))
    },

    /** 删除自选股 */
    removeFromWatchlist(code: string) {
      this.watchlist = this.watchlist.filter((c: string) => c !== code)
      setStorage('stockCode', this.watchlist.join(','))
      if (this.selectedCode === code) {
        this.selectedCode = ''
        this.klineData = []
      }
    },

    /** 拖拽排序 */
    moveWatchlistItem(fromIndex: number, toIndex: number) {
      const item = this.watchlist.splice(fromIndex, 1)[0]
      this.watchlist.splice(toIndex, 0, item)
      setStorage('stockCode', this.watchlist.join(','))
    },

    /** 更新实时行情 */
    updateRealtimeData(data: Record<string, StockData>) {
      this.realtimeData = { ...this.realtimeData, ...data }
    },

    /** 选中某只股票 */
    selectStock(code: string) {
      if (this.selectedCode === code) return
      this.selectedCode = code
      this.klineData = []
    },

    /** 设置K线数据 */
    setKlineData(data: KlineItem[]) {
      this.klineData = data
    },

    /** 设置K线加载状态 */
    setKlineLoading(loading: boolean) {
      this.klineLoading = loading
    },
  },
})
