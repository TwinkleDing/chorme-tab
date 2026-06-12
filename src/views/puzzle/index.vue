<template>
  <div class="puzzle" @keydown="onKeyDown" tabindex="0" ref="puzzleEl">
    <div class="board-area">
      <div class="board" :style="{ height: `${width}px`, width: `${width}px` }">
        <div class="grid-overlay">
          <div v-for="i in tier * tier" :key="'g' + i" class="grid-cell"
            :style="{ width: `${itemSize}px`, height: `${itemSize}px` }"
          ></div>
        </div>
        <div
          v-for="item in blockList" :key="item.getCoordinate()[0] + '_' + item.getCoordinate()[1]"
          class="tile"
          :class="{ empty: !item.getIsImg(), solved: over && item.getIsImg() }"
          :style="{
            left: `${item.getRandom()[0]}px`, top: `${item.getRandom()[1]}px`,
            width: `${itemSize}px`, height: `${itemSize}px`,
            backgroundImage: item.getIsImg() ? `url(${cardImg})` : '',
            backgroundPosition: `${-item.getCoordinate()[0]}px ${-item.getCoordinate()[1]}px`,
            backgroundSize: `${width}px ${width}px`,
          }"
          @click="puzzleClick(item)"
        >
          <span v-if="item.getIsImg()" class="tile-num">{{ getTileIndex(item) }}</span>
        </div>
      </div>
    </div>

    <div class="panel">
      <img class="preview" :src="img" alt="" />
      <div class="difficulty">
        <span class="label">难度</span>
        <div class="diff-btns">
          <el-button v-for="d in difficulties" :key="d" size="small"
            :type="tier === d ? 'primary' : ''" :disabled="playing"
            @click="changeDifficulty(d)"
          >{{ d }}×{{ d }}</el-button>
        </div>
      </div>
      <div class="stats">
        <div class="stat-row"><span class="stat-label">步数</span><span class="stat-value">{{ count }}</span></div>
        <div class="stat-row"><span class="stat-label">用时</span><span class="stat-value">{{ fmtTime(elapsed) }}</span></div>
        <div v-if="bestTime" class="stat-row best"><span class="stat-label">最佳</span><span class="stat-value">{{ fmtTime(bestTime) }} / {{ bestSteps }}步</span></div>
      </div>
      <div class="actions">
        <el-button type="primary" @click="handleStart" :disabled="playing">{{ over ? '再来一局' : '开始' }}</el-button>
        <el-button @click="handleEnd" :disabled="!playing">暂停</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      <div v-if="over" class="win-banner">🎉 拼图完成！<br/>{{ fmtTime(elapsed) }} · {{ count }}步</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import useBackgroundStore from '@/stores/background'
import { ElMessage } from 'element-plus'
import Puzzle, { Block } from './puzzle'
import { exampleImg, PageBgImgList } from '@/config/images'

const store = useBackgroundStore()
let puzzle: Puzzle | null = null

const puzzleEl = ref<HTMLElement>()
const blockList = ref<Block[]>([])
const count = ref(0)
const elapsed = ref(0)
const bestTime = ref<number | null>(null)
const bestSteps = ref<number | null>(null)
const itemSize = ref(0)
const cardImg = ref('')
const width = ref(400)
const tier = ref(3)
const img = ref('')
const playing = ref(false)
const over = ref(false)
const difficulties = [3, 4, 5]

function fmtTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}分${sec.toString().padStart(2, '0')}秒` : `${sec}.${Math.floor((ms % 1000) / 100)}秒`
}

function getTileIndex(item: Block): number {
  const [cx, cy] = item.getCoordinate()
  return (cy / itemSize.value) * tier.value + (cx / itemSize.value) + 1
}

function createPuzzle() {
  puzzle = new Puzzle(img.value, tier.value, width.value)
  itemSize.value = puzzle.getItemSize()
  cardImg.value = puzzle.getImg()
  blockList.value = [...puzzle.getBlockList()]
  playing.value = false
  over.value = false
  count.value = 0
  elapsed.value = 0
  bestTime.value = puzzle.getBestTime()
  bestSteps.value = puzzle.getBestSteps()

  puzzle.puzzleChange((p: Puzzle) => {
    count.value = p.getCount()
    elapsed.value = p.getElapsed()
    playing.value = p.getPlaying()
    over.value = p.getOver()
    blockList.value = [...p.getBlockList()]
    if (p.getOver()) {
      bestTime.value = p.getBestTime()
      bestSteps.value = p.getBestSteps()
      ElMessage.success(`恭喜！拼图完成！${fmtTime(p.getElapsed())} · ${p.getCount()}步`)
    }
  })
}

function init() {
  img.value = typeof store.getBgIndex === 'number' ? PageBgImgList[store.getBgIndex] : exampleImg
  createPuzzle()
}

function changeDifficulty(d: number) {
  if (playing.value) return
  tier.value = d
  width.value = d === 3 ? 400 : d === 4 ? 480 : 500
  createPuzzle()
  nextTick(() => puzzleEl.value?.focus())
}

function handleStart() { puzzle?.start(); nextTick(() => puzzleEl.value?.focus()) }
function handleEnd() { puzzle?.end(); playing.value = false; blockList.value = [...(puzzle?.getBlockList() ?? [])] }
function handleReset() { puzzle?.reset(); count.value = 0; elapsed.value = 0; playing.value = false; over.value = false; blockList.value = [...(puzzle?.getBlockList() ?? [])] }
function puzzleClick(item: Block) { if (item.getIsImg()) puzzle?.blockClick(item) }

function onKeyDown(e: KeyboardEvent) {
  if (!puzzle || !puzzle.getPlaying()) return
  switch (e.key) {
    case 'ArrowUp': e.preventDefault(); puzzle.moveDirection(0, -1); break
    case 'ArrowDown': e.preventDefault(); puzzle.moveDirection(0, 1); break
    case 'ArrowLeft': e.preventDefault(); puzzle.moveDirection(-1, 0); break
    case 'ArrowRight': e.preventDefault(); puzzle.moveDirection(1, 0); break
  }
}

onMounted(() => { init(); nextTick(() => puzzleEl.value?.focus()) })
onUnmounted(() => { puzzle?.destroy() })
</script>

<style lang="scss" scoped>
.puzzle {
  height: 100%; width: 100%;
  padding: 24px;
  display: flex; align-items: flex-start;
  gap: 24px; outline: none; user-select: none;
}

.board-area { flex-shrink: 0; }

.board {
  position: relative;
  border: 2px solid #333; border-radius: 6px;
  overflow: hidden; background: #f0f0f0;
}

.grid-overlay {
  position: absolute; inset: 0;
  display: flex; flex-wrap: wrap;
  pointer-events: none; z-index: 0;
}

.grid-cell {
  border: 1px solid #ddd;
  box-sizing: border-box;
}

.tile {
  position: absolute; z-index: 1;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-sizing: border-box;
  transition: left 0.12s ease, top 0.12s ease;

  &.empty { background: transparent !important; z-index: 0; border: none; cursor: default; }
  &.solved { filter: brightness(1.05); }

  &:hover:not(.empty) { filter: brightness(1.1); }
}

.tile-num {
  position: absolute; bottom: 2px; right: 4px;
  font-size: 11px; color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.panel {
  flex: 1; min-width: 160px; max-width: 240px;

  .preview {
    width: 100%; aspect-ratio: 1; object-fit: cover;
    border-radius: 8px; border: 2px solid #e0e0e0;
    margin-bottom: 16px;
  }
}

.difficulty {
  margin-bottom: 16px;
  .label { display: block; font-size: 13px; color: #888; margin-bottom: 6px; }
}

.diff-btns { display: flex; gap: 6px; .el-button { flex: 1; font-size: 13px; } }

.stats { margin-bottom: 16px; }

.stat-row {
  display: flex; justify-content: space-between; align-items: baseline;
  padding: 5px 0; border-bottom: 1px solid #f0f0f0;
  &.best .stat-label { color: #faad14; }
  &.best .stat-value { color: #faad14; font-weight: 600; }
}

.stat-label { font-size: 13px; color: #888; }
.stat-value { font-size: 15px; font-weight: 600; color: #333; }

.actions {
  display: flex; gap: 6px; margin-bottom: 12px;
  .el-button { flex: 1; font-size: 13px; }
}

.win-banner {
  text-align: center; padding: 12px;
  background: linear-gradient(135deg, #f6d365, #fda085);
  border-radius: 8px; color: #fff;
  font-weight: 600; font-size: 14px; line-height: 1.6;
}
</style>
