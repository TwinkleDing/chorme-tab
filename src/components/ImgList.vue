<template>
  <div class="img-box">
    <div class="ex" @click="ex = !ex">
      <el-icon>
        <DArrowRight v-if="ex" />
        <DArrowLeft v-else />
      </el-icon>
    </div>
    <div v-show="!ex" class="box">
      <el-scrollbar>
        <div class="img-list" @mousewheel="mousewheel">
          <div
            :class="['img', bgIndex == index && 'active']"
            v-for="(item, index) in PageThImgList"
          >
            <img :src="item" alt="" @click="setBg(index)" />
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onMounted } from "vue";
import { DArrowRight, DArrowLeft } from "@element-plus/icons-vue";
import { PageThImgList } from "@/components/options.js";
import useImgStore from "@/store/img.js";

const imgStore = useImgStore();
const { getBgIndex, setBgIndex } = imgStore;

const ex = ref(true);
const bgIndex = ref(getBgIndex);

const setBg = (index) => {
  setBgIndex(index);
};
const mousewheel = (e) => {
  e.preventDefault();
  const content = document.getElementsByClassName("el-scrollbar__wrap")[0];
  if (e.deltaY > 0) {
    content.scrollLeft += content.clientWidth * 0.1;
  } else {
    content.scrollLeft -= content.clientWidth * 0.1;
  }
};
watch(
  () => imgStore.bgIndex,
  (e) => {
    setBgIndex(e);
    bgIndex.value = e;
  },
  {
    immediate: true,
    deep: true,
  }
);

onMounted(() => {});
</script>

<style lang="scss" scoped>
.img-box {
  position: fixed;
  left: 0;
  bottom: 0;
  height: 102px;
  display: flex;
  border: 1px solid #aaa;
  border-radius: 0 10px 10px 0;
  overflow: hidden;
  max-width: 100%;
  user-select: none;
  max-width: calc(100% - 12px);
  .ex {
    width: 24px;
    height: 100%;
    line-height: 100px;
    text-align: center;
    cursor: pointer;
    background: #cccccc88;
    color: #fff;
  }
  .box {
    height: 100%;
    padding: 0 6px;
    flex: 1;
    max-width: calc(100% - 24px);

    .img-list {
      display: flex;
      .img {
        cursor: pointer;
        height: 96px;
        border-radius: 2px;
        padding: 2px;
        margin: 2px;
        &.active {
          background: #fff;
        }
        img {
          height: 100%;
        }
      }
    }
  }
}
</style>
