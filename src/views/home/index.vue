<template>
  <!-- @mousewheel="mousewheel" -->
  <div
    id="page"
    ref="page"
    @mousemove="pageMove"
    :style="
      bgMode === FULL_SCREEN
        ? {
            backgroundImage: `url(${pageBgImgList[bgIndex]})`,
            backgroundSize: bgSizeList[sizeIndex],
          }
        : {}
    "
  >
    <div v-if="bgMode === GRID_SCREEN" id="page-bg-box">
      <div
        v-for="item in pageGridImgList"
        :style="{
          backgroundImage: `url(${item})`,
        }"
      ></div>
    </div>
    <div
      id="box"
      ref="box"
      :class="['box', !boxUnfold && 'box-flod']"
      @mousedown="boxDown"
      @mouseup="boxUp"
    >
      <div class="tips">
        <span>{{ dateTime }}</span>
      </div>
      <div class="search-input">
        <input
          v-model="searchValue"
          ref="input"
          placeholder="搜索..."
          type="text"
          @keyup.enter.native="enter"
        />
      </div>
      <div id="book" class="book">
        <div class="book-item" v-for="item in bookList" @click="goBook(item.href)">
          <img :src="item.icon" alt="" />
          <div class="book-title">{{ item.title }}</div>
        </div>
      </div>
      <div class="boxUnfold" @click="setUnfold">
        <el-icon>
          <TopLeft v-if="boxUnfold" />
          <BottomRight v-else />
        </el-icon>
      </div>
    </div>
    <img-list v-if="bgMode == FULL_SCREEN" />
    <grid />
  </div>
</template>
<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref, watch, onMounted, reactive } from "vue";
import { TopLeft, BottomRight } from "@element-plus/icons-vue";
import useImgStore from "@/store/img.ts";
import ImgList from "@/components/ImgList.vue";
import Grid from "@/components/Grid.vue";
import { setStorage, getStorage, dateFormat } from "@/utils";
import { FULL_SCREEN, GRID_SCREEN } from "@/utils/constant";
import {
  PageBgImgList,
  PageGridImgList,
  BgSizeList,
  BookList,
} from "@/components/Options.js";

const router = useRouter();
const imgStore = useImgStore();
const {
  getBgIndex,
  setBgIndex,
  getSizeIndex,
  setSizeIndex,
  getBoxUnfold,
  setBoxUnfold,
  getBgMode,
} = imgStore;
const pageBgImgList = reactive(PageBgImgList);
const pageGridImgList = reactive(PageGridImgList);
const bgSizeList = reactive(BgSizeList);
const box = ref<HTMLElement>();
const startX = ref<number>(0);
const startY = ref<number>(0);
const bgIndex = ref<number>(getBgIndex);
const sizeIndex = ref<number>(getSizeIndex);
const weather = ref<string>("");
const searchValue = ref<string>("");
const bgMode = ref<string>(getBgMode);
const dateTime = ref<string>(dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss"));
const boxMove = ref<boolean>(false);
const controlDown = ref<boolean>(false);
const boxUnfold = ref<boolean>(getBoxUnfold == "true" ? true : false);
const bookList = ref<Array[any]>(BookList);
let mouseTimer: any = null;

// 鼠标按下
const boxDown = (e: HTMLElement): void => {
  if (e.target.id === "box") {
    startX.value = e.offsetX;
    startY.value = e.offsetY;
    boxMove.value = true;
  }
  if (e.target.id === "book") {
    startX.value = e.offsetX + 21;
    startY.value = e.offsetY + 101;
    boxMove.value = true;
  }
};
// 鼠标移动
const pageMove = (e: HTMLElement): void => {
  if (boxMove.value) {
    box.value.style.left = e.clientX - startX.value + "px";
    box.value.style.top = e.clientY - startY.value + "px";
    setStorage("searchX", box.value.style.left);
    setStorage("searchY", box.value.style.top);
  }
};
// 鼠标松开
const boxUp = (): void => {
  boxMove.value = false;
};
// 跳转书签
const goBook = (path: string): void => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    window.open(path);
  } else {
    router.push(path);
  }
};
const enter = (): void => {
  if (searchValue.value.startsWith("www.")) {
    window.open("http://" + searchValue.value);
  } else {
    window.open("http://www.baidu.com/s?wd=" + searchValue.value);
    searchValue.value = "";
  }
};
// 鼠标滚轮切换背景图片
const mousewheel = async (e: HTMLElement): void => {
  if (mouseTimer || controlDown.value) {
    return;
  }
  mouseTimer = setTimeout(() => {
    let index = bgIndex.value;
    if (e.deltaY > 0) {
      if (index >= pageBgImgList.length - 1) {
        index = 0;
      } else {
        index++;
      }
    } else {
      if (index <= 0) {
        index = pageBgImgList.length - 1;
      } else {
        index--;
      }
    }
    setBgIndex(index);
    bgIndex.value = index;
    clearTimeout(mouseTimer);
    mouseTimer = null;
  }, 1000);
};
// 按下上下键盘切换背景图
const bgSrcChange = (e: HTMLElement): void => {
  if (e.key === "ArrowUp") {
    mousewheel({ deltaY: -1 });
  }
  if (e.key === "ArrowDown") {
    mousewheel({ deltaY: 1 });
  }
};
// 按左右键切换背景图的size
const bgSizeChange = (e: HTMLElement): void => {
  let index = sizeIndex.value;
  if (e.key === "ArrowLeft") {
    index--;
    if (index < 0) {
      index = bgSizeList.length - 1;
    }
    sizeIndex.value = index;
  }
  if (e.key === "ArrowRight") {
    index++;
    if (index > bgSizeList.length - 1) {
      index = 0;
    }
    sizeIndex.value = index;
  }
  setSizeIndex(index);
};
// 监听键盘事件
const keyDown = (): void => {
  document.addEventListener("keydown", (e: HTMLElement): void => {
    if (e.key === "Control") {
      controlDown.value = true;
    }
    if (e.target.localName == "body" && bgMode == FULL_SCREEN) {
      bgSizeChange(e);
      bgSrcChange(e);
    }
  });
  document.addEventListener("keyup", (e: HTMLElement): void => {
    if (e.key === "Control") {
      controlDown.value = false;
    }
  });
};
// 初始化背景图片,搜索框位置
const initBox = (): void => {
  let searchX = getStorage("searchX");
  if (searchX !== null) {
    box.value.style.left = searchX;
    box.value.style.top = getStorage("searchY");
  }
};
// 获取当前时间
const getTime = (): void => {
  setInterval(() => {
    dateTime.value = dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss");
  }, 1000);
};
// 是否收缩
const setUnfold = (): void => {
  boxUnfold.value = !boxUnfold.value;
  setBoxUnfold(boxUnfold.value);
};

watch(
  () => imgStore.bgIndex,
  (e) => {
    bgIndex.value = e;
  }
);
watch(
  () => imgStore.sizeIndex,
  (e) => {
    sizeIndex.value = e;
  }
);
watch(
  () => imgStore.bgMode,
  (e) => {
    bgMode.value = e;
  }
);
onMounted(() => {
  initBox();
  keyDown();
  getTime();
});
</script>

<style lang="scss" scoped>
#page {
  height: 100%;
  width: 100%;
  position: relative;
  color: #fff;
  background-repeat: no-repeat;
  &-bg {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 0;
  }
  &-bg-box {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 0;
    height: 100%;
    width: 100%;
    min-width: 1920px;
    min-height: 953px;
    display: flex;
    flex-wrap: wrap;
    div {
      width: 25%;
      min-width: 480px;
      height: 33.33333%;
      background-repeat: no-repeat;
    }
  }
}
.box {
  width: 622px;
  border: 1px solid #aaa;
  cursor: pointer;
  border-radius: 20px;
  position: absolute;
  left: 40%;
  top: 20%;
  user-select: none;
  z-index: 2;
  padding: 0 20px;

  .tips {
    display: inline-block;
    height: 40px;
    line-height: 40px;
  }
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
      background: #ffffffaa;
    }
  }
  .book {
    display: inline-block;
    height: 280px;
    margin-bottom: 20px;
    &-item {
      display: inline-block;
      text-align: center;
      border-radius: 10%;
      margin: 0 20px 15px;
      img {
        height: 80px;
        width: 80px;
        margin: 10px 0;
      }
    }
    &-title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 16px;
    }
  }
  .boxUnfold {
    position: absolute;
    bottom: 0;
    right: 5px;
    font-size: 20px;
    font-weight: 700;
    color: #aaa;
    cursor: pointer;
  }
}
.box-flod {
  .book {
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
}
</style>
