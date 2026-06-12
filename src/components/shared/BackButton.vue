<template>
  <div class="back-btn" @click="goBack" title="返回首页">返回首页</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.push('/')
}
</script>

<style scoped>
.back-btn {
  cursor: pointer;
  color: #1890ff;
  font-size: 14px;
  user-select: none;
}
.back-btn:hover {
  color: #40a9ff;
}
</style>
