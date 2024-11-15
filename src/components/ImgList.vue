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
const imgHasClick = ref(false);

const setBg = (index) => {
  imgHasClick.value = true;
  setBgIndex(index);
  bgIndex.value = index;
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
const setCurrentCenter = (oldValue) => {
  let timer;
  const content = document.getElementsByClassName("el-scrollbar__wrap")[0];
  const imgWidth = 142;
  setTimeout(() => {
    const halfIndex = parseInt(content.clientWidth / 2 / imgWidth);
    let scrollLeft = content.scrollLeft;
    let scrollIndex = 0;
    // 新的值和旧的值都小于一般，不进行滚动
    if (bgIndex.value <= halfIndex && oldValue <= halfIndex) {
      content.scrollLeft = 0;
    } else {
      // 打开列表，如果有过滚动，不让再滚动
      if (oldValue == -1 && content.scrollLeft > 0) {
        scrollIndex = 0;
      } else if (oldValue <= halfIndex) {
        // 旧的值小于一半，新的值大于一半，从一半开始计算滚动次数
        scrollIndex = bgIndex.value - halfIndex;
      } else {
        // 旧的值和新的值都大于一半，直接计算差值滚动次数
        scrollIndex = bgIndex.value - oldValue;
      }
    }
    timer = setInterval(() => {
      // 向后滚动
      if (scrollIndex > 0) {
        content.scrollLeft += imgWidth;
        scrollIndex--;
      }
      // 向前滚动;
      if (scrollIndex < 0) {
        content.scrollLeft -= imgWidth;
        scrollIndex++;
      }
      if (scrollIndex == 0) {
        clearInterval(timer);
      }
    }, 10);
  }, 10);
};
watch(
  () => imgStore.bgIndex,
  (newValue, oldValue) => {
    if (!imgHasClick.value) {
      setCurrentCenter(oldValue);
    }
    bgIndex.value = newValue;
    imgHasClick.value = false;
  }
);
watch(
  () => ex.value,
  (e) => {
    !e && setCurrentCenter(-1);
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
          height: 92px;
          width: 138px;
        }
      }
    }
  }
}
</style>
