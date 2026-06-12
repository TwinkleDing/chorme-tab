import { defineStore } from 'pinia'
import { setStorage, getStorage } from '@/utils/storage'
import { FULL_SCREEN } from '@/utils/constants'

export default defineStore('background', {
  state: () => ({
    bgIndex: getStorage('bgIndex') ? Number(getStorage('bgIndex')) : 0,
    sizeIndex: getStorage('sizeIndex') ? Number(getStorage('sizeIndex')) : 0,
    boxUnfold: getStorage('boxUnfold') ?? true,
    bgMode: getStorage('bgMode') || FULL_SCREEN,
    bgW: getStorage('bgW') || '',
    bgH: getStorage('bgH') || '',
    bgX: getStorage('bgX') || '',
    bgY: getStorage('bgY') || '',
    searchX: getStorage('searchX') || '',
    searchY: getStorage('searchY') || '',
  }),

  getters: {
    getBgIndex: (state) => state.bgIndex,
    getSizeIndex: (state) => state.sizeIndex,
    getBoxUnfold: (state) => state.boxUnfold,
    getBgMode: (state) => state.bgMode,
    getBgW: (state) => state.bgW,
    getBgH: (state) => state.bgH,
    getBgX: (state) => state.bgX,
    getBgY: (state) => state.bgY,
    getSearchX: (state) => state.searchX,
    getSearchY: (state) => state.searchY,
  },

  actions: {
    setBgIndex(index: number) {
      this.bgIndex = index
      setStorage('bgIndex', index)
    },
    setSizeIndex(index: number) {
      this.sizeIndex = index
      setStorage('sizeIndex', index)
    },
    setBoxUnfold(unfold: boolean) {
      this.boxUnfold = unfold
      setStorage('boxUnfold', unfold)
    },
    setBgMode(mode: string) {
      this.bgMode = mode
      setStorage('bgMode', mode)
    },
    setBgW(w: string) {
      this.bgW = w
      setStorage('bgW', w)
    },
    setBgH(h: string) {
      this.bgH = h
      setStorage('bgH', h)
    },
    setBgX(x: string) {
      this.bgX = x
      setStorage('bgX', x)
    },
    setBgY(y: string) {
      this.bgY = y
      setStorage('bgY', y)
    },
    setSearchX(x: string) {
      // FIXED: 之前错误地写成了 this.bgX
      this.searchX = x
      setStorage('searchX', x)
    },
    setSearchY(y: string) {
      // FIXED: 之前错误地写成了 this.bgY
      this.searchY = y
      setStorage('searchY', y)
    },
  },
})
