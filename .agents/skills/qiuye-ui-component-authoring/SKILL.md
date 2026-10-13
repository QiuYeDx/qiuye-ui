---
name: qiuye-ui-component-authoring
description: QiuYe UI 组件库的自定义组件新增、修改、Registry 集成完整流程。当需要新增或修改 QiuYe UI 组件、更新 public/registry JSON、编写组件 Demo、完善组件 JSDoc 注释、或执行 pnpm update-registry 同步时使用。
---

# QiuYe UI 组件开发流程

技术栈：Next.js App Router、React 19、TypeScript、Tailwind CSS、shadcn/ui、pnpm。
所有注释/JSDoc 使用**中文（简体）**。

## 项目关键路径

| 用途 | 路径 |
|------|------|
| shadcn/ui 基础组件 | `components/ui/*` |
| 自定义组件源码 | `components/qiuye-ui/<id>.tsx` |
| 组件 Demo | `components/qiuye-ui/demos/<id>-demo.tsx` |
| 组件 ID 枚举 + 基础用法 | `lib/component-constants.ts` |
| 组件元信息注册表 | `lib/registry.ts` |
| 组件列表页 | `app/components/page.tsx` |
| 组件详情页 | `app/components/[id]/page.tsx` |
| 详情页快速预览 | `app/components/[id]/simple-demos.tsx` |
| CLI 文档页 | `app/cli/page.tsx` |
| Registry item JSON | `public/registry/<id>.json` |
| Registry 清单（脚本生成，勿手改） | `public/registry/registry.json` |
| 更新脚本 | `scripts/update-registry.mjs`（`pnpm update-registry`） |

## 新增组件完整流程（9 步，不得遗漏）

### Step 0：命名与范围确认

- 组件 ID：**kebab-case**（如 `fancy-card`）
- 导出名：**PascalCase**（如 `FancyCard`）
- 用到 hooks/事件/动画 → 文件顶部加 `"use client";`
- 列清 `dependencies`（npm 包）和 `registryDependencies`（registry 组件依赖）

### Step 1：实现组件源码

新增 `components/qiuye-ui/<id>.tsx`：

- 使用 `cn`（from `@/lib/utils`）合并 className
- 需要 ref 时用 `React.forwardRef`
- 导出与现有组件风格一致
- **必须按 [JSDoc 规范](jsdoc-standards.md) 编写完整注释**

### Step 2：实现 Demo

新增 `components/qiuye-ui/demos/<id>-demo.tsx`：覆盖核心能力/典型场景。

### Step 3：补齐站点注册信息

**3.1** 编辑 `lib/component-constants.ts`：

- `ComponentId` enum 新增 `NEW_COMPONENT = "<id>"`
- `basicUsageExamples` 新增对应项（import 路径 `@/components/qiuye-ui/<id>`）

**3.2** 编辑 `lib/registry.ts`：

- `componentRegistry` 新增条目，key 用 `ComponentId.XXX`
- 必填：`name` / `description` / `category` / `tags` / `dependencies` / `files` / `props`（或 `propsInfo`）/ `cliName` / `basicUsage`

### Step 4：接入详情页

编辑 `app/components/[id]/page.tsx`：

- import Demo，加入 `demoComponents` 映射

编辑 `app/components/[id]/simple-demos.tsx`：

- 新增 `XxxSimpleDemo` 组件（尽量简单、无复杂交互）
- 在 `page.tsx` 的 `simpleDemoComponents` 中新增映射

### Step 5：补齐 CLI 文档页

编辑 `app/cli/page.tsx`："可用组件列表"数组中加入新 ID。

### Step 6：新增 registry item JSON

新增 `public/registry/<id>.json`，必要字段：

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "<id>",
  "title": "<PascalCaseName>",
  "type": "registry:component",
  "author": "QiuYeDx <me@qiuyedx.com>",
  "dependencies": [],
  "registryDependencies": [],
  "files": [
    { "type": "registry:component", "path": "components/qiuye-ui/<id>.tsx" }
  ]
}
```

注意：

- **不要**手写 `files[].content` 和 `files[].target`（由脚本生成；`target` 与 `path` 相同，shadcn CLI 4 缺少它会把多文件组件拍平到 `components/` 根目录）
- 多文件组件：所有文件都加入 `files[]`
- 同一个 item 内不同目录的文件不要同名（如 `components/qiuye-ui/foo.tsx` 与 `lib/foo.ts`），CLI 会把 `@/lib/foo` 改写成组件自身路径
- `public/registry/registry.json` **勿手改**

### Step 6.1：依赖另一个 QiuYe UI 组件时的写法（重点）

当组件源码中出现类似：

- `import { X } from "@/components/qiuye-ui/<dep-id>"`

则 `public/registry/<id>.json` 的 `registryDependencies` 必须写成：

- `"@qiuye-ui/<dep-id>"`

**不要**写成裸名称（如 `"dual-state-toggle"`），否则 shadcn CLI 会把它当成官方组件去 `ui.shadcn.com` 查找，常见报错：

- `The item at https://ui.shadcn.com/.../dual-state-toggle.json was not found`

对照规则：

- 依赖 `@/components/ui/*`（shadcn 官方基础组件）→ `registryDependencies` 写裸名称（如 `"button"`、`"tabs"`）
- 依赖 `@/components/qiuye-ui/*`（本仓库自定义组件）→ `registryDependencies` 写带 alias 的名称（如 `"@qiuye-ui/dual-state-toggle"`）

示例：

```json
{
  "dependencies": ["motion", "lucide-react"],
  "registryDependencies": ["@qiuye-ui/dual-state-toggle"]
}
```

此外请确保被依赖组件本身存在对应的 registry item（如 `public/registry/dual-state-toggle.json`），并在修改后执行 `pnpm update-registry` 同步清单。

### Step 7：更新 registry

```bash
pnpm update-registry
```

### Step 8：本地验证

- `/components` 列表页可见新组件
- `/components/<id>` 详情页：demo + 快速预览 + API 表格
- `http://localhost:3000/registry/<id>.json`：content 与源码一致

## 修改现有组件流程

修改后对照以下表格判断需要同步的范围，详见 [modify-component-detail.md](modify-component-detail.md)。

**任何修改后都必须执行 `pnpm update-registry`。**

| 变更类型 | 需要同步 |
|----------|----------|
| 仅改源码（逻辑/样式/JSDoc） | `pnpm update-registry` |
| 新增/移除本地引用文件 | 更新 `registry/<id>.json` 的 `files[]` → `pnpm update-registry` |
| 新增/移除 npm 依赖 | 更新 `registry/<id>.json` + `lib/registry.ts` 的 `dependencies` |
| Props 变更 | 更新 `lib/registry.ts` 的 `props` / `propsInfo` |
| 基础用法变更 | 更新 `lib/component-constants.ts` |
| Demo 需跟随变更 | 更新 demo 文件 和/或 `simple-demos.tsx` |

## 关键约束

- 不要改变已有组件导出名/文件名（会破坏 registry/安装路径）
- `public/registry/registry.json` 只由 `pnpm update-registry` 生成
- 新增依赖必须同步更新 `public/registry/<id>.json` 的 `dependencies` / `registryDependencies`
- 当依赖 `@/components/qiuye-ui/*` 时，`registryDependencies` 必须使用 `@qiuye-ui/<id>`（不要写裸名称）
- 组件 import 的本地文件（`@/hooks/*`、`@/lib/*` 非 utils）必须加入 `files[]`
- `@/components/ui/*` 和 `@/lib/utils` 的导入**不需要**加入 `files[]`
- 组件源码必须能在 `shadcn init -t vite` 的严格 TS 项目中直接编译：不用 styled-jsx、`@next/next` 的 eslint 注释，不留未使用的 `import React`，`process.env` 按 AGENT.md「安装到用户项目后的兼容性」的写法处理
- 界面文案通过 `labels` 属性开放覆盖，并导出 `DEFAULT_XXX_LABELS`

## 可选：MCP Server 兜底列表

发布/更新 MCP Server 时，如需远端缺少 `registry.json` 也能列出新组件：
更新 `packages/qiuye-ui-cli/bin/qiuye-ui-mcp.mjs` 的 `DEFAULT_COMPONENT_NAMES`。

## 参考文档

- [JSDoc / 注释规范](jsdoc-standards.md) — 编写/修改组件注释时阅读
- [修改组件详细清单](modify-component-detail.md) — 修改现有组件时阅读
