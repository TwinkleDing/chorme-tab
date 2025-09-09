<template>
	<div id="bg-box" class="bg-box">
		<div class="img-box">
			<div id="ex" class="ex" @click="ex = !ex">
				<el-icon>
					<DArrowRight v-show="ex" />
					<DArrowLeft v-show="!ex" />
				</el-icon>
			</div>
			<div class="scroll-box" v-show="!ex">
				<el-scrollbar>
					<div class="img-list" @mousewheel="mousewheel">
						<div :class="['img', bgIndex == index && 'active']" v-for="(item, index) in PageThImgList">
							<img :src="item" alt="" @click="setBgIndex(index)" />
						</div>
					</div>
				</el-scrollbar>
			</div>
		</div>
	</div>
</template>
<script setup>
import { ref, watch, onMounted } from "vue";
import { DArrowRight, DArrowLeft } from "@element-plus/icons-vue";
import useImgStore from "@/store/img.ts";
import { PageThImgList } from "@/components/Options.js";

const imgStore = useImgStore();

const imgWidth = 142;
const ex = ref(true);
const bgIndex = ref(imgStore.getBgIndex);
const sizeIndex = ref(imgStore.getSizeIndex);

/**
 * 设置当前背景
 * @params 下标
 */
const setBgIndex = (index) => {
	imgStore.setBgIndex(index);
	bgIndex.value = index;
};

/**
 * 鼠标滚动，设置滚动条位置
 */
const mousewheel = (e) => {
	e.preventDefault();
	const content = document.getElementsByClassName("el-scrollbar__wrap")[0];
	if (e.deltaY > 0) {
		content.scrollLeft += imgWidth + 4;
	} else {
		content.scrollLeft -= imgWidth + 4;
	}
};

/**
 * 设置滚动条背景动画，使当前选中的居中
 * @params
 * oldValue 上一次滚动的下标，第一次打开默认为-1
 */
const setCurrentCenter = (oldValue = -1) => {
	let timer;
	const content = document.getElementsByClassName("el-scrollbar__wrap")[0];
	setTimeout(() => {
		const halfIndex = parseInt(content.clientWidth / 2 / imgWidth);
		let scrollLeft = content.scrollLeft;
		let scrollIndex = 0;
		// 新的值和旧的值都小于一般，不进行滚动
		if (bgIndex.value <= halfIndex && oldValue <= halfIndex) {
			content.scrollLeft = 0;
		} else {
			// 打开列表，如果有过滚动，不让自动滚动，手动设置到固定位置
			if (oldValue == -1 && content.scrollLeft > 0) {
				scrollIndex = 0;
				if (content.scrollLeft != (bgIndex.value - halfIndex) * imgWidth) {
					content.scrollLeft = (bgIndex.value - halfIndex) * imgWidth;
				}
			} else if (oldValue <= halfIndex) {
				// 旧的值小于一半，新的值大于一半，从一半开始计算滚动次数
				scrollIndex = bgIndex.value - halfIndex;
			} else {
				// 旧的值和新的值都大于一半，直接计算差值滚动次数
				scrollIndex = bgIndex.value - oldValue;
				// 当前如果是最后在一半之后的几个向前滚动，不计算滚动
				if (scrollIndex < 0 && bgIndex.value >= PageThImgList.length - halfIndex) {
					scrollIndex = 0;
				}
			}
		}
		// 动画移动倍数
		let multiple = 2;
		// 如果是第一到倒一或者倒一到第一或者打一次打开动画速度提高
		if (
			(oldValue == 0 && bgIndex.value == PageThImgList.length - 1) ||
			(oldValue == PageThImgList.length - 1 && bgIndex.value == 0) ||
			oldValue == -1
		) {
			multiple = 10;
		}
		scrollIndex *= imgWidth / multiple;
		timer = setInterval(() => {
			// 向后滚动
			if (scrollIndex > 0) {
				content.scrollLeft += multiple;
				scrollIndex--;
			}
			// 向前滚动;
			if (scrollIndex < 0) {
				content.scrollLeft -= multiple;
				scrollIndex++;
			}
			// 滚动条不用滚动了或者前移后移单位在±1的话清除定时器
			if (content.scrollLeft == 0 || (scrollIndex > -1 && scrollIndex < 1)) {
				clearInterval(timer);
			}
		}, 1);
	}, 10);
};
watch(
	() => imgStore.bgIndex,
	(newValue, oldValue) => {
		setCurrentCenter(oldValue);
		bgIndex.value = newValue;
	}
);

watch(
	() => imgStore.sizeIndex,
	(e) => {
		sizeIndex.value = e;
	},
	{
		immediate: true,
		deep: true,
	}
);
watch(
	() => ex.value,
	(e) => {
		!e && setCurrentCenter();
	}
);

onMounted(() => {
	document.addEventListener("click", function (event) {
		// 获取盒子元素
		const box = document.getElementById("bg-box");
		// 检测点击是否发生在盒子外部
		if (box && !box.contains(event.target) && ex.value == false) {
			// 如果点击发生在盒子外部，则关闭盒子
			// box.style.display = "none"; // 或者其他关闭盒子的方法，例如隐藏或移除盒子
			ex.value = true;
		}
	});
});
</script>

<style lang="scss" scoped>
.bg-box {
	position: fixed;
	left: 0;
	bottom: 0;
	height: 102px;
	max-width: calc(100% - 12px);
	user-select: none;
}

.img-box {
	display: flex;
	border: 1px solid #aaa;
	border-radius: 0 10px 10px 0;
	overflow: hidden;
	max-width: 100%;

	.ex {
		width: 24px;
		height: 100%;
		line-height: 100px;
		text-align: center;
		cursor: pointer;
		background: #cccccc88;
		color: #fff;
	}

	.scroll-box {
		height: 100%;
		padding: 0 6px;
		flex: 1;
		max-width: calc(100% - 24px);

		.img-list {
			display: flex;

			.img {
				cursor: pointer;
				height: 96px;
				border-radius: 2px;
				padding: 2px;
				margin: 2px;

				&.active {
					background: #fff;
				}

				img {
					height: 92px;
					width: 138px;
				}
			}
		}
	}
}
</style>
