<!--
 * @Author: twinkleding
 * @Date: 2024-11-12 13:42:35
 * @LastEditTime: 2024-11-12 18:10:41
 * @LastEditors: twinkleding
 * @FilePath: \chorme-tab\src\views\story\index.vue
 * @Description: 
-->
<template>
  <div class="story">
    <div v-html="text"></div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import axios from "axios";
import markdown from "markdown";

const text = ref("");

const getStory = async () => {
  const res = await axios.get("./story/小说.md");
  text.value = markdown.markdown.toHTML(res.data);
};
getStory();
</script>

<style lang="scss" scoped>
.story {
  height: 100%;
  width: 100%;
  overflow-y: auto;
}
</style>
