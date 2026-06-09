<template>
  <div ref="drawEl" id="draw" @keydown="onKeyDown" tabindex="0">
    <div class="bg">
      <img
        v-if="showBgImg"
        :src="pageBgImgList[bgIndex]"
        :style="bgSizeList[sizeIndex]"
        draggable="false"
      />
    </div>
    <canvas ref="canvasRef" id="canvas" @mousedown="onMouseDown" />
    <div class="toolbar">
      <!-- 返回 -->
      <div class="tool-group">
        <el-button :icon="ArrowLeft" circle size="small" @click="goBack" title="返回首页" />
      </div>

      <!-- 背景显隐 -->
      <div class="tool-group">
        <el-button circle size="small" @click="showBgImg = !showBgImg" :title="showBgImg ? '隐藏背景' : '显示背景'">
          <el-icon><component :is="showBgImg ? View : Hide" /></el-icon>
        </el-button>
      </div>

      <!-- 颜色 -->
      <div class="tool-group">
        <el-color-picker
          v-model="color"
          :predefine="predefineColors"
          @change="onColorChange"
          :disabled="isEraser"
          size="small"
        />
      </div>

      <!-- 画笔粗细 -->
      <div class="tool-group width-group">
        <div
          v-for="w in widthList"
          :key="w"
          class="width-dot"
          :class="{ active: lineWidth === w }"
          @click="onWidthChange(w)"
        >
          <span :style="{ width: w + 'px', height: w + 'px', background: isEraser ? '#999' : color }"></span>
        </div>
      </div>

      <!-- 笔头 -->
      <div class="tool-group brush-group">
        <el-button
          v-for="(name, index) in brushNames"
          :key="index"
          size="small"
          :type="currentBrush === index && !isEraser ? 'primary' : ''"
          :disabled="isEraser"
          @click="onBrushChange(index)"
        >{{ name }}</el-button>
      </div>

      <!-- 橡皮擦 -->
      <div class="tool-group">
        <el-button
          size="small"
          :type="isEraser ? 'warning' : ''"
          @click="toggleEraser"
          title="橡皮擦"
        >
          <el-icon><EditPen v-if="!isEraser" /><Brush v-else /></el-icon>
        </el-button>
      </div>

      <div class="tool-divider" />

      <!-- 撤销/重做 -->
      <div class="tool-group">
        <el-button :disabled="drawStep < 0" circle size="small" @click="undo" title="撤销 Ctrl+Z">
          <el-icon><Back /></el-icon>
        </el-button>
        <el-button
          :disabled="drawStep >= drawHistory.length - 1"
          circle
          size="small"
          @click="redo"
          title="重做 Ctrl+Y"
        >
          <el-icon><Right /></el-icon>
        </el-button>
      </div>

      <!-- 清空 -->
      <div class="tool-group">
        <el-button circle size="small" @click="clearCanvas" title="清空画布">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>

      <!-- 保存 -->
      <div class="tool-group">
        <el-button circle size="small" @click="saveImage" title="保存为图片 Ctrl+S">
          <el-icon><Download /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import {
  Back, Right, View, Hide, ArrowLeft,
  Delete, Download, EditPen, Brush,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { PageBgImgList, BgSizeList } from "@/components/Options.js";
import useImgStore from "@/store/img";

const router = useRouter();
const imgStore = useImgStore();
const { getBgIndex, getSizeIndex } = imgStore;

const predefineColors = [
  "#ff4500", "#ff8c00", "#ffd700", "#90ee90",
  "#00ced1", "#1e90ff", "#c71585", "#333333",
  "rgba(255, 69, 0, 0.68)", "rgb(255, 120, 0)",
  "#c7158577",
];
const widthList = [2, 4, 6, 8, 12, 18];
const brushTypes = [
  { name: "round", cap: "round", join: "round" },
  { name: "square", cap: "square", join: "bevel" },
  { name: "butt", cap: "butt", join: "miter" },
];
const brushNames = ["圆头", "方头", "平头"];

const pageBgImgList = PageBgImgList;
const bgSizeList = BgSizeList;
const bgIndex = ref(getBgIndex);
const sizeIndex = ref(getSizeIndex);

const drawEl = ref<HTMLElement>();
const canvasRef = ref<HTMLCanvasElement>();
const color = ref(predefineColors[0]);
const lineWidth = ref(widthList[0]);
const currentBrush = ref(0);
const isEraser = ref(false);
const showBgImg = ref(true);
const isDrawing = ref(false);

interface Stroke {
  points: [number, number][];
  color: string;
  lineWidth: number;
  brushType: number;
  isEraser: boolean;
}

const drawHistory = ref<Stroke[]>([]);
const drawStep = ref(-1);
const currentPoints = ref<[number, number][]>([]);

function getCtx(): CanvasRenderingContext2D {
  return canvasRef.value!.getContext("2d")!;
}

function initCanvas() {
  if (!drawEl.value || !canvasRef.value) return;
  const canvas = canvasRef.value;
  canvas.width = drawEl.value.clientWidth;
  canvas.height = drawEl.value.clientHeight;
  applyBrush();
}

function applyBrush() {
  const ctx = getCtx();
  if (isEraser.value) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  } else {
    ctx.globalCompositeOperation = "source-over";
    const brush = brushTypes[currentBrush.value];
    ctx.lineCap = brush.cap as CanvasLineCap;
    ctx.lineJoin = brush.join as CanvasLineJoin;
    ctx.strokeStyle = color.value;
  }
  ctx.lineWidth = lineWidth.value;
}

function onColorChange() {
  if (!isEraser.value) {
    getCtx().strokeStyle = color.value;
  }
}

function onWidthChange(w: number) {
  lineWidth.value = w;
  getCtx().lineWidth = w;
}

function onBrushChange(index: number) {
  currentBrush.value = index;
  applyBrush();
}

function toggleEraser() {
  isEraser.value = !isEraser.value;
  applyBrush();
}

// ---- 绘图事件 ----
function onMouseDown(e: MouseEvent) {
  if (e.button !== 0) return; // 只响应左键
  isDrawing.value = true;
  currentPoints.value = [[e.offsetX, e.offsetY]];

  const ctx = getCtx();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
  e.preventDefault();
}

function onMouseMove(e: MouseEvent) {
  if (!isDrawing.value) return;
  const rect = canvasRef.value!.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  if (cx < 0 || cy < 0 || cx > rect.width || cy > rect.height) return;
  const pt: [number, number] = [cx, cy];
  currentPoints.value.push(pt);

  const ctx = getCtx();
  const pts = currentPoints.value;
  if (pts.length > 2) {
    const prev = pts[pts.length - 2];
    const midX = (prev[0] + pt[0]) / 2;
    const midY = (prev[1] + pt[1]) / 2;
    ctx.quadraticCurveTo(prev[0], prev[1], midX, midY);
  } else {
    ctx.lineTo(pt[0], pt[1]);
  }
  ctx.stroke();
}

function onMouseUp() {
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
  if (!isDrawing.value) return;
  isDrawing.value = false;

  if (currentPoints.value.length === 0) return;

  // 截断 redo 历史
  drawHistory.value = drawHistory.value.slice(0, drawStep.value + 1);
  drawHistory.value.push({
    points: [...currentPoints.value],
    color: color.value,
    lineWidth: lineWidth.value,
    brushType: currentBrush.value,
    isEraser: isEraser.value,
  });
  drawStep.value = drawHistory.value.length - 1;
  currentPoints.value = [];
}

// ---- 重绘全部 ----
function redrawAll() {
  const canvas = canvasRef.value!;
  const ctx = getCtx();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 临时保存并重置 composite 模式
  const savedComposite = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "source-over";

  const visible = drawHistory.value.slice(0, drawStep.value + 1);
  for (const stroke of visible) {
    ctx.globalCompositeOperation = stroke.isEraser
      ? "destination-out"
      : "source-over";

    ctx.lineWidth = stroke.lineWidth;
    if (stroke.isEraser) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    } else {
      const brush = brushTypes[stroke.brushType];
      ctx.lineCap = brush.cap as CanvasLineCap;
      ctx.lineJoin = brush.join as CanvasLineJoin;
      ctx.strokeStyle = stroke.color;
    }

    const pts = stroke.points;
    if (pts.length === 0) continue;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      if (i > 1) {
        const prev = pts[i - 1];
        const midX = (prev[0] + pts[i][0]) / 2;
        const midY = (prev[1] + pts[i][1]) / 2;
        ctx.quadraticCurveTo(prev[0], prev[1], midX, midY);
      } else {
        ctx.lineTo(pts[i][0], pts[i][1]);
      }
    }
    ctx.stroke();
  }

  ctx.globalCompositeOperation = savedComposite;
}

function undo() {
  if (drawStep.value >= 0) {
    drawStep.value--;
    redrawAll();
  }
}

function redo() {
  if (drawStep.value < drawHistory.value.length - 1) {
    drawStep.value++;
    // 只画增量
    const stroke = drawHistory.value[drawStep.value];
    drawSingleStroke(stroke);
  }
}

function drawSingleStroke(stroke: Stroke) {
  const ctx = getCtx();
  ctx.globalCompositeOperation = stroke.isEraser ? "destination-out" : "source-over";
  ctx.lineWidth = stroke.lineWidth;
  if (stroke.isEraser) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  } else {
    const brush = brushTypes[stroke.brushType];
    ctx.lineCap = brush.cap as CanvasLineCap;
    ctx.lineJoin = brush.join as CanvasLineJoin;
    ctx.strokeStyle = stroke.color;
  }

  const pts = stroke.points;
  if (pts.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    if (i > 1) {
      const prev = pts[i - 1];
      const midX = (prev[0] + pts[i][0]) / 2;
      const midY = (prev[1] + pts[i][1]) / 2;
      ctx.quadraticCurveTo(prev[0], prev[1], midX, midY);
    } else {
      ctx.lineTo(pts[i][0], pts[i][1]);
    }
  }
  ctx.stroke();
}

function clearCanvas() {
  drawHistory.value = [];
  drawStep.value = -1;
  currentPoints.value = [];
  const canvas = canvasRef.value!;
  getCtx().clearRect(0, 0, canvas.width, canvas.height);
}

function saveImage() {
  const canvas = canvasRef.value!;
  // 如果有背景图，合成背景 + 画布
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;
  const ectx = exportCanvas.getContext("2d")!;

  if (showBgImg.value) {
    const bgImg = drawEl.value?.querySelector(".bg img") as HTMLImageElement;
    if (bgImg && bgImg.complete) {
      ectx.drawImage(bgImg, 0, 0, exportCanvas.width, exportCanvas.height);
    }
  }
  ectx.drawImage(canvas, 0, 0);

  exportCanvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `drawing_${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
    ElMessage.success("已保存");
  }, "image/png");
}

function onKeyDown(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === "z" || e.key === "Z") {
      e.preventDefault();
      undo();
    } else if (e.key === "y" || e.key === "Y") {
      e.preventDefault();
      redo();
    } else if (e.key === "s" || e.key === "S") {
      e.preventDefault();
      saveImage();
    }
  }
}

function onResize() {
  if (!drawEl.value || !canvasRef.value) return;
  const canvas = canvasRef.value;
  const w = drawEl.value.clientWidth;
  const h = drawEl.value.clientHeight;
  if (canvas.width === w && canvas.height === h) return;

  // 保存当前绘制结果
  const imgData = getCtx().getImageData(0, 0, canvas.width, canvas.height);
  canvas.width = w;
  canvas.height = h;
  getCtx().putImageData(imgData, 0, 0);
  applyBrush();
}

function goBack() {
  router.push("/");
}

onMounted(() => {
  initCanvas();
  drawEl.value?.focus();
  window.addEventListener("resize", onResize);
});

onUnmounted(() => {
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
  window.removeEventListener("resize", onResize);
});
</script>

<style scoped lang="scss">
#draw {
  height: 100%;
  width: 100%;
  user-select: none;
  outline: none;
  position: relative;
  overflow: hidden;

  .bg {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 0;
  }

  #canvas {
    cursor: url("@/assets/image/pen.png") 0 32, auto;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
  }
}

.toolbar {
  position: absolute;
  left: 10px;
  bottom: 10px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(40, 40, 40, 0.75);
  border-radius: 10px;
  backdrop-filter: blur(8px);
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tool-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 4px;
}

.width-group {
  .width-dot {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.15s;

    &.active {
      background: rgba(255, 255, 255, 0.2);
    }

    span {
      display: inline-block;
      border-radius: 50%;
      transition: transform 0.15s;
    }

    &:hover span {
      transform: scale(1.3);
    }
  }
}

.brush-group .el-button {
  font-size: 12px;
  padding: 3px 8px;
}

:deep(.el-color-picker__trigger) {
  border: 1px solid rgba(255, 255, 255, 0.3);
}
</style>


