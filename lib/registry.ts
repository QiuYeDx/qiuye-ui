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
        description: "标签按钮尺寸：sm 高 32px、md 高 34px、lg 高 44px",
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
    version: "1.0.0",
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
    version: "1.0.0",
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
        ],
      },
    ],
    version: "1.0.0",
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
    dependencies: ["@qiuyedx/smooth-corners", "@radix-ui/react-slot"],
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
