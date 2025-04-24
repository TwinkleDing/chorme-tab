/*
 * @Author: twinkleding
 * @Date: 2024-11-29 10:56:46
 * @LastEditTime: 2024-11-29 15:04:37
 * @LastEditors: twinkleding
 * @FilePath: \chorme-tab\src\hooks\useMouseEvent.ts
 * @Description:
 */
import { ref } from "vue";

export default function () {
	const mouseMoving = ref<boolean>(false);
	const startX = ref<number>(0);
	const startY = ref<number>(0);

	function mouseDown(e: MouseEvent) {
		mouseMoving.value = true;
		startX.value = e.offsetX;
		startY.value = e.offsetY;
	}
	function mouseMove(e: MouseEvent, target: HTMLElement) {
		if (!mouseMoving.value || !target.contains(e.target as HTMLElement)) {
			mouseMoving.value = false;
			return null;
		}
		const mTarget = e.target as HTMLElement;
		const isDirectTarget = mTarget === target;
		// 获取所有相关滚动容器的滚动偏移
		const scrollOffsets = getScrollOffsets(mTarget);
		// 计算移动距离（考虑滚动偏移）
		const moveX = e.clientX - startX.value + scrollOffsets.scrollLeft;
		const moveY = e.clientY - startY.value + scrollOffsets.scrollTop;
		// 获取相对于父元素的偏移量
		const { offsetLeft, offsetTop } = isDirectTarget ? { offsetLeft: 0, offsetTop: 0 } : mTarget;
		// 计算新位置
		const newLeft = moveX - offsetLeft;
		const newTop = moveY - offsetTop;
		// 应用新位置
		target.style.left = `${newLeft}px`;
		target.style.top = `${newTop}px`;
		// 返回位置信息
		return {
			left: target.style.left,
			top: target.style.top,
		};
	}
	function getScrollOffsets(element: HTMLElement) {
		let scrollLeft = 0;
		let scrollTop = 0;
		let current = element !== document.body && (element.parentElement as HTMLElement);
		while (current && current !== document.body) {
			scrollLeft += current.scrollLeft;
			scrollTop += current.scrollTop;
			current = current.parentElement as HTMLElement;
		}
		return { scrollLeft, scrollTop };
	}
	function mouseOut() {
		mouseMoving.value = false;
	}
	function mouseUp() {
		mouseMoving.value = false;
	}

	return {
		mouseDown,
		mouseMove,
		mouseUp,
		mouseOut,
	};
}
