# Masonry · 瀑布流

## 目标

一个通用的瀑布流组件，开箱即用、过渡自然：

- **自适应列数**：按**容器宽度**（不是视口宽度）计算列数，放进侧栏、对话框、分栏里同样正确；也支持固定列数、按容器宽度断点配置。
- **稳定的排布**：最短列优先；已经排进某一列的项保持在该列（稳定列），图片加载、内容展开导致的高度变化只让同列下方的项平移，不会跨列跳动。
- **自然的骨架屏**：首屏加载时用高度错落的骨架块铺满各列；加载更多时把骨架块排进当前最短的几列底部——正是真实内容即将出现的位置；所有骨架共享一道沿对角线扫过整面瀑布流的微光（不是每块各闪各的）。真实内容到达时骨架淡出、内容在同一位置淡入。
- **优雅的过渡**：新项上浮淡入，同一批按屏幕位置自上而下错开；列数变化、筛选、排序、插入、删除时各项沿弹簧从旧位置滑到新位置，可中途改变目标；删除的项缩小淡出。
- **无限加载**：最短一列的底部接近视口时触发 `onLoadMore`（瀑布流里最短的一列最先见底）。
- **配套组件**：`MasonryImage`（保留宽高比占位、加载前显示与骨架同步的微光、加载后柔和淡入去模糊、失败占位）、`MasonrySkeleton`（可组合的骨架块）。

名称 Masonry，registry id `masonry`，分类「内容与媒体」，npm 依赖 `motion`，无 registry 依赖。单文件 `components/qiuye-ui/masonry.tsx`，顶部 `"use client"`。

## API

```tsx
<Masonry
  items={photos}
  getItemKey={(photo) => photo.id}
  renderItem={(photo, index) => <PhotoCard photo={photo} />}
  // 列数（优先级：columns > minColumnWidth 自动计算）
  minColumnWidth={220}          // 默认 220：列数 = floor((宽 + gap) / (minColumnWidth + gap))
  maxColumns={6}                // 自动计算时的上限，默认 6；下限恒为 1
  columns={3}                   // 或 { 0: 2, 640: 3, 1024: 4 }：键为容器宽度（px），取不大于当前宽度的最大键
  gap={16}                      // 列间距，number 或同样的断点对象，默认 16
  rowGap={16}                   // 行间距，默认同 gap
  strategy="shortest"          // "shortest"（最短列优先，默认）| "sequential"（按序轮流放入各列，保持左右阅读顺序）
  loading={isLoading}           // 首屏无数据时铺满骨架；已有数据时在最短的几列底部追加骨架
  skeletonCount={8}             // 默认：首屏 列数 × 3，加载更多时 列数 × 2
  renderSkeleton={(index, { width }) => <MyCardSkeleton />}  // 自定义骨架，高度由内容决定
  hasMore={hasMore}
  onLoadMore={loadMore}         // 最短一列底部进入「视口底部 + loadMoreOffset」时触发；loading 期间不会重复触发
  loadMoreOffset={800}          // px，默认 800
  scrollRoot={scrollerRef}      // 自定义滚动容器的 ref，默认视口
  appear                        // 首次挂载的项是否播放入场，默认 true
  animateLayout                 // 位置变化是否用弹簧过渡，默认 true
  labels={{ loading: "正在加载…" }}
  className                     // 根容器
  itemClassName                 // 每一项的内容容器
/>
```

- **children 模式**：不传 `items` 时，`children` 中每个带 `key` 的元素是一项，适合静态内容：`<Masonry>{cards.map((c) => <Card key={c.id} />)}</Masonry>`。
- **泛型**：`Masonry<T>` 保留 `items` 的类型，`renderItem` / `getItemKey` 的参数随之推断（`forwardRef` 后用类型断言恢复泛型签名）。
- `getItemKey` 默认使用 `item.id ?? item.key ?? index`，开发环境下用到 index 时警告一次（index 作为 key 时排序与删除动画会错位）。
- 断点对象的类型为 `MasonryResponsive<T> = T | Record<number, T>`，`columns` 与 `gap` 共用。
- 导出 `DEFAULT_MASONRY_LABELS`（`{ loading: "正在加载…" }`）。
- ref 转发到根元素（`div`，外壳）。各部分带 `data-slot`：`masonry`（根）、`masonry-list`（内层列表）、`masonry-item`、`masonry-skeleton`、`masonry-image`、`masonry-image-fallback`。

### MasonryImage

```tsx
<MasonryImage
  src="..." alt="..."
  width={1200} height={800}     // 原图尺寸，只用来得出宽高比；或直接传 aspectRatio={3 / 2}
  fit="cover"                   // object-fit，默认 cover
  placeholder="shimmer"         // "shimmer"（默认，与骨架同步的微光）| "none" | 任意 CSS 颜色
  fallback={<span>加载失败</span>}   // 放在铺满容器、居中、bg-muted 的一层中
  imgClassName / className / loading="lazy"（默认）/ decoding="async"（默认）
  // className、style、ref 作用在外层容器，其余 img 属性透传给内部 <img>
/>
```

- 未加载时显示同步微光；加载完成后图片 `opacity 0 → 1`、`scale 1.04 → 1`、`blur(12px) → 0`，约 600ms 缓出。已在缓存中的图片（挂载时 `complete && naturalWidth > 0`）直接显示、不播放过渡。
- 加载失败显示 `fallback`（默认一个居中的图片图标 + 视觉隐藏的 alt），不留下破图标；失败后不再显示占位微光。
- 外层按宽高比占位，图片加载前后高度不变，瀑布流不会因为图片加载而重排。
- 不依赖 `next/image`，就是原生 `<img>`（`decoding="async"`）。

### MasonrySkeleton

一个带微光的骨架块：`<MasonrySkeleton className="h-40 rounded-xl" />`，或 `aspectRatio`；`children` 叠在骨架上（如居中的图标）。在 `renderSkeleton` 里组合多块（图片 + 两行文字）时，它们读取所在项的波前延迟，仍与整面瀑布流的微光同步。也可以在瀑布流之外单独使用（此时各自按自身位置同步）。

## 排布

### 结构

```
div[data-slot=masonry]  根元素（外壳）：className、style、ref 与其余属性；可以有 padding、border
  div[data-slot=masonry-list]  role=list，aria-busy；position: relative; height = 最高列底部
    div（定位层，无类名）  position: absolute; top/left 0; width = 列宽; transform = translate3d(x, y, 0)
      div[data-slot=masonry-item]（内容层，itemClassName）  入场 / 退场动画在这一层
    div（加载哨兵，aria-hidden）
  span[role=status]（视觉隐藏，在列表与 aria-busy 之外）
```

定位层每帧可能被写 transform，所以不挂任何类名、不让子元素依赖 `inherit`（PIT-0010）；入场动画放在内容层，与位置互不覆盖。DOM 顺序就是数据顺序，键盘 Tab 顺序与数据一致。内层列表 `role="list"`，内容层 `role="listitem"`；加载中列表 `aria-busy`。`labels.loading` 状态文本放在列表与 `aria-busy` 之外的视觉隐藏 `role="status"` 中（列表只能拥有 listitem），挂载后才写入文本，首屏加载也会被播报；骨架 `aria-hidden`。

### 计算

- 容器宽度用一个 ResizeObserver 读取内层列表的宽度（即根元素的内容区，根元素的 padding、border 自然生效）。列数：`columns` 为数字或断点对象时直接取；否则自动计算并夹在 `[1, maxColumns]`。列宽 `(宽 − gap × (n − 1)) / n`，第 k 列的 x 为 `k × (列宽 + gap)`。
- 高度：所有定位层共用一个 ResizeObserver（`borderBoxSize`，不受内容层 transform 影响）；新挂载的项在 `useLayoutEffect` 里同步读一次 `offsetHeight`，所以首帧就有正确位置，不会先闪一帧。
- 排布是一个纯函数（放在模块级）：输入 key 序列、高度表、列缓存、列数、列宽、间距、策略，输出每项坐标、各列底部与容器高度。
- **稳定列**：`Map<key, 列号>` 缓存每项所在的列。列数变化时清空；key 序列与上次相比，从第一个不同的位置起之后的项清除缓存（插入、删除、排序只重排受影响的部分）。没有缓存的项放进当前最短的列（`sequential` 时为 `index % n`），高度并列时取最左。
- 高度变化（图片无宽高比、内容展开）只改变同列下方各项的 y，不会跨列跳动。
- 布局更新用 rAF 合并：同一帧内的多次 ResizeObserver 回调只排一次。

### 位置过渡

每个定位层有 x、y 两个 MotionValue。每次排布后对每一项：

| 情况 | 处理 |
| --- | --- |
| 第一次获得位置 | 直接设置，并触发入场 |
| 本次排布中容器宽度变了，但列数没变（连续拖动窗口） | 直接设置，跟手不滞后 |
| 其他位置变化（列数变化、增删、排序、筛选、同宽下的高度变化） | 弹簧过渡（约 `visualDuration 0.5, bounce 0.12`），已有动画时从当前值和速度重新出发 |
| `animateLayout={false}` 或减少动态效果 | 直接设置 |

### 入场与退场

- 入场（内容层）：`opacity 0 → 1`、`y 18 → 0`、`scale 0.96 → 1`、`blur(6px) → 0`，弹簧约 0.55s。同一批新项按屏幕位置（先 y 后 x）排序，延迟 `min(序号 × 35ms, 420ms)`，看起来自上而下流入。
- `appear={false}` 时首次挂载的项直接显示。之后新增的项总会播放入场。
- 退场：删除的项保留在原位置（不再参与排布），`opacity → 0`、`scale → 0.92`、`blur(4px)`，约 220ms 后卸载；期间设为 `inert`（退出 Tab 顺序与无障碍树）。焦点在其中时先移到 DOM 顺序上的下一个可聚焦元素（没有则上一个，再没有则列表本身）。其余项同时滑向新位置；同一次排布中有项在移动时，新项整体推迟约 140ms 入场，先让移动的项让开位置。
- 减少动态效果：入场与退场只做约 200ms 的淡入淡出，没有位移、缩放与模糊（不要用 `useReducedMotion` 切换 `initial`，只切换 transition，见 PIT-0017）。

## 骨架屏

- 骨架是排在真实项之后的「虚拟项」（key 为内部前缀 + 序号），同样走最短列优先，所以加载更多时它们自动填进最短的几列。
- 默认骨架高度在列宽上乘以一组固定的错落比例（如 `1.3, 0.8, 1.55, 1, 1.2, 0.72, 1.4, 0.9` 循环），首屏看起来像真实的瀑布流而不是整齐的格子。`renderSkeleton` 返回的内容按实际高度测量。
- **同步微光**：骨架块与 `MasonryImage` 的占位使用同一个 CSS keyframes（一道柔和的高光从左上扫向右下，约 1.6s 一轮）。定位层根据自身坐标写入一个 CSS 自定义属性作为波前延迟（与 `x + y` 成正比、取负值），内部所有微光元素用它作 `animation-delay`，整面瀑布流上就是一道连续的对角线波，而不是各块同时闪烁。高光颜色由 `--muted` / `--foreground` 用 `color-mix` 派生，浅色深色主题都柔和。
- 真实内容到达时骨架与替代它的内容交叉淡出：每块骨架找与它重叠面积最大的入场项，等该项开始入场（加 50ms）后用对称缓动在 300ms 内淡出；没有重叠的骨架直接约 200ms 淡出。整面墙不会先变空再出现内容，读作骨架「变成」了内容。
- 骨架的 key 带上当前的真实项数：每一轮加载的骨架各自独立，上一轮的骨架在原位置淡出，不会被下一轮复用而滑过刚到达的内容。
- 减少动态效果：不扫光，只保留静态底色。

## 无限加载

- 在最短一列的底部放一个 1px 的绝对定位哨兵，用 `motion/react` 的 `useInView`（`root` 为 `scrollRoot`，`margin` 底部加 `loadMoreOffset`）。进入视口、`hasMore` 且不在 `loading` 时调用 `onLoadMore`。
- 加载完成后如果哨兵仍在视口内（内容不够一屏），在下一次 `loading` 变为 false 时再次触发，直到填满或 `hasMore` 为 false。用一个 ref 防止同一轮重复调用。
- 一轮加载期间只要数据变过（新增、被清空、整体替换）就算有新数据，加载途中「重新加载」或换了搜索条件后到达的第一页也会照常继续填满；数据没有变化（请求失败）时不自动重试。

## 服务端渲染与首帧

- 服务端和水合前不知道容器宽度。首帧用 CSS 多列近似排布（`column-width: minColumnWidth px; column-gap`，项 `break-inside: avoid`），无 JS 时也能看。`appear` 为 true 时，有 JS 的环境（`@media (scripting: enabled)`）下这一帧的真实项不可见（等待入场），避免水合后先显示再消失；骨架始终可见，水合后直接排到瀑布流位置、不重播淡入。
- 水合后在 `useLayoutEffect` 中测量容器并切换到绝对定位，客户端导航时首帧之前就已完成，不会看到近似排布。

## 演示

- **图片瀑布流 + 无限加载**：固定高度的滚动容器（`scrollRoot`），模拟网络延迟，首屏骨架 → 图片淡入；滚到底部自动加载更多，骨架出现在最短的几列底部；加载到上限后显示「没有更多了」。
- **参数调试**：拖动容器宽度（展示自适应列数，实时显示当前列数）、列数模式（自动 / 固定 / 断点）、最小列宽、最大列数、间距、排布策略、入场开关；按钮：追加、随机删除、打乱、模拟加载（显示骨架）、重置；按当前参数生成代码（ViewSourceButton）。
- **筛选与排序**：混合内容卡片（图片卡、引用、笔记、数据卡），按分类筛选与排序时各项沿弹簧滑动，删除的项缩小淡出。
- **自定义骨架**：`renderSkeleton` 组合 `MasonrySkeleton`（封面 + 标题 + 两行文字），微光仍是整面同步的一道波。
- **首页 / 快速预览**：小尺寸瀑布流，彩色渐变块（不依赖网络）循环播放「骨架 → 内容淡入 → 隔几秒打乱一次」。

## 验收

- 375 / 768 / 1280 宽下列数正确；在调试卡片中连续拖动容器宽度时各项跟手、列数变化时滑动过渡。
- 图片无宽高比时加载后只影响同列下方；有宽高比时加载前后不重排。
- 加载更多：骨架出现在最短列，内容到达后同位置淡入；内容不足一屏时会继续加载。
- 筛选 / 排序 / 删除：位置连续（rAF 采样无跳变），退场不残留。
- 减少动态效果：无位移动画，内容可见（opacity 为 1）。
- 浅色 / 深色主题；`pnpm lint`、`tsc --noEmit` 通过；源码可在 Vite 严格 TS 项目中编译（不使用 next/*）。

## 实现记录

### 结构

- `components/qiuye-ui/masonry.tsx` 单文件，导出 `Masonry`、`MasonryImage`、`MasonrySkeleton`、`DEFAULT_MASONRY_LABELS` 及类型 `MasonryResponsive`、`MasonryStrategy`、`MasonryLabels`、`MasonrySkeletonInfo`、`MasonryLayoutInfo`、`MasonryProps`、`MasonryImageProps`、`MasonrySkeletonProps`。
- 根元素只是外壳（`data-slot="masonry"`，接收 `className`、`style`、`ref` 与其余属性），内层 `role="list"` 的列表（`data-slot="masonry-list"`）只包含各项与加载哨兵，由引擎测量宽度、写入高度。这样根元素的 padding、border 自然生效；视觉隐藏的 `role="status"` 是列表的兄弟元素，不在 `role="list"` 与 `aria-busy` 之内。
- 模块级纯函数 `computeMasonryLayout`：输入 key 序列、高度表、上次的 key 序列与列缓存、列数、列宽、间距与策略，输出坐标、新的列缓存、各列底部与容器高度。列数或策略变化时不传上次的缓存；与上次相同的 key 前缀保留原列，之后的项按最短列（并列差值小于半像素时取最左）或 `index % 列数` 重新分配。
- 测量、定位与过渡由模块内的 `MasonryEngine` 直接操作 DOM，不经过 React 渲染：真实项的节点只在 `items` / `renderItem` / `children` 变化时重新生成，列宽变化等内部状态不会重渲染各项。React 状态只保存列数与列宽（用于骨架数量、`renderSkeleton` 的宽度与 `onLayoutChange`）。
- 每一项是「定位层（无类名，只被写 width 与 transform）+ 内容层（`data-slot="masonry-item"`、`itemClassName`、入场与退场）」。定位层未定位前隐藏，避免任何一帧出现在左上角。
- `minColumnWidth`、`maxColumns` 为非有限值（如清空的数字输入得到的 NaN）时退回默认值，列数最终总是不小于 1 的有限整数。

### 测量与排布时机

- 列表与所有定位层各用一个 ResizeObserver。与设计稿的差异：没有把排布推迟到 rAF，而是在 ResizeObserver 回调里同步完成。ResizeObserver 在布局之后、绘制之前触发，同步排布能保证宽度变化与位置更新落在同一帧；推迟到 rAF 会出现一帧「新宽度、旧位置」的重叠。同一个回调中的多条变化只排布一次；容器宽度变化时先写入新列宽并一次性读取所有高度，随后定位层自己的回调发现高度未变会直接跳过，实际每帧只排布一次。
- 每次排布先读后写：写入列宽后一次性读取高度（唯一一次强制布局），再读取微光元素的偏移与动画起始时间，最后统一写入微光相位与位置。原实现在逐项写入 transform 之后立刻读取该项微光元素的偏移，每项一次强制布局；现在一次挂载 15–25 个骨架微光元素的提交只增加 1 次布局（CDP `Performance.getMetrics` 的 LayoutCount）。
- 高度读取用 `getComputedStyle(layer).height`（小数、不受 transform 影响），而不是 `offsetHeight`（取整后会与之后 ResizeObserver 报告的小数高度产生亚像素抖动）。
- 位置按设备像素取整后写入 `translate3d`，静止时文字清晰。
- 设计稿表格之外的细化：
  1. 连续拖动宽度且列数不变时直接设置；但如果某项正处在列数变化触发的弹簧途中，改为从当前值与速度追向新目标，不会被下一帧的直接设置截断。
  2. 目标与当前值相差不到 1px 时直接设置（亚像素修正不启动弹簧）。
- 容器高度也用同一个弹簧过渡（首次排布或减少动态效果时直接设置），筛选减少内容时下方页面平滑上移而不是跳动。连续拖动宽度时与各项同一规则：高度弹簧正在进行时改为追向新目标，不会在下一帧被直接设置，各项不会悬在容器之外被裁掉。

### 入场、退场与 AnimatePresence

- 入场、退场都用 Motion 的 `animate(element, …)` 作用在内容层（WAAPI 加速）：入场 opacity 0.4s、filter 0.45s 缓出，transform 用 `visualDuration 0.55, bounce 0.1` 的弹簧，同一批按 (y, x) 排序、每项错开 35ms、最多 420ms；同一次排布里已有项沿弹簧移动（筛选、插入）时整体再推迟 140ms。退场 220ms、`cubic-bezier(0.32, 0.72, 0, 1)`。动画结束后在 Motion 的 postRender 阶段清掉内联样式，不留下 `blur(0px)` 这类仍会创建合成层的值。
- 入场途中被删除或恢复时，Motion 把被打断的 transform 提交为 `matrix(...)`，与目标 `translateY() scale()` 结构不同，直接作为起点会被解析成 NaN 并跳过过渡。退场与恢复从计算样式还原出同结构的起点（`translateY(ty) scale(s)`）显式传入。
- 首次排布之后挂载的项在注册时就先设为透明，等排布给出位置后再播放入场；`appear` 为 true 时服务端首帧的真实项由样式隐藏（仅在 `scripting: enabled` 时）。
- 退场通过 `usePresence` 拿到移除回调。踩到的坑：AnimatePresence 在它自己的 layout effect（晚于子组件的 layout effect）里才登记退场的 key，如果在子组件的 layout effect 里同步调用移除回调（例如从未定位过的骨架），这次完成会被忽略，而 AnimatePresence 要等所有退场都完成才会卸载，结果后续所有退场的项都残留在 DOM 中。现在完成回调至少推迟到微任务，并且总是调用最新的一个回调。
- 退场的项设为 `inert`（不是 `aria-hidden`）：退出 Tab 顺序与无障碍树。若焦点在其中，等本次提交的排布结束（新项已定位）后先把焦点移到 DOM 顺序上的下一个可聚焦元素，再设 `inert`；对含焦点的祖先直接设 `inert` 会让焦点落到 body。
- StrictMode 的卸载—重挂会拿回同一个 DOM 节点：注销推迟到微任务，同一节点重新注册时沿用原记录，不会重复入场。
- 退场途中又被加回来的项（快速切换筛选）从当前状态恢复，并参与下一次排布滑到新位置。

### 骨架与交接

- 骨架 key 为 `s:<当前真实项数>:<序号>`。最初只用序号时，连续加载（内容不够一屏时自动续页）会让 AnimatePresence 把正在淡出的上一轮骨架「恢复」回来，再沿弹簧以不透明状态从首屏位置滑到新的列底，横穿刚到达的图片（实测 10 个骨架移动 575–846px）。现在每一轮独立，同一轮内重试（项数不变）时原地保留。
- 骨架退场不立即开始：`exit()` 只把骨架放进队列，本次提交的排布算出各入场项的位置与延迟后，每块骨架取与它重叠面积最大的入场项，在其入场延迟 + 50ms 后用 `cubic-bezier(0.45, 0, 0.55, 1)` 在 300ms 内淡出（与内容层的缓出叠加后覆盖度接近 1）；没有重叠的入场项时直接 200ms 淡出。原先骨架 200ms 前快后慢地淡出、内容按最多 420ms 错开入场，中间有约 100–300ms 整面墙接近全空。
- 服务端渲染的骨架在水合前就可见（不受 `appear` 隐藏），水合后直接排到瀑布流位置、不重播淡入（用 `useSyncExternalStore` 的服务端快照判断这次挂载是否来自水合）。

### 骨架微光

- 一个 CSS keyframes：135° 的柔和高光放在 2400px 的方形背景中，1800ms 内沿对角线平移 900px，线性匀速；高光位置以像素计，大小不同的块上扫过的速度一致。高光颜色浅色主题由 `--background` 派生，深色主题由 `--foreground` 派生；骨架底色是 `bg-foreground/6`，可以用 className 覆盖。
- 与设计稿的差异：波前延迟不是只写在定位层上供子元素继承，而是由瀑布流在定位时写到每个微光元素自己身上（`--qy-masonry-wave`）。延迟 = 该元素在瀑布流中的 (x + y) 换算成的时间，再减去该元素 CSS 动画实际开始的时间（`getAnimations()` 读取 startTime，尚未开始时取当前时间线时间），取 (−1800ms, 0] 内的值。这样同一项内的封面与文字行、以及不同时间挂载的骨架和图片占位都落在同一道对角线波上，也避免了改动定位层上可继承的自定义属性导致整个子树重算样式。
- `MasonryImage` 加载完成时冻结高光（`animation-play-state: paused`）而不是移除动画，高光随占位的 420ms 淡出一起消失，不会在一帧内跳回起点；加载失败时不再渲染占位。
- 单独使用的 `MasonrySkeleton` / `MasonryImage` 按自身在页面中的位置对齐。减少动态效果时不扫光，只保留底色。

### 无限加载

- 哨兵是列表内 1px 的绝对定位元素，放在最短一列底部，`useInView`（`root` 为 `scrollRoot`，下边距加 `loadMoreOffset`）检测。
- 内容刚变化（loading 结束或项数变化）时 IntersectionObserver 的结果还没更新，此时按哨兵的几何位置判断是否仍在范围内，避免用旧的「在视口内」结果连续多加载一页。
- 一轮加载期间只要项数或最后一项的 key 与发起时不同就记为「数据变过」。只比较结束时是否变多不够：加载途中「重新加载」把列表清空后，到达的第一页恰好与之前一样多（12 = 12），原实现判断为没有新数据而不再续页，内容不足一屏时永远停在 12 张。数据没有变化（请求失败）时仍然不自动重试，等哨兵再次进入视口。

### API 补充

- 新增可选属性 `onLayoutChange(info: { columns, columnWidth, width })`：列数或列宽变化时触发，参数调试演示用它实时显示当前列数。
- `MasonrySkeleton` 渲染 `children`（叠在骨架上）；`MasonryImage` 的 `fallback` 放在铺满容器、居中、`bg-muted` 底色的一层中（`data-slot="masonry-image-fallback"`），`decoding` 默认 `"async"`，`className`、`style`、`ref` 作用在外层容器。其余 API 与设计稿一致。

### 演示

- 快速预览：20 个彩色渐变块（不依赖网络），容器宽度断点 2 / 3 / 4 / 5 列；循环「骨架微光 1.9s → 自上而下入场 → 每 3.5s 打乱，共 3 次 → 回到骨架」，离开视口时暂停，减少动态效果时直接显示内容。外框用 `overflow-clip` 而不是 `overflow-hidden`，程序滚动或页内查找不会把内容卷走。整个预览是纯装饰，设为 `aria-hidden` + `inert`，读屏器不会每轮播报「正在加载」。
- 完整演示：图片瀑布流 · 无限加载（自定义滚动容器可用键盘聚焦并有可访问名称、模拟 0.9–1.5s 延迟、共 60 张；示例代码的首屏请求可取消，`loadMore` 用 try / finally 结束 loading）、参数调试（拖动或用方向键 / PageUp / PageDown / Home / End 调整虚线框宽度，列数模式、最小列宽、最大列数、间距、策略、位置过渡、首次入场，追加 / 随机删除 / 打乱 / 模拟加载 / 重置，按当前参数生成代码）、筛选与排序（图片、引用、笔记、数据卡混排，可移除与恢复）、自定义骨架（骨架文字条放在与真实文字同高的行盒里，骨架与卡片等高）、children 模式 · 内容展开（文字卡片没有宽高比提示）。
- 参数调试的虚线框限制高度（窄屏 440px、宽屏 600px），超出时在框内滚动：拖动把手始终在可见范围内，窄屏上参数控件紧跟在框下方。曾尝试让把手竖条 sticky 贴住视口，但站点的 `main` 带横向 overflow 隐藏（使其成为滚动容器），sticky 不生效，因此改为限高。触屏上把手可点区域 44px；拖动处理了 PIT-0011（触摸时内部竖条的 `lostpointercapture` 冒泡上来不会结束拖动）。
- 演示中的编号用 ref 分配，「模拟加载」定时器里追加时不会拿到旧编号而产生重复 key；移除按钮带卡片标题作为可访问名称，视觉 24px、可点区域 44px；分段控件都有可访问名称。

### 已知限制

- `appear={false}` 且服务端渲染时，水合前看到的是 CSS 多列近似排布，水合后各项直接跳到瀑布流位置（未做从近似位置的过渡）；服务端渲染的骨架同样直接重排。
- 图片占位在 `src` 变化后重新开始的微光，要等该项下一次位置或尺寸变化时才会重新对齐相位。
- 同一页面上的多个 Masonry 各自以自己的列表为波前原点。
- 每个定位层都是 `translate3d` 合成层，没有虚拟化；几十到一两百项没有问题，极长的信息流需要配合分页或虚拟化。
- 不支持 `@media (scripting)` 的旧浏览器在服务端渲染后、水合前会先看到真实项，水合后再播放入场。

## 验证记录（2026-10-25）

- 环境：无头 Chromium（CDP 脚本），`next dev`，临时路由 `/qa-masonry/`、详情页 `/components/masonry/`、首页组件墙。1280×900 浅色 / 深色 / 减少动态效果；390×844 DPR 3 触摸，浅色 / 深色。逐帧数据在绘制前（ResizeObserver 回调中）采样。
- 加载途中重新加载：图片瀑布流在第二页请求进行中点击「重新加载」，3/3 次都继续加载到 24 张、哨兵位于可视区域 + 偏移量之外（修复前 3/3 停在 12 张）。
- 骨架交接：重新加载时记录所有骨架节点，可见期间最大位移 0px（修复前 575–846px）；每个骨架位置的覆盖度（骨架不透明度 + 重叠内容的不透明度）最低 0.98，自定义骨架 9 个位置、模拟加载 6 个位置同为 0.98，整面墙平均最低 0.99；减少动态效果下 1.00。自定义骨架与真实卡片的位置与高度偏差全部为 0。
- 连续拖动跨越列数断点（3 → 4 → 3 列）：各项最低点超出容器高度最多 0.49px（修复前 246px）；同列数内各项跟手。
- 入场途中删除：退场的 scale 0.948 → 0.921、translateY 12.8 → 0.3px 连续过渡，没有 NaN 警告（修复前 transform 直接跳到终值并有警告）。
- 根元素 `p-6` + 6px 边框：各项到内容区四边的距离为 0 / −0.33 / 0 / 0px（−0.33 为设备像素取整）。
- `minColumnWidth`、`maxColumns` 为 NaN：正常排布（1280 宽 4 列），无报错。
- 焦点：键盘 Enter 移除带焦点的卡片后，焦点移到下一张卡片的移除按钮（`:focus-visible`），不落到 body、不在 inert 内；移除最后一张时聚焦列表；移除下一张卡片后立即 Tab 会跳过退场中的卡片。
- 无障碍：所有实例的 `role="status"` 都是根元素的子元素，不在列表与 `aria-busy` 之内；状态文本依次为空 → 「正在加载…」→ 空。axe-core 4.11 在 QA 页面上没有 `aria-required-children` 等结构问题，剩下的 `color-contrast` 只来自共享的 SegmentedControl 未选中项（演示自身的低对比度文字已修正）。首页与详情页的快速预览带 `aria-hidden` + `inert`。
- 图片加载失败：占位不再渲染、没有运行中的动画，显示失败层。
- 无 JS（禁用脚本）：8 个实例的所有项与骨架都可见（近似排布）。有 JS 硬加载：水合前 9 个骨架可见，水合后 15 个骨架全部不透明，没有闪烁。
- 性能：一次挂载 15–25 个骨架微光元素的提交，LayoutCount 只增加 1。
- 打乱两次（间隔 220ms）：18 块全部沿连续轨迹移动（每块 137–152 个不同位置），被打断时保留速度改向，约 1.2s 静止；减少动态效果下一跳到位，所有内容 opacity 为 1、无扫光、内容层无内联样式。筛选「图片 → 全部」时新项约 156ms 后才开始出现（移动的项先让开）。
- 微光相位：图片瀑布流骨架相位差 0、自定义骨架 45 个微光元素相位差 ≤ 1（1280 与 390 宽，浅色与深色）。
- 列数：1280 宽各演示 5 / 5 / 5 / 5 / 4 列；390 宽预览 3 列、其余 2 列；无横向滚动。
- 触屏（390，DPR 3）：参数调试的框高 440px，把手竖条在视口内，参数控件紧跟在框下方；从竖条开始的触摸拖动全程跟手（15 次更新，326 → 236px）。桌面一列时框高 600px，把手竖条在可见范围内。
- 详情页与首页：快速预览正常循环，无 Masonry 相关的控制台错误。
- `npx tsc --noEmit -p .` 与 `npx eslint` 对 Masonry 相关文件均无问题；文档与源码中没有占位用的任意值类名（PIT-0014）。
