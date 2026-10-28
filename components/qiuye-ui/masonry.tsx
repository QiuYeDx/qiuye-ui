"use client";

import * as React from "react";
import {
  AnimatePresence,
  animate,
  frame,
  motionValue,
  useInView,
  usePresence,
  type MotionValue,
} from "motion/react";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* 类型                                                                 */
/* ------------------------------------------------------------------ */

/**
 * 可按容器宽度断点配置的值：
 * - 直接传值：任何宽度下都使用该值
 * - 传入对象：键为容器宽度（px），取不大于当前宽度的最大键对应的值；
 *   当前宽度小于所有键时取最小的键
 *
 * @example
 * ```ts
 * const columns: MasonryResponsive<number> = { 0: 2, 640: 3, 1024: 4 };
 * ```
 */
export type MasonryResponsive<T> = T | Record<number, T>;

/**
 * 排布策略
 * - `"shortest"`：放进当前最短的一列（高度并列时取最左），整体最平整
 * - `"sequential"`：按序号轮流放入各列（第 i 项放在第 i % 列数 列），保持左右阅读顺序
 */
export type MasonryStrategy = "shortest" | "sequential";

/** Masonry 渲染的界面文案 */
export interface MasonryLabels {
  /** 加载中时读屏器播报的状态文本 */
  loading: string;
}

/** Masonry 的默认文案 */
export const DEFAULT_MASONRY_LABELS: MasonryLabels = {
  loading: "正在加载…",
};

/** 传给 `renderSkeleton` 的排布信息 */
export interface MasonrySkeletonInfo {
  /** 当前列宽（px） */
  width: number;
  /** 当前列数 */
  columns: number;
}

/** 当前排布的列数与尺寸，`onLayoutChange` 的参数 */
export interface MasonryLayoutInfo {
  /** 列数 */
  columns: number;
  /** 列宽（px） */
  columnWidth: number;
  /** 容器内容区宽度（px） */
  width: number;
}

/** Masonry 组件的属性 */
export interface MasonryProps<T>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * 数据列表。传入后按 `renderItem` 渲染每一项；不传时使用 `children` 中每个带 key 的元素作为一项。
   */
  items?: readonly T[];
  /**
   * 返回每一项的稳定 key。
   * 默认依次尝试 `item.id`、`item.key`，都没有时退回下标（开发环境警告一次：
   * 下标作为 key 时排序与删除的过渡会错位）。
   */
  getItemKey?: (item: T, index: number) => React.Key;
  /** 渲染单个数据项，高度由内容决定 */
  renderItem?: (item: T, index: number) => React.ReactNode;
  /** 不传 `items` 时，每个带 `key` 的子元素是一项，适合静态内容 */
  children?: React.ReactNode;
  /**
   * 自动计算列数时的最小列宽（px）：列数 = floor((容器宽 + gap) / (minColumnWidth + gap))，
   * 再夹在 `[1, maxColumns]` 之间。设置了 `columns` 时不生效。
   * @default 220
   */
  minColumnWidth?: number;
  /**
   * 自动计算列数时的上限
   * @default 6
   */
  maxColumns?: number;
  /**
   * 固定列数，或按容器宽度断点配置（如 `{ 0: 2, 640: 3, 1024: 4 }`）。
   * 设置后优先于 `minColumnWidth` 自动计算。
   */
  columns?: MasonryResponsive<number>;
  /**
   * 列间距（px），也可以按容器宽度断点配置
   * @default 16
   */
  gap?: MasonryResponsive<number>;
  /**
   * 行间距（px），也可以按容器宽度断点配置
   * @default 与 `gap` 相同
   */
  rowGap?: MasonryResponsive<number>;
  /**
   * 排布策略：`"shortest"` 最短列优先，`"sequential"` 按序轮流放入各列
   * @default "shortest"
   */
  strategy?: MasonryStrategy;
  /**
   * 是否在加载中。没有数据时铺满骨架；已有数据时在最短的几列底部追加骨架，
   * 即真实内容即将出现的位置。加载期间不会重复触发 `onLoadMore`。
   * @default false
   */
  loading?: boolean;
  /**
   * 加载中显示的骨架数量
   * @default 首屏为 列数 × 3，加载更多时为 列数 × 2
   */
  skeletonCount?: number;
  /**
   * 自定义骨架，高度由返回内容决定。可以组合多个 `MasonrySkeleton`，
   * 它们会与整面瀑布流的微光保持同步。
   */
  renderSkeleton?: (index: number, info: MasonrySkeletonInfo) => React.ReactNode;
  /**
   * 是否还有更多数据；为 `false` 时不再触发 `onLoadMore`
   * @default true
   */
  hasMore?: boolean;
  /**
   * 最短一列的底部进入「视口底部 + loadMoreOffset」时触发。
   * 加载完成后内容仍不够填满视口时会继续触发，直到填满或 `hasMore` 为 `false`。
   * 建议同时传入 `loading`，组件据此判断一轮加载是否结束。
   */
  onLoadMore?: () => void;
  /**
   * 提前触发 `onLoadMore` 的距离（px）
   * @default 800
   */
  loadMoreOffset?: number;
  /** 自定义滚动容器的 ref；不传时以视口为准 */
  scrollRoot?: React.RefObject<Element | null>;
  /**
   * 首次挂载的项是否播放入场。之后新增的项总会播放入场。
   * 服务端渲染时，为 `true` 的项在水合前隐藏、等待入场（禁用 JS 时仍以近似排布显示）；骨架始终可见。
   * @default true
   */
  appear?: boolean;
  /**
   * 位置变化（列数变化、增删、排序、筛选）是否沿弹簧过渡；
   * 为 `false` 或系统开启减少动态效果时直接到位
   * @default true
   */
  animateLayout?: boolean;
  /** 覆盖界面文案，未传的字段使用 `DEFAULT_MASONRY_LABELS` */
  labels?: Partial<MasonryLabels>;
  /** 每一项内容容器的类名（入场与退场动画作用在这一层） */
  itemClassName?: string;
  /** 列数或列宽变化时触发，可用于显示当前列数等 */
  onLayoutChange?: (info: MasonryLayoutInfo) => void;
}

/* ------------------------------------------------------------------ */
/* 参数                                                                 */
/* ------------------------------------------------------------------ */

// 默认骨架高度 = 列宽 × 比例，循环取值，首屏看起来像真实的瀑布流而不是整齐的格子。
const SKELETON_RATIOS = [1.3, 0.8, 1.55, 1, 1.2, 0.72, 1.4, 0.9];

// 位置过渡：每项以「目标位置 + 偏移」定位，换位置时偏移从屏幕上的当前位置以弹簧归零。
// 连续拖动窗口宽度时只移动目标、偏移继续自己衰减，项严格跟手，不会因每帧改目标而拖沓发抖。
const LAYOUT_SPRING = {
  type: "spring",
  visualDuration: 0.45,
  bounce: 0.08,
} as const;

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
// 入场上浮：带一点点回弹的缓出
const ENTER_EASE = [0.22, 1.12, 0.36, 1] as const;
const EXIT_EASE = [0.32, 0.72, 0, 1] as const;
// 骨架与替代它的内容交叉淡出：对称缓动，与内容的缓出叠加后覆盖度始终接近 1
const CROSSFADE_EASE = [0.45, 0, 0.55, 1] as const;

const ENTER_FROM = "translateY(18px) scale(0.96)";
const ENTER_TO = "translateY(0px) scale(1)";
const EXIT_TO = "translateY(0px) scale(0.92)";
const ENTER_STAGGER = 35;
const ENTER_STAGGER_MAX = 420;
// 同一次排布里已有项沿弹簧移动时，新项整体推迟出现，先让移动的项让开位置
const MOVE_LEAD = 140;

// 微光：一轮 1800ms，高光沿对角线以 1 个 (x + y) 像素 / ms 的速度推进。
// 每个微光元素的 animation-delay 按它在瀑布流中的 x + y 换算，
// 整面瀑布流上就是一道连续的对角线波，而不是各块同时闪烁。
const SHIMMER_NAME = "qy-masonry-shimmer";
const SHIMMER_PERIOD = 1800;
const SHIMMER_MS_PER_PX = 1;

/* ------------------------------------------------------------------ */
/* 样式                                                                 */
/* ------------------------------------------------------------------ */

// 只放无法用类名表达、也不需要用户覆盖的部分：首帧近似排布、定位、微光与图片过渡。
// React 19 <style href precedence>：提升到 <head> 并按 href 去重，Vite 等环境同样可用。
const MASONRY_CSS = `
.qy-masonry-list {
  position: relative;
}
.qy-masonry-list:focus {
  outline: none;
}
.qy-masonry:not([data-ready]) > .qy-masonry-list {
  columns: var(--qy-masonry-columns, auto) var(--qy-masonry-min-width, 220px);
  column-gap: var(--qy-masonry-gap, 16px);
}
.qy-masonry:not([data-ready]) > .qy-masonry-list > [data-qy-masonry-layer] {
  break-inside: avoid;
  margin-bottom: var(--qy-masonry-row-gap, 16px);
}
/* 有 JS 时，等待入场的项在水合前先藏起来；无 JS 时保持可见（近似排布）。骨架始终可见。 */
@media (scripting: enabled) {
  .qy-masonry:not([data-ready]) > .qy-masonry-list > [data-qy-masonry-layer] > [data-qy-masonry-appear] {
    opacity: 0;
  }
}
.qy-masonry[data-ready] > .qy-masonry-list > [data-qy-masonry-layer] {
  position: absolute;
  top: 0;
  left: 0;
}
.qy-masonry[data-ready] > .qy-masonry-list > [data-qy-masonry-layer]:not([data-placed]) {
  visibility: hidden;
}
[data-qy-masonry-sentinel] {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  pointer-events: none;
}

/* 一道柔和的高光从左上扫向右下：渐变放在 2400px 的方形背景里，沿对角线平移 900px。
   高光的位置以像素计，与元素尺寸无关，大小不同的块上扫过的速度一致。 */
.qy-masonry-shimmer {
  --qy-masonry-shimmer-color: color-mix(in oklab, var(--background) 80%, transparent);
  background-image: linear-gradient(
    135deg,
    transparent calc(50% - 150px),
    var(--qy-masonry-shimmer-color) 50%,
    transparent calc(50% + 150px)
  );
  background-size: 2400px 2400px;
  background-repeat: no-repeat;
  background-position: -1330px -1330px;
  animation: ${SHIMMER_NAME} ${SHIMMER_PERIOD}ms linear infinite;
  animation-delay: var(--qy-masonry-wave, 0ms);
}
:where(.dark) .qy-masonry-shimmer {
  --qy-masonry-shimmer-color: color-mix(in oklab, var(--foreground) 9%, transparent);
}
@keyframes ${SHIMMER_NAME} {
  from {
    background-position: -1330px -1330px;
  }
  to {
    background-position: -430px -430px;
  }
}

/* MasonryImage：加载完成后淡入、去模糊、从 1.04 收回 */
.qy-masonry-image-img {
  opacity: 0;
  transform: scale(1.04);
  filter: blur(12px);
  transition:
    opacity 600ms cubic-bezier(0.23, 1, 0.32, 1),
    transform 600ms cubic-bezier(0.23, 1, 0.32, 1),
    filter 600ms cubic-bezier(0.23, 1, 0.32, 1);
}
[data-slot="masonry-image"][data-state="loaded"] > .qy-masonry-image-img {
  opacity: 1;
  transform: none;
  filter: none;
}
[data-slot="masonry-image"][data-state="error"] > .qy-masonry-image-img {
  visibility: hidden;
}
[data-slot="masonry-image"][data-instant] > * {
  transition: none;
}
.qy-masonry-image-placeholder {
  transition: opacity 420ms ease;
}
/* 加载完成时冻结高光而不是移除动画：高光随占位一起淡出，不会在一帧内跳回起点 */
[data-slot="masonry-image"][data-state="loaded"] > .qy-masonry-image-placeholder {
  opacity: 0;
  animation-play-state: paused;
}

@media (prefers-reduced-motion: reduce) {
  .qy-masonry-shimmer {
    animation: none;
    background-image: none;
  }
  .qy-masonry-image-img {
    transform: none;
    filter: none;
    transition: opacity 240ms ease;
  }
}
`;

function MasonryStyles() {
  return (
    <style href="qiuye-masonry" precedence="default">
      {MASONRY_CSS}
    </style>
  );
}

/* ------------------------------------------------------------------ */
/* 排布（纯函数）                                                        */
/* ------------------------------------------------------------------ */

interface LayoutInput {
  /** 参与排布的 key，按数据顺序（骨架排在真实项之后） */
  keys: readonly string[];
  /** 每项的高度（px） */
  heights: ReadonlyMap<string, number>;
  /**
   * 上一次排布的 key 序列与每项所在的列。列数或策略变化时传 `null`，全部重新分配。
   */
  previous: {
    keys: readonly string[];
    lanes: ReadonlyMap<string, number>;
  } | null;
  columns: number;
  columnWidth: number;
  gap: number;
  rowGap: number;
  strategy: MasonryStrategy;
}

interface LayoutResult {
  /** 每项左上角相对容器的坐标 */
  positions: Map<string, { x: number; y: number }>;
  /** 每项所在的列，作为下一次排布的列缓存 */
  lanes: Map<string, number>;
  /** 每列内容的底部（不含末尾的行间距），空列为 0 */
  laneBottoms: number[];
  /** 容器高度 = 最高一列的底部 */
  height: number;
}

/** 高度相差不到半像素视为并列，取最左的一列 */
const LANE_TIE = 0.5;

function shortestLane(bottoms: readonly number[]) {
  let lane = 0;
  for (let index = 1; index < bottoms.length; index += 1) {
    if (bottoms[index] < bottoms[lane] - LANE_TIE) lane = index;
  }
  return lane;
}

/**
 * 稳定列的瀑布流排布。
 *
 * 1. 与上次相同的 key 前缀保留各自所在的列；从第一个不同的位置起，之后的项重新分配。
 *    插入、删除、排序只重排受影响的部分；高度变化（图片加载、内容展开）不改变任何项的列，
 *    只让同一列下方的项上下平移，不会跨列跳动。
 * 2. 需要分配的项放进当前最短的一列（`sequential` 时为 序号 % 列数）。
 */
function computeMasonryLayout(input: LayoutInput): LayoutResult {
  const { keys, heights, previous, columns, columnWidth, gap, rowGap, strategy } =
    input;

  let prefix = 0;
  if (previous) {
    const limit = Math.min(keys.length, previous.keys.length);
    while (prefix < limit && keys[prefix] === previous.keys[prefix]) prefix += 1;
  }

  // 每列下一项的 y（已含行间距）与项数
  const cursors = new Array<number>(columns).fill(0);
  const counts = new Array<number>(columns).fill(0);
  const positions = new Map<string, { x: number; y: number }>();
  const lanes = new Map<string, number>();

  keys.forEach((key, index) => {
    let lane = index < prefix ? (previous?.lanes.get(key) ?? -1) : -1;
    if (lane < 0 || lane >= columns) {
      lane = strategy === "sequential" ? index % columns : shortestLane(cursors);
    }
    const y = cursors[lane];
    positions.set(key, { x: lane * (columnWidth + gap), y });
    lanes.set(key, lane);
    cursors[lane] = y + Math.max(0, heights.get(key) ?? 0) + rowGap;
    counts[lane] += 1;
  });

  const laneBottoms = cursors.map((cursor, lane) =>
    counts[lane] > 0 ? cursor - rowGap : 0,
  );
  return {
    positions,
    lanes,
    laneBottoms,
    height: Math.max(0, ...laneBottoms),
  };
}

/* ------------------------------------------------------------------ */
/* 工具函数                                                              */
/* ------------------------------------------------------------------ */

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
  console.warn(`[Masonry] ${message}`);
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function pickResponsive<V>(value: MasonryResponsive<V>, width: number): V {
  if (typeof value !== "object" || value === null) return value as V;
  const map = value as Record<number, V>;
  let best = -Infinity;
  let smallest = Infinity;
  for (const raw of Object.keys(map)) {
    const breakpoint = Number(raw);
    if (!Number.isFinite(breakpoint)) continue;
    if (breakpoint <= width && breakpoint > best) best = breakpoint;
    if (breakpoint < smallest) smallest = breakpoint;
  }
  return map[best > -Infinity ? best : smallest];
}

/** 断点对象中最小断点的值，用于服务端首帧的近似排布 */
function firstResponsive(value: MasonryResponsive<number>) {
  return pickResponsive(value, 0);
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** 对齐到设备像素，静止时文字清晰 */
function snap(value: number) {
  const ratio = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  return Math.round(value * ratio) / ratio;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

function readContentWidth(element: HTMLElement) {
  const style = getComputedStyle(element);
  const width = parseFloat(style.width);
  if (!Number.isFinite(width)) return 0;
  if (style.boxSizing !== "border-box") return width;
  return Math.max(
    0,
    width -
      (parseFloat(style.paddingLeft) || 0) -
      (parseFloat(style.paddingRight) || 0) -
      (parseFloat(style.borderLeftWidth) || 0) -
      (parseFloat(style.borderRightWidth) || 0),
  );
}

function measureHeight(element: HTMLElement) {
  const height = parseFloat(getComputedStyle(element).height);
  return Number.isFinite(height) ? height : element.offsetHeight;
}

function timelineNow() {
  const time =
    typeof document === "undefined" ? null : document.timeline?.currentTime;
  return typeof time === "number" ? time : performance.now();
}

/** 微光动画实际开始的时间；刚创建、尚未开始时取当前时间 */
function shimmerStartTime(element: HTMLElement) {
  if (typeof element.getAnimations === "function") {
    for (const animation of element.getAnimations()) {
      if ((animation as CSSAnimation).animationName !== SHIMMER_NAME) continue;
      const start = animation.startTime;
      if (typeof start === "number") return start;
      break;
    }
  }
  return timelineNow();
}

/**
 * 把微光元素的相位对齐到全局的对角线波：
 * 局部时间 = 当前时间 − 起始时间 − delay，令它与 当前时间 − (x + y) × 速度 同余，
 * 取 (−周期, 0] 内的负延迟，动画不会等待。
 */
function shimmerDelay(element: HTMLElement, diagonal: number) {
  const offset =
    (diagonal * SHIMMER_MS_PER_PX - shimmerStartTime(element)) % SHIMMER_PERIOD;
  return ((offset + SHIMMER_PERIOD) % SHIMMER_PERIOD) - SHIMMER_PERIOD;
}

function writeShimmerDelay(element: HTMLElement, delay: number) {
  const value = `${Math.round(delay)}ms`;
  if (element.style.getPropertyValue("--qy-masonry-wave") !== value) {
    element.style.setProperty("--qy-masonry-wave", value);
  }
}

/** 元素左上角相对祖先的 x + y（不受 transform 影响） */
function diagonalWithin(element: HTMLElement, ancestor: HTMLElement) {
  let sum = 0;
  let node: HTMLElement | null = element;
  while (node && node !== ancestor) {
    sum += node.offsetLeft + node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  if (node === ancestor) return sum;
  const a = ancestor.getBoundingClientRect();
  const b = element.getBoundingClientRect();
  return b.left - a.left + (b.top - a.top);
}

/** 瀑布流之外单独使用的微光元素按自身在页面中的位置同步 */
function syncStandaloneShimmer(element: HTMLElement) {
  if (prefersReducedMotion()) return;
  const rect = element.getBoundingClientRect();
  writeShimmerDelay(
    element,
    shimmerDelay(element, rect.left + window.scrollX + rect.top + window.scrollY),
  );
}

/**
 * 内容层当前的 translateY 与 scale，作为退场 / 恢复动画的起点。
 * 计算样式是 `matrix(...)`，还原成与目标 `translateY() scale()` 同结构的字符串，按分量插值。
 */
function currentTransform(element: HTMLElement) {
  const match = /matrix\(([^)]+)\)/.exec(getComputedStyle(element).transform);
  if (!match) return ENTER_TO;
  const [a, b, , , , f] = match[1].split(",").map((part) => parseFloat(part));
  const scale = Math.hypot(a, b);
  if (!Number.isFinite(scale) || !Number.isFinite(f)) return ENTER_TO;
  return `translateY(${round2(f)}px) scale(${Math.round(scale * 1000) / 1000})`;
}

/** 打断内容层上进行中的动画前读取它此刻的样子，作为下一段动画的起点 */
function currentContentStyle(element: HTMLElement): Keyframe {
  const style = getComputedStyle(element);
  return {
    opacity: style.opacity,
    transform: currentTransform(element),
    filter: style.filter === "none" ? "blur(0px)" : style.filter,
  };
}

const bezier = (ease: readonly number[]) => `cubic-bezier(${ease.join(", ")})`;

/** 内容层上的一组原生动画 */
interface ContentAnimation {
  stop: () => void;
  then: (onFinish: () => void) => void;
}

/**
 * 入场与退场直接用 WAAPI 播放，起点由 fill 提供，不写入内联样式：
 * 入场结束时动画移除、元素回到自身样式（就是终点），中间不会有一帧露出起点；
 * 退场以 fill: forwards 停在终点直到卸载。
 * Motion 的元素动画在结束时先取消 WAAPI、下一帧才写入终值，这一帧露出的内联起点
 * （透明、缩小、下移）就是加载完成或加载更多后整块闪一下、抖一下的来源。
 */
function playContent(
  element: HTMLElement,
  tracks: ReadonlyArray<readonly [Keyframe[], KeyframeAnimationOptions]>,
): ContentAnimation {
  if (typeof element.animate !== "function") {
    return { stop: () => {}, then: (onFinish) => queueMicrotask(onFinish) };
  }
  const animations = tracks.map(([keyframes, options]) =>
    element.animate(keyframes, options),
  );
  return {
    stop: () => animations.forEach((animation) => animation.cancel()),
    then: (onFinish) => {
      Promise.all(animations.map((animation) => animation.finished)).then(
        onFinish,
        () => {},
      );
    },
  };
}

/** 从屏幕上的当前偏移与速度出发，以弹簧归零 */
function springOffset(value: MotionValue<number>, offset: number) {
  const velocity = value.getVelocity();
  value.jump(offset);
  if (offset !== 0) animate(value, 0, { ...LAYOUT_SPRING, velocity });
}

const TABBABLE = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "summary",
  '[contenteditable=""]',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * 删除的项内有焦点时，把焦点移到 DOM 顺序上的下一个可聚焦元素（即 Tab 的下一站），
 * 没有则移到上一个，都没有时聚焦列表本身，键盘与读屏用户不会掉回页面开头。
 */
function moveFocusOut(layer: HTMLElement, list: HTMLElement) {
  const candidates = Array.from(list.querySelectorAll<HTMLElement>(TABBABLE)).filter(
    (element) =>
      !layer.contains(element) &&
      !element.closest("[inert]") &&
      element.getClientRects().length > 0,
  );
  const following = candidates.find(
    (element) =>
      layer.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING,
  );
  const target = following ?? candidates[candidates.length - 1];
  if (target) {
    target.focus({ preventScroll: true });
    if (document.activeElement === target) return;
  }
  list.setAttribute("tabindex", "-1");
  list.addEventListener("blur", () => list.removeAttribute("tabindex"), { once: true });
  list.focus({ preventScroll: true });
}

function assignRef<E>(ref: React.ForwardedRef<E>, node: E | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

function defaultItemKey(item: unknown, index: number): React.Key {
  if (item !== null && typeof item === "object") {
    const record = item as { id?: unknown; key?: unknown };
    if (typeof record.id === "string" || typeof record.id === "number") {
      return record.id;
    }
    if (typeof record.key === "string" || typeof record.key === "number") {
      return record.key;
    }
  }
  warnDev(
    "未提供 getItemKey，且数据项没有 id / key 字段，已退回使用下标作为 key；排序与删除的过渡会错位。",
  );
  return index;
}

/** 瀑布流内部的上下文：项内的微光元素由瀑布流统一对齐相位 */
const MasonryShimmerContext = React.createContext(false);

/* ------------------------------------------------------------------ */
/* 排布引擎：测量、定位与过渡都在 DOM 上直接进行，不经过 React 渲染          */
/* ------------------------------------------------------------------ */

interface EngineOptions {
  keys: readonly string[];
  columns: MasonryResponsive<number> | undefined;
  minColumnWidth: number;
  maxColumns: number;
  gap: MasonryResponsive<number>;
  rowGap: MasonryResponsive<number> | undefined;
  strategy: MasonryStrategy;
  animateLayout: boolean;
  appear: boolean;
  /** React 是否已渲染为绝对定位（data-ready） */
  ready: boolean;
}

interface Metrics extends MasonryLayoutInfo {
  gap: number;
  rowGap: number;
}

/** 本次排布中入场的项（骨架退场按与它重叠最多的入场项对齐时间） */
interface Arrival {
  x: number;
  y: number;
  width: number;
  height: number;
  /** 入场延迟（ms） */
  delay: number;
}

interface CellRecord {
  key: string;
  layer: HTMLDivElement;
  content: HTMLDivElement;
  skeleton: boolean;
  /** 是否在首次排布前就已挂载（受 appear 控制） */
  bornInitial: boolean;
  /** 相对目标位置的偏移，换位置时以弹簧归零 */
  dx: MotionValue<number>;
  dy: MotionValue<number>;
  placed: boolean;
  targetX: number;
  targetY: number;
  /** 已写入的宽度，-1 表示尚未写入 */
  width: number;
  /** 测得的高度，-1 表示尚未测量 */
  height: number;
  transform: string;
  waveSignature: string;
  exiting: boolean;
  token: number;
  animation: ContentAnimation | null;
  /** AnimatePresence 的移除回调（退场结束时调用） */
  onExited: (() => void) | null;
  write: () => void;
  unsubscribe: () => void;
}

class MasonryEngine {
  /** 承载各项的列表元素（role="list"），排布以它的内容区为准 */
  list: HTMLDivElement | null = null;
  sentinel: HTMLElement | null = null;
  options: EngineOptions | null = null;
  /** 是否由服务端渲染的 HTML 水合而来（水合前的近似排布已经绘制过） */
  serverRendered = false;
  onMetrics: ((metrics: MasonryLayoutInfo) => void) | null = null;

  private records = new Map<string, CellRecord>();
  private byLayer = new WeakMap<Element, CellRecord>();
  private pendingRemoval = new Set<string>();
  /** 等本次排布给出入场时间后再淡出的骨架 */
  private skeletonExits: CellRecord[] = [];
  /** 退场时内部仍有焦点的项：排布结束后先移走焦点，再设为 inert */
  private focusRescue = new Set<CellRecord>();
  private width = 0;
  private metrics: Metrics | null = null;
  private notified: MasonryLayoutInfo | null = null;
  private laneKeys: readonly string[] = [];
  private lanes: ReadonlyMap<string, number> = new Map();
  private laneSignature = "";
  private hasLaidOut = false;
  private resizing = false;
  private resizeFrame = 0;
  /** 容器高度同样是「目标 + 偏移」 */
  private heightOffset = motionValue(0);
  private heightTarget = -1;
  private heightWritten = "";
  private unsubscribeHeight: (() => void) | null = null;
  private itemObserver: ResizeObserver | null = null;
  private listObserver: ResizeObserver | null = null;

  /* ---------------- 挂载 ---------------- */

  attach(list: HTMLDivElement, sentinel: HTMLElement | null) {
    this.list = list;
    this.sentinel = sentinel;
    this.width = readContentWidth(list);
    if (typeof ResizeObserver !== "undefined") {
      this.itemObserver = new ResizeObserver(this.handleItemResize);
      this.records.forEach((record) => this.itemObserver?.observe(record.layer));
      this.listObserver = new ResizeObserver(this.handleListResize);
      this.listObserver.observe(list);
    }
    this.unsubscribeHeight = this.heightOffset.on("change", () =>
      frame.render(this.writeHeight),
    );
  }

  detach() {
    this.itemObserver?.disconnect();
    this.listObserver?.disconnect();
    this.itemObserver = null;
    this.listObserver = null;
    this.unsubscribeHeight?.();
    this.unsubscribeHeight = null;
    this.heightOffset.stop();
    cancelAnimationFrame(this.resizeFrame);
    this.resizeFrame = 0;
    this.resizing = false;
    this.list = null;
  }

  register(key: string, layer: HTMLDivElement, content: HTMLDivElement, skeleton: boolean) {
    const existing = this.records.get(key);
    this.pendingRemoval.delete(key);
    // StrictMode 的卸载—重挂会拿回同一个 DOM 节点：沿用原记录，不重复入场。
    if (existing && existing.layer === layer) return;
    if (existing) this.dispose(existing);

    const record: CellRecord = {
      key,
      layer,
      content,
      skeleton,
      bornInitial: !this.hasLaidOut,
      dx: motionValue(0),
      dy: motionValue(0),
      placed: false,
      targetX: 0,
      targetY: 0,
      width: -1,
      height: -1,
      transform: "",
      waveSignature: "",
      exiting: false,
      token: 0,
      animation: null,
      onExited: null,
      write: () => {
        const x = round2(record.targetX + record.dx.get());
        const y = round2(record.targetY + record.dy.get());
        const value = `translate3d(${x}px, ${y}px, 0)`;
        if (value === record.transform) return;
        record.transform = value;
        layer.style.transform = value;
      },
      unsubscribe: () => {},
    };
    const schedule = () => frame.render(record.write);
    const offX = record.dx.on("change", schedule);
    const offY = record.dy.on("change", schedule);
    record.unsubscribe = () => {
      offX();
      offY();
    };
    // 首次排布之后挂载的项总会入场：先藏起来，等排布给出位置后再播放。
    if (!record.bornInitial) content.style.opacity = "0";

    this.records.set(key, record);
    this.byLayer.set(layer, record);
    this.itemObserver?.observe(layer);
  }

  unregister(key: string) {
    this.pendingRemoval.add(key);
    queueMicrotask(() => {
      if (!this.pendingRemoval.delete(key)) return;
      const record = this.records.get(key);
      if (!record) return;
      this.dispose(record);
      this.records.delete(key);
    });
  }

  private dispose(record: CellRecord) {
    record.animation?.stop();
    record.unsubscribe();
    record.dx.destroy();
    record.dy.destroy();
    this.focusRescue.delete(record);
    this.itemObserver?.unobserve(record.layer);
    this.byLayer.delete(record.layer);
  }

  /**
   * 删除：保留在原位置，缩小淡出后再卸载。
   * AnimatePresence 在自己的 layout effect（晚于子组件）中才登记退场的 key，
   * 所以完成回调至少推迟到微任务，不能在这里同步调用，否则会被忽略并卡住后续所有退场。
   */
  exit(key: string, done: () => void) {
    const record = this.records.get(key);
    if (!record) {
      queueMicrotask(done);
      return;
    }
    // 退场途中 AnimatePresence 可能换了新的回调，结束时总是调用最新的一个
    record.onExited = done;
    if (record.exiting) return;
    record.exiting = true;
    const token = ++record.token;
    const { layer, content } = record;
    layer.style.pointerEvents = "none";
    // inert：退出 Tab 顺序与无障碍树。焦点在这一项内时先等排布结束把焦点移到相邻的项，
    // 再设 inert（对含焦点的祖先设 inert 会让焦点直接落到 body）。
    if (layer.contains(document.activeElement)) this.focusRescue.add(record);
    else layer.setAttribute("inert", "");
    if (!record.placed) {
      record.animation?.stop();
      queueMicrotask(() => this.finishExit(record, token));
      return;
    }
    if (record.skeleton) {
      // 骨架等本次排布算出替代它的内容何时入场，再与之交叉淡出（见 flushSkeletonExits）
      this.skeletonExits.push(record);
      queueMicrotask(() => this.flushSkeletonExits([]));
      return;
    }
    // 入场途中被删除：从此刻的样子出发
    const from = currentContentStyle(content);
    record.animation?.stop();
    const timing = {
      duration: 220,
      easing: bezier(EXIT_EASE),
      fill: "forwards",
    } as const;
    const animation = prefersReducedMotion()
      ? playContent(content, [
          [[{ opacity: from.opacity }, { opacity: 0 }], { ...timing, duration: 200 }],
        ])
      : playContent(content, [
          [[from, { opacity: 0, transform: EXIT_TO, filter: "blur(4px)" }], timing],
        ]);
    record.animation = animation;
    animation.then(() => this.finishExit(record, token));
  }

  private finishExit(record: CellRecord, token: number) {
    if (record.exiting && record.token === token) record.onExited?.();
  }

  /** 退场途中又被加回来：从当前状态恢复 */
  restore(key: string) {
    const record = this.records.get(key);
    if (!record || !record.exiting) return;
    record.exiting = false;
    record.onExited = null;
    record.token += 1;
    const { layer, content } = record;
    this.focusRescue.delete(record);
    layer.style.pointerEvents = "";
    layer.removeAttribute("inert");
    const from = currentContentStyle(content);
    record.animation?.stop();
    record.animation = playContent(content, [
      [
        [from, { opacity: 1, transform: ENTER_TO, filter: "blur(0px)" }],
        { duration: 300, easing: bezier(EASE_OUT), fill: "backwards" },
      ],
    ]);
  }

  /**
   * 骨架退场：与替代它的内容交叉淡出。
   * 取与它重叠面积最大的入场项，等该项开始入场后再淡出，整面墙不会先变空再出现内容；
   * 没有重叠的入场项（内容比骨架少、或位置不同）时直接淡出。
   */
  private flushSkeletonExits(arrivals: readonly Arrival[]) {
    if (this.skeletonExits.length === 0) return;
    const queue = this.skeletonExits;
    this.skeletonExits = [];
    for (const record of queue) {
      if (!record.exiting) continue;
      let delay = -1;
      let best = 0;
      for (const arrival of arrivals) {
        const overlapX =
          Math.min(record.targetX + record.width, arrival.x + arrival.width) -
          Math.max(record.targetX, arrival.x);
        const overlapY =
          Math.min(record.targetY + record.height, arrival.y + arrival.height) -
          Math.max(record.targetY, arrival.y);
        const area = Math.max(0, overlapX) * Math.max(0, overlapY);
        if (area > best) {
          best = area;
          delay = arrival.delay;
        }
      }
      const token = record.token;
      // 骨架可能还在淡入：从此刻的透明度出发，等待期间停在原处（fill: both）
      const from = getComputedStyle(record.content).opacity;
      record.animation?.stop();
      const animation = playContent(record.content, [
        [
          [{ opacity: from }, { opacity: 0 }],
          delay >= 0
            ? {
                duration: 300,
                delay: delay + 50,
                easing: bezier(CROSSFADE_EASE),
                fill: "both",
              }
            : { duration: 200, easing: bezier(EXIT_EASE), fill: "forwards" },
        ],
      ]);
      record.animation = animation;
      animation.then(() => this.finishExit(record, token));
    }
  }

  /** 把仍在退场项内的焦点移到 DOM 顺序上的下一个可聚焦元素（没有则上一个、再没有则列表本身） */
  private rescueFocus() {
    if (this.focusRescue.size === 0) return;
    const records = [...this.focusRescue];
    this.focusRescue.clear();
    for (const record of records) {
      if (!record.exiting) continue;
      const list = this.list;
      if (list && record.layer.contains(document.activeElement)) {
        moveFocusOut(record.layer, list);
      }
      record.layer.setAttribute("inert", "");
    }
  }

  /* ---------------- 排布 ---------------- */

  update(options: EngineOptions) {
    this.options = options;
    if (options.ready) this.layout();
    else this.notify(this.resolveMetrics());
    // 没有完成排布时（如尚未测得宽度）本次提交中的退场也要处理
    this.flushSkeletonExits([]);
    this.rescueFocus();
  }

  private resolveMetrics(): Metrics | null {
    const options = this.options;
    const width = this.width;
    if (!options || width <= 0) return null;
    const gap = Math.max(0, pickResponsive(options.gap, width) || 0);
    const rowGap = Math.max(
      0,
      options.rowGap === undefined ? gap : pickResponsive(options.rowGap, width) || 0,
    );
    let columns: number;
    if (options.columns !== undefined) {
      columns = Math.round(pickResponsive(options.columns, width) || 1);
    } else {
      // 非有限值（如清空的数字输入得到的 NaN）退回默认值，不让列数变成 NaN
      const min = Number.isFinite(options.minColumnWidth)
        ? Math.max(1, options.minColumnWidth)
        : 220;
      const max = Number.isFinite(options.maxColumns)
        ? Math.max(1, Math.round(options.maxColumns))
        : 6;
      columns = clamp(Math.floor((width + gap) / (min + gap)), 1, max);
    }
    if (!Number.isFinite(columns) || columns < 1) columns = 1;
    const columnWidth = Math.max(0, (width - gap * (columns - 1)) / columns);
    return { width, columns, columnWidth, gap, rowGap };
  }

  private notify(metrics: Metrics | null) {
    if (!metrics || !this.onMetrics) return;
    const previous = this.notified;
    if (
      previous &&
      previous.columns === metrics.columns &&
      Math.abs(previous.columnWidth - metrics.columnWidth) < 0.01 &&
      Math.abs(previous.width - metrics.width) < 0.01
    ) {
      return;
    }
    const info = {
      columns: metrics.columns,
      columnWidth: metrics.columnWidth,
      width: metrics.width,
    };
    this.notified = info;
    this.onMetrics(info);
  }

  layout() {
    const list = this.list;
    const options = this.options;
    if (!list || !options || !options.ready) return;
    const metrics = this.resolveMetrics();
    if (!metrics) return;
    const previous = this.metrics;
    const columnsChanged = previous !== null && previous.columns !== metrics.columns;
    this.metrics = metrics;

    // 1. 参与排布的项（退场中的项保留在原位置，不再参与）
    const active: CellRecord[] = [];
    for (const key of options.keys) {
      const record = this.records.get(key);
      if (record && !record.exiting) active.push(record);
    }

    // 2. 写入列宽，读取需要更新的高度（一次强制布局）
    const stale: CellRecord[] = [];
    for (const record of active) {
      if (record.width !== metrics.columnWidth) {
        record.layer.style.width = `${metrics.columnWidth}px`;
        record.width = metrics.columnWidth;
        stale.push(record);
      } else if (record.height < 0) {
        stale.push(record);
      }
    }
    for (const record of stale) record.height = measureHeight(record.layer);

    // 3. 纯函数排布：列数或策略变化时清空列缓存
    const keys = active.map((record) => record.key);
    const signature = `${metrics.columns}|${options.strategy}`;
    const result = computeMasonryLayout({
      keys,
      heights: new Map(active.map((record) => [record.key, record.height])),
      previous:
        signature === this.laneSignature
          ? { keys: this.laneKeys, lanes: this.lanes }
          : null,
      columns: metrics.columns,
      columnWidth: metrics.columnWidth,
      gap: metrics.gap,
      rowGap: metrics.rowGap,
      strategy: options.strategy,
    });
    this.laneSignature = signature;
    this.laneKeys = keys;
    this.lanes = result.lanes;

    // 4. 读：目标位置与微光相位。微光要读元素偏移与动画起始时间，
    //    全部放在任何写入之前，整次排布只强制布局一次。
    const reduced = prefersReducedMotion();
    const instant = !options.animateLayout || reduced;
    // 连续拖动窗口：宽度变了但列数没变，直接跟手；仍在弹簧途中的项改为追向新目标。
    const follow = this.resizing && !columnsChanged;
    const targets: Array<[CellRecord, number, number]> = [];
    const waves: Array<[HTMLElement, number]> = [];
    for (const record of active) {
      const position = result.positions.get(record.key);
      if (!position) continue;
      const x = snap(position.x);
      const y = snap(position.y);
      targets.push([record, x, y]);
      if (reduced) continue;
      const waveSignature = `${x},${y},${record.width},${record.height}`;
      if (waveSignature === record.waveSignature) continue;
      record.waveSignature = waveSignature;
      record.layer
        .querySelectorAll<HTMLElement>("[data-qy-masonry-shimmer]")
        .forEach((element) => {
          waves.push([element, x + y + diagonalWithin(element, record.layer)]);
        });
    }
    const phases = waves.map(
      ([element, diagonal]) => [element, shimmerDelay(element, diagonal)] as const,
    );

    // 5. 写：微光相位与位置
    for (const [element, delay] of phases) writeShimmerDelay(element, delay);
    const placedNow: CellRecord[] = [];
    let moved = false;
    for (const [record, x, y] of targets) {
      if (!record.placed) {
        record.placed = true;
        record.targetX = x;
        record.targetY = y;
        record.dx.jump(0);
        record.dy.jump(0);
        record.write();
        record.layer.setAttribute("data-placed", "");
        placedNow.push(record);
      } else if (x !== record.targetX || y !== record.targetY) {
        if (this.moveTo(record, x, y, instant, follow)) moved = true;
      }
    }

    // 6. 入场：同一批按屏幕位置自上而下错开。
    //    同一次排布里已有项正沿弹簧移动（筛选、插入）时整体晚一点出现，让移动的项先让开位置。
    const entering = placedNow.filter((record) =>
      record.bornInitial
        ? options.appear && !(record.skeleton && this.serverRendered)
        : true,
    );
    const lead = moved && !reduced ? MOVE_LEAD : 0;
    const arrivals: Arrival[] = [];
    entering
      .filter((record) => !record.skeleton)
      .sort((a, b) => a.targetY - b.targetY || a.targetX - b.targetX)
      .forEach((record, index) => {
        const delay = reduced
          ? 0
          : lead + Math.min(index * ENTER_STAGGER, ENTER_STAGGER_MAX);
        this.enter(record, delay, reduced);
        arrivals.push({
          x: record.targetX,
          y: record.targetY,
          width: record.width,
          height: record.height,
          delay,
        });
      });
    entering
      .filter((record) => record.skeleton)
      .forEach((record) => this.enter(record, 0, reduced));

    // 7. 容器高度与加载哨兵：高度与各项用同一个弹簧，跟手拖动时同样只移动目标
    const height = Math.ceil(result.height);
    const previousHeight = this.heightTarget;
    this.heightTarget = height;
    if (previousHeight < 0 || instant) {
      this.heightOffset.jump(0);
    } else if (height !== previousHeight && !follow) {
      springOffset(
        this.heightOffset,
        previousHeight + this.heightOffset.get() - height,
      );
    }
    this.writeHeight();

    const sentinel = this.sentinel;
    if (sentinel) {
      const lane = shortestLane(result.laneBottoms);
      sentinel.style.top = `${result.laneBottoms[lane]}px`;
      sentinel.style.left = `${lane * (metrics.columnWidth + metrics.gap)}px`;
    }

    this.hasLaidOut = true;
    this.flushSkeletonExits(arrivals);
    this.notify(metrics);
  }

  /** 移动到新位置；返回是否启动了弹簧 */
  private moveTo(
    record: CellRecord,
    x: number,
    y: number,
    instant: boolean,
    follow: boolean,
  ) {
    // 屏幕上的当前位置
    const fromX = record.targetX + record.dx.get();
    const fromY = record.targetY + record.dy.get();
    record.targetX = x;
    record.targetY = y;
    if (instant) {
      record.dx.jump(0);
      record.dy.jump(0);
      record.write();
      return false;
    }
    // 连续拖动宽度（列数未变）：只移动目标，仍在途中的偏移继续自己衰减
    if (follow) {
      record.write();
      return false;
    }
    const animating = record.dx.isAnimating() || record.dy.isAnimating();
    const offsetX = fromX - x;
    const offsetY = fromY - y;
    if (!animating && Math.abs(offsetX) < 1 && Math.abs(offsetY) < 1) {
      record.dx.jump(0);
      record.dy.jump(0);
      record.write();
      return false;
    }
    springOffset(record.dx, offsetX);
    springOffset(record.dy, offsetY);
    return true;
  }

  private enter(record: CellRecord, delay: number, reduced: boolean) {
    const element = record.content;
    record.token += 1;
    record.animation?.stop();
    // fill: backwards 在延迟期间就提供起点；结束后元素回到自身样式，不留内联值
    const easing = bezier(EASE_OUT);
    record.animation =
      record.skeleton || reduced
        ? playContent(element, [
            [
              [{ opacity: 0 }, { opacity: 1 }],
              { duration: record.skeleton ? 300 : 200, easing, fill: "backwards" },
            ],
          ])
        : playContent(element, [
            [
              [{ opacity: 0 }, { opacity: 1 }],
              { duration: 400, delay, easing, fill: "backwards" },
            ],
            [
              [{ filter: "blur(6px)" }, { filter: "blur(0px)" }],
              { duration: 450, delay, easing, fill: "backwards" },
            ],
            [
              [{ transform: ENTER_FROM }, { transform: ENTER_TO }],
              {
                duration: 600,
                delay,
                easing: bezier(ENTER_EASE),
                fill: "backwards",
              },
            ],
          ]);
    // register() 为等待排布的项写入的 opacity: 0 交给 fill 接管（同一任务内，不会露出一帧）
    element.style.opacity = "";
  }

  private writeHeight = () => {
    const list = this.list;
    if (!list) return;
    const value = `${Math.max(0, round2(this.heightTarget + this.heightOffset.get()))}px`;
    if (value === this.heightWritten) return;
    this.heightWritten = value;
    list.style.height = value;
  };

  private markResizing() {
    this.resizing = true;
    cancelAnimationFrame(this.resizeFrame);
    this.resizeFrame = requestAnimationFrame(() => {
      this.resizeFrame = 0;
      this.resizing = false;
    });
  }

  private handleListResize = (entries: ResizeObserverEntry[]) => {
    const entry = entries[entries.length - 1];
    if (!entry) return;
    const size = entry.contentBoxSize?.[0];
    const width = size ? size.inlineSize : entry.contentRect.width;
    if (Math.abs(width - this.width) < 0.01) return;
    this.width = width;
    if (width <= 0) return;
    this.markResizing();
    if (this.options?.ready) this.layout();
    else this.notify(this.resolveMetrics());
  };

  private handleItemResize = (entries: ResizeObserverEntry[]) => {
    let changed = false;
    for (const entry of entries) {
      const record = this.byLayer.get(entry.target);
      if (!record || record.exiting || record.width < 0) continue;
      const size = entry.borderBoxSize?.[0];
      const height = size ? size.blockSize : entry.contentRect.height;
      if (Math.abs(height - record.height) > 0.01) {
        record.height = height;
        changed = true;
      }
    }
    if (changed) this.layout();
  };
}

/* ------------------------------------------------------------------ */
/* 单元：定位层 + 内容层                                                  */
/* ------------------------------------------------------------------ */

interface MasonryCellProps {
  id: string;
  engine: MasonryEngine;
  skeleton: boolean;
  appear: boolean;
  className?: string;
  children: React.ReactNode;
}

const MasonryCell = React.memo(function MasonryCell({
  id,
  engine,
  skeleton,
  appear,
  className,
  children,
}: MasonryCellProps) {
  const layerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [isPresent, safeToRemove] = usePresence();

  React.useLayoutEffect(() => {
    const layer = layerRef.current;
    const content = contentRef.current;
    if (!layer || !content) return;
    engine.register(id, layer, content, skeleton);
    return () => engine.unregister(id);
  }, [engine, id, skeleton]);

  React.useLayoutEffect(() => {
    if (isPresent) engine.restore(id);
    else engine.exit(id, safeToRemove);
  }, [engine, id, isPresent, safeToRemove]);

  // 定位层每帧可能被写 transform：不挂类名、子元素不依赖 inherit（见 PIT-0010）。
  // 入场与退场放在内容层，与位置互不覆盖。
  return (
    <div ref={layerRef} role="none" data-qy-masonry-layer="">
      <div
        ref={contentRef}
        role={skeleton ? undefined : "listitem"}
        aria-hidden={skeleton || undefined}
        data-slot={skeleton ? undefined : "masonry-item"}
        data-qy-masonry-skeleton={skeleton ? "" : undefined}
        data-qy-masonry-appear={appear && !skeleton ? "" : undefined}
        className={className}
      >
        {children}
      </div>
    </div>
  );
});

interface CellDescriptor {
  key: string;
  node: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/* Masonry                                                              */
/* ------------------------------------------------------------------ */

const subscribeNothing = () => () => {};
const onClient = () => true;
const onServer = () => false;

function MasonryInner<T>(
  {
    items,
    getItemKey,
    renderItem,
    children,
    minColumnWidth = 220,
    maxColumns = 6,
    columns,
    gap = 16,
    rowGap,
    strategy = "shortest",
    loading = false,
    skeletonCount,
    renderSkeleton,
    hasMore = true,
    onLoadMore,
    loadMoreOffset = 800,
    scrollRoot,
    appear = true,
    animateLayout = true,
    labels,
    itemClassName,
    onLayoutChange,
    className,
    style,
    ...props
  }: MasonryProps<T>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const [engine] = React.useState(() => new MasonryEngine());
  const [layoutInfo, setLayoutInfo] = React.useState<MasonryLayoutInfo | null>(null);
  // 水合时取服务端快照（false）：说明服务端 HTML 已经绘制过一帧近似排布
  const isClientRender = React.useSyncExternalStore(
    subscribeNothing,
    onClient,
    onServer,
  );
  const [serverRendered] = React.useState(() => !isClientRender);
  const listRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const statusRef = React.useRef<HTMLSpanElement>(null);
  const mergedLabels = { ...DEFAULT_MASONRY_LABELS, ...labels };
  const ready = layoutInfo !== null;

  // 真实项：只在数据或渲染函数变化时重新生成节点，内部状态变化（列宽）不会重渲染各项。
  const itemCells = React.useMemo<CellDescriptor[]>(() => {
    const seen = new Set<string>();
    const unique = (key: string) => {
      if (!seen.has(key)) {
        seen.add(key);
        return key;
      }
      warnDev(`存在重复的 key「${key.slice(2)}」，重复项的过渡可能错位。`);
      let suffix = 1;
      while (seen.has(`${key}#${suffix}`)) suffix += 1;
      seen.add(`${key}#${suffix}`);
      return `${key}#${suffix}`;
    };
    if (items) {
      return items.map((item, index) => ({
        key: unique(`i:${String((getItemKey ?? defaultItemKey)(item, index))}`),
        node: renderItem ? renderItem(item, index) : (item as React.ReactNode),
      }));
    }
    return React.Children.toArray(children).map((child, index) => {
      const key =
        React.isValidElement(child) && child.key != null
          ? String(child.key)
          : String(index);
      if (!key.startsWith(".$")) {
        warnDev("children 模式下每个子元素都需要稳定的 key，否则排序与删除的过渡会错位。");
      }
      return { key: unique(`c:${key}`), node: child };
    });
  }, [items, getItemKey, renderItem, children]);
  const itemCount = itemCells.length;

  // 骨架：排在真实项之后的虚拟项，同样走最短列优先，加载更多时自然落在最短的几列底部。
  // key 带上当前的项数：每一轮加载的骨架各自独立，上一轮的骨架在原位置与新内容交叉淡出，
  // 不会被下一轮复用而滑过刚到达的内容；同一轮内（项数不变）重试时原地保留。
  const skeletonColumns =
    layoutInfo?.columns ??
    (typeof columns === "number" && Number.isFinite(columns)
      ? Math.max(1, Math.round(columns))
      : 3);
  const skeletonWidth =
    layoutInfo?.columnWidth ?? (Number.isFinite(minColumnWidth) ? minColumnWidth : 220);
  const skeletonTotal = loading
    ? Math.max(
        0,
        Math.round(skeletonCount ?? skeletonColumns * (itemCount === 0 ? 3 : 2)) || 0,
      )
    : 0;
  const skeletonCells = React.useMemo<CellDescriptor[]>(
    () =>
      Array.from({ length: skeletonTotal }, (_, index) => ({
        key: `s:${itemCount}:${index}`,
        node: renderSkeleton ? (
          renderSkeleton(index, { width: skeletonWidth, columns: skeletonColumns })
        ) : (
          <MasonrySkeleton
            className="rounded-xl"
            style={{
              height: Math.round(
                skeletonWidth * SKELETON_RATIOS[index % SKELETON_RATIOS.length],
              ),
            }}
          />
        ),
      })),
    [skeletonTotal, itemCount, renderSkeleton, skeletonWidth, skeletonColumns],
  );

  const keys = React.useMemo(
    () => [...itemCells, ...skeletonCells].map((cell) => cell.key),
    [itemCells, skeletonCells],
  );

  React.useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    engine.serverRendered = serverRendered;
    engine.onMetrics = (info) => setLayoutInfo(info);
    engine.attach(list, sentinelRef.current);
    return () => {
      engine.onMetrics = null;
      engine.detach();
    };
  }, [engine, serverRendered]);

  // 每次提交后同步排布：新挂载的项在首帧绘制前就有正确位置。
  React.useLayoutEffect(() => {
    engine.update({
      keys,
      columns,
      minColumnWidth,
      maxColumns,
      gap,
      rowGap,
      strategy,
      animateLayout,
      appear,
      ready,
    });
  });

  const onLayoutChangeRef = React.useRef(onLayoutChange);
  React.useEffect(() => {
    onLayoutChangeRef.current = onLayoutChange;
  });
  React.useEffect(() => {
    if (layoutInfo) onLayoutChangeRef.current?.(layoutInfo);
  }, [layoutInfo]);

  // 状态文本在挂载后才写入：挂载时就带着文本的 live region 多数读屏器不会播报
  const statusText = loading ? mergedLabels.loading : "";
  React.useEffect(() => {
    const status = statusRef.current;
    if (status && status.textContent !== statusText) status.textContent = statusText;
  }, [statusText]);

  /* ---------------- 无限加载 ---------------- */

  const inView = useInView(sentinelRef, {
    root: scrollRoot,
    margin: `0px 0px ${loadMoreOffset}px 0px` as const,
  });
  const onLoadMoreRef = React.useRef(onLoadMore);
  React.useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  });
  const loadStateRef = React.useRef({
    pending: false,
    sawLoading: false,
    /** 发起请求时的项数与最后一项的 key */
    count: 0,
    lastKey: "",
    /** 这一轮加载期间数据是否变过（新增、清空、整体替换） */
    dirty: false,
    inView: false,
  });
  const lastItemKey = itemCount > 0 ? itemCells[itemCount - 1].key : "";

  React.useEffect(() => {
    const state = loadStateRef.current;
    const enteredView = inView && !state.inView;
    state.inView = inView;
    const request = () => {
      const load = onLoadMoreRef.current;
      if (!load) return;
      state.pending = true;
      state.sawLoading = false;
      state.dirty = false;
      state.count = itemCount;
      state.lastKey = lastItemKey;
      load();
    };

    // 记录这一轮加载期间数据是否变过。只比较结束时的项数不够：
    // 加载途中被清空（重新加载、换了搜索条件）后到达的第一页可能恰好与之前一样多。
    if (
      state.pending &&
      (itemCount !== state.count || lastItemKey !== state.lastKey)
    ) {
      state.dirty = true;
    }

    if (loading) {
      if (state.pending) state.sawLoading = true;
      return;
    }
    if (state.pending) {
      if (state.sawLoading || state.dirty) {
        // 一轮加载结束：哨兵仍在范围内（内容不够填满）就继续加载。
        // 数据没有变化（如请求失败）时不自动重试，等哨兵再次进入视口。
        state.pending = false;
        if (
          state.dirty &&
          itemCount > 0 &&
          hasMore &&
          isSentinelNear(sentinelRef.current, scrollRoot?.current, loadMoreOffset)
        ) {
          request();
        }
        return;
      }
      if (!enteredView) return;
      state.pending = false;
    }
    if (inView && hasMore) request();
  }, [inView, loading, hasMore, itemCount, lastItemKey, scrollRoot, loadMoreOffset]);

  /* ---------------- 渲染 ---------------- */

  const rootStyle = {
    // 服务端与水合前不知道容器宽度：用 CSS 多列近似排布，无 JS 时也能看
    "--qy-masonry-columns":
      columns === undefined
        ? String(Math.max(1, Math.round(maxColumns)))
        : String(Math.max(1, Math.round(firstResponsive(columns)))),
    "--qy-masonry-min-width":
      columns === undefined ? `${minColumnWidth}px` : "auto",
    "--qy-masonry-gap": `${firstResponsive(gap)}px`,
    "--qy-masonry-row-gap": `${firstResponsive(rowGap ?? gap)}px`,
    ...style,
  } as React.CSSProperties;

  // 根元素只是外壳（className、style、ref、padding 都作用在这里）；
  // 列表放在内层，只包含各项，状态文本放在列表与 aria-busy 之外。
  return (
    <div
      ref={forwardedRef}
      data-slot="masonry"
      data-ready={ready ? "" : undefined}
      className={cn("qy-masonry relative", className)}
      style={rootStyle}
      {...props}
    >
      <MasonryStyles />
      <div
        ref={listRef}
        role="list"
        aria-busy={loading || undefined}
        data-slot="masonry-list"
        className="qy-masonry-list"
      >
        <MasonryShimmerContext.Provider value={true}>
          <AnimatePresence>
            {itemCells.map((cell) => (
              <MasonryCell
                key={cell.key}
                id={cell.key}
                engine={engine}
                skeleton={false}
                appear={appear}
                className={itemClassName}
              >
                {cell.node}
              </MasonryCell>
            ))}
            {skeletonCells.map((cell) => (
              <MasonryCell
                key={cell.key}
                id={cell.key}
                engine={engine}
                skeleton
                appear={appear}
              >
                {cell.node}
              </MasonryCell>
            ))}
          </AnimatePresence>
        </MasonryShimmerContext.Provider>
        <div ref={sentinelRef} aria-hidden data-qy-masonry-sentinel="" />
      </div>
      <span ref={statusRef} role="status" className="sr-only" />
    </div>
  );
}

function isSentinelNear(
  sentinel: HTMLElement | null,
  scroller: Element | null | undefined,
  offset: number,
) {
  if (!sentinel || !sentinel.isConnected || !sentinel.offsetParent) return false;
  const rect = sentinel.getBoundingClientRect();
  const bounds = scroller
    ? scroller.getBoundingClientRect()
    : { top: 0, bottom: window.innerHeight };
  return rect.top <= bounds.bottom + offset && rect.bottom >= bounds.top;
}

/**
 * Masonry — 瀑布流
 *
 * 按容器宽度自适应列数的瀑布流，开箱即用、过渡自然：
 * - 列数按容器宽度（不是视口）计算，也支持固定列数与容器宽度断点
 * - 稳定列：已排进某一列的项保持在该列，高度变化只让同列下方的项平移
 * - 骨架屏：首屏铺满高度错落的骨架，加载更多时骨架落在最短的几列底部；
 *   整面瀑布流共享一道沿对角线扫过的微光；内容到达时每块骨架与替代它的内容交叉淡出
 * - 新项上浮淡入并按屏幕位置自上而下错开；列数变化、筛选、排序、增删时沿弹簧滑到新位置，
 *   删除的项在原位置缩小淡出
 * - 最短一列见底时触发 `onLoadMore` 无限加载；尊重减少动态效果
 * - 无障碍：内层列表 `role="list"`、每项 `role="listitem"`，DOM 顺序即数据顺序；
 *   删除的项立即设为 `inert`，若焦点在其中则移到下一个可聚焦元素
 *
 * 根元素只是外壳：`className`、`style`、`ref` 与其余 HTML 属性都作用在它上面，padding、border 均可使用。
 * 配合 `MasonryImage`（保留宽高比占位、加载后柔和淡入）与 `MasonrySkeleton` 使用。
 *
 * @example
 * ```tsx
 * <Masonry
 *   items={photos}
 *   getItemKey={(photo) => photo.id}
 *   renderItem={(photo) => (
 *     <MasonryImage
 *       src={photo.src}
 *       alt={photo.title}
 *       width={photo.width}
 *       height={photo.height}
 *       className="rounded-xl"
 *     />
 *   )}
 *   loading={isLoading}
 *   hasMore={hasMore}
 *   onLoadMore={loadMore}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // children 模式：每个带 key 的子元素是一项
 * <Masonry minColumnWidth={260} gap={12}>
 *   {notes.map((note) => (
 *     <NoteCard key={note.id} note={note} />
 *   ))}
 * </Masonry>
 * ```
 */
export const Masonry = React.forwardRef(MasonryInner) as <T>(
  props: MasonryProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;

/* ------------------------------------------------------------------ */
/* MasonrySkeleton                                                      */
/* ------------------------------------------------------------------ */

/** MasonrySkeleton 组件的属性 */
export interface MasonrySkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 宽高比（宽 / 高），如 `4 / 3`；也可以直接用 className 或 style 指定高度 */
  aspectRatio?: number;
  /** 叠在骨架上的内容（如居中的图标），可选 */
  children?: React.ReactNode;
}

/**
 * MasonrySkeleton — 带同步微光的骨架块
 *
 * - 尺寸、圆角、底色都可以用 className 覆盖，也可以传 `aspectRatio`
 * - 在 `renderSkeleton` 中组合多块（封面 + 标题 + 文字行）时，
 *   各块按自己在瀑布流中的位置对齐相位，仍是整面同步的一道对角线波
 * - 在瀑布流之外单独使用时按自身在页面中的位置同步
 * - 系统开启减少动态效果时不扫光，只保留静态底色
 *
 * @example
 * ```tsx
 * <Masonry
 *   loading
 *   renderSkeleton={() => (
 *     <div className="space-y-2">
 *       <MasonrySkeleton aspectRatio={4 / 3} className="rounded-xl" />
 *       <MasonrySkeleton className="h-4 w-2/3 rounded" />
 *     </div>
 *   )}
 * />
 * ```
 */
export const MasonrySkeleton = React.forwardRef<HTMLDivElement, MasonrySkeletonProps>(
  ({ aspectRatio, className, style, children, ...props }, ref) => {
    const inMasonry = React.useContext(MasonryShimmerContext);
    const localRef = React.useRef<HTMLDivElement | null>(null);
    const setRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        localRef.current = node;
        assignRef(ref, node);
      },
      [ref],
    );

    React.useLayoutEffect(() => {
      if (inMasonry || !localRef.current) return;
      syncStandaloneShimmer(localRef.current);
    }, [inMasonry]);

    return (
      <div
        ref={setRef}
        aria-hidden
        data-slot="masonry-skeleton"
        data-qy-masonry-shimmer=""
        className={cn("qy-masonry-shimmer rounded-lg bg-foreground/6", className)}
        style={aspectRatio ? { aspectRatio, ...style } : style}
        {...props}
      >
        <MasonryStyles />
        {children}
      </div>
    );
  },
);

MasonrySkeleton.displayName = "MasonrySkeleton";

/* ------------------------------------------------------------------ */
/* MasonryImage                                                         */
/* ------------------------------------------------------------------ */

/** MasonryImage 组件的属性 */
export interface MasonryImageProps
  extends Omit<
    React.ImgHTMLAttributes<HTMLImageElement>,
    "width" | "height" | "placeholder"
  > {
  /** 原图宽度，与 `height` 一起只用来得出宽高比 */
  width?: number;
  /** 原图高度，与 `width` 一起只用来得出宽高比 */
  height?: number;
  /**
   * 宽高比（宽 / 高）。传入后优先于 `width` / `height`。
   * 两者都不传时加载前按 4 : 3 占位，加载后改为图片的真实比例（同列下方的项随之平移）。
   */
  aspectRatio?: number;
  /**
   * 图片的 object-fit
   * @default "cover"
   */
  fit?: React.CSSProperties["objectFit"];
  /**
   * 加载前的占位
   * - `"shimmer"`：与瀑布流骨架同步的微光
   * - `"none"`：不显示占位
   * - 其他字符串：作为占位的背景色（任意 CSS 颜色）
   * @default "shimmer"
   */
  placeholder?: "shimmer" | "none" | (string & {});
  /**
   * 加载失败时显示的内容，放在铺满容器、内容居中、`bg-muted` 底色的一层中。
   * 默认是一个图片图标，并以视觉隐藏的方式保留 `alt`。
   */
  fallback?: React.ReactNode;
  /** 外层容器（决定圆角、宽高比占位）的类名；`style` 与 `ref` 同样作用在外层容器上 */
  className?: string;
  /** 内部 `<img>` 的类名；其余未列出的 img 属性（如 `srcSet`、`sizes`）透传给内部 `<img>` */
  imgClassName?: string;
  /**
   * 原生懒加载
   * @default "lazy"
   */
  loading?: "lazy" | "eager";
  /**
   * 原生图片解码方式
   * @default "async"
   */
  decoding?: "async" | "sync" | "auto";
}

type ImageStatus = "loading" | "loaded" | "error";

const FALLBACK_RATIO = 4 / 3;

/**
 * MasonryImage — 瀑布流里的图片
 *
 * - 外层按宽高比占位，加载前后高度不变，瀑布流不会因为图片加载而重排
 * - 加载前显示与骨架同步的微光；加载完成后从模糊、略放大柔和地淡入（约 600ms）
 * - 已在缓存中的图片直接显示，不播放过渡
 * - 加载失败显示 `fallback`（并停止占位的微光），不留下破图标
 * - 原生 `<img>`（`decoding="async"`、默认懒加载），不依赖任何框架的图片组件
 * - `className`、`style`、`ref` 作用在外层容器；其余 img 属性透传给内部 `<img>`
 *
 * @example
 * ```tsx
 * <MasonryImage
 *   src={photo.src}
 *   alt={photo.title}
 *   width={1200}
 *   height={800}
 *   className="rounded-xl"
 * />
 * ```
 */
export const MasonryImage = React.forwardRef<HTMLDivElement, MasonryImageProps>(
  (
    {
      src,
      alt,
      width,
      height,
      aspectRatio,
      fit = "cover",
      placeholder = "shimmer",
      fallback,
      className,
      imgClassName,
      style,
      loading = "lazy",
      decoding = "async",
      onLoad,
      onError,
      ...props
    },
    ref,
  ) => {
    const inMasonry = React.useContext(MasonryShimmerContext);
    const imgRef = React.useRef<HTMLImageElement>(null);
    const placeholderRef = React.useRef<HTMLSpanElement>(null);
    const [status, setStatus] = React.useState<ImageStatus>("loading");
    const [instant, setInstant] = React.useState(false);
    const [naturalRatio, setNaturalRatio] = React.useState<number | null>(null);

    // 挂载或换图时检查缓存：已经加载完成的图片直接显示，不播放过渡。
    React.useLayoutEffect(() => {
      const image = imgRef.current;
      if (image && src && image.complete) {
        if (image.naturalWidth > 0) {
          setNaturalRatio(image.naturalWidth / image.naturalHeight);
          setStatus("loaded");
        } else {
          setStatus("error");
        }
        setInstant(true);
        return;
      }
      setInstant(false);
      setStatus("loading");
    }, [src]);

    React.useLayoutEffect(() => {
      if (inMasonry || !placeholderRef.current) return;
      syncStandaloneShimmer(placeholderRef.current);
    }, [inMasonry]);

    const hintRatio =
      aspectRatio ?? (width && height ? width / height : undefined);
    const ratio =
      hintRatio ?? (status === "loaded" && naturalRatio ? naturalRatio : FALLBACK_RATIO);

    // 加载失败时不再显示占位：失败的图片不该看起来仍在加载
    let placeholderNode: React.ReactNode = null;
    if (status === "error") {
      placeholderNode = null;
    } else if (placeholder === "shimmer") {
      placeholderNode = (
        <span
          ref={placeholderRef}
          aria-hidden
          data-qy-masonry-shimmer=""
          className="qy-masonry-image-placeholder qy-masonry-shimmer absolute inset-0 bg-foreground/6"
        />
      );
    } else if (placeholder !== "none") {
      placeholderNode = (
        <span
          aria-hidden
          className="qy-masonry-image-placeholder absolute inset-0"
          style={{ background: placeholder }}
        />
      );
    }

    return (
      <div
        ref={ref}
        data-slot="masonry-image"
        data-state={status}
        data-instant={instant ? "" : undefined}
        className={cn("relative overflow-hidden", className)}
        style={{ aspectRatio: ratio, ...style }}
      >
        <MasonryStyles />
        {placeholderNode}
        {status === "error" ? (
          <span
            data-slot="masonry-image-fallback"
            className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground"
          >
            {fallback ?? (
              <>
                <ImageOffIcon />
                {alt ? <span className="sr-only">{alt}</span> : null}
              </>
            )}
          </span>
        ) : null}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={loading}
          decoding={decoding}
          className={cn(
            "qy-masonry-image-img absolute inset-0 block size-full",
            imgClassName,
          )}
          style={{ objectFit: fit }}
          onLoad={(event) => {
            const image = event.currentTarget;
            if (image.naturalWidth > 0) {
              setNaturalRatio(image.naturalWidth / image.naturalHeight);
            }
            setStatus("loaded");
            onLoad?.(event);
          }}
          onError={(event) => {
            setStatus("error");
            onError?.(event);
          }}
          {...props}
        />
      </div>
    );
  },
);

MasonryImage.displayName = "MasonryImage";

function ImageOffIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6 opacity-70"
    >
      <line x1="2" x2="22" y1="2" y2="22" />
      <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83" />
      <line x1="13.5" x2="6" y1="13.5" y2="21" />
      <line x1="18" x2="21" y1="12" y2="15" />
      <path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59" />
      <path d="M21 15V5a2 2 0 0 0-2-2H9" />
    </svg>
  );
}
