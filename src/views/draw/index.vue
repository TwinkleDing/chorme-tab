<!--
 * @Author: twinkleding
 * @Date: 2024-11-12 11:11:46
 * @LastEditTime: 2024-12-02 19:44:11
 * @LastEditors: twinkleding
 * @FilePath: \chorme-tab\src\views\draw\index.vue
 * @Description: 
-->
<template>
	<div ref="draw" id="draw">
		<div class="bg">
			<img v-if="showBgImg" :src="pageBgImgList[bgIndex]" :style="bgSizeList[sizeIndex]" draggable="false" />
		</div>
		<canvas
			ref="canvas"
			id="canvas"
			height="100%"
			width="100%"
			@mousedown="mousedown"
			@mouseover="mouseover"
			@mouseup="mouseup"
		></canvas>
		<div class="picker">
			<div class="show-picker" @mousedown="showdown" @mouseup="showup">asd</div>
			<el-color-picker class="color-picker" v-model="color" @change="colorChange" :predefine="predefineColors" />
			<div class="width-picker">
				<div v-for="width in widthList" @click="lineChange(width)">
					<span :style="{ width: width + 'px', height: width + 'px', backgroundColor: color }"></span>
				</div>
			</div>
			<div class="eraser-picker">橡皮</div>
			<div class="step-picker">
				<el-button :disabled="drawStep < 0" :icon="Back" @click="previousStep" circle />
				<el-button :disabled="drawStep == drawHistory.length - 1" :icon="Right" @click="nextStep" circle />
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { Back, Right } from "@element-plus/icons-vue";
import useImgStore from "@/store/img";
import { PageBgImgList, BgSizeList } from "@/components/Options.js";
const imgStore = useImgStore();
const predefineColors = [
	"#ff4500",
	"#ff8c00",
	"#ffd700",
	"#90ee90",
	"#00ced1",
	"#1e90ff",
	"#c71585",
	"rgba(255, 69, 0, 0.68)",
	"rgb(255, 120, 0)",
	"hsv(51, 100, 98)",
	"hsva(120, 40, 94, 0.5)",
	"hsl(181, 100%, 37%)",
	"hsla(209, 100%, 56%, 0.73)",
	"#c7158577",
];
const widthList = [3, 5, 7, 9, 11];

const { getBgIndex, getSizeIndex } = imgStore;
const pageBgImgList = reactive(PageBgImgList);
const bgSizeList = reactive(BgSizeList);
const bgIndex = ref<number>(getBgIndex);
const sizeIndex = ref<number>(getSizeIndex);
const draw = ref<HTMLCanvasElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const color = ref("rgba(255, 69, 0, 0.68)");
const lineWidth = ref(widthList[0]);
const isDrawing = ref(false);
const showBgImg = ref(true);
const isEraser = ref(false);
const drawHistory = ref([]);
const drawStep = ref(-1);
const drawList = ref([]);

const initCanvas = () => {
	canvas.value!.height = draw.value!.clientHeight;
	canvas.value!.width = draw.value!.clientWidth;
	const ctx = canvas.value!.getContext("2d");
	ctx.strokeStyle = color.value;
	ctx.fillStyle = "transparent";
	ctx.lineWidth = lineWidth.value;

	// if (!showBgImg.value) return;
	// const img = new Image();
	// const ctx = canvas.value!.getContext("2d");
	// img.src = PageBgImgList[getBgIndex];
	// img.onload = () => {
	// 	const size = BgSizeList[getSizeIndex];
	// 	let height = 0;
	// 	let width = 0;
	// 	if (size.width === "100%" && size.height === "100%") {
	// 		width = canvas.value.width;
	// 		height = canvas.value.height;
	// 	} else if (size.width === "100%") {
	// 		width = canvas.value.width;
	// 		height = (img.height / img.width) * width;
	// 	} else if (size.height === "100%") {
	// 		height = canvas.value.height;
	// 		width = (img.width / img.height) * height;
	// 	}
	// 	ctx.drawImage(img, 0, 0, width, height);
	// };
};
const mousedown = (e) => {
	isDrawing.value = true;
	drawList.value = [];
	const ctx = canvas.value!.getContext("2d");
	ctx.beginPath();
	ctx.moveTo(e.offsetX, e.offsetY);
	canvas.value!.addEventListener("mousemove", mouseover);
};
const mouseover = (e) => {
	if (!isDrawing.value) return;
	drawList.value.push([e.offsetX, e.offsetY]);
	const ctx = canvas.value!.getContext("2d");
	ctx.lineTo(e.offsetX, e.offsetY);
	ctx.stroke();
};
const mouseup = (e) => {
	drawStep.value++;
	drawHistory.value = [
		...drawHistory.value.filter((item, index) => index < drawStep.value),
		{
			lineWidth: lineWidth.value,
			color: color.value,
			step: drawList.value,
		},
	];
	const ctx = canvas.value!.getContext("2d");
	ctx.lineTo(e.offsetX, e.offsetY);
	ctx.stroke();
	canvas.value!.removeEventListener("mousemove", mouseover);
	isDrawing.value = false;
};

const showdown = () => {
	showBgImg.value = false;
};
const showup = () => {
	showBgImg.value = true;
};

const colorChange = () => {
	const ctx = canvas.value!.getContext("2d");
	ctx.strokeStyle = color.value;
};
const lineChange = (width) => {
	lineWidth.value = width;
	const ctx = canvas.value!.getContext("2d");
	ctx.lineWidth = lineWidth.value;
};

const previousStep = () => {
	if (drawStep.value > 0) {
		drawStep.value--;
		const ctx = canvas.value!.getContext("2d");
		ctx.clearRect(0, 0, canvas.value!.width, canvas.value!.height);
		const list = drawHistory.value.filter((item, index) => index <= drawStep.value);
		stepDraw(list);
	} else {
		drawStep.value = -1;
		const ctx = canvas.value!.getContext("2d");
		ctx.clearRect(0, 0, canvas.value!.width, canvas.value!.height);
	}
};
const nextStep = () => {
	if (drawStep.value < drawHistory.value.length - 1) {
		drawStep.value++;
		const list = [drawHistory.value[drawStep.value]];
		stepDraw(list);
	}
};
const stepDraw = (list) => {
	const ctx = canvas.value!.getContext("2d");
	ctx.beginPath();
	list.forEach((item) => {
		ctx.moveTo(item.step[0][0], item.step[0][1]);
		ctx.lineWidth = item.lineWidth;
		ctx.strokeStyle = item.color;
		ctx.fillStyle = "transparent";
		console.log(lineWidth);
		item.step.forEach((point) => {
			ctx.lineTo(point[0], point[1]);
			ctx.stroke();
		});
	});
};

onMounted(() => {
	initCanvas();
});
</script>

<style scoped lang="scss">
#draw {
	height: 100%;
	width: 100%;
	user-select: none;
	.bg {
		position: absolute;
		left: 0;
		top: 0;
		z-index: 0;
	}
	#canvas {
		cursor: crosshair;
		position: absolute;
		left: 0;
		top: 0;
		z-index: 1;
	}
	.picker {
		position: absolute;
		left: 10px;
		bottom: 10px;
		z-index: 2;
		cursor: pointer;
		display: flex;
		& > div {
			margin-right: 16px;
		}
	}
	.show-picker {
	}
	:deep(.color-picker) {
	}
	:deep(.width-picker) {
		display: flex;
		align-items: center;
		height: 30px;
		div {
			width: 30px;
			height: 30px;
			display: flex;
			justify-content: center;
			align-items: center;
			cursor: pointer;
			span {
				display: inline-block;
				border-radius: 50%;
			}
		}
	}
	.eraser-picker {
		color: #000;
	}
}
</style>
