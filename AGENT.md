# AI Agent 开发指南

> 本文档面向在本仓库工作的 AI Agent / 自动化助手，记录当前 QiuYe UI 组件库的真实结构、开发入口和文档同步规则。

## 项目概览

- **项目名称**：QiuYe UI
- **仓库定位**：基于 shadcn/ui registry 机制的自定义 React 组件库站点
- **技术栈**：Next.js 15 App Router、React 19、TypeScript 5、Tailwind CSS 4、shadcn/ui 4（`radix-nova` 风格，`radix-ui` 单包）
- **分发方式**：静态站点 + `public/registry/*.json`，通过官方 shadcn CLI 安装组件
- **AI 辅助能力**：`packages/qiuye-ui-cli` 提供 `@qiuye-ui/mcp`，让 Cursor / Claude / Codex 等客户端读取 registry
- **包管理器**：pnpm

当前可用自定义组件以 `lib/component-constants.ts`、`lib/registry.ts` 和 `public/registry/registry.json` 为准。目前包括：

- `responsive-tabs`
- `segmented-control`
- `scrollable-dialog`
- `dot-glass`
- `image-viewer`
- `dual-state-toggle`
- `theme-transition-toggle`
- `code-block`
- `typewriter`
- `animated-number`
- `markdown-renderer`
- `color-picker`
- `smooth-corners`
- `tour`
- `matrix-effect`
- `expandable-card`
- `honeycomb-view`
- `adaptive-pointer`

## 核心目录

```text
qiuye-ui/
├── app/                         # Next.js App Router 页面
│   ├── components/              # 组件列表页
│   ├── components/[id]/         # 组件详情页、Demo、API、依赖信息
│   ├── cli/                     # shadcn CLI 使用指南
│   ├── layout.tsx               # 全局布局、主题、站点 Shell
│   └── page.tsx                 # 首页组件墙
├── components/
│   ├── home/                    # 首页 Hero、预览墙、CTA
│   ├── qiuye-ui/                # 可通过 registry 分发的自定义组件源码
│   │   ├── code-block/          # CodeBlock 多文件组件
│   │   ├── markdown-renderer/   # MarkdownRenderer 多文件组件
│   │   └── demos/               # 组件完整 Demo
│   ├── site/                    # 站点导航、搜索、Header、Shell
│   └── ui/                      # shadcn/ui 基础组件
├── hooks/                       # 可被 registry item 引用的通用 hooks
├── lib/
│   ├── component-constants.ts   # ComponentId 与基础用法示例
│   ├── registry.ts              # 官网组件元数据、分类、Props API
│   ├── home-component-preview-config.ts
│   └── markdown/                # MarkdownRenderer 解析工具
├── packages/qiuye-ui-cli/       # @qiuye-ui/mcp 子包
├── public/registry/             # shadcn CLI 使用的静态 registry
├── scripts/update-registry.mjs  # 回填 files[].content 并生成 registry.json
├── scripts/shadcn-audit.mjs     # 盘点项目 ui 组件与官方源码的差异（迁移风格前使用）
└── docs/                        # 设计文档、实施记录、经验沉淀
```

## 常用命令

```bash
pnpm install
pnpm dev
pnpm build
pnpm start
pnpm preview
pnpm lint
pnpm update-registry
pnpm update-registry:dry
```

说明：

- `pnpm dev` 启动 Next.js Turbopack 开发服务器。
- `pnpm build` 使用 `next.config.ts` 中的 `output: "export"` 生成静态站点。
- `pnpm start` 使用 `serve` 预览 `out` 目录。
- `pnpm update-registry` 会读取 `public/registry/*.json` 的 `files[].path`，回填源码内容，并生成 `public/registry/registry.json`。
- 如果为了验证启动了前端服务，回答结束前需要关闭本次启动的服务进程。

## 路由与页面

- `/`：首页，组件库品牌入口与组件预览墙。
- `/components`：组件目录，支持搜索、分类筛选、复制安装命令。
- `/components/[id]`：组件详情页，包含快速预览、基础用法、完整 Demo、Props API 和依赖信息。
- `/cli`：shadcn CLI 安装说明和可用组件列表。
- `/registry/registry.json`：组件 registry 索引。
- `/registry/<id>.json`：单个 shadcn registry item。

`app/components/[id]/page.tsx` 需要 `generateStaticParams()`，否则静态导出无法生成全部组件详情页。

## Registry 规则

shadcn CLI 真正读取的是 `public/registry` 下的 JSON 文件。站点展示用的 `lib/registry.ts` 和安装用的 registry JSON 是两条线，新增或修改组件时需要同时维护。

重要约束：

- `public/registry/registry.json` 由 `pnpm update-registry` 生成，不要手动编辑。
- `files[].content` 由脚本回填，新增 registry item 时可以留空或不写。
- `files[].target` 由脚本写成与 `path` 相同的值，不要手写或手改。shadcn CLI 4 遇到没有 `target` 的文件会按 `type` 拍平到 `components/`、`lib/` 根目录，导致 `code-block/`、`markdown-renderer/`、`matrix-effect/` 等多文件组件的 `index.ts`、`types.ts` 互相覆盖、`@/components/qiuye-ui/...` 与相对导入失效；写上 `target` 后 CLI 会保留子目录，并在 `src/` 目录项目中自动落到 `src/components/qiuye-ui/...`、`src/lib/...`。
- 同一个 registry item 内，不同目录下的文件不要使用相同的文件名（basename）。CLI 会按文件名改写 `@/` 导入，例如 `@/lib/animated-number` 曾被改写成 `@/components/qiuye-ui/animated-number`，造成组件自我导入。
- 依赖 npm 包时写入 `dependencies`，例如 `motion`、`lucide-react`。
- 依赖 shadcn/ui 基础组件时，`registryDependencies` 写裸名称，例如 `button`、`tabs`、`dialog`。
- 依赖本仓库自定义组件时，`registryDependencies` 必须写 `@qiuye-ui/<id>`，例如 `@qiuye-ui/dual-state-toggle`。
- 组件 import 的 `@/hooks/*`、`@/lib/*` 非 `utils` 本地文件，需要加入当前 registry item 的 `files[]`。
- `@/components/ui/*` 和 `@/lib/utils` 不需要加入 `files[]`。

## 新增组件清单

新增一个可安装组件时，至少同步以下位置：

1. `components/qiuye-ui/<id>.tsx`：组件源码，必要时添加 `"use client"`。
2. `components/qiuye-ui/demos/<id>-demo.tsx`：完整 Demo。
3. `app/components/[id]/simple-demos.tsx`：详情页快速预览。
4. `lib/component-constants.ts`：`ComponentId` 和基础用法示例。
5. `lib/registry.ts`：名称、描述、分类、依赖、文件路径、Props API、版本、标签和 `cliName`。
6. `app/components/[id]/page.tsx`：完整 Demo 与简单 Demo 映射。
7. `app/cli/page.tsx`：CLI 页可用组件列表。
8. `public/registry/<id>.json`：shadcn registry item。
9. `packages/qiuye-ui-cli/bin/qiuye-ui-mcp.mjs`：如需远端索引缺失时兜底列出该组件，更新 `DEFAULT_COMPONENT_NAMES`。
10. 运行 `pnpm update-registry`。

新增后建议验证：

- `/components` 能看到新组件。
- `/components/<id>` 能看到快速预览、Demo、API 和依赖。
- `/registry/<id>.json` 的 `files[].content` 与源码同步。
- `pnpm lint` 和 `pnpm build` 通过。

## 修改组件清单

修改现有组件时按变更类型同步：

- 仅改源码、样式或注释：运行 `pnpm update-registry`。
- 新增或移除本地引用文件：更新 `public/registry/<id>.json` 的 `files[]`，再运行 `pnpm update-registry`。
- 新增或移除 npm 依赖：同步 `public/registry/<id>.json` 与 `lib/registry.ts` 的 `dependencies`。
- 新增或移除 shadcn/ui / QiuYe UI 组件依赖：同步 `registryDependencies`。
- Props 变化：同步 `lib/registry.ts` 的 `props` 或 `propsInfo`。
- 基础用法变化：同步 `lib/component-constants.ts`。
- Demo 行为变化：同步 demo 文件、`simple-demos.tsx` 或详情页映射。

## MCP Server

`packages/qiuye-ui-cli` 发布为 `@qiuye-ui/mcp`，入口命令是 `qiuye-ui-mcp`。

常用命令：

```bash
npx -y --package @qiuye-ui/mcp@latest qiuye-ui-mcp
npx -y --package @qiuye-ui/mcp@latest qiuye-ui-mcp mcp
npx -y --package @qiuye-ui/mcp@latest qiuye-ui-mcp --check
npx -y --package @qiuye-ui/mcp@latest qiuye-ui-mcp --registry-base http://localhost:3000/registry
```

环境变量：

```bash
QIUIYE_UI_REGISTRY_BASE=http://localhost:3000/registry
```

MCP tools：

- `qiuye_ui_list_registry_items`
- `qiuye_ui_search_registry_items`
- `qiuye_ui_get_registry_item`
- `qiuye_ui_get_registry_file_content`
- `qiuye_ui_get_shadcn_add_command`

MCP resources：

- `qiuye-ui://registry/index`
- `qiuye-ui://registry/{name}`

## 文档同步规则

实现变化后，优先检查这些文档是否需要更新：

- `README.md`：项目入口、组件清单、开发流程、部署说明。
- `packages/qiuye-ui-cli/README.md`：MCP 安装、参数、tools/resources。
- `blog-how-to-build-shadcn-component-library.md`：registry 机制和实战示例。
- `docs/设计并开发*/`、`docs/优化*/`：对应功能的设计文档、执行计划、实施记录。
- `.agents/skills/qiuye-ui-component-authoring/SKILL.md`：组件开发流程约定。

文档中的示例组件名应优先使用当前真实存在的组件，例如 `responsive-tabs`、`code-block`、`markdown-renderer`，不要引用已不存在的历史组件。

## 代码风格

- 组件和 Demo 使用 TypeScript。
- 自定义组件文件名使用 kebab-case，导出名使用 PascalCase。
- 支持 `className`，并用 `cn()` 合并样式。
- 需要 DOM ref 的组件使用 `React.forwardRef`。
- 用到 hooks、事件、状态、动画、DOM API 的组件必须添加 `"use client"`。
- 组件注释和 JSDoc 使用简体中文。
- 保持浅色 / 深色主题兼容。
- UI 改动需要注意移动端、桌面端和静态导出。

### 安装到用户项目后的兼容性

`components/qiuye-ui/**`（demos 除外）会原样安装到用户项目，常见目标是 `shadcn init -t vite` 生成的 Vite + TS 严格模式项目，不一定是 Next.js：

- 不使用 Next.js 专属写法：不写 styled-jsx 的 `<style jsx>`（需要内联全局样式时用 React 19 的 `<style href="..." precedence="default">`，会提升到 `<head>` 并按 `href` 去重），不写 `eslint-disable ... @next/next/*` 注释（本仓库已在 `eslint.config.mjs` 中为 registry 源码关闭 `@next/next/no-img-element`），不依赖 `next/image`、`next/link`。
- 能通过 `noUnusedLocals` / `noUnusedParameters` / `verbatimModuleSyntax`：不留未使用的 `import React from "react"`，纯类型导入用 `import type`。
- 读取 `process.env.NODE_ENV` 时，在模块内写 `declare const process: { env: { NODE_ENV?: string } };` 并用 `try/catch` 包裹读取（参考 `matrix-effect/matrix-effect.tsx` 的 `isDevelopment()`），这样 Vite 项目无需 `@types/node`，打包器仍能静态替换。
- 覆盖 shadcn/ui 基础组件的样式时，要同时兼容 `new-york` 与 `radix-nova` 等风格：后者用 `group-data-horizontal/tabs:h-8`、`data-active:*` 等变体设置样式，只写 `h-auto`、`data-[state=active]:*` 无法覆盖，需要补上同一变体的类名（参考 `responsive-tabs.tsx`、`clip-path-tabs.tsx`）。
- 界面文案通过 `labels?: Partial<XxxLabels>` 属性开放覆盖，并导出 `DEFAULT_XXX_LABELS` 作为默认值（参考 `tour.tsx`、`color-picker.tsx`），不要在组件里硬编码无法替换的文案。

## 参考入口

- [README.md](./README.md)
- [packages/qiuye-ui-cli/README.md](./packages/qiuye-ui-cli/README.md)
- [blog-how-to-build-shadcn-component-library.md](./blog-how-to-build-shadcn-component-library.md)
- [docs/前端通用经验/backdrop-filter-背景模糊避坑指南.md](./docs/前端通用经验/backdrop-filter-背景模糊避坑指南.md)
