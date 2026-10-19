"use client";

import * as React from "react";
import { cancelFrame, frame } from "motion/react";
import { Slot } from "radix-ui";

/* -------------------------------------------------------------------------- */
/*                                   公开类型                                  */
/* -------------------------------------------------------------------------- */

/**
 * 目标的指针效果，写在 `data-pointer` 上，或用 {@link pointerTarget} 生成
 * - `"auto"`：按尺寸自动判定，普通控件为 `highlight`，大目标为 `hover`
 * - `"highlight"`：填充层变形为垫在目标下方的圆角板，并朝指针做阻尼偏移
 * - `"lift"`：填充层淡出，由使用方根据 `data-pointer-state="lift"` 写上浮样式
 * - `"hover"`：填充层保持跟手的柔和圆，不变形、不偏移（大卡片、整行链接）
 * - `"text"`：写在容器上，区域内的正文显示 I 形竖条
 * - `"none"`：本元素不是目标，并停止向上查找（子孙中的目标仍然有效）
 * - `"native"`：整个子树交还原生指针
 */
export type AdaptivePointerEffect =
  | "auto"
  | "highlight"
  | "lift"
  | "hover"
  | "text"
  | "none"
  | "native";

/**
 * 指针当前的形态
 * - `"inactive"`：未激活（设备不支持、触屏操作中或尚未移动过鼠标）
 * - `"hidden"`：暂时隐藏（离开窗口、键盘输入、静止自动隐藏等），下一次移动恢复
 * - `"native"`：热点下方交还原生指针（输入框、原生区、作用域外）
 * - `"idle"`：静止圆
 * - `"pending"`：高速掠过目标，外环已缩小、填充层还未变形
 * - `"highlight"` / `"lift"` / `"hover"`：已吸附到目标
 * - `"text"`：正文 I 形竖条
 */
export type AdaptivePointerState =
  | "inactive"
  | "hidden"
  | "native"
  | "idle"
  | "pending"
  | "highlight"
  | "lift"
  | "hover"
  | "text";

/** `onStateChange` 回调收到的信息 */
export interface AdaptivePointerStateInfo {
  /** 当前形态 */
  state: AdaptivePointerState;
  /** 当前吸附（或待吸附）的目标元素 */
  target: Element | null;
  /** 主键是否按下 */
  pressed: boolean;
}

/** {@link useAdaptivePointerStatus} 返回的全局状态 */
export interface AdaptivePointerStatus {
  /** 设备是否支持（有悬停能力的精确指针，且未开启强制颜色）。SSR 与水合首帧为 `null` */
  supported: boolean | null;
  /** 是否已有作用域隐藏了原生指针 */
  active: boolean;
  /** 当前形态 */
  state: AdaptivePointerState;
  /** 主键是否按下 */
  pressed: boolean;
}

/** 大目标的判定阈值 */
export interface AdaptivePointerLargeTarget {
  /**
   * 目标高度超过该值（px）时视为大目标
   * @default 96
   */
  height?: number;
  /**
   * 目标面积超过该值（px²）时视为大目标
   * @default 32000
   */
  area?: number;
}

/** `AdaptivePointer` 与 `AdaptivePointerArea` 共用的配置 */
export interface AdaptivePointerOptions {
  /**
   * 关闭本作用域，交还原生指针（适合接用户的「使用系统指针」偏好）
   * @default false
   */
  disabled?: boolean;
  /**
   * 静止时两层的直径（px），夹在 12–40 并取偶数，让圆心落在整像素上
   * @default 20
   */
  size?: number;
  /**
   * 外环定位：开启后外环与填充层分离，悬停在可点击目标上时缩成小圆，1:1 标出真实热点。
   * 关闭即 Apple 经典的单层指针（静止填充更深一些）。
   * @default false
   */
  ring?: boolean;
  /**
   * 悬停在可点击目标上时外环缩成的直径（px），夹在 4 到 `size - 4`
   * @default 8
   */
  ringSize?: number;
  /**
   * 外环描边宽度（CSS px），夹在 1–3；实际按设备像素取整，增强对比度偏好下至少为 2
   * @default 1.5
   */
  ringWidth?: number;
  /**
   * 阻尼偏移强度倍数（0–2）。`0` 同时关闭偏移、拉伸与内容视差
   * @default 1
   */
  parallax?: number;
  /**
   * 内容视差：吸附到只有图标的目标（图标按钮）时，图标跟着圆角板轻微移动。
   * 写了 `data-pointer-content` 的子元素不受此开关影响，始终参与；目标上写
   * `data-pointer-content="off"` 可单独关闭。
   * @default true
   */
  contentParallax?: boolean;
  /**
   * 正文 I 形竖条：指针落在作用域内的正文字符上（且不在可点击目标上）时，外环变为 I 形竖条并吸附到行。
   * 关闭后只在写了 `data-pointer="text"` 的区域内显示；`data-pointer="none"` 的子树不显示。
   * @default true
   */
  textBeam?: boolean;
  /**
   * 大目标阈值：`auto` 目标的高度或面积超过阈值时按 `hover` 处理，不变形为圆角板
   * @default { height: 96, area: 32000 }
   */
  largeTarget?: AdaptivePointerLargeTarget;
  /**
   * 自动识别可点击目标的选择器，整体替换默认值。
   * 扩展写法：`` `${DEFAULT_ADAPTIVE_POINTER_SELECTOR}, .clickable` ``。
   * 浏览器不支持的段会被丢弃（开发环境给出警告）。
   * @default DEFAULT_ADAPTIVE_POINTER_SELECTOR
   */
  selector?: string;
  /**
   * 按下非修饰键时淡出，移动指针后恢复
   * @default true
   */
  hideOnKeyboard?: boolean;
  /**
   * 静止多少毫秒后淡出（最小 500），`false` 为常驻
   * @default 2000
   */
  autoHide?: number | false;
  /**
   * 物理时间倍率（0.1–2），`0.25` 即四倍慢放，便于调试与观察
   * @default 1
   */
  timeScale?: number;
  /**
   * 形态、目标或按压状态变化时触发（经 `queueMicrotask` 调用，不在帧循环内）。
   * 指针离开本作用域时收到 `{ state: "hidden", target: null }`。
   */
  onStateChange?: (info: AdaptivePointerStateInfo) => void;
}

/** AdaptivePointer（整页作用域）组件的属性 */
export type AdaptivePointerProps = AdaptivePointerOptions;

/** AdaptivePointerArea（局部作用域）组件的属性 */
export interface AdaptivePointerAreaProps
  extends
    AdaptivePointerOptions,
    Omit<React.HTMLAttributes<HTMLDivElement>, keyof AdaptivePointerOptions> {
  /**
   * 用 Radix `Slot` 把作用域挂到唯一的子元素上，不增加 DOM 层级
   * @default false
   */
  asChild?: boolean;
}

/** {@link pointerTarget} 的选项 */
export interface PointerTargetOptions {
  /**
   * 目标效果
   * @default "auto"
   */
  effect?: AdaptivePointerEffect;
  /** 圆角板的外扩（px）：数字为两轴相同，元组为 `[x, y]` */
  padding?: number | readonly [x: number, y: number];
  /** 圆角板的圆角（px），或 `"full"` 表示胶囊 */
  radius?: number | "full";
  /** 该目标的偏移强度倍数，`0` 关闭偏移与拉伸 */
  parallax?: number;
}

/** {@link pointerTarget} 返回的 data 属性，直接展开到元素上 */
export type PointerTargetAttributes = Partial<
  Record<
    | "data-pointer"
    | "data-pointer-padding"
    | "data-pointer-radius"
    | "data-pointer-parallax",
    string
  >
>;

/* -------------------------------------------------------------------------- */
/*                                  选择器与 CSS                               */
/* -------------------------------------------------------------------------- */

const BUTTON_LIKE_INPUT_TYPES =
  '[type="button"],[type="submit"],[type="reset"],[type="image"],[type="checkbox"],[type="radio"],[type="file"],[type="range"],[type="color"]';

/**
 * 默认的可点击目标选择器。
 * 不用计算样式 `cursor: pointer` 识别目标：组件生效后计算值全是 `none`。
 * 自定义的可点击 `div` 需要加 `role="button"` 或 `data-pointer`。
 * 扩展时在客户端组件里拼接（本模块带 `"use client"`，服务端组件读到的不是这个字符串）。
 */
export const DEFAULT_ADAPTIVE_POINTER_SELECTOR = [
  "a[href]",
  "area[href]",
  "button",
  "summary",
  "label[for]",
  `input:is(${BUTTON_LIKE_INPUT_TYPES})`,
  '[role="button"]',
  '[role="link"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="option"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
  '[role="slider"]',
  '[role="treeitem"]',
  '[role="combobox"]',
  '[class~="cursor-pointer"]',
  '[style*="cursor: pointer"]',
].join(", ");

/** 禁用：不是目标，保持大外环，并停止向上查找（禁用按钮的点击不会冒泡到外层卡片） */
const DISABLED_SELECTOR =
  ':disabled, [aria-disabled="true"], [data-disabled]:not([data-disabled="false"]), [inert], [inert] *';

/**
 * 结构性原生宿主：可编辑控件、iframe、顶层元素等，没有作者光标声明时显式恢复 `cursor: auto`。
 * 这里只用按属性名、标签名或状态伪类的选择器：它们会出现在后代组合符左侧，
 * 若写成 `[style*=…]` / `[class*=…]` 这类子串匹配，任何元素改内联样式或类名都会让浏览器重算它的整棵子树。
 */
const NATIVE_HOST = [
  '[data-pointer="native"]',
  '[data-adaptive-pointer-area="off"]',
  "[data-adaptive-pointer-fallback]",
  "[data-adaptive-pointer-native]",
  `input:not(${BUTTON_LIKE_INPUT_TYPES},[type="hidden"])`,
  "textarea",
  "select",
  '[contenteditable]:not([contenteditable="false"])',
  "iframe",
  "embed",
  "object",
  "video[controls]",
  "audio[controls]",
  "dialog:modal",
  ":popover-open",
  ":fullscreen:not(:root, body)",
].join(", ");

/** 作者写了语义光标的元素：不带变体前缀的 Tailwind `cursor-*`，排除通用的 pointer / default / auto */
const CURSOR_TOKEN_HOST =
  ':is([class^="cursor-"], [class*=" cursor-"]):not([class~="cursor-pointer"], [class~="cursor-default"], [class~="cursor-auto"])';

/** 内联光标（React 序列化为「cursor: pointer;」），排除通用光标 */
const INLINE_CURSOR_HOST =
  '[style*="cursor:"]:not([style*="cursor: pointer"], [style*="cursor: default"], [style*="cursor: auto"])';

/**
 * 不带变体前缀的 Tailwind 语义光标类。类选择器只在该类本身增删时失效，可以放在后代组合符左侧；
 * 内联光标与任意值光标类（方括号写法，例如自定义图片光标）不在此列，由引擎在命中时给宿主写上
 * `data-adaptive-pointer-native`，它的子孙随之交还原生指针。
 */
const CURSOR_CLASS_HOST = [
  "wait",
  "text",
  "move",
  "help",
  "not-allowed",
  "none",
  "context-menu",
  "progress",
  "cell",
  "crosshair",
  "vertical-text",
  "alias",
  "copy",
  "no-drop",
  "grab",
  "grabbing",
  "all-scroll",
  "col-resize",
  "row-resize",
  "n-resize",
  "e-resize",
  "s-resize",
  "w-resize",
  "ne-resize",
  "nw-resize",
  "se-resize",
  "sw-resize",
  "ew-resize",
  "ns-resize",
  "nesw-resize",
  "nwse-resize",
  "zoom-in",
  "zoom-out",
]
  .map((name) => `.cursor-${name}`)
  .join(", ");

/** 元素自身是否交还原生指针（只作用于主体，可以用子串匹配） */
const NATIVE = `${NATIVE_HOST}, ${CURSOR_TOKEN_HOST}, ${INLINE_CURSOR_HOST}`;
const NATIVE_MATCH = `:where(${NATIVE})`;
/** 子孙是否交还原生指针（出现在后代组合符左侧，只用不会引发整棵子树重算的选择器） */
const NATIVE_ANCESTOR_MATCH = `:where(${NATIVE_HOST}, ${CURSOR_CLASS_HOST})`;
/** 需要引擎补写属性的作者光标宿主：内联光标与任意值光标类 */
const STAMPED_CURSOR_HOST = `:where(${CURSOR_TOKEN_HOST}, ${INLINE_CURSOR_HOST}):not(${CURSOR_CLASS_HOST})`;

/** 作者主动隐藏光标（视频播放中等），叠加层也隐藏 */
const AUTHOR_HIDDEN = '[class~="cursor-none"], [style*="cursor: none"]';

/** 连续组：组容器内的缝隙里，圆角板留在上一个目标上，直到进入新目标或离开容器 */
const GROUP_SELECTOR = [
  '[data-pointer-group]:not([data-pointer-group="off"])',
  '[role="toolbar"]',
  '[role="tablist"]',
  '[role="menubar"]',
  '[role="menu"]',
  '[role="listbox"]',
  '[role="radiogroup"]',
  '[data-slot="button-group"]',
  '[data-slot="toggle-group"]',
].join(", ");

/**
 * 启用条件：有悬停能力的精确指针、未开启强制颜色、未开启「减少动态效果」。
 * 减少动态效果时变形与偏移都要去掉，剩下的效果不如系统指针，所以直接交还系统指针。
 * CSS 与 JS 用同一条查询，任何一方不满足时两边同时退回原生。
 */
const MEDIA_QUERY =
  "(hover: hover) and (pointer: fine) and (forced-colors: none) and (prefers-reduced-motion: no-preference)";
const CSS_HREF = "qiuye-adaptive-pointer";
const VIEW_TRANSITION_NAME = "qiuye-adaptive-pointer";

const ATTR_SCOPE = "data-adaptive-pointer";
const ATTR_AREA = "data-adaptive-pointer-area";
const ATTR_OVERLAY = "data-adaptive-pointer-overlay";
const ATTR_FALLBACK = "data-adaptive-pointer-fallback";
const ATTR_NATIVE = "data-adaptive-pointer-native";
const ATTR_STATE = "data-pointer-state";
const ATTR_PRESSED = "data-pointer-pressed";
const ATTR_CONTENT = "data-pointer-content";
const ATTR_CONTENT_WRITTEN = "data-ap-content-written";

/**
 * 组件注入的全部静态 CSS：主题令牌、隐藏原生指针的规则、打印与强制颜色降级、View Transition 分组。
 * React 19 会经 `<style href precedence>` 提升到 head 并去重；React 18 项目可以把它手动放进全局样式。
 *
 * 令牌写成零优先级的 `:where()`，在 `:root` 与 `.dark` 上分别声明（与 shadcn 主题变量相同）。
 * 使用方在自己的 `:root` / `.dark`、局部 `.dark` 岛或 `AdaptivePointerArea` 根节点上覆盖即可
 * （引擎只从这几处读取令牌）。颜色令牌须是合法的 CSS 颜色，无效时退回默认值。
 */
export const ADAPTIVE_POINTER_CSS = `:where(:root){--adaptive-pointer-fill:var(--foreground,CanvasText);--adaptive-pointer-ring:color-mix(in oklab,var(--foreground,CanvasText) 72%,var(--background,Canvas));--adaptive-pointer-halo:color-mix(in oklab,var(--background,Canvas) 72%,transparent);--adaptive-pointer-alpha-idle:0.16;--adaptive-pointer-alpha-solo:0.28;--adaptive-pointer-alpha-plate:0.075;--adaptive-pointer-alpha-hover:0.09;--adaptive-pointer-alpha-press:0.04}
:where(.dark){--adaptive-pointer-fill:var(--foreground,CanvasText);--adaptive-pointer-ring:color-mix(in oklab,var(--foreground,CanvasText) 80%,var(--background,Canvas));--adaptive-pointer-halo:color-mix(in oklab,var(--background,Canvas) 60%,transparent);--adaptive-pointer-alpha-idle:0.22;--adaptive-pointer-alpha-solo:0.34;--adaptive-pointer-alpha-plate:0.11;--adaptive-pointer-alpha-hover:0.13;--adaptive-pointer-alpha-press:0.05}
@media (prefers-contrast: more){:where(:root){--adaptive-pointer-ring:var(--foreground,CanvasText);--adaptive-pointer-halo:color-mix(in oklab,var(--background,Canvas) 92%,transparent);--adaptive-pointer-alpha-idle:0.24;--adaptive-pointer-alpha-solo:0.4;--adaptive-pointer-alpha-plate:0.11;--adaptive-pointer-alpha-hover:0.13;--adaptive-pointer-alpha-press:0.06}:where(.dark){--adaptive-pointer-ring:var(--foreground,CanvasText);--adaptive-pointer-halo:color-mix(in oklab,var(--background,Canvas) 85%,transparent);--adaptive-pointer-alpha-idle:0.32;--adaptive-pointer-alpha-solo:0.46;--adaptive-pointer-alpha-plate:0.16;--adaptive-pointer-alpha-hover:0.19;--adaptive-pointer-alpha-press:0.07}}
@media ${MEDIA_QUERY}{[${ATTR_SCOPE}="on"]:not(${NATIVE_MATCH}),[${ATTR_SCOPE}="on"] :not(${NATIVE_MATCH},${NATIVE_ANCESTOR_MATCH} *){cursor:none!important}:where([${ATTR_SCOPE}="on"] :is(${NATIVE_HOST})):not(:where([class^="cursor-"],[class*=" cursor-"],[style*="cursor"])){cursor:auto}}
@media print,(forced-colors: active){[${ATTR_OVERLAY}]{display:none!important}}
::view-transition-old(${VIEW_TRANSITION_NAME}){display:none}
::view-transition-group(${VIEW_TRANSITION_NAME}),::view-transition-new(${VIEW_TRANSITION_NAME}){animation:none}`;

/* -------------------------------------------------------------------------- */
/*                                   物理参数                                  */
/* -------------------------------------------------------------------------- */

/** 弹簧参数：[响应时间 T（s）, 阻尼比 ζ]，质量取 1，k = (2π/T)²，c = 4πζ/T */
type SpringSpec = readonly [response: number, damping: number];

// 外环直径：收缩时 ζ0.6，约 0.125s 到达峰值、过冲约 1px，是一下利落的「咔」，先于填充层到位；
// 恢复时 ζ0.75 几乎不弹（回家不要弹）。
const RING_SHRINK: SpringSpec = [0.2, 0.6];
const RING_GROW: SpringSpec = [0.2, 0.75];
// 圆 ↔ 竖条：光标过冲会显得软。
const RING_BEAM: SpringSpec = [0.2, 0.9];
// 重新出现时外环从 0.75 弹出：唯一刻意偏弹的一档，帮用户找到指针。
const RING_POP: SpringSpec = [0.24, 0.55];
// 文本换行时外环纵向吸附到新行：快、无过冲，像落进轨道。
const RING_LINE: SpringSpec = [0.14, 1];
// 填充层位置残差：吸附 0.30s，比 Apple 的 0.4s 短，因为旁边有 1:1 的外环作对照，0.4s 会显得拖沓。
const FILL_ATTACH: SpringSpec = [0.3, 0.85];
// 目标之间滑行：形状已经成形，只是换位置（Apple 相邻滑动约 0.25s）。
const FILL_SLIDE: SpringSpec = [0.26, 0.85];
// 脱离时追的是移动中的指针，任何过冲都会表现为绕着外环打转，所以临界阻尼。
const FILL_DETACH: SpringSpec = [0.24, 1];
const FILL_FLING: SpringSpec = [0.18, 1];
const SIZE_ATTACH: SpringSpec = [0.3, 0.8];
const SIZE_SLIDE: SpringSpec = [0.26, 0.85];
const SIZE_DETACH: SpringSpec = [0.24, 0.95];
const SIZE_FLING: SpringSpec = [0.18, 1];
// 圆角过冲会瞬间露出尖角，所以一律临界阻尼。
const RADIUS_ATTACH: SpringSpec = [0.3, 1];
const RADIUS_OTHER: SpringSpec = [0.24, 1];
// 视差：稳态滞后 2ζ/ω ≈ 108ms，就是「有分量」的阻尼感，对鼠标抖动也不发颤。
const PARALLAX: SpringSpec = [0.34, 1];
// 按下即响应（Apple 约 80–120ms），松手轻微「呼吸」回来。
const PRESS_DOWN: SpringSpec = [0.1, 1];
const PRESS_UP: SpringSpec = [0.28, 0.65];
// 透明度：显示必须快，状态之间不过冲（过冲会像闪了一下）。
const ALPHA_SHOW: SpringSpec = [0.1, 1];
const ALPHA_STATE: SpringSpec = [0.2, 1];
const ALPHA_FADE: SpringSpec = [0.16, 1];
const CONTENT_RETURN: SpringSpec = [0.22, 1];

/** 吸附时带入的速度比例与上限（px/s）：冲出量上限约 v/(ω·e) ≤ 5px，读作「磁铁抓住了冲进来的板」 */
const ATTACH_CARRY = 0.35;
const ATTACH_MAX_VELOCITY = 285;
/** 意图延迟：从 idle 出发、速度超过 1.6px/ms 时，填充层等到减速或停留满 50ms 再变形 */
const INTENT_SPEED = 1.6;
const INTENT_DWELL = 50;
/** 离开目标的宽限：≤ 80ms 且距离 ≤ 12px；离开速度超过 1.5px/ms 时直接脱离（fling） */
const BRIDGE_SPEED = 1.5;
const BRIDGE_TIME = 80;
const BRIDGE_DISTANCE = 12;
/** 最后一次 scroll / wheel 之后 120ms 内不新吸附；已吸附的目标位移超过 4px 即脱离 */
const SCROLL_QUIET = 120;
const SCROLL_DETACH = 4;
/** 指针速度 EMA 的时间常数与过期时间（ms） */
const VELOCITY_TAU = 40;
const VELOCITY_STALE = 50;
/** 圆角板：最小 24px；偏移上限为短边的 14%（夹在 2–6px）；指针到达板子边缘时偏移为上限的 60% */
const PLATE_MIN = 24;
const OFFSET_RATIO = 0.14;
const OFFSET_MIN = 2;
const OFFSET_MAX = 6;
const OFFSET_SLOPE = 1.5; // = REACH / (1 - REACH)，REACH = 0.6
const STRETCH = 0.5;
/** 大目标上的柔和圆为 size 的 1.8 倍 */
const HOVER_SCALE = 1.8;
/** 按压：highlight 尺寸 ×(1-0.04p)、偏移 ×(1-0.75p)；外环 ×(1-0.25p)；idle 两层 ×(1-0.1p) */
const PRESS_PLATE = 0.04;
const PRESS_OFFSET = 0.75;
const PRESS_RING = 0.25;
const PRESS_IDLE = 0.1;
/** 快速点击时按压视觉至少保持 80ms，否则按下与松开落在同一帧，看不到任何反馈 */
const PRESS_MIN_VISUAL = 80;
/** 卡顿熔断：10s 内 3 次 > 250ms 的帧间隔就交还原生指针，冷却 30s；本会话熔断 3 次后不再激活 */
const JANK_FRAME = 250;
const JANK_WINDOW = 10000;
const JANK_COUNT = 3;
const JANK_COOLDOWN = 30000;
const JANK_TRIPS = 3;
/** 休眠期间的轮询：每 250ms 检查一次已吸附目标是否移动，距最后一次指针活动超过 10s 后停止 */
const POLL_INTERVAL = 250;
const POLL_LIMIT = 10000;
/** 已吸附且静止满 1s 后才允许休眠（期间继续逐帧跟随目标的过渡动画） */
const ENGAGED_SLEEP_DELAY = 1000;
/** 隐藏原因与淡出时长（ms，0 为立即） */
const HIDE_FADE = {
  keyboard: 150,
  idle: 300,
  leave: 120,
  blur: 120,
  frame: 0,
  page: 0,
  drag: 0,
  menu: 0,
  autoscroll: 0,
  lock: 0,
  picker: 0,
  fallback: 0,
} as const;

type HiddenReason = keyof typeof HIDE_FADE;

const MODIFIER_KEYS = new Set([
  "Shift",
  "Control",
  "Alt",
  "Meta",
  "CapsLock",
  "Fn",
  "FnLock",
  "Hyper",
  "Super",
  "OS",
  "AltGraph",
]);

/* -------------------------------------------------------------------------- */
/*                                   工具函数                                  */
/* -------------------------------------------------------------------------- */

declare const process: { env: { NODE_ENV?: string } };

function isDevelopment() {
  try {
    return process.env.NODE_ENV === "development";
  } catch {
    return false;
  }
}

const warned = new Set<string>();
function warnDev(message: string) {
  if (!isDevelopment() || warned.has(message)) return;
  warned.add(message);
  console.warn(`[AdaptivePointer] ${message}`);
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const evenClamp = (value: number, min: number, max: number) =>
  clamp(2 * Math.round(value / 2), min, Math.max(min, max));

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const toRect = (r: DOMRectReadOnly): Rect => ({
  left: r.left,
  top: r.top,
  right: r.right,
  bottom: r.bottom,
});

const intersect = (a: Rect, b: Rect): Rect => ({
  left: Math.max(a.left, b.left),
  top: Math.max(a.top, b.top),
  right: Math.min(a.right, b.right),
  bottom: Math.min(a.bottom, b.bottom),
});

const sameRect = (a: Rect | null, b: Rect | null) =>
  !!a &&
  !!b &&
  Math.abs(a.left - b.left) < 0.5 &&
  Math.abs(a.top - b.top) < 0.5 &&
  Math.abs(a.right - b.right) < 0.5 &&
  Math.abs(a.bottom - b.bottom) < 0.5;

const inside = (x: number, y: number, r: Rect | null) =>
  !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;

const distanceToRect = (x: number, y: number, r: Rect) =>
  Math.hypot(
    Math.max(r.left - x, 0, x - r.right),
    Math.max(r.top - y, 0, y - r.bottom),
  );

/** 沿组合树向上：普通父元素，或开放 Shadow DOM 的宿主 */
function composedParent(node: Element): Element | null {
  if (node.parentElement) return node.parentElement;
  const root = node.getRootNode();
  return root instanceof ShadowRoot ? root.host : null;
}

/** 穿过开放 Shadow DOM 的 closest */
function closestComposed(start: Element | null, selector: string) {
  for (let node = start; node; ) {
    const found = node.closest(selector);
    if (found) return found;
    const root = node.getRootNode();
    node = root instanceof ShadowRoot ? root.host : null;
  }
  return null;
}

/** 穿过开放 Shadow DOM 的 contains：Node.contains 不跨 shadow 边界 */
function containsComposed(root: Element, node: Element) {
  if (root.contains(node)) return true;
  for (let current: Element | null = node; current; ) {
    if (current === root) return true;
    current = composedParent(current);
  }
  return false;
}

/** 逐层进入开放 Shadow DOM 的 elementFromPoint */
function deepElementFromPoint(x: number, y: number) {
  let element = document.elementFromPoint(x, y);
  while (element?.shadowRoot) {
    const inner = element.shadowRoot.elementFromPoint(x, y);
    if (!inner || inner === element) break;
    element = inner;
  }
  return element;
}

/** 命中元素所在的 body 顶层子节点（Radix Portal 渲染的那个 div） */
function topLevelOf(element: Element) {
  const body = document.body;
  let node: Element | null = element;
  while (node) {
    const parent = composedParent(node);
    if (parent === body) return node;
    node = parent;
  }
  return null;
}

let nativeMatch: string | null = null;
/** NATIVE 选择器在 JS 侧的匹配串；不认识的伪类由 :where 宽容解析忽略，仍失败时退回不含顶层伪类的版本 */
function nativeSelector() {
  if (nativeMatch) return nativeMatch;
  try {
    document.documentElement.matches(NATIVE_MATCH);
    nativeMatch = NATIVE_MATCH;
  } catch {
    nativeMatch = `:where(${NATIVE.replace(/,\s*:popover-open/, "")})`;
  }
  return nativeMatch;
}

const matchesNative = (element: Element) =>
  !!closestComposed(element, nativeSelector());

/** 页面是否处于 View Transition 中（不认识 :active-view-transition 的浏览器视为否） */
function viewTransitionActive() {
  try {
    return document.documentElement.matches(":active-view-transition");
  } catch {
    return false;
  }
}

const selectorCache = new Map<string, string>();
/** 按顶层逗号拆段（忽略括号与方括号内的逗号），逐段校验，丢弃浏览器不支持的段 */
function sanitizeSelector(input: string) {
  const cached = selectorCache.get(input);
  if (cached !== undefined) return cached;
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    else if (ch === "," && depth === 0) {
      parts.push(input.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(input.slice(start));
  const canCheck =
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("selector(div)");
  const result = parts
    .map((part) => part.trim())
    .filter((part) => {
      if (!part) return false;
      if (!canCheck || CSS.supports(`selector(${part})`)) return true;
      warnDev(`忽略不支持的选择器：${part}`);
      return false;
    })
    .join(", ");
  selectorCache.set(input, result);
  return result;
}

const styleCache = new WeakMap<Element, CSSStyleDeclaration>();
/** 计算样式对象是实时的，按元素缓存，读属性时浏览器只在样式脏时重算 */
function liveStyle(element: Element) {
  let style = styleCache.get(element);
  if (!style) {
    style = getComputedStyle(element);
    styleCache.set(element, style);
  }
  return style;
}

const parsePx = (value: string) => {
  const match = /^\s*(-?[\d.]+)px\s*$/.exec(value);
  return match ? Number(match[1]) : null;
};

/** 读取一个角的视觉圆角（px）：百分比按短边换算，calc(infinity) 夹到短边一半 */
function parseRadius(raw: string, short: number) {
  const first = raw.trim().split(/\s+/)[0] ?? "";
  const value = parseFloat(first);
  if (!Number.isFinite(value)) return 0;
  const px = first.endsWith("%") ? (value / 100) * short : value;
  return clamp(px, 0, short / 2);
}

/** 过渡是否会作用到 translate（transition-property 的初始值就是 all，要结合时长判断） */
function transitionsTranslate(style: CSSStyleDeclaration) {
  const properties = style.transitionProperty.split(",");
  const durations = style.transitionDuration.split(",");
  return properties.some((property, index) => {
    const name = property.trim();
    if (name !== "all" && name !== "translate" && name !== "transform") {
      return false;
    }
    return parseFloat(durations[index % durations.length] ?? "0") > 0;
  });
}

/** 默认的内容视差强度：图标走圆角板偏移的 40% */
const CONTENT_STRENGTH = 0.4;

/**
 * 默认内容视差只作用于「只有图标」的目标：子节点全是 svg / img（读屏专用的隐藏文字除外），
 * 没有可见文字。图标与文字混排时只移动图标会让两者错开，所以不处理；
 * 带 translate 或对 translate / transform 设置了过渡的图标也跳过。
 */
function autoContents(element: Element): ContentTarget[] {
  const icons: ContentTarget[] = [];
  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      if (child.textContent?.trim()) return [];
      continue;
    }
    if (!(child instanceof Element)) continue;
    const rect = child.getBoundingClientRect();
    if (rect.width <= 1 && rect.height <= 1) continue;
    if (
      !(child instanceof SVGSVGElement || child instanceof HTMLImageElement)
    ) {
      return [];
    }
    const style = getComputedStyle(child);
    if (
      (style.translate && style.translate !== "none") ||
      transitionsTranslate(style)
    ) {
      return [];
    }
    icons.push({ el: child, strength: CONTENT_STRENGTH });
  }
  return icons.length <= 2 ? icons : [];
}

/**
 * 阻尼偏移（橡皮筋双曲线）：中心斜率 1.5·max/half，指针到达板子边缘（|d| = half）时为 0.6·max，
 * 越界后渐近 max。比线性夹取少一个「撞墙」的折角，比 tanh 多一条可以被拉一拉的长尾。
 */
function dampedOffset(d: number, half: number, max: number) {
  if (max <= 0 || half <= 0) return 0;
  const u = (OFFSET_SLOPE * Math.abs(d)) / half;
  return Math.sign(d) * max * (u / (1 + u));
}

/* -------------------------------------------------------------------------- */
/*                                    弹簧                                     */
/* -------------------------------------------------------------------------- */

interface Spring {
  x: number;
  v: number;
  t: number;
  k: number;
  c: number;
  eps: number;
  epsV: number;
}

/** 几何通道：|x - t| < 0.01px 且 |v| < 0.5px/s 视为静止 */
const geometrySpring = (x = 0): Spring => ({
  x,
  v: 0,
  t: x,
  k: 439,
  c: 41.9,
  eps: 0.01,
  epsV: 0.5,
});

/** 透明度与按压因子：阈值更细，否则会停在差几个百分点的地方，再一下跳到位 */
const unitSpring = (x = 0): Spring => ({
  x,
  v: 0,
  t: x,
  k: 987,
  c: 62.8,
  eps: 0.001,
  epsV: 0.01,
});

function tune(spring: Spring, [response, damping]: SpringSpec) {
  const omega = (2 * Math.PI) / response;
  spring.k = omega * omega;
  spring.c = 2 * damping * omega;
}

const settled = (spring: Spring) => spring.x === spring.t && spring.v === 0;

/** 半隐式欧拉，子步长 ≤ 1/240s（最硬的弹簧 ω≈63，ω·h≈0.26，远小于稳定上限） */
function step(spring: Spring, dt: number) {
  if (settled(spring) || dt <= 0) return;
  const count = Math.max(1, Math.ceil(dt * 240));
  const h = dt / count;
  for (let i = 0; i < count; i++) {
    spring.v += (-spring.k * (spring.x - spring.t) - spring.c * spring.v) * h;
    spring.x += spring.v * h;
  }
  if (
    Math.abs(spring.x - spring.t) < spring.eps &&
    Math.abs(spring.v) < spring.epsV
  ) {
    spring.x = spring.t;
    spring.v = 0;
  }
}

function jump(spring: Spring, value: number) {
  spring.x = value;
  spring.t = value;
  spring.v = 0;
}

/* -------------------------------------------------------------------------- */
/*                                  引擎内部类型                               */
/* -------------------------------------------------------------------------- */

type EngagedEffect = "highlight" | "lift" | "hover";
type Mode = "idle" | "pending" | "engaged" | "text" | "native";

interface ScopeConfig {
  size: number;
  ring: boolean;
  ringSize: number;
  ringWidth: number;
  parallax: number;
  largeHeight: number;
  largeArea: number;
  selector: string;
  hideOnKeyboard: boolean;
  autoHide: number | false;
  contentParallax: boolean;
  textBeam: boolean;
  timeScale: number;
}

interface ScopeRecord {
  id: string;
  kind: "page" | "area";
  root: Element;
  order: number;
  disabled: boolean;
  config: ScopeConfig;
  callback: { current: AdaptivePointerOptions["onStateChange"] };
  last: AdaptivePointerStateInfo | null;
}

interface ContentTarget {
  el: HTMLElement | SVGElement;
  strength: number;
}

interface TargetInfo {
  el: Element;
  effect: EngagedEffect;
  inline: boolean;
  padding: readonly [number, number] | null;
  radius: number | "full" | null;
  radiusRaw: string;
  superellipse: boolean;
  scRadius: number | null;
  parallax: number;
  clips: Element[];
  group: Element | null;
  contents: ContentTarget[];
  /** 本帧测得的可见矩形（已与裁剪祖先求交） */
  rect: Rect | null;
  /** 上一帧的可见矩形：滚动开始时以它为基准累计位移 */
  prev: Rect | null;
  /** 未裁剪的矩形，用于休眠期间的轮询比对 */
  raw: Rect | null;
  clip: Rect | null;
  groupRect: Rect | null;
  segment: number;
  healthy: boolean;
}

interface TextLine {
  cy: number;
  h: number;
  top: number;
  bottom: number;
  lh: number;
  /** 命中的字符：行的几何每帧从它重新测量，滚动或重排后不会沿用过期的视口坐标 */
  node: Text;
  from: number;
  to: number;
}

type Resolution =
  | { kind: "native" }
  | { kind: "author" }
  | { kind: "idle" }
  | { kind: "target"; el: Element; effect: EngagedEffect }
  | { kind: "text"; region: Element };

interface Anchor {
  cx: number;
  cy: number;
  w: number;
  h: number;
  r: number;
  /** 该轴是否跟随指针（决定锚点切换时速度怎么交接） */
  fx: boolean;
  fy: boolean;
}

type SwitchKind = "attach" | "slide" | "detach" | "fling";

interface Tokens {
  fill: string;
  ring: string;
  halo: string;
  idle: number;
  solo: number;
  plate: number;
  hover: number;
  press: number;
}

interface LayerCache {
  transform: string;
  width: string;
  height: string;
  radius: string;
  opacity: string;
  border: string;
  background: string;
}

interface Overlay {
  root: HTMLDivElement;
  fill: HTMLDivElement;
  ring: HTMLDivElement;
  fillCache: LayerCache;
  ringCache: LayerCache;
  visible: boolean;
  tokens: string;
}

interface ContentEntry {
  el: HTMLElement | SVGElement;
  strength: number;
  owner: Element | null;
  original: string;
  x: Spring;
  y: Spring;
  written: string;
}

const NATIVE_RES: Resolution = { kind: "native" };
const AUTHOR_RES: Resolution = { kind: "author" };
const IDLE_RES: Resolution = { kind: "idle" };

const DEFAULT_AUTO_HIDE = 2000;

const DEFAULT_CONFIG: ScopeConfig = {
  size: 20,
  ring: false,
  ringSize: 8,
  ringWidth: 1.5,
  parallax: 1,
  largeHeight: 96,
  largeArea: 32000,
  selector: DEFAULT_ADAPTIVE_POINTER_SELECTOR,
  hideOnKeyboard: true,
  autoHide: DEFAULT_AUTO_HIDE,
  contentParallax: true,
  textBeam: true,
  timeScale: 1,
};

const DEFAULT_TOKENS: Tokens = {
  fill: "rgb(10, 10, 10)",
  ring: "rgb(67, 67, 67)",
  halo: "rgba(255, 255, 255, 0.72)",
  idle: 0.16,
  solo: 0.28,
  plate: 0.075,
  hover: 0.09,
  press: 0.04,
};

function resolveConfig(options: AdaptivePointerOptions): ScopeConfig {
  const size = evenClamp(options.size ?? DEFAULT_CONFIG.size, 12, 40);
  return {
    size,
    ring: options.ring ?? DEFAULT_CONFIG.ring,
    ringSize: evenClamp(
      options.ringSize ?? DEFAULT_CONFIG.ringSize,
      4,
      size - 4,
    ),
    ringWidth: clamp(options.ringWidth ?? DEFAULT_CONFIG.ringWidth, 1, 3),
    parallax: clamp(options.parallax ?? 1, 0, 2),
    largeHeight: options.largeTarget?.height ?? DEFAULT_CONFIG.largeHeight,
    largeArea: options.largeTarget?.area ?? DEFAULT_CONFIG.largeArea,
    selector: sanitizeSelector(
      options.selector ?? DEFAULT_ADAPTIVE_POINTER_SELECTOR,
    ),
    hideOnKeyboard: options.hideOnKeyboard ?? true,
    autoHide:
      options.autoHide === false
        ? false
        : Math.max(500, options.autoHide ?? DEFAULT_AUTO_HIDE),
    contentParallax: options.contentParallax ?? DEFAULT_CONFIG.contentParallax,
    textBeam: options.textBeam ?? DEFAULT_CONFIG.textBeam,
    timeScale: clamp(options.timeScale ?? 1, 0.1, 2),
  };
}

const isColor = (value: string) =>
  !!value &&
  (typeof CSS === "undefined" ||
    typeof CSS.supports !== "function" ||
    CSS.supports("color", value));

/**
 * 读取颜色令牌：计算值已经替换过 var()，原样复制，不在 JS 里解析颜色。
 * 无效值（例如 Tailwind 3 主题里只写通道的 `--foreground: 222.2 84% 4.9%`）会让图层变透明，
 * 所以先用 CSS.supports 校验，失败时尝试包一层 hsl()，再退回 fallback。
 */
function colorToken(
  style: CSSStyleDeclaration,
  name: string,
  fallback: string,
) {
  const value = style.getPropertyValue(name).trim();
  if (isColor(value)) return value;
  if (value && isColor(`hsl(${value})`)) return `hsl(${value})`;
  if (value) warnDev(`令牌 ${name} 不是合法的颜色（${value}），已使用默认值。`);
  return fallback;
}

function readTokens(host: Element): Tokens {
  const style = getComputedStyle(host);
  const alpha = (name: string, fallback: number) => {
    const value = parseFloat(style.getPropertyValue(name));
    return Number.isFinite(value) ? clamp(value, 0, 1) : fallback;
  };
  const fill = colorToken(
    style,
    "--adaptive-pointer-fill",
    DEFAULT_TOKENS.fill,
  );
  return {
    fill,
    // 外环与晕边由前景 / 背景混合而来，前景无效时整条 color-mix 都无效，退回基于填充色的混合。
    ring: colorToken(
      style,
      "--adaptive-pointer-ring",
      `color-mix(in oklab, ${fill} 72%, transparent)`,
    ),
    halo: colorToken(style, "--adaptive-pointer-halo", DEFAULT_TOKENS.halo),
    idle: alpha("--adaptive-pointer-alpha-idle", DEFAULT_TOKENS.idle),
    solo: alpha("--adaptive-pointer-alpha-solo", DEFAULT_TOKENS.solo),
    plate: alpha("--adaptive-pointer-alpha-plate", DEFAULT_TOKENS.plate),
    hover: alpha("--adaptive-pointer-alpha-hover", DEFAULT_TOKENS.hover),
    press: alpha("--adaptive-pointer-alpha-press", DEFAULT_TOKENS.press),
  };
}

const emptyCache = (): LayerCache => ({
  transform: "",
  width: "",
  height: "",
  radius: "",
  opacity: "",
  border: "",
  background: "",
});

function createOverlay(parent: Element): Overlay {
  const root = document.createElement("div");
  root.setAttribute(ATTR_OVERLAY, "");
  root.setAttribute("aria-hidden", "true");
  // 结构性样式全部内联：样式表缺失时也不会影响页面布局。
  root.style.cssText =
    "position:fixed;inset:0;z-index:2147483647;pointer-events:none;contain:strict;visibility:hidden;";
  if (
    typeof CSS !== "undefined" &&
    CSS.supports?.("view-transition-name", "a")
  ) {
    // 主题切换等 View Transition 期间，指针作为独立分组实时显示，不会冻在根快照里。
    root.style.setProperty("view-transition-name", VIEW_TRANSITION_NAME);
  }
  // 两个图层都是无类名、无子元素的 div：样式规则匹配不到它们，也不依赖 inherit（规避逐帧 restyle 成本）。
  const fill = document.createElement("div");
  fill.style.cssText =
    "position:absolute;left:0;top:0;box-sizing:border-box;background:var(--ap-fill);opacity:0;contain:strict;will-change:transform,opacity;";
  const ring = document.createElement("div");
  // 外环不加 paint 包含，避免外侧 1px 晕边被裁掉。
  ring.style.cssText =
    "position:absolute;left:0;top:0;box-sizing:border-box;border-style:solid;border-color:var(--ap-ring);border-width:2px;border-radius:9999px;box-shadow:0 0 0 1px var(--ap-halo);opacity:0;contain:layout style size;will-change:transform,opacity;";
  root.append(fill, ring);
  parent.appendChild(root);
  return {
    root,
    fill,
    ring,
    fillCache: emptyCache(),
    ringCache: emptyCache(),
    visible: false,
    tokens: "",
  };
}

/** HMR、崩溃或另一份模块拷贝留下的残留 */
function cleanupStale() {
  document
    .querySelectorAll(`[${ATTR_OVERLAY}]`)
    .forEach((node) => node.remove());
  for (const attr of [
    ATTR_SCOPE,
    ATTR_STATE,
    ATTR_PRESSED,
    ATTR_FALLBACK,
    ATTR_NATIVE,
  ]) {
    document
      .querySelectorAll(`[${attr}]`)
      .forEach((node) => node.removeAttribute(attr));
  }
  document
    .querySelectorAll<HTMLElement | SVGElement>(`[${ATTR_CONTENT_WRITTEN}]`)
    .forEach((node) => {
      node.style.translate = "";
      node.removeAttribute(ATTR_CONTENT_WRITTEN);
    });
}

/* -------------------------------------------------------------------------- */
/*                                  文本竖条                                   */
/* -------------------------------------------------------------------------- */

type CaretDocument = Document & {
  caretPositionFromPoint?: (
    x: number,
    y: number,
  ) => { offsetNode: Node; offset: number } | null;
  caretRangeFromPoint?: (x: number, y: number) => Range | null;
};

/**
 * 字符命中：取插入点两侧字符的矩形，纵向扩展到行盒，只有指针真的落在字符上才算命中，
 * 这样行尾空白处（浏览器给出的「最近插入点」）不会显示竖条。
 */
function caretLine(
  region: Element,
  x: number,
  y: number,
  previous: TextLine | null,
): TextLine | null {
  const doc = document as CaretDocument;
  let node: Node | null = null;
  let offset = 0;
  if (doc.caretPositionFromPoint) {
    const position = doc.caretPositionFromPoint(x, y);
    if (position) {
      node = position.offsetNode;
      offset = position.offset;
    }
  } else if (doc.caretRangeFromPoint) {
    const range = doc.caretRangeFromPoint(x, y);
    if (range) {
      node = range.startContainer;
      offset = range.startOffset;
    }
  }
  if (!node || node.nodeType !== Node.TEXT_NODE || !region.contains(node)) {
    return null;
  }
  const parent = node.parentElement;
  if (!parent) return null;
  const style = liveStyle(parent);
  if ((style.userSelect || style.webkitUserSelect) === "none") return null;
  // 竖排文字不画竖条，退回圆形。
  if (style.writingMode.startsWith("vertical")) return null;
  const length = node.textContent?.length ?? 0;
  if (!length) return null;
  const range = document.createRange();
  let hit: DOMRect | null = null;
  let hitRange: [number, number] | null = null;
  for (const [from, to] of [
    [offset, offset + 1],
    [offset - 1, offset],
  ]) {
    if (from < 0 || to > length) continue;
    range.setStart(node, from);
    range.setEnd(node, to);
    for (const rect of Array.from(range.getClientRects())) {
      if (rect.width > 0 && x >= rect.left - 1 && x <= rect.right + 1) {
        hit = rect;
        hitRange = [from, to];
        break;
      }
    }
    if (hit) break;
  }
  if (!hit || !hitRange) return null;
  const fontSize = parseFloat(style.fontSize) || 16;
  const lineHeight =
    style.lineHeight === "normal"
      ? 1.2 * fontSize
      : parseFloat(style.lineHeight) || 1.2 * fontSize;
  const line = lineFromRect(
    hit,
    lineHeight,
    node as Text,
    hitRange[0],
    hitRange[1],
  );
  if (y < line.top || y > line.bottom) return null;
  // 越过行边界 0.15 × 行高后才切换到新行，避免在两行交界处来回跳。
  // 上一行的几何按它的字符重新测量：滚动或重排后，存下来的视口坐标已经过期。
  if (previous && previous.node.isConnected) {
    const again = document.createRange();
    again.setStart(
      previous.node,
      Math.min(previous.from, previous.node.length),
    );
    again.setEnd(previous.node, Math.min(previous.to, previous.node.length));
    const rect = again.getBoundingClientRect();
    if (rect.height > 0) {
      const current = lineFromRect(
        rect,
        previous.lh,
        previous.node,
        previous.from,
        previous.to,
      );
      if (Math.abs(current.cy - line.cy) > 1) {
        const slack = 0.15 * current.lh;
        if (y >= current.top - slack && y <= current.bottom + slack) {
          return current;
        }
      }
    }
  }
  return line;
}

function lineFromRect(
  rect: DOMRectReadOnly,
  lineHeight: number,
  node: Text,
  from: number,
  to: number,
): TextLine {
  const expand = Math.max(0, (lineHeight - rect.height) / 2);
  return {
    cy: (rect.top + rect.bottom) / 2,
    h: clamp(Math.round(rect.height), 10, 48),
    top: rect.top - expand,
    bottom: rect.bottom + expand,
    lh: lineHeight,
    node,
    from,
    to,
  };
}

/* -------------------------------------------------------------------------- */
/*                                  全局状态                                   */
/* -------------------------------------------------------------------------- */

const SERVER_STATUS: AdaptivePointerStatus = {
  supported: null,
  active: false,
  state: "inactive",
  pressed: false,
};

let status: AdaptivePointerStatus = SERVER_STATUS;
const statusListeners = new Set<() => void>();
let supportQuery: MediaQueryList | null = null;
let statusNotifyQueued = false;

function patchStatus(patch: Partial<AdaptivePointerStatus>) {
  const next = { ...status, ...patch };
  if (
    next.supported === status.supported &&
    next.active === status.active &&
    next.state === status.state &&
    next.pressed === status.pressed
  ) {
    return;
  }
  status = next;
  if (statusNotifyQueued) return;
  statusNotifyQueued = true;
  queueMicrotask(() => {
    statusNotifyQueued = false;
    statusListeners.forEach((listener) => listener());
  });
}

function ensureSupportWatcher() {
  if (supportQuery || typeof window === "undefined") return;
  const query = window.matchMedia(MEDIA_QUERY);
  supportQuery = query;
  const sync = () => patchStatus({ supported: query.matches });
  query.addEventListener("change", sync);
  sync();
}

function subscribeStatus(listener: () => void) {
  statusListeners.add(listener);
  ensureSupportWatcher();
  return () => {
    statusListeners.delete(listener);
  };
}

/* -------------------------------------------------------------------------- */
/*                                    引擎                                     */
/* -------------------------------------------------------------------------- */

const GLOBAL_KEY = Symbol.for("qiuye.adaptive-pointer");
type GlobalSlot = { [GLOBAL_KEY]?: { dispose: () => void } };

let engine: PointerEngine | null = null;
let failedThisSession = false;
let jankTripsThisSession = 0;

function acquireEngine() {
  if (failedThisSession || typeof window === "undefined") return null;
  if (!engine) {
    const slot = window as unknown as GlobalSlot;
    if (slot[GLOBAL_KEY]) {
      warnDev("检测到另一份 AdaptivePointer 模块拷贝，已接管为单一实例。");
      slot[GLOBAL_KEY]?.dispose();
    }
    engine = new PointerEngine();
    slot[GLOBAL_KEY] = engine;
  }
  return engine;
}

/**
 * 单例引擎：整页只有一套覆盖层 DOM 与一个帧循环。
 * 事件处理函数只记录数据；read 阶段做命中、作用域与测量，update 阶段跑状态机与弹簧，
 * render 阶段只写变化了的样式与属性；所有通道静止后休眠。
 */
class PointerEngine {
  private disposed = false;
  private offs: Array<() => void> = [];
  private scopes = new Map<string, ScopeRecord>();
  private areaByElement = new WeakMap<Element, ScopeRecord>();
  private borrowed = new Map<Element, ScopeRecord>();
  /** 关闭的 Area 借出的浮层宿主：写上 data-adaptive-pointer-area="off"，交还原生指针 */
  private nativeBorrowed = new Map<Element, ScopeRecord>();
  private borrowedFresh = false;
  private syncNeeded = false;
  private claimed: { id: string; time: number } | null = null;
  private mountOrder = 0;
  private destroyQueued = false;

  private active = false;
  private mediaOk = false;
  private cooldownUntil = 0;
  private zoomed = false;
  private jankHits: number[] = [];
  private overlay: Overlay;
  private overlayRecreated = false;
  private overlayOnHtml = false;
  private moveOverlayToHtml = false;
  private handshake = false;
  private activating = false;
  private scopesWritten = new Set<Element>();
  private reappends: number[] = [];

  private contrastQuery: MediaQueryList;
  private bodyObserver: MutationObserver | null = null;
  private htmlObserver: MutationObserver | null = null;
  private childObserver: MutationObserver | null = null;

  // 输入
  private px = 0;
  private py = 0;
  private inputTime = 0;
  private hasInput = false;
  private fresh = false;
  private moved = false;
  private path0: Element | null = null;
  private buttons = 0;
  private vx = 0;
  private vy = 0;
  private vTime = -Infinity;
  private vX = 0;
  private vY = 0;
  private lastMoveAt = 0;
  private lastActivityAt = 0;
  private lastTouch = { time: -Infinity, x: 0, y: 0 };
  private eventSeq = 0;
  /** 坐标真的变化了的 pointermove 计数：隐藏后只有之后的移动才能让指针重新出现 */
  private moveSeq = 0;
  private hitDirty = true;
  private hit: Element | null = null;
  private scrollingUntil = 0;
  private scrollRef: { x: number; y: number } | null = null;
  private pressRequest = false;
  private releaseRequest = false;
  private dragging = false;
  private autoscroll = {
    held: false,
    x: 0,
    y: 0,
    dragged: false,
    releasedAt: 0,
    scrolled: false,
    done: false,
  };
  private disabledDispatch = false;
  private fallbackTimer = 0;
  /** 不派发事件的原生禁用控件：只临时标成原生区，指针离开或控件恢复可用时即撤销 */
  private fallbackEl: Element | null = null;
  /** 内联光标或任意值光标类的宿主：补写属性后，它的子孙交还原生指针 */
  private stamped = new Set<Element>();
  private stampQueue: Element[] = [];

  // 帧
  private running = false;
  private lastTs: number | null = null;
  private now = 0;
  private dtMs = 1000 / 60;
  private dpr = 1;
  private frameMoved = false;
  private previousFrameMoved = false;
  private pollTimer = 0;
  private autoHideTimer = 0;

  // 解析结果
  private scope: ScopeRecord | null = null;
  private emittedScope: ScopeRecord | null = null;
  private config: ScopeConfig = DEFAULT_CONFIG;
  private res: Resolution = IDLE_RES;
  private candidate: TargetInfo | null = null;
  private lineCandidate: TextLine | null = null;
  private tokens: Tokens = DEFAULT_TOKENS;
  private tokenHost: Element | null = null;
  private tokensDirty = true;
  private contrast = false;

  // 状态机
  private mode: Mode = "idle";
  private hidden: {
    reason: HiddenReason;
    x: number;
    y: number;
    moveSeq: number;
  } | null = null;
  private eng: TargetInfo | null = null;
  private pend: { el: Element; since: number } | null = null;
  private bridge: { kind: "timed" | "group"; since: number } | null = null;
  private pressed: {
    el: Element | null;
    w: number;
    h: number;
    at: number;
    releaseAt: number;
  } | null = null;
  private line: TextLine | null = null;
  private teleport = false;
  private pop = false;
  private alphaShow = false;
  private anchor: Anchor = {
    cx: 0,
    cy: 0,
    w: 20,
    h: 20,
    r: 10,
    fx: true,
    fy: true,
  };
  private anchorKey = "";
  private ringAnchorY = 0;
  private ringAnchorKey = "";
  /** 上一帧渲染时被裁剪矩形改动的量：锚点切换时并入残差，避免裁剪突然失效造成跳变 */
  private clipDelta = { x: 0, y: 0, w: 0, h: 0 };
  /** 上一帧按压时冻结的板子尺寸（按下时画的是它，不是逐帧测量的尺寸） */
  private pressedBase: { w: number; h: number } | null = null;
  private elementIds = new WeakMap<Element, number>();
  private nextElementId = 1;
  private stateEl: Element | null = null;
  private stateValue = "";
  private writtenStateEl: Element | null = null;
  private writtenStateValue = "";
  private writtenPressedEl: Element | null = null;
  private lastHitCursor = "";

  // 弹簧
  private ex = geometrySpring();
  private ey = geometrySpring();
  private ew = geometrySpring();
  private eh = geometrySpring();
  private er = geometrySpring();
  private ox = geometrySpring();
  private oy = geometrySpring();
  private press = unitSpring();
  private alpha = unitSpring();
  private rw = geometrySpring(20);
  private rh = geometrySpring(20);
  private ry = geometrySpring();
  private popScale = unitSpring(1);
  private visibility = 0;
  private visibilityTarget = 1;
  private contents = new Map<Element, ContentEntry>();

  // 输出
  private out = {
    fx: 0,
    fy: 0,
    fw: 20,
    fh: 20,
    fr: 10,
    fa: 0,
    rx: 0,
    ry: 0,
    rw: 20,
    rh: 20,
    ra: 0,
    bw: 2,
    solid: false,
  };

  constructor() {
    cleanupStale();
    this.overlay = createOverlay(document.body);
    const query = window.matchMedia(MEDIA_QUERY);
    this.mediaOk = query.matches;
    this.contrastQuery = window.matchMedia("(prefers-contrast: more)");
    this.contrast = this.contrastQuery.matches;
    this.listen(query);
  }

  /* ------------------------------ 注册与配置 ------------------------------ */

  register(
    id: string,
    kind: "page" | "area",
    root: Element,
    callback: ScopeRecord["callback"],
    options: AdaptivePointerOptions,
  ) {
    if (this.disposed) return;
    this.destroyQueued = false;
    const record: ScopeRecord = {
      id,
      kind,
      root,
      order: ++this.mountOrder,
      disabled: !!options.disabled,
      config: resolveConfig(options),
      callback,
      last: null,
    };
    if (kind === "page") {
      const others = [...this.scopes.values()].filter(
        (scope) => scope.kind === "page",
      );
      if (others.length) {
        warnDev("同时挂载了多个 <AdaptivePointer />，以最后挂载的为准。");
      }
    }
    this.scopes.set(id, record);
    if (kind === "area") this.areaByElement.set(root, record);
    this.tokensDirty = true;
    this.syncScopeAttributes();
    this.wake();
  }

  configure(id: string, options: AdaptivePointerOptions) {
    const record = this.scopes.get(id);
    if (!record || this.disposed) return;
    const wasDisabled = record.disabled;
    record.disabled = !!options.disabled;
    record.config = resolveConfig(options);
    if (this.scope === record) {
      if (record.disabled) this.scope = null;
      else this.config = record.config;
    }
    this.tokensDirty = true;
    this.hitDirty = true;
    if (wasDisabled !== record.disabled) {
      this.releaseBorrowed(record);
      this.syncScopeAttributes();
      this.deactivateIfIdle();
    }
    this.wake();
  }

  unregister(id: string) {
    const record = this.scopes.get(id);
    if (!record || this.disposed) return;
    this.scopes.delete(id);
    if (record.kind === "area") this.areaByElement.delete(record.root);
    this.releaseBorrowed(record);
    if (this.scope === record) this.scope = null;
    if (this.emittedScope === record) this.emittedScope = null;
    this.syncScopeAttributes();
    this.deactivateIfIdle();
    this.hitDirty = true;
    this.wake();
    if (this.scopes.size === 0 && !this.destroyQueued) {
      // 延迟到微任务里销毁，抵消 StrictMode 的双重挂载。
      this.destroyQueued = true;
      queueMicrotask(() => {
        if (this.destroyQueued && this.scopes.size === 0) this.dispose();
      });
    }
  }

  /** React 捕获阶段由外向内执行，后写者胜，所以最内层 Area 生效（也覆盖 Portal 出去的浮层） */
  claim(id: string, time: number) {
    this.claimed = { id, time };
  }

  refresh() {
    this.hitDirty = true;
    this.wake();
  }

  /* --------------------------------- 生命周期 -------------------------------- */

  private enabledScopes() {
    return [...this.scopes.values()].filter((scope) => !scope.disabled);
  }

  private pageScope() {
    let best: ScopeRecord | null = null;
    for (const scope of this.scopes.values()) {
      if (scope.kind === "page" && (!best || scope.order > best.order)) {
        best = scope;
      }
    }
    return best && !best.disabled ? best : null;
  }

  private canActivate() {
    return (
      this.mediaOk &&
      !failedThisSession &&
      jankTripsThisSession < JANK_TRIPS &&
      this.now >= this.cooldownUntil &&
      !this.zoomed &&
      document.visibilityState === "visible"
    );
  }

  /** 没有任何启用的作用域时回到 dormant：交还原生指针，下一次激活重新握手 */
  private deactivateIfIdle() {
    if (!this.active) return;
    for (const scope of this.scopes.values()) {
      if (!scope.disabled) return;
    }
    this.deactivate();
  }

  /**
   * 激活后属性常驻：离开作用域、失焦、键盘操作都不摘，避免整棵子树反复重算样式。
   * 整页只认最后挂载的那个实例（与 pageScope 同一条规则），更早的实例不写 <html>。
   * 只在作用域或借出表变化时调用，不逐帧调用。
   */
  private syncScopeAttributes() {
    if (!this.active) return;
    const page = this.pageScope();
    const wanted = new Set<Element>();
    if (page) wanted.add(page.root);
    for (const scope of this.scopes.values()) {
      if (scope.kind === "area" && !scope.disabled) wanted.add(scope.root);
    }
    if (!page) {
      for (const [host, scope] of this.borrowed) {
        if (!scope.disabled && host.isConnected) wanted.add(host);
      }
    }
    for (const element of this.scopesWritten) {
      if (!wanted.has(element)) {
        element.removeAttribute(ATTR_SCOPE);
        this.scopesWritten.delete(element);
      }
    }
    for (const element of wanted) {
      if (!this.scopesWritten.has(element)) {
        element.setAttribute(ATTR_SCOPE, "on");
        this.scopesWritten.add(element);
      }
    }
    for (const [host] of this.nativeBorrowed) {
      if (!host.isConnected) this.nativeBorrowed.delete(host);
      else if (host.getAttribute(ATTR_AREA) !== "off") {
        host.setAttribute(ATTR_AREA, "off");
      }
    }
  }

  private releaseBorrowed(record: ScopeRecord) {
    for (const [host, scope] of this.borrowed) {
      if (scope === record) {
        this.borrowed.delete(host);
        if (this.scopesWritten.has(host)) {
          host.removeAttribute(ATTR_SCOPE);
          this.scopesWritten.delete(host);
        }
      }
    }
    for (const [host, scope] of this.nativeBorrowed) {
      if (scope === record) {
        this.nativeBorrowed.delete(host);
        host.removeAttribute(ATTR_AREA);
      }
    }
  }

  private clearFallback() {
    this.fallbackEl?.removeAttribute(ATTR_FALLBACK);
    this.fallbackEl = null;
  }

  private clearStamps() {
    for (const element of this.stamped) element.removeAttribute(ATTR_NATIVE);
    this.stamped.clear();
    this.stampQueue = [];
  }

  /** 交还原生指针：同一任务内摘属性、隐藏叠加层、清掉目标上的属性 */
  private deactivate() {
    if (!this.active) return;
    this.active = false;
    this.activating = false;
    this.handshake = false;
    for (const element of this.scopesWritten)
      element.removeAttribute(ATTR_SCOPE);
    this.scopesWritten.clear();
    for (const [host] of this.nativeBorrowed) host.removeAttribute(ATTR_AREA);
    this.nativeBorrowed.clear();
    this.borrowed.clear();
    this.clearFallback();
    this.clearStamps();
    this.releaseEngaged(true);
    this.mode = "idle";
    this.hidden = null;
    this.pend = null;
    this.bridge = null;
    this.pressed = null;
    this.pressRequest = false;
    this.releaseRequest = false;
    this.line = null;
    this.stateEl = null;
    this.flushTargetAttributes();
    this.restoreAllContents();
    this.setOverlayVisible(false);
    this.overlay.fill.style.opacity = "0";
    this.overlay.ring.style.opacity = "0";
    this.overlay.fillCache.opacity = "0";
    this.overlay.ringCache.opacity = "0";
    this.emitState();
  }

  /** 运行时异常：摘掉全部属性、移除叠加层与监听，本会话不再激活 */
  private fail(error: unknown) {
    failedThisSession = true;
    if (isDevelopment()) {
      console.error("[AdaptivePointer] 运行时异常，已交还原生指针：", error);
    }
    try {
      this.dispose();
    } catch {
      // 尽力清理即可
    }
  }

  private guard(run: () => void) {
    if (this.disposed) return;
    try {
      run();
    } catch (error) {
      this.fail(error);
    }
  }

  dispose() {
    if (this.disposed) return;
    this.deactivate();
    this.disposed = true;
    this.offs.forEach((off) => off());
    this.offs = [];
    this.bodyObserver?.disconnect();
    this.htmlObserver?.disconnect();
    this.childObserver?.disconnect();
    cancelFrame(this.read);
    cancelFrame(this.update);
    cancelFrame(this.render);
    window.clearTimeout(this.pollTimer);
    window.clearTimeout(this.autoHideTimer);
    window.clearTimeout(this.fallbackTimer);
    this.clearFallback();
    this.clearStamps();
    this.overlay.root.remove();
    const slot = window as unknown as GlobalSlot;
    if (slot[GLOBAL_KEY] === this) delete slot[GLOBAL_KEY];
    if (engine === this) engine = null;
  }

  /* ---------------------------------- 事件 ---------------------------------- */

  private listen(query: MediaQueryList) {
    const add = (
      target: EventTarget,
      type: string,
      handler: (event: Event) => void,
      options: AddEventListenerOptions,
    ) => {
      target.addEventListener(type, handler, options);
      this.offs.push(() => target.removeEventListener(type, handler, options));
    };
    const capture = { capture: true, passive: true };
    const passive = { passive: true };
    for (const type of [
      "pointermove",
      "pointerdown",
      "pointerup",
      "pointercancel",
    ]) {
      add(window, type, this.onPointer, capture);
    }
    add(window, "keydown", this.onKeyDown, capture);
    add(window, "wheel", this.onScroll, capture);
    add(window, "dragstart", this.onDragStart, capture);
    add(window, "dragend", this.onDragEnd, capture);
    add(window, "drop", this.onDragEnd, capture);
    add(window, "contextmenu", this.onContextMenu, capture);
    add(window, "blur", this.onBlur, passive);
    add(window, "resize", this.onDirty, passive);
    add(window, "pagehide", this.onPageHide, passive);
    add(document, "pointerout", this.onPointerOut, capture);
    add(document, "scroll", this.onScroll, capture);
    add(document, "visibilitychange", this.onVisibility, passive);
    add(document, "pointerlockchange", this.onPointerLock, passive);
    add(document, "fullscreenchange", this.onDirty, passive);
    add(document, "transitionrun", this.onTargetAnimation, capture);
    add(document, "animationstart", this.onTargetAnimation, capture);
    if (window.visualViewport) {
      add(window.visualViewport, "resize", this.onViewport, passive);
    }
    add(
      query,
      "change",
      () =>
        this.guard(() => {
          this.mediaOk = query.matches;
          if (!this.mediaOk) this.deactivate();
        }),
      passive,
    );
    add(
      this.contrastQuery,
      "change",
      () =>
        this.guard(() => {
          this.contrast = this.contrastQuery.matches;
          this.tokensDirty = true;
          this.wake();
        }),
      passive,
    );

    // html 的 class / style / data-theme 变化（主题切换）：重读令牌。
    this.htmlObserver = new MutationObserver(() => {
      this.tokensDirty = true;
      this.wake();
    });
    this.htmlObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    // body 的 style / class 变化（Radix 会改写 body 样式）：重新检查 fixed 的包含块。
    this.bodyObserver = new MutationObserver(() => {
      if (this.active) {
        this.handshake = true;
        this.wake();
      }
    });
    this.bodyObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    // body 新增的子节点若同为最大层级，就把叠加层重新追加到末尾（限速：2s 内最多 5 次）。
    this.childObserver = new MutationObserver((records) =>
      this.guard(() => this.checkStacking(records)),
    );
    this.childObserver.observe(document.body, { childList: true });
  }

  private checkStacking(records: MutationRecord[]) {
    const root = this.overlay.root;
    if (this.overlayOnHtml || !root.isConnected) return;
    let needed = false;
    for (const record of records) {
      record.addedNodes.forEach((node) => {
        if (
          needed ||
          !(node instanceof Element) ||
          node === root ||
          !(
            root.compareDocumentPosition(node) &
            Node.DOCUMENT_POSITION_FOLLOWING
          )
        ) {
          return;
        }
        const style = getComputedStyle(node);
        if (style.position !== "static" && style.zIndex === "2147483647") {
          needed = true;
        }
      });
    }
    if (!needed) return;
    const now = performance.now();
    this.reappends = this.reappends.filter((time) => now - time < 2000);
    if (this.reappends.length >= 5) {
      warnDev("叠加层被同为最大层级的节点反复遮挡，已停止重新追加。");
      return;
    }
    this.reappends.push(now);
    document.body.appendChild(root);
  }

  private onPointer = (event: Event) =>
    this.guard(() => {
      const e = event as PointerEvent;
      if (!e.isTrusted) return;
      if (e.pointerType === "touch" || e.pointerType === "pen") {
        this.lastTouch = { time: e.timeStamp, x: e.clientX, y: e.clientY };
        this.deactivate();
        return;
      }
      if (e.pointerType !== "mouse") return;
      // 触屏后浏览器补发的兼容鼠标事件
      const capabilities = (
        e as PointerEvent & {
          sourceCapabilities?: { firesTouchEvents?: boolean } | null;
        }
      ).sourceCapabilities;
      if (capabilities?.firesTouchEvents) return;
      if (
        e.timeStamp - this.lastTouch.time < 800 &&
        Math.abs(e.clientX - this.lastTouch.x) <= 2 &&
        Math.abs(e.clientY - this.lastTouch.y) <= 2
      ) {
        return;
      }

      this.eventSeq++;
      const moved =
        !this.hasInput || e.clientX !== this.px || e.clientY !== this.py;
      if (e.type === "pointermove") {
        this.sampleVelocity(e);
        if (moved) this.moveSeq++;
      }
      this.px = e.clientX;
      this.py = e.clientY;
      this.inputTime = e.timeStamp;
      this.hasInput = true;
      this.fresh = true;
      const target = e.composedPath()[0];
      this.path0 = target instanceof Element ? target : null;
      this.buttons = e.buttons;
      if (moved) {
        this.moved = true;
        this.lastMoveAt = e.timeStamp;
      }
      this.lastActivityAt = e.timeStamp;

      const auto = this.autoscroll;
      if (auto.held) {
        if (e.buttons & 4) {
          if (Math.hypot(e.clientX - auto.x, e.clientY - auto.y) > 10) {
            auto.dragged = true;
          }
        } else {
          // 中键在其他键按住时松开不会产生 pointerup，只表现为 buttons 变化。
          auto.held = false;
          auto.releasedAt = e.timeStamp;
        }
      } else if (
        this.hidden?.reason === "autoscroll" &&
        auto.releasedAt &&
        e.type === "pointerup"
      ) {
        // 退出自动滚动的那次点击：pointerdown 可能被浏览器吞掉，pointerup 仍会送达。
        auto.done = true;
      }
      // 原生拖放期间浏览器不派发指针事件；dragend 可能因为拖动源被移除而送不到 window，
      // 所以拖放结束后第一次没有按键的移动就视为拖放已经结束。
      if (this.dragging && e.type === "pointermove" && !(e.buttons & 1)) {
        this.dragging = false;
      }
      // 观察到禁用元素上的 pointermove，说明当前浏览器会向禁用控件派发事件，关闭兜底。
      if (
        e.type === "pointermove" &&
        !this.disabledDispatch &&
        this.path0?.closest(":disabled")
      ) {
        this.disabledDispatch = true;
        this.clearFallback();
      }
      // 兜底标记只是临时的：一旦又收到事件且不在被标记的控件里（或它已恢复可用），就撤销。
      const fallback = this.fallbackEl;
      if (
        fallback &&
        (!this.path0 ||
          !fallback.contains(this.path0) ||
          !fallback.matches(":disabled"))
      ) {
        this.clearFallback();
      }
      // 主键已经不在按下状态（和弦按键、松开被 JS 对话框吞掉等）：补一次松开。
      if (
        (this.pressed || this.pressRequest) &&
        !(e.buttons & 1) &&
        !(e.type === "pointerdown" && e.button === 0)
      ) {
        this.releaseRequest = true;
        this.hitDirty = true;
      }

      if (e.type === "pointerdown") this.onDown(e);
      else if (e.type === "pointerup" || e.type === "pointercancel") {
        this.onUp(e);
      }
      this.wake();
    });

  private sampleVelocity(e: PointerEvent) {
    const t = e.timeStamp;
    const dt = t - this.vTime;
    if (!(dt > 0)) return;
    if (dt > 100) {
      this.vx = 0;
      this.vy = 0;
      this.vTime = t;
      this.vX = e.clientX;
      this.vY = e.clientY;
      return;
    }
    const a = 1 - Math.exp(-dt / VELOCITY_TAU);
    this.vx += ((e.clientX - this.vX) / dt - this.vx) * a;
    this.vy += ((e.clientY - this.vY) / dt - this.vy) * a;
    this.vTime = t;
    this.vX = e.clientX;
    this.vY = e.clientY;
  }

  /** 指针速度（px/ms）；超过 50ms 没有新事件时归零 */
  private velocity() {
    if (this.now - this.vTime > VELOCITY_STALE) return { x: 0, y: 0 };
    return { x: this.vx, y: this.vy };
  }

  private speed() {
    const v = this.velocity();
    return Math.hypot(v.x, v.y);
  }

  private onDown(e: PointerEvent) {
    if (e.button === 1) {
      // 中键自动滚动由浏览器绘制系统指针。
      this.autoscroll = {
        held: true,
        x: e.clientX,
        y: e.clientY,
        dragged: false,
        releasedAt: 0,
        scrolled: false,
        done: false,
      };
      this.hide("autoscroll");
      return;
    }
    if (this.hidden?.reason === "autoscroll") this.autoscroll.done = true;
    if (e.button !== 0) return;
    this.pressRequest = true;
    this.releaseRequest = false;
    if (this.path0?.closest('input[type="color"], input[type="file"]')) {
      // 系统弹层画系统指针；下一次移动恢复。
      this.hide("picker");
    }
  }

  private onUp(e: PointerEvent) {
    if (e.type === "pointercancel" || e.button === 0) {
      this.releaseRequest = true;
      this.hitDirty = true;
    }
  }

  private onPointerOut = (event: Event) =>
    this.guard(() => {
      const e = event as PointerEvent;
      if (!e.isTrusted || e.pointerType !== "mouse") return;
      const related = e.relatedTarget;
      if (this.active) {
        if (related === null && viewTransitionActive()) {
          // WebKit 在 View Transition 期间不派发指针事件，只在第一次移动时补一个 relatedTarget 为 null 的
          // pointerout，转场结束后也不补发，指针最终停在哪里无从得知。交还原生指针，下一次移动重新激活。
          this.deactivate();
        } else if (related === null) {
          const edge =
            e.clientX <= 4 ||
            e.clientY <= 4 ||
            e.clientX >= window.innerWidth - 4 ||
            e.clientY >= window.innerHeight - 4;
          this.hide(edge ? "leave" : "frame");
        } else if (
          related instanceof Element &&
          related.closest("iframe, embed, object")
        ) {
          // 进入 iframe 后由 iframe 画指针。
          this.hide("frame");
        }
        // View Transition 期间命中全部落在 <html> 上（Chromium），叠加层按原生处理。转场结束时浏览器
        // 只补发边界事件、不补发 pointermove：静止的指针下方元素的计算 cursor 已经是 none，
        // 叠加层却还停在原生判定里，屏幕上一个指针都没有。离开 <html> 的 pointerout 说明命中换了元素，标脏重新判定。
        if (
          e.target === document.documentElement &&
          related instanceof Element
        ) {
          this.hitDirty = true;
          this.wake();
        }
      }
      // 原生 <button disabled> 在部分浏览器上不派发事件：进入后 120ms 内没有任何指针事件，
      // 就把它标成原生区，叠加层随之隐藏，避免用户在那里看不到任何指针。
      if (this.active && !this.disabledDispatch && related instanceof Element) {
        const disabled = related.closest(":disabled");
        if (disabled) {
          const seq = this.eventSeq;
          window.clearTimeout(this.fallbackTimer);
          this.fallbackTimer = window.setTimeout(
            () =>
              this.guard(() => {
                if (this.eventSeq !== seq || this.disabledDispatch) return;
                this.clearFallback();
                disabled.setAttribute(ATTR_FALLBACK, "");
                this.fallbackEl = disabled;
                this.hide("fallback");
              }),
            120,
          );
        }
      }
    });

  private onKeyDown = (event: Event) =>
    this.guard(() => {
      const e = event as KeyboardEvent;
      if (!e.isTrusted) return;
      if (this.hidden?.reason === "autoscroll") this.autoscroll.done = true;
      if (MODIFIER_KEYS.has(e.key) || e.ctrlKey || e.metaKey || e.altKey)
        return;
      if (this.active && this.config.hideOnKeyboard) this.hide("keyboard");
    });

  private onScroll = (event: Event) =>
    this.guard(() => {
      if (!this.hasInput) return;
      this.scrollingUntil = event.timeStamp + SCROLL_QUIET;
      this.hitDirty = true;
      // 只有中键松开后 300ms 内的页面滚动才说明进入了自动滚动；手动滚轮不算。
      const auto = this.autoscroll;
      if (
        event.type === "scroll" &&
        !auto.held &&
        auto.releasedAt &&
        event.timeStamp - auto.releasedAt <= 300
      ) {
        auto.scrolled = true;
      }
      // 未激活或已隐藏时，这些帧的命中结果反正会在恢复显示时重算，不必唤醒。
      if (this.active && !this.hidden) this.wake();
    });

  private onDragStart = (event: Event) => {
    window.setTimeout(
      () =>
        this.guard(() => {
          if (event.defaultPrevented) return;
          this.dragging = true;
          this.hide("drag");
        }),
      0,
    );
  };

  private onDragEnd = () => {
    this.dragging = false;
  };

  private onContextMenu = (event: Event) => {
    // 自定义菜单（已阻止默认行为）保持显示。
    window.setTimeout(
      () =>
        this.guard(() => {
          if (!event.defaultPrevented) this.hide("menu");
        }),
      0,
    );
  };

  private onBlur = () => this.guard(() => this.hide("blur"));

  private onPageHide = () => this.guard(() => this.hide("page"));

  private onVisibility = () =>
    this.guard(() => {
      if (document.visibilityState === "hidden") this.hide("page");
    });

  private onPointerLock = () =>
    this.guard(() => {
      if (document.pointerLockElement) this.hide("lock");
    });

  private onViewport = () =>
    this.guard(() => {
      const viewport = window.visualViewport;
      this.zoomed = !!viewport && Math.abs(viewport.scale - 1) > 0.01;
      // 双指捏合缩放期间交还原生指针，缩放回 1 后可再激活。
      if (this.zoomed) this.deactivate();
      this.hitDirty = true;
      this.wake();
    });

  private onDirty = () =>
    this.guard(() => {
      this.hitDirty = true;
      this.wake();
    });

  private onTargetAnimation = (event: Event) => {
    const target = event.target;
    if (this.eng && target instanceof Element && target.contains(this.eng.el)) {
      this.wake();
    }
  };

  private hide(reason: HiddenReason) {
    if (!this.active) return;
    if (this.hidden?.reason === reason) return;
    this.hidden = { reason, x: this.px, y: this.py, moveSeq: this.moveSeq };
    this.wake();
  }

  /** 只有隐藏之后发生的移动才能让指针重新出现：隐藏前排队的 move、同一次点击的 pointerup 都不算 */
  private canUnhide() {
    const hidden = this.hidden;
    if (!hidden) return true;
    if (this.moveSeq <= hidden.moveSeq) return false;
    switch (hidden.reason) {
      case "keyboard":
      case "idle":
        // 忽略浏览器在滚动或布局后补发的、坐标几乎不变的 move。
        return Math.hypot(this.px - hidden.x, this.py - hidden.y) >= 2;
      case "drag":
        return !this.dragging;
      case "lock":
        return !document.pointerLockElement;
      case "page":
        return document.visibilityState === "visible";
      case "autoscroll": {
        const auto = this.autoscroll;
        if (auto.done) return true;
        if (auto.held) return false;
        return (
          auto.dragged || (this.now - auto.releasedAt > 300 && !auto.scrolled)
        );
      }
      default:
        return true;
    }
  }

  /* --------------------------------- 帧循环 --------------------------------- */

  private wake() {
    if (this.disposed) return;
    window.clearTimeout(this.pollTimer);
    window.clearTimeout(this.autoHideTimer);
    this.pollTimer = 0;
    if (this.running) return;
    this.running = true;
    this.lastTs = null;
    frame.read(this.read, true);
    frame.update(this.update, true);
    frame.render(this.render, true);
  }

  private sleep() {
    cancelFrame(this.read);
    cancelFrame(this.update);
    cancelFrame(this.render);
    this.running = false;
    this.schedulePoll();
    this.scheduleAutoHide();
  }

  /** 休眠期间轮询：JS 驱动的目标移动（Motion 帧写入、拖动惯性）不会触发 transitionrun */
  private schedulePoll() {
    window.clearTimeout(this.pollTimer);
    if (!this.active || this.visibility <= 0 || this.mode === "native") return;
    if (document.visibilityState !== "visible") return;
    if (performance.now() - this.lastActivityAt > POLL_LIMIT) return;
    this.pollTimer = window.setTimeout(
      () =>
        this.guard(() => {
          this.pollTimer = 0;
          let changed = false;
          const eng = this.eng;
          if (eng) {
            changed =
              !eng.el.isConnected ||
              !sameRect(eng.raw, toRect(eng.el.getBoundingClientRect()));
          }
          // 待吸附的候选目标（尺寸为 0、被裁成一条缝等）之后变得可用时，也要唤醒并吸附。
          const candidate = this.candidate;
          if (!changed && this.pend && candidate) {
            changed =
              !candidate.el.isConnected ||
              !sameRect(
                candidate.raw,
                toRect(candidate.el.getBoundingClientRect()),
              );
          }
          if (!changed && this.hit?.isConnected) {
            changed = liveStyle(this.hit).cursor !== this.lastHitCursor;
          }
          if (changed) {
            this.hitDirty = true;
            this.wake();
          } else {
            this.schedulePoll();
          }
        }),
      POLL_INTERVAL,
    );
  }

  private scheduleAutoHide() {
    window.clearTimeout(this.autoHideTimer);
    const autoHide = this.config.autoHide;
    if (!this.active || autoHide === false || this.hidden) return;
    const remaining = this.lastMoveAt + autoHide - performance.now();
    this.autoHideTimer = window.setTimeout(
      () =>
        this.guard(() => {
          if (performance.now() - this.lastMoveAt >= autoHide - 1) {
            this.hide("idle");
          } else {
            this.scheduleAutoHide();
          }
        }),
      Math.max(0, remaining),
    );
  }

  private read = (data: { timestamp: number }) =>
    this.guard(() => {
      const raw =
        this.lastTs === null ? 1000 / 60 : data.timestamp - this.lastTs;
      const counted = this.lastTs !== null;
      this.lastTs = data.timestamp;
      this.now = data.timestamp;
      this.dtMs = Math.min(raw, 50);
      this.dpr = window.devicePixelRatio || 1;
      this.frameMoved = this.moved;
      if (counted) this.observeJank(raw);
      this.previousFrameMoved = this.frameMoved;
      this.readPhase();
    });

  private observeJank(raw: number) {
    // 只统计「连续两帧都有指针移动」的帧间隔：这才是软件指针被冻住、系统光标照常移动的时刻。
    const visible = this.active && !this.hidden && this.mode !== "native";
    if (!visible || !this.frameMoved || !this.previousFrameMoved) return;
    if (raw <= JANK_FRAME) return;
    this.jankHits = this.jankHits.filter(
      (time) => this.now - time < JANK_WINDOW,
    );
    this.jankHits.push(this.now);
    if (this.jankHits.length < JANK_COUNT) return;
    this.jankHits = [];
    jankTripsThisSession++;
    this.cooldownUntil = this.now + JANK_COOLDOWN;
    warnDev("主线程持续卡顿，暂时交还原生指针。");
    this.deactivate();
  }

  private readPhase() {
    if (!this.hasInput) return;
    // 未激活时只有新的鼠标事件才可能激活；隐藏期间的帧在恢复显示时会整体重算，都不必做命中。
    if (!this.active && (!this.fresh || !this.canActivate())) return;
    if (this.active && this.hidden && !this.fresh && !this.handshake) return;
    const x = this.px;
    const y = this.py;

    // 1. 命中元素：按下期间指针捕获会让事件目标变成捕获元素，滚动期间事件目标过期，都改用 elementFromPoint。
    const probe =
      this.buttons !== 0 ||
      this.hitDirty ||
      this.now < this.scrollingUntil ||
      !this.path0;
    let hit = this.hit;
    if (probe) hit = deepElementFromPoint(x, y);
    else if (this.fresh) hit = this.path0;
    if (hit && !hit.isConnected) hit = deepElementFromPoint(x, y);
    this.hitDirty = false;
    this.hit = hit;

    // 2. 作用域。React 捕获事件给出的 claim 只对应事件目标；按下拖动时 elementFromPoint 得到的
    //    命中可能在别处，不能据此借出宿主。
    this.borrowedFresh = false;
    const scope = hit ? this.resolveScope(hit, hit === this.path0) : null;

    // 3. 激活与握手
    let predict = false;
    if (!this.active) {
      if (!this.fresh || !scope || !hit || matchesNative(hit)) return;
      this.active = true;
      this.activating = true;
      this.teleport = true;
      this.pop = true;
      this.handshake = true;
      predict = true;
      patchStatus({ active: true });
    } else if (this.handshake) {
      if (!this.runHandshake()) return;
    }
    if (this.borrowedFresh) predict = true;

    // 内联光标或任意值光标类的宿主：CSS 不能在后代组合符左侧做子串匹配（会引发整棵子树重算），
    // 所以第一次命中时给宿主补写属性，让它的子孙交还原生指针；补写之前这一帧按预判处理。
    if (hit && scope) {
      const host = closestComposed(hit, STAMPED_CURSOR_HOST);
      if (host && !this.stamped.has(host)) {
        for (const element of this.stamped) {
          if (!element.isConnected) this.stamped.delete(element);
        }
        this.stamped.add(host);
        this.stampQueue.push(host);
        predict = true;
      }
    }

    this.scope = scope;
    if (scope) this.config = scope.config;

    // 4. 可见性：命中元素的计算 cursor 是唯一事实来源。
    //    激活首帧与新借出宿主的首帧，属性还没写上，按 JS 侧的 NATIVE 选择器预判。
    let res: Resolution;
    if (!scope || !hit) res = NATIVE_RES;
    else if (predict) {
      res = matchesNative(hit) ? NATIVE_RES : this.resolveTarget(hit, scope);
    } else {
      const cursor = liveStyle(hit).cursor;
      this.lastHitCursor = cursor;
      if (cursor !== "none") res = NATIVE_RES;
      else if (closestComposed(hit, AUTHOR_HIDDEN)) res = AUTHOR_RES;
      else if (this.overScrollbar(hit, x, y)) res = NATIVE_RES;
      else res = this.resolveTarget(hit, scope);
    }

    // 5. 文本区域：字符命中才显示竖条
    this.lineCandidate = null;
    if (res.kind === "text") {
      const line = caretLine(res.region, x, y, this.line);
      if (line) this.lineCandidate = line;
      else res = IDLE_RES;
    }
    this.res = res;

    // 6. 令牌宿主
    const host =
      (hit && closestComposed(hit, `.dark, [${ATTR_AREA}]`)) ||
      document.documentElement;
    if (host !== this.tokenHost || this.tokensDirty) {
      this.tokenHost = host;
      this.tokensDirty = false;
      this.tokens = readTokens(host);
    }

    // 7. 测量：已吸附目标每帧测量；新的候选目标只在变化时构建一次，之后每帧测量。
    if (res.kind === "target" && res.el !== this.eng?.el && scope) {
      if (
        !this.candidate ||
        this.candidate.el !== res.el ||
        this.candidate.effect !== res.effect
      ) {
        this.candidate = this.buildInfo(res.el, res.effect, scope);
      }
      this.measure(this.candidate);
    } else {
      this.candidate = null;
    }
    if (this.eng) {
      if (res.kind === "target" && res.el === this.eng.el) {
        this.eng.effect = res.effect;
      }
      this.measure(this.eng);
    }
  }

  private runHandshake() {
    const overlay = this.overlay;
    if (!overlay.root.isConnected) {
      if (this.overlayRecreated) {
        this.softFail("叠加层被反复移除，已交还原生指针。");
        return false;
      }
      this.overlayRecreated = true;
      this.overlay = createOverlay(
        this.overlayOnHtml ? document.documentElement : document.body,
      );
      this.tokensDirty = true;
      return true;
    }
    const current =
      this.scope && this.scopes.has(this.scope.id) && !this.scope.disabled
        ? this.scope
        : null;
    const scope = current ?? this.pageScope() ?? this.enabledScopes()[0];
    const root = scope?.root;
    if (root && root.isConnected && !matchesNative(root)) {
      if (liveStyle(root).cursor !== "none") {
        this.softFail(
          "原生指针没有被隐藏（样式表缺失、选择器不受支持，或被 !important 覆盖），已交还原生指针。",
        );
        return false;
      }
    }
    const rect = overlay.root.getBoundingClientRect();
    const html = document.documentElement;
    const misplaced =
      Math.abs(rect.left) > 1 ||
      Math.abs(rect.top) > 1 ||
      Math.abs(rect.width - html.clientWidth) > 1 ||
      Math.abs(rect.height - html.clientHeight) > 1;
    if (misplaced) {
      // body 带了 transform / filter / contain 等，成了 fixed 的包含块：改挂到 html 末尾再查一次。
      if (!this.overlayOnHtml) {
        this.moveOverlayToHtml = true;
        return true;
      }
      this.softFail("叠加层的 fixed 定位被祖先的变换破坏，已交还原生指针。");
      return false;
    }
    this.handshake = false;
    return true;
  }

  private softFail(message: string) {
    warnDev(message);
    failedThisSession = true;
    this.deactivate();
  }

  private resolveScope(hit: Element, fromEvent: boolean): ScopeRecord | null {
    const claim = this.claimed;
    if (fromEvent && claim && this.fresh && claim.time === this.inputTime) {
      const record = this.scopes.get(claim.id);
      if (record) {
        const outside =
          record.kind === "area" && !containsComposed(record.root, hit);
        // 关闭的 Area 打开的浮层：在整页实例里也要交还原生指针，给浮层宿主写上 off。
        if (outside) this.borrow(hit, record, record.disabled);
        return record.disabled ? null : record;
      }
    }
    const areaElement = closestComposed(hit, `[${ATTR_AREA}]`);
    if (areaElement) {
      if (areaElement.getAttribute(ATTR_AREA) === "off") return null;
      const record = this.areaByElement.get(areaElement);
      if (record) return record.disabled ? null : record;
      // 未登记的 Area 节点（根节点刚换过、还没重新注册）：继续按借出表与整页作用域解析。
    }
    if (this.borrowed.size) {
      const top = topLevelOf(hit);
      const record = top ? this.borrowed.get(top) : undefined;
      if (record && !record.disabled && this.scopes.has(record.id)) {
        return record;
      }
    }
    return this.pageScope();
  }

  /**
   * 局部作用域 Portal 出去的浮层：给它在 body 下的顶层祖先写上属性，记入借出表。
   * `native` 为 true 时（关闭的 Area）写 off，交还原生指针。
   */
  private borrow(hit: Element, record: ScopeRecord, native: boolean) {
    for (const host of this.borrowed.keys()) {
      if (!host.isConnected) {
        this.borrowed.delete(host);
        this.scopesWritten.delete(host);
      }
    }
    const top = topLevelOf(hit);
    if (!top || top === this.overlay.root) return;
    // 包含任何作用域根的祖先（应用外壳、#root）不是浮层宿主，借出它会把整个应用并入这个作用域。
    for (const scope of this.scopes.values()) {
      if (top.contains(scope.root)) return;
    }
    if (native) {
      if (!this.nativeBorrowed.has(top)) {
        this.nativeBorrowed.set(top, record);
        this.syncNeeded = true;
      }
      return;
    }
    if (this.borrowed.get(top) === record) return;
    this.borrowed.set(top, record);
    this.syncNeeded = true;
    if (!this.pageScope() && !this.scopesWritten.has(top)) {
      this.borrowedFresh = true;
    }
  }

  private overScrollbar(hit: Element, x: number, y: number) {
    const html = document.documentElement;
    if (x >= html.clientWidth || y >= html.clientHeight) return true;
    const style = liveStyle(hit);
    const scrollY =
      (style.overflowY === "auto" || style.overflowY === "scroll") &&
      hit.scrollHeight > hit.clientHeight;
    const scrollX =
      (style.overflowX === "auto" || style.overflowX === "scroll") &&
      hit.scrollWidth > hit.clientWidth;
    if (!scrollX && !scrollY) return false;
    const rect = hit.getBoundingClientRect();
    return (
      (scrollY && x > rect.left + hit.clientLeft + hit.clientWidth) ||
      (scrollX && y > rect.top + hit.clientTop + hit.clientHeight)
    );
  }

  /** 自命中元素沿组合树向上找目标，最多 32 层，到作用域根为止 */
  private resolveTarget(hit: Element, scope: ScopeRecord): Resolution {
    const selector = scope.config.selector;
    const boundary =
      scope.kind === "area" && containsComposed(scope.root, hit)
        ? scope.root
        : null;
    let region: Element | null = null;
    let blocked = false;
    let node: Element | null = hit;
    for (let depth = 0; node && depth < 32; depth++) {
      const explicit = node.getAttribute("data-pointer");
      if (explicit !== null) {
        if (explicit === "none") {
          blocked = true;
          break;
        }
        if (explicit === "native") return NATIVE_RES;
        if (explicit === "text") {
          region = node;
          break;
        }
        return this.asTarget(node, explicit, scope);
      }
      if (selector && node.matches(selector)) {
        return this.asTarget(node, "auto", scope);
      }
      if (node === boundary || node === document.body) break;
      node = composedParent(node);
    }
    if (region) return { kind: "text", region };
    // 默认整片作用域都是文本区域：字符命中才显示竖条，空白、图片、行尾空白处仍是圆。
    if (scope.config.textBeam && !blocked) {
      return { kind: "text", region: boundary ?? document.body };
    }
    return IDLE_RES;
  }

  private asTarget(
    element: Element,
    explicit: string,
    scope: ScopeRecord,
  ): Resolution {
    // 禁用：保持大外环，并且不再向上查找。
    if (element.matches(DISABLED_SELECTOR)) return IDLE_RES;
    if (
      explicit === "highlight" ||
      explicit === "lift" ||
      explicit === "hover"
    ) {
      return { kind: "target", el: element, effect: explicit };
    }
    if (element instanceof HTMLInputElement && element.type === "range") {
      return { kind: "target", el: element, effect: "hover" };
    }
    const holder = element.closest("[data-pointer-default]");
    const fallback = holder?.getAttribute("data-pointer-default");
    if (fallback === "none") return IDLE_RES;
    if (
      fallback === "highlight" ||
      fallback === "lift" ||
      fallback === "hover"
    ) {
      return { kind: "target", el: element, effect: fallback };
    }
    const rect = element.getBoundingClientRect();
    const large =
      rect.height > scope.config.largeHeight ||
      rect.width * rect.height > scope.config.largeArea;
    return {
      kind: "target",
      el: element,
      effect: large ? "hover" : "highlight",
    };
  }

  /** 吸附候选：一次性读取计算样式、裁剪祖先、组容器与内容视差子元素 */
  private buildInfo(
    element: Element,
    effect: EngagedEffect,
    scope: ScopeRecord,
  ): TargetInfo {
    const style = getComputedStyle(element);
    const paddingAttr = element.getAttribute("data-pointer-padding");
    let padding: readonly [number, number] | null = null;
    if (paddingAttr) {
      const values = paddingAttr.trim().split(/\s+/).map(Number);
      if (values.every(Number.isFinite) && values.length) {
        padding = [values[0], values[1] ?? values[0]];
      }
    }
    const radiusAttr = element.getAttribute("data-pointer-radius");
    const radius =
      radiusAttr === "full"
        ? "full"
        : radiusAttr && Number.isFinite(Number(radiusAttr))
          ? Number(radiusAttr)
          : null;
    const parallaxAttr = element.getAttribute("data-pointer-parallax");
    const parallax =
      parallaxAttr !== null && Number.isFinite(Number(parallaxAttr))
        ? clamp(Number(parallaxAttr), 0, 3)
        : 1;

    const clips: Element[] = [];
    const boundary = scope.kind === "area" ? scope.root : null;
    for (
      let node = composedParent(element);
      node && clips.length < 6;
      node = composedParent(node)
    ) {
      if (node === document.body || node === document.documentElement) break;
      const nodeStyle = liveStyle(node);
      if (
        nodeStyle.overflowX !== "visible" ||
        nodeStyle.overflowY !== "visible" ||
        /paint|strict|content/.test(nodeStyle.contain)
      ) {
        clips.push(node);
      }
      if (node === boundary) break;
    }

    let group = closestComposed(composedParent(element), GROUP_SELECTOR);
    if (
      group === document.body ||
      group === document.documentElement ||
      // 最近的组容器显式写了 off：按角色自动成组也关闭。
      group?.getAttribute("data-pointer-group") === "off"
    ) {
      group = null;
    }
    // 组容器限定在作用域内（Area 自己 Portal 出去的菜单，目标和菜单都在根节点外，照常成组）。
    if (
      group &&
      scope.kind === "area" &&
      containsComposed(scope.root, element) &&
      !containsComposed(scope.root, group)
    ) {
      group = null;
    }

    const contents: ContentTarget[] = [];
    if (effect === "highlight") {
      const ownerSelector = scope.config.selector
        ? `[data-pointer], ${scope.config.selector}`
        : "[data-pointer]";
      element
        .querySelectorAll<HTMLElement | SVGElement>(`[${ATTR_CONTENT}]`)
        .forEach((node) => {
          if (contents.length >= 4) return;
          if (node.matches(ownerSelector)) return;
          if (node.parentElement?.closest(ownerSelector) !== element) return;
          const nodeStyle = getComputedStyle(node);
          if (
            (nodeStyle.translate && nodeStyle.translate !== "none") ||
            transitionsTranslate(nodeStyle)
          ) {
            warnDev(
              "data-pointer-content 元素自带 translate 或对 translate / transform 设置了过渡，已跳过内容视差。",
            );
            return;
          }
          const raw = node.getAttribute(ATTR_CONTENT);
          const strength =
            raw && Number.isFinite(Number(raw))
              ? clamp(Number(raw), 0, 1)
              : CONTENT_STRENGTH;
          contents.push({ el: node, strength });
        });
      const optOut = element.getAttribute(ATTR_CONTENT);
      if (
        !contents.length &&
        scope.config.contentParallax &&
        optOut !== "off" &&
        optOut !== "0"
      ) {
        contents.push(...autoContents(element));
      }
    }

    return {
      el: element,
      effect,
      inline: style.display === "inline",
      padding,
      radius,
      radiusRaw: style.borderTopLeftRadius,
      superellipse: style
        .getPropertyValue("corner-shape")
        .includes("superellipse"),
      scRadius: parsePx(style.getPropertyValue("--sc-r")),
      parallax,
      clips,
      group,
      contents,
      rect: null,
      prev: null,
      raw: null,
      clip: null,
      groupRect: null,
      segment: 0,
      healthy: false,
    };
  }

  /** 每帧测量：健康检查、视觉矩形（多行行内元素取指针所在的一段）、裁剪交集、组容器 */
  private measure(info: TargetInfo) {
    const element = info.el;
    const pointerAttr = element.getAttribute("data-pointer");
    if (
      !element.isConnected ||
      pointerAttr === "none" ||
      pointerAttr === "native" ||
      element.matches(DISABLED_SELECTOR)
    ) {
      info.healthy = false;
      return;
    }
    info.prev = info.rect;
    let rect = toRect(element.getBoundingClientRect());
    info.raw = rect;
    info.segment = 0;
    if (info.inline) {
      const rects = element.getClientRects();
      if (rects.length > 1) {
        let best = 0;
        let bestDistance = Infinity;
        for (let i = 0; i < rects.length; i++) {
          const r = rects[i];
          // 包着块级内容的行内链接会给出 0×0 的首尾片段，跳过它们。
          if (r.width === 0 || r.height === 0) continue;
          const distance =
            this.py < r.top - 2
              ? r.top - 2 - this.py
              : this.py > r.bottom + 2
                ? this.py - r.bottom - 2
                : 0;
          if (distance < bestDistance) {
            bestDistance = distance;
            best = i;
          }
        }
        rect = toRect(rects[best]);
        info.segment = best;
      }
    }
    if (rect.right - rect.left <= 0 && rect.bottom - rect.top <= 0) {
      info.healthy = false;
      return;
    }
    let clip: Rect | null = null;
    for (const node of info.clips) {
      if (!node.isConnected) continue;
      const r = node.getBoundingClientRect();
      const box: Rect = {
        left: r.left + node.clientLeft,
        top: r.top + node.clientTop,
        right: r.left + node.clientLeft + node.clientWidth,
        bottom: r.top + node.clientTop + node.clientHeight,
      };
      clip = clip ? intersect(clip, box) : box;
    }
    const visible = clip ? intersect(rect, clip) : rect;
    if (visible.right - visible.left < 4 || visible.bottom - visible.top < 4) {
      info.healthy = false;
      return;
    }
    info.rect = visible;
    info.clip = clip;
    info.groupRect =
      info.group && info.group.isConnected
        ? toRect(info.group.getBoundingClientRect())
        : null;
    info.healthy = true;
  }

  /* --------------------------------- 状态机 --------------------------------- */

  private update = () =>
    this.guard(() => {
      if (!this.active) {
        this.fresh = false;
        this.moved = false;
        // 未激活期间的点击（例如在输入框里）不能在激活后补成一次按压。
        this.pressRequest = false;
        this.releaseRequest = false;
        return;
      }
      const dt = (this.dtMs / 1000) * this.config.timeScale;
      this.advance();
      this.updateAnchor();
      this.setTargets();
      this.stepSprings(dt);
      this.computeOutput();
      this.emitState();
      this.fresh = false;
      this.moved = false;
    });

  private advance() {
    const now = this.now;
    const x = this.px;
    const y = this.py;

    const res = this.res;

    // 按下：只有热点真的在目标上才冻结它（在缝隙里按下不算）。热点下的目标还没吸附时
    // （高速掠过、与移入同一帧按下）先完成吸附或滑行，再冻结。快速点击时按压视觉至少保持 80ms。
    if (this.pressRequest) {
      this.pressRequest = false;
      let frozen: Element | null = null;
      if (!this.hidden && res.kind === "target") {
        const candidate = this.candidate;
        const onTarget = this.mode === "engaged" && this.eng?.el === res.el;
        if (
          !onTarget &&
          candidate &&
          candidate.el === res.el &&
          candidate.healthy
        ) {
          if (this.mode === "engaged" && this.eng) this.slideTo(candidate);
          else this.attach(candidate);
          this.pend = null;
          this.updateAnchor();
        }
        if (this.mode === "engaged" && this.eng?.el === res.el) {
          frozen = res.el;
        }
      }
      this.pressed = {
        el: frozen,
        w: this.anchor.w,
        h: this.anchor.h,
        at: now,
        releaseAt: 0,
      };
    }
    if (this.releaseRequest) {
      this.releaseRequest = false;
      if (this.pressed) {
        this.pressed.releaseAt = Math.max(
          now,
          this.pressed.at + PRESS_MIN_VISUAL,
        );
      }
    }
    if (this.pressed?.releaseAt && now >= this.pressed.releaseAt) {
      this.pressed = null;
      this.hitDirty = true;
    }

    // 隐藏：几何保持，只淡出；合格的移动后瞬移到位并弹出。
    if (this.hidden && this.canUnhide()) {
      this.hidden = null;
      this.teleport = true;
      this.pop = true;
      this.hitDirty = true;
    }
    // 静止自动隐藏：帧循环运行时（例如悬停在目标上、还没休眠）在帧内判断，休眠后由定时器负责。
    const autoHide = this.config.autoHide;
    if (
      !this.hidden &&
      !this.pressed &&
      autoHide !== false &&
      now - this.lastMoveAt >= autoHide
    ) {
      this.hide("idle");
    }
    if (this.hidden) {
      this.visibilityTarget = 0;
      return;
    }
    this.visibilityTarget = 1;

    if (res.kind === "native" || res.kind === "author") {
      if (this.mode !== "native") {
        // 两层同一帧隐藏，不渐隐；回来时从指针处直接出现。
        this.releaseEngaged(true);
        this.pend = null;
        this.bridge = null;
        this.line = null;
        this.mode = "native";
        this.teleport = true;
      }
      return;
    }
    if (this.mode === "native") {
      this.mode = "idle";
      this.alphaShow = true;
    }

    const scrolling = now < this.scrollingUntil;
    if (!scrolling) this.scrollRef = null;

    // 按压锁定：从按下到松开目标不变；热点拖出目标后外环恢复、板子被拉长。
    if (this.pressed) {
      const eng = this.eng;
      if (this.pressed.el && eng && eng.el === this.pressed.el && eng.healthy) {
        this.mode = "engaged";
        this.bridge = null;
        return;
      }
      if (this.pressed.el) {
        this.pressed.el = null;
        this.detach(false);
      }
      if (this.mode === "engaged") this.detach(false);
      this.pend = null;
      if (res.kind === "text" && this.lineCandidate) {
        this.mode = "text";
        this.line = this.lineCandidate;
      } else if (this.mode !== "text" || res.kind !== "text") {
        this.mode = "idle";
        this.line = null;
      }
      return;
    }

    if (this.mode === "engaged" && this.eng) {
      const eng = this.eng;
      const sameTarget = res.kind === "target" && res.el === eng.el;
      if (!eng.healthy) {
        this.detach(this.speed() > BRIDGE_SPEED);
      } else if (scrolling) {
        // 小幅滚动（≤ 4px 且仍在热点下）保持吸附并刚性跟随；更大的滚动立即脱离。
        const rect = eng.rect!;
        const center = {
          x: (rect.left + rect.right) / 2,
          y: (rect.top + rect.bottom) / 2,
        };
        // 以滚动开始前一帧的位置为基准：scroll 事件先于本帧的测量，本帧已经包含了第一步位移。
        if (!this.scrollRef) {
          const before = eng.prev ?? rect;
          this.scrollRef = {
            x: (before.left + before.right) / 2,
            y: (before.top + before.bottom) / 2,
          };
        }
        const drift = Math.hypot(
          center.x - this.scrollRef.x,
          center.y - this.scrollRef.y,
        );
        if (drift > SCROLL_DETACH || !sameTarget) this.detach(false);
        else {
          this.bridge = null;
          return;
        }
      } else if (sameTarget) {
        this.bridge = null;
        this.stateValue = eng.effect;
        return;
      } else if (res.kind === "target") {
        // 切换目标即时生效，即使仍在旧目标的宽限内，也永远不回缩成圆。
        const candidate = this.candidate;
        if (candidate && candidate.el === res.el && candidate.healthy) {
          this.slideTo(candidate);
          return;
        }
        this.detach(false);
      } else if (res.kind === "text") {
        this.detach(false);
      } else {
        const plate = this.plateRect();
        const speed = this.speed();
        if (this.bridge) {
          const keep =
            this.bridge.kind === "group"
              ? inside(x, y, eng.groupRect)
              : now - this.bridge.since <= BRIDGE_TIME &&
                distanceToRect(x, y, plate) <= BRIDGE_DISTANCE;
          if (keep) return;
          this.detach(speed > BRIDGE_SPEED);
        } else if (inside(x, y, eng.groupRect)) {
          this.bridge = { kind: "group", since: now };
          return;
        } else if (
          speed <= BRIDGE_SPEED &&
          distanceToRect(x, y, plate) <= BRIDGE_DISTANCE
        ) {
          this.bridge = { kind: "timed", since: now };
          return;
        } else {
          this.detach(speed > BRIDGE_SPEED);
        }
      }
    }

    // idle / pending / text
    if (res.kind === "target") {
      this.line = null;
      const candidate = this.candidate;
      if (!this.pend || this.pend.el !== res.el) {
        this.pend = { el: res.el, since: now };
      }
      const ready = !!candidate && candidate.el === res.el && candidate.healthy;
      const intent =
        this.speed() <= INTENT_SPEED || now - this.pend.since >= INTENT_DWELL;
      if (ready && !scrolling && intent) {
        this.attach(candidate);
        this.pend = null;
      } else {
        this.mode = "pending";
      }
      return;
    }
    this.pend = null;
    if (res.kind === "text" && this.lineCandidate) {
      this.mode = "text";
      this.line = this.lineCandidate;
      return;
    }
    this.mode = "idle";
    this.line = null;
  }

  private attach(info: TargetInfo) {
    this.eng = info;
    this.mode = "engaged";
    this.bridge = null;
    this.candidate = null;
    this.stateEl = info.el;
    this.stateValue = info.effect;
    this.activateContents(info);
  }

  private slideTo(info: TargetInfo) {
    this.releaseEngaged(false);
    this.attach(info);
  }

  private detach(fling: boolean) {
    this.releaseEngaged(false);
    this.mode = "idle";
    this.detachFling = fling;
  }

  private detachFling = false;

  /** 离开目标：删 data-pointer-state，内容视差独立回零（不可见时立即还原） */
  private releaseEngaged(immediate: boolean) {
    const eng = this.eng;
    this.eng = null;
    this.bridge = null;
    this.stateEl = null;
    if (!eng) return;
    for (const entry of this.contents.values()) {
      if (entry.owner === eng.el) {
        entry.owner = null;
        tune(entry.x, CONTENT_RETURN);
        tune(entry.y, CONTENT_RETURN);
        entry.x.t = 0;
        entry.y.t = 0;
      }
    }
    if (immediate) this.restoreAllContents();
    else this.limitReturningContents();
  }

  private activateContents(info: TargetInfo) {
    for (const content of info.contents) {
      let entry = this.contents.get(content.el);
      if (!entry) {
        entry = {
          el: content.el,
          strength: content.strength,
          owner: null,
          original: content.el.style.translate,
          x: geometrySpring(),
          y: geometrySpring(),
          written: "",
        };
        this.contents.set(content.el, entry);
      }
      entry.owner = info.el;
      entry.strength = content.strength;
    }
  }

  /** 同时回零的内容最多 4 个，再多就立即还原最早的 */
  private limitReturningContents() {
    const returning = [...this.contents.values()].filter(
      (entry) => !entry.owner,
    );
    for (let i = 0; i < returning.length - 4; i++) {
      this.restoreContent(returning[i]);
    }
  }

  private restoreContent(entry: ContentEntry) {
    entry.el.style.translate = entry.original;
    entry.el.removeAttribute(ATTR_CONTENT_WRITTEN);
    this.contents.delete(entry.el);
  }

  private restoreAllContents() {
    for (const entry of [...this.contents.values()]) this.restoreContent(entry);
  }

  private plateRect(): Rect {
    const a = this.anchor;
    return {
      left: a.cx - a.w / 2,
      top: a.cy - a.h / 2,
      right: a.cx + a.w / 2,
      bottom: a.cy + a.h / 2,
    };
  }

  /* ---------------------------------- 锚点 ---------------------------------- */

  private effectiveSize() {
    return this.config.size + (this.contrast ? 2 : 0);
  }

  private effectiveRingSize() {
    return this.config.ringSize + (this.contrast ? 2 : 0);
  }

  private beamWidth() {
    return (2 * Math.max(1, Math.round((2 * this.dpr) / 2))) / this.dpr;
  }

  private visualRadius(info: TargetInfo, w: number, h: number) {
    const short = Math.min(w, h);
    let radius = parseRadius(info.radiusRaw, short);
    // 本仓库的 SmoothCorners / Button 支持 corner-shape 时读到的是等效半径 --sc-i（约为视觉半径的 1.6 倍）。
    if (info.superellipse) radius = info.scRadius ?? radius / 1.6;
    return clamp(radius, 0, short / 2);
  }

  /** 圆角板几何：外扩 2–5px（行内元素 4×2），最小 24px，圆角与目标同心 */
  private plateOf(info: TargetInfo): Anchor {
    const rect = info.rect!;
    const w = rect.right - rect.left;
    const h = rect.bottom - rect.top;
    let outX: number;
    let outY: number;
    if (info.padding) [outX, outY] = info.padding;
    else if (info.inline) {
      outX = 4;
      outY = 2;
    } else {
      const o = clamp(Math.round(0.1 * Math.min(w, h)), 2, 5);
      outX = w / h >= 1.5 ? 1.5 * o : o;
      outY = o;
    }
    let left = rect.left - outX;
    let top = rect.top - outY;
    let right = rect.right + outX;
    let bottom = rect.bottom + outY;
    const minW = PLATE_MIN - (right - left);
    if (minW > 0) {
      left -= minW / 2;
      right += minW / 2;
    }
    const minH = PLATE_MIN - (bottom - top);
    if (minH > 0) {
      top -= minH / 2;
      bottom += minH / 2;
    }
    // 滚动容器里半露的行、贴边的整宽行：板子不溢出到容器外。
    if (info.clip) {
      left = Math.max(left, info.clip.left);
      top = Math.max(top, info.clip.top);
      right = Math.min(right, info.clip.right);
      bottom = Math.min(bottom, info.clip.bottom);
    }
    const W = Math.max(1, right - left);
    const H = Math.max(1, bottom - top);
    const r = this.visualRadius(info, w, h);
    let R: number;
    if (info.radius === "full") R = Math.min(W, H) / 2;
    else if (typeof info.radius === "number") R = info.radius;
    else
      R =
        r > 0 ? r + Math.min(outX, outY) : clamp(0.25 * Math.min(W, H), 6, 10);
    return {
      cx: (left + right) / 2,
      cy: (top + bottom) / 2,
      w: W,
      h: H,
      r: Math.min(R, Math.min(W, H) / 2),
      fx: false,
      fy: false,
    };
  }

  private computeAnchor(): Anchor {
    const size = this.effectiveSize();
    const x = this.px;
    const y = this.py;
    if (this.mode === "engaged" && this.eng?.rect) {
      const eng = this.eng;
      if (eng.effect === "highlight") return this.plateOf(eng);
      if (eng.effect === "lift") {
        const rect = eng.rect!;
        const w = rect.right - rect.left;
        const h = rect.bottom - rect.top;
        return {
          cx: (rect.left + rect.right) / 2,
          cy: (rect.top + rect.bottom) / 2,
          w,
          h,
          r: this.visualRadius(eng, w, h),
          fx: false,
          fy: false,
        };
      }
      // 大目标上的柔和圆：有没有外环都放大，否则单层模式下悬停大卡片没有任何反馈。
      const hoverSize = evenClamp(HOVER_SCALE * size, size, 96);
      return {
        cx: x,
        cy: y,
        w: hoverSize,
        h: hoverSize,
        r: hoverSize / 2,
        fx: true,
        fy: true,
      };
    }
    if (this.mode === "text" && this.line) {
      const beam = this.beamWidth();
      return {
        cx: x,
        cy: this.line.cy,
        w: beam,
        h: this.line.h,
        r: beam / 2,
        fx: true,
        fy: false,
      };
    }
    return { cx: x, cy: y, w: size, h: size, r: size / 2, fx: true, fy: true };
  }

  private idOf(element: Element) {
    let id = this.elementIds.get(element);
    if (!id) {
      id = this.nextElementId++;
      this.elementIds.set(element, id);
    }
    return id;
  }

  private keyOfAnchor() {
    if (this.mode === "engaged" && this.eng) {
      const eng = this.eng;
      return eng.effect === "hover"
        ? "hover"
        : `${eng.effect}:${this.idOf(eng.el)}:${eng.segment}`;
    }
    if (this.mode === "text" && this.line) {
      return `text:${Math.round(this.line.cy)}`;
    }
    return "pointer";
  }

  /**
   * 锚点每帧刚性求出，不带弹簧：静止圆 1:1 跟手，板子像粘在目标上一样跟着布局动画走。
   * 锚点发生不连续的切换时，由残差吸收这次跳变，屏幕位置与速度保持连续。
   */
  private updateAnchor() {
    if (this.hidden) return;
    const next = this.computeAnchor();
    const key = this.keyOfAnchor();
    const ringY = this.mode === "text" && this.line ? this.line.cy : this.py;
    const ringKey =
      this.mode === "text" && this.line
        ? `line:${Math.round(this.line.cy)}`
        : "pointer";

    if (this.teleport) {
      this.teleport = false;
      for (const spring of [
        this.ex,
        this.ey,
        this.ew,
        this.eh,
        this.er,
        this.ox,
        this.oy,
        this.ry,
      ]) {
        jump(spring, 0);
      }
      this.anchor = next;
      this.anchorKey = key;
      this.ringAnchorY = ringY;
      this.ringAnchorKey = ringKey;
      this.alphaShow = true;
      jump(this.alpha, 0);
      if (this.pop) {
        this.pop = false;
        this.popScale.x = 0.75;
        this.popScale.v = 0;
        tune(this.popScale, RING_POP);
      }
      return;
    }

    if (key !== this.anchorKey) {
      // 旧锚点按本帧的输入求值：跟随指针的轴取当前指针位置。
      const previous = { ...this.anchor };
      if (previous.fx) previous.cx = this.px;
      if (previous.fy) previous.cy = this.py;
      // 按下时板子画的是按下瞬间的尺寸，残差要从屏幕上实际的尺寸出发。
      if (this.pressedBase) {
        previous.w = this.pressedBase.w;
        previous.h = this.pressedBase.h;
      }
      // 分类看「跟随指针」：只要旧锚点有一个轴跟着指针、新锚点完全静止，就是吸附（文本竖条 → 链接也算）。
      const nextStatic = !next.fx && !next.fy;
      const previousFollows = previous.fx || previous.fy;
      let kind: SwitchKind;
      if (nextStatic && previousFollows) kind = "attach";
      else if (nextStatic) kind = "slide";
      else if (!previousFollows) kind = this.detachFling ? "fling" : "detach";
      else kind = next.w > previous.w ? "attach" : "detach";
      this.switchAnchor(previous, next, kind);
      this.anchorKey = key;
      // 按下期间换段（折行链接）：按压尺寸跟着换成新段的板子。
      if (this.pressed?.el && this.pressed.el === this.eng?.el) {
        this.pressed.w = next.w;
        this.pressed.h = next.h;
      }
    }
    this.detachFling = false;
    this.anchor = next;

    if (ringKey !== this.ringAnchorKey) {
      const previousY =
        this.ringAnchorKey === "pointer" ? this.py : this.ringAnchorY;
      this.ry.x += previousY - ringY;
      tune(this.ry, RING_LINE);
      this.ringAnchorKey = ringKey;
    }
    this.ringAnchorY = ringY;
  }

  private switchAnchor(previous: Anchor, next: Anchor, kind: SwitchKind) {
    const v = this.velocity();
    const axes = [
      [this.ex, this.ox, previous.cx, next.cx, previous.fx, next.fx, v.x],
      [this.ey, this.oy, previous.cy, next.cy, previous.fy, next.fy, v.y],
    ] as const;
    const keep = 1 - PRESS_OFFSET * this.press.x;
    if (kind === "detach" || kind === "fling") {
      // 视差带来的拉伸随视差一起消失，先并入尺寸残差，避免一帧之内缩一截。
      this.ew.x += STRETCH * Math.abs(this.ox.x * keep);
      this.eh.x += STRETCH * Math.abs(this.oy.x * keep);
    }
    // 上一帧被容器裁剪过的板子：从屏幕上实际的矩形出发。
    this.ex.x += this.clipDelta.x;
    this.ey.x += this.clipDelta.y;
    this.ew.x += this.clipDelta.w;
    this.eh.x += this.clipDelta.h;
    this.clipDelta = { x: 0, y: 0, w: 0, h: 0 };
    for (const [e, o, from, to, followsFrom, followsTo, pointerV] of axes) {
      if (kind === "detach" || kind === "fling") {
        // 先把视差并入残差：板子从当前位置出发，随后加速追上指针，形成「弹回」。
        e.x += o.x * keep;
        e.v += o.v * keep;
        jump(o, 0);
      }
      e.x += from - to;
      const pv = pointerV * 1000;
      e.v += (followsFrom ? pv : 0) - (followsTo ? pv : 0);
      if (kind === "attach") {
        e.v = clamp(
          ATTACH_CARRY * e.v,
          -ATTACH_MAX_VELOCITY,
          ATTACH_MAX_VELOCITY,
        );
      }
    }
    this.ew.x += previous.w - next.w;
    this.eh.x += previous.h - next.h;
    this.er.x += previous.r - next.r;
    const position =
      kind === "attach"
        ? FILL_ATTACH
        : kind === "slide"
          ? FILL_SLIDE
          : kind === "fling"
            ? FILL_FLING
            : FILL_DETACH;
    const size =
      kind === "attach"
        ? SIZE_ATTACH
        : kind === "slide"
          ? SIZE_SLIDE
          : kind === "fling"
            ? SIZE_FLING
            : SIZE_DETACH;
    tune(this.ex, position);
    tune(this.ey, position);
    tune(this.ew, size);
    tune(this.eh, size);
    tune(this.er, kind === "attach" ? RADIUS_ATTACH : RADIUS_OTHER);
  }

  /* ---------------------------------- 弹簧 ---------------------------------- */

  private setTargets() {
    const config = this.config;
    const eng = this.eng;
    const anchor = this.anchor;
    const engaged = this.mode === "engaged" && !!eng;
    const highlight = engaged && eng!.effect === "highlight";
    const x = this.px;
    const y = this.py;

    // 视差：只在 highlight 中有目标值；hover / lift / text / pending 时为 0。
    if (highlight && !this.hidden) {
      const k = config.parallax * eng!.parallax;
      const max =
        clamp(
          OFFSET_RATIO * Math.min(anchor.w, anchor.h),
          OFFSET_MIN,
          OFFSET_MAX,
        ) * k;
      this.ox.t = dampedOffset(x - anchor.cx, anchor.w / 2, max);
      this.oy.t = dampedOffset(y - anchor.cy, anchor.h / 2, max);
    } else {
      this.ox.t = 0;
      this.oy.t = 0;
    }
    tune(this.ox, PARALLAX);
    tune(this.oy, PARALLAX);

    // 按压因子
    const pressed = this.pressed;
    const pressTarget = pressed
      ? pressed.el && eng
        ? inside(x, y, eng.rect)
          ? 1
          : 0
        : 1
      : 0;
    if (pressTarget !== this.press.t) {
      tune(this.press, pressTarget > this.press.x ? PRESS_DOWN : PRESS_UP);
      this.press.t = pressTarget;
    }

    // 填充层透明度
    const tokens = this.tokens;
    let alpha: number;
    if (this.mode === "native") alpha = 0;
    else if (engaged) {
      alpha =
        eng!.effect === "highlight"
          ? tokens.plate
          : eng!.effect === "hover"
            ? tokens.hover
            : 0;
    } else if (this.mode === "text") alpha = 0;
    else alpha = config.ring ? tokens.idle : tokens.solo;
    if (this.mode === "native") jump(this.alpha, 0);
    else if (alpha !== this.alpha.t || this.alphaShow) {
      tune(
        this.alpha,
        this.alphaShow ? ALPHA_SHOW : alpha === 0 ? ALPHA_FADE : ALPHA_STATE,
      );
      this.alpha.t = alpha;
      this.alphaShow = false;
    }

    // 外环尺寸：只看本帧真实命中，与宽限、桥接、滚动、意图延迟都无关。
    const size = this.effectiveSize();
    const small = this.effectiveRingSize();
    let ringW: number;
    let ringH: number;
    let spec: SpringSpec;
    if (this.mode === "text" && this.line) {
      ringW = this.beamWidth();
      ringH = this.line.h;
      spec = RING_BEAM;
    } else {
      // 按下期间：小圆当且仅当热点在冻结目标内（这正是「松手会不会点到它」）；没有冻结目标就不缩小。
      const isSmall = pressed
        ? !!pressed.el && inside(x, y, eng?.rect ?? null)
        : this.res.kind === "target";
      ringW = ringH = isSmall ? small : size;
      const fromBeam = Math.abs(this.rw.t - this.rh.t) > 0.5;
      spec = fromBeam ? RING_BEAM : ringW < this.rw.t ? RING_SHRINK : RING_GROW;
    }
    if (ringW !== this.rw.t || ringH !== this.rh.t) {
      tune(this.rw, spec);
      tune(this.rh, spec);
      this.rw.t = ringW;
      this.rh.t = ringH;
    }
    this.ry.t = 0;
    this.popScale.t = 1;
    if (this.activating) {
      jump(this.rw, ringW);
      jump(this.rh, ringH);
    }
  }

  private stepSprings(dt: number) {
    for (const spring of [
      this.ex,
      this.ey,
      this.ew,
      this.eh,
      this.er,
      this.ox,
      this.oy,
      this.press,
      this.alpha,
      this.rw,
      this.rh,
      this.ry,
      this.popScale,
    ]) {
      step(spring, dt);
    }
    // 可见度：淡出线性，显示一律立即。
    if (this.visibilityTarget >= 1) this.visibility = 1;
    else {
      const fade = this.hidden ? HIDE_FADE[this.hidden.reason] : 0;
      this.visibility =
        fade > 0 ? Math.max(0, this.visibility - (dt * 1000) / fade) : 0;
    }
    for (const entry of this.contents.values()) {
      if (!entry.owner) {
        step(entry.x, dt);
        step(entry.y, dt);
      }
    }
  }

  /* ---------------------------------- 输出 ---------------------------------- */

  private computeOutput() {
    const out = this.out;
    const anchor = this.anchor;
    const eng = this.eng;
    const p = this.press.x;
    const engaged = this.mode === "engaged" && !!eng;
    const highlight = engaged && eng!.effect === "highlight";
    const pointerLike = this.mode === "idle" || this.mode === "pending";

    // 填充层：中心 = 锚点 + 视差·(1 - 0.75p) + 残差；尺寸只被视差拉伸，不被残差拉伸。
    const ox = this.ox.x * (1 - PRESS_OFFSET * p);
    const oy = this.oy.x * (1 - PRESS_OFFSET * p);
    const pressScale = p;
    const scale = highlight
      ? 1 - PRESS_PLATE * pressScale
      : pointerLike
        ? 1 - PRESS_IDLE * pressScale
        : 1;
    // 按下时尺寸取按下瞬间的板子：本仓库 Button 自带 active:scale-[0.97]，逐帧测量会被缩两次。
    const pressedPlate = highlight && this.pressed?.el === eng!.el;
    const baseW = pressedPlate ? this.pressed!.w : anchor.w;
    const baseH = pressedPlate ? this.pressed!.h : anchor.h;
    this.pressedBase = pressedPlate ? { w: baseW, h: baseH } : null;
    let w = Math.max(0, (baseW + this.ew.x + STRETCH * Math.abs(ox)) * scale);
    let h = Math.max(0, (baseH + this.eh.x + STRETCH * Math.abs(oy)) * scale);
    let cx = anchor.cx + ox + this.ex.x;
    let cy = anchor.cy + oy + this.ey.x;
    this.clipDelta = { x: 0, y: 0, w: 0, h: 0 };
    if (highlight && eng!.clip) {
      const clip = eng!.clip;
      const left = Math.max(cx - w / 2, clip.left);
      const right = Math.min(cx + w / 2, clip.right);
      const top = Math.max(cy - h / 2, clip.top);
      const bottom = Math.min(cy + h / 2, clip.bottom);
      const clippedW = Math.max(0, right - left);
      const clippedH = Math.max(0, bottom - top);
      const clippedX = (left + right) / 2;
      const clippedY = (top + bottom) / 2;
      this.clipDelta = {
        x: clippedX - cx,
        y: clippedY - cy,
        w: clippedW - w,
        h: clippedH - h,
      };
      w = clippedW;
      h = clippedH;
      cx = clippedX;
      cy = clippedY;
    }
    const radius = clamp(anchor.r + this.er.x, 0, Math.min(w, h) / 2);
    const pressAlpha =
      highlight || pointerLike ? this.tokens.press * Math.max(0, p) : 0;
    let fx = cx - w / 2;
    let fy = cy - h / 2;
    const fillSettled =
      settled(this.ex) &&
      settled(this.ey) &&
      settled(this.ew) &&
      settled(this.eh) &&
      settled(this.ox) &&
      settled(this.oy) &&
      settled(this.press);
    if (fillSettled && pointerLike) {
      fx = Math.round(fx * this.dpr) / this.dpr;
      fy = Math.round(fy * this.dpr) / this.dpr;
    }
    out.fx = fx;
    out.fy = fy;
    out.fw = w;
    out.fh = h;
    out.fr = radius;
    out.fa =
      this.mode === "native"
        ? 0
        : clamp(this.alpha.x + pressAlpha, 0, 1) * this.visibility;

    // 外环：位置 1:1，没有任何平滑；尺寸由弹簧决定，静止后按设备像素对齐，让中心孔正对热点。
    const ringScale =
      (engaged
        ? 1 - PRESS_RING * pressScale
        : pointerLike
          ? 1 - PRESS_IDLE * pressScale
          : 1) * this.popScale.x;
    let rw = Math.max(0, this.rw.x * ringScale);
    let rh = Math.max(0, this.rh.x * ringScale);
    const centerX = this.px;
    const centerY =
      (this.ringAnchorKey === "pointer" ? this.py : this.ringAnchorY) +
      this.ry.x;
    let rx = centerX - rw / 2;
    let ry = centerY - rh / 2;
    const dpr = this.dpr;
    if (
      settled(this.rw) &&
      settled(this.rh) &&
      settled(this.popScale) &&
      settled(this.ry) &&
      settled(this.press)
    ) {
      const wd = 2 * Math.round((rw * dpr) / 2);
      const hd = 2 * Math.round((rh * dpr) / 2);
      rw = wd / dpr;
      rh = hd / dpr;
      rx = Math.round(centerX * dpr) / dpr - rw / 2;
      ry = Math.round(centerY * dpr) / dpr - rh / 2;
    }
    let bwDevice = Math.max(1, Math.round(this.config.ringWidth * dpr));
    if (this.contrast) bwDevice = Math.max(bwDevice, Math.round(2 * dpr));
    const bw = bwDevice / dpr;
    // 浏览器把 ≥ 1 设备像素的描边宽度向下取整到设备像素，而且先按自己的精度存储（WebKit 截断到 1/64px）。
    // 恰好写 bwDevice / dpr 会落到下一档：DPR 1.5 下 1.333px 只画 1 个设备像素，WebKit 在 DPR 1.25 下 1.6px 也是。
    // 多写 0.25 个设备像素，取整后仍是 bwDevice。
    const bwPaint = (bwDevice + 0.25) / dpr;
    const ringVisible =
      this.mode !== "native" &&
      (this.config.ring || this.mode === "text") &&
      !(engaged && eng!.effect === "lift" && !this.config.ring);
    out.rx = rx;
    out.ry = ry;
    out.rw = rw;
    out.rh = rh;
    out.bw = bwPaint;
    out.solid = Math.min(rw, rh) < 2 * bw + 1;
    out.ra = ringVisible ? this.visibility : 0;

    // 选择加入的内容视差：吸附期间 translate = 强度 × 渲染偏移，脱离后独立回零。
    for (const entry of this.contents.values()) {
      if (entry.owner && highlight && entry.owner === eng!.el) {
        entry.x.x = entry.strength * ox;
        entry.y.x = entry.strength * oy;
        entry.x.v = entry.strength * this.ox.v;
        entry.y.v = entry.strength * this.oy.v;
      }
    }
  }

  private publicState(): AdaptivePointerState {
    if (!this.active) return "inactive";
    if (this.hidden) return "hidden";
    if (this.mode === "native") return "native";
    if (this.mode === "engaged") return this.eng ? this.eng.effect : "idle";
    return this.mode;
  }

  private emitState() {
    const state = this.publicState();
    const target =
      this.mode === "engaged"
        ? (this.eng?.el ?? null)
        : this.mode === "pending"
          ? (this.pend?.el ?? null)
          : null;
    const pressed = !!this.pressed;
    patchStatus({ active: this.active, state, pressed });
    const scope = this.active ? this.scope : null;
    const previous = this.emittedScope;
    if (previous && previous !== scope) {
      this.notify(previous, { state: "hidden", target: null, pressed: false });
    }
    this.emittedScope = scope;
    if (scope) this.notify(scope, { state, target, pressed });
  }

  private notify(scope: ScopeRecord, info: AdaptivePointerStateInfo) {
    const last = scope.last;
    if (
      last &&
      last.state === info.state &&
      last.target === info.target &&
      last.pressed === info.pressed
    ) {
      return;
    }
    scope.last = info;
    const callback = scope.callback.current;
    if (!callback) return;
    queueMicrotask(() => {
      try {
        callback(info);
      } catch (error) {
        if (isDevelopment()) console.error(error);
      }
    });
  }

  /* ---------------------------------- 写入 ---------------------------------- */

  private render = () =>
    this.guard(() => {
      if (this.moveOverlayToHtml) {
        this.moveOverlayToHtml = false;
        this.overlayOnHtml = true;
        document.documentElement.appendChild(this.overlay.root);
      }
      if (this.active) {
        if (this.syncNeeded || this.activating) {
          this.syncNeeded = false;
          this.syncScopeAttributes();
        }
        // 作者光标宿主：补写属性后它的子孙交还原生指针（见 STAMPED_CURSOR_HOST）。
        for (const host of this.stampQueue) {
          if (host.isConnected) host.setAttribute(ATTR_NATIVE, "");
        }
        this.stampQueue = [];
        this.flushTargetAttributes();
        this.writeTokens();
        this.writeLayers();
        this.writeContents();
        this.activating = false;
      }
      if (this.shouldSleep()) this.sleep();
    });

  private flushTargetAttributes() {
    if (
      this.writtenStateEl !== this.stateEl ||
      this.writtenStateValue !== this.stateValue
    ) {
      this.writtenStateEl?.removeAttribute(ATTR_STATE);
      this.stateEl?.setAttribute(ATTR_STATE, this.stateValue);
      this.writtenStateEl = this.stateEl;
      this.writtenStateValue = this.stateValue;
    }
    const pressedEl = this.pressed?.el ?? null;
    if (this.writtenPressedEl !== pressedEl) {
      this.writtenPressedEl?.removeAttribute(ATTR_PRESSED);
      pressedEl?.setAttribute(ATTR_PRESSED, "");
      this.writtenPressedEl = pressedEl;
    }
  }

  private writeTokens() {
    const tokens = this.tokens;
    const key = `${tokens.fill}|${tokens.ring}|${tokens.halo}`;
    if (key === this.overlay.tokens) return;
    this.overlay.tokens = key;
    const style = this.overlay.root.style;
    // 计算值已经替换过 var()，原样复制为字符串，不在 JS 里解析颜色。
    style.setProperty("--ap-fill", tokens.fill);
    style.setProperty("--ap-ring", tokens.ring);
    style.setProperty("--ap-halo", tokens.halo);
  }

  private setOverlayVisible(visible: boolean) {
    if (this.overlay.visible === visible) return;
    this.overlay.visible = visible;
    this.overlay.root.style.visibility = visible ? "visible" : "hidden";
  }

  private writeLayers() {
    const out = this.out;
    const overlay = this.overlay;
    const fill = overlay.fill.style;
    const ring = overlay.ring.style;
    const fc = overlay.fillCache;
    const rc = overlay.ringCache;

    const fillOpacity = out.fa.toFixed(3);
    const ringOpacity = out.ra.toFixed(3);
    const anything = out.fa > 0.0005 || out.ra > 0.0005;
    this.setOverlayVisible(anything || !this.allSettled());

    const write = (
      style: CSSStyleDeclaration,
      cache: LayerCache,
      key: keyof LayerCache,
      property: string,
      value: string,
    ) => {
      if (cache[key] === value) return;
      cache[key] = value;
      style.setProperty(property, value);
    };
    write(fill, fc, "opacity", "opacity", fillOpacity);
    if (out.fa > 0.0005) {
      write(
        fill,
        fc,
        "transform",
        "transform",
        `translate3d(${out.fx.toFixed(2)}px, ${out.fy.toFixed(2)}px, 0)`,
      );
      write(fill, fc, "width", "width", `${out.fw.toFixed(2)}px`);
      write(fill, fc, "height", "height", `${out.fh.toFixed(2)}px`);
      write(fill, fc, "radius", "border-radius", `${out.fr.toFixed(2)}px`);
    }
    write(ring, rc, "opacity", "opacity", ringOpacity);
    if (out.ra > 0.0005) {
      write(
        ring,
        rc,
        "transform",
        "transform",
        `translate3d(${out.rx.toFixed(2)}px, ${out.ry.toFixed(2)}px, 0)`,
      );
      write(ring, rc, "width", "width", `${out.rw.toFixed(2)}px`);
      write(ring, rc, "height", "height", `${out.rh.toFixed(2)}px`);
      // 竖条窄到描边已经填满时，离散地换成无描边的实心底色，切换不可见。
      // 不能保留描边：border-box 的盒子不会窄于两侧描边之和，2px 的竖条会被撑成 4px 并偏向右侧。
      write(
        ring,
        rc,
        "border",
        "border-width",
        out.solid ? "0px" : `${out.bw.toFixed(3)}px`,
      );
      write(
        ring,
        rc,
        "background",
        "background",
        out.solid ? "var(--ap-ring)" : "transparent",
      );
    }
  }

  private writeContents() {
    for (const entry of [...this.contents.values()]) {
      if (
        !entry.owner &&
        settled(entry.x) &&
        settled(entry.y) &&
        entry.x.x === 0 &&
        entry.y.x === 0
      ) {
        this.restoreContent(entry);
        continue;
      }
      const value = `${entry.x.x.toFixed(1)}px ${entry.y.x.toFixed(1)}px`;
      if (value === entry.written) continue;
      entry.written = value;
      entry.el.style.translate = value;
      entry.el.setAttribute(ATTR_CONTENT_WRITTEN, "");
    }
  }

  private allSettled() {
    return (
      settled(this.ex) &&
      settled(this.ey) &&
      settled(this.ew) &&
      settled(this.eh) &&
      settled(this.er) &&
      settled(this.ox) &&
      settled(this.oy) &&
      settled(this.press) &&
      settled(this.alpha) &&
      settled(this.rw) &&
      settled(this.rh) &&
      settled(this.ry) &&
      settled(this.popScale) &&
      (this.visibility === 0 || this.visibility === 1)
    );
  }

  private shouldSleep() {
    if (!this.active) return true;
    if (this.frameMoved || this.handshake || this.moveOverlayToHtml)
      return false;
    if (this.now < this.scrollingUntil) return false;
    // 隐藏期间的待吸附与桥接会在恢复显示时重新判定（恢复必然伴随新的移动，会唤醒循环）。
    // 待吸附超过意图延迟仍没有吸附，说明候选目标不可用，交给休眠轮询，不再空转。
    if (!this.hidden) {
      if (this.pend && this.now - this.pend.since < INTENT_DWELL) return false;
      if (this.bridge?.kind === "timed") return false;
    }
    if (this.pressed?.releaseAt) return false;
    if (this.eng && this.now - this.lastMoveAt < ENGAGED_SLEEP_DELAY)
      return false;
    for (const entry of this.contents.values()) {
      if (!entry.owner && !(settled(entry.x) && settled(entry.y))) return false;
    }
    return this.allSettled();
  }
}

/* -------------------------------------------------------------------------- */
/*                                   React 层                                  */
/* -------------------------------------------------------------------------- */

function AdaptivePointerStyle() {
  return (
    <style href={CSS_HREF} precedence="default">
      {ADAPTIVE_POINTER_CSS}
    </style>
  );
}

/**
 * 把作用域登记到引擎。Area 的根节点用状态而不是 ref 传入：asChild 的子元素换了类型或 key、
 * asChild 被切换时，根节点会变成另一个 DOM 节点，必须重新登记，否则引擎还拿着已经脱离文档的旧节点。
 */
function useScope(
  kind: "page" | "area",
  areaElement: Element | null,
  options: AdaptivePointerOptions,
) {
  const id = React.useId();
  const callbackRef = React.useRef(options.onStateChange);
  const optionsRef = React.useRef(options);
  React.useEffect(() => {
    callbackRef.current = options.onStateChange;
    optionsRef.current = options;
  });

  React.useEffect(() => {
    const element = kind === "page" ? document.documentElement : areaElement;
    if (!element) return;
    const instance = acquireEngine();
    if (!instance) return;
    instance.register(id, kind, element, callbackRef, optionsRef.current);
    return () => instance.unregister(id);
  }, [id, kind, areaElement]);

  const {
    disabled,
    size,
    ring,
    ringSize,
    ringWidth,
    parallax,
    largeTarget,
    selector,
    hideOnKeyboard,
    autoHide,
    contentParallax,
    textBeam,
    timeScale,
  } = options;
  const largeHeight = largeTarget?.height;
  const largeArea = largeTarget?.area;
  React.useEffect(() => {
    engine?.configure(id, {
      disabled,
      size,
      ring,
      ringSize,
      ringWidth,
      parallax,
      largeTarget: { height: largeHeight, area: largeArea },
      selector,
      hideOnKeyboard,
      autoHide,
      contentParallax,
      textBeam,
      timeScale,
    });
  }, [
    id,
    disabled,
    size,
    ring,
    ringSize,
    ringWidth,
    parallax,
    largeHeight,
    largeArea,
    selector,
    hideOnKeyboard,
    autoHide,
    contentParallax,
    textBeam,
    timeScale,
  ]);

  return id;
}

/**
 * AdaptivePointer — 整页生效的双层自适应指针
 *
 * 参照 iPadOS 妙控板的圆形指针：
 * - 内层淡灰填充层：静止时是一个圆，悬停到可点击元素上时连续变形为垫在元素下方的圆角板，
 *   并朝指针偏移的方向做有阻尼的偏移与轻微拉伸；图标按钮里的图标跟着轻微移动（内容视差）
 * - 正文上变为 I 形竖条并吸附到行，静止 2 秒后淡出，移动即恢复
 * - 可选的深灰外环（`ring`）：悬停时与填充层分离，缩成小圆并始终 1:1 停在真实热点上——
 *   比 Apple 的设计多给出「指针在按钮的哪里」
 * - 输入框、iframe、语义光标（grab、crosshair 等）与作用域外自动交还原生指针
 * - 触屏、笔、强制颜色、开启「减少动态效果」、出错或持续卡顿时直接使用系统指针
 *
 * 像 `<Toaster />` 一样在根布局里放一次；只想在局部生效时用 {@link AdaptivePointerArea}。
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * <body>
 *   {children}
 *   <AdaptivePointer />
 * </body>
 * ```
 */
export function AdaptivePointer(props: AdaptivePointerProps) {
  useScope("page", null, props);
  return <AdaptivePointerStyle />;
}

/**
 * AdaptivePointerArea — 局部生效的双层自适应指针
 *
 * 只在子树内隐藏原生指针并绘制自适应指针：
 * - 覆盖子树 Portal 出去的浮层（DropdownMenu、Select、Dialog 等），通过 React 树上的捕获事件识别
 * - 嵌套时最内层的配置生效；`disabled` 的 Area 在整页实例里也会成为原生区域
 * - 支持 `asChild`，把作用域挂到唯一的子元素上
 *
 * @example
 * ```tsx
 * <AdaptivePointerArea className="rounded-xl border p-6">
 *   <Button variant="ghost" size="icon" aria-label="加粗">
 *     <BoldIcon />
 *   </Button>
 *   <a href="/posts/1" className="block h-32 rounded-xl border p-4">大卡片</a>
 * </AdaptivePointerArea>
 * ```
 */
export const AdaptivePointerArea = React.forwardRef<
  HTMLDivElement,
  AdaptivePointerAreaProps
>(function AdaptivePointerArea(
  {
    disabled,
    size,
    ring,
    ringSize,
    ringWidth,
    parallax,
    largeTarget,
    selector,
    hideOnKeyboard,
    autoHide,
    contentParallax,
    textBeam,
    timeScale,
    onStateChange,
    asChild = false,
    onPointerMoveCapture,
    onPointerDownCapture,
    children,
    ...rest
  },
  forwardedRef,
) {
  const [element, setElement] = React.useState<HTMLElement | null>(null);
  // React 19 的回调 ref 可以返回清理函数：转发给使用方时保留它，卸载时调用它而不是传 null。
  const setRef = React.useCallback(
    (node: HTMLElement | null) => {
      setElement(node);
      const target = node as HTMLDivElement | null;
      let cleanup: unknown;
      if (typeof forwardedRef === "function") cleanup = forwardedRef(target);
      else if (forwardedRef) forwardedRef.current = target;
      return () => {
        if (typeof cleanup === "function") cleanup();
        else if (typeof forwardedRef === "function") forwardedRef(null);
        else if (forwardedRef) forwardedRef.current = null;
      };
    },
    [forwardedRef],
  );
  const id = useScope("area", element, {
    disabled,
    size,
    ring,
    ringSize,
    ringWidth,
    parallax,
    largeTarget,
    selector,
    hideOnKeyboard,
    autoHide,
    contentParallax,
    textBeam,
    timeScale,
    onStateChange,
  });
  const Comp = asChild ? Slot.Root : "div";
  return (
    <>
      <AdaptivePointerStyle />
      <Comp
        {...rest}
        ref={setRef}
        data-adaptive-pointer-area={disabled ? "off" : ""}
        onPointerMoveCapture={(event: React.PointerEvent<HTMLElement>) => {
          onPointerMoveCapture?.(event as React.PointerEvent<HTMLDivElement>);
          engine?.claim(id, event.nativeEvent.timeStamp);
        }}
        onPointerDownCapture={(event: React.PointerEvent<HTMLElement>) => {
          onPointerDownCapture?.(event as React.PointerEvent<HTMLDivElement>);
          engine?.claim(id, event.nativeEvent.timeStamp);
        }}
      >
        {children}
      </Comp>
    </>
  );
});

/**
 * 读取自适应指针的全局状态（基于 `useSyncExternalStore`，只有离散字段变化时才重渲染）。
 * 常用于在触屏设备上显示降级提示，或展示当前形态。
 *
 * @example
 * ```tsx
 * const { supported, state } = useAdaptivePointerStatus();
 * if (supported === false) return <p>需要鼠标或触控板</p>;
 * ```
 */
export function useAdaptivePointerStatus(): AdaptivePointerStatus {
  return React.useSyncExternalStore(
    subscribeStatus,
    () => status,
    () => SERVER_STATUS,
  );
}

/**
 * 生成目标级 data 属性，直接展开到元素上。写了 `data-pointer` 的元素即使不匹配选择器也会成为目标。
 *
 * 本模块带 `"use client"`：在客户端组件里使用（服务端渲染客户端组件没有问题）。
 * Next.js 的服务端组件文件不能调用它，请直接写 `data-pointer`、`data-pointer-padding`、
 * `data-pointer-radius`、`data-pointer-parallax` 属性。
 *
 * @example
 * ```tsx
 * <div role="button" tabIndex={0} {...pointerTarget({ effect: "hover" })}>大卡片</div>
 * <Button {...pointerTarget({ padding: [8, 4], radius: "full" })}>胶囊按钮</Button>
 * ```
 */
export function pointerTarget(
  options: PointerTargetOptions = {},
): PointerTargetAttributes {
  const attributes: PointerTargetAttributes = {
    "data-pointer": options.effect ?? "auto",
  };
  if (options.padding !== undefined) {
    attributes["data-pointer-padding"] =
      typeof options.padding === "number"
        ? String(options.padding)
        : `${options.padding[0]} ${options.padding[1]}`;
  }
  if (options.radius !== undefined) {
    attributes["data-pointer-radius"] = String(options.radius);
  }
  if (options.parallax !== undefined) {
    attributes["data-pointer-parallax"] = String(options.parallax);
  }
  return attributes;
}

/**
 * 选择加入的内容视差：写在目标内部的非按钮子元素（图标、文字 span）上，
 * 吸附期间按「强度 × 圆角板偏移」平移。该元素不能自带 translate，也不能对 translate / transform 设置过渡。
 * 与 {@link pointerTarget} 一样只能在客户端组件里调用；服务端组件直接写 `data-pointer-content`。
 *
 * @param strength 强度 0–1，默认 0.4
 * @example
 * ```tsx
 * <Button variant="ghost" size="icon" aria-label="加粗">
 *   <BoldIcon {...pointerContent()} />
 * </Button>
 * ```
 */
export function pointerContent(strength?: number): {
  "data-pointer-content": string;
} {
  return {
    "data-pointer-content": strength === undefined ? "" : String(strength),
  };
}

/** 程序移动了静止指针下方的内容后调用，要求下一帧重新命中（与浏览器 :hover 一致，默认不主动吸附） */
export function refreshAdaptivePointer() {
  engine?.refresh();
}
