<template>
  <div class="home" ref="home" @mousemove="pageMove">
    <BackgroundView ref="bgView" :bg-mode="bgMode" :bg-index="bgIndex" :size-index="sizeIndex" @wheel="onMouseWheel"
      @mousedown="domMouseDown" @mouseup="domMouseUp" @mouseout="domMouseOut" @dblclick="resetBg" />

    <div id="box" ref="box" :class="['box']" @mousedown="domMouseDown" @mouseup="domMouseUp" @mouseout="domMouseOut">
      <div class="nav">
        <span style="display: inline-block; width: 150px; margin-right: 5px">{{ currentTime }}</span>
        <div @click="toggleStockList" style="margin-left: 10px; cursor: pointer">
          <el-icon v-if="showStockList">
            <Hide style="position: relative; top: 2px" />
          </el-icon>
          <el-icon v-else size="20">
            <TrendCharts style="position: relative; top: 4px" />
          </el-icon>
        </div>
      </div>

      <StockTicker v-show="showStockList" :data="stockData" :codes="stockCodes" />

      <div>
        <SearchBar />
        <BookmarkList :items="bookList" :unfolded="boxUnfold" />
        <div class="boxUnfold" @click="toggleUnfold">
          <el-icon>
            <TopLeft v-if="boxUnfold" />
            <BottomRight v-else />
          </el-icon>
        </div>
      </div>
    </div>

    <ImgList v-if="bgMode === FULL_SCREEN" />
    <Grid @set-mode="onSetMode" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, reactive } from 'vue'
import { dateFormat } from '@/utils/date'
import { setStorage, getStorage } from '@/utils/storage'
import { FULL_SCREEN } from '@/utils/constants'
import { BookList } from '@/config/bookmarks'
import { BgSizeList } from '@/config/images'
import { TopLeft, BottomRight, Hide, TrendCharts } from '@element-plus/icons-vue'

import useBackgroundStore from '@/stores/background'
import { useMouseEvent } from '@/composables/useMouseEvent'
import { useBackground } from '@/composables/useBackground'
import { useStockRealtime } from '@/composables/useStockRealtime'

import BackgroundView from './components/BackgroundView.vue'
import SearchBar from './components/SearchBar.vue'
import BookmarkList from './components/BookmarkList.vue'
import StockTicker from './components/StockTicker.vue'
import Grid from '@/components/Grid.vue'
import ImgList from '@/components/ImgList.vue'

const store = useBackgroundStore()
const { mouseDown, mouseMove, mouseUp, mouseOut } = useMouseEvent()
const { data: stockData, startPolling, stopPolling } = useStockRealtime()
const stockCodes = (getStorage('stockCode') || 'sh515080').split(',').filter(Boolean)

const home = ref<HTMLElement>()
const box = ref<HTMLElement>()
const bgView = ref<InstanceType<typeof BackgroundView>>()

const { bgIndex, sizeIndex, bgMode, initBg, resetBg, onMouseWheel, changeImage, nudge: _nudge } =
  useBackground(() => bgView.value?.pageEl)

const bookList = reactive(BookList)
const bgSizeList = reactive(BgSizeList)
const boxUnfold = ref(store.getBoxUnfold)
const showStockList = ref(String(getStorage('showStockList')) !== 'false')
const currentTime = ref(dateFormat(new Date(), 'yyyy-MM-dd hh:mm:ss'))

let mouseDownTimer: ReturnType<typeof setTimeout> | null = null
let controlDown = false
let timeInterval: ReturnType<typeof setInterval> | null = null

// ---- stock ticker ----
function toggleStockList() {
  showStockList.value = !showStockList.value
  setStorage('showStockList', showStockList.value)
}

// ---- drag ----
function domMouseDown(e: MouseEvent) {
  mouseDown(e)
  if (box.value?.contains(e.target as Node)) {
    mouseDownTimer = setTimeout(() => { box.value!.style.backgroundColor = '#00000033' }, 100)
  }
}
function domMouseUp(e: MouseEvent) {
  mouseUp()
  if (mouseDownTimer) { clearTimeout(mouseDownTimer); mouseDownTimer = null }
  if (box.value?.contains(e.target as Node)) box.value.style.backgroundColor = 'transparent'
}
function domMouseOut(e: MouseEvent) {
  mouseOut()
  if (box.value?.contains(e.target as Node)) box.value.style.backgroundColor = 'transparent'
}

function pageMove(e: MouseEvent) {
  if (box.value?.contains(e.target as Node)) {
    const pos = mouseMove(e, box.value)
    if (pos) { store.setSearchX(pos.left); store.setSearchY(pos.top) }
  } else if (bgView.value?.pageEl?.contains(e.target as Node)) {
    const pos = mouseMove(e, bgView.value.pageEl)
    if (pos) { store.setBgX(pos.left); store.setBgY(pos.top) }
  }
}

function toggleUnfold() {
  boxUnfold.value = !boxUnfold.value
  store.setBoxUnfold(boxUnfold.value)
}

function onSetMode() {
  resetBg()
}

function initBox() {
  const sx = store.getSearchX
  const sy = store.getSearchY
  if (sx && box.value) box.value.style.left = sx
  if (sy && box.value) box.value.style.top = sy
}

// ---- keyboard ----
function handleKeyDown(e: KeyboardEvent) {
  if (['Control', 'Alt', 'Meta', 'Shift'].includes(e.key)) {
    controlDown = true
  } else if (bgMode.value === FULL_SCREEN && (e.target as HTMLElement)?.localName === 'body') {
    if (e.key === 'ArrowUp') changeImage(-1, 13)
    if (e.key === 'ArrowDown') changeImage(1, 13)
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const dir = e.key === 'ArrowLeft' ? -1 : 1
      let idx = sizeIndex.value + dir
      if (idx < 0) idx = bgSizeList.length - 1
      if (idx >= bgSizeList.length) idx = 0
      sizeIndex.value = idx
      store.setSizeIndex(idx)
      resetBg()
    }
    if (e.key === 'w') _nudge(0, -1)
    if (e.key === 'a') _nudge(-1, 0)
    if (e.key === 's') _nudge(0, 1)
    if (e.key === 'd') _nudge(1, 0)
  }
}
function handleKeyUp(e: KeyboardEvent) {
  if (e.key === 'Control') controlDown = false
}

// ---- lifecycle ----
onMounted(() => {
  initBg()
  initBox()

  timeInterval = setInterval(() => {
    currentTime.value = dateFormat(new Date(), 'yyyy-MM-dd hh:mm:ss')
  }, 1000)

  startPolling(stockCodes, 1000)
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  stopPolling()
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('keyup', handleKeyUp)
})

watch(() => store.bgIndex, (v) => { bgIndex.value = v })
watch(() => store.sizeIndex, (v) => { sizeIndex.value = v })
watch(() => store.bgMode, (v) => { bgMode.value = v })
</script>

<style lang="scss" scoped>
.home {
  height: 100%;
  width: 100%;
  position: relative;
}

.box {
  color: #fff;
  width: 640px;
  cursor: pointer;
  border-radius: 20px;
  position: fixed;
  left: 40%;
  top: 20%;
  user-select: none;
  z-index: 2;
  padding: 0 20px;
  box-shadow: 0 0 10px #00000080;

  .nav {
    display: flex;
    align-items: center;
    height: 32px;
    line-height: 32px;
  }

  .boxUnfold {
    position: absolute;
    bottom: 0;
    right: 5px;
    font-size: 20px;
    font-weight: 700;
    color: #ffffff8a;
    cursor: pointer;
  }
}
</style>
