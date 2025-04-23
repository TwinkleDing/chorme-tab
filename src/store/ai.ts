import { defineStore } from "pinia";
import { setStorage, getStorage } from "@/utils";

export default defineStore("ai", {
	state: () => {
		return {
			chartList: getStorage("chartList") || [],
		};
	},
	getters: {
		getChartList(): Array<{ name: string; content: string }> {
			return this.chartList;
		},
	},
	actions: {
		setChartList(chartList: Array<{ name: string; content: string }>): void {
			this.chartList = chartList;
			setStorage("chartList", chartList);
		},
	},
});
