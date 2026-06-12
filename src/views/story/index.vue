<template>
  <div class="story">
    <el-scrollbar>
      <div class="text">
        <p v-for="(item, i) in lines" :key="i">
          <h3 v-if="item.includes('###')">{{ item.replace('###', '') }}</h3>
          <template v-else>{{ item }}</template>
        </p>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const text = ref('')
const lines = ref<string[]>([])

onMounted(async () => {
  const res = await axios.get('./story/小说.txt')
  text.value = res.data
  lines.value = res.data.split('\n')
})
</script>

<style lang="scss" scoped>
.story {
  height: 100%;
  width: 100%;
  overflow: hidden;

  .text {
    margin: 0 auto;
    width: 800px;
    height: 100%;
    overflow-y: auto;
    padding-bottom: 100px;

    p {
      text-indent: 2em;
      line-height: 32px;
    }
  }
}
</style>
