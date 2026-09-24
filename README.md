<div align="center">
  <img src="public/qiuye-ui-icon.svg" width="72" height="72" alt="QiuYe UI" />
  <h1>QiuYe UI</h1>
  <p>基于 shadcn/ui Registry 分发的 React 组件集。</p>
  <p>
    <a href="https://ui.qiuyedx.com">官网</a> ·
    <a href="https://ui.qiuyedx.com/components">组件目录</a> ·
    <a href="https://ui.qiuyedx.com/cli">安装指南</a> ·
    <a href="https://ui.qiuyedx.com/registry/registry.json">Registry</a>
  </p>
</div>

QiuYe UI 是一个基于 shadcn/ui Registry 的 React 组件集，主要收录内容展示、导航、媒体、表单和视觉效果类组件。安装后组件会以源码形式进入项目，可以直接阅读和修改。

官网提供在线预览、用法示例、Props API、依赖信息和 Registry 源码。国际访问可使用 [qiuye-ui.vercel.app](https://qiuye-ui.vercel.app)。

## 安装

目标项目需要先完成 shadcn/ui 初始化：

```bash
pnpm dlx shadcn@latest init
```

在 `components.json` 中配置 QiuYe UI Registry：

```json
{
  "registries": {
    "@qiuye-ui": "https://ui.qiuyedx.com/registry/{name}.json"
  }
}
```

然后像安装其他 shadcn/ui 组件一样安装 QiuYe UI 组件：

```bash
pnpm dlx shadcn@latest add @qiuye-ui/responsive-tabs
```

支持一次安装多个组件：

```bash
pnpm dlx shadcn@latest add @qiuye-ui/code-block @qiuye-ui/markdown-renderer @qiuye-ui/tour
```

也可以不配置 alias，直接使用 Registry URL：

```bash
pnpm dlx shadcn@latest add https://ui.qiuyedx.com/registry/responsive-tabs.json
```

国际域名对应的 Registry 地址为 `https://qiuye-ui.vercel.app/registry/{name}.json`。

## 组件

| 组件                                                                                 | Registry 名称             | 说明                                                                                   |
| ------------------------------------------------------------------------------------ | ------------------------- | -------------------------------------------------------------------------------------- |
| [AnimatedNumber](https://ui.qiuyedx.com/components/animated-number) | `animated-number` | 逐位数字过渡，可选模糊、平滑宽度和 Intl 格式化。 |
| [Clip Path Tabs](https://ui.qiuyedx.com/components/clip-path-tabs)                   | `clip-path-tabs`          | 使用 `clip-path` 完成背景与文字颜色过渡的标签组，支持连续和分段布局。                  |
| [Code Block](https://ui.qiuyedx.com/components/code-block)                           | `code-block`              | 代码块与文件面板，支持主题、行号、Diff、行高亮、折叠和复制。                           |
| [Color Picker](https://ui.qiuyedx.com/components/color-picker)                       | `color-picker`            | HSV 取色器，支持 Alpha、触控、预设色、最近颜色和 Popover / Inline 模式。               |
| [Dot Glass](https://ui.qiuyedx.com/components/dot-glass)                             | `dot-glass`               | 点阵开孔毛玻璃效果，用于 Header、Navbar 等前景容器。                                   |
| [Dual State Toggle](https://ui.qiuyedx.com/components/dual-state-toggle)             | `dual-state-toggle`       | 双状态图标按钮，内置按压反馈和多种图标过渡。                                           |
| [Image Viewer](https://ui.qiuyedx.com/components/image-viewer)                       | `image-viewer`            | 图片查看器，支持灯箱、缩放、平移、触控和加载过渡。                                     |
| [Markdown Renderer](https://ui.qiuyedx.com/components/markdown-renderer)             | `markdown-renderer`       | Markdown 渲染器，支持 GFM、代码高亮、Mermaid、图片预览和自定义 Widget。                |
| [Matrix Effect](https://ui.qiuyedx.com/components/matrix-effect)                     | `matrix-effect`           | 可组合的 Canvas 矩阵效果管线，支持图像采样、圆点矩阵、ASCII 和自定义渲染。             |
| [Responsive Tabs](https://ui.qiuyedx.com/components/responsive-tabs)                 | `responsive-tabs`         | 空间充足时单行等分、放不下时横向滚动，支持固定网格、边缘遮罩和选中态动画。             |
| [Scrollable Dialog](https://ui.qiuyedx.com/components/scrollable-dialog)             | `scrollable-dialog`       | 头部和底部固定、内容区独立滚动的对话框。                                               |
| [Segmented Control](https://ui.qiuyedx.com/components/segmented-control)             | `segmented-control`       | 滑块式分段选择器，支持键盘导航、禁用项、表单提交和受控模式。                           |
| [Smooth Corners](https://ui.qiuyedx.com/components/smooth-corners)                   | `smooth-corners`          | Figma / iOS 风格的平滑圆角，基于 CSS `corner-shape` 渐进增强并回退到 `border-radius`。 |
| [Theme Transition Toggle](https://ui.qiuyedx.com/components/theme-transition-toggle) | `theme-transition-toggle` | 基于 View Transition API 的主题切换按钮，支持多种几何揭幕效果和自动降级。              |
| [Tour](https://ui.qiuyedx.com/components/tour)                                       | `tour`                    | 产品引导组件，包含目标高亮、步骤导航、自动滚动和中断处理。                             |
| [Typewriter](https://ui.qiuyedx.com/components/typewriter)                           | `typewriter`              | 打字机效果，支持多文案轮播、单次输入、自定义光标和宽度过渡。                           |

Registry 索引：

- [ui.qiuyedx.com/registry/registry.json](https://ui.qiuyedx.com/registry/registry.json)
- [qiuye-ui.vercel.app/registry/registry.json](https://qiuye-ui.vercel.app/registry/registry.json)

## Registry

QiuYe UI 不以单一 React npm 包分发组件。shadcn CLI 会读取 Registry JSON，安装 npm 依赖，并将组件源码写入目标项目。

仓库中与 Registry 相关的主要文件：

- `components/qiuye-ui/`：组件源码。
- `public/registry/<name>.json`：单个 Registry item。
- `public/registry/registry.json`：组件索引，由脚本生成。
- `scripts/update-registry.mjs`：回填 `files[].content` 并重建索引。

修改组件源码后，需要同步 Registry：

```bash
pnpm update-registry:dry
pnpm update-registry
```

`public/registry/registry.json` 和各 item 的 `files[].content` 属于生成内容，不应手动维护。

## MCP Server

`@qiuye-ui/mcp` 将 Registry 暴露为 MCP tools 和 resources，可用于查询组件、读取源码和生成安装命令。

在 MCP 客户端中添加：

```json
{
  "mcpServers": {
    "@qiuye-ui/mcp": {
      "command": "npx",
      "args": ["-y", "--package", "@qiuye-ui/mcp@latest", "qiuye-ui-mcp"]
    }
  }
}
```

检查 Registry 连通性：

```bash
npx -y --package @qiuye-ui/mcp@latest qiuye-ui-mcp --check
```

完整的命令、环境变量和 MCP 能力见 [MCP Server 文档](./packages/qiuye-ui-cli/README.md)。

## 本地开发

环境要求：Node.js 18 或更高版本，pnpm 8.7.0。

```bash
git clone https://github.com/qiuyedx/qiuye-ui.git
cd qiuye-ui
pnpm install
pnpm dev
```

开发服务默认运行在 [http://localhost:3000](http://localhost:3000)。

| 命令                       | 用途                              |
| -------------------------- | --------------------------------- |
| `pnpm dev`                 | 启动 Next.js Turbopack 开发服务。 |
| `pnpm lint`                | 运行 ESLint。                     |
| `pnpm build`               | 构建并导出静态站点到 `out/`。     |
| `pnpm start`               | 预览 `out/` 中的静态站点。        |
| `pnpm update-registry:dry` | 预览 Registry 生成结果。          |
| `pnpm update-registry`     | 更新 Registry item 内容和索引。   |

## 仓库结构

```text
qiuye-ui/
├── app/                         # 官网路由和页面
├── components/
│   ├── qiuye-ui/                # 可分发的组件与 Demo
│   ├── site/                    # 官网导航和 Shell
│   └── ui/                      # shadcn/ui 基础组件
├── hooks/                       # Registry 可引用的 hooks
├── lib/                         # 组件元数据和站点逻辑
├── packages/qiuye-ui-cli/       # @qiuye-ui/mcp
├── public/registry/             # 对外分发的 Registry JSON
├── scripts/update-registry.mjs  # Registry 生成脚本
└── docs/                        # 设计文档和实施记录
```

官网使用 Next.js 15 App Router、React 19 和 Tailwind CSS 4，通过 `output: "export"` 生成静态站点。

## 维护组件

新增或修改组件时，需要保持源码、官网元数据和 Registry 一致。

1. 在 `components/qiuye-ui/` 中新增或修改组件，并同步 `components/qiuye-ui/demos/` 中的 Demo。
2. 更新 `lib/component-constants.ts`、`lib/registry.ts` 以及组件详情页中的 Demo 映射。
3. 在 `public/registry/` 中维护对应的 Registry item。npm 包写入 `dependencies`，shadcn/ui 或 QiuYe UI 组件写入 `registryDependencies`。
4. 组件源码文件通常不设置 `target`，让 shadcn CLI 根据目标项目的 aliases 决定安装路径。
5. 如果需要 MCP 在远端索引不可用时仍能识别新组件，同步更新 `DEFAULT_COMPONENT_NAMES`。
6. 运行 Registry 生成、lint 和构建检查。

```bash
pnpm update-registry:dry
pnpm update-registry
pnpm lint
pnpm build
```

## 贡献

提交 Pull Request 前，请确认 Registry 已与源码同步，并且 `pnpm lint` 和 `pnpm build` 通过。问题和改进建议可以提交到 [GitHub Issues](https://github.com/qiuyedx/qiuye-ui/issues)。

## License

MIT © 2026 秋夜
