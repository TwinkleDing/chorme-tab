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
    <back />
    <el-scrollbar>
      <div class="text" v-html="text"></div>
    </el-scrollbar>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import markdown from "markdown";
import Back from "@/components/Back.vue";

const text = ref("");

const getStory = async () => {
  const res = await axios.get("./story/小说.md");
  text.value = markdown.markdown.toHTML(res.data);
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
  }
}
</style>
