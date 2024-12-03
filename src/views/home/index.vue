<!--
 * @Author: twinkleding
 * @Date: 2024-11-12 11:06:04
 * @LastEditTime: 2024-12-02 19:45:52
 * @LastEditors: twinkleding
 * @FilePath: \chorme-tab\src\views\home\index.vue
 * @Description: 
-->
<template>
  <div class="home" ref="home" @mousemove="pageMove">
    <div
      id="page"
      ref="page"
      @mousewheel="mousewheel"
      @mousedown="mouseDown"
      @mouseup="mouseUp"
      @dblclick="resetBg"
    >
      <!-- :style="
        bgMode === FULL_SCREEN
          ? {
              backgroundImage: `url(${pageBgImgList[bgIndex]})`,
              backgroundSize: bgSizeList[sizeIndex],
            }
          : {}
      " -->
      <img
        v-if="bgMode === FULL_SCREEN"
        :src="pageBgImgList[bgIndex]"
        :style="bgSizeList[sizeIndex]"
        draggable="false"
        @mouseout="mouseOut"
      />
      <div v-if="bgMode === GRID_SCREEN" id="page-bg-box">
        <div
          v-for="item in pageGridImgList"
          :style="{
            backgroundImage: `url(${item})`,
          }"
          @mouseout="mouseOut"
        ></div>
      </div>
    </div>
    <div
      id="box"
      ref="box"
      :class="['box', !boxUnfold && 'box-flod']"
      @mousedown="mouseDown"
      @mouseup="mouseUp"
      @mouseout="mouseOut"
    >
      <div class="tips">
        <span>{{ currentTime }}</span>
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
          <img :src="item.icon" alt="" draggable="false" />
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
    <grid @set-mode="setMode" />
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
import useMouseEvent from "@/hooks/useMouseEvent";

const router = useRouter();
const imgStore = useImgStore();
const { mouseDown, mouseMove, mouseUp, mouseOut } = useMouseEvent();
const {
  getBgIndex,
  setBgIndex,
  getSizeIndex,
  setSizeIndex,
  getBoxUnfold,
  setBoxUnfold,
  getBgMode,
  getBgW,
  setBgW,
  getBgH,
  setBgH,
  getBgX,
  setBgX,
  getBgY,
  setBgY,
  getSearchX,
  setSearchX,
  getSearchY,
  setSearchY,
} = imgStore;
const pageBgImgList = reactive(PageBgImgList);
const pageGridImgList = reactive(PageGridImgList);
const bgSizeList = reactive(BgSizeList);
const bgIndex = ref<number>(getBgIndex);
const sizeIndex = ref<number>(getSizeIndex);
const weather = ref<string>("");
const searchValue = ref<string>("");
const bgMode = ref<string>(getBgMode);
const currentTime = ref<string>(dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss"));
const controlDown = ref<boolean>(false);
const boxUnfold = ref<boolean>(getBoxUnfold);
const bookList = ref<Array[any]>(BookList);
let mouseTimer: any = null;

// 鼠标移动
const pageMove = (e: MouseEvent): void => {
  if (box.contains(e.target)) {
    const position = mouseMove(e, box);
    if (position) {
      setSearchX(position.left);
      setSearchY(position.top);
    }
  } else if (page.contains(e.target)) {
    const position = mouseMove(e, page);
    if (position) {
      setBgX(position.left);
      setBgY(position.top);
    }
  }
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

const mousewheel = (e: WheelEvent): void => {
  if (controlDown.value) return;
  const bgWidth = page.style.width.replace(/[^0-9|.]/gi, "") || page.clientWidth;
  const bgHeight = page.style.height.replace(/[^0-9|.]/gi, "") || page.clientHeight;
  let width = Number(bgWidth);
  let height = Number(bgHeight);
  if (width < 800 && e.deltaY > 0) return;
  if (e.deltaY < 0) {
    width *= 1.1;
    height *= 1.1;
  } else {
    width /= 1.1;
    height /= 1.1;
  }
  page.style.width = `${parseInt(width)}px`;
  page.style.height = `${parseInt(height)}px`;
  setBgW(page.style.width);
  setBgH(page.style.height);

  const bgLeft = page.style.left.replace(/[^-0-9|.]/gi, "") || 0;
  const bgTop = page.style.top.replace(/[^-0-9|.]/gi, "") || 0;
  page.style.left = `${bgLeft - ((e.layerX / bgWidth) * width - e.layerX)}px`;
  page.style.top = `${bgTop - ((e.layerY / bgHeight) * height - e.layerY)}px`;
  setBgX(page.style.left);
  setBgY(page.style.top);
};

// 切换背景图片
const bgChange = (type: number): void => {
  if (mouseTimer || controlDown.value) {
    return;
  }
  mouseTimer = setTimeout(() => {
    const maxIndex = pageBgImgList.length - 1;
    let index = bgIndex.value;
    index =
      type > 0 ? (index >= maxIndex ? 0 : index + 1) : index <= 0 ? maxIndex : index - 1;
    setBgIndex(index);
    bgIndex.value = index;
    clearTimeout(mouseTimer);
    mouseTimer = null;
  }, 1000);
};
// 按下上下键盘切换背景图
const bgSrcChange = (e: HTMLElement): void => {
  if (e.key === "ArrowUp") {
    bgChange(-1);
  }
  if (e.key === "ArrowDown") {
    bgChange(1);
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
    resetBg();
    setSizeIndex(index);
  }
  if (e.key === "ArrowRight") {
    index++;
    if (index > bgSizeList.length - 1) {
      index = 0;
    }
    sizeIndex.value = index;
    resetBg();
    setSizeIndex(index);
  }
};
// 监听键盘事件
const keyDown = (): void => {
  document.addEventListener("keydown", (e: KeyboardEvent): void => {
    if (["Control", "Alt", "Meta", "Shift"].includes(e.key)) {
      controlDown.value = true;
    } else if (
      bgMode.value == FULL_SCREEN &&
      e.target instanceof HTMLElement &&
      e.target.localName == "body"
    ) {
      bgSizeChange(e);
      bgSrcChange(e);
    }
  });
  document.addEventListener("keyup", (e: KeyboardEvent): void => {
    if (e.key === "Control") {
      controlDown.value = false;
    }
  });
};
const initBg = (): void => {
  getBgW && (page.style.width = getBgW);
  getBgH && (page.style.height = getBgH);
  getBgX && (page.style.left = getBgX);
  getBgY && (page.style.top = getBgY);
};
const resetBg = (): void => {
  page.style.width = "";
  page.style.height = "";
  page.style.left = "";
  page.style.top = "";
  setBgW("");
  setBgH("");
  setBgX("");
  setBgY("");
};
// 初始化背景图片,搜索框位置
const initBox = (): void => {
  if (getSearchX !== null) {
    box.style.left = getSearchX;
    box.style.top = getSearchY;
  }
};
// 获取当前时间
const getTime = (): void => {
  setInterval(() => {
    currentTime.value = dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss");
  }, 1000);
};
// 是否收缩
const setUnfold = (): void => {
  boxUnfold.value = !boxUnfold.value;
  setBoxUnfold(boxUnfold.value);
};
const setMode = (): void => {
  resetBg();
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
  initBg();
  initBox();
  keyDown();
  getTime();
});
</script>

<style lang="scss" scoped>
.home {
  height: 100%;
  width: 100%;
  position: relative;
}
#page {
  height: 100%;
  width: 100%;
  position: fixed;
  left: 0;
  top: 0;
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
    // min-width: 1920px;
    // min-height: 953px;
    display: flex;
    flex-wrap: wrap;
    overflow: hidden;
    div {
      width: 25%;
      height: 33.334%;
      background-repeat: no-repeat;
      background-position: 50% 50%;
    }
  }
}
.box {
  color: #fff;
  width: 622px;
  border: 1px solid #aaa;
  cursor: pointer;
  border-radius: 20px;
  position: fixed;
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
