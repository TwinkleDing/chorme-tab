/** 实时股票数据（GTAPI 解析后） */
export interface StockData {
  name: string
  code: string
  currentPrice: number
  previousClose: number
  openPrice: number
  priceChange: number
  priceChangePercent: string
  dayLow: number
  dayHigh: number
  current: number
  volume: number
  updateTime: string
}

/** K线数据项，兼容 lightweight-charts */
export interface KlineItem {
  time: string // "YYYY-MM-DD"
  open: number
  high: number
  low: number
  close: number
  volume?: number
}
