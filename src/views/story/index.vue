<template>
  <div class="story">
    <el-scrollbar>
      <div class="text" v-if="!loading && !error">
        <div v-for="(item, i) in lines" :key="i" class="paragraph">
          <h3 v-if="item.includes('###')">{{ item.replace('###', '') }}</h3>
          <template v-else>{{ item }}</template>
        </div>
      </div>
      <div v-else class="status" role="status">{{ loading ? '正在加载小说...' : error }}</div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const lines = ref<string[]>([])
const loading = ref(true)
const error = ref('')
const controller = new AbortController()

onMounted(async () => {
  try {
    const response = await fetch('./story/小说.md', { signal: controller.signal })
    if (!response.ok) throw new Error('小说加载失败，请稍后再试')
    lines.value = (await response.text()).split(/\r?\n/)
  } catch (e) {
    if (!controller.signal.aborted) error.value = e instanceof Error ? e.message : '小说加载失败'
  } finally {
    loading.value = false
  }
})
onUnmounted(() => controller.abort())
</script>

<style lang="scss" scoped>
.story {
  height: 100%;
  width: 100%;
  overflow: hidden;

  .text {
    margin: 0 auto;
    width: min(800px, 100%);
    height: 100%;
    overflow-y: auto;
    padding-bottom: 100px;

    .paragraph {
      text-indent: 2em;
      line-height: 32px;
    }
  }
  .status { padding: 32px; text-align: center; }
}
</style>
