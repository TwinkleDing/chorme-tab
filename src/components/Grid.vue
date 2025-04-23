<!--
 * @Author: twinkleding
 * @Date: 2024-11-20 09:49:56
 * @LastEditTime: 2024-11-29 09:39:22
 * @LastEditors: twinkleding
 * @FilePath: \chorme-tab\src\components\Grid.vue
 * @Description: 
-->
<template>
  <div class="grid">
    <el-icon>
      <PictureFilled v-if="modeActive == GRID_SCREEN" @click="setMode(FULL_SCREEN)" />
      <Grid v-if="modeActive == FULL_SCREEN" @click="setMode(GRID_SCREEN)" />
    </el-icon>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { PictureFilled, Grid } from "@element-plus/icons-vue";
import useImgStore from "@/store/img";
import { FULL_SCREEN, GRID_SCREEN } from "@/utils/constant";

const imgStore = useImgStore();
const emit = defineEmits(["setMode"]);

const modeActive = ref<string>(imgStore.getBgMode);

const setMode = (mode: string): void => {
  modeActive.value = mode;
  imgStore.setBgMode(mode);
  emit("setMode", mode);
};
</script>

<style scoped lang="scss">
.grid {
  position: fixed;
  right: 2px;
  top: 0;
  color: #aaaaaa88;
  font-size: 24px;
  :deep(.el-icon) {
    cursor: pointer;
  }
}
</style>
