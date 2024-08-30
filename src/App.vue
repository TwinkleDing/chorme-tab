<template>
  <div
    id="page"
    ref="page"
    @mousemove="pageMove"
    @mousewheel="mousewheel"
    :style="{
      backgroundImage: `url(${pageBgImgList[pageBgImg]})`,
      backgroundSize: bgSizeList[bgSize],
    }"
  >
    <div id="box" ref="box" class="book" @mousedown="boxDown" @mouseup="boxUp">
      <div class="weather">{{ weather }}</div>
      <div class="book-input">
        <input
          v-model="searchValue"
          ref="input"
          placeholder="搜索..."
          type="text"
          @keyup.enter.native="enter"
        />
      </div>
      <div class="book-item" v-for="item in bookList" @click="goBook(item.href)">
        <img :src="item.icon" alt="" />
        <div class="book-title">{{ item.title }}</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, reactive } from "vue";
import { setStorage, getStorage } from "./utils.js";
const box = ref();
const boxMove = ref(false);
const startX = ref(0);
const startY = ref(0);
const weather = ref("");
const bookList = ref([
  {
    title: "百度",
    href: "http://www.baidu.com",
    icon: "https://www.baidu.com/favicon.ico",
  },
  {
    title: "有道翻译",
    href: "https://fanyi.youdao.com",
    icon: "https://shared-https.ydstatic.com/images/favicon.ico",
  },
]);
const searchValue = ref("");
const pageBgImg = ref(0);
const pageBgImgList = reactive([
  "/img/guo1.jpg",
  "/img/guo2.jpg",
  "/img/guo3.jpg",
  "/img/guo4.jpg",
  "/img/guo5.jpg",
  "/img/guo6.jpg",
  "/img/guo7.jpg",
  "/img/guo8.jpg",
  "/img/guo9.jpg",
  "/img/guo10.jpg",
  "/img/guo11.jpg",
]);
let myTimer = null;
const controlDown = ref(false);
const bgSizeList = reactive(["cover", "contain", "100% 100%", "100% auto", "auto 100%"]);
const bgSize = ref(0);

const boxDown = (e) => {
  if (e.target.id === "box") {
    startX.value = e.offsetX;
    startY.value = e.offsetY;
    boxMove.value = true;
  }
};
const pageMove = (e) => {
  if (boxMove.value) {
    box.value.style.left = e.clientX - startX.value + "px";
    box.value.style.top = e.clientY - startY.value + "px";
    setStorage("searchX", box.value.style.left);
    setStorage("searchY", box.value.style.top);
  }
};
const boxUp = (e) => {
  boxMove.value = false;
};
const goBook = (e) => {
  window.open(e);
};
const enter = () => {
  if (searchValue.value.startsWith("www.")) {
    window.open("http://" + searchValue.value);
    return;
  }
  window.open("http://www.baidu.com/s?wd=" + searchValue.value);
  searchValue.value = "";
};
const mousewheel = async (e) => {
  if (myTimer || controlDown.value) {
    return;
  }
  myTimer = setTimeout(() => {
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
    setStorage("bgIndex", index);
    pageBgImg.value = index;
    clearTimeout(myTimer);
    myTimer = null;
  }, 1000);
};

const bgSrcChange = (e) => {
  if (e.key === "ArrowUp") {
    mousewheel({ deltaY: -1 });
  }
  if (e.key === "ArrowDown") {
    mousewheel({ deltaY: 1 });
  }
};
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
const init = () => {
  let bgIndex = getStorage("bgIndex");
  if (bgIndex !== null) {
    pageBgImg.value = bgIndex;
  }
  let searchX = getStorage("searchX");
  if (searchX !== null) {
    box.value.style.left = searchX;
    box.value.style.top = getStorage("searchY");
  }
  bgSize.value = getStorage("bgSize") || bgSize.value;
};
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

onMounted(() => {
  init();
  keyDown();
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
  height: 402px;
  width: 622px;
  border: 1px solid #eee;
  cursor: pointer;
  border-radius: 20px;
  position: absolute;
  left: 40%;
  top: 20%;
  user-select: none;
  z-index: 2;

  .weather {
    display: inline-block;
    padding: 10px 20px;
    height: 40px;
  }
  .book {
    &-input {
      width: 100%;
      height: 40px;
      margin-bottom: 20px;
      padding: 0 20px;
      input {
        width: 100%;
        height: 100%;
        border: 0;
        outline: 0;
        font-size: 18px;
        padding: 0 20px;
        border-radius: 20px;
        box-sizing: border-box;
      }
    }
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
}
</style>
