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
import { ref,onMounted } from "vue";

const sec2 = ref<HTMLElement>();

onMounted(() => {


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
