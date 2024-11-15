/*
 * @Author: twinkleding
 * @Date: 2024-11-15 11:00:20
 * @LastEditTime: 2024-11-15 11:08:01
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
		};
	},
	getters: {
		getBgIndex() {
			return this.bgIndex;
		},
	},

	actions: {
		setBgIndex(index) {
			this.bgIndex = index;
			setStorage("bgIndex", index);
		},
	},
});
