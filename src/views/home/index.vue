<template>
  <div
    id="page"
    ref="page"
    @mousemove="pageMove"
    :style="{
      backgroundImage: `url(${pageBgImgList[pageBgImg]})`,
      backgroundSize: bgSizeList[bgSize],
    }"
  >
    <!-- @mousewheel="mousewheel" -->
    <div id="box" ref="box" @mousedown="boxDown" @mouseup="boxUp">
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
      <div v-show="ex" id="book" class="book">
        <div class="book-item" v-for="item in bookList" @click="goBook(item.href)">
          <img :src="item.icon" alt="" />
          <div class="book-title">{{ item.title }}</div>
        </div>
      </div>
      <div class="ex" @click="setEx">
        <el-icon>
          <TopLeft v-if="ex" />
          <BottomRight v-else />
        </el-icon>
      </div>
    </div>
    <img-list />
  </div>
</template>
<script setup>
import { ref, watch, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { TopLeft, BottomRight } from "@element-plus/icons-vue";
import { dateFormat } from "@/utils.js";
import ImgList from "@/components/ImgList.vue";
import { setStorage, getStorage } from "@/utils.js";
import { PageBgImgList, BookList } from "@/components/options.js";
import useImgStore from "@/store/img.js";

const router = useRouter();
const imgStore = useImgStore();
const { bgIndex, getBgIndex, setBgIndex } = imgStore;
const box = ref();
const boxMove = ref(false);
const startX = ref(0);
const startY = ref(0);
const weather = ref("");
const bookList = ref(BookList);
const searchValue = ref("");
const pageBgImg = ref(0);
const pageBgImgList = reactive(PageBgImgList);
let mouseTimer = null;
const controlDown = ref(false);
const bgSizeList = ["100% 100%", "cover", "contain"];
const bgSize = ref(0);
const dateTime = ref(dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss"));
const ex = ref(1);

// 鼠标按下
const boxDown = (e) => {
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
const pageMove = (e) => {
  if (boxMove.value) {
    box.value.style.left = e.clientX - startX.value + "px";
    box.value.style.top = e.clientY - startY.value + "px";
    setStorage("searchX", box.value.style.left);
    setStorage("searchY", box.value.style.top);
  }
};
// 鼠标松开
const boxUp = (e) => {
  boxMove.value = false;
};
// 跳转书签
const goBook = (e) => {
  if (e.startsWith("http://") || e.startsWith("https://")) {
    window.open(e);
  } else {
    router.push(e);
  }
};
const enter = () => {
  if (searchValue.value.startsWith("www.")) {
    window.open("http://" + searchValue.value);
    return;
  }
  window.open("http://www.baidu.com/s?wd=" + searchValue.value);
  searchValue.value = "";
};
// 鼠标滚轮切换背景图片
const mousewheel = async (e) => {
  if (mouseTimer || controlDown.value) {
    return;
  }
  mouseTimer = setTimeout(() => {
    let index = pageBgImg.value;
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
    pageBgImg.value = index;
    clearTimeout(mouseTimer);
    mouseTimer = null;
  }, 1000);
};
// 按下上下键盘切换背景图
const bgSrcChange = (e) => {
  if (e.key === "ArrowUp") {
    mousewheel({ deltaY: -1 });
  }
  if (e.key === "ArrowDown") {
    mousewheel({ deltaY: 1 });
  }
};
// 按左右键切换背景图的size
const bgSizeChange = (e) => {
  if (e.key === "ArrowLeft") {
    let index = bgSize.value;
    index--;
    if (index < 0) {
      index = bgSizeList.length - 1;
    }
    bgSize.value = index;
    setStorage("bgSize", index);
  }
  if (e.key === "ArrowRight") {
    let index = bgSize.value;
    index++;
    if (index > bgSizeList.length - 1) {
      index = 0;
    }
    bgSize.value = index;
    setStorage("bgSize", index);
  }
};
// 监听键盘事件
const keyDown = (e) => {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Control") {
      controlDown.value = true;
    }
    bgSizeChange(e);
    bgSrcChange(e);
  });
  document.addEventListener("keyup", (e) => {
    if (e.key === "Control") {
      controlDown.value = false;
    }
  });
};
// 初始化背景图片,搜索框位置
const initBox = () => {
  if (getBgIndex !== null) {
    pageBgImg.value = getBgIndex;
  }
  let searchX = getStorage("searchX");
  if (searchX !== null) {
    box.value.style.left = searchX;
    box.value.style.top = getStorage("searchY");
  }
  bgSize.value = getStorage("bgSize") || bgSize.value;
  ex.value = parseInt(getStorage("ex"));
};
// 获取当前时间
const getTime = () => {
  setInterval(() => {
    dateTime.value = dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss");
  }, 1000);
};
// 是否收缩
const setEx = () => {
  if (ex.value == 1) {
    ex.value = 0;
  } else {
    ex.value = 1;
  }
  setStorage("ex", ex.value);
};
watch(
  () => imgStore.bgIndex,
  (e) => {
    pageBgImg.value = e;
  },
  {
    immediate: true,
    deep: true,
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
  z-index: 0;
  background-repeat: no-repeat;
}
#box {
  width: 622px;
  border: 1px solid #aaa;
  cursor: pointer;
  border-radius: 20px;
  position: absolute;
  left: 40%;
  top: 20%;
  user-select: none;
  z-index: 2;
  padding: 0 20px 20px;

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
  .ex {
    position: absolute;
    bottom: 0;
    right: 5px;
    font-size: 20px;
    font-weight: 700;
    color: #aaa;
    cursor: pointer;
  }
}
</style>
