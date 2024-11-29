/*
 * @Author: twinkleding
 * @Date: 2024-11-29 10:56:46
 * @LastEditTime: 2024-11-29 11:28:32
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
		const moveX = e.clientX - startX.value;
		const moveY = e.clientY - startY.value;
		const mTarget = e.target as HTMLElement;
		if (mouseMoving.value && target.contains(mTarget)) {
			const offsetLeft = mTarget.id === target.id ? 0 : mTarget.offsetLeft;
			const offsetTop = mTarget.id === target.id ? 0 : mTarget.offsetTop;
			target.style.left = moveX - offsetLeft + "px";
			target.style.top = moveY - offsetTop + "px";
			return {
				left: target.style.left,
				top: target.style.top,
			};
		} else {
			mouseMoving.value = false;
			return false;
		}
	}
	function mouseUp() {
		mouseMoving.value = false;
	}

	return {
		mouseDown,
		mouseMove,
		mouseUp,
	};
}
