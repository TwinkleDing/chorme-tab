<template>
	<div class="puzzle">
		<div
			class="box"
			:style="{
				height: `${width}px`,
				width: `${width}px`,
			}"
		>
			<div
				v-for="item in blockList"
				class="box-img"
				:style="{
					left: `${item.getRandom()[0]}px`,
					top: `${item.getRandom()[1]}px`,
					height: `${itemSize}px`,
					width: `${itemSize}px`,
					backgroundImage: item.getIsImg() ? `url(${cardImg})` : '',
					backgroundPosition: `${-item.getCoordinate()[0]}px ${-item.getCoordinate()[1]}px`,
					backgroundSize: `${width}px ${width}px`,
				}"
				@click="puzzleClick(item)"
			></div>
		</div>
		<div class="setting">
			<img class="material" :src="img" alt="" />
			<div class="handler">
				<div>步数：{{ count }}</div>
				<div>计时：{{ time }}</div>
				<hr />
				<el-button type="primary" @click="start" :disabled="Puzzle.playing">开始</el-button>
				<el-button type="primary" @click="end" :disabled="!Puzzle.playing">停止</el-button>
				<el-button type="info" @click="reset" >重置</el-button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { onBeforeMount, reactive, ref, Ref } from "vue";
import useImgStore from "@/store/img";
import { ElMessage } from "element-plus";
import Puzzle, { Block } from "./puzzle";
import { exampleImg } from "@/components/Options.js";
import { PageBgImgList } from "@/components/Options.js";

const imgStore = useImgStore();
const { getBgIndex } = imgStore;
let puzzle: Puzzle;
const blockList: Ref<Array<Block>> = ref([]);
const count: Ref<number> = ref(0);
const time: Ref<number> = ref(0);
const itemSize: Ref<number> = ref(0);
const cardImg: Ref<string> = ref('');
const width: Ref<number> = ref(400);
const tier: Ref<number> = ref(3);
const img: Ref<string> = ref("");

const init = (): void => {
	img.value = typeof getBgIndex === "number" ? PageBgImgList[getBgIndex] : exampleImg;
	puzzle = new Puzzle(img.value, tier.value, width.value);
	itemSize.value = puzzle.getItemSize();
	cardImg.value = puzzle.getImg();
	blockList.value = [...puzzle.getImageList()];
	puzzle.puzzleChange((e: Puzzle): void => {
		time.value = e.getTime();
		count.value = e.getCount();
		blockList.value = [...e.getImageList()];
		if (puzzle.getOver()) {
			console.log("Over");
			ElMessage.success("恭喜你，拼图完成！用时" + time.value + "ms");
		}
	});
};
const start = (): void => {
	puzzle.start();
};
const end = (): void => {
	puzzle.end();
};
const reset = (): void => {
	puzzle.reset();
};

const puzzleClick = (item: Block): void => {
	if (item.getIsImg()) {
		puzzle.blockClick(item);
	}
};

onBeforeMount(() => {
	init();
});
</script>

<style lang="scss" scoped>
.puzzle {
	height: 100%;
	width: 100%;
	padding: 24px;
	display: flex;
	flex-wrap: wrap;
	.box {
		border: 1px solid black;
		position: relative;
		padding-bottom: 1px;
		padding-right: 1px;
		box-sizing: content-box;
		&-img {
			position: absolute;
			border: 1px solid #fff;
		}
	}
	.setting {
		margin-left: 24px;
		.material {
			height: 200px;
			width: 200px;
			background-size: 100% 100%;
		}
		.handler {
			margin-top: 12px;
			text-align: right;
		}
	}
}
</style>
