<template>
	<div class="ai">
		<div class="ai-content" v-loading="loading" element-loading-background="transparent">
			<div v-for="(item, index) in chartList">
				<div :class="['item', item.name === 'DeepSeek' ? 'left' : 'right']">
					{{ item.content }}
				</div>
			</div>
		</div>
		<div class="ai-input">
			<el-input v-model="searchValue" placeholder="请输入" class="input" @keyup.enter.native="search">
				<template #append>
					<el-button :icon="Search" @click="search" />
				</template>
			</el-input>
		</div>
	</div>
</template>
<script setup lang="ts">
import OpenAI from "openai";
import { ref, onMounted } from "vue";
import { Search } from "@element-plus/icons-vue";
import UseAIStore from "@/store/ai";

const AIStore = UseAIStore();
const { getChartList, setChartList } = AIStore;

const searchValue = ref<string>("");
const chartList = ref<Array<{ name: string; content: string }>>(getChartList);
const openai = ref(null);
const loading = ref(false);
let timer;

const init = (): void => {
	openai.value = new OpenAI({
		baseURL: "https://api.deepseek.com",
		apiKey: "sk-fab6dc6e614b4629b5c52dedbc41c7f9",
		dangerouslyAllowBrowser: true,
	});
};
const search = (): void => {
	if (loading.value) return;
	chartList.value.push({
		name: "user",
		content: searchValue.value,
	});
	setChartList([...chartList.value]);
	aiAnswer();
};
const aiAnswer = async (): Promise<void> => {
	try {
		loading.value = true;
		timer = setTimeout(() => {
			loading.value = false;
		}, 60000);
		const completion = await openai.value.chat.completions.create({
			messages: [{ role: "system", content: searchValue.value }],
			model: "deepseek-chat",
		});
		searchValue.value = "";

		console.log(completion);
		if (completion.choices[0].message.content) {
			loading.value = false;
			clearTimeout(timer);
			timer = null;
			chartList.value.push({
				name: "DeepSeek",
				content: completion.choices[0].message.content,
			});
			setChartList([...chartList.value]);
		}
	} catch (e) {
		chartList.value.push({
			name: "DeepSeek",
			content: e,
		});
		loading.value = false;
		clearTimeout(timer);
		timer = null;
	}
};
onMounted((): void => {
	init();
});
</script>

<style lang="scss" scoped>
.ai {
	padding-bottom: 20px;
	&-content {
		height: 500px;
		overflow: auto;
		margin-bottom: 24px;
	}
	&-input {
		height: 40px;
		width: 100%;
	}
	.item {
		max-width: 80%;
		background-color: #ffffff3a;
		border-radius: 8px;
		padding: 0 12px;
		clear: both;

		word-wrap: break-word;
		white-space: break-spaces;
		&.left,
		&.right {
			margin-bottom: 12px;
		}
		&.left {
			float: left;
		}
		&.right {
			float: right;
		}
	}
	:deep(.el-input__wrapper) {
		background-color: #ffffff3a;
		box-shadow: none;
		color: #fff;
		.el-input__inner {
			color: #fff;
		}
	}
}
</style>
