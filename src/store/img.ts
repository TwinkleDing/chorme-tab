/*
 * @Author: twinkleding
 * @Date: 2024-11-15 11:00:20
 * @LastEditTime: 2024-11-26 10:30:52
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
			bgW: getStorage("bgW"),
			bgH: getStorage("bgH"),
			bgX: getStorage("bgX"),
			bgY: getStorage("bgY"),
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
		getBgW(): string {
			return this.bgW;
		},
		getBgH(): string {
			return this.bgH;
		},
		getBgX(): string {
			return this.bgX;
		},
		getBgY(): string {
			return this.bgY;
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
		setBgW(w: string): void {
			this.bgW = w;
			setStorage("bgW", w);
		},
		setBgH(h: string): void {
			this.bgH = h;
			setStorage("bgH", h);
		},
		setBgX(x: string): void {
			this.bgX = x;
			setStorage("bgX", x);
		},
		setBgY(y: string): void {
			this.bgY = y;
			setStorage("bgY", y);
		},
	},
});
