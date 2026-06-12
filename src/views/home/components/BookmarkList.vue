<template>
  <div id="book" :class="['book', { 'book-folded': !unfolded }]">
    <div v-for="item in items" :key="item.href" class="book-item" @click="goBook(item.href)">
      <img :src="item.icon" alt="" draggable="false" />
      <div class="book-title">{{ item.title }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Bookmark } from '@/config/bookmarks'

defineProps<{
  items: Bookmark[]
  unfolded: boolean
}>()

function goBook(path: string) {
  if (/^https?:\/\/[^\s]+$/.test(path)) {
    window.open(path)
  } else {
    window.open(window.location.href + path)
  }
}
</script>

<style lang="scss" scoped>
.book {
  display: inline-block;
  height: 280px;
  margin-bottom: 20px;
}

.book-item {
  display: inline-block;
  text-align: center;
  border-radius: 10%;
  margin: 0 20px 15px;
  cursor: pointer;

  img {
    height: 80px;
    width: 80px;
    margin: 10px 0;
  }
}

.book-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 16px;
}

.book-folded {
  height: 20px;
  margin-bottom: 0;
  position: relative;
  top: -8px;

  .book-item {
    margin: 0 10px 0 0;

    img {
      height: 20px;
      width: 20px;
      margin: 0;
    }

    .book-title {
      display: none;
    }
  }
}
</style>
