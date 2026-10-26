# MorphTooltip · 形变提示气泡

## 目标

一个现代化的通用 tooltip：

- **高级黑**：默认近黑底、柔白字、一圈极细的内高光描边与柔和的投影；**平滑圆角**（超椭圆，复用 `@qiuye-ui/smooth-corners`）。
- **范围内单例**：同一个 `MorphTooltipProvider` 内的所有提示共享**一个**气泡。从一个元素移到另一个元素时，气泡不是消失再出现，而是作为共享元素**滑到新目标**，宽高连续变形，旧内容沿移动方向滑出淡出、新内容从另一侧滑入淡入。
- **只等一次**：只有第一次悬停需要等待 `delay`；之后只要气泡还在（或刚消失不到 `skipDelayDuration`），移到范围内的其他元素上立即显示，无需再等。
- **常见能力**：方向（上下左右）与对齐（start / center / end）、偏移、碰撞翻转与平移（始终留在视口内）、最大宽度与换行、快捷键、可选箭头（随气泡滑动并始终指向目标）、富内容、可交互内容、受控、禁用、内容变化时原地形变（如「复制」→「已复制」）、触屏长按、键盘聚焦、Esc 关闭。

名称 MorphTooltip，registry id `morph-tooltip`，分类「浮层与引导」，npm 依赖 `motion`、`radix-ui`（`Slot`），registry 依赖 `@qiuye-ui/smooth-corners`。单文件 `components/qiuye-ui/morph-tooltip.tsx`，顶部 `"use client"`。之所以不叫 Tooltip：shadcn/ui 项目里几乎都有 `components/ui/tooltip`，同名导出会让自动导入混淆。

## 用法与范围

```tsx
// 1. 一组工具栏按钮共享一个气泡
<MorphTooltipProvider>
  <MorphTooltip content="加粗" shortcut={["⌘", "B"]}>
    <Button size="icon" variant="ghost" aria-label="加粗"><BoldIcon /></Button>
  </MorphTooltip>
  <MorphTooltip content="斜体" shortcut={["⌘", "I"]}>
    <Button size="icon" variant="ghost" aria-label="斜体"><ItalicIcon /></Button>
  </MorphTooltip>
</MorphTooltipProvider>

// 2. 整个应用一个范围：在根布局包一层，全站提示都是同一个气泡
// 3. 嵌套的 Provider 开启新的范围（如侧栏与编辑器工具栏各自独立）
// 4. 没有 Provider 时每个 MorphTooltip 自成一个范围（独立气泡，同样有动画，只是不会跨元素滑动）
```

### MorphTooltipProvider

| 属性 | 默认 | 说明 |
| --- | --- | --- |
| `delay` | `400` | 第一次显示前的悬停等待（ms） |
| `skipDelayDuration` | `500` | 气泡消失后多长时间内，移到范围内其他元素上立即显示（ms）；`0` 关闭 |
| `closeDelay` | `100` | 指针离开元素后多久开始隐藏（ms）。跨过按钮之间的缝隙时气泡不会先消失，从而保持滑动 |
| `morph` | `true` | 是否在元素之间滑动形变；`false` 时仍是单例，但直接切换位置与内容 |
| `side` / `align` / `sideOffset` / `variant` / `arrow` / `maxWidth` | — | 范围内的默认值，单个 MorphTooltip 可覆盖 |
| `container` | `document.body` | Portal 容器 |
| `disabled` | `false` | 关闭范围内所有提示 |

### MorphTooltip

| 属性 | 默认 | 说明 |
| --- | --- | --- |
| `content` | — | 提示内容：字符串或任意节点。为空时不显示 |
| `shortcut` | — | 快捷键：`"⌘K"` 或 `["⌘", "K"]`，显示为内容右侧的键帽 |
| `side` | `"top"` | `"top" \| "right" \| "bottom" \| "left"` |
| `align` | `"center"` | `"start" \| "center" \| "end"` |
| `sideOffset` | `8` | 与元素的距离（px） |
| `alignOffset` | `0` | 沿对齐方向的偏移（px） |
| `avoidCollisions` | `true` | 放不下时翻到对侧，并沿另一轴平移留在视口内 |
| `collisionPadding` | `8` | 与视口边缘保持的最小距离（px） |
| `maxWidth` | `280` | 最大宽度（px 或 CSS 值）；超出自动换行（`text-wrap: pretty`） |
| `variant` | `"dark"` | `"dark"`（高级黑，深浅主题都是黑）\| `"light"`（白底深字）\| `"inverse"`（与主题相反） |
| `arrow` | `false` | 显示指向元素的小箭头，随气泡滑动 |
| `delay` | 范围默认 | 覆盖首次等待时间 |
| `interactive` | `false` | 指针可以移进气泡（内容含链接或按钮时） |
| `closeOnClick` | `true` | 按下元素时隐藏；「复制」类按钮设为 `false`，配合内容变化原地形变 |
| `contentKey` | — | 内容「换了一条」的标识。字符串内容自动比较；节点内容变化需要交叉淡入时传它 |
| `open` / `defaultOpen` / `onOpenChange` | — | 受控 |
| `disabled` | `false` | 禁用这一个 |
| `touch` | `true` | 触屏长按显示 |
| `className` | — | 这个提示显示时气泡表面的额外类名（如换背景色）；不同类名之间切换时颜色也会过渡 |
| `children` | — | 唯一子元素作为触发元素（`Slot` 方式，ref 与事件合并），禁用的按钮请包一层 `span` |

导出：`MorphTooltipProvider`、`MorphTooltip`、类型、`DEFAULT_MORPH_TOOLTIP_OPTIONS`（各默认值）。触发元素在气泡显示期间获得 `aria-describedby` 与 `data-tooltip-state="open"`（原设计为 `data-state`，改名原因见实现记录）。

## 状态机（每个范围一个）

状态：`closed` → `pending`（等待 delay）→ `open(active)` → `closing`（等待 closeDelay）→ 退场 → `closed`，记录 `lastClosedAt`。

| 事件 | 处理 |
| --- | --- |
| 指针进入元素 T | `open` 或 `closing`（包括退场动画进行中）→ 立即切到 T，滑动形变；`closed` 且 `now − lastClosedAt < skipDelayDuration` → 立即显示（全新出现，不从旧位置滑过来）；否则进入 `pending`，`delay` 后显示 |
| 指针离开 T | `pending(T)` → 取消；`open(T)` → `closing`，`closeDelay` 后开始退场 |
| 键盘聚焦 T（`:focus-visible`） | 立即显示（已显示则滑过去）；失焦 → `closing` |
| 按下 T | `closeOnClick` 时立即隐藏，并且指针离开 T 之前不再显示 |
| Esc | 立即隐藏，指针重新进入元素前不再显示 |
| 滚动 / 窗口尺寸变化 | 气泡位置跟随（不加弹簧，直接设置；形变动画进行中则重定目标）；元素完全移出视口时隐藏 |
| 窗口失焦、元素卸载、元素被禁用 | 隐藏 |
| 退场动画中再进入任意元素 | 反向：从当前位置和不透明度出发滑到新元素，不闪烁 |
| 触屏按住 T 约 450ms（移动小于 8px） | 显示；抬起后 1.5s 隐藏；吞掉这次长按之后的 click 与 contextmenu（与 Android 的长按提示一致），触发元素设 `-webkit-touch-callout: none` |

只响应 `pointerType === "mouse" | "pen"` 的悬停；触屏只走长按。

## 定位

在视口坐标中计算（气泡 `position: fixed`，Portal 到 `container`）：

1. 读取元素的 `getBoundingClientRect()` 与气泡目标尺寸（下文测量）。
2. 首选方向放不下（剩余空间 < 气泡尺寸 + sideOffset + collisionPadding）而对侧空间更大时翻到对侧。
3. 按 `align` 计算交叉轴坐标，加 `alignOffset`，夹在 `[padding, 视口 − 尺寸 − padding]`。
4. 箭头：在气泡上的位置 = 元素中心 − 气泡起点，夹在圆角之内。
5. 变换原点（出现 / 消失的缩放中心）取箭头所指的那一点。

## 形变与内容

结构：

```
div[role=tooltip]  position: fixed; left/top 0; transform = translate(x, y)（MotionValue）；pointer-events 视 interactive
  SmoothCorners asChild > motion.div（表面）  width / height 为 MotionValue；overflow: hidden；背景、内高光、阴影
    内容层 × 1–2  position: absolute；以表面中心为锚点（left/top 50% + translate −50%）；宽度固定为自身测量宽度
  箭头（可选，SVG，在表面之外，不被裁切）
```

- **测量**：新内容层以 `width: max-content; max-width: maxWidth` 渲染，在 `useLayoutEffect` 中读取尺寸（绘制之前），作为表面的目标宽高；之后把这一层的宽度固定住，表面变形时文字不重排。内容层还挂一个 ResizeObserver，内容自身变化（如异步加载）时同样形变。
- **滑动**：x、y、width、height 四个 MotionValue 用同一个弹簧（约 `visualDuration 0.3, bounce 0.12`，以实测为准），从当前值和速度出发，可被打断重定目标。
- **交叉淡入**：方向 = 新旧元素中心的差（上下方向的气泡看水平差，左右方向看垂直差）。旧内容 `opacity → 0`、沿反方向位移 8px、`blur(2px)`，约 120ms；新内容从同方向 8px 外滑入、`opacity 0 → 1`，约 200ms、稍后 30ms 开始。同一元素上内容变化（`contentKey` 或字符串变化）时不位移，只做淡入与轻微缩放。
- **出现**：`opacity 0 → 1`，`scale 0.94 → 1`，朝元素方向 4px 的位移归零，短弹簧（约 0.2s，轻微回弹）；**消失**：`opacity → 0`、`scale → 0.97`，约 120ms。原点为箭头所指的点。
- 不同 `variant` / `className` 之间切换时，表面的背景色、文字色用 CSS transition 过渡。
- **减少动态效果**：不滑动、不缩放，位置和尺寸直接设置，只保留约 150ms 的淡入淡出。

## 视觉

- `dark`：底色约 `oklch(0.2 0 0)`（深色主题下约 `oklch(0.25 0 0)`，与深色页面区分），文字 `white / 92%`，12.5px / 18px、字重 500；内边距 6px 10px；圆角 10px、smoothing 0.6；`inset 0 0 0 1px` 白色 8%（深色主题 12%）的内高光；投影 `0 10px 30px −8px` 黑 35% + `0 2px 6px` 黑 18%。
- 快捷键键帽：内容右侧 8px，每个键 `min-width 18px`、高 18px、圆角 5px、`white / 12%` 底、11px、`white / 70%`，等宽数字。
- `light`：白底、`foreground` 文字、`border` 色描边、较轻的投影。`inverse`：浅色主题为 dark，深色主题为 light。
- 箭头：8×4 的圆角三角，与表面同色，同样带内高光描边的视觉连续。

## 可访问性

- 气泡 `role="tooltip"`、固定 id；显示期间当前元素 `aria-describedby` 指向它。仅有图标的按钮仍应自带 `aria-label`（提示是补充说明，不是名称）。
- 键盘聚焦显示、Esc 隐藏；`interactive` 时内容可被指针进入，但不进入 Tab 顺序（真正的交互内容请用 Popover）。

## 演示

1. **编辑器工具栏**：一行图标按钮（含分隔线、下拉），快捷键键帽，第一次等待、之后滑动形变；旁边的计时说明当前处于「等待 / 立即」哪种状态。
2. **贡献热力图**：53 × 7 的格子共享一个气泡，扫过时气泡在格子之间连续滑动，内容「n 次贡献 · 日期」交叉淡入。
3. **方向、对齐与碰撞**：可滚动的小舞台，元素靠近边缘时自动翻转与平移；四个方向 × 三种对齐的示意。
4. **内容与样式**：长文本换行与 `maxWidth`、富内容（头像 + 名称 + 简介）、`variant`、箭头、`interactive` 链接。
5. **内容变化**：「复制」→「已复制 ✓」原地形变（`closeOnClick={false}`）。
6. **范围**：两个相邻的 Provider（各自独立）与没有 Provider 的独立提示对比。
7. **参数调试**：delay、skipDelayDuration、closeDelay、morph、side、align、sideOffset、arrow、variant、maxWidth，实时生效并生成代码。
8. **首页 / 快速预览**：一条 Dock 风格的图标栏，悬停时气泡在图标间滑动。

## 验收

- 计时：首次悬停 `delay` 后出现；移到相邻元素立即滑过去（无等待、无闪烁）；离开后 `skipDelayDuration` 内再进入立即出现，超过后重新等待。
- 位置与尺寸在形变过程中连续（rAF 采样无跳变）；翻转、平移后气泡完全在视口内；箭头始终指向元素中心。
- 滚动时气泡贴着元素；元素移出视口时隐藏；Esc 关闭；键盘 Tab 在元素间移动时滑动。
- 触屏长按显示、抬起后隐藏、不触发 click。
- 浅色 / 深色主题；减少动态效果；`pnpm lint`、`tsc --noEmit` 通过；源码不使用 next/*。

## 实现记录

### 结构

- 单文件 `components/qiuye-ui/morph-tooltip.tsx`。每个 Provider 持有一个 `MorphTooltipScope`（普通类，`useSyncExternalStore` 订阅），只保存交互状态与计时；气泡组件只在显示与退场期间挂载（Portal），退场结束后卸载，下一次全新出现。Provider 解析后的默认值另放一个 Context，触发元素渲染时（如触屏开关）直接读取。
- 没有 Provider 的 MorphTooltip 自动在外面包一层 Provider（独立范围）。不是元素的 children 自动包一层 `span`。
- 内容的渲染位置：
  - 字符串内容由气泡直接渲染（不需要 Context，扫过热力图时也是同步的）。
  - 节点内容由触发元素通过 `createPortal` 渲染进它自己的宿主节点（`display: contents`），气泡在内容层的 layout effect 里把宿主收进当前层再测量。因此节点内容读取的是触发元素处的 Context（路由、主题、i18n），Provider 放在应用最外层也没问题。
  - 节点内容卸载时（换到别的元素、内容换了一条、关闭），在卸载清理里把当前 DOM 复制一份（`aria-hidden` + `inert`）留在原来的层，供退场动画使用；宿主重新有内容时清掉快照。开发模式 StrictMode 的模拟卸载留下的快照由同一个实例在重新挂载时移除。
  - 内容里的 MorphTooltip 不加入外层范围（Context 置空），否则悬停它会把气泡切走。
  - 节点内容在组件树上是触发元素的兄弟，React 合成事件会冒泡到 MorphTooltip 的父级（与 Radix 的 Portal 一致）。气泡自己的指针、焦点与键盘事件改用原生监听：React 合成的 pointerenter / leave 按组件树计算，会把移到 Portal 进来的内容上误判为离开气泡。

### 位置与形变

- 位置拆成两层 DOM：外层「基准」每帧直接跟随元素（`frame.read` 循环读取 `getBoundingClientRect`，覆盖滚动、视口变化以及元素自身的位移，例如 Dock 图标悬停上浮）；内层「偏移」在切换目标时取「当前视觉位置 − 新目标」，带着当前速度用弹簧收回 0。形变途中滚动也贴着元素走，滚动中翻转同样由这一个弹簧平滑过去。
- 没有用 `useTransform` 把两层组合成一个值：开发模式下 StrictMode 重挂 effect 时会取消组合值排队中的更新，第一次出现的位置会丢。两层各自绑定 MotionValue 后不再有这个问题。
- 弹簧：单次形变 `visualDuration 0.3, bounce 0.12`（实测过冲约 0.1px）。上一段形变还没停又换目标（连续扫过）时改用 `visualDuration 0.15, bounce 0` 的跟随弹簧：热力图以约 280px/s 横扫时，箭头落后指针所在格子的平均距离从 2.8 格降到 1.6 格，140px/s 时从 1.2 格降到 0.8 格；停下后 0.15 秒内到位。
- 出现：缩放 0.94 → 1 与朝元素方向 4px 的位移用 `visualDuration 0.22, bounce 0.2`，不透明度 160ms 强 ease-out，原点为箭头所指的点。消失：closeDelay 之后 120ms 到 0、缩放到 0.97。停稳的位置取整到设备像素。
- 找不到触发元素的 DOM 节点（子组件没有转发 ref）时不播放出现动画、保持透明，每帧重试；约 30 帧后在控制台警告一次。
- 内容层测量：用 `getComputedStyle` 读取未经变换的宽高（`getBoundingClientRect` 会受出现缩放的影响），随后固定宽度、用负 margin 居中，把 transform 留给交叉淡入。字符串内容换行后，用 `Range.getClientRects` 求最长的一行并收窄，左右留白对称；收窄后行数变化则退回。

### 内容切换

- 交叉淡入：旧层 120ms 淡出、沿反方向位移 8px、模糊到 2px；新层同时开始，120ms 从移动方向 8px 外滑入、去模糊、淡入，结束后移除 filter。进出时长相同，交叉点两层都在 0.5 左右，切换途中最亮的一层不低于 0.5。
- 进场、常驻与退场的目标都带同一组键（opacity / x / y / scale / filter）。之前退场目标少了 scale（同一元素上则少了 x / y），Motion 会为缺少的键另起一个立即完成的回退动画并触发完成回调，旧层在退场开始后约 9ms 就被移除，每次切换都会露出约 70ms 的空白气泡。现在完成回调只认 opacity 为 0 的退场目标。
- 连续扫过：上一条内容出现不到 150ms 又换了元素时，新内容直接替换、旧层立即移除，只有表面在滑动。扫过热力图与工具栏时，没有一帧是「气泡可见但文字不可读」。
- 同一元素上内容换了一条（`contentKey` 或字符串变化）：原地淡入并从 0.96 轻微放大，不位移；同时通过气泡外的礼貌实时区域（`aria-live="polite"`，不在 `role="tooltip"` 里，不会混进描述）播报新内容。
- 箭头换边（包括上下互换与跨轴）：滑动开始时立即隐藏，180ms 后在新的一侧用 120ms 淡入，此时气泡离终点已不到 6px；箭头开关（在带箭头与不带箭头的提示之间移动）用 150ms 淡入淡出。
- 减少动态效果：出现与消失只有 150ms 淡入淡出；切换时位置、尺寸与箭头直接到位，文字直接替换（表面已经跳到新尺寸，旧文字淡出会被裁切）。

### 状态机细节

- `lastClosedAt` 在退场动画结束时记录（「消失后」）；退场途中进入任何元素都按「反向」处理：从当前不透明度、缩放与位置出发。
- 受控：交互只通过 `onOpenChange` 请求，外部 `open` 改变时才真正切换。`open={true}` 是持续的显示请求：被同一范围的其他提示接替时收到 `onOpenChange(false)`；接替它的提示关闭后、卸载后、Provider 解除禁用后，范围会把气泡交还给仍然保持 `open={true}` 且可显示的提示；内容或禁用状态恢复可显示时也会重新显示。演示中「下载」悬停别的按钮后回来仍会显示进度。
- 当前显示的提示内容被清空或被禁用时，不论是否受控都立即收起并通知一次 `onOpenChange(false)`，不会继续显示旧内容。
- Esc：在 window 捕获阶段处理。焦点在提示自己的元素或可交互气泡里时阻止继续传播（第一次 Esc 只关闭提示，不连带关闭外层对话框）；焦点在别处（如正在输入的输入框）时照常传递，同时收起提示。Esc 之后直到指针离开或元素失焦前不再显示；在气泡里按 Esc 会把焦点还给元素。
- 可悬停（默认）：元素与气泡之间放一条透明的桥，气泡在显示期间接收指针事件，指针移进气泡时保持显示；退场中的气泡不接收指针事件。热力图这类气泡会盖住其他元素的场景关闭 `hoverable`。
- 可交互：隐含可悬停，隐藏延迟至少 120ms；元素聚焦且提示显示时按 Tab 进入气泡的第一个可聚焦元素，最后一项再按 Tab 回到元素之后的下一个可聚焦元素，第一项按 Shift+Tab 回到元素。焦点在气泡里时不会因为指针离开而关闭。
- 触屏：长按 450ms、移动阈值 8px；按住期间给元素加 `user-select: none`（松开后恢复），iOS / Android 不会弹出文字选择手柄与放大镜；`contextmenu` 先到时直接显示并阻止系统菜单；抬起后 600ms 内的 click 在捕获阶段吞掉；抬起 1.5 秒后隐藏。短按时 click 正常触发。
- 被禁用的按钮收不到 `pointerleave`：显示期间每帧检查 `:disabled`，被禁用时收起。
- ref：转发到触发元素，保留 React 19 回调 ref 返回的清理函数（内联 ref 每次渲染是「清理 → 设置」，不会收到 null）。

### 样式

- 样式放在 React 19 `<style href precedence>` 里的 `@layer components` 中，Tailwind 工具类（`className`）可以覆盖表面的颜色与排版，preflight 不会覆盖组件样式。
- 样式表开头先声明与 Tailwind v4 输出一致的层顺序（properties、theme、base、components、utilities）。Vite 的样式不带 `data-precedence`，React 会把这张样式表插到 `<head>` 最前面；没有这句声明时 components 层会排到 base 之前，preflight 会清掉内容的内边距、把键帽换成等宽字体。Tailwind v3 的 preflight 不在层里，会覆盖键帽字体，不在支持范围内。
- `dark` 配色在深色主题下用 `oklch(0.29 0 0)`：比卡片（0.205）与悬停中的按钮（0.269）都亮，浮起的层次靠明度而不是投影。`light` 在浅色主题下跟随 `--popover`、`--popover-foreground` 与 `--border`；深色主题下 `light` 与 `inverse` 仍是白底。深色主题通过祖先的 `.dark` 类或 `data-theme="dark"` 属性识别。

### API 与设计的差异

- 触发元素的状态属性改为 `data-tooltip-state="open"`（只在显示期间存在），不写 `data-state`：Radix 的 DropdownMenuTrigger、Toggle 等会让外部传入的 `data-state` 覆盖它们自己的值，悬停时会误显示「已展开 / 已按下」的样式。`aria-describedby` 与子元素自带的值合并，而不是覆盖。
- 新增 `collisionBoundary`：可滚动的局部区域（演示中的小舞台）以「视口 ∩ 区域」为界翻转与平移。元素被会裁切的祖先（overflow 不是 visible）完全裁掉时也会隐藏，而不只是离开视口。
- 新增 `hoverable`（默认 `true`，WCAG 1.4.13）。原设计中只有 `interactive` 才能移进气泡，默认的提示指针一离开元素就关闭，放大镜用户无法把指针移到内容上阅读。
- `interactive` 增加键盘进入气泡的路径（见上），原设计「内容不进入 Tab 顺序」与实际不符：气泡 Portal 在 `<body>` 末尾，链接其实在文档 Tab 顺序的最后，键盘用户却到不了。
- Provider 除了原设计的方向、对齐、距离、配色、箭头、最大宽度，还可以设置 `alignOffset`、`avoidCollisions`、`collisionPadding`、`collisionBoundary`、`hoverable`、`interactive`、`closeOnClick`、`touch` 的默认值。
- 快捷键字符串结尾的 `+` 本身是一个键（`"⌘+"` 为 ⌘ 与 +，`"Ctrl++"` 为 Ctrl 与 +），其余的 `+` 与空格都是分隔符；每段开头的修饰键符号各自成为一个键帽。
- 箭头为 10 × 约 4.5px（另有 1px 压进表面盖住那一段描边），比 8 × 4 略大，在 12.5px 文字的气泡上更易辨认；底色用 `background-color: inherit` 继承表面，`className` 换背景色时箭头跟着变；两条斜边用裁切后的描边接上内高光。
- 可见性直接用每帧已经读取的矩形判断（含会裁切的祖先），没有另外使用 `useInView`：跟随本来就要每帧读取矩形，IntersectionObserver 会晚一帧，且每次切换目标都要重新观察。
- 组件自身不渲染任何文案，因此没有 `labels` 属性。

## 验证记录（2026-10-25）

在无头 Chromium（CDP 可信输入事件，开发服务器）中验证；脚本与截图在会话的 scratchpad `qa/morph-tooltip/` 下（`f1-functional.mjs` 至 `f6-home.mjs`，截图在 `final/`）。

- 交叉淡入：用 ResizeObserver 回调采样（晚于所有 rAF 回调、早于绘制）。工具栏三连切换时旧层完整退场约 120ms、最亮的一层最低 0.52，没有空白气泡，表面 x 与宽度单调；「复制」原地换成「已复制」时最低 0.53。复测评审时的 WAAPI 追踪：旧层在不透明度到 0 时才移除，不再在退场开始后 9ms 被删。
- 连续扫过：评审脚本复测，工具栏与热力图扫动中「气泡可见但文字不可读」的帧都是 0（修复前分别为 12/70 与 62/98）；热力图 277px/s 横扫时 120 帧中 119 帧文字不透明度不低于 0.6（修复前 4/118），140px/s 时 241 帧中 240 帧。
- 出现与消失：不透明度约 115ms 到 0.99，缩放 0.94 → 1，最大回弹 1.0008；指针离开后先保持 closeDelay，再约 120ms 单调降到 0 并卸载。
- 箭头换边：方向网格从 top·end 移到 right·start，前 180ms 箭头不透明度为 0，出现时距按钮中心 5.4px，结束时指向按钮（夹在圆角之内，偏差 1px）。
- 减少动态效果：出现只淡入、不缩放；切换时每一帧都有完全不透明的文字层，位置、尺寸与箭头直接到位。
- 受控：`open={true}` 被同组提示接替、指针离开后交还；内容清空立即收起，恢复后重新显示；「下载」演示中悬停复制链接再离开，气泡回到「下载中」并在完成后显示「下载完成」。
- 其他行为：节点内容读到触发元素处的 Context；「⌘+」「Ctrl++」各拆成两个键帽；子组件丢掉 ref 时气泡保持透明并警告一次；输入框聚焦时 Esc 照常传给输入框与 document，键盘聚焦触发元素时 Esc 不传播且不再自动显示；指针移进「长文本」气泡后保持显示、离开后关闭；热力图气泡 `pointer-events: none`；Tab 进入可交互气泡的链接、再 Tab 到下一个按钮、Shift+Tab 回到元素、气泡里按 Esc 关闭并还原焦点；「已复制」出现在实时区域且不在 `role="tooltip"` 内；把样式表移到 `<head>` 最前面后内边距仍为 6px 10px、键帽仍为 11px；React 19 回调 ref 的记录为「清理 → 设置」。
- 移动端（390 × 844，dpr 3，触屏，浅色与深色）：长按纯文本元素期间 `user-select: none`、650ms 显示、松开后恢复可选中、1.5 秒后隐藏；长按工具栏按钮显示并吞掉 click，短按正常触发 click；无横向溢出。
- 页面：QA 路由、详情页 `/components/morph-tooltip/` 与首页组件墙（294px 卡片，悬停「邮件」显示）浅色 / 深色截图检查，控制台无报错。
- 静态检查：`npx tsc --noEmit -p .` 与 `npx eslint` 对组件、演示与 QA 页无错误；按 Vite 严格配置（`noUnusedLocals`、`noUnusedParameters`、`verbatimModuleSyntax`、`erasableSyntaxOnly`，不含 Node 类型）单独检查组件通过；源码不含 next/*、process、styled-jsx。
