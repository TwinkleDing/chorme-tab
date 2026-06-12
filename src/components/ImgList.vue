<template>
  <div id="bg-box" class="bg-box">
    <div class="img-box">
      <div id="ex" class="ex" @click="ex = !ex">
        <el-icon>
          <DArrowRight v-show="ex" />
          <DArrowLeft v-show="!ex" />
        </el-icon>
      </div>
      <div class="scroll-box" v-show="!ex">
        <el-scrollbar>
          <div class="img-list" @mousewheel="mousewheel">
            <div :class="['img', bgIndex === index && 'active']" v-for="(item, index) in PageThImgList" :key="index">
              <img :src="item" alt="" @click="setBgIndex(index)" />
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { DArrowRight, DArrowLeft } from '@element-plus/icons-vue'
import useBackgroundStore from '@/stores/background'
import { PageThImgList } from '@/config/images'

const store = useBackgroundStore()

const imgWidth = 142
const ex = ref(true)
const bgIndex = ref(store.getBgIndex)

function setBgIndex(index: number) {
  store.setBgIndex(index)
  bgIndex.value = index
}

function mousewheel(e: WheelEvent) {
  e.preventDefault()
  const content = document.getElementsByClassName('el-scrollbar__wrap')[0]
  if (!content) return
  if (e.deltaY > 0) content.scrollLeft += imgWidth + 4
  else content.scrollLeft -= imgWidth + 4
}

function setCurrentCenter(oldValue = -1) {
  const content = document.getElementsByClassName('el-scrollbar__wrap')[0]
  if (!content) return
  setTimeout(() => {
    const halfIndex = Math.floor(content.clientWidth / 2 / imgWidth)
    let scrollIndex = 0
    let multiple = 2

    if (bgIndex.value <= halfIndex && oldValue <= halfIndex) {
      content.scrollLeft = 0
    } else {
      if (oldValue === -1 && content.scrollLeft > 0) {
        scrollIndex = 0
        if (content.scrollLeft !== (bgIndex.value - halfIndex) * imgWidth) {
          content.scrollLeft = (bgIndex.value - halfIndex) * imgWidth
        }
      } else if (oldValue <= halfIndex) {
        scrollIndex = bgIndex.value - halfIndex
      } else {
        scrollIndex = bgIndex.value - oldValue
        if (scrollIndex < 0 && bgIndex.value >= PageThImgList.length - halfIndex) {
          scrollIndex = 0
        }
      }
    }

    if (
      (oldValue === 0 && bgIndex.value === PageThImgList.length - 1) ||
      (oldValue === PageThImgList.length - 1 && bgIndex.value === 0) ||
      oldValue === -1
    ) {
      multiple = 10
    }

    scrollIndex *= imgWidth / multiple
    const timer = setInterval(() => {
      if (scrollIndex > 0) { content.scrollLeft += multiple; scrollIndex-- }
      if (scrollIndex < 0) { content.scrollLeft -= multiple; scrollIndex++ }
      if (content.scrollLeft === 0 || (scrollIndex > -1 && scrollIndex < 1)) {
        clearInterval(timer)
      }
    }, 1)
  }, 10)
}

watch(() => store.bgIndex, (newValue, oldValue) => {
  setCurrentCenter(oldValue as number)
  bgIndex.value = newValue
})

watch(() => ex.value, (e) => { if (!e) setCurrentCenter() })

onMounted(() => {
  document.addEventListener('click', (event) => {
    const box = document.getElementById('bg-box')
    if (box && !box.contains(event.target as Node) && ex.value === false) {
      ex.value = true
    }
  })
})
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
