# SpotlightTile · 跟随指针取光的聚光卡片

## 来源与目标

源自 FusionKit 工具页的经典工具卡片（`ToolTile`，以及 `page-kit` 中更小的 `SpotlightTile`）。原实现绑定了 i18n、路由、工具元数据与 AgentOrb，这里抽成通用组件，保留它的观感：

- 1px 边框沿指针位置亮起一圈色调光，内部铺一层柔光；
- 角落里大而淡的水印图标，悬停时漂移并转正；
- 带色调渐变的平滑圆角图标底板，悬停时轻微倾斜；右上角箭头朝右上轻推；
- 可点击的卡片悬停时上浮 2px 并投下带色调的阴影；
- 进入视口时按序号错开上浮淡入；平滑圆角、色调聚焦描边、减少动态效果。

名称为 SpotlightTile，registry id 为 `spotlight-tile`，分类「内容与媒体」，依赖 `@qiuye-ui/smooth-corners`。

## API

```tsx
<SpotlightTile
  tone="oklch(0.62 0.19 255)"   // 任意 CSS 颜色，默认 var(--primary)
  icon={<LanguagesIcon />}
  watermark                      // true 复用 icon；也可传节点或 false
  badge="Beta"
  title="字幕翻译"
  titleAs="h3"
  description="批量翻译 SRT / ASS 字幕……"
  chips={["SRT", "ASS"]}
  href="/tools/translate"        // 标题成为铺满整张卡片的链接
  linkProps={{ target: "_blank" }}
  actions={<Button>快速开始</Button>} // 浮在链接之上，可单独点击
  arrow                          // 默认：有 href 或 asChild 时显示
  index={2}                      // 错开入场（每张 50ms）
  appear                         // 进入视口时上浮淡入
  radius={20}
  smoothing={0.72}
>
  {/* 可选：描述与底部之间的自定义内容 */}
</SpotlightTile>
```

- 路由链接：`title={<SpotlightTileLink asChild><Link href="/x">标题</Link></SpotlightTileLink>}`，配合 `arrow`。
- 整卡链接：`<SpotlightTile asChild ...><a href="/docs" /></SpotlightTile>`。子元素自身的子节点出现在描述下方（`Slot.Slottable`）。此时整张卡片是一个 `<a>`，`actions` 中不要放交互元素。
- 各部分带 `data-slot`（`spotlight-tile`、`-head`、`-badge`、`-title`、`-description`、`-foot`、`-actions`、`-link`），可用于定制样式。

## 实现要点

### 样式分层

布局与排版（内边距、圆角回退、字号、标签样式）写成 Tailwind 类，用户的 `className` 经 `cn()` 合并后可以覆盖。伪元素、遮罩、悬停联动和减少动态效果写在 React 19 的 `<style href precedence>` 中：这部分是无层级（unlayered）CSS，会压过 Tailwind 的 `@layer utilities`，所以只放用户不需要用类名覆盖的规则。

### 光层

指针坐标只写在一个空的 `span.qy-spotlight-tile-light` 上（`inset: -1px`，与卡片的 border box 重合），它的 `::before` 是边框光环、`::after` 是内部柔光：

- 光环：`padding: 1px` 加 `mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)`，只留下 1px 的环；
- 两层都 `border-radius: inherit; corner-shape: inherit`，跟随 SmoothCorners 的超椭圆；
- 光层在根元素的层叠上下文（`isolation: isolate`）里取 `z-index: -1`：画在卡片背景与边框之上、正文之下。

坐标写在没有子节点的光层上，而不是卡片根元素：自定义属性会被整棵子树继承，写在根上每次指针移动都会让所有后代重算样式（参见 PIT-0010）。写入用 rAF 合并，触屏的 `pointermove` 忽略。

### 悬停位移与入场动画不冲突

入场由 Motion 驱动 `opacity` 与 `transform`；悬停上浮用 CSS 独立属性 `translate`，图标和水印用 `rotate` / `scale` / `translate`。独立变换属性与 `transform` 叠加而不互相覆盖，所以 Motion 写入的内联 `transform` 不会吃掉悬停效果，也就不需要额外的包裹元素。

### 整卡点击

`SpotlightTileLink` 的 `::after` 以卡片为包含块铺满（`inset: -1px; z-index: 2`），标题仍是链接文本，读屏器读到的链接名称就是标题。`actions` 容器 `relative z-[3]` 浮在其上。聚焦描边通过 `:has([data-slot="spotlight-tile-link"]:focus-visible)` 画在整张卡片上；`asChild` 时根元素本身 `:focus-visible`。上浮只给可点击的卡片（`data-interactive` 或含链接），静态信息卡只有光效。

### 减少动态效果

`useReducedMotion()` 在服务端与首次水合时为 `null`，而 Motion 只在挂载时读取 `initial`。若按减少动态效果把 `initial` 设为 `false`，水合后的值已来不及生效，卡片会停在 `opacity: 0`。因此 `initial` 保持不变，只把过渡切成不位移的 0.2s 淡入（见 PIT-0017）。CSS 中关闭上浮、图标倾斜和水印转动，保留光效与颜色的淡入淡出。

悬停规则放在 `@media (hover: hover)` 中，触屏不会留下粘滞的悬停态。

## 站点接入

- 首页组件墙新增 `feature` 尺寸（`sm:col-span-2 lg:row-span-2`），展示一个链接到其他组件的便当格：容器查询下宽时为三列两行（一张宽卡、一张高卡、两张小卡），窄时两列并隐藏高卡。
- 详情页快速预览复用同一个便当格；完整 Demo 包括工具目录（链接 + 可单独点击的按钮 + 重播入场）、任意色调切换、整卡链接 / 路由链接 / 静态信息卡三种形态。

## 验证记录（2026-10-21）

- 在无头 Chromium（CDP，`prefers-reduced-motion: no-preference`）中截图：首页组件墙 1440 宽浅色、深色悬停，375 宽深色；详情页工具目录浅色 / 深色悬停与三种形态。
- 命中测试：「快速开始」按钮中心命中按钮，描述与卡片角落命中标题链接。
- Tab 聚焦到标题链接后整卡显示 2px 色调描边，边框光亮起。
- `prefers-reduced-motion: reduce`：卡片可见、悬停不上浮、图标不倾斜、水印保持 -12°。
- `pnpm lint`、`tsc --noEmit`、`pnpm build` 通过。
