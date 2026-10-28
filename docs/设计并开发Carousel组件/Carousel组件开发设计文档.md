# Carousel · 轮播图

## 目标

一个桌面端和移动端都好用的通用轮播图，手感对标 iOS 的分页滚动：

- **跟手**：鼠标拖拽、触摸滑动 1:1 跟随；纵向滑动交还给页面滚动，不劫持。
- **阻尼**：非循环时拉过两端是橡皮筋（越拉越沉）；松手按速度投影选择吸附点，用带初速度的弹簧滑过去，轻甩也能翻页；动画途中按下立即接住，从屏幕上的当前位置继续（包括橡皮筋回弹途中）。
- **常见内容与填充模式**：横幅大图（cover，固定宽高比，文字叠加）、商品图集（contain + 模糊衬底，缩略图联动）、卡片货架（每屏多张、按断点配置、露出下一张）、中心聚焦（居中对齐 + 两侧缩小变暗，点击两侧切换）、文字推荐语（渐隐 + 自动高度）、宽度不一的标签 / 卡片（按内容宽度，自由惯性滚动）。
- **导航**：悬停显示的玻璃质感箭头、随拖动连续变形的指示点（自动播放时活动点内显示进度）、分数指示「3 / 12」、触控板横向滑动、键盘方向键；全部可单独放到任意位置。
- **自动播放**：悬停、聚焦、拖动、离开视口、标签页隐藏时暂停；带暂停 / 播放按钮（WCAG 2.2.2）；减少动态效果时默认不自动播放。

名称 Carousel，registry id `carousel`，分类「内容与媒体」，npm 依赖 `motion`、`lucide-react`，无 registry 依赖。单文件 `components/qiuye-ui/carousel.tsx`，顶部 `"use client"`。导出名与 shadcn/ui 的 carousel 相近（`Carousel`、`CarouselContent`、`CarouselItem`、`CarouselPrevious`、`CarouselNext`），但安装在 `components/qiuye-ui/` 下，不冲突。

## API

```tsx
<Carousel
  loop                          // 无限循环，默认 false
  autoplay                      // true 或 { delay?: 5000, pauseOnHover?: true, stopOnInteraction?: false }
  slidesPerView={1}             // number（可为小数，如 1.15 露出下一张）| "auto"（按内容宽度）| 断点对象 { 0: 1.15, 640: 2, 1024: 3 }（键为视口容器宽度 px）
  gap={0}                       // px，number 或断点对象
  align="start"                // "start" | "center"
  snap="slide"                 // "slide"（每张一个吸附点）| "page"（每屏一组）| "none"（自由惯性滚动，不吸附）
  effect="slide"               // "slide" | "fade" | "scale"（两侧缩小变暗）
  crossFade={false}             // fade 时先淡出再淡入（背景透明的文字幻灯片）；默认下层保持不透明
  parallax={0}                  // 0–0.5，CarouselImage 随拖动反向轻移的比例
  autoHeight={false}            // 视口高度随当前幻灯片高度过渡
  arrows="hover"               // "hover"（可悬停设备上悬停时显示）| "always" | "none"
  indicators="dots"            // "dots" | "fraction" | "none"
  indicatorsPlacement="inside" // "inside"（叠在内容底部）| "outside"（视口下方）
  draggable                     // 鼠标拖拽，默认 true；触摸滑动始终可用（除非 swipe={false}）
  wheel                         // 触控板横向滑动 / Shift + 滚轮，默认 true
  keyboard                      // 焦点在轮播内时 ← → Home End，默认 true
  selectOnClick={false}         // 点击未选中的幻灯片时切换到它（中心聚焦常用）
  index / defaultIndex / onIndexChange   // 当前吸附点序号（受控 / 非受控）
  onSettle={(index) => {}}      // 停稳后
  apiRef={apiRef}               // 外部控制：{ next, prev, goTo, play, pause, ... }
  labels={{ ... }}              // 文案
  className                     // 根元素（region）
>
  <CarouselContent className="aspect-video rounded-2xl">  {/* 视口：尺寸、圆角写在这里 */}
    <CarouselItem>...</CarouselItem>                      {/* 每个直接子元素是一张；不是 CarouselItem 时自动包一层 */}
    <CarouselImage src="..." alt="..." />
  </CarouselContent>
</Carousel>
```

- 内置箭头与指示器由 `CarouselContent` 按 `arrows` / `indicators` 渲染在视口里（`indicatorsPlacement="outside"` 时指示器在视口下方）。
- 需要自定义位置时把内置控件设为 `"none"`，在 `<Carousel>` 内任意位置放 `CarouselPrevious`、`CarouselNext`、`CarouselIndicators`（默认是普通的行内元素，不再绝对定位），例如货架标题右侧的一对箭头。
- `useCarousel()`：`{ index, count（吸附点数）, slideCount, canPrev, canNext, next, prev, goTo, goToSlide, playing, play, pause, position（连续位置的 MotionValue）, autoplayProgress（0–1 MotionValue） }`，用于缩略图、故事进度条等自定义控件。
- `useCarouselItem()`：`{ index, progress（MotionValue，0 为对齐位置，±1 为相邻一个吸附位置）, active, visible }`，用于自定义每张的效果。
- **index 的含义**：吸附点序号。每屏 1 张且 `snap="slide"` 时就是幻灯片序号；每屏多张时指示点个数等于吸附点个数（`align="start"` 时末尾不会留出空白，多个末尾位置合并为一个吸附点）。`goToSlide(i)` 跳到包含第 i 张的吸附点。
- 导出 `DEFAULT_CAROUSEL_LABELS`：`{ region: "轮播", roleDescription: "轮播", slideRoleDescription: "幻灯片", slide: (i, n) => \`第 ${i} 张，共 ${n} 张\`, page: (i, n) => \`第 ${i} 页，共 ${n} 页\`, previous: "上一张", next: "下一张", goTo: (i) => \`转到第 ${i} 张\`, goToPage: (i) => \`转到第 ${i} 页\`, indicators: "选择幻灯片", play: "播放", pause: "暂停" }`。吸附点与幻灯片不是一一对应时（每屏多张、按页），播报与指示点用 `page` / `goToPage`。
- `CarouselAutoplayToggle`：独立的暂停 / 播放按钮（`appearance="plain" | "overlay"`），放在 `<Carousel>` 内任意位置；`autoplay` 且 `indicators="none"` 而页面上没有任何暂停按钮时，`CarouselContent` 在视口右下角补一个（WCAG 2.2.2）。
- `Carousel` 的 ref 转发到根元素。各部分带 `data-slot`（`carousel`、`carousel-content`、`carousel-item`、`carousel-previous`、`carousel-next`、`carousel-indicators`、`carousel-image`），拖动中根元素带 `data-dragging`。

### CarouselImage

```tsx
<CarouselImage
  src alt
  fit="cover"                  // "cover" | "contain"
  backdrop                      // contain 时在留白处铺一层同图的大模糊衬底，默认 true
  priority={false}              // 立即加载；否则只在幻灯片接近可见时才设置 src
  imgClassName / sizes / srcSet / 其余 img 属性
>
  {/* 可选：叠加在图片上的内容（标题、按钮），自带底部渐变遮罩时用 overlay 属性 */}
</CarouselImage>
```

- 加载前显示柔和微光骨架，加载后淡入（已缓存的直接显示）；失败显示占位图标。
- 懒加载：读取所在幻灯片的可见性，只有在当前可见范围 ±1 张内才设置 `src`，避免一次加载全部大图。
- `parallax > 0` 时图片比幻灯片宽出相应比例，随 `progress` 反向平移，拖动时有景深。
- 图片 `draggable={false}`，不会触发浏览器原生拖图。

## 实现要点

### 结构与定位

```
div[data-slot=carousel]  region（aria-roledescription="carousel"，aria-label）
  div[data-slot=carousel-content]  视口：relative、overflow: hidden、touch-action: pan-y（不设 overscroll-behavior，见实现记录与 PIT-0020）
    div（轨道）  display: grid；所有幻灯片放在同一个格子（grid-area 1 / 1），视口高度自然等于最高的一张
      div[data-slot=carousel-item] × n  宽度 = (100% − gap × (spv − 1)) / spv，各自 transform: translate3d(x, 0, 0)
    内置箭头、内置指示器（inside）
  内置指示器（outside）
```

- 一个连续的位置 MotionValue（`offset`，px，0 表示第一个吸附点）。每张幻灯片的 x 由 `useTransform(offset, …)` 派生：非循环时为 `base(i) − offset`；循环时把 `base(i) − offset` 按轨道总长取模，落到 `[−最大宽度, 视口宽 + …)` 区间，**不复制幻灯片**（每张自己绕回，状态不会因克隆而重复）。
- 每张的 `progress`（距对齐位置多少个吸附步长）同样由 offset 派生，供效果、视差和指示点使用。
- 每屏多张、数字 `slidesPerView` 时宽度用百分比计算，**服务端首帧**用 `translateX(calc((i − defaultIndex) × (100% + gap)))` 直接摆好，水合前就是正确画面，不跳。`"auto"` 时首帧按普通横向排布，测量后切换。
- 视口与各幻灯片宽度用 ResizeObserver 测量；尺寸变化时保持当前吸附点对齐，直接设置 offset（不动画）。
- 循环需要轨道总长 ≥ 视口宽 + 最宽的一张；不满足时退化为非循环（开发环境警告一次）。幻灯片数少于每屏张数时不可拖动、不显示控件。

### 拖动

- Pointer Events。按下时停止正在进行的动画，从当前值继续；若当前处于越界的橡皮筋位置，用橡皮筋的反函数还原原始拖动量（与 HoneycombView 相同）。
- 阈值 6px 后判定方向：鼠标若竖直分量更大则放弃本次拖动；触摸由 `touch-action: pan-y` 交给浏览器，浏览器接管纵向滚动时会发 `pointercancel`。
- 确认是拖动后才 `setPointerCapture`（否则幻灯片内的 click 落不到原元素），根节点的 `lostpointercapture` 只处理 `target === currentTarget`（PIT-0011）；拖动中阻止非 passive 的 `touchmove` 默认行为（iOS）。
- 拖动结束吞掉随后的 click（捕获阶段），幻灯片里的链接不会在拖动后误触；拖动中 `user-select: none`，图片 `-webkit-user-drag: none`。
- 越界：`rubberBand(overshoot, 视口宽)`，系数 0.55。
- 速度：最近 100ms 的指针采样；松手前停顿超过 50ms 视为速度 0。
- 光标：可拖动时 `grab`，拖动中 `grabbing`（只在 `(hover: hover)` 下）。

### 松手

- 投影：`projection = v × 0.998 / (1 − 0.998) / 1000`（UIScrollView 的减速率，单位 px）。
- **每屏 1 张（分页）**：目标为 `round((当前位置 + 投影) / 步长)`，限制在松手位置两侧的两页之内——轻甩按速度方向翻到下一页，用力甩也只翻一页；一次拖过多页后慢慢松手落在最近的一页（与 iOS 分页一致，不会被拉回手势开始的那一页）。
- **每屏多张**：吸附到离 `当前位置 + 投影` 最近的吸附点（可一次滑过多张）。
- **snap="none"**：Motion `inertia`（`timeConstant` 与投影一致，`min` / `max` 为两端，越界时 `bounceStiffness 200`、`bounceDamping 28`）。注意 PIT-0009：目标值传一个与当前值不同的占位值。
- 弹簧：`{ type: "spring", visualDuration ≈ 0.45, bounce ≈ 0.1, velocity }`，带松手速度出发；越界松手回到端点同样带速度。具体数值以实测手感为准。
- 循环时程序跳转（箭头、指示点、自动播放）走最短方向。

### 滚轮 / 触控板

- 只响应横向为主的 wheel（`|deltaX| > |deltaY|`，或按住 Shift），非 passive 监听并 `preventDefault`；纵向滚动交还页面。
- 手指在触控板上时位移 1:1 跟随（短弹簧平滑，约 0.3s），非循环时夹在两端。
- 松手：macOS 触控板松手后系统还会继续发一串逐帧衰减的惯性 wheel，浏览器不暴露手势阶段。最近 5 次位移同向、逐次不增、末次比首次小一成以上即视为手指已离开，立即按速度吸附（与拖动松手一致：分页时速度超过 400px/s 朝速度方向翻一页，否则滑过 15% 视口宽就翻页；非分页按速度投影取最近的点），弹簧从屏幕上的当前速度出发；之后的惯性事件只 `preventDefault` 不再移动，明显变大或反向才算新的一次滑动。若跟着惯性走完再吸附，会先慢慢停在没对齐的位置、再自己动到吸附点。
- 没有惯性的手势（手指停住再抬起、Shift + 滚轮）停止 150ms 后吸附到最近的点；分页时滑过视口宽的 15% 就朝滑动方向翻一页。
- 吸附途中又开始的手势不会逆着这次滑动的方向退回上一页（弹簧还没到位时，当前位置可能更靠近上一页）。
- 手势进行中，目标吸附点随每个 wheel 事件更新：途中按下、按方向键或调用 `api.next()` 都从手势的目标继续，而不是手势开始前的那一张。

### 效果

| effect | 每张 |
| --- | --- |
| `slide` | 只平移 |
| `fade` | 所有幻灯片叠在同一位置，只有接近 0 的一张可交互，附带极轻的缩放（1.02 → 1）。默认：右侧的一张（0 < p < 1）在上层、不透明度 1 − p，左侧的一张（−1 < p ≤ 0）在下层保持不透明，画面是 (1 − p)·右 + p·左，中途不透出背景，按符号分层也不会在正中间出现两张同层；`crossFade`：不透明度 max(0, 1 − 2d)，先淡出再淡入，用于背景透明的文字幻灯片 |
| `scale` | 平移 + `scale = 1 − 0.12 × min(|progress|, 1)`，非活动幻灯片叠一层逐渐加深的暗色（或降低不透明度），适合 `align="center"` + 小数 `slidesPerView` |

`parallax` 只作用于 `CarouselImage`；自定义效果通过 `useCarouselItem().progress`。

### 指示器

- **dots**：每个点的「活动度」`a = max(0, 1 − |连续位置 − i|)`（循环时取环上距离），宽度 `6 + 16a` px、不透明度 `0.45 + 0.55a`，全部由 MotionValue 派生——拖动时活动的胶囊连续地从一个点流到下一个点，而不是松手后才跳。自动播放时活动胶囊内有一条从左到右填满的进度条。
- 点太多（超过 `maxDots`，默认 9）时只显示一个滑动窗口，窗口边缘的点缩小（Instagram 式），窗口跟随当前位置平移。
- `inside`：叠在内容底部居中，一个半透明深色胶囊衬底（`backdrop-filter` 模糊，注意 backdrop-filter 避坑文档）、白色点，保证在任何图片上都清晰；`outside`：视口下方，按主题着色。
- **fraction**：「3 / 12」，数字切换时上下滑动淡入。
- 可访问性：点是 `role="tablist"` 内的 `role="tab"`（`aria-selected`、`aria-controls` 指向对应幻灯片），漫游 tabindex，方向键移动并激活。
- 自动播放时在指示器旁有一个小的暂停 / 播放按钮。

### 箭头

- 直径 36px 的圆形按钮，`bg-background/80`、`backdrop-blur`、细边框、轻阴影，图标为 lucide 的 ChevronLeft / ChevronRight；位于视口左右两侧、垂直居中，距边缘 12px。
- `hover`：可悬停设备上指针进入轮播时淡入并从外侧滑入 6px；键盘聚焦在轮播内时也显示；纯触屏设备上隐藏（滑动是主要方式）。按下缩放 0.92。
- 非循环到达两端时禁用并降低不透明度。

### 自动播放

- 一个 0–1 的进度 MotionValue，用线性 `animate` 走完 `delay`；到 1 时 `next()`（循环或到末尾回到开头）。暂停时停止动画，恢复时从剩余时间继续；手动切换后进度重置。
- 暂停条件：悬停（仅指针设备，`pauseOnHover`）、焦点在轮播内、拖动中、`useInView` 判定不在视口内（`motion/react`）、`document.hidden`、用户按了暂停、减少动态效果（默认）。`stopOnInteraction` 时用户手动切换后不再自动播放。
- 自动播放期间 live region 为 `off`，手动切换时为 `polite`，播报「第 i 张，共 n 张」。

### 可访问性

- 根元素 `role="region"`、`aria-roledescription="carousel"`、`aria-label`（`labels.region`，可被 `aria-label` 覆盖）。
- 每张 `role="group"`（使用 tab 指示器时为 `role="tabpanel"`）、`aria-roledescription="slide"`、`aria-label`（`labels.slide(i, n)`）。
- 分页类模式下停稳后完全不在视口内的幻灯片设置 `inert` 与 `aria-hidden`，Tab 不会进入看不见的链接；可见的（包括每屏多张时的几张）可正常交互。`snap="none"` 与 `slidesPerView="auto"`（标签行、宽度不一的列表）不设置，所有项都能 Tab 到。
- 键盘：焦点在轮播内（不在输入框里）时 ← → 切换，Home / End 到两端。焦点在某张幻灯片内时，切换后焦点跟到新吸附点的同类元素（原来在幻灯片本身就落在幻灯片上，否则落在第一个可 Tab 的元素上）；停稳时若焦点所在的幻灯片即将变为 inert，先把焦点移到当前吸附点的可见幻灯片。幻灯片 `tabIndex={-1}`，聚焦时内侧描边。
- 键盘聚焦到不完整可见的幻灯片时滚入视野：分页类模式跳到它所在的吸附点，自由滚动时只移动刚好够的距离（边缘留 16px）。
- 分数指示器的视觉数字对读屏隐藏，改读完整的「第 3 张，共 12 张」；`aria-roledescription` 来自 `labels`，幻灯片作为 tabpanel 时不设置。

### 减少动态效果

拖动仍然 1:1 跟手（用户主动的操作）；松手和程序切换改为约 200ms 无回弹的缓动，`fade` 效果保持淡入淡出；不自动播放（除非 `autoplay` 显式传入 `{ ignoreReducedMotion: true }`）。

## 演示

1. **横幅大图**：循环 + 自动播放 + 视差，`aspect-video`（窄屏 4:3），图片 cover，底部渐变遮罩与标题文字，指示点在内、箭头悬停显示。
2. **卡片货架**：断点配置 `slidesPerView`（窄屏 1.15 露出下一张），gap 16，`snap="page"`，标题右侧放自定义的 `CarouselPrevious` / `CarouselNext`，指示点在外。
3. **中心聚焦**：`align="center"`、`slidesPerView` 约 1.6、`effect="scale"`、循环、`selectOnClick`。
4. **商品图集**：`fit="contain"` + 模糊衬底，下方缩略图条与当前张联动（`useCarousel` / 受控 index），分数指示器。
5. **推荐语**：`effect="fade"` + `crossFade` + `autoHeight`，文字长度不一。
6. **自由滚动**：`slidesPerView="auto"` + `snap="none"`，宽度不一的标签或卡片，惯性滚动 + 两端回弹；所有标签都能 Tab 到并滚入视野。
7. **参数调试**：上述所有开关与数值（每屏张数、间距、对齐、循环、吸附、效果与 crossFade、视差、自动播放间隔、箭头、指示器及位置、自动高度、拖动、点击切换），实时生效并生成可直接粘贴的组件代码（fade 时不输出无效的间距、对齐与 `snap="none"`）。
8. **首页 / 快速预览**：小尺寸横幅（渐变背景 + 文字，不依赖网络图片），循环 + 自动播放。

## 验收

- 鼠标与触摸（CDP `Input.dispatchTouchEvent`）：跟手、橡皮筋、轻甩翻页、用力甩只翻一页（单张）、多张时滑过多张；动画途中按下接住位置连续（rAF 采样无跳变）。
- 纵向触摸滑动不触发轮播、页面正常滚动；拖动后不触发幻灯片内链接。
- 触控板横向 wheel 跟随并在停止后吸附；纵向 wheel 不被拦截。
- 循环：两端无缝，无克隆；指示点连续变形；自动播放在悬停 / 离开视口 / 标签页隐藏时暂停。
- 375 宽移动端与 1280 宽桌面端截图；浅色 / 深色；减少动态效果路径。
- `pnpm lint`、`tsc --noEmit` 通过；源码不使用 next/*。

## 实现记录

### 结构

- 单文件 `components/qiuye-ui/carousel.tsx`，组合式 API：`Carousel`（Context + region 根元素）、`CarouselContent`（视口 + 轨道 + 内置控件）、`CarouselItem`、`CarouselPrevious`、`CarouselNext`、`CarouselIndicators`、`CarouselImage`、`useCarousel`、`useCarouselItem`、`DEFAULT_CAROUSEL_LABELS`。
- `CarouselContent` 给每个直接子元素提供序号 Context，不是 `CarouselItem` 的自动包一层；自定义组件内部再渲染 `CarouselItem` 时（序号与外层相同）退化为普通容器，不会套两层。轨道内重置 Item Context，嵌套轮播互不干扰。
- 服务端首帧需要幻灯片个数：根组件在子树中查找 `CarouselContent` 数出子元素个数，挂载后以 `CarouselContent` 注册的个数为准。
- 物理函数（橡皮筋及其反函数、动量投影、速度采样、inertia 常量）从 HoneycombView 复制并改为单轴。

### 几何与首帧

- 所有吸附点、边界、分页判定集中在 `buildTrack()`：按张或按页分组，`align="start"` 且不循环时把超出末尾的吸附点夹到最大滚动位置并合并；循环时每张的 x 为 `base(i) − offset` 在 `[−(最宽 + 间距), 周期)` 区间内取模，不复制节点。
- 服务端首帧用同一个 `buildTrack()`，只是把单位换成「一个幻灯片步长」（视口宽 = slidesPerView，间距 = 0）：可以证明此时的吸附位置与真实像素位置只差一个比例，所以 `translateX(calc(步数 × (100% + gap)))` 与测量后的像素值逐像素一致，水合不跳。
- 断点对象（slidesPerView / gap）：视口加 `container-type: inline-size`，在视口内渲染一段按实例 id 限定的容器查询 CSS，为每个断点写出 `--qy-spv`、`--qy-gap` 与每张的 `--qy-pos`；运行时 JS 按同一个视口宽度解析断点，两者一致。`"auto"` 时测量前按 flex + gap 排布，测量后切换为单格网格。
- 每张的 x、progress（距对齐位置多少张）与 center（距视口中心多少张，用于视差）都由 `useTransform(offset, …)` 派生；尺寸变化（ResizeObserver，回调内用 flushSync 同步提交）时让原来的第一张保持对齐，直接跳到新位置。

### 手势与动画（实测数值）

- 分页判定：吸附点平均步长 ≥ 视口宽的 75% 时按分页处理（每屏 1 张、1.15 张、`snap="page"`、`fade` 都属于这种情况），松手只在松手位置两侧的两页之间选择；速度 ≥ 400 px/s 的轻甩按速度方向翻页（较宽的桌面横幅上，仅靠投影过半需要很快的甩动），否则按投影取最近的一页。
- 测量与 CSS 量同一个盒子：宽度取轨道（= 视口内容盒）的 `getComputedStyle().width`，保留小数，断点也按它解析，与容器查询一致；`CarouselContent` 加横向 padding 或宿主宽度带小数时间距与每屏张数都正确。`autoHeight` 写入视口高度时加上视口自己的上下 padding 与边框（border-box）。
- 按下的生命周期：拖动开始前不捕获指针，所以按下时在 window 上（捕获阶段）挂 `pointerup` / `pointercancel` 兜底，在视口外松开也能结束；鼠标 `pointermove` 时 `buttons === 0` 视为抬起丢失；已有按下时其他手指（双指轻点、捏合）一律忽略，只有同一指针或同类型的主指针才替换并沿用「打断了动画」的状态。
- 接住动画的轻点：按下时内容仍在明显运动（离目标 > 2px 或速度 > 30px/s）时，这次轻点只用来停住，吞掉随后的 click（与 iOS 一致），然后滑到原来的目标。
- 触控板手势中途被打断（按下、方向键、`api.next()`、尺寸变化）都从手势的目标吸附点继续；`snap="none"` 时等跟随的短弹簧停下再 `onSettle`；尺寸或断点变化打断切换时跳到位后补发 `onSettle`。
- 每张幻灯片节点挂载时由 ResizeObserver 观察、卸载时取消（`autoWidth` / `autoHeight`），换了 key 但个数不变的新节点同样被观察。
- Motion 的 MotionValue 在最后一个 change 订阅者离开时会停止自己的动画：根组件给 `offset` 与 `autoplayProgress` 各挂一个常驻的空订阅，指示点按条件卸载时自动播放不会冻结。
- 受控 `index`：同步 effect 依赖已提交的 index，父组件拒绝这次切换（不写回）时滑回受控值。
- 服务端首帧扫描不到幻灯片个数（`CarouselContent` 包在自定义组件里）时，按每屏一张依次排开而不是叠在一起；`autoHeight` 测量前把初始视野外的幻灯片移出文档流，首帧高度就是初始一张的高度，水合后不再跳。
- 松手弹簧 `visualDuration 0.45`，回弹量随松手速度 0–0.1（|v| / 20000），越界松手回到端点时为 0；程序跳转（箭头、指示点、键盘、自动播放）`visualDuration 0.5`、无回弹。两者都设 `restDelta 0.5px`、`restSpeed 10`，尽早触发 `onSettle` 与 inert 更新。
- 动画途中按下立即停住并从当前值继续（越界时用橡皮筋反函数还原原始拖动量），实测按下前后位置无跳变；只是轻点（没有拖动）时继续滑到原来的目标，而不是停在半途。
- 决定目标时就先解除目标位置上幻灯片的 inert（滑入途中即可交互、图片提前开始加载），停稳后再按实际位置收紧。
- 滚轮：横向为主或按住 Shift 时 1:1 跟随（0.3s 短弹簧），停止 150ms 后吸附；`snap="none"` 时只夹在两端。

### 与设计稿的差异

- 视口没有设置 `overscroll-behavior-x: contain`：视口是 overflow hidden 的滚动容器，Chrome 中带一点横向分量的纵向滚轮（触控板常见）会被它截住，页面不再滚动。横向滚轮由 wheel 监听 preventDefault，不会触发浏览器的前进 / 后退手势。
- `effect="scale"` 的压暗用 `filter: brightness()`（相邻一张 0.65），而不是叠暗色层或降低不透明度：降低不透明度在浅色背景上发灰，叠加的暗色层与幻灯片内部的圆角对不齐。
- 自动播放「聚焦时暂停」只算键盘聚焦（`:focus-visible`）：鼠标点击箭头后按钮获得焦点，否则会一直暂停到焦点离开。
- `labels` 多 `indicators`（指示点 tablist 的名称）、`roleDescription` / `slideRoleDescription`（替换写死的英文 `aria-roledescription`）、`page` / `goToPage`（吸附点与幻灯片不是一一对应时的播报）；`Carousel` 多 `swipe`、`maxDots`、`crossFade`；`CarouselIndicators` 有 `type`、`appearance`（`"plain"` / `"overlay"`）、`playButton`、`maxDots`，自定义位置时也能用深色胶囊外观；新增 `CarouselAutoplayToggle`。
- `effect="fade"` 默认改为「上层淡出、下层不透明」：对称交叉淡入在中点两张都约 0.5，合成覆盖率只有 1 − 0.5 × 0.5 = 75%，图片横幅中途发白（浅色）或发暗（深色）；文字幻灯片用 `crossFade`。层级按 progress 的符号分为 2（右侧进入的一张）/ 1（左侧的一张）/ 0，任何位置都不会出现两张同层由 DOM 顺序决定的情况。
- 指示点：宽度与不透明度从连续位置派生，所有点的总宽度恒定（活动胶囊流动时其他点不挤动）；自动播放的进度条在活动胶囊内，播放完成的那一张保持满格随胶囊流走淡出；点多时窗口跟随当前序号用弹簧平移，窗口边缘的两个点缩到 0.5 / 0.75。点距 16px（UIPageControl 的间距），触屏上点击区域上下各延伸 10px；按主题着色的不活动点不透明度 0.45（浅色背景上约 3.2:1）。叠在图片上的胶囊为 `bg-black/55`，白色数字在纯白图片上约 4.7:1。
- 内置悬停箭头只在指针位于视口上时显示（`.qy-carousel-viewport:hover > 箭头`），悬停同一个 Carousel 里的标题、信息栏不会显示，嵌套轮播互不影响。
- 减少动态效果时 `snap="none"` 不再用 inertia（带越界回弹），直接 200ms 缓动到夹在两端的投影落点。
- `CarouselImage` 的视差在减少动态效果时关闭；`contain` 的模糊衬底在图片加载后淡入（浅色 55%、深色 40% 不透明度）。

### 已知限制

- 只支持横向、从左到右的排布。
- `slidesPerView="auto"` 与断点 gap 同时使用时，测量前按最小断点的间距排布。
- 幻灯片里没有可聚焦元素、且 `arrows="none"`、指示器为 `"none"` / `"fraction"` 时，轮播内没有可以接收键盘焦点的元素，`keyboard` 不起作用（不额外给视口加一个 Tab 停靠点）。
- 鼠标可拖动（`draggable`）时不能拖选幻灯片里的文字；文字为主的轮播传 `draggable={false}`。
- 无头浏览器中 CDP 触摸事件约 80ms 才送达一次，松手前停顿超过 50ms 的规则会把速度判为 0；验证甩动时需要不等待地连续发送触摸事件。

## 验证记录（2026-10-25）

在无头 Chromium 中通过 CDP 发送可信的鼠标、触摸与滚轮事件（rAF 约 61 次 / 500ms），逐帧采样位移；独立场景用页面内的 Turbopack 模块挂载真实的 Carousel，不改仓库代码。

- 手势与物理（桌面 1280）：一次拖过 1.6 页后停住松手落在第 2 页；120px / 80ms 的轻甩翻一页，300px / 60ms 的用力甩也只翻一页；起点向右拖 300px 的橡皮筋峰值 116.8px，松手无过冲回到 0，回弹逐帧最大步长 4.5px；动画途中按下，逐帧位移从每帧约 10px 降到 0 并保持不变（无跳变），松手后滑到目标。
- 触控板：分页时滑过视口宽 8% 回弹、19% 与 37% 翻一页；12 次横向 wheel 中途轻点或拖动，从手势的目标吸附点继续（以前会退回手势开始前的那一张）；`snap="none"` 的 `onSettle` 在真正停下的位置触发（-360px）。
- 按下生命周期：在视口内按下、视口外松开后自动播放继续、横向 wheel 正常响应；之后悬停移动不再拖动、没有 `data-dragging`；双指轻点打断动画后回到吸附点；双指捏合不再翻到上一张。
- 接住动画的轻点不触发幻灯片里的按钮，静止时轻点正常触发；受控 `index={0}` 时父组件拒绝切换，轮播滑回 0；尺寸变化打断切换后补发 `onSettle`，卸载后不再回调。
- 测量：`CarouselContent` 加 `px-6` 时间距仍为 10px；宿主宽 599.6px、断点 `{ 0: 1, 600: 2 }` 时 JS 与容器查询都按每屏 1 张；`autoWidth` 换 key（个数不变）后新节点的尺寸变化被观察到；`autoHeight` 在视口带边框时不再裁掉内容。
- fade：拖到正中间时右侧一张不透明度 0.5、在上层，左侧一张不透明度 1、在下层，合成覆盖率 1（以前约 0.75，浅色下发白）；`crossFade` 正中间两张都为 0。浅色与深色的中途截图都没有透出背景。
- 自动播放：`indicators="none"` 时视口右下角出现「暂停」按钮；指示器在运行时 dots → none 切换后自动播放继续前进（以前冻结）；减少动态效果时默认不播放（按钮为「播放」）。
- 键盘与读屏：焦点在幻灯片内的按钮上连按三次 →，焦点依次落到 btn1、btn2、btn3（以前第一次就落回 body）；标签行在 1280 与 390 宽下 Tab 依次经过全部 20 个标签，每个聚焦时都完整可见，0 个 inert；方向键后焦点仍在行内；货架的播报为「第 1 页，共 3 页」、指示点为「转到第 1 页」；分数指示器读作「第 1 张，共 6 张」；`aria-roledescription` 为「轮播」，tabpanel 幻灯片不设置。
- 悬停：悬停商品图集的「加入购物车」时图片箭头不透明度 0，悬停图片时为 1；首页组件墙卡片（559px）悬停时两侧箭头与标题、说明文字、图标没有重叠（浅色、深色）；禁用的上一张按钮悬停时背景不变。
- 服务端首帧：禁用 JS 与水合后 7 个演示的位置与高度完全一致（推荐语 262px，不再先高后矮）。
- 减少动态效果：自由滚动用力甩到末端不越界（普通模式越界 49px 后回弹）；页面无错误。
- 移动端 390（触摸，dpr 2 / 3）：从图片上开始的横向滑动跟手并翻页；纵向滑动滚动页面（scrollY 182 → 424）且幻灯片不动；轻点暂停按钮不触发拖动；纯触屏隐藏悬停箭头；快速轻甩翻一页，用力甩也只翻一页。
- 截图：桌面 1280 浅色 / 深色全部演示、移动端 390 浅色全部演示与深色减少动态效果、首页卡片悬停、fade 中途；无横向溢出。`/qa-carousel/`、`/components/carousel/`（桌面与移动深色）无控制台错误与水合警告。
- `tsc --noEmit`（项目配置，以及 strict + noUnusedLocals + verbatimModuleSyntax + erasableSyntaxOnly 的 Vite 式配置）与 ESLint 通过；源码不引用 next/*。
