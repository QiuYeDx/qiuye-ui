# AdaptivePointer · 双层自适应指针

## 目标

在网页上做一套接近 iPadOS 13.4–18 妙控板圆形指针的交互，并在 Apple 的基础上补一点：把被藏起来的「真实指针位置」画出来。最初的设想：

- **内层：淡灰色填充层（fill）**。静止时是 Ø20 的圆；悬停到可点击元素上时连续变形为适当大小、垫在元素下方的圆角板（plate）；在一定范围内移动指针时，展开的板子朝指针偏移的方向做有阻尼感的偏移，并被轻微拉伸。
- **外层：深灰色边框线圆圈（ring）**。静止时与填充层同心同径，读作填充圆的描边；悬停到可点击元素上时与填充层分离，缩成 Ø8 的空心小圆，始终 1:1 停在真实热点上，表示当前指针位置。Apple 的指针一旦变形，用户只知道「在哪个按钮上」，不知道「在按钮的哪里」（iPadOS 26 也因此放弃了变形指针），外环补上这一点。

**核心原则：外环缩小，当且仅当本帧真实热点下方是可点击、未禁用的目标**（按下期间：当且仅当热点在按下时冻结的目标内）。外环不受迟滞、桥接、滚动静默、意图延迟的影响；填充层负责手感，可以晚到、在缝隙里多停一会儿、被拉伸，但屏幕位置永远连续。工程原则：

1. **外环即真相**：位置不加弹簧，静止后按设备像素对齐；只有文本态的纵轴吸附到行。
2. **视觉不撒谎**：网页不能扩大点击区域，所以只在真实命中时变形，不做「靠近吸附」、磁吸或惯性投影。
3. **永不丢指针**：隐藏原生指针只有一条由属性门控的 CSS 规则；叠加层是否可见以命中元素的计算 `cursor` 为唯一事实来源，CSS 与 JS 判断不一致时只会退化成「显示一个指针」，不会两个都没有。
4. **移动路径零 React 渲染**：只跑一个 Motion `frame` 循环，读写分阶段，静止后休眠。
5. **能降级就降级**：没有 JS、触屏、笔、粗指针、强制颜色、开启「减少动态效果」、捏合缩放、运行时异常、持续卡顿或用户关闭时，与原生完全一致。

名称为 AdaptivePointer，registry id `adaptive-pointer`，中文名「自适应指针」，分类「视觉与动效」，tags 为 iPadOS、指针、光标、cursor、悬停、视差、弹簧、变形；名称不含 iPad、Magic Trackpad 等商标词。第一版不做：磁吸、惯性投影与点击转发（真实光标无法被移动，画出来的形状会与系统光标错位）；按亮度自动 lift；静态正文的自动竖条；静止时板子自己回中、晃动放大（自发运动会和诚实的外环争夺注意力）；板子复制 `corner-shape: superellipse`；用 `popover="manual"` 盖住顶层元素；`getPredictedEvents()`（方向急转时会过冲）。

## API

### 导出

```ts
// components/qiuye-ui/adaptive-pointer.tsx（单文件，顶部 "use client"）
export function AdaptivePointer(props: AdaptivePointerProps);          // 整页生效，原地只渲染 <style>
export const AdaptivePointerArea: React.ForwardRefExoticComponent<AdaptivePointerAreaProps & React.RefAttributes<HTMLDivElement>>;
export function useAdaptivePointerStatus(): AdaptivePointerStatus;     // { supported: boolean | null; active; state; pressed }
export function pointerTarget(options?: PointerTargetOptions): PointerTargetAttributes;
export function pointerContent(strength?: number): { "data-pointer-content": string };
export function refreshAdaptivePointer(): void;                        // 程序移动了静止指针下方的内容后调用
export const DEFAULT_ADAPTIVE_POINTER_SELECTOR: string;
export const ADAPTIVE_POINTER_CSS: string;                             // 全部静态 CSS（React 18 项目手动放进全局样式）
export type AdaptivePointerEffect = "auto" | "highlight" | "lift" | "hover" | "text" | "none" | "native";
export type AdaptivePointerState = "inactive" | "hidden" | "native" | "idle" | "pending" | "highlight" | "lift" | "hover" | "text";
```

另导出 `AdaptivePointerOptions` / `Props` / `AreaProps` / `StateInfo` / `LargeTarget` / `PointerTargetOptions` / `PointerTargetAttributes` 等类型。依赖 npm `motion`（`frame` / `cancelFrame`）与 `radix-ui`（`Slot`），registry 依赖无；组件只画两个装饰层，没有界面文案，不提供 labels。模块带 `"use client"`，`pointerTarget()` / `pointerContent()` 只能在客户端组件里调用（服务端渲染客户端组件没有问题），Next.js 服务端组件文件直接写 data 属性，拼接 `DEFAULT_ADAPTIVE_POINTER_SELECTOR` 也放在客户端文件里。`useAdaptivePointerStatus()` 基于 `useSyncExternalStore`，只有离散字段变化才重渲染，服务端快照为 `{ supported: null, active: false, state: "inactive", pressed: false }`。

### 属性（`AdaptivePointer` 与 `AdaptivePointerArea` 共用）

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `disabled` | `boolean` | `false` | 关闭本作用域，交还原生指针，接用户的「使用系统指针」偏好。Area 关闭时渲染 `data-adaptive-pointer-area="off"`，它和它打开的浮层在整页实例里也是原生区域。 |
| `size` | `number` | `20` | 静止时两层的直径（px），夹在 12–40 并取偶数，让圆心落在整像素上。 |
| `ring` | `boolean` | `false` | 外环定位：开启后外环与填充层分离，悬停在可点击目标上时缩成 Ø`ringSize` 小圆，1:1 标出真实热点。关闭即 Apple 经典单层：静止填充改用更深的 solo 透明度。文本竖条始终由外环图层绘制。 |
| `ringSize` | `number` | `8` | 悬停在可点击目标上时外环的直径，夹在 4 到 `size − 4` 并取偶数。只有这一种「可点击」尺寸。 |
| `ringWidth` | `number` | `1.5` | 外环描边（CSS px），夹在 1–3，按设备像素取整；增强对比度偏好下至少 2。 |
| `parallax` | `number` | `1` | 阻尼偏移强度倍数，夹在 0–2；`0` 同时关闭偏移、拉伸与内容视差。 |
| `contentParallax` | `boolean` | `true` | 内容视差：吸附到只有图标的目标（图标按钮）时，图标跟着板子轻微移动（见 6.4）。写了 `data-pointer-content` 的子元素始终参与；目标上写 `data-pointer-content="off"` 单独关闭。 |
| `textBeam` | `boolean` | `true` | 正文 I 形竖条：指针落在作用域内的正文字符上（且不在可点击目标上）时，外环图层变为吸附到行的竖条（见 6.5）。关闭后只在 `data-pointer="text"` 区域内显示；`data-pointer="none"` 的子树不显示。 |
| `largeTarget` | `{ height?: number; area?: number }` | `{ height: 96, area: 32000 }` | `auto` 目标高度超过 `height`，或面积（px²）超过 `area` 时按 `hover` 处理。按值比较，内联对象不会导致重新注册。 |
| `selector` | `string` | `DEFAULT_ADAPTIVE_POINTER_SELECTOR` | 自动识别目标的选择器，整体替换默认值；扩展写法为 `` `${DEFAULT_ADAPTIVE_POINTER_SELECTOR}, .clickable` ``。按顶层逗号拆段逐段校验，丢弃不支持的段（开发环境警告）。 |
| `hideOnKeyboard` | `boolean` | `true` | 按下非修饰键（且没有按住 Ctrl / Meta / Alt）时 150ms 淡出，移动 ≥ 2px 后恢复。 |
| `autoHide` | `number \| false` | `2000` | 静止多少毫秒后 300ms 淡出，小于 500 按 500 处理；`false` 为常驻。移动 ≥ 2px 即恢复。 |
| `timeScale` | `number` | `1` | 物理时间倍率，夹在 0.1–2；`0.25` 即四倍慢放，用于调试与编排验收。 |
| `onStateChange` | `(info: AdaptivePointerStateInfo) => void` | — | 只在 state、target、pressed 变化时经 `queueMicrotask` 调用，回调里的异常或 `setState` 不会进入帧循环。离开本作用域时收到 `{ state: "hidden", target: null, pressed: false }`。 |

`AdaptivePointerArea` 另有 `asChild`（用 `Slot.Root` 把作用域挂到唯一子元素上，不增加 DOM 层级）与透传的 div 属性；ref 转发并保留 React 19 回调 ref 返回的清理函数；合并使用方的 `onPointerMoveCapture` / `onPointerDownCapture`。

### 目标级 data 属性（声明式，不需要 JS）

| 属性 | 写在哪里 | 取值 | 作用 |
| --- | --- | --- | --- |
| `data-pointer` | 目标 | `auto`（或空）/ `highlight` / `lift` / `hover` | 指定效果；写在任何元素上都会让它成为目标，即使不匹配 `selector`。 |
| | 元素 | `none` / `native` | `none`：本元素不是目标并停止向上查找（子孙中的目标仍有效）；`native`：整个子树交还原生指针，叠加层隐藏。 |
| | 容器 | `text` | 文本区域：没有命中目标、且热点落在字符行盒内时，外环图层变为 I 形竖条。`textBeam` 开启时整个作用域都是文本区域，这个值只在关闭后用来单独开启某块区域。 |
| `data-pointer-default` | 容器 | `highlight` / `lift` / `hover` / `none` | 容器内 `auto` 目标的默认效果，优先于尺寸判定。例如菜单 Content 写 `hover`，密集表格写 `none`。 |
| `data-pointer-padding` / `-radius` | 目标 | `"4"` 或 `"6 3"`（x y）/ px 数值或 `full` | 覆盖板子外扩与圆角。 |
| `data-pointer-parallax` | 目标 | 倍数 0–3，如 `"0"`、`"0.5"` | 该目标的偏移强度，与全局 `parallax` 相乘。 |
| `data-pointer-group` | 容器 | 空 / `off` | 声明连续组（H3）；`off` 关闭按角色的自动成组。 |
| `data-pointer-content` | 目标内的非按钮子元素（图标、文字 span） | 空，或强度 0–1（默认 0.4）；写在目标上取 `off` 关闭 | 显式指定参与内容视差的子元素（6.4），图标与文字混排的按钮用它。 |
| `data-pointer-state`（引擎写，只读） | 当前吸附的目标 | `highlight` / `lift` / `hover` | 填充层真正吸附时写，脱离时删（桥接期间保留）；供使用方去掉重复的 hover 背景、写 lift 上浮样式。 |
| `data-pointer-pressed`（引擎写） | 按下时冻结的目标 | 空 | 按下期间存在。 |
| `data-adaptive-pointer`（引擎写） | 已激活的作用域根（Area 元素或 `<html>`）与借出的浮层宿主 | `on` | 激活后常驻，驱动隐藏原生指针的 CSS，只在退回原生时摘掉。 |
| `data-adaptive-pointer-area` | Area 元素（React 渲染）；关闭的 Area 借出的浮层宿主（引擎写） | `""` 启用 / `off` 关闭 | 作用域解析与原生区判定。 |
| `data-adaptive-pointer-native` / `-fallback`（引擎写） | 内联光标或方括号写法的任意值光标类所在的宿主 / 不派发事件的原生禁用控件 | 空 | 前者第一次命中时补写（7.1），后者临时、指针离开即撤销（6.1）。 |

### 作用域与浮层

| 方式 | 写法 | 作用域根 | 适用 |
| --- | --- | --- | --- |
| 整页 | `<AdaptivePointer />`，像 `<Toaster />` 一样放一次 | `<html>` | 应用级体验，浮层天然覆盖 |
| 局部 | `<AdaptivePointerArea>` 或 `asChild` | Area 元素，以及它的 React 子树 Portal 出去的浮层 | 文档站 Demo、营销页区块、编辑器画布 |

1. **claim**：Area 根节点挂 React 的 `onPointerMoveCapture` / `onPointerDownCapture`。React 合成事件沿 React 树传播、会穿过 Portal；捕获阶段由外向内执行，处理器只做 `claim(areaId, timeStamp)`，后写者胜，所以最内层 Area 生效，子组件的 `stopPropagation` 也挡不住捕获阶段。
2. **解析顺序**（每帧 read 阶段）：① 本帧事件的 claim（时间戳等于最近一次指针事件，且命中元素就是事件目标）；② 命中元素最近的 `[data-adaptive-pointer-area]`，值为 `off` 即作用域外，未登记的节点（根节点刚换过）继续往下；③ 命中元素在 `<body>` 下的顶层祖先是否在借出表里（滚动等没有新事件的帧）；④ 最后挂载的整页实例（它被关闭时为空）；⑤ 都没有即作用域外。
3. **借出**：claim 的命中在 Area 之外（浮层）时，取命中元素在 `<body>` 下的顶层祖先（Radix Portal 渲染的那个 div），在 render 阶段写 `data-adaptive-pointer="on"` 并记入借出表（整页实例已激活时不需要写）；这一帧属性还没生效，按 JS 侧 NATIVE 选择器预判可见性。包含任何作用域根的祖先（应用外壳、`#root`、Portal 进外壳里的插槽）一律不借，否则整个应用会并入这个作用域；按下拖动、指针捕获期间 `elementFromPoint` 的命中与事件目标不同，这时不借。
4. **关闭的 Area** 的 claim 同样借出宿主，但写 `data-adaptive-pointer-area="off"`，所以在整页实例下它打开的菜单与对话框也显示原生指针。Area 关闭、重新开启或卸载时统一撤销它借出的属性；浮层卸载时属性随节点消失。

嵌套规则：最内层作用域的配置生效，不从外层继承；多个整页实例只认最后挂载的那个（开发环境警告），更早的实例不写 `<html>`；关闭的 Area 里再嵌开启的 Area 不受支持（CSS 无法按深度判断，原生优先）。Area 的根节点用 state 记录，`asChild` 的子元素换了类型或 key、切换 `asChild` 时重新登记。

### 接入方式

```tsx
// pnpm dlx shadcn@latest add @qiuye-ui/adaptive-pointer
// 整页：Next.js 的 app/layout.tsx（组件自带 "use client"）或 Vite 的 main.tsx，放一次
<body>{children}<AdaptivePointer /></body>
// 局部，并接用户的「使用系统指针」偏好（偏好由应用自己持久化，组件不读 localStorage）
<AdaptivePointerArea disabled={preferNative} className="rounded-xl border p-6">…</AdaptivePointerArea>
```

- **去掉按钮自带的 hover 背景**，避免和板子叠两层：写 `data-[pointer-state=highlight]:hover:bg-transparent`，只在板子真的吸附时生效。shadcn 的 ghost 变体在深色主题下另有 `dark:hover:bg-muted/50`，优先级相同且写在后面，所以再加 `dark:data-[pointer-state=highlight]:hover:bg-transparent`。切换按钮的按下态要在悬停时保持底色（`hover:bg-muted dark:hover:bg-muted`），否则点击后在板子下面看不出状态变化。
- 自定义的可点击 `div` 加 `role="button"` 或 `data-pointer`；带变体前缀的语义光标（如 shadcn SidebarRail 的 resize 光标）与拖动时注入全局光标的库（react-resizable-panels 等）的手柄，手动加 `data-pointer="native"`。
- 环境：React 19（`<style href precedence>` 提升到 head 并去重）。React 18 会渲染普通 `<style>`，功能不受影响，也可以手动放入 `ADAPTIVE_POINTER_CSS`。

## 设计细节

### 1. 视觉与令牌

填充层是实心圆角矩形，`background: var(--ap-fill)`（前景色，不带透明度），有效透明度全部由 `opacity` 承担；外环层是 `border: bw solid var(--ap-ring)`、`border-radius: 9999px`（圆和竖条都适用），外加 `box-shadow: 0 0 0 1px var(--ap-halo)` 的外侧晕边。静止时外环描边压在填充圆最外侧；悬停时填充层向外长成板、外环向内缩成小圆，两者从同一条边缘反向分开。

| 状态 | 填充层几何 | 填充 α（浅 / 深） | 外环 |
| --- | --- | --- | --- |
| idle | Ø`size` 圆，锚点为指针 P | 0.16 / 0.22（`ring=false` 用 solo 0.28 / 0.34） | Ø`size` |
| idle 按下 | ×(1 − 0.1p) | + press·p（0.04 / 0.05） | ×(1 − 0.1p) |
| pending（高速掠过） | 同 idle | 同 idle | Ø`ringSize`（如实反映命中） |
| highlight | 圆角板（第 2 节）+ 阻尼偏移 + 拉伸 | 0.075 / 0.11 | Ø`ringSize` |
| highlight 按下 | 按下瞬间的板子尺寸 ×(1 − 0.04p)，偏移 ×(1 − 0.75p) | + press·p | ×(1 − 0.25p)，即 Ø6 |
| lift（只能显式指定） | 对齐目标矩形，外扩 0 | 0.16s 内淡到 0 | Ø`ringSize`；`ring=false` 时两层都隐藏，即 Apple 原版 lift |
| hover（大目标） | Ø36 圆（`1.8 × size` 取偶），跟手、不偏移 | 0.09 / 0.13（单层模式同样放大为 Ø36，否则悬停大卡片没有任何反馈） | Ø`ringSize`，按下 ×(1 − 0.25p) |
| text | 收向竖条尺寸并淡出 | 0.16s 内淡到 0 | 竖条（6.5） |
| native / 作用域外 | — | 立即为 0 | 立即为 0 |
| hidden | 几何保持 | × 可见度 v，线性淡出 | × v |

p 为按压因子（0–1）。增强对比度（`prefers-contrast: more`）下 `size` 与 `ringSize` 各加 2（静止 Ø22、小圆 Ø10），描边至少 2px，令牌加深。

**颜色用前景色加透明度，不用混合模式。** 浅色主题「近黑 × 低 α」在正常合成下等价于 multiply（白底变灰、黑字仍是黑字），深色主题「近白 × 低 α」等价于 screen，文字几乎不受影响，读作垫在内容下面的板子；同时避开了混合模式只在祖先层叠上下文内生效、WebKit 的已知问题、顶层元素上行为未定义等问题，根节点可以放心用 `contain: strict`。不用中灰色加 α：它会在黑色 primary 按钮上蒙一层灰雾。令牌写成零优先级的 `:where()`，与 shadcn 主题变量一样在 `:root` / `.dark` 上声明；`prefers-contrast: more` 的媒体块写在两个基础块之后，块内 `.dark` 在 `:root` 之后（`<html class="dark">` 同时匹配两个零优先级选择器，靠书写顺序决定）：

```css
:where(:root) {
  --adaptive-pointer-fill: var(--foreground, CanvasText);
  --adaptive-pointer-ring: color-mix(in oklab, var(--foreground, CanvasText) 72%, var(--background, Canvas));
  --adaptive-pointer-halo: color-mix(in oklab, var(--background, Canvas) 72%, transparent);
  --adaptive-pointer-alpha-idle: 0.16; --adaptive-pointer-alpha-solo: 0.28; --adaptive-pointer-alpha-plate: 0.075; --adaptive-pointer-alpha-hover: 0.09; --adaptive-pointer-alpha-press: 0.04;
}
/* .dark：ring 80%、halo 60%，α 依次 0.22 / 0.34 / 0.11 / 0.13 / 0.05；高对比：ring 直接取前景色、halo 更实，α 浅色 0.24 / 0.4 / 0.11 / 0.13 / 0.06，深色 0.32 / 0.46 / 0.16 / 0.19 / 0.07 */
```

**令牌怎么到达叠加层**：叠加层挂在 body 下，继承不到局部岛的变量。令牌宿主为 `hit.closest(".dark, [data-adaptive-pointer-area]") ?? <html>`；宿主变化、`<html>` 的 `class` / `style` / `data-theme` 变化（MutationObserver）或对比度偏好变化时读一次计算样式。三个颜色原样复制为字符串，写到叠加层根节点的 `--ap-fill` / `--ap-ring` / `--ap-halo`（计算值已替换过 `var()`，不在 JS 里解析颜色）；五个 α 用 `parseFloat` 读取并夹到 0–1。颜色先用 `CSS.supports("color", value)` 校验，失败时试 `hsl(value)`（兼容 Tailwind 3 主题里只写通道的 `--foreground: 222.2 84% 4.9%`），仍失败就退回默认值（外环退回由填充色混合出的颜色）并在开发环境警告，否则无效颜色会让图层变透明，`ring={false}` 时整块区域一个指针都没有。覆盖写在 `:root` / `.dark`、局部 `.dark` 岛或 Area 根节点上（如 `[--adaptive-pointer-ring:var(--color-blue-600)]`），写在其他容器上不会被读到。在本仓库主题下，浅色静止圆约 `#d8d8d8`、外环约 `#434343`、板子约 `#ededed`；深色（`#0a0a0a` 底）分别约 `#3f3f3f`、`#c3c3c3`、`#242424`。在 primary 按钮、图片链接这类不透明目标上，板子落在按钮内部的部分几乎看不出来，只有几像素的外扩形成一圈光边，读作「托着按钮的底座」；默认不做亮度判断、不自动切换为 lift。

**外环在任何背景上都清楚**：不用 `scale()`（会把描边缩细甚至发虚），直接写 `width` / `height`；描边按设备像素取整 `bw = max(1, round(ringWidth·dpr)) / dpr`，默认 1.5 在 DPR 1 / 1.25 / 1.5 / 2 下为 2 / 2 / 2 / 3 个设备像素；写入时多加 0.25 个设备像素（`(bw·dpr + 0.25) / dpr`）：浏览器把描边向下取整到设备像素，而且先按自己的精度存储，恰好写 `bw` 会在 DPR 1.5（以及 WebKit 的 1.25）下少画一个像素（QIUYE-UI-PIT-0015）；尺寸弹簧静止后直径取偶数个设备像素、位置按 `round(P·dpr) / dpr` 对齐，中心孔正对热点；外侧 1px 晕边在黑色按钮或照片上勾出轮廓；Ø8 的内孔约 4–5px，落在文字上不会盖住整个字。层级上，叠加层 `position: fixed; inset: 0; z-index: 2147483647; pointer-events: none`，命令式追加为 body 的最后一个子元素，高于 Radix 浮层（z-50）与 Sonner；顶层元素（`dialog:modal`、`:popover-open`、全屏）高于任何 z-index，交还原生指针。

### 2. 圆角板几何

```text
w × h = 目标的可见矩形（getBoundingClientRect，已与裁剪祖先求交；折行的行内元素取指针所在的一段）
inline 元素：outX = 4, outY = 2
其余：      o = clamp(round(0.1 · min(w, h)), 2, 5)；outX = (w / h ≥ 1.5 ? 1.5 : 1) · o；outY = o
data-pointer-padding 优先于以上规则
W = max(w + 2·outX, 24)，H = max(h + 2·outY, 24)               // 最小 24，小复选框也有像样的板
板子再与裁剪矩形求交（ScrollArea 里半露的行、贴边的整宽行不溢出）
R = data-pointer-radius ?? (r > 0 ? r + min(outX, outY) : clamp(0.25 · min(W, H), 6, 10))
R = min(R, min(W, H) / 2)                                        // 与目标圆角同心；"full" 即 min(W, H) / 2
```

视觉圆角 r 取 `borderTopLeftRadius`（百分比按短边换算，`calc(infinity)` 夹到短边一半）。计算样式 `corner-shape` 含 `superellipse` 时，说明是本仓库的 SmoothCorners 或默认 Button，读到的是等效半径 `--sc-i`（约为视觉半径的 1.6 倍）：优先读 `--sc-r`，读不到时 ÷ 1.6，例如 rounded-lg 读到 16、视觉半径为 10。板子本身一律用普通圆角，不复制 `corner-shape`：变形途中切换形状会跳变，超椭圆外扩后也不同心。用本仓库 radix-nova 控件验算（D 为偏移上限，见第 5 节）：

| 目标 | w×h / r | outX, outY | 板 W×H | R | D |
| --- | --- | --- | --- | --- | --- |
| icon 按钮 `size-8` | 32×32 / 10 | 3, 3 | 38×38 | 13 | 5.3 |
| 默认按钮「保存」 | 64×32 / 10 | 4.5, 3 | 73×38 | 13 | 5.3 |
| TabsTrigger | 72×28 / 8 | 4.5, 3 | 81×34 | 11 | 4.8 |
| 正文链接 16px | 44×22 / 0 | 4, 2 | 52×26 | 6.5 | 3.6 |
| 原生 checkbox | 16×16 / 4 | 2, 2 | 24×24 | 6 | 3.4 |
| Switch | 32×18.4 / 9.2 | 3, 2 | 38×24 | 11.2 | 3.4 |
| 侧栏列表项 | 240×36 / 8 | 6, 4 | 252×44 | 12 | 6 |

板子会盖到相邻目标：悬停在 icon 按钮边缘时，板子越出按钮约 o + 0.6·D + 拉伸的一半 ≈ 3 + 3.2 + 0.8 ≈ 7px，在 `gap-0.5` 的工具栏里会盖住邻居几个像素。这是有意接受的：板子半透明、读作垫在下方，外环才是真相，不按间距收紧偏移。

### 3. 状态机与迟滞

| 生命周期 | 含义 | 原生指针 | 叠加层 |
| --- | --- | --- | --- |
| off | 没有实例 | 原生 | 不存在 |
| dormant | 已挂载，等待第一个合格的鼠标移动；或被触屏、全部关闭、捏合缩放、卡顿熔断退回 | 原生 | 已创建，`visibility: hidden` |
| active | 作用域根带 `data-adaptive-pointer="on"` | 作用域内隐藏（原生区除外） | 由形态决定 |
| unsupported | 媒体条件不满足（变回满足后恢复）；握手失败或运行时异常（本会话粘滞） | 原生 | 隐藏或移除 |

- **激活**需要同时满足：`isTrusted`；`pointerType === "mouse"`；不是触屏后的兼容鼠标事件（`sourceCapabilities.firesTouchEvents`，或距上次触摸 800ms 内且坐标相差 ≤ 2px）；命中元素在启用的作用域内且不匹配 JS 侧 NATIVE 选择器；`matchMedia("(hover: hover) and (pointer: fine) and (forced-colors: none)")`（与 CSS 同一条查询）；`visualViewport.scale === 1`；页面可见；不在卡顿冷却期。激活在帧内完成：read 阶段置为 active，同一帧的 render 写作用域属性、叠加层瞬移到 P 并显示，本帧可见性按 JS NATIVE 预判；下一帧做握手（7.4）。
- **退回 dormant**：touch / pen 的任意指针事件、所有作用域都被关闭、捏合缩放、主输入媒体变化、卡顿熔断；同一任务内摘属性、隐藏叠加层、清掉目标上的属性，下一次激活重新握手。最后一个实例卸载时在微任务里延迟销毁，抵消 StrictMode 的双重挂载。
- **属性常驻**：激活后，离开作用域、离开窗口、失焦、键盘操作、标签页隐藏都不摘属性。每次切换属性都会让整棵子树重算样式；指针不动时看不见不算「丢失」，下一次移动必定恢复。

**形态**：主状态为 `hidden(reason)`、`native`、`idle`、`pending(T)`、`engaged(T, effect)`（effect 为 highlight / lift / hover）、`text(line)`；正交标志为 `pressed`（冻结目标 A）、`bridge`（group / timed）、`scrollingUntil` 与可见度 v。**外环尺寸每帧只看真实命中**：解析为目标（含 pending）→ Ø`ringSize`；文本字符命中 → 竖条；按下期间 → 小圆当且仅当存在冻结目标 A 且热点在 A 的矩形内（这正是「松手会不会点到 A」），没有冻结目标就保持大圆；其余 → Ø`size`。

**每帧解析顺序**（read 阶段，每帧都重新解析、不按元素缓存结论，类名或 disabled 在静止指针下变化时下一帧立即一致）：

1. 命中：有新事件时取 `composedPath()[0]`；按下期间（指针捕获会让事件目标变成捕获元素）、命中被标脏（滚动、wheel、resize、松手、`refreshAdaptivePointer()`、恢复显示）或滚动静默期内，改用逐层进入开放 shadow root 的 `elementFromPoint`。
2. 作用域（见 API）；可见性：`getComputedStyle(hit).cursor !== "none"` → native，作者主动隐藏（`cursor-none` 类或内联 `cursor: none`）→ 两层都隐藏，热点在原生滚动条上 → native。
3. 目标查找：自 hit 沿组合树（`parentElement ?? shadowRoot.host`）向上最多 32 层，到 Area 根或 body 为止。带 `data-pointer` 的节点优先（`none` 停止、`native` 返回 native、`text` 记为文本区域并停止、其余值为显式目标），否则 `matches(selector)` 即自动目标。候选匹配 DISABLED 时返回 idle 并停止查找：禁用按钮的点击不会冒泡触发外层卡片，不能让外层卡片变形。
4. 效果判定（6.2）；没有目标而有文本区域时做字符命中（6.5）；测量已吸附目标与新候选（6.3）。

| # | 当前 | 触发 / 条件 | 结果与动作 |
| --- | --- | --- | --- |
| 1 | hidden | 隐藏之后的新移动（各原因的附加条件见下表） | 按解析结果出现：瞬移（残差与速度清零），外环从 0.75 弹出，填充 α 0.10s 升到目标值 |
| 2 | 任意可见 | 解析为 native 或作者隐藏 | 同一帧隐藏两层；回来时直接出现、不弹出（在输入框之间穿行不闪） |
| 3 | idle / pending / text | 命中健康目标 T，速度 ≤ 1.6 px/ms 或已在 T 上停留 ≥ 50ms，且不在滚动静默期 | engaged(T)：attach，写 `data-pointer-state` |
| 4 | idle / text | 命中 T 但不满足 #3（高速掠过、滚动中、T 尚不健康） | pending(T)：外环 Ø8，填充层不动，不写 state；离开 T 回 idle，外环只「嘀嗒」一下 |
| 5 | engaged(A) | 命中另一个健康目标 B（包括桥接期间） | slide，板子不经过圆形；A 的内容视差独立回零 |
| 6 | engaged(A) | 命中非目标，P 在 A 的组容器内 | 组桥接：外环恢复 Ø20，板子留在 A，不限时 |
| 7 | engaged(A) | 命中非目标，不在组内，速度 ≤ 1.5 px/ms 且距板 ≤ 12px | 限时桥接：板子最多再停 80ms，偏移沿双曲线趋向上限（拉、拉、啵） |
| 8 | engaged(A) / 桥接 | 其余情况、桥接超时或超距、离开组容器、命中文本 | detach；离开速度 > 1.5 px/ms 时用 fling 参数 |
| 9 | engaged(A) | A 不健康：被移除、0×0、匹配 DISABLED、可见部分任一轴 < 4px、`data-pointer` 变为 none / native | 立即 detach，不桥接 |
| 10 | engaged(A) | 滚动静默期内，A 的中心自滚动前累计位移 > 4px，或热点已不在 A 上 | detach；静默结束后重新解析 |
| 11 | 任意 | 主键 `pointerdown` | 热点下的目标还没吸附（pending，或与移入同一帧按下）时先 attach / slide；吸附在它上面时冻结为 A，写 `data-pointer-pressed`、记录板子尺寸；在缝隙或正文上按下不冻结任何目标 |
| 12 | pressed | 每帧 | 有 A：保持 engaged(A)，p 目标 = 热点在 A 内 ? 1 : 0，热点在 A 外时外环恢复、偏移沿双曲线被拉向指针；无 A：idle 按压态，外环保持大圆，不吸附任何目标 |
| 13 | pressed | `pointerup` / `pointercancel`，或任何事件的 `buttons` 已不含主键 | 在 max(此刻, 按下 + 80ms) 解除，删 `data-pointer-pressed`，命中标脏（点击可能移除了目标或弹出了菜单） |
| 14 | 非按下 | 文本区域内字符命中 | text：外环变竖条，填充淡出；热点离开字符行盒后重新解析 |

| 隐藏原因 | 触发 | 淡出 | 恢复的附加条件 |
| --- | --- | --- | --- |
| keyboard / idle | 非修饰键、未按住 Ctrl / Meta / Alt；或静止达到 `autoHide`（按下期间不计） | 150ms / 300ms | 距隐藏点 ≥ 2px |
| leave / blur | document `pointerout` 且 relatedTarget 为 null、P 距视口边 ≤ 4px；window `blur` | 120ms | —（后台窗口收到移动即恢复） |
| frame | relatedTarget 在 iframe / embed / object 内，或为 null 但不在边缘 | 立即 | — |
| page | `visibilitychange` 变为 hidden、`pagehide`；循环休眠 | 立即 | 页面可见 |
| drag / menu | `dragstart` / `contextmenu`，并在下一个任务里确认未被 `preventDefault`（自定义菜单保持显示） | 立即 | 拖放结束（dragend / drop，或之后第一次没有主键的移动）/ — |
| autoscroll | 中键 `pointerdown` | 立即 | 按住拖动超过 10px 后松开；或任意按键、之后的一次点击；或中键松开后 300ms 内页面没有滚动（没进入自动滚动，例如 macOS） |
| lock / picker / fallback | 进入 Pointer Lock；在颜色 / 文件输入上按下；不派发事件的原生禁用控件（6.1） | 立即 | 已解锁 / — / 离开控件后的事件 |

所有原因都要等「下一次移动」才恢复，且只计隐藏之后坐标真的变化的 pointermove（移动计数器）：隐藏前排队的 move、同一次点击的 pointerup 都不算。

| 迟滞 | 规则 |
| --- | --- |
| H1 进入 / H4 切换 | 不做空间外扩，命中即目标；切换目标即时生效，即使仍在旧目标的宽限内，永远不回缩成圆。 |
| H2 离开（不在组内） | 只给填充层时间宽限：≤ 80ms 且距板 ≤ 12px；离开速度 > 1.5 px/ms 时跳过。外环不参与。 |
| H3 连续组 | 组容器内不限时，直到进入新目标或离开容器。组容器为最近的 `[data-pointer-group]`（值不为 off）、`[role=toolbar]`、`[role=tablist]`、`[role=menubar]`、`[role=menu]`、`[role=listbox]`、`[role=radiogroup]`、`[data-slot=button-group]`、`[data-slot=toggle-group]`；最近的组容器写了 `off` 即不成组；目标在 Area 内时组容器也必须在 Area 内（Area 自己 Portal 出去的菜单照常成组）。 |
| H5 意图延迟 | 从 idle（或文本竖条）出发、速度 > 1.6 px/ms 时，填充层推迟到减速，或在目标上停留满 50ms。 |
| H6 按压锁定 / H7 滚动静默 | 从按下到松开目标不变；最后一次 scroll / wheel 之后 120ms 内不新吸附，外环照常如实。 |
| H8 恢复显示 / H9 文本换行 | 只有隐藏之后的移动才能恢复，keyboard / idle 原因还要移动 ≥ 2px（忽略滚动或布局后补发的坐标几乎不变的 move）；越过行边界 0.15 × 行高后才切换到新行。 |

### 4. 运动模型与弹簧参数

```text
填充中心  F = Anchor + O·(1 − 0.75p) + Residual
填充尺寸  S = (AnchorSize | 按下瞬间的板子尺寸) + SizeResidual + 0.5·|O·(1 − 0.75p)|，再 × 按压缩放
填充圆角  R = clamp(AnchorR + RadiusResidual, 0, min(W, H) / 2)
外环中心  P + (0, RingResidualY)                ← 只有文本态的纵轴非 0
```

- **Anchor 每帧刚性求出，不带弹簧**：idle / pending / hover 为指针 P（Ø`size` 或 Ø36），highlight 为板子，lift 为目标矩形，text 为 (P.x, 行中心)。静止圆因此 1:1 跟手；目标被布局动画、轮播、拖拽移动时，板子像粘在目标上一样跟着走（用弹簧追目标中心会产生约 2ζ/ω × 速度的稳态滞后）。
- **O（视差）** 是弹簧，追向阻尼偏移目标（第 5 节），只在 highlight 中非 0。**Residual（残差）** 弹簧追向 0：每当锚点不连续地切换（吸附、滑行、脱离、换行、折行链接换段），残差吸收这次跳变，屏幕位置与速度保持连续。吸附、滑行、脱离因此是同一个机制，区别只在弹簧参数与速度怎么处理。
- **速度**：指针速度用 EMA，`v ← v + (v_inst − v)·(1 − e^(−Δt / 40ms))`，超过 50ms 没有新事件时归零。锚点切换时：

```text
所有切换  Residual += AnchorOld − AnchorNew；SizeResidual、RadiusResidual 同理
          旧锚点按本帧输入求值；按下时从屏幕上实际画的尺寸出发；上一帧被裁剪过的板子把裁剪量并入残差
attach    旧锚点任一轴跟随指针 → 完全静止的目标（含文本竖条 → 链接）：v_Res = clamp(0.35·(v_Res + v_P), ±285 px/s)
slide     静止目标 → 静止目标：速度原样保留，板子带着惯性滑到下一个按钮
detach    目标 → 指针：先把视差与它带来的拉伸并入残差（Res += O，Size += 0.5·|O|，O 清零），
/ fling   再 v_Res −= v_P → 屏幕起始速度约为 0，随后加速追上指针，形成「弹回」
指针之间  idle 圆 ↔ hover 柔和圆：变大按 attach，变小按 detach
```

attach 不做严格的速度连续：2000 px/s 带满速度冲进来会冲出约 35px；带入 35% 并限制在 285 px/s，冲出量上限约 `v / (ω·e)`（ω = 2π / 0.30）≤ 5px，读作目标像磁铁一样抓住冲进来的板，带一点余势落定。

**弹簧参数表**（质量取 1，`k = (2π/T)²`，`c = 4πζ/T`；过冲按 `e^(−πζ/√(1−ζ²))` 从静止阶跃计算）：

| 通道 | 场景 | T (s) | ζ | k | c | 过冲 | 理由 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 外环位置 | 全部 | — | — | — | — | — | 它就是指针，任何平滑都会让它比真实位置晚 |
| 外环直径 | 收缩到 Ø8 | 0.20 | 0.60 | 987 | 37.7 | 9.5%，约 1.1px | 一下利落的「咔」；约 0.125s 到达峰值，先于填充层到位 |
| | 恢复到 Ø20 | 0.20 | 0.75 | 987 | 47.1 | 2.8%，约 0.3px | 回家不要弹 |
| | 圆 ↔ 竖条 | 0.20 | 0.90 | 987 | 56.5 | 0.15% | 光标过冲会显得软 |
| 外环缩放 | 重新出现 0.75 → 1 | 0.24 | 0.55 | 685 | 28.8 | 12.6% | 唯一刻意偏弹的一档，帮用户找到指针；只用于隐藏后恢复与首次激活 |
| 外环纵向残差 | 文本换行 | 0.14 | 1.0 | 2014 | 89.8 | 0 | 快、无过冲，像落进轨道 |
| 填充位置残差 | attach | 0.30 | 0.85 | 439 | 35.6 | 0.6% | 与 Apple 重新定位同族但更短：0.4s 在 1:1 的外环旁边会显得拖沓 |
| | slide | 0.26 | 0.85 | 584 | 41.1 | 0.6% | 形状已经成形，只是换位置（Apple 相邻滑动约 0.25s） |
| | detach | 0.24 | 1.0 | 685 | 52.4 | 0 | 追的是移动中的指针，任何过冲都会表现为绕着外环打转 |
| | fling（> 1.5 px/ms） | 0.18 | 1.0 | 1218 | 69.8 | 0 | 板子不能拖在快速移动的指针后面 |
| 填充尺寸残差 | attach | 0.30 | 0.80 | 439 | 33.5 | 1.5% | 与位置同一个 T，读成一个动作；轻微盛开 |
| | slide / detach / fling | 0.26 / 0.24 / 0.18 | 0.85 / 0.95 / 1.0 | 584 / 685 / 1218 | 41.1 / 49.7 / 69.8 | 0.6% / ≈0 / 0 | |
| 圆角残差 | attach / 其余 | 0.30 / 0.24 | 1.0 | 439 / 685 | 41.9 / 52.4 | 0 | 圆角过冲会瞬间露出尖角 |
| 视差 O | 跟随 | 0.34 | 1.0 | 341 | 37.0 | 0 | 稳态滞后 2ζ/ω ≈ 108ms，这就是「有分量」的阻尼感；对鼠标抖动不发颤 |
| 按压 p | 按下 / 松开 | 0.10 / 0.28 | 1.0 / 0.65 | 3948 / 504 | 125.7 / 29.2 | 0 / 6.8% | 按下即响应（Apple 约 80–120ms），松手轻微「呼吸」回来 |
| 填充 α | 显示 / 状态之间 / lift、text 淡出 | 0.10 / 0.20 / 0.16 | 1.0 | 3948 / 987 / 1542 | 125.7 / 62.8 / 78.5 | 0 | 显示必须快，避免空档；透明度过冲会像闪了一下 |
| 内容视差 | 脱离后回零 | 0.22 | 1.0 | 816 | 57.1 | 0 | 吸附期间不单独设弹簧：translate = 强度 × 渲染偏移 |
| 可见度 v | 淡出 | 线性 120 / 150 / 300ms | — | — | — | — | 显示一律立即 |

编排（在 `timeScale = 0.25` 下确认）：吸附时外环约 0.125s 到达 Ø8 的峰值，填充层约 0.25–0.28s 才到达盛开峰值，指示先于装饰；脱离时外环约 0.15s 内恢复，填充层约 0.25s 才贴合回来，外环是家，填充层回家。

- **积分器**：自写半隐式欧拉，子步长 ≤ 1/240s（最硬的 k ≈ 3948，ω ≈ 63，ω·h ≈ 0.26，远小于稳定上限）。13 个标量通道的目标每帧都在变、切换时要注入速度、还要 `timeScale`，所以不用 Motion 的 `animate` / `useSpring`；帧调度仍交给 Motion 的 `frame`。
- **时间**：dt 取 `frameData.timestamp` 之差，不读 `frameData.delta`（motion-dom 把 delta 夹到 [1, 40]ms，并在唤醒后首帧给出默认的 16.67ms，用它做长帧检测永远不会触发）；从休眠唤醒的首帧 dt 取 1/60s 且不计入卡顿统计；物理 dt = `min(dt, 50ms) × timeScale`。分通道静止阈值：几何 |x − t| < 0.01px 且 |v| < 0.5 px/s，透明度与按压 |x − t| < 0.001 且 |v| < 0.01/s（统一的大阈值会让 α 停在差几个百分点的地方再跳到位）。
- **减少动态效果**（`prefers-reduced-motion: reduce`）：直接使用系统指针。去掉变形、偏移、拉伸与弹出之后剩下的只有一个跟手的圆和透明度切换，体验不如系统指针，所以 `MEDIA_QUERY` 里加上 `(prefers-reduced-motion: no-preference)`：CSS 隐藏规则与 JS 激活条件共用这一条查询，偏好在运行中切换时引擎立即退回 dormant 并摘掉属性，`useAdaptivePointerStatus().supported` 为 `false`。第一版实现过的减少动态效果表现（几何瞬时到位、60ms 原处淡出加 120ms 淡入）随之删除，`reducedMotion` 选项也一并移除。

### 5. 阻尼偏移公式

```ts
/** 偏移上限：板子短边的 14%，夹在 2–6px，再乘全局 parallax（0–2）与目标的 data-pointer-parallax（0–3） */
const offsetMax = (W: number, H: number, k: number) => clamp(0.14 * Math.min(W, H), 2, 6) * k;

/**
 * 阻尼偏移（橡皮筋双曲线），按轴独立。d 为指针相对板子中心的位移，half 为板子在该轴上的半宽。
 * 指针到达板子边缘（|d| = half）时为 0.6·max；中心斜率 1.5·max/half；越界后渐近 max。1.5 = REACH / (1 − REACH)，REACH = 0.6。
 */
function dampedOffset(d: number, half: number, max: number) {
  if (max <= 0 || half <= 0) return 0;
  const u = (1.5 * Math.abs(d)) / half;
  return Math.sign(d) * max * (u / (1 + u));
}
// O 的目标 = (dampedOffset(P.x − plate.cx, W / 2, max), dampedOffset(P.y − plate.cy, H / 2, max))
```

- **为什么是双曲线**：线性夹取在上限处有折角，手能感觉到撞墙；tanh 接近上限后几乎不再动；双曲线的尾巴长，桥接或按下后拖出时板子还会被缓慢拉长，是「可以拉一拉」的手感，与 HoneycombView 的越界橡皮筋同族。上限按短边算：宽目标的半宽大，中心斜率自动变小，不会因为目标宽就晃得更厉害。
- **量级**：38px 的 icon 按钮板，边缘偏移约 3.2px；中心附近指针移动 5px，板子移动约 1.5px，落在 Apple toolbar 级 3–6pt 的观察区间内。
- **拉伸**：`W_render = (base + SizeResidual + 0.5·|O_render.x|)·pressScale`（H 同理，`O_render = O·(1 − 0.75p)`）。中心随 O_render 偏移，靠近指针的一侧走得多、远侧只走「偏移 − 拉伸 / 2」，读成一张被指尖牵着的膜，而不是一块硬板在平移。拉伸只用视差不用残差，否则吸附途中几十 px 的残差会把板子拉宽；默认参数下最大约 3px。
- **按压**：只乘在弹簧输出上，不改弹簧目标，避免两级滞后让按下显得迟钝。highlight 尺寸取按下瞬间测得的板子：本仓库 Button 自带 0.97 的按压缩放，继续逐帧测量再乘 0.96 会被缩两次（约 0.93）。偏移 ×(1 − 0.75p) 向中心收拢；按下后拖出目标时 p 回到 0，外环恢复大圆，偏移沿双曲线被拉向指针（橡皮筋）。只认主键 `pointerdown` 与 `pointerup` / `pointercancel`，不认 `click`。
- **不做偏移**：hover、lift、text、pending（HIG 指出在大目标上做磁吸会显得突兀）。不做静止回中：网页无法移动真实光标，外环已经给出精确位置。

### 6. 目标识别与测量

- **6.1 默认选择器**：`DEFAULT_ADAPTIVE_POINTER_SELECTOR` 为 `a[href]`、`area[href]`、`button`、`summary`、`label[for]`、按钮类 input（button / submit / reset / image / checkbox / radio / file / range / color）、`role` 为 button / link / tab / menuitem / menuitemcheckbox / menuitemradio / option / checkbox / radio / switch / slider / treeitem / combobox 的元素，以及 `cursor-pointer` 类与内联 `cursor: pointer`。`data-pointer` 不放进选择器，查找时优先单独判断。不用计算样式 `cursor: pointer` 识别目标：组件生效后计算值全是 `none`。自定义 `selector` 按顶层逗号拆段（忽略括号与方括号内的逗号），逐段用 `CSS.supports("selector(<段>)")` 校验，结果按输入字符串缓存。
- **禁用**：`DISABLED = :disabled, [aria-disabled="true"], [data-disabled]:not([data-disabled="false"]), [inert], [inert] *`。禁用不是原生区：保持大外环和 idle 填充，诚实地表示不可点击。不注入 `:disabled { pointer-events: none }`：它会让卡片里禁用按钮上的点击落到卡片上并触发它，禁用控件上的 `title` 提示也会消失。shadcn Button 自带 `disabled:pointer-events-none`，命中落到父元素，自然表现为 idle。
- **禁用控件兜底**：原生 `<button disabled>` 依赖浏览器向禁用控件派发 pointermove。`pointerout` 的 relatedTarget 落在 `:disabled` 元素内、之后 120ms 没有任何指针事件，就给它写 `data-adaptive-pointer-fallback`（CSS 把它当原生区，叠加层随之隐藏）。这个标记是临时的，同时只保留一个，下一次事件不在它里面或它恢复可用时立即撤销；一旦观察到禁用元素上的 pointermove，就认定当前浏览器会派发，全局关闭兜底。
- **6.2 效果判定**，按顺序：显式 `data-pointer`（highlight / lift / hover）直接使用 → `input[type=range]` 为 hover（整条轨道太宽）→ 最近的 `data-pointer-default` 祖先（none 即 idle）→ 高 > `largeTarget.height`（96）或面积 > `largeTarget.area`（32000 px²）为 hover → 其余为 highlight。例：600×44 的行（26400 px²）为 highlight；900×56 的整行链接（50400 px²）为 hover；280×140 的卡片（高 > 96）为 hover；96×96 的图块（9216 px²，高不超过 96）为 highlight。
- **6.3 候选变化时读一次**：`getComputedStyle(target)` 的 `display`（是否 inline）、`borderTopLeftRadius` 原始字符串（尺寸变化时据此重新换算百分比）、`corner-shape`、`--sc-r`；三个覆盖属性；最多 6 个裁剪祖先（`overflow-x` / `overflow-y` 不为 visible，或 `contain` 含 paint / strict / content，到 Area 根或 body 为止）；组容器；内容视差子元素。
- **每帧测量**已吸附目标与当前候选：健康检查（`isConnected`、`data-pointer` 变为 none / native、匹配 DISABLED）；`getBoundingClientRect()`（包含祖先变换，缩放的预览卡也对；本组件从不变换目标本身，没有反馈环）；多行行内元素取 `getClientRects()` 中纵向范围包含 P.y（容差 2px）或最近的一段，跳过 0×0 片段（行内链接包着块级内容时首尾会有 0×0 的片段）；与裁剪祖先 padding box（`rect + clientLeft / clientTop`、`clientWidth / clientHeight`，天然排除滚动条）求交，可见部分任一轴 < 4px 视为丢失；组容器矩形。不用 ResizeObserver 驱动测量：它报告不了移动、变换和滚动，逐帧只读 1–8 个矩形开销很小。已知限制：read 阶段在同一帧 Motion 的 render 写入之前执行，由 Motion 逐帧驱动的目标板子落后一帧。
- **原生滚动条交还原生**：`P.x ≥ documentElement.clientWidth` 或 `P.y ≥ documentElement.clientHeight`（本站 `html` 常驻滚动条，这一条必不可少）；或 hit 可滚动（overflow 为 auto / scroll 且内容超出）且 P 超出它的 client 区域。Radix ScrollArea 的滚动条是 DOM 元素，按普通元素处理。
- **滚动**：document 捕获 `scroll`、window 捕获 `wheel`，设置 `scrollingUntil = now + 120ms`，期间每帧标脏、用 `elementFromPoint` 重新命中，外环每帧如实。已吸附的目标以滚动开始前一帧的位置为基准（scroll 事件先于本帧测量，本帧已包含第一步位移）：累计位移 ≤ 4px 且仍在热点下时保持吸附、刚性跟随；更大的滚动立即脱离，避免板子在合成器线程滚动面前慢一帧地游动，也与 UIKit 滚动时结束指针效果一致。
- **静止指针下的内容移动**：由 JS 驱动的移动（Motion 帧写入、HoneycombView 惯性）靠休眠轮询发现（8.2）；新元素出现在静止指针下方时与浏览器 `:hover` 一致，不主动吸附，下一次移动、轮询或调用 `refreshAdaptivePointer()` 时处理。
- **6.4 内容视差（默认开启）**：吸附到 highlight 目标时，参与移动的子元素有两种来源。① 显式：目标内部写了 `data-pointer-content` 的非按钮子元素（每个目标最多 4 个，且离它最近的目标必须就是这个目标），不受 `contentParallax` 开关影响。② 自动：没有显式子元素、`contentParallax` 开启、目标上没有写 `data-pointer-content="off"` 时，只处理「只有图标」的目标——子节点全是 svg / img（尺寸 ≤ 1px 的读屏专用文字忽略），没有可见文字，最多 2 个。图标与文字混排时只移动图标会让两者错开，所以不处理；Tabs、分段控件等文字按钮也不动。吸附期间 `translate = 强度 × 渲染偏移`（强度 0–1，默认 0.4，0.1px 精度），脱离后独立回零，同时回零的最多 4 个。元素自带 `translate`，或对 translate / transform / all 设置了时长大于 0 的过渡时跳过（显式标记的在开发环境警告）。首次写入前保存原内联值、回零后还原，并打 `data-ap-content-written` 标记供 HMR 清理。写的是按钮内部的子元素（svg），不是按钮本身，也不参与目标测量。
- **6.5 文本竖条（默认开启）**：`textBeam` 开启时，命中元素向上查找没有遇到目标、`data-pointer="none"` 或 `data-pointer="native"`，就把作用域根（Area 根节点；整页实例或浮层里为 `<body>`）当作文本区域做字符命中；关闭时只在 `data-pointer="text"` 区域内做。字符命中保证空白处、图片上、行尾空白处仍是圆。可编辑控件（input、textarea、contenteditable）始终交给原生 I-beam：IME、选区拖动、插入点定位需要像素级的原生反馈，原生 I-beam 也遵从系统的指针大小设置。
- **字符命中**：`caretPositionFromPoint`（没有时用 `caretRangeFromPoint`）得到文本节点与偏移；用 Range 取插入点后一个（行尾时取前一个）字符的矩形；纵向扩展到行盒（`line-height: normal` 按 1.2 × fontSize）；P 在扩展后的矩形内（横向容差 1px）才算命中，排除行尾空白处的「最近插入点」。父元素 `user-select: none`、竖排文字（`writing-mode` 为 vertical 系列）、Shadow DOM 内或 API 不可用时退回圆形。
- **几何**：竖条宽为偶数个设备像素（约 2px），高 `clamp(round(字符高), 10, 48)`；纵轴锚点为字符矩形中心，换行由外环纵向残差吸收（T 0.14、ζ 1）；横轴 1:1。换行迟滞比较的是按上一行字符重新测量的几何，滚动或重排后不会沿用过期的视口坐标。竖条渲染宽度小于 `2·bw + 1`（盒子看起来已是实心）时，离散地换成 `border-width: 0` 加 `background: var(--ap-ring)` 的实心条，切换不可见；不能保留描边，border-box 的盒子不会窄于两侧描边之和，2px 的竖条会被撑成 4px 并偏向热点右侧。

### 7. 原生指针的隐藏与恢复

#### 7.1 唯一的隐藏机制

```css
@media (hover: hover) and (pointer: fine) and (forced-colors: none) {
  /* 隐藏：作用域根自身与子孙，排除原生区及其子树 */
  [data-adaptive-pointer="on"]:not(NATIVE_MATCH),
  [data-adaptive-pointer="on"] :not(NATIVE_MATCH, NATIVE_ANCESTOR_MATCH *) { cursor: none !important; }
  /* 修复继承：结构性原生宿主没有作者光标声明时显式恢复 auto（整条选择器优先级为 0） */
  :where([data-adaptive-pointer="on"] :is(NATIVE_HOST)):not(:where([class^="cursor-"], [class*=" cursor-"], [style*="cursor"])) { cursor: auto; }
}
@media print, (forced-colors: active) { [data-adaptive-pointer-overlay] { display: none !important; } }
::view-transition-old(qiuye-adaptive-pointer) { display: none; }
::view-transition-group(qiuye-adaptive-pointer), ::view-transition-new(qiuye-adaptive-pointer) { animation: none; }
```

| 片段 | 内容 | 允许的位置 |
| --- | --- | --- |
| `NATIVE_HOST` | `[data-pointer="native"]`、`[data-adaptive-pointer-area="off"]`、`[data-adaptive-pointer-fallback]`、`[data-adaptive-pointer-native]`、非按钮类 input、textarea、select、contenteditable、iframe、embed、object、带 controls 的 video / audio、`dialog:modal`、`:popover-open`、html / body 以外的 `:fullscreen` | 主体与后代组合符左侧 |
| `CURSOR_TOKEN_HOST` | 不带变体前缀的 Tailwind 光标类（类名以 `cursor-` 开头或包含「空格 + cursor-」），排除 `cursor-pointer` / `cursor-default` / `cursor-auto` | 只在主体位置 |
| `INLINE_CURSOR_HOST` | 内联样式里写了 cursor（React 序列化为「cursor: pointer;」），排除 pointer / default / auto | 只在主体位置 |
| `CURSOR_CLASS_HOST` | 显式列出的 33 个语义光标类：`.cursor-grab`、`.cursor-grabbing`、`.cursor-crosshair`、`.cursor-text`、`.cursor-not-allowed`、`.cursor-zoom-in`、`.cursor-move`、`.cursor-help`、`.cursor-wait`、各方向的 resize 等 | 后代组合符左侧 |

`NATIVE_MATCH = :where(NATIVE_HOST, CURSOR_TOKEN_HOST, INLINE_CURSOR_HOST)`，`NATIVE_ANCESTOR_MATCH = :where(NATIVE_HOST, CURSOR_CLASS_HOST)`。要点：

- **`!important`** 压过 Tailwind utilities 层里的 `cursor-pointer`、浏览器内置的链接 `cursor: pointer` 与非 important 的内联样式。
- **语义光标不靠优先级保留，靠排除**：`cursor-grab`、`cursor-crosshair`、`cursor-zoom-in`、`cursor-not-allowed`、`cursor-text`（作者明确写的 I-beam 也算语义光标）、自定义图片光标等交还原生；`cursor-pointer` / `cursor-default` / `cursor-auto` 是通用光标，由叠加层取代。本仓库 HoneycombView 根节点的 `cursor-grab`、ImageViewer 的 `cursor-zoom-in`、ColorPicker 的 `cursor-crosshair` 因此自动保留。只识别不带变体前缀的词：`data-disabled:cursor-not-allowed` 这类写法要手动加 `data-pointer="native"`；shadcn 菜单项与 Select 项上的 `cursor-default` 是通用光标，仍然是目标。
- **后代组合符左侧不放子串属性选择器**：`[style*="cursor"]`、`[class*=" cursor-"]` 这类选择器一旦出现在后代组合符左侧，Blink 会按 `style` 与 `class` 属性建立整棵子树的失效集，任何元素改一次内联样式或类名（Motion 每帧写 `style.transform`、hover 切换类名）都会重算它的整棵子树，而且与是否在作用域内无关。所以后代分支只用 `NATIVE_HOST` 与显式列出的光标类（类选择器只在该类本身增删时失效）。内联光标与方括号写法的任意值光标类由引擎补位：命中第一次落在这类宿主下时，在 render 阶段给宿主写 `data-adaptive-pointer-native`（属于 NATIVE_HOST），它的子孙随之交还原生；补写之前那一帧按 JS NATIVE 预判。
- **宽容解析**：`:where()` / `:is()` 是宽容的选择器列表，旧浏览器不认识 `:popover-open` 只会忽略那一项；`:not()` 不宽容，所以列表都包在 `:where()` 里再放进 `:not()`。JS 侧匹配抛错时退回去掉 `:popover-open` 的版本。CSS 与 JS 用同一个媒体查询：浏览器不认识 `forced-colors` 时两边同时判定为不满足，不会出现「CSS 隐藏了原生指针、JS 却没有画叠加层」。

**7.2 继承陷阱（QIUYE-UI-PIT-0013）**：`cursor` 是继承属性。只把原生区从 `cursor: none` 规则里排除，并不能让它恢复原生指针：没有自己 cursor 声明的元素会从被隐藏的祖先继承 `none`。实测 contenteditable、`[data-pointer=native]` 宿主及其子孙、打开的 `<dialog>` 及其子孙都会算出 `none`，而叠加层恰好在原生区隐藏，于是用户在这些地方一个指针都没有。`revert-layer` / `revert` 同样回落到继承，仍然是 `none`。7.1 的第二条规则把结构性宿主显式恢复为 `auto`，子孙随之继承 `auto`；带作者光标类或内联光标的宿主用它自己的声明；整条规则优先级为 0，作者自己写的普通 CSS 一定能覆盖它。

**7.3 计算 cursor 是唯一事实来源**：叠加层是否可见只看 `getComputedStyle(hit).cursor === "none"`，外加作者隐藏与滚动条两项检查（iframe 由 `pointerout` 处理）；计算样式对象按元素缓存，每帧读 `.cursor`，read 阶段样式通常已经是干净的。原生区、作用域外、顶层元素、使用方的 `!cursor-pointer`（分层的 important 会压过本规则）、浏览器扩展注入的样式，都会算出非 `none` 的值，于是叠加层隐藏、原生指针照常显示。JS 与 CSS 判断不一致时，结果只会是「原生指针可见、叠加层隐藏」或「原生指针隐藏、叠加层可见」，不会两者都没有。只有属性还没写上的那一帧用 JS NATIVE 选择器预判：激活首帧、新借出宿主的首帧、新补写光标宿主的首帧。

**7.4 激活握手**：激活后的下一帧检查三项。

| 检查 | 失败的含义 | 处理 |
| --- | --- | --- |
| 作用域根的计算 cursor 为 `none`（依次取当前作用域、最新的整页实例、任一启用的作用域；根本身匹配 NATIVE 时跳过） | 样式表没有加载、选择器不受支持，或被扩展用 `!important` 覆盖 | 摘属性、隐藏叠加层，本会话不再激活，开发环境警告 |
| 叠加层根的矩形等于视口（容差 1px） | body 带了 transform / filter / perspective / contain 等，成了 fixed 的包含块 | 改挂到 `<html>` 末尾再查一次，仍然失败则交还原生 |
| 叠加层 `isConnected` | 被 React 19 的 body 处理或第三方脚本移除 | 重建一次，再次断开则交还原生 |

body 的 `style` / `class` 变化（Radix 会改写 body 样式）时重新握手；body 新增的子节点若在叠加层之后、已定位且 `z-index` 同为 2147483647，就把叠加层重新追加到末尾，2s 内最多 5 次，超过就停止并警告（普通 Radix Portal 是 z-50，不会触发）。

### 8. 渲染与性能

- **8.1 DOM**：叠加层由引擎命令式创建，不走 React Portal，不存在水合问题；结构性样式全部内联，样式表缺失时也不影响页面布局。根节点 `position: fixed; inset: 0; z-index: 2147483647; pointer-events: none; contain: strict`，支持时带 `view-transition-name: qiuye-adaptive-pointer`。两个图层都是无类名、无子元素的 div（先填充层、后外环），样式规则匹配不到它们，也不依赖 `inherit`（规避 PIT-0010）；填充层 `contain: strict`，外环只 `contain: layout style size`（避免外侧晕边被裁掉）；都带 `will-change: transform, opacity`。写 `width` / `height` 而不用 `scale`：缩放会让描边变细，填充层的圆角也要逐帧反向修正。叠加层不可见且所有弹簧静止后，根节点设为 `visibility: hidden`，跳过合成。
- **每帧读写**：read 阶段做命中（标脏、按下、滚动时用 `elementFromPoint`）、读命中元素的计算 cursor、已吸附目标与候选的 gBCR、裁剪祖先与组容器矩形、文本区域的 caret API 与 1–2 次 Range 矩形，离散地读令牌与候选目标的计算样式；update 阶段跑状态机与 13 个弹簧通道（加上内容视差，60Hz 时每帧 4 个子步）并计算输出；render 阶段写离散属性（作用域与借出宿主、补写的光标宿主、`data-pointer-state` / `-pressed`、令牌变量、根节点 visibility），fill 的 `transform: translate3d`（两位小数，静止圆按设备像素对齐）、`width`、`height`、`border-radius`、`opacity`（三位小数），ring 的 `transform`、`width`、`height`、`opacity` 与离散的 `border-width`、竖条底色，以及内容视差子元素的 `translate`。
- **帧循环**：读写严格分阶段，每个属性缓存上次写入的字符串、没变就跳过，永远不逐帧写使用方的 `<button>` 本身。帧循环用 Motion 的 `frame.read / update / render(fn, true)`，休眠时 `cancelFrame` 三次：与页面上其他 Motion 使用方（HoneycombView、ExpandableCard、各种 `motion.*`）共用同一套批次，读取都排在所有写入之前，不会互相逼出强制同步布局。
- **事件**：处理函数只记录坐标、`timeStamp`、`composedPath()[0]`、`buttons` 与速度 EMA，然后调用幂等的 `wake()`；全部 passive，永不 `preventDefault`、永不 `setPointerCapture`，不影响 HoneycombView 等组件的拖动捕获（与 PIT-0011 无关）。监听：window 捕获 `pointermove / down / up / cancel`、`keydown`、`wheel`、`dragstart / dragend / drop`、`contextmenu`，以及 `blur`、`resize`、`pagehide`；document 的 `pointerout`、`scroll`（捕获，覆盖嵌套滚动容器）、`visibilitychange`、`pointerlockchange`、`fullscreenchange`、`transitionrun / animationstart`（只在事件目标包含已吸附目标时唤醒）；`visualViewport` 的 `resize`；支持条件、减少动态效果与对比度三条 `matchMedia`；MutationObserver 观察 html 的 class / style / data-theme 与 body 的 class / style / childList。`devicePixelRatio` 每帧读取，页面缩放、换显示器后描边与直径自动重新取整。
- **8.2 休眠条件**：本帧没有移动；不在握手与滚动静默期；没有处于意图延迟内的待吸附或限时桥接（隐藏期间不算，恢复必然伴随新的移动）；没有待生效的松手；已吸附时距最后一次移动满 1s（期间继续逐帧跟随目标的过渡动画）；内容视差已回零；所有通道静止。
- **轮询**：休眠期间叠加层可见时每 250ms 检查一次已吸附目标或待吸附候选的矩形、上次命中元素的计算 cursor，有变化就唤醒并标脏；距最后一次指针活动超过 10s 后停止；标签页隐藏时一律休眠、不轮询。未激活或已隐藏时，scroll / wheel 只记录静默期、不唤醒循环，隐藏期间的帧也不做命中。`autoHide` 在帧循环运行时于帧内判断，休眠后由定时器负责。
- **8.3 React 层**：两个组件都只渲染 `<style href="qiuye-adaptive-pointer" precedence="default">`，Area 再加一个 div 或 `Slot.Root`，带静态的 `data-adaptive-pointer-area`。选项在 effect 中写入引擎，依赖是基本类型的 props 与 `largeTarget` 的两个值；`onStateChange` 存在 ref 里，不作为依赖。交互全程零 React 渲染。
- **SSR**：模块顶层不访问 `window` / `document` / `CSS`；`data-adaptive-pointer="on"` 永远不出现在 SSR 输出里，JS 失败时页面就是原生指针；叠加层在水合后的 effect 里创建，激活还要等第一次合格的鼠标移动，自然避开水合期间的长任务。
- **StrictMode 与 HMR**：注册按 `useId()` 幂等。引擎创建时先清理残留的叠加层、`data-adaptive-pointer`、`data-pointer-state`、`data-pointer-pressed`、fallback / native 标记与写过的内容 `translate`：`view-transition-name` 在页面内必须唯一，重复会让使用方的 View Transition 整体失败，所以这一步是硬要求。多份模块拷贝用 `window[Symbol.for("qiuye.adaptive-pointer")]` 登记，新引擎先接管旧引擎。严格 TS 兼容：`import * as React from "react"`，开发期判断用 `declare const process` 加 try/catch（PIT-0007），不用 `next/*`、不用 styled-jsx。
- **预算**：中端笔记本上移动时每帧脚本 ≤ 0.3ms（4× CPU 降速下 ≤ 1.2ms）；移动帧的 `UpdateLayoutTree` 远小于 1ms；移动期间 React 提交 0 次；静止休眠后没有帧回调，只剩 ≤ 10s 的 250ms 轮询；激活或退回原生时整页重算样式各一次，hover 期间不重算整页样式。实测见文末。

### 9. 安全网

> **不变式**：作用域带 `data-adaptive-pointer="on"`、且命中元素的计算 cursor 为 `none` 时，叠加层必须已连接、坐标系正确，并且要么可见，要么处于「下一次移动立即显示」的暂停态。**推论**：用户只要移动指针，最多 1 帧内一定能看到叠加层或原生指针中的一个。

| 我们的代码可能来不及运行的情况 | 处理 |
| --- | --- |
| 进入 iframe；原生拖放、右键菜单、颜色 / 文件选择器、指针锁定、中键自动滚动 | CSS 恢复 iframe 的 cursor；由系统画指针的场景叠加层立即隐藏，按第 3 节各自的条件恢复 |
| 拖放源在拖动中被移除（dragend 送不到 window）；松手丢失（和弦按键、在 mousedown 里弹出 `confirm()`、按住时切走窗口） | 拖放期间浏览器不派发指针事件，所以之后第一次没有主键的 pointermove 视为拖放已结束；任何事件的 `buttons` 已不含主键时补一次松开 |
| 运行时异常 | 所有事件处理函数与帧回调都包 try/catch；出错调用 `fail()`：摘掉全部属性、移除叠加层与监听，本会话不再激活，开发环境 `console.error` |
| 主线程长任务（软件指针的固有问题：叠加层冻住，系统光标照常移动） | 卡顿熔断：只在叠加层可见、且前后两帧都有指针移动时统计帧间隔，10s 内 3 次 > 250ms 就交还原生指针，冷却 30s 后可再激活；本会话熔断 3 次后不再激活 |
| 样式表缺失或被覆盖、body 带变换、叠加层被移除、同为最大层级的遮挡；触屏、笔、捏合缩放、强制颜色、打印 | 握手与重新追加（7.4）；交还原生，强制颜色与打印时叠加层 `display: none` |
| 页面 View Transition（本站 ThemeTransitionToggle 调用 `startViewTransition`） | 叠加层是独立的转场分组：旧快照隐藏，新快照与分组不加动画，不冻在根快照里。转场期间浏览器不做真实命中（QIUYE-UI-PIT-0016）：Chromium 把指针事件全部派发给 `<html>`，整页实例下叠加层以 idle 实时跟随，局部 Area 下交给原生箭头；转场结束时只补发边界事件，离开 `<html>` 的 pointerout 触发重新命中，静止的指针也立即恢复。WebKit 转场期间不派发指针事件，第一次移动时收到 relatedTarget 为 null 的 pointerout 就交还原生指针，下一次移动重新激活 |

## 边界情况

| 场景 | 行为 |
| --- | --- |
| 触屏、笔、二合一设备来回切换；iPad 外接触控板（报告为 coarse）、只有 any-hover 成立的设备；不可信的合成事件 | 按每个事件的 `pointerType`：touch / pen 立即退回 dormant 并摘属性，下一次合格的鼠标移动重新激活，触屏后的兼容鼠标事件被过滤；只看主输入，coarse 设备不激活，避免两个指针；伪造的事件被忽略 |
| 禁用控件（`:disabled`、`aria-disabled`、Radix `data-disabled`、`inert`） | 不是目标，保持大外环和 idle，并停止向上查找；不注入样式；不派发事件的浏览器走临时兜底 |
| 嵌套目标（卡片上的按钮）；相邻目标、工具栏缝隙、高速扫过一排按钮 | 最内层生效，卡片 hover 与按钮 highlight 直接切换（进入按钮按 attach，回到卡片按 detach，尺寸残差把板子收成 Ø36 圆）；相邻目标直接滑行，板子最多落后一个按钮，外环逐个缩放形成一串卡位感，组内不限时桥接、组外 80ms |
| 折行的行内链接 | 板子贴合指针所在的那一段，换段时滑行；按下后换段，按压尺寸跟着换成新段的板子 |
| 被滚动容器裁掉一部分的目标；指针不动而内容滚动（滚轮、键盘、程序滚动、嵌套容器、Lenis） | 与 ≤ 6 个裁剪祖先求交，渲染矩形也夹在容器内；外环每帧如实，≤ 4px 的滚动保持吸附并刚性跟随，更大的滚动脱离，120ms 静默后重新吸附 |
| 悬停中的目标移动、缩放或被移除；祖先带缩放或变换（首页的 `motion.article` 预览卡） | 锚点刚性跟随（Motion 驱动的目标落后一帧，静止后靠轮询与 transitionrun / animationstart 唤醒）；每帧检查 `isConnected`，被移除时立即从最后的矩形脱离；gBCR 给出视觉矩形，叠加层挂在 body 上不受祖先变换影响 |
| Radix 浮层（DropdownMenu、Select、Popover、Tooltip、Dialog） | 层级高于 z-50；局部作用域通过 claim 和借出宿主覆盖。模态浮层打开期间，局部模式下浮层外的命中落在 `<html>`，显示原生箭头（那里本来也点不了）；整页模式下显示 idle。菜单项自带高亮时在 Content 上写 `data-pointer-default="hover"` |
| 原生 `<dialog>.showModal()`、popover、全屏 | 位于顶层，叠加层画不上去，交还原生指针，cursor 已显式恢复为 auto；html 或 body 全屏时叠加层就在全屏树里，正常工作 |
| iframe、原生滚动条、输入框、文本域、contenteditable、select；颜色、文件输入 | 交还原生指针（I-beam 或箭头），cursor 已显式恢复；颜色与文件输入是目标，按下后隐藏，直到下一次移动（系统弹层画系统指针） |
| 作者的语义光标、故意隐藏光标（`cursor-none`，视频播放中）；使用方的 `!cursor-pointer`、扩展或拖动库注入的 `!important` 光标 | 不带变体前缀的 Tailwind 类、内联样式与任意值类自动交还原生，带变体前缀的写法加 `data-pointer="native"`；故意隐藏时叠加层也隐藏；`!important` 一方优先，计算 cursor 不为 none，叠加层自动隐藏，不会出现两个指针 |
| 拖选文字、按下后拖出按钮、快速点击、与移入同一帧按下 | 拖选是 idle 按压态，划过链接时外环保持大圆；拖出按钮时目标冻结，外环恢复大小提示「此处松手不会点击」，按压视觉回弹，板子朝指针被拉长；按压视觉至少保持 80ms，同一帧移入并按下时先吸附或滑行再冻结 |
| 滑块拇指、带指针捕获的拖动、dnd-kit | 按下期间用 `elementFromPoint` 判断外环；锚点刚性跟随被拖动的元素；拖出 Area 时不借出无关的宿主 |
| 指针离开窗口、窗口失焦、标签页隐藏、bfcache | 离开与失焦 120ms 淡出，回来时瞬移并弹出，离开前排队的 move 不会让它立刻回来；隐藏时立即隐藏并休眠。Safari 偶尔漏发 leave，最多在边缘留一个残影，下一次移动即修正 |
| 键盘导航、读屏 | 按键时淡出（可配置）；`:focus-visible` 原样保留，从不吸附到获得焦点的元素；叠加层 `aria-hidden`，没有可聚焦内容与 live region |
| 页面缩放、DPR 变化、多显示器、双指捏合缩放；高刷屏、Safari 60Hz 上限、低电量模式 | 坐标使用 CSS px，每帧读 DPR 重新取整；`visualViewport.scale ≠ 1` 期间交还原生，回到 1 后重新激活；弹簧按真实 dt 积分，手感一致，软件指针比硬件光标晚 1–2 帧属于平台限制 |
| 开放的 Shadow DOM；多个实例、嵌套作用域、首页多张预览卡 | 用 `composedPath()[0]`，沿 host 向上查找，`elementFromPoint` 逐层进入 shadowRoot，作用域包含判断也穿过 shadow 边界，封闭的 Shadow DOM 只能识别到宿主；单例引擎只有一套叠加层 DOM，最内层作用域的配置生效 |
| 远程桌面、录屏、系统指针大小与颜色等辅助设置 | 读不到；提供 `size` / `ringWidth` / `disabled`，建议应用提供「使用系统指针」开关，Demo 中示范 |

## Demo

文件 `components/qiuye-ui/demos/adaptive-pointer-demo.tsx`，导出 `AdaptivePointerDemo` 与 `AdaptivePointerPreview`，组织方式与 `honeycomb-view-demo.tsx` 相同。作用域策略：站点不在 `app/layout.tsx` 中挂整页实例，导航、搜索、代码块与详情页其余部分都保持原生指针；每张卡片的 `ViewSourceButton` 放在 Area 之外，源码 Dialog 里读、选代码时是原生 I-beam；控制面板放在 Area 内，用户用这套指针调节它自己。`supported === false` 时在主卡片顶部提示需要鼠标或触控板、触屏设备保持原生行为，控件照常可用。

**卡片一：交互实验台**（`lg` 起两栏：场景网格 + 17rem 的控制面板）

| 场景 | 内容 | 演示点 |
| --- | --- | --- |
| 工具栏 | `role="toolbar"`、`gap-0.5`，8 个 ghost icon 按钮（加粗 / 斜体 / 下划线为切换按钮），中间一条分隔线 | 滑行不回缩、组内缝隙桥接而外环立即恢复、内容视差、去掉重复的 hover 背景 |
| 分段与标签 | shadcn `Tabs` 与仓库的 `SegmentedControl` | tablist / radiogroup 自动成组，板子贴合 radix-nova 的激活项 |
| 正文与链接 | 段落中两个链接，其中一个刻意折行；段落本身不写任何属性，竖条由 `textBeam` 控制 | 行内外扩 4×2、按段贴合并滑行；竖条按行吸附、行尾空白恢复圆形 |
| 按钮与控件 | Button 的 default / outline / secondary / ghost / link；显式 lift 的「发布」；`disabled`、`aria-disabled` 与原生 `<button disabled>`；Switch、RadioGroup、原生复选框、Slider | 不透明按钮的光边底座、SmoothCorners 的 ÷1.6 圆角、禁用保持大外环、lift 示例 |
| 大卡片 | 两张高 128px 的链接卡片，其中一张叠放两个 icon 按钮（与链接是兄弟节点，不嵌套交互元素） | 自动判定 hover（Ø36 柔和圆 + Ø8 外环），hover 与 highlight 直接切换 |
| 表单与原生区 | Input、Textarea、不带光标类的 `data-pointer="native"` 虚线框、`cursor-crosshair` 画板、`srcDoc` iframe（固定浅色 color-scheme，避免深色站点下被浏览器垫一层白底） | 原生 I-beam、继承修复、语义光标保留、iframe 交还系统指针 |
| 浮层 | DropdownMenu（含禁用项，Content 写 `data-pointer-default="hover"`）、Select（同样）、Dialog、带 Tooltip 的 icon 按钮；用 Motion 往返移动的按钮（外层预留平移距离，不盖住邻居）、点击后移除自己 1 秒后恢复的按钮 | claim 覆盖 Portal、浮层内隐藏原生指针；刚性跟随与轮询；`isConnected` 检查 |
| 滚动列表 | `ScrollArea`（`h-44`）里 16 行整宽按钮，显式 `pointerTarget({ effect: "highlight" })`（宽屏下整行面积会超过大目标阈值） | 板子与容器求交、不溢出；滚动中外环如实、板子脱离，静默后重新吸附 |

控制面板：启用（示范「使用系统指针」偏好，状态写入 `localStorage`）、外环定位（关闭即经典单层）、偏移强度 0–2（步长 0.1）、指针直径 14–28（步长 2）、外环小圆 4–12（步长 2）、描边宽度 1–3（步长 0.5）、内容视差、正文 I 形竖条、静止 2 秒后隐藏、慢动作 ¼、恢复默认，默认值与组件一致（单层、内容视差、正文竖条、静止 2 秒后隐藏）；外环关闭时「外环小圆」「描边宽度」两个滑块置灰；面板底部说明系统开启「减少动态效果」时改用系统指针。状态读数订阅 `onStateChange`，显示形态、目标名（依次取 `aria-label`、`textContent` 前 16 字、`tagName`）与「按下」；另有一个浮在视口底部的读数，只在指针位于实验台内时出现，滚到下方场景时也能看到。

**卡片二：经典单层 vs 双层**：两个并排的 Area，内容都是同一条 4 按钮工具栏加一个链接，左边为默认的经典单层、右边 `ring`；在同一个按钮上缓慢移动，右边还能看见指针落在按钮的哪个位置。**卡片三：主题与品牌色**：`className="dark"` 的局部深色岛（令牌按区域重新求值），以及覆盖 `--adaptive-pointer-fill` / `--adaptive-pointer-ring` 的品牌色 Area。**快速预览** `AdaptivePointerPreview`：4 按钮工具栏（默认内容视差）、日 / 周 / 月 Tabs 与一行带链接的提示，作用域只限于预览区；首页在 `home-component-preview-config.ts` 中 HoneycombView 之后以 `wide`、`featured` 加入，详情页经 `simple-demos.tsx` 再导出为 `AdaptivePointerSimpleDemo`。

站点注册：`lib/component-constants.ts`（`ADAPTIVE_POINTER` 与基础用法，导入块包含用到的 `Button` 与 `BoldIcon`）；`lib/registry.ts`（`category: "视觉与动效"`、`dependencies: ["motion", "radix-ui"]`、`version: "1.0.0"`，propsInfo 分整页、局部、`pointerTarget()` 选项、目标 data 属性四组）；组件详情页 `page.tsx` 的 `demoComponents` 与 `simpleDemoComponents`；`public/registry/adaptive-pointer.json`；MCP 的 `DEFAULT_COMPONENT_NAMES`；`AGENT.md` 与 `README.md` 的组件清单。为了让 Demo 的滑块有无障碍名称，`components/ui/slider.tsx` 把根节点的 `aria-label` / `aria-labelledby` 转给 Thumb（`role="slider"` 在 Thumb 上）。

## 验收清单

- **视觉（浅色 / 深色）**：各状态的尺寸与透明度符合第 1 节的表格；外环在白底、黑色 primary、深色主题下的白色 primary、彩色按钮、照片上都清晰；DPR 1 / 1.25 / 1.5 / 2 下描边分别为 2 / 2 / 2 / 3 个设备像素，静止时小圆的孔以热点为中心、没有亚像素模糊；SmoothCorners Button 的板子圆角为 13（不是接近胶囊的 20）；`.dark` 岛与品牌色 Area 的令牌正确。
- **手感（`timeScale = 0.25`）**：吸附时外环先于填充层到位，脱离时填充层贴合回外环；相邻按钮之间直接滑行、高速扫过工具栏不闪；组外桥接不超过 80ms，组内缝隙中板子留在原处、外环恢复 Ø20；中心附近指针移动 5px 板子移动约 1.5px，边缘处约 0.6·D，没有拐点；按下 100ms 内有反馈、松开有回弹，本站 Button 上板子不会被缩两次；按下后拖出按钮时外环恢复、板子被拉长；文本竖条换行无跳变，行尾空白处不显示竖条。
- **诚实性**：逐帧检查缝隙、滚动、按下拖出、pending 场景，外环缩小当且仅当本帧热点下是可用目标（按下时当且仅当热点在冻结目标内）；外环中心与真实热点的偏差在亚像素以内。
- **原生指针（逐项断言计算 cursor）**：激活后 contenteditable 及其子元素、不带光标类的 `data-pointer="native"` 宿主及其子元素、`showModal()` 打开的 `<dialog>` 及其按钮、input / textarea / select、`cursor-crosshair` 画板、iframe 的计算 cursor 都不为 `none`，屏幕上是原生指针、叠加层隐藏；禁用按钮计算为 `none`，叠加层可见并显示 idle（Chrome、Firefox、Safari 都要验证事件派发与兜底）；没有 JS、触屏、强制颜色、作用域外、滚动条上都是原生指针；任何时刻都不出现两个指针或没有指针（单帧切换除外）；人为抛出异常后原生指针立刻恢复、属性与 DOM 全部清除；给 body 加 `transform` 后叠加层改挂 html 且位置正确；主题切换的 View Transition 期间指针实时跟随。
- **稳健性**：触屏点一下后转为原生，再动鼠标恢复；局部 Area 内的 DropdownMenu、Select、Dialog、Tooltip 浮层内显示自适应指针，ViewSourceButton 的源码 Dialog 内是原生 I-beam；卸载或切换路由后没有残留的属性、内联样式、监听或定时器；HMR 多次保存后页面上只有一个 `[data-adaptive-pointer-overlay]`。
- **性能**：在 Chromium 中用 CDP `Input.dispatchMouseEvent` 扫过工具栏（不要用 Playwright 的 `page.mouse`，PIT-0010），移动帧 `UpdateLayoutTree` 远小于 1ms、React 零提交、静止并休眠后没有帧回调；在大容器里写一次内联样式或切换一次类名，有无组件 CSS 的样式刷新耗时在同一量级。
- **兼容**：安装到 `shadcn init -t vite` 的严格 TS 项目，`npx tsc -b` 通过（PIT-0006 / 0007）；`pnpm lint`、`pnpm build`（静态导出）通过；`/components/adaptive-pointer` 的快速预览、完整 Demo 与 API 表同页正常；registry 内容与源码一致。

## 实施与验证记录（2026-10-19）

与设计相比的调整：

- **竖排文字不画竖条**：`writing-mode` 为 vertical 系列时字符命中直接放弃，退回圆形，没有实现设计中的宽高互换。
- **激活放在帧内**：设计要求在事件任务里同时显示叠加层并写属性。实现中事件处理只记录数据，激活在下一帧的 read 阶段判定，作用域属性与叠加层在同一个 render 里写入；原生指针消失与叠加层出现落在同一帧，这一帧的可见性按 JS NATIVE 预判。
- **快速点击的按压视觉至少保持 80ms**：否则按下与松开落在同一帧，看不到任何反馈。
- **按下时先吸附再冻结**：pending 期间按下，或移入目标与按下落在同一帧（非对齐的 pointerdown 会先冲刷排队的 move）时，先完成 attach 或 slide 再冻结该目标。第一版在这种情况下冻结不到任何目标，还会把已有的板子收回圆形。
- **缝隙里按下不冻结**：热点不在目标上时按下不冻结任何目标，没有冻结目标的按压期间外环保持大圆，拖选文字划过链接时不会误报「可点击」。
- **隐藏规则的后代分支只用 `NATIVE_HOST` 加显式列出的 Tailwind 光标类**：设计稿把内联光标与光标类的子串属性选择器放在后代组合符左侧，结果任何元素改内联样式或类名都会重算整棵子树（在 3300 个后代的容器上实测单次写入约 7ms，修复后 0.02ms）。内联光标与方括号写法的任意值光标类宿主改由引擎在运行时补写 `data-adaptive-pointer-native`。
- **关闭的 Area 的浮层写 `data-adaptive-pointer-area="off"`**：在整页实例下，它打开的菜单与对话框显示原生指针；第一版在这里既没有原生指针也没有叠加层。
- **借出更保守**：拒绝包含任何作用域根的宿主（应用外壳、`#root`、外壳里的 Portal 插槽），并且只认命中元素就是事件目标的 claim，指针捕获拖动越出 Area 时不会把外壳借走。
- **禁用控件的兜底标记是临时的**：同时只保留一个，指针离开或控件恢复可用时立即撤销；第一版永久保留，控件恢复可用后再也拿不到板子，集合还会持有已移除的节点。
- **颜色令牌用 `CSS.supports` 校验**，失败时试 `hsl()` 包裹（Tailwind 3 只写通道的令牌），再退回默认值。
- **只有隐藏之后的移动才能恢复显示**（移动计数器）：第一版任何指针事件都能立即撤销 picker / menu / leave 等隐藏，指针会在系统菜单或窗口边缘重新弹出。
- **`autoHide` 也在帧内判断**：第一版只在休眠时设定时器，悬停在目标上时要等约 1s。
- **Area 根节点变化时重新登记**（`asChild` 子元素换了类型或 key、切换 `asChild`）。
- **只有最新的整页实例写 `<html>`**：第一版较早的启用实例会让 `<html>` 保持隐藏，而最新的关闭实例又让叠加层不画，整页没有指针。

评审中确认的其余问题也已修复（摘要）：

- 引擎：和弦按键或被 JS 对话框吞掉的松手由 `buttons` 位掩码补一次释放；隐藏期间的待吸附 / 限时桥接、始终不健康的候选不再阻止休眠，轮询也比对候选矩形；文本换行迟滞改为重新测量上一行；文本竖条 → 链接按 attach 处理（第一版按 slide 带满速度，冲出 7–15px）；未激活期间的点击不会在激活后补成一次按压；滚动脱离以滚动前一帧为基准；脱离时把拉伸与裁剪量并入尺寸残差；按下期间换段时按压尺寸跟随；减少动态效果补上 60ms 的原处淡出，按压只改透明度；行内链接跳过 0×0 片段；未激活或隐藏时滚动不唤醒循环。
- 安全：中键自动滚动只计松开后 300ms 内的页面滚动，`held` 随 `buttons` 清除，退出自动滚动那次点击的 pointerup 也算；拖放源被移除时靠无主键的移动结束拖放；作用域包含判断穿过 Shadow DOM；握手只检查仍启用的作用域；所有作用域都关闭时退回 dormant。
- API：回调 ref 保留 React 19 的清理函数；`data-pointer-group="off"` 能关闭按角色成组，组容器限定在作用域内；JSDoc 与 registry 写明 `pointerTarget()` 等只能在客户端组件调用；令牌覆盖位置的说明改为 `:root` / `.dark` / `.dark` 岛 / Area 根；基础用法补上 `Button` 与 `BoldIcon` 的导入。
- Demo：ghost 按钮的 hover 重置补上 `dark:` 版本；切换按钮的按下态悬停时保持底色；滚动列表行显式 highlight；大卡片改为链接卡片加叠放的兄弟按钮；iframe 固定浅色 color-scheme；往返移动的按钮预留平移距离；滑块 Thumb 与单选组补上无障碍名称；状态读数增加浮动版本；大卡片说明改为「高 128px，超过 96px」。

验证（headless Chromium，经 CDP 发送可信的鼠标事件，模拟关闭减少动态效果）：

- 外环中心与真实热点的偏差：所有记录帧 ≤ 0.32px。
- 场景检查 20/20：输入框、`data-pointer="native"`、`cursor-crosshair`、iframe 上是原生指针且叠加层隐藏；shadcn、原生、`aria-disabled` 三种禁用都保持大外环；lift；大卡片为 Ø36 柔和圆 + Ø8 外环；折行链接按段贴合；Area 内的 Radix DropdownMenu 经借出宿主隐藏原生指针；键盘隐藏与恢复；ScrollArea 裁剪、滚轮滚动期间外环如实、静默后重新吸附；文本 I 形竖条；深色主题、`.dark` 岛与品牌色令牌。
- 评审修复的回归检查 15/15：整页实例下关闭的 Area 的菜单、最新的整页实例被关闭、`asChild` 换根、Portal 进应用外壳里的插槽、内联与任意值光标宿主、CSS 失效成本。
- 每帧开销（扫过工具栏，对比关闭组件）：rAF 脚本约 +0.15–0.22ms，`UpdateLayoutTree` 约 +0.02–0.06ms，每帧重算约 3–4 个元素。
- 不带 Node 类型的严格 TS 编译（`noUnusedLocals`、`verbatimModuleSyntax`）、仓库的 `pnpm lint` 与 `pnpm build`（静态导出，含 `/components/adaptive-pointer`）通过；`pnpm update-registry` 后 registry 内容与源码一致；375px 宽度下页面没有横向滚动，并显示触屏提示。

QA 环境：

- 内置浏览器面板隐藏时页面只跑约 2–4fps，并报告 `prefers-reduced-motion: reduce`（组件会正确地走减少动态效果的路径），所以面板只能做冒烟检查；时序、几何与逐帧检查要用 CDP 驱动 Playwright 缓存的 Chromium，见 `.agents/skills/qiuye-ui-pitfall-guard/references/pointer-motion-visual-qa-environment.md`（QIUYE-UI-PIT-0012）。
- cursor 继承的教训记为 QIUYE-UI-PIT-0013（`custom-cursor-inherited-none.md`）。
- 文档与注释里不要写方括号写法的任意值光标类：Tailwind v4 会扫描 `docs/` 下的 Markdown，曾因此生成无效的 cursor 规则让开发构建失败（QIUYE-UI-PIT-0014）。

### 补测（2026-10-19，第二轮）

环境：仓库外的临时目录里装 `playwright-core@1.49.1`（与缓存的 chromium-1148 / firefox-1466 / webkit-2104 对应），用 `page.mouse` 发送可信的鼠标移动驱动 `pnpm dev` 上的 `/components/adaptive-pointer/`，模拟关闭减少动态效果。浏览器为 HeadlessChrome 131、Firefox 132、WebKit（Safari 18.2）。

补测中发现并修复了三个问题：

- **DPR 1.5 下外环描边只有 1 个设备像素**（WebKit 在 1.25 下也是）：浏览器把描边向下取整到设备像素，而且先按自己的精度存储；引擎写的 `(2 / 1.5).toFixed(3)` 即 `1.333px`，乘回去是 1.9995，取整为 1。改为多写 0.25 个设备像素（`bwPaint = (bwDevice + 0.25) / dpr`）。修复前真实 DSF 下的 Chromium 为 2 / 2 / 1 / 3、WebKit 为 2 / 1 / 1 / 3。
- **文本 I 形竖条比设计宽一倍、并偏向热点右侧**：竖条宽 2 个设备像素，外环仍带两侧各 2 个设备像素的描边，border-box 的盒子不会窄于描边之和，DPR 1 下实际画成 4px、中心偏右 1px，DPR 2 下为 6 个设备像素。实心时改写 `border-width: 0` 加底色，竖条宽度等于 `beamWidth()`（DPR 1 / 1.25 为 2 个设备像素，1.5 / 2 为 4 个），中心正对热点。
- **View Transition 结束后静止的指针看不见**：转场期间 Chromium 把指针事件全部派发给 `<html>`（局部 Area 判为作用域外，交给原生箭头），结束时只补发边界事件、不补发 pointermove，于是热点下元素的计算 cursor 已是 none、叠加层还停在原生判定里。现在离开 `<html>` 的 pointerout 会标脏并重新命中。WebKit 转场期间完全不派发指针事件，只在第一次移动时补一个 relatedTarget 为 null 的 pointerout，原先按 `frame` 隐藏、转场后同样一个指针都没有；现在在 `:active-view-transition` 期间收到这种 pointerout 就交还原生指针，下一次移动重新激活。

结果：

| 验收项 | Chromium | Firefox | WebKit |
| --- | --- | --- | --- |
| 原生 `<button disabled>` 的事件派发 | 派发 pointermove / over / out | 派发 | 派发 |
| 120ms 兜底（在引擎之前注册的捕获监听吞掉禁用控件上的事件来模拟） | 写上 `data-adaptive-pointer-fallback`、计算 cursor 为 auto、叠加层隐藏；离开后撤销并恢复叠加层；再次进入重新标记且只保留一个 | 同左 | 同左 |
| 三种禁用（shadcn / aria-disabled / 原生）保持 Ø20 外环、不写 `data-pointer-state` | 通过 | 通过 | 通过 |
| input、textarea、`data-pointer="native"`、`cursor-crosshair`、iframe：计算 cursor 不为 none 且叠加层隐藏 | 通过 | 通过 | 通过 |
| 工具栏：Ø8 外环、38×38 圆角 13 的板子居中于按钮、滑行到下一个按钮 | 通过 | 通过 | 通过 |
| Area 内的 Radix DropdownMenu：Portal 宿主写上 on、菜单项 Ø36 柔和圆 + Ø8 外环、禁用项 Ø20 | 通过 | 通过 | 通过 |
| 主题切换 View Transition（局部 Area） | 转场中原生箭头、`<html>` 计算 cursor 为 auto；结束后不移动即恢复叠加层；之后吸附正常、令牌换成深色 | 不支持 `startViewTransition`，跳过 | 转场中原生箭头；结束后保持原生，下一次移动恢复 |
| 主题切换 View Transition（整页实例，Vite 构建产物） | 冻结转场动画后移动指针：两张截图中外环分别在 A、B 处，叠加层实时跟随；结束后保持显示 | 跳过 | 同局部 Area |
| `showModal()` 对话框：按钮与 ::backdrop 上计算 cursor 为 default / auto，叠加层隐藏；关闭后恢复 | 通过 | 通过 | 通过 |
| body 加 `transform` 后：叠加层改挂 `<html>`，根节点矩形等于视口，外环中心与热点偏差 < 1px；移除变换后仍正确，始终只有一个叠加层 | 通过 | 通过 | 通过 |
| 客户端导航离开再返回：属性、叠加层、引擎全局槽、内容 translate、注入的 style 全部清除；返回后只有一个叠加层并正常吸附 | 通过；CDP 对比确认 window 上 13 个、document 上 7 个引擎监听全部移除 | 通过 | 通过 |

DPR（Chromium 用 `--force-device-scale-factor`、Firefox 用 `layout.css.devPixelsPerPx` 并设 `viewport: null`、WebKit 用 `deviceScaleFactor`；截图按设备像素逐行扫描亮度）：

| DPR | 静止 Ø20 外环描边（设备像素） | Ø8 外环描边 | 孔中心相对热点 |
| --- | --- | --- | --- |
| 1 | 2 / 2 / 2（Chromium / Firefox / WebKit） | 2 / 2 / 2 | 0 |
| 1.25 | 2 / 2 / 2 | 2 / 2 / 2 | 热点在设备像素格上时为 0，否则 ±0.25 |
| 1.5 | 2 / 2 / 左 2 右 1 | 同左 | 0；热点在半像素上时 0.5（WebKit 因左右不对称再偏 0.5） |
| 2 | 3 / 3 / 3 | 3 / 3 / 3 | 0 |

所有截图中外环边缘都没有部分覆盖的像素。WebKit 在 DPR 1.5 下的左右不对称来自 WinCairo 对圆角描边的光栅化：同样位置、同样宽度的纯 CSS 圆也画成左 2 右 1，方形则对称；macOS 上的 Safari 只有整数 DPR。Playwright 的 `deviceScaleFactor` 在 Chromium 与 Firefox 里会把 1–2 CSS px 的描边都算成 `1px`，那样截出的 2 / 1 / 2（带部分覆盖的像素）/ 2 是模拟环境的假象（QIUYE-UI-PIT-0015）。

Vite 消费方：`shadcn init -t vite -b radix -p nova` 建立的项目（shadcn 4.22.1、Vite 8、TypeScript 6，`strict`、`noUnusedLocals`、`noUnusedParameters`、`verbatimModuleSyntax`、`erasableSyntaxOnly`，应用配置不含 Node 类型），用 `npx shadcn add ./adaptive-pointer.json` 从本地 registry 安装，装到 `src/components/qiuye-ui/adaptive-pointer.tsx` 并加上 `motion`、`radix-ui`。App 同时使用 `AdaptivePointer`、`AdaptivePointerArea`、`pointerTarget()` 与 `useAdaptivePointerStatus()`：`npx tsc -b` 通过、`npm run build` 通过、模板的 ESLint（react-hooks、react-refresh）对组件无报错；构建产物在三个浏览器中整页模式正常吸附。npm 10.8.2 在模板安装时报 `Cannot read properties of null (reading 'edgesOut')`，与组件无关，加 `legacy-peer-deps` 后安装成功。

修复后：`pnpm update-registry` 只更新了 `adaptive-pointer.json`，内容与源码一致；`pnpm lint`、`pnpm build`（静态导出，含 `/components/adaptive-pointer`）通过；跨浏览器与兜底的整套检查在三个浏览器中重跑通过；内置浏览器面板里的首页经过 4 次 HMR 更新后仍只有一个叠加层，控制台没有错误。新增踩坑记录 QIUYE-UI-PIT-0015（`border-width-device-pixel-snapping.md`）与 QIUYE-UI-PIT-0016（`view-transition-pointer-hit-testing.md`）。

仍未覆盖：原生 popover；多次连续保存的 HMR 压力测试（只观察了上述 4 次）；macOS 上真实 Safari 的禁用控件与 View Transition 行为（本轮的 WebKit 是 Windows 上的 Playwright 版本）；真实触控板与高刷屏上的手感。

### 默认值调整（2026-10-19）

- 默认关闭外环定位（`ring` 默认 `false`），开启内容视差（新增 `contentParallax`，默认 `true`，自动作用于只有图标的目标）、正文 I 形竖条（新增 `textBeam`，默认 `true`，整个作用域都是文本区域）与静止 2 秒后隐藏（`autoHide` 默认 `2000`）。首页预览、详情页快速预览与交互实验台都使用这组默认值。
- 单层模式下悬停大目标也放大为 Ø36 柔和圆（透明度用 hover 令牌），否则没有外环时悬停大卡片没有任何反馈。
- 开启「减少动态效果」时直接使用系统指针，移除 `reducedMotion` 选项与对应的减少动态效果表现；Demo 去掉「动态效果」切换，改为一行说明，触屏提示同时说明这个条件。
- 验证（headless Chromium）：图标按钮上是单层圆角板、外环不可见、图标写入了朝指针方向的 translate；不带任何属性的段落与场景说明文字上是 I 形竖条，空白处是 Ø20 单层圆（solo 0.28）；大卡片为 Ø36 柔和圆；静止 2 秒后两层淡出，移动即恢复；首页预览同样是单层圆角板；模拟 `prefers-reduced-motion: reduce` 时页面上没有作用域属性、叠加层不显示、命中元素的计算 cursor 为原生，并显示提示。
