<template>
  <div id="page" ref="page" @mousemove="pageMove">
    <div
      class="video"
      v-if="background === 'v'"
      oncontextmenu="self.event.returnValue=false"
    >
      <video class="v" :src="'/img/v3.MOV'" autoplay muted loop></video>
      <video class="v" :src="'/img/v2.MOV'" autoplay muted loop></video>
      <video class="v" :src="'/img/v1.MOV'" autoplay muted loop></video>
    </div>
    <div id="box" ref="box" class="book" @mousedown="boxDown" @mouseup="boxUp">
      <div class="weather">{{ weather }}</div>
      <div class="book-input">
        <input
          v-model="searchValue"
          ref="input"
          placeholder="在百度中搜索，或者输入网址"
          type="text"
          @keyup.enter.native="enter"
        />
      </div>
      <div>
        <div class="book-item" v-for="item in bookList" @click="goBook(item.href)">
          <img :src="item.icon" alt="" />
          <div class="book-title">{{ item.title }}</div>
        </div>
      </div>
      <div
        :class="['switch', background === 'v' && 'switch-v']"
        @click="switchBackground"
      >
        <img :src="`/img/switch.png`" alt="" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
const box = ref();
const boxMove = ref(false);
const startX = ref(0);
const startY = ref(0);
const weather = ref("");
const background = ref("p");
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
  {
    title: "DOTA2贴吧",
    href: "https://tieba.baidu.com/f?ie=utf-8&kw=dota2&fr=search",
    icon: "https://www.dota2.com.cn/favicon.ico",
  },
]);
const searchValue = ref("");

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
  }
};
const boxUp = (e) => {
  boxMove.value = false;
};
const goBook = (e) => {
  window.open(e);
};
const enter = (e) => {
  if (searchValue.value.startsWith("http://") || searchValue.value.startsWith("www.")) {
    window.open(searchValue.value);
    return;
  }
  window.open("http://www.baidu.com/s?wd=" + searchValue.value);
  searchValue.value = "";
};
const switchBackground = () => {
  background.value = background.value === "p" ? "v" : "p";
};

onMounted(() => {});
</script>

<style lang="scss" scoped>
#page {
  height: 100%;
  width: 100%;
  position: relative;
  color: #fff;
  z-index: 0;
  background-image: url("/img/guo.jpg");
  background-size: cover;
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
      width: 100px;
      height: 140px;
      text-align: center;
      border-radius: 10%;
      margin-left: 20px;
      margin-bottom: 10px;
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
      // color: transparent;
      // -webkit-background-clip: text;
      // background-image: linear-gradient(to right, blue, red);
    }
  }
  .switch {
    position: absolute;
    right: -1px;
    bottom: -1px;
    height: 40px;
    width: 40px;
    border-radius: 20px;
    border: 1px solid;
    overflow: hidden;
    transform: rotateY(0deg);
    transition: 0.5s;
    &-v {
      transform: rotateY(180deg);
    }
    img {
      height: 100%;
      width: 100%;
    }
  }
}
.video {
  height: 100%;
  width: 100%;
  display: flex;
}
</style>
