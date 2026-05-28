# 二丁果然 - Chrome 新标签页扩展

一个功能丰富的 Chrome 浏览器新标签页扩展，提供可定制的启动页，集成了搜索、AI 聊天、绘画、小说阅读和拼图游戏等功能。

## 技术栈

| 层级 | 技术 |
|------|------|
| 语言 | TypeScript / JavaScript |
| 框架 | Vue 3 (Composition API) |
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
- **书签** — 快速访问百度、有道翻译、DeepSeek、故事、绘画、拼图等，可折叠可拖动
- **AI 聊天** — 集成 DeepSeek API 的智能对话，聊天记录持久化到 localStorage
- **实时股票** — 从腾讯金融 API 获取 A 股行情，每秒刷新，红涨绿跌
- **翻页时钟** — 数字翻页样式时间显示

### 绘画 (/draw)
Canvas 2D 绘画工具，支持背景图片叠加、颜色选择、画笔宽度调节、多种线帽样式、撤销/重做。

### 小说阅读器 (/story)
加载本地 .txt/.md 文件，渲染为格式化文本。

### 拼图游戏 (/puzzle)
3x3 滑块拼图，基于当前背景图片，步数计数和计时器。

## 项目结构

```
src/
├── main.js                    # 入口
├── App.vue                    # 根组件
├── router/index.js            # 路由 (/ /draw /story /puzzle)
├── store/
│   ├── index.js               # Pinia store 创建
│   ├── img.ts                 # 背景图片 store
│   └── ai.ts                  # AI 聊天 store
├── utils/
│   ├── index.ts               # localStorage 工具
│   └── constant.ts            # 常量
├── hooks/
│   └── useMouseEvent.ts       # 拖拽 composable
├── assets/
│   ├── css/index.scss         # 全局样式
│   └── image/                 # 图标资源
├── components/
│   ├── Back.vue               # 返回首页
│   ├── DeepSeek.vue           # AI 聊天
│   ├── Grid.vue               # 背景模式切换
│   ├── ImgList.vue            # 缩略图选择
│   ├── Options.js             # 常量配置
│   ├── StockList.vue          # 股票行情
│   └── TimeClock.vue          # 时钟
└── views/
    ├── home/index.vue         # 主页
    ├── draw/index.vue         # 绘画
    ├── story/index.vue        # 小说阅读
    ├── puzzle/index.vue       # 拼图游戏
    └── puzzle/puzzle.ts       # 拼图逻辑

public/
├── manifest.json              # Chrome 扩展 manifest
├── img/bg/                    # 背景图片
├── img/bg-thumbnail/          # 缩略图
├── img/bg-grid/               # 网格裁剪
└── story/                     # 小说文件
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

## 安全注意

`src/components/DeepSeek.vue` 中硬编码了 DeepSeek API 密钥，建议迁移到环境变量或后端代理。
