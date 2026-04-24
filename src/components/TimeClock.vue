<template>
	<div class="clock-box">
		<div class="hou-1" ref="hou1">2</div>
		<div class="hou-2" ref="hou2">3</div>
		<span>:</span>
		<div class="min-1" ref="min1">4</div>
		<div class="min-2" ref="min2">5</div>
		<span>:</span>
		<div class="sec-1" ref="sec1">6</div>
		<div class="sec-2" ref="sec2">
			<div>0</div>
			<div>1</div>
			<div>2</div>
			<div>3</div>
			<div>4</div>
			<div>5</div>
			<div>6</div>
			<div>7</div>
			<div>8</div>
			<div>9</div>
			<div>0</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const hou1 = ref<HTMLElement>();
const hou2 = ref<HTMLElement>();
const min1 = ref<HTMLElement>();
const min2 = ref<HTMLElement>();
const sec1 = ref<HTMLElement>();
const sec2 = ref<HTMLElement>();
let timeInterval: number | null = null;

// 更新时间
const updateTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  
  // 更新小时
  if (hou1.value) {
    hou1.value.textContent = hours[0];
  }
  if (hou2.value) {
    hou2.value.textContent = hours[1];
  }
  
  // 更新分钟
  if (min1.value) {
    min1.value.textContent = minutes[0];
  }
  if (min2.value) {
    min2.value.textContent = minutes[1];
  }
  
  // 更新秒
  if (sec1.value) {
    sec1.value.textContent = seconds[0];
  }
  // sec2通过动画实现，不需要手动更新
};

onMounted(() => {
  // 初始化时间
  updateTime();
  // 每秒更新一次时间
  timeInterval = window.setInterval(updateTime, 1000);
});

onUnmounted(() => {
  // 清除定时器
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

<style lang="scss" scoped>
.clock-box {
	position: fixed;
	left: 0;
	top: 0;
	width: 400px;
	height: 70px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 60px;
	color: #333;
	font-family: "Courier New", Courier, monospace;
	overflow: hidden;
	& > div {
		display: inline-block;
		height: 70px;
		width: 40px;
		line-height: 70px;
		position: relative;
	}
	.sec-2 {
		overflow: hidden;
		div {
			height: 70px;
			width: 40px;
			line-height: 70px;
			animation: t7 10s steps(700) infinite;
		}
	}
	@keyframes t7 {
		from {
			transform: translateY(0);
		}
		to {
			transform: translateY(-700px);
		}
	}
}
</style>
