# ExpandableCard · App Store 风格展开卡片

## 来源与目标

源自 QiuVision 博客作品集（`components/works/*`）。原实现与作品数据、插画和画廊状态耦合，这里抽成通用组件：卡片点击后，从原位置连续放大为居中详情浮层；关闭时飞回原卡片。视觉参照 App Store「Today」卡片：大封面、封面上的分类与标题、底部应用行。

名称为 ExpandableCard，registry id 为 `expandable-card`，分类「内容与媒体」。

## API

```tsx
<ExpandableCard
  cover={<Cover />}                 // 卡片与浮层共用的封面
  eyebrow="桌面应用"
  title={"后台在播放，\n字幕留在游戏画面上"}
  tone="light"                      // 封面文字配色
  icon={<img src="/icon.png" alt="" />}
  name="PotSubOverlay"
  subtitle="透明 · 置顶 · 鼠标穿透"
  actionLabel="查看"                 // 卡片态右侧胶囊
  actions={<Button>下载</Button>}    // 展开后替换胶囊
  className="h-[30rem]"             // 卡片尺寸由调用方决定
>
  {/* 展开后的正文 */}
</ExpandableCard>
```

- 受控 / 非受控：`open`、`defaultOpen`、`onOpenChange`。深链等场景由调用方用受控模式同步 URL。
- 浮层几何：`maxWidth`（默认 760）、`expandedCoverHeight`（数值，或根据视口高度计算的函数，默认 `clamp(240, 42vh, 400)`）、`radius`（默认 28）。
- `parallax`：卡片内的指针视差与高光，默认开启。
- `label`：卡片按钮与对话框的无障碍名称；未传时取 `name` / `title` 中的字符串。
- 辅助导出：
  - `ExpandableCardLayer`：封面中的视差图层，`depth` 为最大位移（px）。
  - `useExpandableCard()`：读取 `{ x, y, live, expanded }`，用于封面内的循环动画（不可见、浮层占用或减少动态效果时 `live=false`）。

封面会分别在卡片和浮层中各渲染一次，因此应保持确定性；需要轮播的内容应由时钟派生状态，保证两份显示同一帧。封面容器设置了 `container-type: size`，可以用 `cqw` / `cqh` 让构图随尺寸连续缩放。

## 实现要点

沿用博客中经过逐帧验证的实现与修复：

| 主题 | 做法 |
| --- | --- |
| 容器变形 | 原卡片作为占位留在布局中，打开期间透明；浮层是 portal 中的 fixed 元素，按数值动画 top/left/width/height 与封面高度，不用 `layoutId` 缩放，文字与圆角不变形。四相位 `closed → opening → open → closing`，收起时重新测量卡片作为落点。 |
| 无障碍 | Radix Dialog 负责焦点陷阱、Esc、遮罩点击与 `aria-modal`；关闭后焦点回到卡片（`preventScroll`）。 |
| 滚动 | Radix ScrollArea 原语：叠加滚动条不占宽度，展开完成前后不重排。Root 用 `style` 绝对定位（覆盖内联 `position: relative`），内容包裹层覆盖 `display: block`，飞行期间通过 `style` 关闭视口滚动。收起时先把内部滚动平滑归零。 |
| 阴影 | 卡片与浮层共用静止阴影 `--ec-rest-shadow`；浮层叠加强度为 `--ec-lift` 的深阴影，展开 0.45s 增强、收起 0.32s 提前归零，落地时与卡片逐值一致。用 CSS 变量而非 `opacity`，避开 WAAPI 过期帧。 |
| 交互反馈 | Motion variants：悬停上浮 4px、封面放大 1.03、高光显现；按压缩小到 0.97。悬停阴影用 CSS 变量过渡。 |
| 减少动态效果 | 关闭位移、缩放和视差；展开与收起改为原地淡入淡出；`live=false`。 |

不做：卡片之间的共享画廊状态（多个卡片各自独立）、URL 同步（交给受控模式）、具体的封面插画。

## 依赖

- npm：`motion`、`@radix-ui/react-dialog`、`@radix-ui/react-scroll-area`、`lucide-react`
- registry：`@qiuye-ui/smooth-corners`

## 验收

- 展开 / 收起逐帧：几何连续，无文字拉伸，落点与卡片重合；阴影交接无跳变。
- 打开后视口 `offsetWidth === clientWidth`，内部可滚动、背景不滚动；横向子元素在内部滚动。
- Esc、遮罩、关闭按钮均可关闭，焦点还原；受控模式下外部切换 `open` 同样有完整动画。
- 浅色 / 深色主题、390px 与桌面宽度、减少动态效果。
- `pnpm lint`、`pnpm build`、registry 内容与源码一致。

## 实施与验证记录（2026-10-08）

与设计相比的调整：

- **标题字号**：原实现按视口宽度（`vw`）缩放，首页 254px 宽的预览卡片里两行标题被挤成三行。改为按封面宽度缩放 `clamp(1.25rem, 6.5cqw, 1.75rem)`（封面是 size 容器），窄卡片也保持 `\n` 指定的断行；展开时字号随浮层宽度连续变化。
- **底栏一致性**：卡片与浮层是否显示底栏由同一规则决定（`icon` / `name` / `subtitle` / `actionLabel` / `actions` 任一存在），避免飞行中出现或消失一条底栏。
- **ExpandableCardLayer**：只接收 `depth`、`className`、`style`、`children`，不透传全部 HTML 属性，以免与 Motion 的拖拽事件类型冲突。
- **Demo 封面**：Tailwind 任意值 `bg-[渐变, 渐变, 颜色]` 会生成无效的 `background-image`，浅色封面因此显示为卡片底色；改为 `bg-[颜色]` 加 `[background-image:…]` 两个类。

验证（Chromium，组件详情页，MutationObserver 记录浮层每次样式写入）：

- 1280×860 展开：首帧与卡片矩形一致（168, 57, 370×480），`--ec-lift` 为 0，阴影为卡片静止阴影；之后连续放大到居中 760×796，`--ec-lift` 同步升到 1。视口 `offsetWidth === clientWidth`（758），可滚动（794 / 1019），焦点位于浮层，页面滚动已锁定。
- 内部滚动 200px 后按 Esc 收起：内部滚动回到顶部，浮层最后一帧落在卡片矩形上，`--ec-lift` 提前归零；落地帧阴影与卡片卸载后的 computed `box-shadow` 逐值一致；焦点回到卡片，滚动锁解除。
- 受控模式：外部按钮打开，Esc 关闭后 `open` 回到 false；纯封面卡片（`actionLabel={null}`）浮层中没有底栏。
- 390×844 浅色主题：详情页无横向溢出；浮层四边各 8px（374×828），视口宽度 372 不受滚动条影响，可滚动。
- 首页预览（tall）在 254px 宽卡片中标题保持两行。
- `pnpm lint`、`tsc --noEmit`、`pnpm build`（24 个静态页面，含 `/components/expandable-card`）通过；registry 中的源码与组件文件一致（按换行符归一化后比较）。
- `pnpm update-registry` 在 Windows 上会把其余 15 个 registry item 的换行改成 CRLF，已逐个确认只有换行差异并还原，相关经验记入 `qiuye-ui-pitfall-guard`（QIUYE-UI-PIT-0005）。

未覆盖：真实 iOS Safari 的触摸手感、系统级减少动态效果的实机切换（代码路径中位移、缩放与视差已关闭，展开与收起改为淡入淡出）。
