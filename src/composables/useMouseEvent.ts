import { ref } from 'vue'

export function useMouseEvent() {
  const mouseMoving = ref(false)
  const startX = ref(0)
  const startY = ref(0)

  function mouseDown(e: MouseEvent) {
    mouseMoving.value = true
    startX.value = e.offsetX
    startY.value = e.offsetY
  }

  function mouseMove(e: MouseEvent, target: HTMLElement) {
    if (!mouseMoving.value || !target.contains(e.target as HTMLElement)) {
      mouseMoving.value = false
      return null
    }
    const mTarget = e.target as HTMLElement
    const scrollOffsets = getScrollOffsets(mTarget)
    const moveX = e.clientX - startX.value + scrollOffsets.scrollLeft
    const moveY = e.clientY - startY.value + scrollOffsets.scrollTop
    const isDirectTarget = mTarget === target
    const { offsetLeft, offsetTop } = isDirectTarget ? { offsetLeft: 0, offsetTop: 0 } : mTarget
    target.style.left = `${moveX - offsetLeft}px`
    target.style.top = `${moveY - offsetTop}px`
    return { left: target.style.left, top: target.style.top }
  }

  function getScrollOffsets(element: HTMLElement) {
    let scrollLeft = 0, scrollTop = 0
    let current = element !== document.body ? element.parentElement as HTMLElement : null
    while (current && current !== document.body) {
      scrollLeft += current.scrollLeft
      scrollTop += current.scrollTop
      current = current.parentElement as HTMLElement
    }
    return { scrollLeft, scrollTop }
  }

  function mouseOut() { mouseMoving.value = false }
  function mouseUp() { mouseMoving.value = false }

  return { mouseDown, mouseMove, mouseUp, mouseOut }
}
