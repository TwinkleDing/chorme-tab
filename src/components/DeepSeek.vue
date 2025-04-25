<template>
	<div id="ai" class="ai">
		<div ref="aiContent" class="ai-content">
			<div
				v-loading="loading && item.name === 'DeepSeek' && index === chartList.length - 1"
				v-for="(item, index) in chartList"
				:class="['item', item.name === 'DeepSeek' ? 'left' : 'right']"
				element-loading-background="#00000033"
			>
				{{ item.content }}
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
const aiContent = ref<HTMLElement>();
let timer;

const init = (): void => {
	openai.value = new OpenAI({
		baseURL: "https://api.deepseek.com",
		apiKey: "sk-fab6dc6e614b4629b5c52dedbc41c7f9",
		dangerouslyAllowBrowser: true,
	});
};
const search = (): void => {
	if (loading.value || !searchValue.value) return;
	chartList.value.push({
		name: "user",
		content: searchValue.value,
	});
	chartList.value.push({
		name: "DeepSeek",
		content: "",
	});
	setChartList([...chartList.value]);
	scrollBottom();
	// aiAnswer();
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

		if (completion.choices[0].message.content) {
			loading.value = false;
			clearTimeout(timer);
			timer = null;
			chartList.value[chartList.value.length - 1] = {
				name: "DeepSeek",
				content: completion.choices[0].message.content,
			};
			setChartList([...chartList.value]);
			scrollBottom();
		}
	} catch (e) {
		chartList.value.push({
			name: "DeepSeek",
			content: e,
		});
		scrollBottom();
		loading.value = false;
		clearTimeout(timer);
		timer = null;
	}
};
const scrollBottom = (): void => {
	setTimeout(() => {
		if (aiContent.value) {
			aiContent.value.scrollTop = aiContent.value.scrollHeight;
		}
	}, 100);
};
onMounted((): void => {
	init();
	scrollBottom();
});
</script>

<style lang="scss" scoped>
.ai {
	padding-bottom: 20px;
	&-content {
		height: 500px;
		overflow: auto;
		margin-bottom: 12px;
	}
	&-input {
		height: 40px;
		width: 100%;
	}
	.item {
		max-width: 80%;
		// background-color: #00000033;
		border-radius: 8px;
		padding: 0 12px;
		clear: both;

		word-wrap: break-word;
		white-space: break-spaces;
		margin: 0 12px 12px;
		box-shadow: 0 0 10px #00000033;
		&.left {
			float: left;
			width: 80%;
		}
		&.right {
			float: right;
		}
	}
	:deep(.el-input) {
		position: initial;
		.el-input__wrapper {
			// background-color: #00000033;
			background-color: transparent;
			box-shadow: 0 0 10px #00000033;

			color: #fff;
			transform: none;
			.el-input__inner {
				color: #fff;
				&::placeholder {
					color: #fff;
				}
			}
		}
		.el-input-group__append {
			box-shadow: none;
			// background-color: #00000033;
			background-color: transparent;
			box-shadow: 0 0 10px #00000033;
			i {
				color: #fff;
			}
		}
	}
}
</style>
