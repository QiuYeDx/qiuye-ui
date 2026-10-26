import {
  ComponentId,
  basicUsageExamples,
  type BasicUsageExample,
} from "./component-constants";

export interface PropDefinition {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: string;
}

export interface ComponentPropsInfo {
  componentName: string;
  props: PropDefinition[];
}

export const COMPONENT_CATEGORIES = [
  "选择与切换",
  "浮层与引导",
  "内容与媒体",
  "视觉与动效",
] as const;

export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number];

export interface ComponentInfo {
  name: string;
  description: string;
  category: ComponentCategory;
  dependencies: string[];
  files: {
    component: string;
    demo?: string;
    types?: string;
  };
  // 支持单组件和多组件两种格式
  // 单组件：props 为 PropDefinition 数组
  // 多组件：propsInfo 为 ComponentPropsInfo 数组
  props?: PropDefinition[];
  propsInfo?: ComponentPropsInfo[];
  version: string;
  author: string;
  tags: string[];
  cliName: string; // CLI 命令中使用的名称
  basicUsage?: BasicUsageExample; // 基础用法示例
}

export interface ComponentRegistry {
  [key: string]: ComponentInfo;
}

const matrixEffectRuntimeProps: PropDefinition[] = [
  {
    name: "playing",
    type: "boolean",
    description: "是否允许动态 Source 连续播放",
    required: false,
    default: "true",
  },
  {
    name: "frameRate",
    type: '"auto" | 30 | 60',
    description: "固定目标帧率，或根据渲染负载在 30/60 FPS 间自适应",
    required: false,
    default: '"auto"',
  },
  {
    name: "maxDpr",
    type: "number",
    description: "输出 Canvas 使用的最大设备像素比",
    required: false,
    default: "2",
  },
  {
    name: "pauseWhenOffscreen",
    type: "boolean",
    description: "组件离开视口后是否暂停连续绘制",
    required: false,
    default: "true",
  },
  {
    name: "reducedMotion",
    type: '"freeze" | "ignore"',
    description: "系统偏好减少动态效果时冻结画面或忽略该偏好",
    required: false,
    default: '"freeze"',
  },
  {
    name: "canvasClassName",
    type: "string",
    description: "输出 Canvas 的额外类名",
    required: false,
  },
  {
    name: "decorative",
    type: "boolean",
    description: "是否把输出 Canvas 标记为纯装饰内容",
    required: false,
    default: "true",
  },
  {
    name: "ariaLabel",
    type: "string",
    description: "decorative=false 时描述 Canvas 内容的无障碍标签",
    required: false,
  },
  {
    name: "fallback",
    type: "React.ReactNode",
    description: "尚无成功帧且组件发生错误时显示的替代内容",
    required: false,
  },
  {
    name: "onStatusChange",
    type: "(status: MatrixEffectStatus) => void",
    description: "idle、loading、ready 或 error 生命周期状态变化回调",
    required: false,
  },
  {
    name: "onReady",
    type: "() => void",
    description: "每个 Source 首次成功绘制后的回调",
    required: false,
  },
  {
    name: "onError",
    type: "(error: MatrixEffectError) => void",
    description: "发生结构化 Source 或管线错误时的回调",
    required: false,
  },
  {
    name: "className",
    type: "string",
    description: "根容器的额外类名；应提供明确高度或宽高比",
    required: false,
  },
  {
    name: "style",
    type: "React.CSSProperties",
    description: "根容器的内联样式",
    required: false,
  },
];

// 组件注册表
export const componentRegistry: ComponentRegistry = {
  [ComponentId.MASONRY]: {
    name: "Masonry",
    description:
      "通用瀑布流：按容器宽度自适应列数（也支持固定列数与断点），最短列优先且已排入的项保持在原列，图片加载只让同列下方平移；自带高度错落的骨架屏，整面共享一道对角线微光，加载更多时骨架落在最短的几列底部，并与到达的内容原地交叉淡出；新项自上而下错开上浮淡入，列数变化、筛选、排序与增删时各项沿可打断的弹簧滑到新位置；最短一列接近底部时触发无限加载，配套 MasonryImage 与 MasonrySkeleton。",
    category: "内容与媒体",
    dependencies: ["motion"],
    files: {
      component: "components/qiuye-ui/masonry.tsx",
      demo: "components/qiuye-ui/demos/masonry-demo.tsx",
    },
    propsInfo: [
      {
        componentName: "Masonry",
        props: [
          {
            name: "items",
            type: "readonly T[]",
            description: "数据列表，按 renderItem 渲染每一项；不传时使用 children 中每个带 key 的元素作为一项。",
            required: false,
          },
          {
            name: "getItemKey",
            type: "(item: T, index: number) => React.Key",
            description: "返回每一项的稳定 key。默认依次尝试 item.id、item.key，都没有时退回下标（开发环境警告一次，下标作为 key 时排序与删除的过渡会错位）。",
            required: false,
          },
          {
            name: "renderItem",
            type: "(item: T, index: number) => ReactNode",
            description: "渲染单个数据项，高度由内容决定（无需宽高比提示，组件会测量）。",
            required: false,
          },
          {
            name: "children",
            type: "ReactNode",
            description: "children 模式：不传 items 时，每个带 key 的子元素是一项，适合静态内容。",
            required: false,
          },
          {
            name: "minColumnWidth",
            type: "number",
            description: "自动计算列数时的最小列宽（px）：列数 = floor((容器宽 + gap) / (minColumnWidth + gap))，再夹在 [1, maxColumns]。设置了 columns 时不生效。",
            required: false,
            default: "220",
          },
          {
            name: "maxColumns",
            type: "number",
            description: "自动计算列数时的上限。",
            required: false,
            default: "6",
          },
          {
            name: "columns",
            type: "number | Record<number, number>",
            description: "固定列数，或按容器宽度断点配置（如 { 0: 2, 640: 3, 1024: 4 }，取不大于当前容器宽度的最大键）；优先于 minColumnWidth 自动计算。",
            required: false,
          },
          {
            name: "gap",
            type: "number | Record<number, number>",
            description: "列间距（px），也可以按容器宽度断点配置。",
            required: false,
            default: "16",
          },
          {
            name: "rowGap",
            type: "number | Record<number, number>",
            description: "行间距（px），也可以按容器宽度断点配置。",
            required: false,
            default: "与 gap 相同",
          },
          {
            name: "strategy",
            type: "\"shortest\" | \"sequential\"",
            description: "排布策略：shortest 放进当前最短的一列（高度并列取最左）；sequential 按序号轮流放入各列，保持左右阅读顺序。",
            required: false,
            default: "\"shortest\"",
          },
          {
            name: "loading",
            type: "boolean",
            description: "是否在加载中：没有数据时铺满骨架，已有数据时在最短的几列底部追加骨架；内容到达时每块骨架与替代它的内容原地交叉淡出。加载期间不会重复触发 onLoadMore，内层列表带 aria-busy。",
            required: false,
            default: "false",
          },
          {
            name: "skeletonCount",
            type: "number",
            description: "加载中显示的骨架数量。",
            required: false,
            default: "首屏为 列数 × 3，加载更多时为 列数 × 2",
          },
          {
            name: "renderSkeleton",
            type: "(index: number, info: { width: number; columns: number }) => ReactNode",
            description: "自定义骨架，高度由返回内容决定；可组合多个 MasonrySkeleton，它们与整面瀑布流的微光保持同步。默认骨架高度为列宽乘以一组错落的比例。",
            required: false,
          },
          {
            name: "hasMore",
            type: "boolean",
            description: "是否还有更多数据；为 false 时不再触发 onLoadMore。",
            required: false,
            default: "true",
          },
          {
            name: "onLoadMore",
            type: "() => void",
            description: "最短一列的底部进入「可视区域底部 + loadMoreOffset」时触发；一轮加载结束后内容仍不够填满时继续触发，加载途中数据被清空或整体替换（重新加载、换了搜索条件）也会照常继续；数据没有变化（如请求失败）时不自动重试，等哨兵再次进入视口。建议同时传入 loading。",
            required: false,
          },
          {
            name: "loadMoreOffset",
            type: "number",
            description: "提前触发 onLoadMore 的距离（px）。",
            required: false,
            default: "800",
          },
          {
            name: "scrollRoot",
            type: "RefObject<Element | null>",
            description: "自定义滚动容器的 ref，用于判断加载哨兵是否接近底部；不传时以视口为准。",
            required: false,
          },
          {
            name: "appear",
            type: "boolean",
            description: "首次挂载的项是否播放入场；之后新增的项总会播放入场。服务端渲染时，为 true 的项在水合前隐藏、等待入场（禁用 JS 时仍以近似排布显示）；骨架始终可见。",
            required: false,
            default: "true",
          },
          {
            name: "animateLayout",
            type: "boolean",
            description: "位置变化（列数变化、增删、排序、筛选）是否沿弹簧过渡；为 false 或系统开启减少动态效果时直接到位。连续拖动容器宽度且列数不变时总是直接跟手。",
            required: false,
            default: "true",
          },
          {
            name: "labels",
            type: "Partial<MasonryLabels>",
            description: "覆盖界面文案，未传的字段使用 DEFAULT_MASONRY_LABELS（loading：「正在加载…」，由列表之外的视觉隐藏 role=\"status\" 区域在加载开始时播报）。",
            required: false,
          },
          {
            name: "itemClassName",
            type: "string",
            description: "每一项内容容器的类名，入场与退场动画作用在这一层。",
            required: false,
          },
          {
            name: "onLayoutChange",
            type: "(info: { columns: number; columnWidth: number; width: number }) => void",
            description: "列数或列宽变化时触发，可用于显示当前列数等。",
            required: false,
          },
          {
            name: "className",
            type: "string",
            description: "根元素（外壳）的类名；padding、border 都可以使用，各项排在内容区内，高度由组件按内容管理。",
            required: false,
          },
          {
            name: "ref",
            type: "Ref<HTMLDivElement>",
            description: "转发到根元素（外壳，data-slot=\"masonry\"）；各项在其内层的 role=\"list\" 元素（data-slot=\"masonry-list\"）中。",
            required: false,
          },
          {
            name: "...props",
            type: "HTMLAttributes<HTMLDivElement>",
            description: "其他原生 div 属性（style、id、data-*、aria-* 等）作用在根元素上。",
            required: false,
          },
        ],
      },
      {
        componentName: "MasonryImage",
        props: [
          {
            name: "src",
            type: "string",
            description: "图片地址（类型上可选，实际使用时都应传入）。",
            required: false,
          },
          {
            name: "alt",
            type: "string",
            description: "替代文本；使用默认失败占位时以视觉隐藏的方式保留。",
            required: false,
          },
          {
            name: "width",
            type: "number",
            description: "原图宽度，与 height 一起只用来得出宽高比，加载前后高度不变、瀑布流不会重排。",
            required: false,
          },
          {
            name: "height",
            type: "number",
            description: "原图高度，与 width 一起只用来得出宽高比。",
            required: false,
          },
          {
            name: "aspectRatio",
            type: "number",
            description: "宽高比（宽 / 高），优先于 width / height；都不传时加载前按 4 : 3 占位，加载后改为图片的真实比例。",
            required: false,
          },
          {
            name: "fit",
            type: "CSSProperties[\"objectFit\"]",
            description: "图片的 object-fit。",
            required: false,
            default: "\"cover\"",
          },
          {
            name: "placeholder",
            type: "\"shimmer\" | \"none\" | string",
            description: "加载前的占位：shimmer 为与骨架同步的微光，none 不显示，其他字符串作为占位背景色。",
            required: false,
            default: "\"shimmer\"",
          },
          {
            name: "fallback",
            type: "ReactNode",
            description: "加载失败时显示的内容，放在铺满容器、内容居中、bg-muted 底色的一层中；默认为图片图标。失败后不再显示占位微光，不留下破图标。",
            required: false,
          },
          {
            name: "loading",
            type: "\"lazy\" | \"eager\"",
            description: "原生懒加载。",
            required: false,
            default: "\"lazy\"",
          },
          {
            name: "decoding",
            type: "\"async\" | \"sync\" | \"auto\"",
            description: "原生图片解码方式。",
            required: false,
            default: "\"async\"",
          },
          {
            name: "className",
            type: "string",
            description: "外层容器（宽高比占位、圆角裁切）的类名；style 与 ref 同样作用在外层容器上。",
            required: false,
          },
          {
            name: "imgClassName",
            type: "string",
            description: "内部 <img> 的类名。",
            required: false,
          },
          {
            name: "...props",
            type: "ImgHTMLAttributes",
            description: "其他原生 <img> 属性（srcSet、sizes、onLoad、onError 等）透传给内部图片。",
            required: false,
          },
        ],
      },
      {
        componentName: "MasonrySkeleton",
        props: [
          {
            name: "aspectRatio",
            type: "number",
            description: "宽高比（宽 / 高）；也可以直接用 className 或 style 指定高度。",
            required: false,
          },
          {
            name: "className",
            type: "string",
            description: "尺寸、圆角与底色都可覆盖（默认 rounded-lg、半透明前景色底）。在瀑布流内按所在位置对齐微光，单独使用时按自身在页面中的位置对齐；减少动态效果时只保留静态底色。",
            required: false,
          },
          {
            name: "children",
            type: "ReactNode",
            description: "叠在骨架上的内容（如居中的图标），可选。",
            required: false,
          },
          {
            name: "...props",
            type: "HTMLAttributes<HTMLDivElement>",
            description: "其他原生 div 属性；ref 转发到该元素。",
            required: false,
          },
        ],
      },
    ],
    version: "1.0.0",
    author: "QiuYeDx",
    tags: ["瀑布流", "masonry", "骨架屏", "无限加载", "自适应列数", "图片墙", "布局过渡"],
    cliName: "masonry",
    basicUsage: basicUsageExamples[ComponentId.MASONRY],
  },
  [ComponentId.CAROUSEL]: {
    name: "Carousel",
    description:
      "通用轮播图，手感对标 iOS 分页滚动：拖拽与触摸 1:1 跟手、纵向滑动交还页面，两端橡皮筋阻尼，松手按速度投影吸附并可中途接住；支持不复制节点的无限循环、每屏多张与断点、居中 / 起始对齐、按张 / 按页吸附与自由惯性滚动、渐隐与中心缩放、图片视差与自动高度；内置悬停箭头、随拖动连续变形并显示自动播放进度的指示点、分数指示、触控板与键盘；配套 CarouselImage 提供 cover / contain（模糊衬底）、懒加载与骨架。",
    category: "内容与媒体",
    dependencies: ["motion", "lucide-react"],
    files: {
      component: "components/qiuye-ui/carousel.tsx",
      demo: "components/qiuye-ui/demos/carousel-demo.tsx",
    },
    propsInfo: [
      {
        componentName: "Carousel",
        props: [
          {
            name: "loop",
            type: "boolean",
            description: "无限循环：每张幻灯片自己绕回，不复制节点；轨道总长不足「视口宽 + 最宽的一张」时自动退化为不循环（开发环境警告一次）。",
            required: false,
            default: "false",
          },
          {
            name: "autoplay",
            type: "boolean | { delay?: number; pauseOnHover?: boolean; stopOnInteraction?: boolean; ignoreReducedMotion?: boolean }",
            description: "自动播放。true 为 5 秒一张、悬停暂停；悬停（仅可悬停的指针）、键盘聚焦、拖动、离开视口、标签页隐藏时暂停并从剩余时间继续，活动指示点内显示进度并带暂停 / 播放按钮；系统开启减少动态效果时默认不播放（除非 ignoreReducedMotion）；stopOnInteraction 时用户手动切换后不再自动播放。",
            required: false,
            default: "false",
          },
          {
            name: "slidesPerView",
            type: "number | \"auto\" | Record<number, number>",
            description: "每屏显示的幻灯片数：数字可为小数（如 1.15 露出下一张）；\"auto\" 按每张内容或 className 的宽度排布；断点对象如 { 0: 1.15, 640: 2, 1024: 3 }，键为视口容器宽度（px），服务端首帧用容器查询摆好。",
            required: false,
            default: "1",
          },
          {
            name: "gap",
            type: "number | Record<number, number>",
            description: "幻灯片间距（px），可为断点对象。",
            required: false,
            default: "0",
          },
          {
            name: "align",
            type: "\"start\" | \"center\"",
            description: "吸附点的对齐方式；start 且不循环时末尾不留空白，多个末尾位置合并为一个吸附点。",
            required: false,
            default: "\"start\"",
          },
          {
            name: "snap",
            type: "\"slide\" | \"page\" | \"none\"",
            description: "吸附方式：每张一个吸附点、每屏一组一个吸附点，或自由惯性滚动（UIScrollView 减速率，两端回弹）。吸附步长接近一屏时按分页处理：松手只在当前位置两侧的两页之间选择（轻甩按方向翻页，用力甩也只到下一页，慢慢松手落在最近的一页）。分页类模式停稳后视口外的幻灯片为 inert；none（以及 slidesPerView=\"auto\"）时保持可 Tab，聚焦时滚入视野。",
            required: false,
            default: "\"slide\"",
          },
          {
            name: "effect",
            type: "\"slide\" | \"fade\" | \"scale\"",
            description: "切换效果：平移；叠在同一位置淡入淡出（附带极轻的缩放；固定每屏 1 张、align=\"start\"，snap=\"none\" 按 \"slide\" 处理，不做视差）；两侧缩小并压暗（适合 align=\"center\" + 小数 slidesPerView）。",
            required: false,
            default: "\"slide\"",
          },
          {
            name: "crossFade",
            type: "boolean",
            description: "effect=\"fade\" 时两张同时淡出淡入（先淡出再淡入，中途不重叠），用于背景透明的幻灯片（如纯文字）。默认只淡化上面一张、下面一张保持不透明，图片幻灯片切换途中不会透出背景。",
            required: false,
            default: "false",
          },
          {
            name: "parallax",
            type: "number",
            description: "视差比例（0–0.5）：CarouselImage 随拖动反向轻移，仅 fit=\"cover\" 时生效，减少动态效果时关闭。",
            required: false,
            default: "0",
          },
          {
            name: "autoHeight",
            type: "boolean",
            description: "视口高度随当前幻灯片的自然高度连续过渡，拖动时同样连续。",
            required: false,
            default: "false",
          },
          {
            name: "arrows",
            type: "\"hover\" | \"always\" | \"none\"",
            description: "内置箭头：hover 在可悬停设备上悬停或键盘聚焦时淡入并从外侧滑入（纯触屏隐藏）；always 始终显示；none 不显示（可改用 CarouselPrevious / CarouselNext 放到任意位置）。",
            required: false,
            default: "\"hover\"",
          },
          {
            name: "indicators",
            type: "\"dots\" | \"fraction\" | \"none\"",
            description: "内置指示器：随拖动连续变形的指示点、「3 / 12」分数，或不显示。自动播放时指示器内带暂停 / 播放按钮；为 none 且没有放置 CarouselIndicators / CarouselAutoplayToggle 时，视口右下角补一个独立的暂停按钮（WCAG 2.2.2）。",
            required: false,
            default: "\"dots\"",
          },
          {
            name: "indicatorsPlacement",
            type: "\"inside\" | \"outside\"",
            description: "内置指示器的位置：叠在内容底部（深色半透明模糊胶囊 + 白色点），或视口下方（按主题着色）。",
            required: false,
            default: "\"inside\"",
          },
          {
            name: "maxDots",
            type: "number",
            description: "指示点最多显示的个数，超出时只显示跟随当前位置滑动的窗口，边缘的点缩小。",
            required: false,
            default: "9",
          },
          {
            name: "draggable",
            type: "boolean",
            description: "鼠标拖拽。",
            required: false,
            default: "true",
          },
          {
            name: "swipe",
            type: "boolean",
            description: "触摸 / 触控笔滑动。",
            required: false,
            default: "true",
          },
          {
            name: "wheel",
            type: "boolean",
            description: "触控板横向滑动、Shift + 滚轮：1:1 跟随，停止 150ms 后吸附（分页时滑过 15% 视口宽即朝滑动方向翻页）；纵向滚轮始终交还页面。",
            required: false,
            default: "true",
          },
          {
            name: "keyboard",
            type: "boolean",
            description: "焦点在轮播内（不在输入框中）时用 ← → Home End 切换；焦点在幻灯片内时跟到新的吸附点（不会因原幻灯片变为 inert 而丢到 body）。",
            required: false,
            default: "true",
          },
          {
            name: "selectOnClick",
            type: "boolean",
            description: "点击未选中的幻灯片时切换到它（中心聚焦常用），该次点击不会触发幻灯片内的链接。",
            required: false,
            default: "false",
          },
          {
            name: "index",
            type: "number",
            description: "当前吸附点序号（受控）。用户操作时先移动并调用 onIndexChange；父组件没有写回新值（拒绝这次切换）时滑回该值。值变化时以动画滑到对应位置（循环时走最短方向）。",
            required: false,
          },
          {
            name: "defaultIndex",
            type: "number",
            description: "初始吸附点序号（非受控）。",
            required: false,
            default: "0",
          },
          {
            name: "onIndexChange",
            type: "(index: number) => void",
            description: "吸附点序号变化时调用（松手、点击箭头等决定目标时，而不是停稳后）。",
            required: false,
          },
          {
            name: "onSettle",
            type: "(index: number) => void",
            description: "动画停稳后调用。",
            required: false,
          },
          {
            name: "apiRef",
            type: "Ref<CarouselApi>",
            description: "外部控制：{ index, count, slideCount, canPrev, canNext, playing, next, prev, goTo, goToSlide, play, pause, position, autoplayProgress }。",
            required: false,
          },
          {
            name: "labels",
            type: "Partial<CarouselLabels>",
            description: "界面与读屏文案（region、roleDescription、slideRoleDescription、slide、page、previous、next、goTo、goToPage、indicators、play、pause），未提供的字段使用 DEFAULT_CAROUSEL_LABELS；吸附点与幻灯片不是一一对应时（每屏多张、按页）播报与指示点用 page / goToPage。",
            required: false,
          },
          {
            name: "aria-label",
            type: "string",
            description: "根元素（role=\"region\"）的无障碍名称，覆盖 labels.region。",
            required: false,
          },
          {
            name: "className",
            type: "string",
            description: "根元素（role=\"region\"）的类名；拖动中根元素带 data-dragging。",
            required: false,
          },
          {
            name: "children",
            type: "ReactNode",
            description: "CarouselContent，以及放在任意位置的 CarouselPrevious / CarouselNext / CarouselIndicators / 自定义控件。",
            required: true,
          },
        ],
      },
      {
        componentName: "CarouselContent",
        props: [
          {
            name: "className",
            type: "string",
            description: "视口的类名：尺寸、宽高比与圆角写在这里（如 aspect-video rounded-2xl）。",
            required: false,
          },
          {
            name: "trackClassName",
            type: "string",
            description: "轨道（所有幻灯片的容器）的类名。",
            required: false,
          },
          {
            name: "children",
            type: "ReactNode",
            description: "每个直接子元素是一张幻灯片；不是 CarouselItem 时自动包一层。",
            required: true,
          },
        ],
      },
      {
        componentName: "CarouselItem",
        props: [
          {
            name: "className",
            type: "string",
            description: "幻灯片的类名；slidesPerView=\"auto\" 时可用宽度类（如 w-64）指定宽度。分页类模式下停稳后完全不在视口内的幻灯片带 inert 与 aria-hidden（snap=\"none\" 或 slidesPerView=\"auto\" 时不设置）；可见的带 data-visible，属于当前吸附点的带 data-active。幻灯片自身 tabIndex=-1，键盘切换后焦点可落在上面（内侧描边）。",
            required: false,
          },
          {
            name: "...props",
            type: "HTMLAttributes<HTMLDivElement>",
            description: "其他 div 属性。",
            required: false,
          },
        ],
      },
      {
        componentName: "CarouselPrevious / CarouselNext",
        props: [
          {
            name: "children",
            type: "ReactNode",
            description: "替换默认的 Chevron 图标。",
            required: false,
          },
          {
            name: "className",
            type: "string",
            description: "按钮类名；默认是普通的行内圆形按钮（size-8），放在 Carousel 内任意位置。非循环到达两端时 aria-disabled 并降低不透明度，仍可聚焦。",
            required: false,
          },
          {
            name: "...props",
            type: "ButtonHTMLAttributes",
            description: "其他原生 button 属性；onClick 中调用 preventDefault() 可阻止默认切换。",
            required: false,
          },
        ],
      },
      {
        componentName: "CarouselIndicators",
        props: [
          {
            name: "type",
            type: "\"dots\" | \"fraction\"",
            description: "指示器类型，默认跟随 Carousel 的 indicators（为 none 时使用 dots）。",
            required: false,
          },
          {
            name: "appearance",
            type: "\"plain\" | \"overlay\"",
            description: "外观：按主题着色，或深色半透明模糊胶囊 + 白色点（叠在图片上）。",
            required: false,
            default: "\"plain\"",
          },
          {
            name: "playButton",
            type: "boolean",
            description: "自动播放时是否在指示器旁显示暂停 / 播放按钮。",
            required: false,
            default: "true",
          },
          {
            name: "maxDots",
            type: "number",
            description: "指示点最多显示的个数，默认跟随 Carousel 的 maxDots。",
            required: false,
          },
          {
            name: "className",
            type: "string",
            description: "容器类名；默认是普通的行内元素，可放在 Carousel 内任意位置。分数指示对读屏隐藏视觉上的数字，改读完整的「第 3 张，共 12 张」。",
            required: false,
          },
        ],
      },
      {
        componentName: "CarouselAutoplayToggle",
        props: [
          {
            name: "appearance",
            type: "\"plain\" | \"overlay\"",
            description: "外观：按主题着色的圆形按钮，或深色半透明模糊圆形按钮（叠在图片上）。",
            required: false,
            default: "\"plain\"",
          },
          {
            name: "children",
            type: "ReactNode",
            description: "替换默认的暂停 / 播放图标。",
            required: false,
          },
          {
            name: "className",
            type: "string",
            description: "按钮类名；放在 Carousel 内任意位置，未开启 autoplay（或只有一屏）时不渲染。挂载后 Carousel 不再在 indicators=\"none\" 时补内置的暂停按钮。",
            required: false,
          },
          {
            name: "...props",
            type: "ButtonHTMLAttributes",
            description: "其他原生 button 属性；onClick 中调用 preventDefault() 可阻止默认切换。",
            required: false,
          },
        ],
      },
      {
        componentName: "CarouselImage",
        props: [
          {
            name: "src",
            type: "string",
            description: "图片地址。",
            required: true,
          },
          {
            name: "alt",
            type: "string",
            description: "替代文本；纯装饰图片传空字符串。",
            required: true,
          },
          {
            name: "fit",
            type: "\"cover\" | \"contain\"",
            description: "填充方式：裁切铺满，或完整显示。",
            required: false,
            default: "\"cover\"",
          },
          {
            name: "backdrop",
            type: "boolean",
            description: "fit=\"contain\" 时在留白处铺一层同图的大模糊衬底。",
            required: false,
            default: "true",
          },
          {
            name: "priority",
            type: "boolean",
            description: "立即加载；否则只在所在幻灯片进入可见范围 ±1 张时才设置 src。",
            required: false,
            default: "false",
          },
          {
            name: "overlay",
            type: "boolean",
            description: "底部渐变遮罩，用于在图片上叠加白色标题与按钮。",
            required: false,
            default: "false",
          },
          {
            name: "className",
            type: "string",
            description: "根元素类名（尺寸、圆角）；默认铺满所在幻灯片，需要给 CarouselContent 设置高度或宽高比，或在这里写 aspect-[4/3] h-auto。",
            required: false,
          },
          {
            name: "style",
            type: "CSSProperties",
            description: "根元素的样式。",
            required: false,
          },
          {
            name: "imgClassName",
            type: "string",
            description: "<img> 的类名。",
            required: false,
          },
          {
            name: "children",
            type: "ReactNode",
            description: "叠加在图片上的内容，放在一个铺满图片、底部对齐的容器中。",
            required: false,
          },
          {
            name: "...props",
            type: "ImgHTMLAttributes",
            description: "srcSet、sizes、loading、onLoad、onError 等其他 img 属性。",
            required: false,
          },
        ],
      },
      {
        componentName: "useCarousel()",
        props: [
          {
            name: "index / count / slideCount",
            type: "number",
            description: "当前吸附点序号、吸附点个数（指示点个数）、幻灯片个数。",
            required: false,
          },
          {
            name: "canPrev / canNext / playing",
            type: "boolean",
            description: "是否可以向前 / 向后（循环时总为 true）、自动播放是否开启。",
            required: false,
          },
          {
            name: "next / prev / goTo / goToSlide",
            type: "function",
            description: "切换吸附点；goTo(index, { instant }) 循环时走最短方向，goToSlide 跳到包含第 i 张的吸附点。",
            required: false,
          },
          {
            name: "play / pause",
            type: "() => void",
            description: "开始 / 暂停自动播放。",
            required: false,
          },
          {
            name: "position",
            type: "MotionValue<number>",
            description: "连续位置：0 为第一个吸附点，拖动时连续变化，用于缩略图高亮框、故事进度条等。",
            required: false,
          },
          {
            name: "autoplayProgress",
            type: "MotionValue<number>",
            description: "当前一张的自动播放进度（0–1）。",
            required: false,
          },
        ],
      },
      {
        componentName: "useCarouselItem()",
        props: [
          {
            name: "index",
            type: "number",
            description: "幻灯片序号（从 0 开始）。",
            required: false,
          },
          {
            name: "progress",
            type: "MotionValue<number>",
            description: "距对齐位置多少张：0 为对齐位置，±1 为相邻一张，拖动时连续变化，可交给 useTransform 自定义效果。",
            required: false,
          },
          {
            name: "active / visible",
            type: "boolean",
            description: "是否属于当前吸附点、停稳后是否在视口内。",
            required: false,
          },
        ],
      },
    ],
    version: "1.0.0",
    author: "QiuYeDx",
    tags: ["轮播图", "carousel", "滑动", "拖拽", "橡皮筋", "自动播放", "图片画廊", "无限循环"],
    cliName: "carousel",
    basicUsage: basicUsageExamples[ComponentId.CAROUSEL],
  },
  [ComponentId.MORPH_TOOLTIP]: {
    name: "MorphTooltip",
    description:
      "形变提示气泡：默认高级黑、平滑圆角；同一个 Provider 内共享一个气泡，只有第一次悬停需要等待，之后在范围内的元素间移动时气泡滑到新目标并连续变形宽高，内容沿移动方向交叉淡入，退场途中再进入会从当前状态反向回来。支持方向与对齐、碰撞翻转与平移、最大宽度换行、快捷键键帽、箭头、富内容、指针可移入气泡、受控、内容变化时原地形变、键盘聚焦、Esc 关闭与触屏长按。",
    category: "浮层与引导",
    dependencies: ["motion", "radix-ui"],
    files: {
      component: "components/qiuye-ui/morph-tooltip.tsx",
      demo: "components/qiuye-ui/demos/morph-tooltip-demo.tsx",
    },
    propsInfo: [
      {
        componentName: "MorphTooltipProvider",
        props: [
          {
            name: "children",
            type: "ReactNode",
            description: "范围内的内容；其中的每个 MorphTooltip 共享同一个气泡。可嵌套，内层 Provider 开启新的独立范围；在应用外层包一层即全站一个气泡。",
            required: false,
          },
          {
            name: "delay",
            type: "number",
            description: "第一次显示前的悬停等待（ms）。气泡显示期间或刚消失不久，移到范围内其他元素上不再等待。",
            required: false,
            default: "400",
          },
          {
            name: "skipDelayDuration",
            type: "number",
            description: "气泡消失后多长时间内，移到范围内其他元素上立即显示（ms）；0 关闭。",
            required: false,
            default: "500",
          },
          {
            name: "closeDelay",
            type: "number",
            description: "指针离开元素后多久开始隐藏（ms）。跨过按钮之间的缝隙时气泡不会先消失，从而保持滑动。",
            required: false,
            default: "100",
          },
          {
            name: "morph",
            type: "boolean",
            description: "是否在元素之间滑动形变；false 时仍是单例，但直接切换位置与内容。",
            required: false,
            default: "true",
          },
          {
            name: "side",
            type: "\"top\" | \"right\" | \"bottom\" | \"left\"",
            description: "范围内的默认方向，单个 MorphTooltip 可覆盖。",
            required: false,
            default: "\"top\"",
          },
          {
            name: "align",
            type: "\"start\" | \"center\" | \"end\"",
            description: "范围内的默认对齐方式，单个 MorphTooltip 可覆盖。",
            required: false,
            default: "\"center\"",
          },
          {
            name: "sideOffset",
            type: "number",
            description: "范围内默认与元素的距离（px），单个 MorphTooltip 可覆盖。",
            required: false,
            default: "8",
          },
          {
            name: "alignOffset",
            type: "number",
            description: "范围内默认沿对齐方向的偏移（px），单个 MorphTooltip 可覆盖。",
            required: false,
            default: "0",
          },
          {
            name: "avoidCollisions",
            type: "boolean",
            description: "范围内默认是否在放不下时翻转与平移，单个 MorphTooltip 可覆盖。",
            required: false,
            default: "true",
          },
          {
            name: "collisionPadding",
            type: "number",
            description: "范围内默认与视口（或 collisionBoundary）边缘保持的最小距离（px），单个 MorphTooltip 可覆盖。",
            required: false,
            default: "8",
          },
          {
            name: "collisionBoundary",
            type: "Element | null",
            description: "范围内默认的额外碰撞边界元素（如可滚动的局部区域），翻转与平移时以「视口 ∩ 该元素」为界；单个 MorphTooltip 可覆盖。",
            required: false,
          },
          {
            name: "variant",
            type: "\"dark\" | \"light\" | \"inverse\"",
            description: "范围内的默认配色：dark 高级黑 / light 白底深字 / inverse 与主题相反，单个 MorphTooltip 可覆盖。",
            required: false,
            default: "\"dark\"",
          },
          {
            name: "arrow",
            type: "boolean",
            description: "范围内默认是否显示指向元素的箭头，单个 MorphTooltip 可覆盖。",
            required: false,
            default: "false",
          },
          {
            name: "maxWidth",
            type: "number | string",
            description: "范围内的默认最大宽度：number 为 px，string 为 CSS 长度（如 \"20rem\"，不支持百分比）。",
            required: false,
            default: "280",
          },
          {
            name: "hoverable",
            type: "boolean",
            description: "范围内默认是否允许指针从元素移进气泡而不关闭（WCAG 1.4.13）。元素密集、气泡会盖住其他元素时（如日历、热力图）设为 false，气泡对指针透明。",
            required: false,
            default: "true",
          },
          {
            name: "interactive",
            type: "boolean",
            description: "范围内默认内容是否可交互（含链接或按钮），单个 MorphTooltip 可覆盖。",
            required: false,
            default: "false",
          },
          {
            name: "closeOnClick",
            type: "boolean",
            description: "范围内默认按下元素时是否隐藏，单个 MorphTooltip 可覆盖。",
            required: false,
            default: "true",
          },
          {
            name: "touch",
            type: "boolean",
            description: "范围内默认触屏是否长按显示，单个 MorphTooltip 可覆盖。",
            required: false,
            default: "true",
          },
          {
            name: "container",
            type: "HTMLElement | null",
            description: "气泡 Portal 到的容器。气泡使用 position: fixed，容器及其祖先不应带 transform / filter。",
            required: false,
            default: "document.body",
          },
          {
            name: "disabled",
            type: "boolean",
            description: "关闭范围内所有提示；打开期间设为 true 会立即隐藏（受控的提示也会收起并收到 onOpenChange(false)）。",
            required: false,
            default: "false",
          },
        ],
      },
      {
        componentName: "MorphTooltip",
        props: [
          {
            name: "children",
            type: "ReactNode",
            description: "唯一子元素作为触发元素（Radix Slot 方式）：事件处理函数合并，ref 转发到这个元素；子元素是组件时需要把 props 展开到 DOM 元素上并转发 ref；不是元素时自动包一层 span；禁用的按钮不会派发指针事件，请在外面包一层 span。显示期间触发元素获得 aria-describedby（与自带的值合并）和 data-tooltip-state=\"open\"，可用于高亮当前元素。",
            required: true,
          },
          {
            name: "content",
            type: "ReactNode",
            description: "提示内容：字符串或任意节点；为空（null、undefined、false、空字符串）时不显示。节点内容通过 Portal 从触发元素所在的位置渲染，读取的是触发元素处的 Context（路由、主题、i18n 等）。",
            required: false,
          },
          {
            name: "shortcut",
            type: "string | string[]",
            description: "快捷键，显示为内容右侧的键帽：数组每项一个键帽；字符串按 + 或空格拆分（\"Ctrl+K\"），结尾的 + 本身是一个键（\"⌘+\"、\"Ctrl++\"），每段开头的 ⌘ ⇧ ⌥ ⌃ 各自成为一个键帽（\"⌘⇧P\"）。",
            required: false,
          },
          {
            name: "side",
            type: "\"top\" | \"right\" | \"bottom\" | \"left\"",
            description: "首选方向；放不下且对侧更宽裕时自动翻转。跨方向滑动时箭头在途中隐藏，到位后在新的一侧出现。",
            required: false,
            default: "\"top\"（或 Provider 的 side）",
          },
          {
            name: "align",
            type: "\"start\" | \"center\" | \"end\"",
            description: "沿元素边缘的对齐方式。",
            required: false,
            default: "\"center\"（或 Provider 的 align）",
          },
          {
            name: "sideOffset",
            type: "number",
            description: "气泡与元素的距离（px）。",
            required: false,
            default: "8（或 Provider 的 sideOffset）",
          },
          {
            name: "alignOffset",
            type: "number",
            description: "沿对齐方向的偏移（px）：start / center 时正值向右（下），end 时正值向左（上），即远离对齐的那条边。",
            required: false,
            default: "0（或 Provider 的 alignOffset）",
          },
          {
            name: "avoidCollisions",
            type: "boolean",
            description: "放不下时是否翻到对侧，并沿另一轴平移留在视口（或碰撞边界）内；箭头始终夹在圆角之内指向元素中心。",
            required: false,
            default: "true（或 Provider 的 avoidCollisions）",
          },
          {
            name: "collisionPadding",
            type: "number",
            description: "与视口（或 collisionBoundary）边缘保持的最小距离（px）。",
            required: false,
            default: "8（或 Provider 的 collisionPadding）",
          },
          {
            name: "collisionBoundary",
            type: "Element | null",
            description: "额外的碰撞边界元素：翻转与平移时以「视口 ∩ 该元素」为界，适合可滚动的局部区域；不传时使用 Provider 的 collisionBoundary，都没有时只以视口为界。",
            required: false,
          },
          {
            name: "maxWidth",
            type: "number | string",
            description: "最大宽度，超出后自动换行（text-wrap: pretty），换行后气泡收窄到最长的一行；number 为 px，string 为 CSS 长度（不支持百分比）。",
            required: false,
            default: "280（或 Provider 的 maxWidth）",
          },
          {
            name: "variant",
            type: "\"dark\" | \"light\" | \"inverse\"",
            description: "配色：dark 高级黑（深色主题略浅，与页面拉开层次）/ light 白底深字（浅色主题下跟随 --popover、--popover-foreground、--border）/ inverse 与当前主题相反；深色主题通过祖先的 .dark 类或 data-theme=\"dark\" 识别；不同配色之间切换时颜色随形变过渡。",
            required: false,
            default: "\"dark\"（或 Provider 的 variant）",
          },
          {
            name: "arrow",
            type: "boolean",
            description: "是否显示指向元素的小箭头，随气泡滑动并始终指向元素中心；颜色跟随表面背景色。",
            required: false,
            default: "false（或 Provider 的 arrow）",
          },
          {
            name: "delay",
            type: "number",
            description: "覆盖范围的首次等待时间（ms）。",
            required: false,
            default: "Provider 的 delay（400）",
          },
          {
            name: "hoverable",
            type: "boolean",
            description: "指针从元素移进气泡时是否保持显示（WCAG 1.4.13）：元素与气泡之间有隐形桥接，气泡接收指针事件。元素密集、气泡会盖住其他元素时设为 false，气泡对指针完全透明。",
            required: false,
            default: "true（或 Provider 的 hoverable）",
          },
          {
            name: "interactive",
            type: "boolean",
            description: "内容含链接或按钮时设为 true（隐含 hoverable）：指针可以移进气泡点击；元素聚焦且提示显示时按 Tab 进入气泡，最后一项再按 Tab 回到元素之后的下一个可聚焦元素，第一项按 Shift+Tab 回到元素，Esc 关闭并把焦点还给元素。真正的交互面板请用 Popover。",
            required: false,
            default: "false（或 Provider 的 interactive）",
          },
          {
            name: "closeOnClick",
            type: "boolean",
            description: "按下元素时是否隐藏（之后直到指针离开元素前不再显示）；「复制」类按钮设为 false，配合内容变化原地形变。",
            required: false,
            default: "true（或 Provider 的 closeOnClick）",
          },
          {
            name: "contentKey",
            type: "string | number",
            description: "内容「换了一条」的标识：字符串内容自动比较；节点内容变化需要交叉淡入时传它。标识不变时节点原地更新，尺寸变化时气泡平滑形变；同一元素上的内容换了一条时，还会通过礼貌的实时区域（aria-live）播报新内容。",
            required: false,
          },
          {
            name: "open",
            type: "boolean",
            description: "受控的显示状态。同一范围同一时刻只显示一个提示：被其他提示接替时会收到 onOpenChange(false)；外部仍保持 true 时视为持续的显示请求，接替它的提示关闭后（或内容、禁用状态恢复后）会重新显示它。",
            required: false,
          },
          {
            name: "defaultOpen",
            type: "boolean",
            description: "非受控模式下挂载时是否立即显示。",
            required: false,
            default: "false",
          },
          {
            name: "onOpenChange",
            type: "(open: boolean) => void",
            description: "显示状态变化回调；受控时交互只通过它请求打开或关闭。",
            required: false,
          },
          {
            name: "disabled",
            type: "boolean",
            description: "禁用这一个提示；显示期间禁用（或内容被清空）会立即隐藏，受控的提示也会收到 onOpenChange(false)。",
            required: false,
            default: "false",
          },
          {
            name: "touch",
            type: "boolean",
            description: "触屏是否长按（约 450ms，移动小于 8px）显示；抬起后 1.5 秒隐藏，并吞掉这次长按之后的 click 与 contextmenu；按住期间元素不可选中文字。",
            required: false,
            default: "true（或 Provider 的 touch）",
          },
          {
            name: "className",
            type: "string",
            description: "这个提示显示时气泡表面的额外类名（如 bg-blue-600 text-white 换背景色）；不同类名之间切换时颜色会过渡，箭头跟随表面背景色。",
            required: false,
          },
          {
            name: "ref",
            type: "Ref<HTMLElement>",
            description: "转发到触发元素（children 对应的 DOM 元素）；支持 React 19 回调 ref 返回清理函数。",
            required: false,
          },
        ],
      },
    ],
    version: "1.0.0",
    author: "QiuYeDx",
    tags: ["tooltip", "提示", "共享元素", "单例", "形变", "平滑圆角", "快捷键", "弹簧动画"],
    cliName: "morph-tooltip",
    basicUsage: basicUsageExamples[ComponentId.MORPH_TOOLTIP],
  },
  [ComponentId.SPOTLIGHT_TILE]: {
    name: "SpotlightTile",
    description:
      "跟随指针取光的聚光卡片：1px 边框沿指针位置亮起一圈色调光并铺一层内部柔光，角落的大号淡水印图标悬停时漂移转正，带色调渐变的图标底板轻微倾斜、箭头朝右上轻推。色调可为任意 CSS 颜色；标题链接铺满整张卡片而内层按钮仍可点击，支持 asChild、徽标、标签、进入视口时错开上浮、平滑圆角与减少动态效果。",
    category: "内容与媒体",
    dependencies: ["motion", "radix-ui", "lucide-react"],
    files: {
      component: "components/qiuye-ui/spotlight-tile.tsx",
      demo: "components/qiuye-ui/demos/spotlight-tile-demo.tsx",
    },
    propsInfo: [
      {
        componentName: "SpotlightTile",
        props: [
          {
            name: "tone",
            type: "string",
            description: "卡片色调，任意 CSS 颜色（#hex、oklch()、var(--chart-1) 等）；边框光、内部柔光、图标底板、水印、悬停阴影与聚焦描边都由它派生。",
            required: false,
            default: "\"var(--primary)\"",
          },
          {
            name: "icon",
            type: "ReactNode",
            description: "左上角图标，建议传入 24×24 的线性图标（如 lucide-react），显示在带色调渐变的平滑圆角底板中。",
            required: false,
          },
          {
            name: "watermark",
            type: "boolean | ReactNode",
            description: "右下角的大号淡水印：true 复用 icon，传入节点使用该节点，false 不显示；悬停时漂移并转正。",
            required: false,
            default: "true",
          },
          {
            name: "badge",
            type: "ReactNode",
            description: "图标右侧的小标签，如 Beta、New。",
            required: false,
          },
          {
            name: "title",
            type: "ReactNode",
            description: "标题；传入 href 时被包裹为铺满整张卡片的链接。",
            required: false,
          },
          {
            name: "titleAs",
            type: "\"h2\" | \"h3\" | \"h4\" | \"p\"",
            description: "标题使用的标签。",
            required: false,
            default: "\"h3\"",
          },
          {
            name: "description",
            type: "ReactNode",
            description: "标题下方的描述，默认最多两行。",
            required: false,
          },
          {
            name: "chips",
            type: "ReactNode[]",
            description: "底部的特性标签。",
            required: false,
          },
          {
            name: "actions",
            type: "ReactNode",
            description: "底部右侧的操作区，浮在卡片链接之上，其中的按钮可以单独点击。",
            required: false,
          },
          {
            name: "href",
            type: "string",
            description: "卡片链接地址；设置后标题成为链接，点击区域铺满整张卡片。",
            required: false,
          },
          {
            name: "linkProps",
            type: "AnchorHTMLAttributes",
            description: "传给标题链接的其他属性，如 target、rel、onClick。",
            required: false,
          },
          {
            name: "arrow",
            type: "boolean",
            description: "是否显示右上角箭头，悬停时朝右上轻推。",
            required: false,
            default: "设置了 href 或 asChild 时为 true",
          },
          {
            name: "asChild",
            type: "boolean",
            description: "把卡片样式应用到唯一子元素（如 <a>），让整张卡片成为该元素；子元素自身的子节点显示在描述下方，此时 actions 中不要放交互元素。",
            required: false,
            default: "false",
          },
          {
            name: "appear",
            type: "boolean",
            description: "进入视口时是否上浮淡入；减少动态效果时只做不位移的短淡入。",
            required: false,
            default: "true",
          },
          {
            name: "index",
            type: "number",
            description: "网格中的序号，每张错开 50ms 上浮淡入。",
            required: false,
            default: "0",
          },
          {
            name: "radius",
            type: "number",
            description: "平滑圆角半径（px）。",
            required: false,
            default: "20",
          },
          {
            name: "smoothing",
            type: "number",
            description: "平滑圆角强度，范围 0..1。",
            required: false,
            default: "0.72",
          },
          {
            name: "children",
            type: "ReactNode",
            description: "显示在描述与底部之间的自定义内容。",
            required: false,
          },
          {
            name: "className",
            type: "string",
            description: "根元素类名，可覆盖内边距、最小高度等布局样式。",
            required: false,
          },
        ],
      },
      {
        componentName: "SpotlightTileLink",
        props: [
          {
            name: "asChild",
            type: "boolean",
            description: "把链接行为应用到唯一子元素，用于 next/link、react-router Link 等路由链接。",
            required: false,
            default: "false",
          },
          {
            name: "href",
            type: "string",
            description: "链接地址。",
            required: false,
          },
          {
            name: "...props",
            type: "AnchorHTMLAttributes",
            description: "其他原生 <a> 属性。",
            required: false,
          },
        ],
      },
    ],
    version: "1.0.0",
    author: "QiuYeDx",
    tags: ["卡片", "聚光", "指针光效", "工具入口", "便当格", "链接卡片", "平滑圆角"],
    cliName: "spotlight-tile",
    basicUsage: basicUsageExamples[ComponentId.SPOTLIGHT_TILE],
  },
  [ComponentId.ADAPTIVE_POINTER]: {
    name: "AdaptivePointer",
    description:
      "参照 iPadOS 妙控板圆形指针的自适应指针：淡灰填充层悬停时变形为目标下方的圆角板并带阻尼偏移，图标随之轻微移动，正文上变为 I 形竖条，静止 2 秒后淡出；可选的深灰外环缩成小圆 1:1 标出真实指针位置。支持整页与局部作用域（含浮层）与主题令牌，触屏与减少动态效果时使用系统指针。",
    category: "视觉与动效",
    dependencies: ["motion", "radix-ui"],
    files: {
      component: "components/qiuye-ui/adaptive-pointer.tsx",
      demo: "components/qiuye-ui/demos/adaptive-pointer-demo.tsx",
    },
    propsInfo: [
      {
        componentName: "AdaptivePointer（整页）",
        props: [
          {
            name: "disabled",
            type: "boolean",
            description:
              "关闭本作用域，交还原生指针；适合接用户的「使用系统指针」偏好。Area 关闭时在整页实例里也会成为原生区域。",
            required: false,
            default: "false",
          },
          {
            name: "size",
            type: "number",
            description:
              "静止时两层的直径（px），夹在 12–40 并取偶数。",
            required: false,
            default: "20",
          },
          {
            name: "ring",
            type: "boolean",
            description:
              "外环定位：开启后外环与填充层分离，悬停在可点击目标上时缩成小圆，1:1 标出真实热点。关闭即 Apple 经典单层（静止填充更深一些）。",
            required: false,
            default: "false",
          },
          {
            name: "ringSize",
            type: "number",
            description:
              "悬停在可点击目标上时外环缩成的直径（px），夹在 4 到 size − 4。",
            required: false,
            default: "8",
          },
          {
            name: "ringWidth",
            type: "number",
            description:
              "外环描边（CSS px），夹在 1–3；按设备像素取整，增强对比度偏好下至少为 2。",
            required: false,
            default: "1.5",
          },
          {
            name: "parallax",
            type: "number",
            description:
              "阻尼偏移强度倍数（0–2）。0 同时关闭偏移、拉伸与内容视差。",
            required: false,
            default: "1",
          },
          {
            name: "contentParallax",
            type: "boolean",
            description:
              "内容视差：吸附到只有图标的目标（图标按钮）时，图标跟着圆角板轻微移动。写了 data-pointer-content 的子元素始终参与；目标上写 data-pointer-content=\"off\" 单独关闭。",
            required: false,
            default: "true",
          },
          {
            name: "textBeam",
            type: "boolean",
            description:
              "正文 I 形竖条：指针落在正文字符上（且不在可点击目标上）时变为吸附到行的竖条。关闭后只在 data-pointer=\"text\" 区域内显示；data-pointer=\"none\" 的子树不显示。",
            required: false,
            default: "true",
          },
          {
            name: "largeTarget",
            type: "{ height?: number; area?: number }",
            description:
              "大目标阈值：auto 目标的高度或面积超过阈值时按 hover 处理（跟手的柔和圆，不变形）。",
            required: false,
            default: "{ height: 96, area: 32000 }",
          },
          {
            name: "selector",
            type: "string",
            description:
              "自动识别可点击目标的选择器，整体替换默认值；扩展写法为 `${DEFAULT_ADAPTIVE_POINTER_SELECTOR}, .clickable`。不支持的段会被丢弃。",
            required: false,
            default: "DEFAULT_ADAPTIVE_POINTER_SELECTOR",
          },
          {
            name: "hideOnKeyboard",
            type: "boolean",
            description:
              "按下非修饰键时淡出，移动指针后恢复。",
            required: false,
            default: "true",
          },
          {
            name: "autoHide",
            type: "number | false",
            description:
              "静止多少毫秒后淡出（最小 500），false 为常驻。",
            required: false,
            default: "2000",
          },
          {
            name: "timeScale",
            type: "number",
            description:
              "物理时间倍率（0.1–2），0.25 即四倍慢放，便于调试。",
            required: false,
            default: "1",
          },
          {
            name: "onStateChange",
            type: "(info: AdaptivePointerStateInfo) => void",
            description:
              "形态、目标或按压状态变化时触发（经 queueMicrotask 调用）；离开本作用域时收到 { state: \"hidden\", target: null }。",
            required: false,
          },
        ],
      },
      {
        componentName: "AdaptivePointerArea（局部）",
        props: [
          {
            name: "disabled",
            type: "boolean",
            description:
              "关闭本作用域，交还原生指针；适合接用户的「使用系统指针」偏好。Area 关闭时在整页实例里也会成为原生区域。",
            required: false,
            default: "false",
          },
          {
            name: "size",
            type: "number",
            description:
              "静止时两层的直径（px），夹在 12–40 并取偶数。",
            required: false,
            default: "20",
          },
          {
            name: "ring",
            type: "boolean",
            description:
              "外环定位：开启后外环与填充层分离，悬停在可点击目标上时缩成小圆，1:1 标出真实热点。关闭即 Apple 经典单层（静止填充更深一些）。",
            required: false,
            default: "false",
          },
          {
            name: "ringSize",
            type: "number",
            description:
              "悬停在可点击目标上时外环缩成的直径（px），夹在 4 到 size − 4。",
            required: false,
            default: "8",
          },
          {
            name: "ringWidth",
            type: "number",
            description:
              "外环描边（CSS px），夹在 1–3；按设备像素取整，增强对比度偏好下至少为 2。",
            required: false,
            default: "1.5",
          },
          {
            name: "parallax",
            type: "number",
            description:
              "阻尼偏移强度倍数（0–2）。0 同时关闭偏移、拉伸与内容视差。",
            required: false,
            default: "1",
          },
          {
            name: "contentParallax",
            type: "boolean",
            description:
              "内容视差：吸附到只有图标的目标（图标按钮）时，图标跟着圆角板轻微移动。写了 data-pointer-content 的子元素始终参与；目标上写 data-pointer-content=\"off\" 单独关闭。",
            required: false,
            default: "true",
          },
          {
            name: "textBeam",
            type: "boolean",
            description:
              "正文 I 形竖条：指针落在正文字符上（且不在可点击目标上）时变为吸附到行的竖条。关闭后只在 data-pointer=\"text\" 区域内显示；data-pointer=\"none\" 的子树不显示。",
            required: false,
            default: "true",
          },
          {
            name: "largeTarget",
            type: "{ height?: number; area?: number }",
            description:
              "大目标阈值：auto 目标的高度或面积超过阈值时按 hover 处理（跟手的柔和圆，不变形）。",
            required: false,
            default: "{ height: 96, area: 32000 }",
          },
          {
            name: "selector",
            type: "string",
            description:
              "自动识别可点击目标的选择器，整体替换默认值；扩展写法为 `${DEFAULT_ADAPTIVE_POINTER_SELECTOR}, .clickable`。不支持的段会被丢弃。",
            required: false,
            default: "DEFAULT_ADAPTIVE_POINTER_SELECTOR",
          },
          {
            name: "hideOnKeyboard",
            type: "boolean",
            description:
              "按下非修饰键时淡出，移动指针后恢复。",
            required: false,
            default: "true",
          },
          {
            name: "autoHide",
            type: "number | false",
            description:
              "静止多少毫秒后淡出（最小 500），false 为常驻。",
            required: false,
            default: "2000",
          },
          {
            name: "timeScale",
            type: "number",
            description:
              "物理时间倍率（0.1–2），0.25 即四倍慢放，便于调试。",
            required: false,
            default: "1",
          },
          {
            name: "onStateChange",
            type: "(info: AdaptivePointerStateInfo) => void",
            description:
              "形态、目标或按压状态变化时触发（经 queueMicrotask 调用）；离开本作用域时收到 { state: \"hidden\", target: null }。",
            required: false,
          },
          {
            name: "asChild",
            type: "boolean",
            description:
              "用 Radix Slot 把作用域挂到唯一的子元素上，不增加 DOM 层级。",
            required: false,
            default: "false",
          },
          {
            name: "className / style / ...",
            type: "HTMLAttributes<HTMLDivElement>",
            description:
              "透传到作用域根节点，ref 转发。",
            required: false,
          },
        ],
      },
      {
        componentName: "pointerTarget() 选项（仅客户端组件；服务端组件直接写 data 属性）",
        props: [
          {
            name: "effect",
            type: "\"auto\" | \"highlight\" | \"lift\" | \"hover\" | \"text\" | \"none\" | \"native\"",
            description:
              "目标效果：auto 按尺寸判定；highlight 变形为圆角板；lift 填充层淡出、由使用方写上浮样式；hover 柔和圆；none 不是目标；native 交还原生指针。",
            required: false,
            default: "\"auto\"",
          },
          {
            name: "padding",
            type: "number | [x: number, y: number]",
            description:
              "圆角板外扩（px），默认按目标尺寸取 2–5px（行内元素 4×2）。",
            required: false,
          },
          {
            name: "radius",
            type: "number | \"full\"",
            description:
              "圆角板圆角（px）或胶囊，默认与目标圆角同心。",
            required: false,
          },
          {
            name: "parallax",
            type: "number",
            description:
              "该目标的偏移强度倍数，0 关闭偏移与拉伸。",
            required: false,
            default: "1",
          },
        ],
      },
      {
        componentName: "目标 data 属性",
        props: [
          {
            name: "data-pointer",
            type: "\"auto\" | \"highlight\" | \"lift\" | \"hover\" | \"none\" | \"native\" | \"text\"",
            description:
              "写在目标上指定效果（即使不匹配选择器也会成为目标）；none 停止向上查找；native 整个子树交还原生指针；text 写在容器上，区域内正文显示 I 形竖条。",
            required: false,
          },
          {
            name: "data-pointer-default",
            type: "\"highlight\" | \"lift\" | \"hover\" | \"none\"",
            description:
              "写在容器上，作为容器内 auto 目标的默认效果，例如菜单内容写 hover 以免和菜单自带的高亮叠在一起。",
            required: false,
          },
          {
            name: "data-pointer-padding / -radius / -parallax",
            type: "string",
            description:
              "覆盖单个目标的外扩（\"4\" 或 \"6 3\"）、圆角（px 或 full）与偏移强度；也可用 pointerTarget() 生成。",
            required: false,
          },
          {
            name: "data-pointer-group",
            type: "\"\" | \"off\"",
            description:
              "声明连续组：组容器内的缝隙里，圆角板留在上一个目标上。toolbar、tablist、menu 等角色自动成组，写 off 关闭。",
            required: false,
          },
          {
            name: "data-pointer-content",
            type: "强度 0–1（默认 0.4）",
            description:
              "写在目标内部的非按钮子元素（图标、文字）上，吸附期间按强度 × 偏移平移；也可用 pointerContent() 生成。",
            required: false,
          },
          {
            name: "data-pointer-state（只读）",
            type: "\"highlight\" | \"lift\" | \"hover\"",
            description:
              "引擎写在当前吸附的目标上，供使用方写自定义反馈，例如 data-[pointer-state=highlight]:hover:bg-transparent 去掉重复的 hover 背景（shadcn 的 ghost 按钮在深色主题下还要加 dark:data-[pointer-state=highlight]:hover:bg-transparent）。",
            required: false,
          },
          {
            name: "data-pointer-pressed（只读）",
            type: "\"\"",
            description:
              "引擎写在按下期间的目标上。",
            required: false,
          },
        ],
      },
    ],
    version: "1.0.0",
    author: "QiuYeDx",
    tags: ["iPadOS", "指针", "光标", "cursor", "悬停", "视差", "弹簧", "变形"],
    cliName: "adaptive-pointer",
    basicUsage: basicUsageExamples[ComponentId.ADAPTIVE_POINTER],
  },
  [ComponentId.HONEYCOMB_VIEW]: {
    name: "HoneycombView",
    description:
      "Apple Watch 风格的蜂窝图标视图：六边形密排，靠近边缘的图标连续缩小并向内收拢，支持四向自由拖动与仅上下滚动两种模式，带惯性、橡皮筋回弹与吸附。",
    category: "内容与媒体",
    dependencies: ["motion"],
    files: {
      component: "components/qiuye-ui/honeycomb-view.tsx",
      demo: "components/qiuye-ui/demos/honeycomb-view-demo.tsx",
    },
    propsInfo: [
      {
        componentName: "HoneycombView",
        props: [
          {
            name: "items",
            type: "readonly T[]",
            description:
              "数据列表。",
            required: true,
          },
          {
            name: "renderItem",
            type: "(item: T, index: number) => ReactNode",
            description:
              "渲染单个图标的视觉内容，按 itemSize 设计即可，缩放由组件统一处理；不要再嵌套按钮等可交互元素。",
            required: true,
          },
          {
            name: "getItemKey",
            type: "(item: T, index: number) => Key",
            description:
              "返回 React key。",
            required: false,
            default: "index",
          },
          {
            name: "getItemLabel",
            type: "(item: T, index: number) => string",
            description:
              "返回图标的无障碍名称。",
            required: false,
          },
          {
            name: "onItemSelect",
            type: "(item: T, index: number, element: HTMLElement) => void",
            description:
              "点击、回车或空格选中时触发，拖动后的松手不会触发；第三个参数是图标的定位元素（不含按压缩放），它的矩形就是图标静止时在屏幕上的位置，便于从图标位置做打开动画。未传时图标不可聚焦。",
            required: false,
          },
          {
            name: "mode",
            type: "\"free\" | \"vertical\"",
            description:
              "free 为四向自由拖动（watchOS 蜂窝视图），vertical 只能上下滚动（watchOS 10 网格视图）。",
            required: false,
            default: "\"free\"",
          },
          {
            name: "layout",
            type: "\"spiral\" | \"grid\"",
            description:
              "free 模式下的排布：spiral 从中心一圈圈向外，grid 为宽窄行交替的矩形蜂窝。vertical 模式固定为 grid。",
            required: false,
            default: "\"spiral\"",
          },
          {
            name: "columns",
            type: "number",
            description:
              "宽行的列数，窄行为 columns - 1。vertical 默认取视口放得下的最大列数（越往外图标越小，能多放一列），并微调列距让最外列铺到视口边缘；free + grid 默认取接近正方形的列数。",
            required: false,
          },
          {
            name: "itemSize",
            type: "number",
            description:
              "图标直径（px）。",
            required: false,
            default: "60",
          },
          {
            name: "gap",
            type: "number",
            description:
              "相邻图标的间距（px）。",
            required: false,
            default: "10",
          },
          {
            name: "edgeWidth",
            type: "number",
            description:
              "边缘缩放带的宽度（px）：图标中心距视口边缘小于该值时开始缩小，越靠近边缘越小，最终缩成贴着边缘内侧的小圆点。层次主要来自 curvature，缩放带只负责最外一圈。",
            required: false,
            default: "0.65 × itemSize",
          },
          {
            name: "cornerRadius",
            type: "number",
            description:
              "视口圆角（px），让缩放带沿圆角屏幕弯曲：角落的图标比边中点更早缩小。默认读取根节点的 border-radius；圆角由外层容器裁切时需要手动传入。",
            required: false,
          },
          {
            name: "curvature",
            type: "number",
            description:
              "球面感（0–0.9）：图标从视口中心向外整体逐渐缩小、间距随之收紧的程度，正中的图标最大。按 watchOS 10 网格拟合。",
            required: false,
            default: "0.4",
          },
          {
            name: "snap",
            type: "boolean",
            description:
              "松手或滚轮停下后吸附：free 让最近的图标停在正中，vertical 让某一行停在顶端（各行关于视口中心对称）。",
            required: false,
            default: "true",
          },
          {
            name: "itemClassName",
            type: "string",
            description:
              "每个图标按钮的类名（默认圆形焦点框；图标形状由 renderItem 决定）。",
            required: false,
          },
          {
            name: "className",
            type: "string",
            description:
              "根节点类名；视口尺寸由调用方决定。",
            required: false,
          },
          {
            name: "aria-label",
            type: "string",
            description:
              "根节点的无障碍名称。",
            required: false,
            default: "\"应用列表\"",
          },
        ],
      },
    ],
    version: "1.0.0",
    author: "QiuYeDx",
    tags: ["Apple Watch", "蜂窝", "六边形", "鱼眼", "拖动", "惯性", "列表"],
    cliName: "honeycomb-view",
    basicUsage: basicUsageExamples[ComponentId.HONEYCOMB_VIEW],
  },
  [ComponentId.EXPANDABLE_CARD]: {
    name: "ExpandableCard",
    description:
      "App Store 风格的展开卡片：从原位置连续放大为居中详情浮层，支持分层视差封面、无重排滚动与无缝阴影交接。",
    category: "内容与媒体",
    dependencies: [
      "motion",
      "radix-ui",
      "lucide-react",
    ],
    files: {
      component: "components/qiuye-ui/expandable-card.tsx",
      demo: "components/qiuye-ui/demos/expandable-card-demo.tsx",
    },
    propsInfo: [
      {
        componentName: "ExpandableCard",
        props: [
          {
            name: "cover",
            type: "ReactNode",
            description: "卡片与浮层共用的封面；会渲染两次，应保持确定性。封面容器为 size 查询容器，可使用 cqw / cqh。",
            required: true,
          },
          {
            name: "eyebrow",
            type: "ReactNode",
            description: "封面左上角的小标签，如分类。",
            required: false,
          },
          {
            name: "title",
            type: "ReactNode",
            description: "封面上的大标题；字符串中的 \\n 作为换行，卡片与浮层断行一致。",
            required: false,
          },
          {
            name: "tone",
            type: "\"light\" | \"dark\"",
            description: "封面文字配色：light 适合深色封面，dark 适合浅色封面。",
            default: "\"light\"",
            required: false,
          },
          {
            name: "icon",
            type: "ReactNode",
            description: "底栏图标；<img> 或 <svg> 自动铺满 52px 平滑圆角容器。",
            required: false,
          },
          {
            name: "name",
            type: "ReactNode",
            description: "底栏名称。",
            required: false,
          },
          {
            name: "subtitle",
            type: "ReactNode",
            description: "底栏副标题，单行截断。",
            required: false,
          },
          {
            name: "actionLabel",
            type: "ReactNode",
            description: "卡片态底栏右侧的胶囊文字；传入 null 隐藏。",
            default: "\"查看\"",
            required: false,
          },
          {
            name: "actions",
            type: "ReactNode",
            description: "展开后替换胶囊的操作区，如下载、访问官网按钮。",
            required: false,
          },
          {
            name: "children",
            type: "ReactNode",
            description: "展开后显示在底栏下方的正文。",
            required: false,
          },
          {
            name: "label",
            type: "string",
            description: "卡片按钮与对话框的无障碍名称；默认取 name 或 title 中的文字。",
            required: false,
          },
          {
            name: "open",
            type: "boolean",
            description: "受控模式下的展开状态。",
            required: false,
          },
          {
            name: "defaultOpen",
            type: "boolean",
            description: "非受控模式的初始状态；为 true 时挂载后从卡片位置展开。",
            default: "false",
            required: false,
          },
          {
            name: "onOpenChange",
            type: "(open: boolean) => void",
            description: "点击卡片、Esc、遮罩、关闭按钮或触屏下拉关闭时触发。",
            required: false,
          },
          {
            name: "parallax",
            type: "boolean",
            description: "卡片内的指针视差与高光；触屏与减少动态效果时自动停用。",
            default: "true",
            required: false,
          },
          {
            name: "maxWidth",
            type: "number",
            description: "浮层最大宽度（px）；视口小于 640px 时四边各留 8px。",
            default: "760",
            required: false,
          },
          {
            name: "expandedCoverHeight",
            type: "number | ((context: ExpandableCardCoverContext) => number)",
            description: "浮层中的封面高度（px），或根据视口、浮层与卡片尺寸计算。",
            default: "窄屏按卡片封面比例等比放大（≤ 62vh），宽屏 clamp(240, 42vh, 400)",
            required: false,
          },
          {
            name: "radius",
            type: "number",
            description: "卡片与浮层的平滑圆角半径（px）。",
            default: "28",
            required: false,
          },
          {
            name: "closeLabel",
            type: "string",
            description: "关闭按钮的无障碍名称。",
            default: "\"关闭\"",
            required: false,
          },
          {
            name: "fallbackLabel",
            type: "string",
            description:
              "label、name、title、eyebrow 都取不到文字时使用的无障碍名称。",
            required: false,
            default: "\"卡片详情\"",
          },
          {
            name: "className",
            type: "string",
            description: "卡片类名；卡片高度由调用方决定。",
            default: "\"h-[28rem]\"",
            required: false,
          },
          {
            name: "sheetClassName",
            type: "string",
            description: "浮层类名。",
            required: false,
          },
          {
            name: "contentClassName",
            type: "string",
            description: "正文容器类名。",
            required: false,
          },
        ],
      },
      {
        componentName: "ExpandableCardLayer",
        props: [
          {
            name: "depth",
            type: "number",
            description: "指针位于卡片边缘时的最大横向位移（px），纵向为 0.7 倍；负值反向移动。",
            default: "8",
            required: false,
          },
          {
            name: "className",
            type: "string",
            description: "定位、尺寸与外观；铺满封面的背景层建议使用负 inset 预留出血。",
            required: false,
          },
          {
            name: "style",
            type: "CSSProperties",
            description: "图层样式；transform 由组件接管。",
            required: false,
          },
          {
            name: "children",
            type: "ReactNode",
            description: "图层内容。",
            required: false,
          },
        ],
      },
      {
        componentName: "useExpandableCard（返回值）",
        props: [
          {
            name: "x / y",
            type: "MotionValue<number>",
            description: "指针位置，归一化到 -1…1；浮层中恒为 0。",
            required: true,
          },
          {
            name: "live",
            type: "boolean",
            description: "封面是否应运行循环动画：可见、未被浮层占用、不在展开/收起过程中且允许动态效果。",
            required: true,
          },
          {
            name: "expanded",
            type: "boolean",
            description: "当前渲染位置是否为展开中的浮层。",
            required: true,
          },
        ],
      },
      {
        componentName: "ExpandableCardCoverContext（expandedCoverHeight 参数）",
        props: [
          {
            name: "viewportWidth / viewportHeight",
            type: "number",
            description: "视口尺寸（px）。",
            required: true,
          },
          {
            name: "sheetWidth",
            type: "number",
            description: "展开后浮层的宽度（px）。",
            required: true,
          },
          {
            name: "cardWidth / cardCoverHeight",
            type: "number",
            description: "卡片宽度与卡片中封面的高度（px），可用于按卡片比例等比放大。",
            required: true,
          },
        ],
      },
    ],
    version: "1.1.1",
    author: "QiuYeDx",
    tags: ["卡片", "App Store", "展开", "容器变形", "浮层", "视差", "详情"],
    cliName: "expandable-card",
    basicUsage: basicUsageExamples[ComponentId.EXPANDABLE_CARD],
  },
  [ComponentId.ANIMATED_NUMBER]: {
    name: "AnimatedNumber",
    description:
      "按数位独立过渡的动态数字，支持可选模糊、平滑宽度变化和 Intl 格式化。",
    category: "视觉与动效",
    dependencies: ["motion"],
    files: {
      component: "components/qiuye-ui/animated-number.tsx",
      demo: "components/qiuye-ui/demos/animated-number-demo.tsx",
    },
    props: [
      {
        name: "value",
        type: "number",
        description: "当前数值；只动画发生变化的数位，不生成中间数值。",
        required: true,
      },
      {
        name: "locales",
        type: "string",
        description: "Intl 格式化语言；SSR 与客户端需保持一致。",
        default: '"en-US"',
        required: false,
      },
      {
        name: "format",
        type: "Intl.NumberFormatOptions",
        description: "小数精度、整数补零、千分位、货币等格式选项。",
        default: "{ useGrouping: false }",
        required: false,
      },
      {
        name: "blur",
        type: "boolean",
        description: "为变化字形添加 3px 模糊过渡，静止字形保持清晰。",
        default: "true",
        required: false,
      },
      {
        name: "duration",
        type: "number",
        description: "过渡秒数；设置为 0 立即更新。",
        default: "0.28",
        required: false,
      },
      {
        name: "direction",
        type: '"auto" | "up" | "down"',
        description:
          "auto 根据数值增减决定方向；年月可由完整日期统一指定方向。",
        default: '"auto"',
        required: false,
      },
      {
        name: "animated",
        type: "boolean",
        description: "启用动画；系统减少动态效果偏好始终优先。",
        default: "true",
        required: false,
      },
      {
        name: "className",
        type: "string",
        description: "容器类名；继承字号、行高和主题颜色。",
        required: false,
      },
    ],
    version: "1.0.0",
    author: "QiuYeDx",
    tags: ["数字", "逐位", "动效", "计数", "金额", "年月", "blur"],
    cliName: "animated-number",
    basicUsage: basicUsageExamples[ComponentId.ANIMATED_NUMBER],
  },
  [ComponentId.RESPONSIVE_TABS]: {
    name: "Responsive Tabs",
    description:
      "响应式标签页组件：responsive 模式统一等宽并在空间不足时滚动，scroll 模式按内容宽度滚动，grid 模式按配置列数等分换行；列表、标签与动画高亮均使用 Figma/iOS 风格平滑圆角，并支持图标、徽标与禁用状态。",
    category: "选择与切换",
    dependencies: ["lucide-react", "motion"],
    files: {
      component: "components/qiuye-ui/responsive-tabs.tsx",
      demo: "components/qiuye-ui/demos/responsive-tabs-demo.tsx",
    },
    props: [
      {
        name: "value",
        type: "string",
        description: "当前激活的标签页值",
        required: true,
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "标签页切换回调函数",
        required: true,
      },
      {
        name: "items",
        type: "TabItem[]",
        description: "标签页配置数组（支持 label、icon、badge、disabled）",
        required: true,
      },
      {
        name: "children",
        type: "React.ReactNode",
        description: "与标签页内容区域（Tabs.Content）对应的子节点",
        required: false,
      },
      {
        name: "layout",
        type: '"responsive" | "scroll" | "grid"',
        description:
          "布局模式：responsive（所有选项始终等宽；空间不足时以最长项为统一最小宽度并横向滚动）、scroll（各选项按自身内容宽度排列并横向滚动）、grid（按 gridColsClass 的列数等分并允许换行）",
        required: false,
        default: "responsive",
      },
      {
        name: "scrollButtons",
        type: "boolean",
        description:
          "是否在 responsive / scroll 模式发生横向溢出时显示左右滚动按钮",
        required: false,
        default: "true",
      },
      {
        name: "scrollStep",
        type: "number",
        description: "点击滚动按钮时的滚动步长（像素）",
        required: false,
        default: "220",
      },
      {
        name: "fadeMasks",
        type: "boolean",
        description:
          '是否在 layout="responsive" 或 "scroll" 发生横向溢出时显示左右渐变遮罩',
        required: false,
        default: "true",
      },
      {
        name: "fadeMaskWidth",
        type: "number",
        description: "渐变遮罩宽度（像素）",
        required: false,
        default: "64",
      },
      {
        name: "gridColsClass",
        type: "string",
        description:
          'layout="grid" 时的网格列定义，可传无断点或自定义断点的 Tailwind 类；其他模式下忽略',
        required: false,
        default: "sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8",
      },
      {
        name: "listClassName",
        type: "string",
        description: "TabsList 的额外类名",
        required: false,
      },
      {
        name: "triggerClassName",
        type: "string",
        description: "TabsTrigger 的额外类名",
        required: false,
      },
      {
        name: "className",
        type: "string",
        description: "根容器额外类名",
        required: false,
      },
      {
        name: "animatedHighlight",
        type: "boolean",
        description:
          "是否启用选中态 layoutId 底色平移过渡动画（切换 Tab 时高亮背景以弹簧动画从旧 Tab 滑动到新 Tab）",
        required: false,
        default: "true",
      },
      {
        name: "size",
        type: '"default" | "sm"',
        description:
          "Tab 整体尺寸：default 为默认尺寸，sm 为紧凑小尺寸（更小的内边距和文字），适用于工具栏、表单内嵌等场景",
        required: false,
        default: "default",
      },
    ],
    version: "1.4.2",
    author: "QiuYeDx",
    tags: [
      "tabs",
      "navigation",
      "responsive",
      "mobile",
      "scroll",
      "grid",
      "badge",
      "icon",
      "shadcn",
      "animation",
      "smooth-corners",
    ],
    cliName: "responsive-tabs",
    basicUsage: basicUsageExamples[ComponentId.RESPONSIVE_TABS],
  },

  [ComponentId.CLIP_PATH_TABS]: {
    name: "Clip Path Tabs",
    description:
      "通过 clip-path 平滑切换完整选中态的标签按钮组：默认使用无间隙的连续背景，也可选择保留间隙的分段过渡；背景与文本颜色保持同步，支持胶囊/圆角矩形、Figma/iOS 风格平滑圆角、自定义配色、三档尺寸、等宽布局、禁用项及受控/非受控状态。",
    category: "选择与切换",
    dependencies: [],
    files: {
      component: "components/qiuye-ui/clip-path-tabs.tsx",
      demo: "components/qiuye-ui/demos/clip-path-tabs-demo.tsx",
    },
    props: [
      {
        name: "items",
        type: "ClipPathTabsItem[]",
        description:
          "标签项配置数组，支持 label、icon、disabled 与 ariaLabel，value 应保持唯一",
        required: true,
      },
      {
        name: "value",
        type: "string",
        description: "当前选中的标签值（受控模式）",
        required: false,
      },
      {
        name: "defaultValue",
        type: "string",
        description: "非受控模式的默认标签值，未传时选中第一个可用项",
        required: false,
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "标签值变化回调",
        required: false,
      },
      {
        name: "shape",
        type: '"pill" | "rounded"',
        description: "选中区域形状：纯圆胶囊或圆角矩形",
        required: false,
        default: '"pill"',
      },
      {
        name: "cornerRadius",
        type: "number | string",
        description: "自定义圆角；number 使用 px，string 作为 CSS 值",
        required: false,
      },
      {
        name: "smoothCorners",
        type: "boolean",
        description:
          "是否为圆角矩形启用 Figma/iOS 风格平滑圆角；continuous 与 segmented 两种过渡模式均支持",
        required: false,
        default: "false",
      },
      {
        name: "smoothCornerSmoothing",
        type: "number",
        description: "平滑圆角强度（0..1），仅在 smoothCorners 为 true 时生效",
        required: false,
        default: "0.7",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        description: "标签按钮尺寸：sm 高 28px、md 高 32px、lg 高 36px（与 Button 的 sm / default / lg 对齐）",
        required: false,
        default: '"md"',
      },
      {
        name: "fullWidth",
        type: "boolean",
        description: "是否让所有标签等宽并撑满父容器",
        required: false,
        default: "false",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "是否禁用整个标签组",
        required: false,
        default: "false",
      },
      {
        name: "inactiveBackground",
        type: "string",
        description: "普通状态背景色，可传 CSS 色值或变量",
        required: false,
        default: '"transparent"',
      },
      {
        name: "inactiveForeground",
        type: "string",
        description: "普通状态文本颜色，可传 CSS 色值或变量",
        required: false,
        default: '"var(--muted-foreground)"',
      },
      {
        name: "activeBackground",
        type: "string",
        description: "选中状态背景色，可传 CSS 色值或变量",
        required: false,
        default: '"var(--primary)"',
      },
      {
        name: "activeForeground",
        type: "string",
        description: "选中状态文本颜色，可传 CSS 色值或变量",
        required: false,
        default: '"var(--primary-foreground)"',
      },
      {
        name: "transitionMode",
        type: '"continuous" | "segmented"',
        description:
          "选中背景的过渡模式：continuous 保持连续背景，segmented 保留标签间隙",
        required: false,
        default: '"continuous"',
      },
      {
        name: "transitionDuration",
        type: "number",
        description: "clip-path 过渡时长，单位为毫秒",
        required: false,
        default: "250",
      },
      {
        name: "transitionEasing",
        type: "string",
        description: "clip-path 过渡缓动函数",
        required: false,
        default: '"ease"',
      },
      {
        name: "ariaLabel",
        type: "string",
        description: "标签列表的无障碍名称",
        required: false,
        default: '"标签页"',
      },
      {
        name: "listClassName",
        type: "string",
        description: "标签列表的额外类名",
        required: false,
      },
      {
        name: "triggerClassName",
        type: "string",
        description: "每个真实标签按钮的额外类名",
        required: false,
      },
      {
        name: "activeItemClassName",
        type: "string",
        description: "选中态视觉标签的额外类名",
        required: false,
      },
      {
        name: "children",
        type: "React.ReactNode",
        description: "ClipPathTabsContent 标签面板",
        required: false,
      },
      {
        name: "className",
        type: "string",
        description: "根容器的额外类名",
        required: false,
      },
    ],
    version: "1.2.1",
    author: "QiuYeDx",
    tags: [
      "tabs",
      "clip-path",
      "transition",
      "navigation",
      "pill",
      "rounded",
      "smooth-corners",
      "keyboard",
      "radix",
    ],
    cliName: "clip-path-tabs",
    basicUsage: basicUsageExamples[ComponentId.CLIP_PATH_TABS],
  },

  [ComponentId.SEGMENTED_CONTROL]: {
    name: "Segmented Control",
    description:
      "ChatGPT 风格的分段单选控件：使用 Motion layoutId 与 spring 弹性滑块过渡，提供内嵌与悬浮两种风格及中、小两档尺寸，并支持受控/非受控状态、键盘导航、禁用项与表单提交。",
    category: "选择与切换",
    dependencies: ["motion"],
    files: {
      component: "components/qiuye-ui/segmented-control.tsx",
      demo: "components/qiuye-ui/demos/segmented-control-demo.tsx",
    },
    props: [
      {
        name: "items",
        type: "SegmentedControlItem[]",
        description:
          "分段选项配置数组，支持 label、icon、disabled 与 ariaLabel，value 应保持唯一",
        required: true,
      },
      {
        name: "value",
        type: "string",
        description: "当前选中值（受控模式）",
        required: false,
      },
      {
        name: "defaultValue",
        type: "string",
        description: "非受控模式的默认选中值，未传时选中第一个可用项",
        required: false,
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "选中值变化回调",
        required: false,
      },
      {
        name: "size",
        type: '"sm" | "md"',
        description: "控件尺寸：md 用于局部内容切换，sm 用于紧凑配置项",
        required: false,
        default: '"md"',
      },
      {
        name: "variant",
        type: '"contained" | "floating"',
        description:
          "视觉风格：contained 将选中滑块内嵌于轨道，floating 让滑块外扩并呈现悬浮感",
        required: false,
        default: '"floating"',
      },
      {
        name: "fullWidth",
        type: "boolean",
        description: "是否撑满父容器宽度",
        required: false,
        default: "false",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "是否禁用整个控件",
        required: false,
        default: "false",
      },
      {
        name: "name",
        type: "string",
        description: "用于原生表单提交的字段名",
        required: false,
      },
      {
        name: "indicatorClassName",
        type: "string",
        description: "选中态滑块的额外类名",
        required: false,
      },
      {
        name: "itemClassName",
        type: "string",
        description: "每个选项按钮的额外类名",
        required: false,
      },
      {
        name: "indicatorTransition",
        type: "Transition",
        description: "选中态滑块的 Motion 过渡配置",
        required: false,
        default: '{ type: "spring", duration: 0.38, bounce: 0.18 }',
      },
      {
        name: "className",
        type: "string",
        description: "根容器额外类名",
        required: false,
      },
    ],
    version: "2.0.1",
    author: "QiuYeDx",
    tags: [
      "segmented-control",
      "radio-group",
      "tabs",
      "switcher",
      "motion",
      "spring",
      "layout-id",
      "floating",
      "keyboard",
      "form",
      "chatgpt",
    ],
    cliName: "segmented-control",
    basicUsage: basicUsageExamples[ComponentId.SEGMENTED_CONTROL],
  },

  [ComponentId.SCROLLABLE_DIALOG]: {
    name: "Scrollable Dialog",
    description:
      "可滚动对话框组件：头部和底部固定，内容区域可滚动，支持自定义高度，适用于需要展示大量内容的场景。",
    category: "浮层与引导",
    dependencies: ["motion"],
    files: {
      component: "components/qiuye-ui/scrollable-dialog.tsx",
      demo: "components/qiuye-ui/demos/scrollable-dialog-demo.tsx",
    },
    propsInfo: [
      {
        componentName: "ScrollableDialog",
        props: [
          {
            name: "open",
            type: "boolean",
            description: "对话框是否打开",
            required: true,
          },
          {
            name: "onOpenChange",
            type: "(open: boolean) => void",
            description: "对话框打开状态改变的回调函数",
            required: true,
          },
          {
            name: "children",
            type: "React.ReactNode",
            description: "对话框内容（通常包含 Header、Content、Footer）",
            required: false,
          },
          {
            name: "className",
            type: "string",
            description: "内部容器的额外类名",
            required: false,
          },
          {
            name: "contentClassName",
            type: "string",
            description: "DialogContent 的额外类名",
            required: false,
          },
          {
            name: "onOpenAutoFocus",
            type: "(e: Event) => void",
            description: "对话框打开时自动聚焦的回调",
            required: false,
            default: "(e) => e.preventDefault()",
          },
          {
            name: "maxWidth",
            type: "string",
            description: "对话框最大宽度",
            required: false,
            default: "sm:max-w-md",
          },
        ],
      },
      {
        componentName: "ScrollableDialogHeader",
        props: [
          {
            name: "children",
            type: "React.ReactNode",
            description: "头部内容",
            required: true,
          },
          {
            name: "className",
            type: "string",
            description: "额外的 CSS 类名",
            required: false,
          },
        ],
      },
      {
        componentName: "ScrollableDialogContent",
        props: [
          {
            name: "children",
            type: "React.ReactNode",
            description: "可滚动的内容",
            required: true,
          },
          {
            name: "className",
            type: "string",
            description: "额外的 CSS 类名",
            required: false,
          },
          {
            name: "fadeMasks",
            type: "boolean",
            description: "是否显示上下渐变遮罩",
            required: false,
            default: "true",
          },
          {
            name: "fadeMaskHeight",
            type: "number",
            description: "渐变遮罩高度（像素）",
            required: false,
            default: "40",
          },
          {
            name: "horizontalScroll",
            type: "boolean",
            description: "是否启用横向滚动",
            required: false,
            default: "false",
          },
        ],
      },
      {
        componentName: "ScrollableDialogFooter",
        props: [
          {
            name: "children",
            type: "React.ReactNode",
            description: "底部内容",
            required: true,
          },
          {
            name: "className",
            type: "string",
            description: "额外的 CSS 类名",
            required: false,
          },
        ],
      },
    ],
    version: "1.0.1",
    author: "QiuYeDx",
    tags: ["dialog", "modal", "scrollable", "popup", "overlay", "shadcn"],
    cliName: "scrollable-dialog",
    basicUsage: basicUsageExamples[ComponentId.SCROLLABLE_DIALOG],
  },

  [ComponentId.DOT_GLASS]: {
    name: "Dot Glass",
    description:
      "点阵开孔毛玻璃组件：一种「反直觉」的玻璃效果，只在点阵孔洞里露出背后内容的模糊（blur），其余区域是纯色盖板遮挡，适用于 Header、Navbar 等需要特殊视觉效果的场景。",
    category: "视觉与动效",
    dependencies: [],
    files: {
      component: "components/qiuye-ui/dot-glass.tsx",
      demo: "components/qiuye-ui/demos/dot-glass-demo.tsx",
    },
    props: [
      {
        name: "dotSize",
        type: "number",
        description: "圆点直径（像素）",
        required: false,
        default: "3",
      },
      {
        name: "dotGap",
        type: "number",
        description: "点阵间距（像素）",
        required: false,
        default: "6",
      },
      {
        name: "dotFade",
        type: "number",
        description: "边缘柔化（像素），值越大圆点边缘越模糊",
        required: false,
        default: "0",
      },
      {
        name: "blur",
        type: "number",
        description: "模糊强度（像素）",
        required: false,
        default: "4",
      },
      {
        name: "saturation",
        type: "number",
        description: "饱和度（百分比，100 为原色）",
        required: false,
        default: "130",
      },
      {
        name: "glassAlpha",
        type: "number",
        description: "玻璃层透明度（0-1）",
        required: false,
        default: "0.45",
      },
      {
        name: "coverColor",
        type: "string",
        description: "盖板颜色（非孔洞区域的背景色）",
        required: false,
        default: '"#ffffff"',
      },
      {
        name: "fixed",
        type: "boolean",
        description: "是否使用固定定位（适用于 header 等场景）",
        required: false,
        default: "false",
      },
      {
        name: "absolute",
        type: "boolean",
        description: "是否使用绝对定位",
        required: false,
        default: "false",
      },
      {
        name: "sticky",
        type: "boolean",
        description: "是否使用粘性定位",
        required: false,
        default: "false",
      },
      {
        name: "children",
        type: "React.ReactNode",
        description: "子元素（内容）",
        required: false,
      },
      {
        name: "className",
        type: "string",
        description: "额外的 CSS 类名",
        required: false,
      },
    ],
    version: "1.0.0",
    author: "QiuYeDx",
    tags: [
      "glass",
      "blur",
      "backdrop",
      "header",
      "navbar",
      "effect",
      "dot",
      "mask",
    ],
    cliName: "dot-glass",
    basicUsage: basicUsageExamples[ComponentId.DOT_GLASS],
  },

  [ComponentId.IMAGE_VIEWER]: {
    name: "Image Viewer",
    description:
      "带灯箱预览的图片查看器，支持点击放大、滚轮/触控缩放、拖拽平移、平滑圆角、骨架屏加载过渡与悬浮放大动效。",
    category: "内容与媒体",
    dependencies: ["motion", "lucide-react"],
    files: {
      component: "components/qiuye-ui/image-viewer.tsx",
      demo: "components/qiuye-ui/demos/image-viewer-demo.tsx",
    },
    props: [
      {
        name: "src",
        type: "string | Blob",
        description: "图片地址或 Blob 对象",
        required: false,
      },
      {
        name: "alt",
        type: "string",
        description: "图片替代文本",
        required: false,
      },
      {
        name: "title",
        type: "string",
        description: "图片标题（鼠标悬停时显示的原生 title 提示）",
        required: false,
      },
      {
        name: "rounded",
        type: '"none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full"',
        description: "主图圆角大小",
        required: false,
        default: "lg",
      },
      {
        name: "lightboxRounded",
        type: '"none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full"',
        description: "灯箱图片圆角大小（默认跟随 rounded）",
        required: false,
      },
      {
        name: "smoothCorners",
        type: "boolean",
        description:
          '是否启用 Figma/iOS 风格平滑圆角；rounded="none" 与 rounded="full" 会保留原始几何语义',
        required: false,
        default: "false",
      },
      {
        name: "smoothCornerSmoothing",
        type: "number",
        description: "平滑圆角强度（0..1），仅在 smoothCorners 为 true 时生效",
        required: false,
        default: "0.7",
      },
      {
        name: "wrapperClassName",
        type: "string",
        description: "外层包裹容器类名",
        required: false,
      },
      {
        name: "className",
        type: "string",
        description: "图片元素类名",
        required: false,
      },
      {
        name: "lightboxClassName",
        type: "string",
        description: "灯箱图片类名",
        required: false,
      },
      {
        name: "overlayClassName",
        type: "string",
        description: "灯箱遮罩类名",
        required: false,
      },
      {
        name: "overlayBlur",
        type: "boolean",
        description: "遮罩是否启用模糊效果",
        required: false,
        default: "false",
      },
      {
        name: "lightboxPadding",
        type: "number",
        description: "灯箱边距（像素）",
        required: false,
        default: "32",
      },
      {
        name: "enableLightbox",
        type: "boolean",
        description: "是否启用灯箱预览",
        required: false,
        default: "true",
      },
      {
        name: "maxHeight",
        type: "number | string",
        description:
          "非灯箱模式下图片的最大高度（数字为像素，字符串支持CSS值如'50vh'）",
        required: false,
      },
      {
        name: "maxWidth",
        type: "number | string",
        description:
          "非灯箱模式下图片的最大宽度（数字为像素，字符串支持CSS值）",
        required: false,
      },
      {
        name: "hoverScale",
        type: "number",
        description:
          "缩略图鼠标悬浮时的缩放倍数（例如 1.05 表示放大 5%），不设置则无悬浮效果",
        required: false,
      },
      {
        name: "hoverBounce",
        type: "number",
        description: "悬浮动画的弹性系数（0‑1），仅在设置 hoverScale 时生效",
        required: false,
        default: "0.25",
      },
      {
        name: "hoverDuration",
        type: "number",
        description: "悬浮动画的时长（秒），仅在设置 hoverScale 时生效",
        required: false,
        default: "0.65",
      },
      {
        name: "selectable",
        type: "boolean",
        description:
          "是否允许用户选中/复制/拖拽图片（设为 false 可防止浏览器原生选中效果影响长按等交互体验）",
        required: false,
        default: "false",
      },
      {
        name: "labels",
        type: "Partial<ImageViewerLabels>",
        description:
          "界面文案（用于国际化）：emptySource(alt)、loadError、lightbox(alt)；未传入的字段使用 DEFAULT_IMAGE_VIEWER_LABELS",
        required: false,
      },
      {
        name: "loading",
        type: '"lazy" | "eager"',
        description: "图片加载策略（HTML img 原生属性）",
        required: false,
        default: '"lazy"',
      },
      {
        name: "onLoad",
        type: "(event: React.SyntheticEvent<HTMLImageElement>) => void",
        description: "图片加载成功的回调",
        required: false,
      },
      {
        name: "onError",
        type: "(event: React.SyntheticEvent<HTMLImageElement>) => void",
        description: "图片加载失败的回调",
        required: false,
      },
    ],
    version: "1.2.0",
    author: "QiuYeDx",
    tags: [
      "image",
      "viewer",
      "lightbox",
      "zoom",
      "gesture",
      "preview",
      "hover",
      "animation",
      "smooth-corners",
    ],
    cliName: "image-viewer",
    basicUsage: basicUsageExamples[ComponentId.IMAGE_VIEWER],
  },

  [ComponentId.DUAL_STATE_TOGGLE]: {
    name: "Dual State Toggle",
    description:
      "双状态切换按钮：基于 shadcn/ui Button，内置点击缩放 + 图标切换动画（opacity + blur），支持 5 种过渡效果预设与自定义过渡配置。",
    category: "选择与切换",
    dependencies: ["motion", "lucide-react"],
    files: {
      component: "components/qiuye-ui/dual-state-toggle.tsx",
      demo: "components/qiuye-ui/demos/dual-state-toggle-demo.tsx",
    },
    props: [
      {
        name: "active",
        type: "boolean",
        description: "是否处于激活状态",
        required: true,
      },
      {
        name: "onToggle",
        type: "(active: boolean) => void",
        description: "状态切换回调",
        required: true,
      },
      {
        name: "activeIcon",
        type: "React.ReactNode",
        description: "激活状态下显示的图标",
        required: true,
      },
      {
        name: "inactiveIcon",
        type: "React.ReactNode",
        description: "非激活状态下显示的图标",
        required: true,
      },
      {
        name: "activeLabel",
        type: "string",
        description: "激活状态的无障碍标签",
        required: false,
      },
      {
        name: "inactiveLabel",
        type: "string",
        description: "非激活状态的无障碍标签",
        required: false,
      },
      {
        name: "blurAmount",
        type: "string",
        description: "图标切换时的模糊程度",
        required: false,
        default: '"2px"',
      },
      {
        name: "shape",
        type: '"square" | "circle"',
        description: "按钮形状：square（圆角矩形）或 circle（纯圆形）",
        required: false,
        default: '"square"',
      },
      {
        name: "effect",
        type: '"fade" | "rotate" | "slide-up" | "slide-down" | "scale" | ToggleEffectConfig',
        description:
          "图标切换过渡效果，支持预设名或自定义 { initial, animate, exit } 配置",
        required: false,
        default: '"fade"',
      },
      {
        name: "transitionDuration",
        type: "number",
        description: "图标切换动画时长（秒）",
        required: false,
        default: "0.25",
      },
      {
        name: "variant",
        type: "ButtonProps['variant']",
        description: "按钮变体，继承 shadcn/ui Button 的 variant",
        required: false,
        default: '"default"',
      },
      {
        name: "size",
        type: "ButtonProps['size']",
        description: "按钮尺寸，继承 shadcn/ui Button 的 size",
        required: false,
        default: '"icon"',
      },
      {
        name: "className",
        type: "string",
        description: "额外的 CSS 类名",
        required: false,
      },
    ],
    version: "1.0.0",
    author: "QiuYeDx",
    tags: [
      "toggle",
      "button",
      "icon",
      "animation",
      "switch",
      "dual-state",
      "motion",
      "shadcn",
    ],
    cliName: "dual-state-toggle",
    basicUsage: basicUsageExamples[ComponentId.DUAL_STATE_TOGGLE],
  },

  [ComponentId.THEME_TRANSITION_TOGGLE]: {
    name: "Theme Transition Toggle",
    description:
      "基于浏览器 View Transition API 的深浅模式切换组件：支持从触发点播放圆形、椭圆或多边形揭幕，也可选择边缘扫入、轴线展开与对角揭幕，封装按钮、Hook 与纯函数三种复用方式，并在不支持 API 或减少动态效果偏好下自动降级。",
    category: "选择与切换",
    dependencies: ["lucide-react", "motion", "next-themes"],
    files: {
      component: "components/qiuye-ui/theme-transition-toggle.tsx",
      demo: "components/qiuye-ui/demos/theme-transition-toggle-demo.tsx",
    },
    propsInfo: [
      {
        componentName: "ThemeTransitionToggle",
        props: [
          {
            name: "isDark",
            type: "boolean",
            description: "当前是否处于深色主题",
            required: true,
          },
          {
            name: "onToggle",
            type: "(nextDark: boolean) => void",
            description:
              "主题切换回调，会在 View Transition 的 update 阶段调用",
            required: true,
          },
          {
            name: "duration",
            type: "number",
            description: "全屏揭幕动画时长，单位毫秒",
            required: false,
            default: "580",
          },
          {
            name: "easing",
            type: "string",
            description: "CSS easing 曲线，可与 duration 一起自定义动画节奏",
            required: false,
            default: '"cubic-bezier(0.17,0.84,0.44,1)"',
          },
          {
            name: "timing",
            type: '"spring" | "smooth"',
            description:
              "动画时间预设：保留 spring / smooth 两种兼容写法；当前均使用连续起止两帧，实际节奏由 duration/easing 控制",
            required: false,
            default: '"spring"',
          },
          {
            name: "transitionEffect",
            type: '"reveal" | "wipe" | "split" | "diagonal"',
            description:
              "几何过渡效果：孔径揭幕、最近边缘扫入、触发点轴线展开或最近视口角对角揭幕",
            required: false,
            default: '"reveal"',
          },
          {
            name: "transitionAxis",
            type: '"auto" | "horizontal" | "vertical"',
            description:
              "边缘扫入与轴线展开的运动轴向：auto 自动选择，horizontal 左右运动，vertical 上下运动",
            required: false,
            default: '"auto"',
          },
          {
            name: "transitionCorner",
            type: '"auto" | "top-left" | "top-right" | "bottom-right" | "bottom-left"',
            description:
              "对角揭幕使用的视口角：auto 选择离触发点最近的角，也可固定为指定角",
            required: false,
            default: '"auto"',
          },
          {
            name: "shape",
            type: '"circle" | "ellipse" | "star" | "diamond" | "hexagon"',
            description:
              "reveal 过渡使用的揭幕形状：圆形、椭圆、五角星、菱形或六边形",
            required: false,
            default: '"circle"',
          },
          {
            name: "direction",
            type: '"auto" | "enter" | "exit"',
            description:
              "揭幕方向：auto 根据当前主题决定扩散/收束，enter 始终扩散，exit 始终收束",
            required: false,
            default: '"auto"',
          },
          {
            name: "targetDark",
            type: "boolean",
            description:
              "切换后的目标主题是否为深色；按钮会自动推导，传入后可在 update 阶段同步 html class",
            required: false,
          },
          {
            name: "themeClassName",
            type: "string | null",
            description:
              "深色主题挂载在 documentElement 上的 className，设为 null 可关闭同步",
            required: false,
            default: '"dark"',
          },
          {
            name: "extraRadius",
            type: "number",
            description: "reveal 过渡的额外覆盖半径，避免视口边角露白",
            required: false,
            default: "48",
          },
          {
            name: "respectReducedMotion",
            type: "boolean",
            description: "是否尊重系统减少动态效果偏好",
            required: false,
            default: "true",
          },
          {
            name: "lightIcon",
            type: "React.ReactNode",
            description: "浅色主题下显示的图标",
            required: false,
            default: "<SunIcon />",
          },
          {
            name: "darkIcon",
            type: "React.ReactNode",
            description: "深色主题下显示的图标",
            required: false,
            default: "<MoonIcon />",
          },
          {
            name: "lightLabel",
            type: "string",
            description: "浅色主题下的无障碍标签",
            required: false,
            default: '"切换到深色主题"',
          },
          {
            name: "darkLabel",
            type: "string",
            description: "深色主题下的无障碍标签",
            required: false,
            default: '"切换到浅色主题"',
          },
          {
            name: "buttonShape",
            type: '"square" | "circle"',
            description: "触发器按钮形状，独立于揭幕 shape",
            required: false,
            default: '"square"',
          },
          {
            name: "effect",
            type: '"fade" | "rotate" | "slide-up" | "slide-down" | "scale" | ToggleEffectConfig',
            description: "图标切换过渡效果，继承 DualStateToggle",
            required: false,
            default: '"rotate"',
          },
          {
            name: "transitionDuration",
            type: "number",
            description: "图标切换动画时长，单位秒",
            required: false,
            default: "0.35",
          },
          {
            name: "onToggleStart",
            type: "(nextDark: boolean) => void",
            description: "点击切换前触发",
            required: false,
          },
          {
            name: "onFallback",
            type: "() => void",
            description: "View Transition 不可用或被降级时触发",
            required: false,
          },
          {
            name: "onFinish",
            type: "() => void",
            description: "动画完成后的回调",
            required: false,
          },
          {
            name: "variant",
            type: "ButtonProps['variant']",
            description: "按钮变体，继承 shadcn/ui Button 的 variant",
            required: false,
            default: '"outline"',
          },
          {
            name: "size",
            type: "ButtonProps['size']",
            description: "按钮尺寸，继承 shadcn/ui Button 的 size",
            required: false,
            default: '"icon"',
          },
          {
            name: "className",
            type: "string",
            description: "额外的 CSS 类名",
            required: false,
          },
        ],
      },
      {
        componentName: "runThemeViewTransition",
        props: [
          {
            name: "updateTheme",
            type: "() => void",
            description: "触发主题切换的 DOM 更新函数",
            required: true,
          },
          {
            name: "origin",
            type: 'HTMLElement | RefObject | MouseEvent | { x: number; y: number } | "center"',
            description: "用于计算揭幕中心点的来源",
            required: false,
            default: '"center"',
          },
          {
            name: "isDark",
            type: "boolean",
            description: "切换前是否为深色主题，用于 auto 方向判断",
            required: false,
            default: "false",
          },
          {
            name: "targetDark",
            type: "boolean",
            description:
              "切换后的目标主题是否为深色，用于同步 html class 并稳定 View Transition 尾帧",
            required: false,
          },
          {
            name: "themeClassName",
            type: "string | null",
            description:
              "深色主题挂载在 documentElement 上的 className，设为 null 可关闭同步",
            required: false,
            default: '"dark"',
          },
          {
            name: "duration",
            type: "number",
            description: "动画时长，单位毫秒",
            required: false,
            default: "580",
          },
          {
            name: "easing",
            type: "string",
            description: "CSS easing 曲线，可与 duration 一起自定义动画节奏",
            required: false,
            default: '"cubic-bezier(0.17,0.84,0.44,1)"',
          },
          {
            name: "timing",
            type: '"spring" | "smooth"',
            description:
              "动画时间预设：保留 spring / smooth 两种兼容写法；当前均使用连续起止两帧，实际节奏由 duration/easing 控制",
            required: false,
            default: '"spring"',
          },
          {
            name: "transitionEffect",
            type: '"reveal" | "wipe" | "split" | "diagonal"',
            description:
              "几何过渡效果：孔径揭幕、最近边缘扫入、触发点轴线展开或最近视口角对角揭幕",
            required: false,
            default: '"reveal"',
          },
          {
            name: "transitionAxis",
            type: '"auto" | "horizontal" | "vertical"',
            description:
              "边缘扫入与轴线展开的运动轴向：auto 自动选择，horizontal 左右运动，vertical 上下运动",
            required: false,
            default: '"auto"',
          },
          {
            name: "transitionCorner",
            type: '"auto" | "top-left" | "top-right" | "bottom-right" | "bottom-left"',
            description:
              "对角揭幕使用的视口角：auto 选择离触发点最近的角，也可固定为指定角",
            required: false,
            default: '"auto"',
          },
          {
            name: "shape",
            type: '"circle" | "ellipse" | "star" | "diamond" | "hexagon"',
            description:
              "reveal 过渡使用的揭幕形状：圆形、椭圆、五角星、菱形或六边形",
            required: false,
            default: '"circle"',
          },
        ],
      },
      {
        componentName: "useThemeTransition",
        props: [
          {
            name: "updateTheme",
            type: "() => void",
            description: "触发主题切换的 DOM 更新函数",
            required: true,
          },
          {
            name: "origin",
            type: "ThemeTransitionOrigin",
            description: "默认动画原点，调用 run 时传入的 origin 会覆盖它",
            required: false,
            default: '"center"',
          },
          {
            name: "isDark",
            type: "boolean",
            description: "切换前是否为深色主题，用于 auto 方向判断",
            required: false,
            default: "false",
          },
          {
            name: "targetDark",
            type: "boolean",
            description: "切换后的目标主题是否为深色；默认按 !isDark 推导",
            required: false,
          },
          {
            name: "themeClassName",
            type: "string | null",
            description:
              "深色主题挂载在 documentElement 上的 className，设为 null 可关闭同步",
            required: false,
            default: '"dark"',
          },
          {
            name: "duration",
            type: "number",
            description: "动画时长，单位毫秒",
            required: false,
            default: "580",
          },
          {
            name: "easing",
            type: "string",
            description: "CSS easing 曲线，可与 duration 一起自定义动画节奏",
            required: false,
            default: '"cubic-bezier(0.17,0.84,0.44,1)"',
          },
          {
            name: "timing",
            type: '"spring" | "smooth"',
            description:
              "动画时间预设：保留 spring / smooth 两种兼容写法；当前均使用连续起止两帧，实际节奏由 duration/easing 控制",
            required: false,
            default: '"spring"',
          },
          {
            name: "transitionEffect",
            type: '"reveal" | "wipe" | "split" | "diagonal"',
            description:
              "几何过渡效果：孔径揭幕、最近边缘扫入、触发点轴线展开或最近视口角对角揭幕",
            required: false,
            default: '"reveal"',
          },
          {
            name: "transitionAxis",
            type: '"auto" | "horizontal" | "vertical"',
            description:
              "边缘扫入与轴线展开的运动轴向：auto 自动选择，horizontal 左右运动，vertical 上下运动",
            required: false,
            default: '"auto"',
          },
          {
            name: "transitionCorner",
            type: '"auto" | "top-left" | "top-right" | "bottom-right" | "bottom-left"',
            description:
              "对角揭幕使用的视口角：auto 选择离触发点最近的角，也可固定为指定角",
            required: false,
            default: '"auto"',
          },
          {
            name: "shape",
            type: '"circle" | "ellipse" | "star" | "diamond" | "hexagon"',
            description:
              "reveal 过渡使用的揭幕形状：圆形、椭圆、五角星、菱形或六边形",
            required: false,
            default: '"circle"',
          },
        ],
      },
    ],
    version: "1.0.0",
    author: "QiuYeDx",
    tags: [
      "theme",
      "dark-mode",
      "view-transition",
      "transition-api",
      "toggle",
      "animation",
      "clip-path",
      "wipe",
      "diagonal",
      "next-themes",
      "shadcn",
    ],
    cliName: "theme-transition-toggle",
    basicUsage: basicUsageExamples[ComponentId.THEME_TRANSITION_TOGGLE],
  },

  [ComponentId.CODE_BLOCK]: {
    name: "Code Block",
    description:
      "通用代码块显示组件：基于 prism-react-renderer 的语法高亮，7 套内置配色主题（浅/深色变体）+ 自定义主题支持，支持折叠、滚动、自适应高度三种显示模式，Diff 高亮模式（绿色/红色行背景 + 左侧指示条），行高亮标记（淡蓝色背景标记指定行），行号 sticky 固定，自带完整样式。含 CodeBlockPanel 外层容器面板（仿 Tailwind CSS 官网风格），支持文件名标签与复制按钮。",
    category: "内容与媒体",
    dependencies: ["prism-react-renderer", "motion", "lucide-react"],
    files: {
      component: "components/qiuye-ui/code-block/code-block.tsx",
      demo: "components/qiuye-ui/demos/code-block-demo.tsx",
    },
    propsInfo: [
      {
        componentName: "CodeBlock",
        props: [
          {
            name: "children",
            type: "string",
            description: "代码内容",
            required: true,
          },
          {
            name: "language",
            type: "string",
            description: "编程语言（用于语法高亮）",
            required: false,
            default: '"plaintext"',
          },
          {
            name: "isDark",
            type: "boolean",
            description: "是否为深色模式（控制内置主题的浅色/深色变体选择）",
            required: false,
            default: "true",
          },
          {
            name: "colorTheme",
            type: '"qiuvision" | "github" | "one" | "dracula" | "nord" | "vitesse" | "monokai"',
            description: "内置配色主题名称，与 isDark 配合使用",
            required: false,
            default: '"qiuvision"',
          },
          {
            name: "customTheme",
            type: "CodeBlockThemeConfig | PrismTheme",
            description: "自定义主题配置（优先级高于 colorTheme 和 isDark）",
            required: false,
          },
          {
            name: "displayMode",
            type: '"collapse" | "scroll" | "auto-height"',
            description:
              "显示模式：collapse（折叠）、scroll（滚动）、auto-height（自适应高度），不设置则无高度限制",
            required: false,
          },
          {
            name: "maxLines",
            type: "number",
            description: '折叠的行数阈值（displayMode="collapse" 时生效）',
            required: false,
            default: "15",
          },
          {
            name: "maxHeight",
            type: "string | number",
            description:
              '最大高度（displayMode="scroll" 时生效），支持 CSS 单位字符串或数字（px）',
            required: false,
            default: '"400px"',
          },
          {
            name: "showLineNumbers",
            type: "boolean | number",
            description:
              "控制行号显示策略：true 始终显示、false 始终隐藏、数字 n 表示行数 >= n 时才显示",
            required: false,
            default: "true",
          },
          {
            name: "stickyLineNumbers",
            type: "boolean",
            description: "是否在横向滚动时固定左侧行号列（sticky 效果）",
            required: false,
            default: "true",
          },
          {
            name: "spotlightOnCollapse",
            type: "boolean",
            description:
              '是否在折叠后跳转时显示聚光灯阴影效果（displayMode="collapse" 时生效）',
            required: false,
            default: "true",
          },
          {
            name: "noShadow",
            type: "boolean",
            description: "是否隐藏容器周围的 box-shadow 阴影",
            required: false,
            default: "false",
          },
          {
            name: "diff",
            type: "boolean",
            description:
              '是否启用 Diff 高亮模式，自动识别行首 +/- 标记并以绿色/红色背景高亮显示，搭配 language="diff" 使用效果最佳',
            required: false,
            default: "false",
          },
          {
            name: "highlightLines",
            type: "number[] | string",
            description:
              '需要高亮标记的行号（行号从 1 开始），高亮行以淡蓝色背景显示。支持行号数组如 [1, 3, 5] 或逗号分隔的范围字符串如 "1,3,5-10"',
            required: false,
          },
          {
            name: "labels",
            type: "Partial<CodeBlockLabels>",
            description:
              "界面文案（用于国际化）：expand(lineCount)、collapse；未传入的字段使用 DEFAULT_CODE_BLOCK_LABELS",
            required: false,
          },
          {
            name: "className",
            type: "string",
            description: "额外的 CSS 类名",
            required: false,
          },
        ],
      },
      {
        componentName: "CodeBlockPanel",
        props: [
          {
            name: "filename",
            type: "string",
            description: "文件名标签（显示在面板顶部左侧）",
            required: false,
          },
          {
            name: "language",
            type: "string",
            description:
              '编程语言标识（当未设置 filename 时，作为 fallback 标签显示语言类型，如 "TypeScript"）',
            required: false,
          },
          {
            name: "showLanguageLabel",
            type: "boolean",
            description: "是否在未设置 filename 时自动显示语言类型标签",
            required: false,
            default: "true",
          },
          {
            name: "code",
            type: "string",
            description:
              "代码文本内容（用于复制按钮功能，不传则不显示复制按钮）",
            required: false,
          },
          {
            name: "showCopyButton",
            type: "boolean",
            description: "是否显示复制按钮（需要同时传入 code）",
            required: false,
            default: "true",
          },
          {
            name: "labels",
            type: "Partial<CodeBlockPanelLabels>",
            description:
              "界面文案（用于国际化）：copy、copied；未传入的字段使用 DEFAULT_CODE_BLOCK_PANEL_LABELS",
            required: false,
          },
          {
            name: "children",
            type: "React.ReactNode",
            description: "子元素（通常为 CodeBlock 组件）",
            required: true,
          },
          {
            name: "className",
            type: "string",
            description: "额外的 CSS 类名",
            required: false,
          },
        ],
      },
    ],
    version: "1.0.0",
    author: "QiuYeDx",
    tags: [
      "code",
      "syntax-highlighting",
      "prism",
      "theme",
      "collapse",
      "scroll",
      "code-block",
      "panel",
      "copy",
      "diff",
      "highlight",
    ],
    cliName: "code-block",
    basicUsage: basicUsageExamples[ComponentId.CODE_BLOCK],
  },

  [ComponentId.TYPEWRITER]: {
    name: "Typewriter",
    description:
      "平滑打字机效果组件：弹簧宽度跟随（useSpring）实现无顿挫的容器缩放，全文渲染 + overflow 裁剪避免字符闪现，支持多文案轮播、单次打字、自定义光标与弹簧参数。",
    category: "视觉与动效",
    dependencies: ["motion"],
    files: {
      component: "components/qiuye-ui/typewriter.tsx",
      demo: "components/qiuye-ui/demos/typewriter-demo.tsx",
    },
    props: [
      {
        name: "phrases",
        type: "string | string[]",
        description:
          "要打字的文案，传入字符串为单次打字，传入字符串数组为多文案轮播",
        required: true,
      },
      {
        name: "typingSpeed",
        type: "number",
        description: "打字速度（毫秒/字符）",
        required: false,
        default: "90",
      },
      {
        name: "initialDelay",
        type: "number",
        description: "首个字符出现前的延迟（毫秒），常用于等待入场动画结束后再开始打字",
        required: false,
        default: "0",
      },
      {
        name: "deletingSpeed",
        type: "number",
        description: "删除速度（毫秒/字符）",
        required: false,
        default: "45",
      },
      {
        name: "pauseDuration",
        type: "number",
        description: "打完一段后的停顿时长（毫秒）",
        required: false,
        default: "1800",
      },
      {
        name: "switchInterval",
        type: "number",
        description:
          "删完一段后、开始打下一段之前的停顿时长（毫秒），值为 0 时删除完立即开始打字",
        required: false,
        default: "500",
      },
      {
        name: "loop",
        type: "boolean",
        description: "是否循环轮播，false 时打完最后一段后停止，光标保持闪烁",
        required: false,
        default: "true",
      },
      {
        name: "cursor",
        type: "boolean | React.ReactNode",
        description:
          "光标配置：true 显示默认竖线闪烁光标，false 隐藏，传入 ReactNode 渲染自定义光标",
        required: false,
        default: "true",
      },
      {
        name: "cursorClassName",
        type: "string",
        description:
          "默认光标的自定义类名，可覆盖颜色、宽度等，仅在 cursor={true} 时生效",
        required: false,
      },
      {
        name: "springConfig",
        type: "{ stiffness?: number; damping?: number }",
        description:
          "容器宽度弹簧动画配置，控制宽度跟随文本变化时的弹簧物理参数",
        required: false,
        default: "{ stiffness: 300, damping: 30 }",
      },
      {
        name: "className",
        type: "string",
        description: "最外层容器类名",
        required: false,
      },
      {
        name: "textClassName",
        type: "string",
        description: "文本裁剪容器的额外类名",
        required: false,
      },
    ],
    version: "1.1.0",
    author: "QiuYeDx",
    tags: [
      "typewriter",
      "typing",
      "animation",
      "text",
      "motion",
      "spring",
      "effect",
      "carousel",
    ],
    cliName: "typewriter",
    basicUsage: basicUsageExamples[ComponentId.TYPEWRITER],
  },

  [ComponentId.MARKDOWN_RENDERER]: {
    name: "Markdown Renderer",
    description:
      "通用 Markdown 渲染器：内置 Blog / Chat 两套预设，支持 GFM、标题锚点、代码块高亮、Mermaid 图表、图片预览、安全链接策略与可扩展 Widget 运行时。",
    category: "内容与媒体",
    dependencies: [
      "react-markdown",
      "remark-gfm",
      "rehype-raw",
      "mermaid",
      "motion",
      "lucide-react",
      "next-themes",
      "prism-react-renderer",
    ],
    files: {
      component: "components/qiuye-ui/markdown-renderer/markdown-renderer.tsx",
      demo: "components/qiuye-ui/demos/markdown-renderer-demo.tsx",
      types: "components/qiuye-ui/markdown-renderer/markdown-types.ts",
    },
    propsInfo: [
      {
        componentName: "MarkdownRenderer",
        props: [
          {
            name: "content",
            type: "string",
            description: "需要渲染的 Markdown 原文",
            required: true,
          },
          {
            name: "className",
            type: "string",
            description: "根容器额外类名",
            required: false,
          },
          {
            name: "codeBlockDisplayMode",
            type: '"collapse" | "scroll" | "auto-height"',
            description: "博客预设代码块的溢出处理策略，透传给 CodeBlock",
            required: false,
          },
          {
            name: "codeBlockMaxLines",
            type: "number",
            description: "折叠模式下的最大显示行数",
            required: false,
          },
          {
            name: "codeBlockMaxHeight",
            type: "string | number",
            description: "滚动模式下的最大高度",
            required: false,
          },
          {
            name: "stickyLineNumbers",
            type: "boolean",
            description: "代码块横向滚动时是否固定行号列",
            required: false,
          },
          {
            name: "codeBlockColorTheme",
            type: "CodeBlockColorThemeName",
            description: "代码块内置配色主题名称",
            required: false,
            default: "github",
          },
          {
            name: "mermaidShowShadow",
            type: "boolean",
            description: "Mermaid 图表容器是否显示阴影",
            required: false,
            default: "false",
          },
          {
            name: "components",
            type: "Components",
            description: "覆盖或扩展 react-markdown 的 components 映射",
            required: false,
          },
          {
            name: "widgetRegistry",
            type: "MarkdownWidgetRegistry",
            description: "自定义 Widget 注册表",
            required: false,
          },
          {
            name: "widgetContext",
            type: "MarkdownWidgetContext",
            description: "传递给 Widget 的运行上下文",
            required: false,
          },
          {
            name: "labels",
            type: "MarkdownRendererLabelsInput",
            description:
              "界面文案（用于国际化），按 mermaid / widgets / codeBlock / codeBlockPanel / imageViewer 分组，每组可只传部分字段；建议传入引用稳定的对象",
            required: false,
          },
        ],
      },
      {
        componentName: "ChatMarkdownRenderer",
        props: [
          {
            name: "content",
            type: "string",
            description: "需要渲染的 Markdown 原文",
            required: true,
          },
          {
            name: "className",
            type: "string",
            description: "根容器额外类名",
            required: false,
          },
          {
            name: "components",
            type: "Components",
            description: "覆盖或扩展 react-markdown 的 components 映射",
            required: false,
          },
          {
            name: "widgetRegistry",
            type: "MarkdownWidgetRegistry",
            description:
              "Widget 注册表；不传时使用内置 tool-call / artifact / reference-card",
            required: false,
          },
          {
            name: "widgetContext",
            type: "MarkdownWidgetContext",
            description: "传递给 Widget 的运行上下文",
            required: false,
          },
          {
            name: "codeBlock",
            type: "MarkdownCodeBlockOptions",
            description: "会话预设代码块配置覆盖",
            required: false,
          },
          {
            name: "enableRawHtml",
            type: "boolean",
            description: "是否启用原始 HTML；Chat 预设默认关闭",
            required: false,
            default: "false",
          },
          {
            name: "labels",
            type: "MarkdownRendererLabelsInput",
            description:
              "界面文案（用于国际化），按 mermaid / widgets / codeBlock / codeBlockPanel / imageViewer 分组，每组可只传部分字段；建议传入引用稳定的对象",
            required: false,
          },
        ],
      },
    ],
    version: "1.0.1",
    author: "QiuYeDx",
    tags: [
      "markdown",
      "gfm",
      "content",
      "blog",
      "chat",
      "mermaid",
      "code-block",
      "widget",
      "renderer",
      "security",
    ],
    cliName: "markdown-renderer",
    basicUsage: basicUsageExamples[ComponentId.MARKDOWN_RENDERER],
  },
  [ComponentId.COLOR_PICKER]: {
    name: "Color Picker",
    description:
      "通用取色器组件：基于 HSV 色彩模型的饱和度/亮度面板与色相条拖拽选色，支持可选透明度（Alpha）选择、触屏操作、十六进制输入、40 色预设色卡、最近使用颜色记录、渐进增强平滑圆角，以及 Popover 弹出与 Inline 内嵌两种布局模式。",
    category: "选择与切换",
    dependencies: [],
    files: {
      component: "components/qiuye-ui/color-picker.tsx",
      demo: "components/qiuye-ui/demos/color-picker-demo.tsx",
    },
    props: [
      {
        name: "value",
        type: "string",
        description:
          "当前颜色值（受控模式）；showAlpha 关闭时使用 #RRGGBB，开启时支持 #RRGGBBAA",
        required: false,
      },
      {
        name: "defaultValue",
        type: "string",
        description: "默认颜色值（非受控模式）",
        required: false,
        default: '"#000000"',
      },
      {
        name: "onChange",
        type: "(color: string) => void",
        description:
          "颜色变化时的回调；showAlpha 关闭时返回 #RRGGBB，开启时返回 #RRGGBBAA",
        required: false,
      },
      {
        name: "showAlpha",
        type: "boolean",
        description:
          "是否显示透明度（Alpha）选择，开启后面板增加透明度滑条及百分比输入",
        required: false,
        default: "false",
      },
      {
        name: "presetColors",
        type: "string[] | false",
        description: "自定义预设色卡数组，传入 false 可隐藏预设区域",
        required: false,
        default: "DEFAULT_PRESET_COLORS",
      },
      {
        name: "showRecent",
        type: "boolean",
        description: "是否显示最近使用的颜色",
        required: false,
        default: "true",
      },
      {
        name: "maxRecentColors",
        type: "number",
        description: "最近使用颜色的最大数量",
        required: false,
        default: "16",
      },
      {
        name: "showHexInput",
        type: "boolean",
        description: "是否显示十六进制输入框",
        required: false,
        default: "true",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "是否禁用",
        required: false,
        default: "false",
      },
      {
        name: "mode",
        type: '"popover" | "inline"',
        description:
          "展示模式：popover 点击触发器弹出面板，inline 直接内嵌展示面板",
        required: false,
        default: '"popover"',
      },
      {
        name: "panelWidth",
        type: "number",
        description: "饱和度/亮度面板宽度（像素）",
        required: false,
        default: "224",
      },
      {
        name: "panelHeight",
        type: "number",
        description: "饱和度/亮度面板高度（像素）",
        required: false,
        default: "150",
      },
      {
        name: "triggerSize",
        type: '"sm" | "md" | "lg"',
        description: "Popover 模式下触发器色块的尺寸",
        required: false,
        default: '"md"',
      },
      {
        name: "smoothCorners",
        type: "boolean",
        description:
          "是否对触发器、弹层/内嵌容器、SV 面板、颜色预览与小色块启用 Figma/iOS 风格平滑圆角",
        required: false,
        default: "true",
      },
      {
        name: "smoothCornerSmoothing",
        type: "number",
        description: "平滑圆角强度（0..1），仅在 smoothCorners 为 true 时生效",
        required: false,
        default: "0.7",
      },
      {
        name: "triggerClassName",
        type: "string",
        description: "触发器额外类名（仅 popover 模式）",
        required: false,
      },
      {
        name: "contentClassName",
        type: "string",
        description: "面板容器额外类名",
        required: false,
      },
      {
        name: "labels",
        type: "Partial<ColorPickerLabels>",
        description:
          "界面文案（用于国际化）：presets、recent、trigger(color)；未传入的字段使用 DEFAULT_COLOR_PICKER_LABELS",
        required: false,
      },
      {
        name: "className",
        type: "string",
        description: "根容器额外类名",
        required: false,
      },
    ],
    version: "1.0.0",
    author: "QiuYeDx",
    tags: [
      "color",
      "picker",
      "hsv",
      "hex",
      "alpha",
      "transparency",
      "palette",
      "swatch",
      "form",
      "popover",
      "inline",
      "smooth-corners",
    ],
    cliName: "color-picker",
    basicUsage: basicUsageExamples[ComponentId.COLOR_PICKER],
  },
  [ComponentId.SMOOTH_CORNERS]: {
    name: "Smooth Corners",
    description:
      "Figma/iOS 风格平滑圆角组件：基于 CSS corner-shape 的渐进增强方案，将 radius + smoothing 转换为补偿半径和 superellipse，并在不支持的浏览器中自动回退到标准 border-radius。",
    category: "视觉与动效",
    dependencies: ["@qiuyedx/smooth-corners", "radix-ui"],
    files: {
      component: "components/qiuye-ui/smooth-corners.tsx",
      demo: "components/qiuye-ui/demos/smooth-corners-demo.tsx",
    },
    props: [
      {
        name: "radius",
        type: "number",
        description: "原始圆角半径，单位 px",
        required: false,
        default: "16",
      },
      {
        name: "smoothing",
        type: "number",
        description: "平滑强度，范围 0..1；0 表示标准圆弧，1 表示最大平滑",
        required: false,
        default: "0.6",
      },
      {
        name: "observeSize",
        type: "boolean",
        description:
          "是否根据元素实际尺寸自动压缩 smoothing，适合大圆角或尺寸动态变化场景",
        required: false,
        default: "false",
      },
      {
        name: "asChild",
        type: "boolean",
        description: "是否把效果应用到唯一子元素本身，而不是额外包一层 div",
        required: false,
        default: "false",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "是否禁用平滑圆角效果",
        required: false,
        default: "false",
      },
      {
        name: "className",
        type: "string",
        description: "根元素额外类名",
        required: false,
      },
      {
        name: "style",
        type: "React.CSSProperties",
        description: "根元素样式，会与组件生成的 CSS 自定义属性合并",
        required: false,
      },
      {
        name: "children",
        type: "React.ReactNode",
        description: "被包装的内容",
        required: false,
      },
    ],
    version: "1.0.0",
    author: "QiuYeDx",
    tags: [
      "smooth-corners",
      "corner-shape",
      "superellipse",
      "squircle",
      "figma",
      "ios",
      "radius",
      "progressive-enhancement",
    ],
    cliName: "smooth-corners",
    basicUsage: basicUsageExamples[ComponentId.SMOOTH_CORNERS],
  },
  [ComponentId.TOUR]: {
    name: "Tour",
    description:
      "产品引导组件：基于目标 selector 高亮页面元素并展示步骤 Popover，内置遮罩聚焦、Motion layoutId 迁移动画、进度显示、上一步/下一步/跳过与自动滚动定位。",
    category: "浮层与引导",
    dependencies: ["motion", "lucide-react"],
    files: {
      component: "components/qiuye-ui/tour.tsx",
      demo: "components/qiuye-ui/demos/tour-demo.tsx",
    },
    props: [
      {
        name: "steps",
        type: "TourStep[]",
        description:
          "引导步骤列表，每个步骤包含 target、title、content、placement 等配置",
        required: true,
      },
      {
        name: "open",
        type: "boolean",
        description: "受控打开状态",
        required: false,
      },
      {
        name: "defaultOpen",
        type: "boolean",
        description: "非受控默认打开状态",
        required: false,
        default: "false",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "打开状态变化回调",
        required: false,
      },
      {
        name: "currentStep",
        type: "number",
        description: "受控当前步骤下标，从 0 开始",
        required: false,
      },
      {
        name: "defaultStep",
        type: "number",
        description: "非受控默认步骤下标",
        required: false,
        default: "0",
      },
      {
        name: "onStepChange",
        type: "(stepIndex: number) => void",
        description: "步骤变化回调",
        required: false,
      },
      {
        name: "onFinish",
        type: "() => void",
        description: "完成 Tour 后的回调",
        required: false,
      },
      {
        name: "onSkip",
        type: "() => void",
        description: "跳过 Tour 或按 Escape 关闭后的回调",
        required: false,
      },
      {
        name: "scrollIntoView",
        type: "boolean",
        description: "进入步骤时是否自动滚动目标元素到可视区域",
        required: false,
        default: "true",
      },
      {
        name: "allowTargetInteraction",
        type: "boolean",
        description: "是否允许用户点击聚焦区域内的目标元素",
        required: false,
        default: "false",
      },
      {
        name: "maskClosable",
        type: "boolean",
        description: "点击遮罩层外部时是否跳过并关闭 Tour",
        required: false,
        default: "false",
      },
      {
        name: "showMask",
        type: "boolean",
        description: "是否显示遮罩层与聚焦高亮",
        required: false,
        default: "true",
      },
      {
        name: "zIndex",
        type: "number",
        description: "顶层浮层 z-index",
        required: false,
        default: "80",
      },
      {
        name: "popoverWidth",
        type: "number",
        description: "Popover 最大宽度（像素）",
        required: false,
        default: "340",
      },
      {
        name: "viewportPadding",
        type: "number",
        description: "Popover 与视口边缘的安全距离（像素）",
        required: false,
        default: "16",
      },
      {
        name: "popoverClassName",
        type: "string",
        description: "Popover 额外类名",
        required: false,
      },
      {
        name: "spotlightClassName",
        type: "string",
        description: "聚焦区域额外类名",
        required: false,
      },
      {
        name: "renderFooter",
        type: "(context: TourRenderContext) => React.ReactNode",
        description: "自定义底部操作区",
        required: false,
      },
      {
        name: "labels",
        type: "Partial<TourLabels>",
        description:
          "界面文案（用于国际化）：skip、previous、previousCompact、next、done、stepStatus(current, total)、targetUnavailable；未传入的字段使用 DEFAULT_TOUR_LABELS",
        required: false,
      },
      {
        name: "className",
        type: "string",
        description: "根浮层额外类名",
        required: false,
      },
    ],
    version: "1.0.0",
    author: "QiuYeDx",
    tags: [
      "tour",
      "guide",
      "onboarding",
      "popover",
      "spotlight",
      "mask",
      "layoutId",
      "motion",
      "navigation",
    ],
    cliName: "tour",
    basicUsage: basicUsageExamples[ComponentId.TOUR],
  },

  [ComponentId.MATRIX_EFFECT]: {
    name: "Matrix Effect",
    description:
      "通用 Canvas 矩阵视觉效果组件：将图片、外部 Canvas 或程序化信号场按响应式网格采样，通过可组合的 Mapper、Transform 与 Renderer 管线生成圆点矩阵、ASCII 艺术和自定义效果，并内置自适应帧率、DPR 限制、离屏暂停与 Reduced Motion 支持。",
    category: "视觉与动效",
    dependencies: [],
    files: {
      component: "components/qiuye-ui/matrix-effect/index.ts",
      demo: "components/qiuye-ui/demos/matrix-effect-demo.tsx",
      types: "components/qiuye-ui/matrix-effect/types.ts",
    },
    propsInfo: [
      {
        componentName: "MatrixEffect",
        props: [
          {
            name: "source",
            type: "MatrixSource",
            description: "必填的图片、外部 Canvas 或程序化输入 Source",
            required: true,
          },
          {
            name: "renderer",
            type: "MatrixRenderer",
            description: "把最终主信号场绘制到输出 Canvas 的 Renderer",
            required: true,
          },
          {
            name: "mapper",
            type: "MatrixSignalMapper",
            description: "把采样 RGBA 数据写入主信号场的同步 Mapper",
            required: false,
            default: "createLuminanceMapper()",
          },
          {
            name: "transforms",
            type: "readonly MatrixSignalTransform[]",
            description: "按数组顺序执行的整帧信号转换链",
            required: false,
            default: "[]",
          },
          {
            name: "grid",
            type: "MatrixGridConfig",
            description: "按容器比例计算 columns x rows 的响应式或固定网格配置",
            required: false,
            default: '{ mode: "auto", cellSize: 10, maxCells: 10000 }',
          },
          {
            name: "clearColor",
            type: "string | null",
            description: "Renderer 执行前的输出 Canvas 清屏颜色，null 表示透明",
            required: false,
            default: "null",
          },
          ...matrixEffectRuntimeProps,
        ],
      },
      {
        componentName: "DotMatrixEffect",
        props: [
          {
            name: "source",
            type: "MatrixSource",
            description: "自定义输入 Source；未传时使用内置柔和光团",
            required: false,
            default: "createSoftBlobSource(blobOptions)",
          },
          {
            name: "blobOptions",
            type: "SoftBlobSourceOptions",
            description: "内置柔和光团的数量、半径、速度、基础灰度和 seed 配置",
            required: false,
          },
          {
            name: "color",
            type: 'string | "source"',
            description: "圆点固定 CSS 颜色，或保留每个采样格的 Source RGB",
            required: false,
            default: '"#71717a"',
          },
          {
            name: "backgroundColor",
            type: "string | null",
            description: "输出 Canvas 的清屏颜色，null 表示透明",
            required: false,
            default: "null",
          },
          {
            name: "radiusRange",
            type: "readonly [minimum: number, maximum: number]",
            description: "主信号从 0 到 1 时对应的圆点半径范围，单位为 CSS px",
            required: false,
            default: "[0, 4]",
          },
          {
            name: "opacityRange",
            type: "readonly [minimum: number, maximum: number]",
            description: "主信号从 0 到 1 时对应的不透明度范围",
            required: false,
            default: "[1, 1]",
          },
          {
            name: "invert",
            type: "boolean",
            description: "是否在 Levels 之前反转主信号",
            required: false,
            default: "false",
          },
          {
            name: "levels",
            type: "LevelsTransformOptions",
            description: "可选的输入范围、Gamma、对比度和亮度调整",
            required: false,
          },
          {
            name: "additionalTransforms",
            type: "readonly MatrixSignalTransform[]",
            description: "在预设 Invert 和 Levels 之后执行的额外 Transform",
            required: false,
            default: "[]",
          },
          {
            name: "grid",
            type: "MatrixGridConfig",
            description: "按 auto/fixed 模式与 Dot 默认值合并的网格配置",
            required: false,
            default:
              '{ mode: "auto", cellSize: 10, cellAspectRatio: 1, maxCells: 10000 }',
          },
          ...matrixEffectRuntimeProps,
        ],
      },
      {
        componentName: "AsciiEffect",
        props: [
          {
            name: "source",
            type: "MatrixSource",
            description: "必填的图片、外部 Canvas 或程序化输入 Source",
            required: true,
          },
          {
            name: "grid",
            type: "MatrixGridConfig",
            description: "按 auto/fixed 模式与 ASCII 默认值合并的网格配置",
            required: false,
            default:
              '{ mode: "auto", cellSize: 10, cellAspectRatio: 1, maxCells: 6000 }',
          },
          {
            name: "characters",
            type: "string | readonly string[]",
            description: "从低视觉密度到高视觉密度排列的字符集",
            required: false,
            default: '" .:-=+*#%@"',
          },
          {
            name: "colorMode",
            type: '"fixed" | "source"',
            description: "使用统一固定色，或保留每个采样格的 Source RGB",
            required: false,
            default: '"fixed"',
          },
          {
            name: "color",
            type: "string",
            description: "固定色模式下的 CSS 颜色",
            required: false,
            default: '"#71717a"',
          },
          {
            name: "backgroundColor",
            type: "string | null",
            description: "输出 Canvas 的清屏颜色，null 表示透明",
            required: false,
            default: "null",
          },
          {
            name: "fontFamily",
            type: "string",
            description: "Canvas 文本使用的字体族",
            required: false,
            default:
              "\"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace\"",
          },
          {
            name: "fontWeight",
            type: "number | string",
            description: "Canvas 文本使用的字重",
            required: false,
            default: "400",
          },
          {
            name: "fontScale",
            type: "number",
            description: "字号相对于单元格高度的比例",
            required: false,
            default: "1",
          },
          {
            name: "invert",
            type: "boolean",
            description: "是否在 Levels 之前反转主信号",
            required: false,
            default: "false",
          },
          {
            name: "levels",
            type: "LevelsTransformOptions",
            description: "可选的输入范围、Gamma、对比度和亮度调整",
            required: false,
          },
          {
            name: "additionalTransforms",
            type: "readonly MatrixSignalTransform[]",
            description: "在预设 Invert 和 Levels 之后执行的额外 Transform",
            required: false,
            default: "[]",
          },
          ...matrixEffectRuntimeProps,
        ],
      },
    ],
    version: "1.0.0",
    author: "QiuYeDx",
    tags: [
      "canvas",
      "matrix",
      "grid",
      "visual-effect",
      "animation",
      "dots",
      "ascii",
      "image",
      "procedural",
      "sampling",
      "generative",
      "responsive",
    ],
    cliName: "matrix-effect",
    basicUsage: basicUsageExamples[ComponentId.MATRIX_EFFECT],
  },
};

// 获取所有组件分类
export function getCategories(): ComponentCategory[] {
  return [...COMPONENT_CATEGORIES];
}

// 根据分类获取组件
export function getComponentsByCategory(category: string): ComponentInfo[] {
  return Object.values(componentRegistry).filter(
    (component) => component.category === category,
  );
}

// 获取单个组件信息
export function getComponent(id: string): ComponentInfo | undefined {
  return componentRegistry[id];
}

// 搜索组件
export function searchComponents(query: string): ComponentInfo[] {
  const lowercaseQuery = query.toLowerCase();
  return Object.values(componentRegistry).filter(
    (component) =>
      component.name.toLowerCase().includes(lowercaseQuery) ||
      component.description.toLowerCase().includes(lowercaseQuery) ||
      component.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
  );
}

// 获取所有组件
export function getAllComponents(): ComponentInfo[] {
  return Object.values(componentRegistry);
}
