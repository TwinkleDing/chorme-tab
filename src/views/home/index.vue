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
		<div id="page" ref="page" @mousewheel="mousewheel" @mousedown="domMouseDown" @mouseup="domMouseUp"
			@dblclick="resetBg">
			<img v-if="bgMode === FULL_SCREEN" :src="pageBgImgList[bgIndex]" :style="bgSizeList[sizeIndex]"
				draggable="false" @mouseout="domMouseOut" />
			<div v-if="bgMode === GRID_SCREEN" id="page-bg-box">
				<div v-for="item in pageGridImgList" :style="{
					backgroundImage: `url(${item})`,
				}" @mouseout="domMouseOut"></div>
			</div>
		</div>
		<div id="box" ref="box" :class="['box', !boxUnfold && 'box-fold']" @mousedown="domMouseDown"
			@mouseup="domMouseUp" @mouseout="domMouseOut">
			<div class="time">
				<span>{{ currentTime }}</span>
				<!-- <el-divider direction="vertical" />
				<el-button v-if="!isAI" link type="primary" @click="isAI = true">使用DeepSeek</el-button>
				<el-button v-if="isAI" link type="primary" @click="isAI = false">换回普通模式</el-button> -->
			</div>
			<deep-seek v-show="isAI" />
			<div v-show="!isAI">
				<div class="search-input">
					<input v-model="searchValue" ref="input" placeholder="搜索..." type="text"
						@keyup.enter.native="enter" />
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
		</div>
		<img-list v-if="bgMode == FULL_SCREEN" />
		<grid @set-mode="setMode" />
	</div>
</template>
<script setup lang="ts">
import { dateFormat } from "@/utils";
import useImgStore from "@/store/img";
import { useRouter } from "vue-router";
import Grid from "@/components/Grid.vue";
import ImgList from "@/components/ImgList.vue";
import DeepSeek from "@/components/DeepSeek.vue";
import useMouseEvent from "@/hooks/useMouseEvent";
import { ref, watch, onMounted, reactive } from "vue";
import { FULL_SCREEN, GRID_SCREEN } from "@/utils/constant";
import { TopLeft, BottomRight } from "@element-plus/icons-vue";
import { PageBgImgList, PageGridImgList, BgSizeList, BookList } from "@/components/Options.js";

const BgMinWidth = 800;
const MouseWheelRatio = 1.1;
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
let mouseTimer: any = null;
const box = ref<HTMLElement>();
const page = ref<HTMLElement>();
const isAI = ref<boolean>(false);
const searchValue = ref<string>("");
const bgMode = ref<string>(getBgMode);
const bgSizeList = reactive(BgSizeList);
const bgIndex = ref<number>(getBgIndex);
const controlDown = ref<boolean>(false);
const bookList = ref<Array<any>>(BookList);
const sizeIndex = ref<number>(getSizeIndex);
const boxUnfold = ref<boolean>(getBoxUnfold);
const pageBgImgList = reactive(PageBgImgList);
const pageGridImgList = reactive(PageGridImgList);
const currentTime = ref<string>(dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss"));
let mouseDownTimer: any = null;

const domMouseDown = (e: MouseEvent): void => {
	mouseDown(e);
	if (box.value?.contains(e.target as Node)) {
		mouseDownTimer = setTimeout(() => {
			setBoxBgColor("#00000033");
		}, 100);
	}
};
const domMouseUp = (e: MouseEvent): void => {
	mouseUp();
	if (mouseDownTimer) {
		clearTimeout(mouseDownTimer); // 清除定时器
		mouseDownTimer = null;
	}
	if (box.value?.contains(e.target as Node)) {
		setBoxBgColor("transparent");
	}
};
const domMouseOut = (e: MouseEvent): void => {
	mouseOut();
	if (box.value?.contains(e.target as Node)) {
		setBoxBgColor("transparent");
	}
};
const setBoxBgColor = (color: string): void => {
	if (box.value) {
		box.value.style.backgroundColor = color;
	}
};

// 鼠标移动
const pageMove = (e: MouseEvent): void => {
	if (box.value?.contains(e.target as Node)) {
		const position = mouseMove(e, box.value);
		if (position) {
			setSearchX(position.left);
			setSearchY(position.top);
		}
	} else if (page.value.contains(e.target as Node)) {
		const position = mouseMove(e, page.value);
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
const enter = async (): Promise<void> => {
	if (searchValue.value.startsWith("www.")) {
		window.open("http://" + searchValue.value);
	} else {
		window.open("http://www.baidu.com/s?wd=" + searchValue.value);
		searchValue.value = "";
	}
};
// 鼠标滚轮缩放背景图
const mousewheel = (e: WheelEvent): void => {
	if (controlDown.value) return;
	const reg1 = /[^0-9|.]/gi;
	const reg2 = /[^-0-9|.]/gi;
	const bgWidth = Number(page.value.style.width.replace(reg1, "")) || page.value.clientWidth;
	const bgHeight = Number(page.value.style.height.replace(reg1, "")) || page.value.clientHeight;
	let width = Number(bgWidth);
	let height = Number(bgHeight);
	if (width < BgMinWidth && e.deltaY > 0) return;
	if (e.deltaY < 0) {
		width *= MouseWheelRatio;
		height *= MouseWheelRatio;
	} else {
		width /= MouseWheelRatio;
		height /= MouseWheelRatio;
	}
	page.value.style.width = width + "px";
	page.value.style.height = height + "px";
	setBgW(page.value.style.width);
	setBgH(page.value.style.height);

	const bgLeft = Number(page.value.style.left.replace(reg2, "")) || 0;
	const bgTop = Number(page.value.style.top.replace(reg2, "")) || 0;
	page.value.style.left = `${bgLeft - ((e.layerX / bgWidth) * width - e.layerX)}px`;
	page.value.style.top = `${bgTop - ((e.layerY / bgHeight) * height - e.layerY)}px`;
	setBgX(page.value.style.left);
	setBgY(page.value.style.top);
};
// 切换背景图片
const bgChange = (type: number): void => {
	if (mouseTimer || controlDown.value) {
		return;
	}
	mouseTimer = setTimeout(() => {
		const maxIndex = pageBgImgList.length - 1;
		let index = bgIndex.value;
		index = type > 0 ? (index >= maxIndex ? 0 : index + 1) : index <= 0 ? maxIndex : index - 1;
		setBgIndex(index);
		bgIndex.value = index;
		clearTimeout(mouseTimer);
		mouseTimer = null;
	}, 1000);
};
// 按下上下键盘切换背景图
const bgSrcChange = (e: KeyboardEvent): void => {
	if (e.key === "ArrowUp") {
		bgChange(-1);
	}
	if (e.key === "ArrowDown") {
		bgChange(1);
	}
};
// 按左右键切换背景图的契合度
const bgSizeChange = (e: KeyboardEvent): void => {
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
		} else if (bgMode.value == FULL_SCREEN && e.target instanceof HTMLElement && e.target.localName == "body") {
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
// 初始化背景图
const initBg = (): void => {
	getBgW && (page.value.style.width = getBgW);
	getBgH && (page.value.style.height = getBgH);
	getBgX && (page.value.style.left = getBgX);
	getBgY && (page.value.style.top = getBgY);
};
// 重置背景图位置和大小
const resetBg = (): void => {
	page.value.style.width = "";
	page.value.style.height = "";
	page.value.style.left = "";
	page.value.style.top = "";
	setBgW("");
	setBgH("");
	setBgX("");
	setBgY("");
};
// 初始化搜索框位置
const initBox = (): void => {
	if (getSearchX !== null) {
		box.value.style.left = getSearchX;
		box.value.style.top = getSearchY;
	}
};
// 获取当前时间
const getTime = (): void => {
	setInterval(() => {
		currentTime.value = dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss");
	}, 1000);
};
// 设置缩放
const setUnfold = (): void => {
	boxUnfold.value = !boxUnfold.value;
	setBoxUnfold(boxUnfold.value);
};
// 切换模式，单图还是栅格图
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
	width: 640px;
	cursor: pointer;
	border-radius: 20px;
	position: fixed;
	left: 40%;
	top: 20%;
	user-select: none;
	z-index: 2;
	padding: 0 20px;
	box-shadow: 0 0 10px #00000080;

	.time {
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
			// background: #00000033;
			background-color: transparent;
			box-shadow: 0 0 10px #00000033;
			color: #fff;

			&::placeholder {
				color: #fff;
			}
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
		color: #ffffff8a;
		cursor: pointer;
	}
}

.box-fold {
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
