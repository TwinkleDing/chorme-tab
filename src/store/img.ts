/*
 * @Author: twinkleding
 * @Date: 2024-11-15 11:00:20
 * @LastEditTime: 2024-11-20 10:11:28
 * @LastEditors: twinkleding
 * @FilePath: \chorme-tab\src\store\img.ts
 * @Description:
 */
import { defineStore } from "pinia";
import { setStorage, getStorage } from "@/utils";
import { FULL_SCREEN } from "@/utils/constant";

export default defineStore("imgId", {
	// 推荐使用 完整类型推断的箭头函数
	state: () => {
		return {
			bgIndex: getStorage("bgIndex") || 0,
			sizeIndex: getStorage("sizeIndex") || 0,
			boxEx: getStorage("boxEx") || "true",
			bgMode: getStorage("bgMode") || FULL_SCREEN,
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
		getBgMode(): string {
			return this.bgMode;
		},
	},

	actions: {
		setBgIndex(index: number | string): void {
			this.bgIndex = index;
			setStorage("bgIndex", index);
		},
		setSizeIndex(index: number | string): void {
			this.sizeIndex = index;
			setStorage("sizeIndex", index);
		},
		setBoxEx(ex: boolean): void {
			this.boxEx = ex;
			setStorage("boxEx", ex);
		},
		setBgMode(mode: string): void {
			this.bgMode = mode;
			setStorage("bgMode", mode);
		},
	},
});
