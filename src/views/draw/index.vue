<!--
 * @Author: twinkleding
 * @Date: 2024-11-12 11:11:46
 * @LastEditTime: 2024-12-02 19:44:11
 * @LastEditors: twinkleding
 * @FilePath: \chorme-tab\src\views\draw\index.vue
 * @Description: 
-->
<template>
  <div ref="draw" id="draw">
    <canvas ref="canvas" id="canvas" height="100%" width="100%"></canvas>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from "vue";
import useImgStore from "@/store/img.ts";
import { PageBgImgList, BgSizeList } from "@/components/Options.js";

const imgStore = useImgStore();

const { getBgIndex, getSizeIndex } = imgStore;

const initCanvas = () => {
  canvas.height = draw.clientHeight;
  canvas.width = draw.clientWidth;
  const img = new Image();
  const ctx = canvas.getContext("2d");
  img.src = PageBgImgList[getBgIndex];
  img.onload = () => {
    const size = BgSizeList[getSizeIndex];
    let height = 0;
    let width = 0;
    if (size.width === "100%" && size.height === "100%") {
      width = canvas.width;
      height = canvas.height;
    } else if (size.width === "100%") {
      width = canvas.width;
      height = (img.height / img.width) * width;
    } else if (size.height === "100%") {
      height = canvas.height;
      width = (img.width / img.height) * height;
    }
    ctx.drawImage(img, 0, 0, width, height);
  };
};

onMounted(() => {
  initCanvas();
});
</script>

<style scoped lang="scss">
#draw {
  height: 100%;
  width: 100%;
  #canvas {
    cursor: crosshair;
  }
}
</style>
