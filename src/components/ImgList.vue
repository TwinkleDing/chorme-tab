<template>
  <div id="bg-box" ref="bgBox" class="bg-box">
    <div class="img-box">
      <div id="ex" class="ex" @click="ex = !ex">
        <el-icon>
          <DArrowRight v-show="ex" />
          <DArrowLeft v-show="!ex" />
        </el-icon>
      </div>
      <div class="scroll-box" v-show="!ex">
        <el-scrollbar ref="scrollbar">
          <div class="img-list" @wheel.prevent="mousewheel">
            <div :class="['img', bgIndex === index && 'active']" v-for="(item, index) in PageThImgList" :key="index">
              <img :src="item" alt="" loading="lazy" decoding="async" @click="setBgIndex(index)" />
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { DArrowRight, DArrowLeft } from '@element-plus/icons-vue'
import useBackgroundStore from '@/stores/background'
import { PageThImgList } from '@/config/images'

const store = useBackgroundStore()
const imgWidth = 142
const ex = ref(true)
const bgIndex = ref(store.getBgIndex)
const bgBox = ref<HTMLElement>()
const scrollbar = ref<{ wrapRef?: HTMLElement }>()

function setBgIndex(index: number) {
  store.setBgIndex(index)
}

function mousewheel(e: WheelEvent) {
  const content = scrollbar.value?.wrapRef
  if (!content) return
  content.scrollBy({ left: (e.deltaY > 0 ? 1 : -1) * (imgWidth + 4), behavior: 'smooth' })
}

function setCurrentCenter() {
  const content = scrollbar.value?.wrapRef
  const selected = content?.querySelector<HTMLElement>('.img.active')
  if (!content || !selected) return
  content.scrollTo({
    left: content.scrollLeft + selected.getBoundingClientRect().left
      - content.getBoundingClientRect().left - (content.clientWidth - selected.clientWidth) / 2,
    behavior: 'smooth',
  })
}

watch(() => store.bgIndex, async value => {
  bgIndex.value = value
  await nextTick()
  if (!ex.value) setCurrentCenter()
})
watch(ex, async collapsed => {
  if (!collapsed) { await nextTick(); setCurrentCenter() }
})

function handleOutsideClick(event: MouseEvent) {
  if (bgBox.value && !bgBox.value.contains(event.target as Node)) ex.value = true
}
onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>

<style lang="scss" scoped>
.bg-box {
  position: fixed;
  left: 0;
  bottom: 0;
  height: 102px;
  max-width: calc(100% - 12px);
  user-select: none;
}

.img-box {
  display: flex;
  border: 1px solid #aaa;
  border-radius: 0 10px 10px 0;
  overflow: hidden;
  max-width: 100%;

  .ex {
    width: 24px;
    height: 100%;
    line-height: 100px;
    text-align: center;
    cursor: pointer;
    background: #cccccc88;
    color: #fff;
  }

  .scroll-box {
    height: 100%;
    padding: 0 6px;
    flex: 1;
    max-width: calc(100% - 24px);

    .img-list {
      display: flex;

      .img {
        cursor: pointer;
        height: 96px;
        border-radius: 2px;
        padding: 2px;
        margin: 2px;

        &.active { background: #fff; }

        img { height: 92px; width: 138px; }
      }
    }
  }
}
</style>
