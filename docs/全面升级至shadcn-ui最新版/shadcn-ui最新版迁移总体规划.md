# shadcn/ui 最新版迁移总体规划

> 日期：2026-10-13
> 范围：QiuYe UI（本仓库）以及所有使用 shadcn/ui 的个人项目
> 目标：从旧版 `new-york` 风格整体切换到 shadcn/ui 4 的 `radix-nova` 风格，同时让 QiuYe UI 组件在新旧两种宿主中都能正常工作，迁移期间不影响任何线上项目。

## 1. 现状盘点

数据来自 2026-10-13 对本机仓库的扫描。「自有改动」的统计方法：逐个组件与官方最新的 `new-york-v4` 源码比对，括号内是与官方不一致的行数。注意，这个数字里也包含「官方后来又更新过」带来的差异。

| 项目 | 框架 | ui 组件数 | QiuYe UI 组件 | 明显的自有定制 | 备注 |
| --- | --- | --- | --- | --- | --- |
| **qiuye-react-template** | Vite 8 | 全新 | 全部 17 个 | — | ✅ 已是 radix-nova，作为基准 |
| **qiuye-shadcn_ui**（QiuYe UI） | Next 15 | 33 | — | button(17)、sidebar(26)、card(24) | 同时承担「组件库」和「官网」两个角色 |
| qiuye-electron-template | Electron 33 | 9 | 2 | switch（手写 `<button>`）、button(7) | PotSubOverlay 继承自它，switch/button/badge 完全相同 |
| qiuye-nextjs-template | Next 15 | 20 | 2 | button(10)、card(24) | travel-guidebook-cx 继承自它，card 完全相同 |
| PotSubOverlay | Electron 41 | 14 | 6 | 同 electron 模板 | ⚠️ 工作区有 37 处未提交改动 |
| FusionKit | Electron 41 | 25 | 13 | dialog(25)、switch(24)、calendar(20)、accordion(18) | 定制最多，界面最密集，收益也最大 |
| qiuyedx-blog | Next 15 | 41 + 6 个 Magic UI | 12 | alert(27)、sidebar(26)、card(24) | 组件最多，开发最活跃 |
| travel-guidebook-cx | Next 15 | 20 | 6 | button(19)、select(17) | |
| animation-web-qiu | Next 15 | 6 | 7 | button(17) | ⚠️ 还不是 git 仓库 |
| pixel-land-fe / pixil-canvas | Vite 5 + React 18 | 21 / 13 | 0 | — | 最后提交在 2025 年，已不活跃 |

另有 qiuvision 不在本机，未纳入扫描，到时按第 6 节的流程处理即可。

几点共性：

- 所有项目都是 `new-york` + `neutral` + Tailwind 4，**颜色 token 与 radix-nova 完全一致**，主题层面不需要改。
- 依赖写法不统一：有的用 `radix-ui` 单包，有的用 `@radix-ui/*`，有的两者混用（FusionKit 里有 14 个 `@radix-ui/*` 加 `radix-ui`）。
- 模板派生出来的项目继承了模板的定制，所以**先迁模板，得到的补丁可以直接复用**到派生项目上。

## 2. 新旧差异速查（new-york-v4 → radix-nova）

### 尺寸：整体缩小一档

| 组件 | new-york | radix-nova |
| --- | --- | --- |
| Button default | `h-9 px-4` | `h-8 px-2.5 gap-1.5` |
| Button sm / lg | `h-8` / `h-10 px-6` | `h-7 text-[0.8rem]` / `h-9 px-2.5` |
| Button icon / icon-sm / icon-lg | `size-9` / `size-8` / `size-10` | `size-8` / `size-7` / `size-9` |
| Input / Select trigger | `h-9 px-3 rounded-md shadow-xs` | `h-8 px-2.5 rounded-lg`，去掉阴影 |
| TabsList | `h-9` | `h-8` |
| Card | `gap-6 py-6`，`border` 加 `shadow-sm` | `--card-spacing: 4`（即 16px），`ring-1 ring-foreground/10`，新增 `size="sm"` |
| Dialog | `p-6 rounded-lg border` | `p-4 rounded-xl ring-1`，关闭按钮换成 ghost 图标按钮 |
| Badge | `rounded-full`，高度不固定 | 固定 `h-5`，`rounded-4xl`，destructive 改为浅底配红字 |

### 写法上的变化

- **边框改为 ring**：大量组件把 `border` 加 `shadow` 换成了 `ring-1 ring-foreground/10`，在深色模式下更干净。
- **新的数据属性变体**：`data-open:`、`data-checked:`、`data-active:`、`data-horizontal:` 等，由 `@import "shadcn/tailwind.css"` 提供。它们同时匹配旧的 `[data-state=open]`，所以项目里已有的 `data-[state=open]:` 写法依然有效。
- **图标与内边距联动**：按钮依靠 `has-data-[icon=inline-start]` 自动收窄内边距，需要给图标加上 `data-icon="inline-start"` 或 `data-icon="inline-end"`。不加也能用，只是两侧内边距不会自动收窄。
- **圆角从减法改为乘法**：`--radius-sm/md/xl` 由 `calc(var(--radius) - 4px)` 改为 `calc(var(--radius) * 0.6)` 等，并新增 `--radius-2xl`、`3xl`、`4xl`。`--radius` 不变时，sm、md、xl 的结果会有细微差别。
- **结构类名**：例如 `group/card`、`@container/card-header`、`cn-font-heading`、`cn-menu-target`，用来做主题钩子，可以保留不管。
- **Card 子组件依赖 `--card-spacing`**：`CardHeader`、`CardContent`、`CardFooter` 的内边距来自 `<Card>` 上定义的 `--card-spacing`。如果脱离 `<Card>` 使用（例如包在自定义容器里），内边距会变成 0，需要在容器上补 `[--card-spacing:--spacing(4)]`，以及 `flex flex-col gap-(--card-spacing) py-(--card-spacing)`。
- **Tooltip 不再自带 Provider**：需要在应用根部包一层 `TooltipProvider`。
- **旧版 Card 的内边距覆盖会叠加**：更早的 shadcn Card（v3 时代）间距写在子组件上：CardHeader `p-6`、CardContent `p-6 pt-0`、CardTitle `text-2xl`，调用处常见 `p-4 md:p-6`、`pt-0`、`pb-2`、`pt-6` 之类的覆盖。nova 的间距在 Card 上（`py-4 gap-4`），这些覆盖会叠加，导致卡片变高，应当直接删除。CardTitle 默认变为 `text-base`。
- **图片贴顶的卡片要加 `py-0 gap-0`**：nova 只在第一个子元素是 `<img>` 时自动去掉顶部内边距；图片外面包了 div、或卡片里只有图片时，需要手动加 `py-0`（必要时加 `gap-0`）。
- **覆盖样式必须用同一个变体**：例如 nova 的 `group-data-horizontal/tabs:h-8`，只能用 `group-data-horizontal/tabs:h-auto` 覆盖，普通的 `h-auto` 不生效。已记录在 PIT-0007。

### CLI 能做什么，不能做什么

- **没有「切换 style」的迁移命令**。`shadcn migrate` 只提供 `radix`（迁移到单包）、`cn`、`icons`、`base-color` 和 `rtl`。
- 切换风格的唯一办法：修改 `components.json` 里的 `style`，然后执行 `shadcn add <组件列表> -o` 重新安装，再把自有定制补回去。

## 3. 关键判断

1. **registry 没有版本号，项目只有主动重新执行 `add` 才会拉到新代码。** QiuYe UI 改完合入 main 之后，已有项目的代码一行都不会变。风险只出现在两种情况：在迁移完成之前，往某个 new-york 项目里新装或重装组件。
   → 对策：改造开始前，把当前 `public/registry/` 冻结一份到 `public/registry/v1/`。还没迁移的项目如果要装组件，就把 registry 地址指向 `/registry/v1/{name}.json`。
2. **QiuYe UI 组件要做到不依赖宿主风格。** 迁移会持续一段时间，组件必须在 new-york 和 nova 两种宿主里都能正常工作。目前直接依赖宿主 ui 的组件只有这几个：
   - clip-path-tabs、responsive-tabs → tabs
   - dual-state-toggle、tour、MermaidBlock、ArtifactWidget → button
   - scrollable-dialog → dialog、scroll-area
   - color-picker → popover、input
   - code-block → scroll-area
   - markdown presets → table

   其中只有两个 tabs 组件覆盖了宿主的样式，这部分已在上一轮修复中处理过。
3. **QiuYe UI 自身的尺寸也要跟着收紧。** 例如 SegmentedControl、Tour 的按钮高度，应与 nova 的 `h-8` 体系保持一致，否则放进新项目会显得笨重。代价是放回旧项目时会比旧版 Button 小一档，这是可以接受的，因为旧项目本来就要迁移，而且有 v1 快照兜底。
4. **不追求一次性全部迁完。** 不活跃的项目（pixel-land-fe、pixil-canvas）不迁，等哪天重新开发时再处理。

## 4. 选型

- **风格**：`radix-nova`，与 qiuye-react-template 保持一致。
  - Nova 的定位是「收紧内边距与间距的紧凑布局」，正好解决「旧版太大、空间利用率低」的问题。
  - Mira 更紧凑，但不建议单独给某个项目换用：所有项目统一用一种风格，QiuYe UI 只需要对齐这一套尺寸。
- **底层**：继续用 Radix（`radix-ui` 单包），不切换到 Base UI，因为 QiuYe UI 依赖 Radix。
- **图标**：继续用 lucide。
- **工具函数**：`cn` 包可选（`shadcn migrate cn`），不强制。

## 5. 路线图

### 阶段 0：准备（约 0.5 天）

- [x] 在 QiuYe UI 中冻结 `public/registry/v1/`，并在官网的 CLI 指南页和 README 中写明 v1 地址；`update-registry` 会跳过 `v<数字>` 目录，并把源码统一为 LF（彻底解决 PIT-0005）。
- [x] 把第 1 节用到的组件比对脚本整理成 `scripts/shadcn-audit.mjs`：传入项目路径，输出每个 ui 组件属于「一致 / 有差异 / 非官方」中的哪一类，并给出提交次数（大于 1 说明安装后改动过），`--out` 输出差异文件。
- [ ] （可选）在 qiuye-skills 中新增一个「shadcn-nova 迁移」skill，把第 6 节的流程固化下来，之后每个项目交给 Agent 按同一套步骤执行。

### 阶段 1：QiuYe UI（在 `feat/shadcn-nova` 分支上进行）

分两条线推进，可以分开提交：

**1a. 组件库本身**（影响所有消费方，优先做）

- [x] 逐个审查 17 个组件：尺寸预设统一为 sm / md / lg = 28 / 32 / 36px（SegmentedControl、ClipPathTabs、ColorPicker），与 Button 的 sm / default / lg 对齐；expandable-card、smooth-corners 改用 `radix-ui` 单包。
- [ ] （后续单独处理，不阻塞迁移）补齐剩余组件的 `labels` 国际化，以及 react-hooks v7 的 lint 问题（目前还剩 29 处）。
- [x] 双宿主验证，作为合入 main 的门槛（2026-10-13 通过，本地 registry 安装全部 17 个组件）：
  - nova 宿主：qiuye-react-template 的副本，typecheck 和 lint 通过（vitest 在临时目录中因 Windows 路径过长无法启动，与代码无关）；视觉验收以官网为准，官网现在本身就是 nova 宿主。
  - new-york 宿主：qiuye-electron-template 的副本，typecheck 通过。
  - 注意：`add @qiuye-ui/* -o` 会把 registryDependencies（button、dialog 等）一起覆盖成官方版本，已有定制的项目不要带 `-o`，先用 `--diff` 预览。

**1b. 官网**（只影响官网自身）

- [x] `components.json` 的 style 改为 `radix-nova`，引入 `shadcn/tailwind.css`，圆角改为乘法；移除全部 20 个 `@radix-ui/*` 依赖，统一使用 `radix-ui`；`lib/utils` 改为转出 `cn` 包；`react-resizable-panels` 升级到 v4（nova 的 resizable 需要）。
- [x] 用 `shadcn add -o` 重装 33 个 ui 组件。审查脚本显示，安装后真正改动过的只有 button（平滑圆角与按压缩放），已补回，并让平滑圆角半径跟随 nova 的 `data-size`。
- [x] 官网页面适配：根布局补上 `TooltipProvider`；组件列表页卡片脱离 `<Card>` 使用 CardHeader，补上 `--card-spacing`。首页、组件列表、组件详情、CLI 指南页均已在深色、浅色和移动端截图检查，`next build` 通过。
- [ ] （可选）新增一个文档页「从 new-york 迁移」。目前 README 和 CLI 指南页已写明 v1 快照的用法。

完成后合入 main，线上 registry 随之更新。由于有 v1 快照，未迁移的项目不受影响。

### 阶段 2：主力项目

1. **qiuyedx-blog**（即 qiuvision）：✅ 2026-10-13 完成，分支 `chore/shadcn-nova`，待合入。
   - 真正的自有定制只有 ScrollArea（viewportRef / viewportClassName）和 Pagination 中文文案，sidebar 的差异只是格式化。
   - QiuYe UI 本地定制：Typewriter `initialDelay`、use-prevent-scroll 的 `qvScrollLocked` 计数、MermaidBlock 按布局高度测量。前两项与 MermaidBlock 修复值得回推到组件库。
   - 调用处适配集中在参考图库（旧 Card 内边距覆盖、图片卡片贴边）。
2. **FusionKit**：定制最重（dialog、switch、calendar、accordion），界面密度最高。可以借助现有的测试做回归验证。

### 阶段 3：模板与其余项目

| 顺序 | 项目 | 说明 |
| --- | --- | --- |
| 1 | qiuye-electron-template | 只有 9 个组件，是 Electron 系的母版；得到的 switch、button 补丁可以直接用到 PotSubOverlay |
| 2 | PotSubOverlay | 前提是先把 37 处未提交改动提交；复用 Electron 模板的补丁 |
| 3 | qiuye-nextjs-template | 只有 20 个组件，是 Next 系的母版；card 补丁可以直接用到 travel-guidebook-cx |
| 4 | travel-guidebook-cx | 复用 Next 模板的补丁 |
| 5 | animation-web-qiu | 先执行 `git init` 并提交现状，再迁移 |

### 阶段 4：搁置

pixel-land-fe、pixil-canvas：保持现状。重新开发时，先升级到 React 19 和 Vite 8，再按第 6 节的流程迁移。

## 6. 单项目迁移标准流程

```text
0. 准备工作区：工作区干净，新建 chore/shadcn-nova 分支
1. 盘点：node shadcn-audit.mjs <项目>  → 得到 ui 清单 + 自有定制清单
   - 自有定制逐个判断：能挪到调用处 className 或包装组件里的，就挪出 ui/；必须改源码的，记下 patch
2. 基础设施
   - components.json: "style": "radix-nova"（baseColor、aliases 不变）
   - pnpm dlx shadcn@latest migrate radix      # 统一使用 radix-ui 单包
   - 安装依赖：shadcn（提供 tailwind.css）、tw-animate-css
   - 全局 css：@import "shadcn/tailwind.css"；--radius-* 改为乘法并补上 2xl~4xl；颜色 token 不动
3. 重装：pnpm dlx shadcn@latest add <ui 清单> -o
4. 回填定制：按第 1 步的 patch 逐个补回（先 git diff 确认每一处）
5. QiuYe UI：pnpm dlx shadcn@latest add @qiuye-ui/<已装组件> --diff 预览，确认后再 -o
6. 调用处适配（重点 grep）
   - Button/Input 上硬编码的 h-9 / h-10 / px-4 / size="lg"
   - 依赖旧间距的布局：Card 的 gap-6/py-6、Dialog 的 p-6、表单行高
   - 以 border 为前提的样式覆盖（新版是 ring）
   - 覆盖 nova 变体类名时，必须使用同一变体
   - 脱离 <Card> 使用的 CardHeader / CardContent（grep 出来逐个检查），需要补 --card-spacing
   - 根部是否已有 TooltipProvider
   - CardHeader / CardContent 上的 p-* / pt-* / pb-* 覆盖（旧 Card 遗留），以及图片贴顶、只装图片的 Card
   - 重装 sidebar 会顺带覆盖 hooks/use-mobile.ts，重装后检查并还原
7. 验证：typecheck + lint + test + build；关键页面在深色和浅色模式下各截图一次，与迁移前对比
8. 合入 main，删除不再使用的 @radix-ui/* 依赖
```

## 7. 风险与对策

| 风险 | 对策 |
| --- | --- |
| `add -o` 覆盖掉自有定制 | 第 1 步先盘点；只在干净的工作区上执行，`git diff` 逐个确认 |
| 迁移期间往 new-york 项目新装 QiuYe UI，拿到 nova 尺寸 | 提供 v1 快照地址；组件做到不依赖宿主风格 |
| 整体缩小一档后，个别页面显得拥挤或对不齐 | 调用处单独调整，或在局部使用 `size="lg"`；不要回改 ui 源码 |
| 自有 Switch（手写 button）与 nova 的 Switch API 不同 | 迁移时改用官方 Switch（受控 API 兼容），调用处同步修改 |
| Windows 上 registry 生成成 CRLF（PIT-0005） | 继续沿用 LF 归一化，`.gitattributes` 统一换行 |
| shadcn CLI 拍平目录、改写导入路径 | 已在 registry 中通过 `target` 修复；安装后仍需检查目录结构 |

## 8. 决定记录（2026-10-13）

1. 所有项目统一使用 `radix-nova`。
2. 发布 v1 快照：`https://ui.qiuyedx.com/registry/v1/{name}.json`，冻结的是提交 `d457289` 时的 registry。
3. 项目顺序：QiuYe UI 完成后，先迁 qiuyedx-blog（即 qiuvision）和 FusionKit，再迁两个模板与其余项目。
