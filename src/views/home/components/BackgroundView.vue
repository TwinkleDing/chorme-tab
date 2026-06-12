<template>
  <div id="page" ref="pageEl" class="bg-view" @mousewheel="$emit('wheel', $event)" @mousedown="$emit('mousedown', $event)" @mouseup="$emit('mouseup', $event)" @dblclick="$emit('dblclick')">
    <img
      v-if="bgMode === FULL_SCREEN"
      :src="imgSrc"
      :style="sizeStyle"
      draggable="false"
      @mouseout="$emit('mouseout', $event)"
    />
    <div v-if="bgMode === GRID_SCREEN" id="page-bg-box">
      <div
        v-for="(src, i) in gridImgList"
        :key="i"
        :style="{ backgroundImage: `url(${src})` }"
        @mouseout="$emit('mouseout', $event)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { FULL_SCREEN, GRID_SCREEN } from '@/utils/constants'
import { PageBgImgList, PageGridImgList, BgSizeList } from '@/config/images'

const props = defineProps<{
  bgMode: string
  bgIndex: number
  sizeIndex: number
}>()

defineEmits<{
  wheel: [e: WheelEvent]
  mousedown: [e: MouseEvent]
  mouseup: [e: MouseEvent]
  mouseout: [e: MouseEvent]
  dblclick: []
}>()

const pageEl = ref<HTMLElement>()
defineExpose({ pageEl })

const imgSrc = computed(() => PageBgImgList[props.bgIndex] || PageBgImgList[0])
const sizeStyle = computed(() => BgSizeList[props.sizeIndex] || BgSizeList[0])
const gridImgList = PageGridImgList
</script>

<style lang="scss" scoped>
.bg-view {
  height: 100%;
  width: 100%;
  position: fixed;
  left: 0;
  top: 0;
  color: #fff;
  background-repeat: no-repeat;

  #page-bg-box {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 0;
    height: 100%;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    overflow: hidden;

    div {
      width: 25%;
      height: 33.334%;
      background-repeat: no-repeat;
      background-position: 50% 50%;
    }
  }
}
</style>
