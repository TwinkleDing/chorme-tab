/*
 * @Author: twinkleding
 * @Date: 2024-11-15 11:00:20
 * @LastEditTime: 2024-11-19 13:31:32
 * @LastEditors: twinkleding
 * @FilePath: \chorme-tab\src\store\img.ts
 * @Description:
 */
import { defineStore } from "pinia";
import { setStorage, getStorage } from "@/utils";

export default defineStore("imgId", {
	// 推荐使用 完整类型推断的箭头函数
	state: () => {
		return {
			bgIndex: getStorage("bgIndex") || 0,
			sizeIndex: getStorage("sizeIndex") || 0,
			boxEx: getStorage("boxEx") || "true",
		};
	},
	getters: {
		getBgIndex(): string {
			return this.bgIndex;
		},
		getSizeIndex(): string {
			return this.sizeIndex;
		},
		getBoxEx(): string {
			return this.boxEx;
		},
	},

	actions: {
		setBgIndex(index: number | string) {
			this.bgIndex = index;
			setStorage("bgIndex", index);
		},
		setSizeIndex(index: number | string) {
			this.sizeIndex = index;
			setStorage("sizeIndex", index);
		},
		setBoxEx(ex: boolean) {
			this.boxEx = ex;
			setStorage("boxEx", ex);
		},
	},
});
