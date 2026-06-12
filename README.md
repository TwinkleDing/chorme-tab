# 二丁果然 - Chrome 新标签页扩展

一个功能丰富的 Chrome 浏览器新标签页扩展，提供可定制的启动页，集成了搜索、绘画、小说阅读、股票看板和拼图游戏等功能。

## 技术栈

| 层级 | 技术 |
|------|------|
| 语言 | TypeScript |
| 框架 | Vue 3 (Composition API + `<script setup>`) |
| 构建 | Vite 4 |
| UI | Element Plus 2.11 |
| 状态管理 | Pinia 2 |
| 路由 | Vue Router 4 (hash 模式) |
| CSS | SASS/SCSS |
| 包管理 | Yarn |

## 功能

### 主页 (/)
- **自定义背景** — 13 张图片，支持滚轮缩放（以鼠标为中心）、拖动定位、键盘控制（上下箭头切换图片，左右箭头切换适配模式，WASD 微移）
- **双模式显示** — 全屏单图模式和网格平铺模式
- **搜索栏** — 输入 `www.` 开头直接打开 URL，否则百度搜索
- **书签** — 快速访问百度、有道翻译、故事、绘画、拼图等，可折叠可拖动
- **实时股票** — 从腾讯金融 API 获取 A 股行情，每秒刷新，红涨绿跌

### 数据看板 (/stock)
K线图页面 — 使用 lightweight-charts，支持日K/5分钟图、MA 均线、成交量、拖拽排序、实时数据浮层卡片、全页灰度。

### 绘画 (/draw)
Canvas 2D 绘画工具，支持背景图片叠加、颜色选择、画笔宽度调节、多种线帽样式、撤销/重做、导出 PNG。

### 小说阅读器 (/story)
加载本地 .txt 文件，渲染为格式化文本。

### 拼图游戏 (/puzzle)
3×3 / 4×4 / 5×5 滑块拼图，基于当前背景图片，步数计数和计时器，本地最佳成绩。

## 项目结构

```
src/
├── main.js                     # 入口
├── App.vue                     # 根组件
├── router/index.js             # 路由
├── stores/                     # Pinia store
│   ├── index.ts                # Pinia 实例
│   ├── background.ts           # 背景图片状态
│   └── stock.ts                # 股票状态
├── composables/                # Vue 组合式函数
│   ├── useMouseEvent.ts        # 拖拽
│   ├── useBackground.ts        # 背景缩放/移动
│   ├── useKlineData.ts         # K线数据获取
│   └── useStockRealtime.ts     # 实时股票行情
├── config/                     # 配置数据
│   ├── images.ts               # 背景图列表
│   └── bookmarks.ts            # 书签列表
├── utils/
│   ├── storage.ts              # localStorage 封装
│   ├── date.ts                 # 日期格式化
│   └── constants.ts            # 常量
├── types/
│   └── stock.ts                # 股票类型定义
├── assets/
│   ├── css/index.scss          # 全局样式
│   ├── styles/variables.scss   # 设计令牌
│   └── image/                  # 图标资源
├── components/
│   ├── Grid.vue                # 背景模式切换
│   ├── ImgList.vue             # 缩略图选择
│   ├── CandlestickChart.vue    # K线图
│   ├── Watchlist.vue           # 自选股列表（拖拽排序）
│   └── shared/
│       └── BackButton.vue      # 返回首页按钮
└── views/
    ├── home/
    │   ├── index.vue           # 主页父组件
    │   └── components/         # 主页子组件
    │       ├── BackgroundView.vue
    │       ├── SearchBar.vue
    │       ├── BookmarkList.vue
    │       └── StockTicker.vue
    ├── stock/
    │   ├── index.vue           # 股票页面父组件
    │   └── components/         # 股票页面子组件
    │       ├── StockHeader.vue
    │       ├── ChartToolbar.vue
    │       └── RealtimeCard.vue
    ├── draw/index.vue          # 绘画
    ├── story/index.vue         # 小说阅读
    └── puzzle/
        ├── index.vue           # 拼图游戏
        └── puzzle.ts           # 拼图逻辑类

public/
├── manifest.json               # Chrome 扩展 manifest
├── img/bg/                     # 背景图片
├── img/bg-thumbnail/           # 缩略图
├── img/bg-grid/                # 网格裁剪
└── story/                      # 小说文件
```

## 开发

```bash
# 安装依赖
yarn install

# 启动开发服务器 (localhost:520)
yarn dev

# 生产构建
yarn build

# 预览构建产物
yarn preview
```

## Chrome 扩展

通过 `public/manifest.json` 的 `chrome_url_overrides.newtab` 声明覆盖浏览器新标签页。构建后加载 `dist/` 目录即可作为 Chrome 扩展使用。

## 版本历史

| 版本 | 内容 |
|------|------|
| v1.0.0 | 基础背景、搜索框 |
| v1.0.1 | 背景图片 size 切换 |
| v1.0.2 | 更多背景图片 |
| v1.0.3 | 时间显示、搜索框缩放 |
| v1.0.4 | 自由选图 |
| v1.0.5 | 宫格展示 |
| v1.0.6 | 背景拖动、滚轮缩放 |
| v1.0.7 | 图片模式优化，宫格拖动缩放 |
| v1.0.8 | 缩放中心为鼠标位置 |
| v1.0.9 | 绘画、小说阅读、游戏页 |
| v1.0.10 | WASD 移动背景 |
| v1.0.11 | 拼图游戏 |
| v2.0.0 | 重构 — 拆分大组件、统一 TS、消除重复、目录重组 |
