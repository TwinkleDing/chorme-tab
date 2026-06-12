import { defineStore } from 'pinia'
import { setStorage, getStorage } from '@/utils/storage'
import type { StockData, KlineItem } from '@/types/stock'

export default defineStore('stock', {
  state: () => ({
    watchlist: (() => {
      const saved = getStorage('stockCode')
      if (saved) return saved.split(',').filter(Boolean)
      setStorage('stockCode', 'sh515080')
      return ['sh515080']
    })() as string[],

    realtimeData: {} as Record<string, StockData>,
    selectedCode: '' as string,
    klineData: [] as KlineItem[],
    klineLoading: false,
  }),

  getters: {
    selectedStockData(state): StockData | null {
      return state.selectedCode ? state.realtimeData[state.selectedCode] || null : null
    },
    watchlistData(state): StockData[] {
      return state.watchlist
        .map((code: string) => state.realtimeData[code])
        .filter(Boolean)
    },
  },

  actions: {
    addToWatchlist(code: string) {
      const c = code.trim()
      if (!c || this.watchlist.includes(c)) return
      this.watchlist.push(c)
      setStorage('stockCode', this.watchlist.join(','))
    },
    removeFromWatchlist(code: string) {
      this.watchlist = this.watchlist.filter((c: string) => c !== code)
      setStorage('stockCode', this.watchlist.join(','))
      if (this.selectedCode === code) {
        this.selectedCode = ''
        this.klineData = []
      }
    },
    moveWatchlistItem(fromIndex: number, toIndex: number) {
      const item = this.watchlist.splice(fromIndex, 1)[0]
      this.watchlist.splice(toIndex, 0, item)
      setStorage('stockCode', this.watchlist.join(','))
    },
    updateRealtimeData(data: Record<string, StockData>) {
      this.realtimeData = { ...this.realtimeData, ...data }
    },
    selectStock(code: string) {
      if (this.selectedCode === code) return
      this.selectedCode = code
      this.klineData = []
    },
    setKlineData(data: KlineItem[]) {
      this.klineData = data
    },
    setKlineLoading(loading: boolean) {
      this.klineLoading = loading
    },
  },
})
