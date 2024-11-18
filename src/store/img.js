/*
 * @Author: twinkleding
 * @Date: 2024-11-15 11:00:20
 * @LastEditTime: 2024-11-18 11:33:02
 * @LastEditors: twinkleding
 * @FilePath: \chorme-tab\src\store\img.js
 * @Description:
 */
import { defineStore } from "pinia";
import { setStorage, getStorage } from "@/utils.js";

export default defineStore("imgId", {
	// 推荐使用 完整类型推断的箭头函数
	state: () => {
		return {
			bgIndex: getStorage("bgIndex"),
			sizeIndex: getStorage("sizeIndex"),
		};
	},
	getters: {
		getBgIndex() {
			return this.bgIndex;
		},
		getSizeIndex() {
			return this.sizeIndex;
		},
	},

	actions: {
		setBgIndex(index) {
			this.bgIndex = index;
			setStorage("bgIndex", index);
		},
		setSizeIndex(index) {
			this.sizeIndex = index;
			setStorage("sizeIndex", index);
		},
	},
});
