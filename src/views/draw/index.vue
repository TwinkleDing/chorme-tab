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
		<back-page class="back" />
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
		/>
		<div class="picker">
			<div class="show-picker" @mousedown="showdown" @mouseup="showup">
				<el-icon v-if="showBgImg"><View /></el-icon>
				<el-icon v-if="!showBgImg"><Hide /></el-icon>
			</div>
			<el-color-picker class="color-picker" v-model="color" @change="colorChange" :predefine="predefineColors" />
			<div class="width-picker">
				<div v-for="width in widthList" @click="lineChange(width)">
					<span :style="{ width: width + 'px', height: width + 'px', backgroundColor: color }"></span>
				</div>
			</div>
			<div class="step-picker">
				<el-button :disabled="drawStep < 0" :icon="Back" @click="previousStep" circle />
				<el-button :disabled="drawStep == drawHistory.length - 1" :icon="Right" @click="nextStep" circle />
			</div>
			<div class="brush-picker">
				<div
					v-for="(name, index) in brushNames"
					@click="brushChange(index)"
					:class="{ active: currentBrushIndex === index }"
				>
					<span>{{ name }}</span>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup>
import { ref, reactive, onMounted } from "vue";
import { Back, Right, View, Hide } from "@element-plus/icons-vue";
import { PageBgImgList, BgSizeList } from "@/components/Options.js";
import BackPage from "@/components/Back.vue";
import useImgStore from "@/store/img";

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
const widthList = [2, 4, 6, 8, 10];
const brushTypes = [
	{ name: "round", cap: "round", join: "round" },
	{ name: "square", cap: "square", join: "bevel" },
	{ name: "butt", cap: "butt", join: "miter" },
];
const brushNames = ["圆头", "方头", "平头"];

const { getBgIndex, getSizeIndex } = imgStore;
const pageBgImgList = reactive(PageBgImgList);
const bgSizeList = reactive(BgSizeList);
const bgIndex = ref(getBgIndex);
const sizeIndex = ref(getSizeIndex);
const draw = ref(null);
const canvas = ref(null);
const color = ref(predefineColors[0]);
const lineWidth = ref(widthList[0]);
const currentBrushIndex = ref(0);
const isDrawing = ref(false);
const showBgImg = ref(true);
const isEraser = ref(false);
const drawHistory = ref([]);
const drawStep = ref(-1);
const drawList = ref([]);

const initCanvas = () => {
	canvas.value.height = draw.value.clientHeight;
	canvas.value.width = draw.value.clientWidth;
	const ctx = canvas.value.getContext("2d");
	ctx.strokeStyle = color.value;
	ctx.fillStyle = "transparent";
	ctx.lineWidth = lineWidth.value;
	updateBrushStyle();
};

const updateBrushStyle = () => {
	const ctx = canvas.value.getContext("2d");
	const brush = brushTypes[currentBrushIndex.value];
	ctx.lineCap = brush.cap;
	ctx.lineJoin = brush.join;
};

const brushChange = (index) => {
	currentBrushIndex.value = index;
	updateBrushStyle();
};
const mousedown = (e) => {
	isDrawing.value = true;
	drawList.value = [e.offsetX, e.offsetY];
	const ctx = canvas.value.getContext("2d");
	ctx.beginPath();
	ctx.moveTo(e.offsetX, e.offsetY);
	canvas.value.addEventListener("mousemove", mouseover);
};
const mouseover = (e) => {
	if (!isDrawing.value) return;
	drawList.value.push([e.offsetX, e.offsetY]);
	const ctx = canvas.value.getContext("2d");
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
			brushType: currentBrushIndex.value,
			step: drawList.value,
		},
	];
	canvas.value.removeEventListener("mousemove", mouseover);
	isDrawing.value = false;
};

const showdown = () => {
	showBgImg.value = false;
};
const showup = () => {
	showBgImg.value = true;
};

const colorChange = () => {
	const ctx = canvas.value.getContext("2d");
	ctx.strokeStyle = color.value;
};
const lineChange = (width) => {
	lineWidth.value = width;
	const ctx = canvas.value.getContext("2d");
	ctx.lineWidth = lineWidth.value;
};
const previousStep = () => {
	const ctx = canvas.value.getContext("2d");
	ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
	if (drawStep.value > 0) {
		drawStep.value--;
		const list = drawHistory.value.filter((item, index) => index <= drawStep.value);
		stepDraw(list);
	} else {
		drawStep.value = -1;
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
	const ctx = canvas.value.getContext("2d");
	list.forEach((item) => {
		ctx.beginPath();
		ctx.moveTo(item.step[0][0], item.step[0][1]);
		ctx.lineWidth = item.lineWidth;
		ctx.strokeStyle = item.color;
		ctx.fillStyle = "transparent";
		if (item.brushType !== undefined) {
			const brush = brushTypes[item.brushType];
			ctx.lineCap = brush.cap;
			ctx.lineJoin = brush.join;
		}
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
	.back {
		position: absolute;
		left: 0;
		top: 0;
		z-index: 2;
	}
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
		line-height: 32px;
	}
	:deep(.width-picker) {
		display: flex;
		align-items: center;
		height: 32px;
		div {
			width: 32px;
			height: 32px;
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
		line-height: 32px;
	}
	.brush-picker {
		display: flex;
		align-items: center;
		height: 32px;
		div {
			padding: 0 8px;
			margin-right: 8px;
			line-height: 28px;
			cursor: pointer;
			border-radius: 4px;
			&.active {
				background-color: rgba(144, 238, 144, 0.5);
			}
		}
	}
}
</style>
