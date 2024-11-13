<!--
 * @Author: twinkleding
 * @Date: 2024-11-13 09:03:22
 * @LastEditTime: 2024-11-13 16:22:30
 * @LastEditors: twinkleding
 * @FilePath: \chorme-tab\src\components\Back.vue
 * @Description: 
-->
<template>
  <div @click="back">返回首页</div>
</template>
<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const back = () => {
  router.push("/");
};
</script>

<style lang="scss" scoped></style>
