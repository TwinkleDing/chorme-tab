<template>
  <div class="search-input">
    <input
      v-model="searchText"
      placeholder="搜索..."
      type="text"
      @keyup.enter="onEnter"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const searchText = ref('')

const emit = defineEmits<{ enter: [value: string] }>()

function onEnter() {
  const val = searchText.value.trim()
  if (!val) return

  if (val.startsWith('www.')) {
    window.open('http://' + val)
  } else {
    window.open('http://www.baidu.com/s?wd=' + val)
  }
  emit('enter', val)
  searchText.value = ''
}
</script>

<style lang="scss" scoped>
.search-input {
  width: 100%;
  height: 40px;
  margin-bottom: 20px;

  input {
    width: 100%;
    height: 100%;
    border: 0;
    outline: 0;
    font-size: 18px;
    padding: 0 20px;
    border-radius: 20px;
    box-sizing: border-box;
    background-color: transparent;
    box-shadow: 0 0 10px #00000033;
    color: #fff;

    &::placeholder {
      color: #fff;
    }
  }
}
</style>
