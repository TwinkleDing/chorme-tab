/*
 * @Author: twinkleding
 * @Date: 2024-11-12 11:00:16
 * @LastEditTime: 2024-11-12 13:40:35
 * @LastEditors: twinkleding
 * @FilePath: \chorme-tab\src\router\index.js
 * @Description:
 */
import { createRouter, createWebHashHistory } from "vue-router";
const route = createRouter({
	history: createWebHashHistory("/"),
	routes: [
		{
			path: "/",
			name: "Home",
			component: () => import("@/views/home/index.vue"),
			meta: {
				title: "Home",
			},
		},
		{
			path: "/draw",
			name: "Draw",
			component: () => import("@/views/draw/index.vue"),
			meta: {
				title: "Draw",
			},
		},
		{
			path: "/story",
			name: "Story",
			component: () => import("@/views/story/index.vue"),
			meta: {
				title: "story",
			},
		},
	],
	strict: true,
	scrollBehavior: () => ({ left: 0, top: 0 }),
});

export default route;
