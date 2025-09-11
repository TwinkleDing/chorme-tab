<!--
 * @Author: twinkleding
 * @Date: 2024-11-12 13:42:35
 * @LastEditTime: 2024-11-13 16:21:14
 * @LastEditors: twinkleding
 * @FilePath: \chorme-tab\src\views\story\index.vue
 * @Description: 
-->
<template>
  <div class="story">
    <el-scrollbar>
      <div class="text">
        <p v-for="item in text.split('\n')">
        <h3 v-if="item.includes('###')">{{ item.replace('###', '') }}</h3>
        <template v-else>{{ item }}</template>
        </p>
      </div>
    </el-scrollbar>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const text = ref("");

const getStory = async () => {
  const res = await axios.get("./story/小说.txt");

  text.value = res.data;
};

onMounted(() => {
  getStory();
});
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
