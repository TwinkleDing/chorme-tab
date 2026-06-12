<template>
  <div class="grid">
    <el-icon>
      <PictureFilled v-if="modeActive === GRID_SCREEN" @click="setMode(FULL_SCREEN)" />
      <Grid v-if="modeActive === FULL_SCREEN" @click="setMode(GRID_SCREEN)" />
    </el-icon>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PictureFilled, Grid } from '@element-plus/icons-vue'
import useBackgroundStore from '@/stores/background'
import { FULL_SCREEN, GRID_SCREEN } from '@/utils/constants'

const store = useBackgroundStore()
const emit = defineEmits<{ setMode: [mode: string] }>()

const modeActive = ref<string>(store.getBgMode)

function setMode(mode: string) {
  modeActive.value = mode
  store.setBgMode(mode)
  emit('setMode', mode)
}
</script>

<style scoped lang="scss">
.grid {
  position: fixed;
  right: 2px;
  top: 0;
  color: #aaaaaa88;
  font-size: 24px;
  :deep(.el-icon) { cursor: pointer; }
}
</style>
