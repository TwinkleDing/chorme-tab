import { ref, watch } from 'vue'
import useBackgroundStore from '@/stores/background'

const BgMinWidth = 800
const MouseWheelRatio = 1.1

export function useBackground(pageRef: () => HTMLElement | undefined) {
  const store = useBackgroundStore()

  const bgIndex = ref(store.getBgIndex)
  const sizeIndex = ref(store.getSizeIndex)
  const bgMode = ref(store.getBgMode)
  let mouseTimer: ReturnType<typeof setTimeout> | null = null

  /** 初始化背景位置/大小 */
  function initBg() {
    const page = pageRef()
    if (!page) return
    if (store.getBgW) page.style.width = store.getBgW
    if (store.getBgH) page.style.height = store.getBgH
    if (store.getBgX) page.style.left = store.getBgX
    if (store.getBgY) page.style.top = store.getBgY
  }

  /** 重置背景 */
  function resetBg() {
    const page = pageRef()
    if (!page) return
    page.style.width = ''
    page.style.height = ''
    page.style.left = ''
    page.style.top = ''
    store.setBgW('')
    store.setBgH('')
    store.setBgX('')
    store.setBgY('')
  }

  /** 滚轮缩放（以鼠标为中心） */
  function onMouseWheel(e: WheelEvent) {
    const page = pageRef()
    if (!page) return

    const reg1 = /[^0-9|.]/gi
    const reg2 = /[^-0-9|.]/gi
    const bgWidth = Number(page.style.width.replace(reg1, '')) || page.clientWidth
    const bgHeight = Number(page.style.height.replace(reg1, '')) || page.clientHeight

    if (bgWidth < BgMinWidth && e.deltaY > 0) return

    let width = bgWidth
    let height = bgHeight
    if (e.deltaY < 0) {
      width *= MouseWheelRatio
      height *= MouseWheelRatio
    } else {
      width /= MouseWheelRatio
      height /= MouseWheelRatio
    }

    page.style.width = `${width}px`
    page.style.height = `${height}px`
    store.setBgW(page.style.width)
    store.setBgH(page.style.height)

    const bgLeft = Number(page.style.left.replace(reg2, '')) || 0
    const bgTop = Number(page.style.top.replace(reg2, '')) || 0
    page.style.left = `${bgLeft - ((e.layerX / bgWidth) * width - e.layerX)}px`
    page.style.top = `${bgTop - ((e.layerY / bgHeight) * height - e.layerY)}px`
    store.setBgX(page.style.left)
    store.setBgY(page.style.top)
  }

  /** 切换背景图 */
  function changeImage(type: 1 | -1, listLength: number) {
    if (mouseTimer) return
    mouseTimer = setTimeout(() => {
      const max = listLength - 1
      let idx = bgIndex.value
      idx = type > 0 ? (idx >= max ? 0 : idx + 1) : (idx <= 0 ? max : idx - 1)
      store.setBgIndex(idx)
      bgIndex.value = idx
      clearTimeout(mouseTimer!)
      mouseTimer = null
    }, 300)
  }

  /** WASD 微调位置 */
  function nudge(dx: number, dy: number) {
    const page = pageRef()
    if (!page) return
    const left = parseInt(page.style.left || '0')
    const top = parseInt(page.style.top || '0')
    page.style.left = `${left + dx}px`
    page.style.top = `${top + dy}px`
    store.setBgX(page.style.left)
    store.setBgY(page.style.top)
  }

  // 同步 store 变化
  watch(() => store.bgIndex, (v) => { bgIndex.value = v })
  watch(() => store.sizeIndex, (v) => { sizeIndex.value = v })
  watch(() => store.bgMode, (v) => { bgMode.value = v })

  return {
    bgIndex, sizeIndex, bgMode,
    initBg, resetBg, onMouseWheel, changeImage, nudge,
  }
}
