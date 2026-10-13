# 基于 Next.js 15 + shadcn/ui：打造可 CLI 安装的自定义组件库（QiuYe UI 实战）

> 面向 shadcn/ui Registry 机制的实战：静态部署、脚本回填、npx 一键安装、组件浏览器

## 前言：这篇文章解决什么问题？

shadcn/ui 的核心理念是“把组件源码拷进你的项目里”，而不是发布成一个黑盒 npm 包。问题随之而来：

- 你写了一些 **自定义 shadcn 风格组件**，想在多个项目里复用
- 你希望复用方式也像 shadcn/ui 一样优雅：一句命令即可安装、自动补齐依赖、文件落在你指定的目录结构中

本文基于实际项目 **QiuYe UI（秋夜组件库）** 的完整实现，讲清楚如何做一个“像 shadcn/ui 一样可安装”的组件库生态：**组件源码 + Registry JSON + 静态部署 + 一键 CLI 安装 + 在线组件浏览器**。

## TL;DR（先给结论）

你不需要发布 npm 包，也不需要自己写 CLI。

只要做到这 4 件事，就能让别人通过 `npx shadcn@latest add ...` 安装你的组件：

1. **把组件源码放在仓库里**（例如 `components/qiuye-ui/*.tsx`）
2. **为每个组件提供一个 registry JSON**（例如 `public/registry/responsive-tabs.json`）
3. **把组件源码写进 registry JSON 的 `files[].content` 字段**（本仓库用脚本自动回填）
4. **把整个站点部署成静态站点**，让 `https://你的域名/registry/<name>.json` 可访问

shadcn CLI 的工作就是：下载这个 JSON → 按 `files[].target`（若提供）或 `components.json` 的 aliases 计算落盘位置 → 写文件 → 安装依赖。

## 在线示例（本项目）

- 组件浏览：[`/components`](https://qiuye-ui.vercel.app/components)
- CLI 使用指南：[`/cli`](https://qiuye-ui.vercel.app/cli)
- Registry 示例：[`/registry/responsive-tabs.json`](https://qiuye-ui.vercel.app/registry/responsive-tabs.json)

> 中国大陆如果访问 `vercel.app` 不稳定，可用镜像域名 `https://ui.qiuyedx.com`（同路径）。

## 项目结构（以本仓库为例）

```text
qiuye-ui/
├── app/
│   ├── components/                 # 组件浏览页
│   │   └── [id]/                   # 组件详情页（静态生成）
│   ├── cli/                        # CLI 使用指南页
│   ├── layout.tsx                  # 布局（Sidebar + Header + ThemeProvider）
│   └── page.tsx                    # 首页
├── components/
│   ├── qiuye-ui/                   # 自定义组件源码（被写入 registry 的来源）
│   │   ├── code-block/
│   │   ├── markdown-renderer/
│   │   ├── color-picker.tsx
│   │   ├── responsive-tabs.tsx
│   │   ├── scrollable-dialog.tsx
│   │   ├── smooth-corners.tsx
│   │   ├── tour.tsx
│   │   ├── typewriter.tsx
│   │   └── demos/                  # 组件演示（用于站点展示）
│   └── ui/                         # shadcn/ui 基础组件（button/tabs/dialog...）
├── lib/
│   ├── component-constants.ts       # 组件 id 与基础用法示例
│   └── registry.ts                 # 组件元数据（仅供站点使用）
├── public/
│   └── registry/                   # 组件 registry（核心：给 shadcn CLI 用）
│       ├── code-block.json
│       ├── color-picker.json
│       ├── markdown-renderer.json
│       ├── responsive-tabs.json
│       ├── scrollable-dialog.json
│       ├── smooth-corners.json
│       ├── tour.json
│       └── typewriter.json
└── scripts/
    └── update-registry.mjs          # 自动回填 files[].content
```

要特别强调：**shadcn CLI 只关心 `public/registry/*.json`**，组件浏览器、文档站点是“锦上添花”，但对推广/自用体验非常加分。

## 关键易错点（建议先看）

### 1) `dependencies` vs `registryDependencies` 别填反

- `dependencies`：npm 包依赖，例如 `motion`、`lucide-react`、`clsx`
- `registryDependencies`：shadcn/ui 的组件依赖，例如 `button`、`tabs`、`dialog`

举例：本仓库的 `responsive-tabs` 会 import `@/components/ui/tabs`、`@/components/ui/badge`、`@/components/ui/button`，因此它的 registry 是：

- `dependencies`: `["react","lucide-react","motion"]`
- `registryDependencies`: `["tabs","badge","button"]`

### 2) `files[].path` 必填，`files[].target` 写成与 `path` 相同

- `path`：**你组件库仓库里**的真实路径，例如 `components/qiuye-ui/responsive-tabs.tsx`
- `target`：落盘位置。本仓库由 `scripts/update-registry.mjs` 自动写成与 `path` 相同的值

早期版本的 CLI 会按 aliases 推断落盘位置，所以组件文件可以不写 `target`。但 shadcn CLI 4 遇到没有 `target` 的文件会按 `type` 把它拍平到 `components/` 根目录：多文件组件（如 `code-block/`、`markdown-renderer/`）的 `index.ts`、`types.ts` 会互相覆盖，相对导入也随之失效。

### 3) 不用纠结 `src/`：CLI 会自动补前缀

写上 `target: "components/qiuye-ui/code-block/index.ts"` 之后：

- 非 `src/` 项目落到 `components/qiuye-ui/code-block/index.ts`
- `src/` 目录项目由 CLI 自动落到 `src/components/qiuye-ui/code-block/index.ts`（`lib/`、`hooks/` 同理）

另一个容易踩的坑：同一个 registry item 里，不同目录的文件不要同名（如 `components/qiuye-ui/animated-number.tsx` 和 `lib/animated-number.ts`）。CLI 按文件名改写 `@/` 导入，可能把 `@/lib/animated-number` 改写成组件自身路径。

### 4) 组件里只要用了 hooks / 事件 / 状态，就要写 `"use client"`

很多自定义组件（动画、交互类）都需要 client component。你可以像本仓库一样，让源码文件自带 `"use client"`，脚本会原样回填到 registry。

### 5) 想做“纯静态部署”，Next.js 需要 `output: "export"`

本仓库的 `next.config.ts` 采用静态导出（`out/` 目录可直接丢到任何静态托管）：

```ts
// next.config.ts（节选）
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};
```

同时，像 `app/components/[id]` 这种动态路由必须提供 `generateStaticParams()`，否则 `next export` 无法生成页面。

## 核心机制：shadcn Registry 到底是什么？

shadcn CLI 支持的 registry item schema 见：

- `https://ui.shadcn.com/schema/registry-item.json`

你可以把它理解为“一份可远程下载的组件安装说明书”，关键字段包括：

- `name`：组件的唯一标识（CLI 安装时用）
- `dependencies`：需要安装的 npm 包
- `registryDependencies`：需要安装的 shadcn/ui 组件
- `files`：要写入用户项目的文件列表
  - `path`：组件库仓库里的文件路径（给维护脚本用）
  - `target`：落盘位置；本仓库由脚本写成与 `path` 相同的值
  - `content`：文件内容（源码字符串）

CLI 流程（简化）：

1. 拉取 `https://你的域名/registry/<name>.json`
2. 解析 `files[].content` → 按 `files[].target`（若提供）或 aliases 计算落盘位置并写入
3. 根据 `dependencies` 安装 npm 包
4. 根据 `registryDependencies` 安装 shadcn/ui 基础组件

## Step 0：初始化一个 Next.js 15 + shadcn/ui 项目（一次性）

如果你想从 0 开始复刻本仓库的技术路线，可以按以下步骤初始化（你也可以用 npm/yarn，命令里的 `pnpm` 仅代表我的选择）。

### 0.1 创建 Next.js 项目

```bash
pnpm create next-app@latest qiuye-ui-components --typescript --tailwind --app
cd qiuye-ui-components
```

### 0.2 初始化 shadcn/ui

```bash
pnpm dlx shadcn@latest init
```

建议选择与本仓库一致的偏好（便于减少路径差异带来的坑）：

- `style`: `new-york`
- `tsx`: `true`
- `rsc`: `true`
- aliases：保持 `@/components`、`@/lib/utils` 等默认约定

### 0.3 安装自定义组件会用到的 npm 依赖（按需）

你的 registry 里 `dependencies` 写了什么，用户安装时就会装什么；但**组件库仓库本身**也需要安装这些依赖来开发/预览。

例如本仓库的组件涉及动画与图标：

```bash
pnpm add motion lucide-react
pnpm add class-variance-authority clsx
```

> 小提示：本仓库使用的是 Motion（包名 `motion`），组件里 import 走 `motion/react`，不是 `framer-motion`。

## Step 1：编写自定义组件（components/qiuye-ui）

以 `ResponsiveTabs` 为例：

- 源码位置：[`components/qiuye-ui/responsive-tabs.tsx`](./components/qiuye-ui/responsive-tabs.tsx)
- 对应 registry：[`public/registry/responsive-tabs.json`](./public/registry/responsive-tabs.json)

建议保持与 shadcn/ui 一致的开发习惯：

- `React.forwardRef` + `displayName`
- props 继承原生属性（如 `React.HTMLAttributes`）
- 支持 `className` 并统一使用 `cn()`（见 [`lib/utils.ts`](./lib/utils.ts)）

## Step 2：编写 registry JSON（public/registry）

### 2.1 先写一个“骨架文件”（content 留空）

例如新建 `public/registry/my-component.json`：

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "my-component",
  "title": "MyComponent",
  "type": "registry:component",
  "author": "YourName <you@example.com>",
  "dependencies": ["react"],
  "registryDependencies": [],
  "files": [
    {
      "type": "registry:component",
      "path": "components/qiuye-ui/my-component.tsx",
      "content": ""
    }
  ]
}
```

骨架里不用写 `target`，运行 `pnpm update-registry` 时脚本会把它写成与 `path` 相同的值（原因见上文“`files[].target` 写成与 `path` 相同”）。

### 2.2 再看一个“真实可用”的示例（本仓库）

你可以直接对照本仓库的 registry：

- `responsive-tabs`：[`public/registry/responsive-tabs.json`](./public/registry/responsive-tabs.json)
- `markdown-renderer`：[`public/registry/markdown-renderer.json`](./public/registry/markdown-renderer.json)

注意点：

- `responsive-tabs` 同时声明了 `dependencies`（npm 包）与 `registryDependencies`（shadcn 组件），这是很多人第一次写 registry 时最容易漏的地方。

## Step 3：用脚本自动回填 `files[].content`

手写 `content` 基本等于“自找麻烦”：不仅要转义换行与引号，还要保证与源码同步。

本仓库提供脚本：[`scripts/update-registry.mjs`](./scripts/update-registry.mjs)，会递归扫描 registry 目录，把 `files[].path` 指向的源码读出来，写回到 `files[].content`。

### 3.1 package.json 脚本

本仓库已在 `package.json` 配好：

```json
{
  "scripts": {
    "update-registry": "node scripts/update-registry.mjs --dir public/registry --base .",
    "update-registry:dry": "node scripts/update-registry.mjs --dir public/registry --base . --dry"
  }
}
```

### 3.2 使用方式

```bash
# 真正写入 content
pnpm run update-registry

# 仅预览变更（不会写文件）
pnpm run update-registry:dry
```

脚本做了几件“为维护体验加分”的事：

- 支持 `--dir` / `--base` / `--dry`
- 对 registry JSON 做结构校验（不是 registry item 会跳过并提示）
- 对 `path` 做多候选尝试（例如 `src/` 前缀、`./` 前缀），降低迁移/重构时的痛点

## Step 4：让用户可以用 `@qiuye-ui/xxx` 安装

### 4.1 方式一：用户项目配置 registries（推荐）

让用户在自己的 `components.json` 里加一段：

```json
{
  "registries": {
    "@qiuye-ui": "https://qiuye-ui.vercel.app/registry/{name}.json"
  }
}
```

中国大陆如果访问 `vercel.app` 不稳定，可替换为镜像域名：

```json
{
  "registries": {
    "@qiuye-ui": "https://ui.qiuyedx.com/registry/{name}.json"
  }
}
```

然后就可以：

```bash
npx shadcn@latest add @qiuye-ui/responsive-tabs
# 或
pnpm dlx shadcn@latest add @qiuye-ui/responsive-tabs
```

如果要在本地临时目标项目中测试未发布的 registry，可以把该目标项目的 `components.json` 指向本地开发服务：

```json
{
  "registries": {
    "@qiuye-ui": "http://localhost:3000/registry/{name}.json"
  }
}
```

### 4.2 方式二：直接用 URL 安装（不需要 registries）

```bash
npx shadcn@latest add https://qiuye-ui.vercel.app/registry/responsive-tabs.json
```

适合临时试用或不想改 `components.json` 的场景。

## Step 5：做一个组件浏览器（强烈推荐）

Registry 解决的是“安装”，组件浏览器解决的是“发现与选择”。

本仓库实现要点：

- 组件元数据：[`lib/registry.ts`](./lib/registry.ts)
  - 组件名称、描述、分类、tags、依赖、CLI 名称、基础用法示例等
- 组件列表页：[`app/components/page.tsx`](./app/components/page.tsx)
  - 搜索、分类、复制安装命令、切换 npm/pnpm
- 组件详情页：[`app/components/[id]/page.tsx`](./app/components/[id]/page.tsx)
  - Demo、基本用法、Props API、依赖一键复制等
- CLI 文档页：[`app/cli/page.tsx`](./app/cli/page.tsx)

> 注意：站点展示使用的 `lib/registry.ts` 与 shadcn CLI 使用的 `public/registry/*.json` 是两条线：前者用于 UI，后者用于安装。

## Step 6：部署成静态站点（让 /registry 可访问）

本仓库使用 `next export` 的思路（见 `next.config.ts` 的 `output: "export"`）。

### 6.1 本地预览 out 产物

```bash
pnpm install
pnpm run update-registry
pnpm build
pnpm start
```

其中：

- `pnpm build` 会产出 `out/`
- `pnpm start` 实际上是 `npx serve@latest out`

### 6.2 部署到 Vercel / 其他静态托管

只要你的托管平台能把 `out/` 当成静态目录发布，并且能访问：

- `/registry/<name>.json`

就可以给 shadcn CLI 用。

如果你用了自定义域名，强烈建议让 registry URL 稳定（不要轻易改路径），否则用户端的 `components.json` 配置会失效。

## Step 7（可选）：给组件库加 MCP 支持（让 Cursor/Claude 直接“懂你的组件库”）

MCP（Model Context Protocol）可以让 IDE/AI 客户端通过标准协议调用你的 **工具（tools）** 与 **资源（resources）**。

对于自定义 shadcn 组件库，它最实用的价值是：让 AI 直接读取你**部署出来的** registry（`/registry/*.json`），从而能更准确地回答：

- 有哪些组件可以装？
- 该用哪条 `shadcn add` 命令？
- 依赖（npm dependencies / registryDependencies）是什么？
- 组件源码是什么（`files[].content`）？

更重要的是：想要“别人也能用”，理想方案应该像 shadcn 官方一样：

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```

也就是说：把 MCP Server **做成一个 npm CLI 包**，让用户在任何项目里通过 `npx <pkg>@latest mcp` 直接启动（不需要 clone 你的组件库仓库）。

> 注意：这一步**不影响** shadcn CLI 的安装流程，只是给 AI “加上下文”，让它能更准确地帮你选组件、写用法、排查依赖问题。

### 7.1 让 registry 可“枚举”：提供 /registry/registry.json（推荐）

发布到 npm 的 MCP Server 运行时只拿得到“用户项目目录”，拿不到你的组件库仓库文件，因此它必须通过网络读取 registry。

为了支持“列出组件/搜索组件”，强烈建议额外提供一个索引文件：

- `https://你的域名/registry/registry.json`

本仓库已在 `scripts/update-registry.mjs` 里集成 registry 清单生成逻辑：你运行 `pnpm run update-registry` 时，会自动生成 `public/registry/registry.json`（部署后即可通过 `/registry/registry.json` 访问）。

### 7.2 本仓库的 npm MCP 实现

本仓库把 MCP Server 做成了一个可发布的 npm 包：

- 目录：`packages/qiuye-ui-cli`
- 包名：`@qiuye-ui/mcp`
- 命令：`qiuye-ui-mcp`（不带参数或带 `mcp` 子命令均可启动 MCP Server）

它默认从 `QIUIYE_UI_REGISTRY_BASE`（默认 `https://ui.qiuyedx.com/registry`）拉取：

- `/registry.json`（用于 list/search）
- `/<name>.json`（用于读取 registry item 与源码）

#### 7.2.1 CLI 用法

```bash
# 启动 MCP Server（默认）
npx -y --package @qiuye-ui/mcp@latest qiuye-ui-mcp

# 或显式指定 mcp 子命令
npx -y --package @qiuye-ui/mcp@latest qiuye-ui-mcp mcp

# 自检（验证 registry 连通性）
npx -y --package @qiuye-ui/mcp@latest qiuye-ui-mcp --check

# 查看帮助
npx -y --package @qiuye-ui/mcp@latest qiuye-ui-mcp --help

# 自定义 registry base
npx -y --package @qiuye-ui/mcp@latest qiuye-ui-mcp --registry-base http://localhost:3000/registry
# 或使用短参数
npx -y --package @qiuye-ui/mcp@latest qiuye-ui-mcp --base http://localhost:3000/registry
```

#### 7.2.2 发布到 npm（一次性）

```bash
# 推荐：pnpm（在仓库根目录执行）
pnpm -C packages/qiuye-ui-cli publish --access public

# 或：直接在 packages 目录发布
cd packages/qiuye-ui-cli
npm publish --access public
```

> 发布前记得更新 `packages/qiuye-ui-cli/package.json` 的 `version`；发布后用户即可通过 `npx -y --package @qiuye-ui/mcp@latest qiuye-ui-mcp` 启动 MCP Server。

### 7.3 在 Cursor 中启用（项目级，npx 一键启动）

在任意项目里创建 `.cursor/mcp.json`，写入：

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

然后重启/Reload 项目，确认 MCP Servers 里出现 `@qiuye-ui/mcp`。

> 本仓库也提供了可直接复制的示例文件：`packages/qiuye-ui-cli/mcp.cursor.example.json`

### 7.4 MCP 能力清单

#### Tools（更适合对话式调用）

| 名称 | 描述 | 参数 |
|------|------|------|
| `qiuye_ui_list_registry_items` | 列出 registry 索引中的组件 | `includeFiles?`: 是否包含 files 的 path/target（target 可选） |
| `qiuye_ui_search_registry_items` | 按关键词搜索组件 | `query`: 搜索关键词, `includeFiles?`: 同上 |
| `qiuye_ui_get_registry_item` | 读取指定组件的 registry JSON | `name`: 组件名, `includeContent?`: 是否包含源码 |
| `qiuye_ui_get_registry_file_content` | 读取组件源码 | `name`: 组件名, `index?`: files[] 下标（默认 0） |
| `qiuye_ui_get_shadcn_add_command` | 生成 shadcn 安装命令 | `name`: 组件名, `pm?`: npx/pnpm, `alias?`: registry alias |

#### Resources（更适合"让模型读资料"）

| URI | 描述 |
|-----|------|
| `qiuye-ui://registry/index` | 组件索引（JSON） |
| `qiuye-ui://registry/{name}` | 指定组件的 registry JSON（包含 files[].content） |

#### 组件名支持格式

以下格式均可被识别：

- `responsive-tabs` - 组件名
- `responsive-tabs.json` - 带 `.json` 后缀
- `@qiuye-ui/responsive-tabs` - 带 registry alias 前缀
- `https://ui.qiuyedx.com/registry/responsive-tabs.json` - 完整 URL

### 7.5 自检/调试（可选）

```bash
# 自检（会拉取 index + 随机取一个 item 验证结构）
npx -y --package @qiuye-ui/mcp@latest qiuye-ui-mcp --check

# 指定你自己的 registry base（例如本地调试站点）
npx -y --package @qiuye-ui/mcp@latest qiuye-ui-mcp --check --registry-base http://localhost:3000/registry
# 或使用短参数
npx -y --package @qiuye-ui/mcp@latest qiuye-ui-mcp --check --base http://localhost:3000/registry
```

### 7.6 示例提问（可直接复制）

- "列出 QiuYe UI 目前有哪些可用组件，并给出各自的 npx 安装命令"
- "responsive-tabs 的 dependencies 与 registryDependencies 分别是什么？为什么要这样分？"
- "读取 responsive-tabs 的源码，帮我总结 props 并写一个最小用法示例"
- "搜索 QiuYe UI 中与动画相关的组件"

## 新增一个自定义组件：维护清单（按本仓库约定）

当你新增 `components/qiuye-ui/new-thing.tsx` 时，建议按这个顺序走：

1. 在 `components/qiuye-ui/` 编写组件源码（必要时加 `"use client"`）
2. （可选）在 `components/qiuye-ui/demos/` 增加 demo
3. 新增 `public/registry/new-thing.json`（先写骨架，`content` 留空）
4. 运行 `pnpm run update-registry` 回填 `content`
5. 更新站点元数据：
   - `lib/component-constants.ts`：追加组件 id + 基础用法示例
   - `lib/registry.ts`：追加组件详情（分类、依赖、tags、文件路径）
   - `app/components/[id]/page.tsx`：把 demo 组件加入映射（否则详情页会提示“演示组件正在开发中...”）
6. 在一个“外部项目”里验证安装：
   - 配置 `components.json -> registries`
   - 执行 `npx shadcn@latest add @qiuye-ui/new-thing`
   - 确认目标文件生成、依赖安装、运行无报错

## 常见问题（FAQ）

### Q1：用户安装后 import 路径不对 / 报 `@/lib/utils` 找不到？

这是“用户项目的 alias 与你的组件 import 约定不一致”导致的。

你有两种策略：

- **在文档里明确要求**：用户用 shadcn init 的默认 alias（`@/components`、`@/lib/utils`）
- **在组件里避免强约定**：改成相对路径或提供可配置版本（通常不推荐，会降低组件可读性）

### Q2：为什么我不建议把这些组件发成 npm 包？

不是不能发，而是“发包”与 shadcn 的使用哲学相反：

- shadcn 的优势是源码可控、可改、可追溯
- npm 包的优势是版本管理与封装边界

如果你非常需要“版本化分发”，可以考虑“registry + 版本号路径”（例如 `/registry/v1/<name>.json`）或在 registry JSON 中引入版本字段并配合文档约束。

### Q3：静态导出有什么限制？

`output: "export"` 意味着你不能依赖运行时的 Node 服务能力（例如动态 API 路由、按请求渲染）。

但对“组件库站点 + registry 静态文件”而言，这是优点：部署简单、成本低、稳定性高。

## 总结

用 shadcn 的 registry 机制，你可以把“可复用的自定义组件”以一种非常接近 shadcn 官方体验的方式分发出去：

- 组件库侧：维护源码 + registry JSON + 自动回填脚本
- 用户侧：配置 registries → 一句 `npx shadcn@latest add ...` 安装
- 部署侧：静态站点即可（`out/` 扔到任何静态托管都行）

如果你也在做自己的 shadcn 生态，建议先把“registry 与脚本”跑通，再逐步补齐组件浏览器、Props 文档、Demo 与最佳实践。

<!-- EOF -->
