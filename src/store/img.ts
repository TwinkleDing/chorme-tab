/*
 * @Author: twinkleding
 * @Date: 2024-11-15 11:00:20
 * @LastEditTime: 2024-11-20 14:03:19
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
			boxUnfold: getStorage("boxUnfold") || "true",
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
		getBoxUnfold(): string {
			return this.boxUnfold;
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
		setBoxUnfold(unfold: boolean): void {
			this.boxUnfold = unfold;
			setStorage("boxUnfold", unfold);
		},
		setBgMode(mode: string): void {
			this.bgMode = mode;
			setStorage("bgMode", mode);
		},
	},
});
