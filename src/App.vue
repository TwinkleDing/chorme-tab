<template>
  <div id="page" ref="page" @mousemove="pageMove">
    <div id="box" ref="box" class="book" @mousedown="boxDown" @mouseup="boxUp">
      <div class="weather">{{ weather }}</div>
      <div class="book-input">
        <input ref="input" type="text" @keyup.enter.native="enter" />
      </div>
      <div class="book-item" v-for="item in bookList" @click="goBook(item.href)">
        <img :src="item.icon" alt="" />
        <div class="book-title">{{ item.title }}</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
const box = ref();
const input = ref();
const boxMove = ref(false);
const startX = ref(0);
const startY = ref(0);
const weather = ref("");
const bookList = ref([
  {
    title: "百度",
    href: "http://www.baidu.com",
    icon: "https://www.baidu.com/img/bd_logo1.png",
  },
  {
    title: "百度",
    href: "http://www.baidu.com",
    icon: "./img/guo2.jpg",
  },
  {
    title: "百度",
    href: "http://www.baidu.com",
  },
  {
    title: "百度",
    href: "http://www.baidu.com",
  },
  {
    title: "百度",
    href: "http://www.baidu.com",
  },
  {
    title: "百度",
    href: "http://www.baidu.com",
  },
  {
    title: "百度",
    href: "http://www.baidu.com",
  },
]);

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
const enter = () => {
  window.open("http://www.baidu.com/s?wd=" + input.value.value);
  input.value.value = "";
};
const getWeather = () => {
  // 查询雁塔实时天气
  $.ajax({
    url: "https://restapi.amap.com/v3/weather/weatherInfo",
    type: "get",
    data: {
      key: "e6f02b5801b9a63514e07311a315af9f",
      city: "610113",
      extensions: "base", // base 实时天气,all 预报天气
    },
    success: (res) => {
      console.log(res);
      let w = res.lives[0];
      weather.value = `今日天气：${w.city}：温度：${w.temperature}℃`;
    },
  });
};

onMounted(() => {
  // getWeather();
});
</script>

<style lang="scss" scoped>
#page {
  height: 100%;
  width: 100%;
  position: relative;
}

#page {
  background-image: url("/img/guo.jpg");
  background-size: 100% auto;
  color: #fff;
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
}

.weather {
  display: inline-block;
  padding: 10px 20px;
  height: 40px;
}

.book-input {
  width: 100%;
  height: 40px;
  margin-bottom: 20px;
  padding: 0 20px;
}

.book-input input {
  width: 100%;
  height: 100%;
  border: 0;
  outline: 0;
  font-size: 18px;
  padding: 0 20px;
  border-radius: 20px;
  box-sizing: border-box;
}

.book-item {
  display: inline-block;
  width: 100px;
  height: 140px;
  text-align: center;
  border: 1px solid #eee;
  border-radius: 10%;
  margin-left: 20px;
  margin-bottom: 10px;
}

.book-item img {
  height: 80px;
  width: 80px;
  border-radius: 50%;
  margin: 10px 0;
}

.book-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
