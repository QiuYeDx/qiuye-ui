"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControlsWithThen,
  type MotionValue,
  type ValueAnimationTransition,
} from "motion/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageOffIcon,
  PauseIcon,
  PlayIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* 类型                                                                 */
/* ------------------------------------------------------------------ */

/**
 * 按视口容器宽度（px）配置的断点对象，键为最小宽度，例如 `{ 0: 1.15, 640: 2, 1024: 3 }`。
 * 小于最小键时使用最小键的值。
 */
export type CarouselBreakpoints<T> = Readonly<Record<number, T>>;

/** 每屏显示的幻灯片数：数字（可为小数）、`"auto"`（按内容宽度）或断点对象 */
export type CarouselSlidesPerView = number | "auto" | CarouselBreakpoints<number>;

/** 对齐方式：`"start"` 吸附点对齐视口左缘，`"center"` 对齐视口中心 */
export type CarouselAlign = "start" | "center";

/**
 * 吸附方式
 * - `"slide"`：每张一个吸附点
 * - `"page"`：每屏一组一个吸附点
 * - `"none"`：自由惯性滚动，不吸附
 */
export type CarouselSnap = "slide" | "page" | "none";

/**
 * 切换效果
 * - `"slide"`：只平移
 * - `"fade"`：叠在同一位置交叉淡入
 * - `"scale"`：两侧缩小变暗
 */
export type CarouselEffect = "slide" | "fade" | "scale";

/** 内置箭头的显示方式 */
export type CarouselArrows = "hover" | "always" | "none";

/** 内置指示器类型 */
export type CarouselIndicatorType = "dots" | "fraction" | "none";

/** 内置指示器的位置 */
export type CarouselIndicatorsPlacement = "inside" | "outside";

/** 自动播放配置 */
export interface CarouselAutoplayOptions {
  /**
   * 每张停留的时长（ms）
   * @default 5000
   */
  delay?: number;
  /**
   * 指针悬停时暂停（仅鼠标、触控笔等可悬停的指针）
   * @default true
   */
  pauseOnHover?: boolean;
  /**
   * 用户手动切换（拖动、箭头、指示点、键盘、触控板）后不再自动播放，直到调用 `play()`
   * @default false
   */
  stopOnInteraction?: boolean;
  /**
   * 系统开启「减少动态效果」时仍然自动播放
   * @default false
   */
  ignoreReducedMotion?: boolean;
}

/** Carousel 的界面文案，用于读屏与按钮名称 */
export interface CarouselLabels {
  /** 根元素（region）的无障碍名称，可被 Carousel 的 `aria-label` 覆盖 */
  region: string;
  /** 根元素的 `aria-roledescription`（读屏念出的组件类型） */
  roleDescription: string;
  /** 每张幻灯片的 `aria-roledescription`（幻灯片作为 tabpanel 时不设置） */
  slideRoleDescription: string;
  /** 每张幻灯片的名称，也用于切换时的播报；`index` 从 1 开始 */
  slide: (index: number, total: number) => string;
  /** 吸附点与幻灯片不是一一对应时（每屏多张、按页吸附）的播报，`index` 从 1 开始 */
  page: (index: number, total: number) => string;
  /** 上一张按钮 */
  previous: string;
  /** 下一张按钮 */
  next: string;
  /** 指示点按钮，`index` 从 1 开始 */
  goTo: (index: number) => string;
  /** 吸附点与幻灯片不是一一对应时的指示点按钮，`index` 从 1 开始 */
  goToPage: (index: number) => string;
  /** 指示点列表（tablist）的名称 */
  indicators: string;
  /** 播放按钮 */
  play: string;
  /** 暂停按钮 */
  pause: string;
}

/** Carousel 默认文案 */
export const DEFAULT_CAROUSEL_LABELS: CarouselLabels = {
  region: "轮播",
  roleDescription: "轮播",
  slideRoleDescription: "幻灯片",
  slide: (index, total) => `第 ${index} 张，共 ${total} 张`,
  page: (index, total) => `第 ${index} 页，共 ${total} 页`,
  previous: "上一张",
  next: "下一张",
  goTo: (index) => `转到第 ${index} 张`,
  goToPage: (index) => `转到第 ${index} 页`,
  indicators: "选择幻灯片",
  play: "播放",
  pause: "暂停",
};

/** 程序跳转的选项 */
export interface CarouselGoToOptions {
  /**
   * 直接跳到目标位置，不做动画
   * @default false
   */
  instant?: boolean;
}

/** 通过 `apiRef` 或 `useCarousel()` 拿到的外部控制接口 */
export interface CarouselApi {
  /** 当前吸附点序号 */
  readonly index: number;
  /** 吸附点个数（指示点个数） */
  readonly count: number;
  /** 幻灯片个数 */
  readonly slideCount: number;
  /** 是否可以向前（循环时总为 true） */
  readonly canPrev: boolean;
  /** 是否可以向后（循环时总为 true） */
  readonly canNext: boolean;
  /** 自动播放是否开启（未被用户暂停） */
  readonly playing: boolean;
  /** 下一个吸附点 */
  next: () => void;
  /** 上一个吸附点 */
  prev: () => void;
  /** 跳到第 index 个吸附点；循环时走最短方向 */
  goTo: (index: number, options?: CarouselGoToOptions) => void;
  /** 跳到包含第 slideIndex 张幻灯片的吸附点 */
  goToSlide: (slideIndex: number, options?: CarouselGoToOptions) => void;
  /** 开始自动播放 */
  play: () => void;
  /** 暂停自动播放 */
  pause: () => void;
  /** 连续位置：0 为第一个吸附点，拖动时连续变化（循环时在 [0, count) 内绕回） */
  position: MotionValue<number>;
  /** 当前一张的自动播放进度（0–1） */
  autoplayProgress: MotionValue<number>;
}

/* ------------------------------------------------------------------ */
/* 常量                                                                 */
/* ------------------------------------------------------------------ */

const DRAG_THRESHOLD = 6;
const VELOCITY_WINDOW = 100;
// 松手前停顿超过这个时长（ms）视为速度 0。
const VELOCITY_IDLE = 50;
const RUBBER_BAND = 0.55;
// UIScrollView 的常规减速率：每毫秒速度保留 99.8%。
const DECELERATION_RATE = 0.998;
const TIME_CONSTANT = -1 / Math.log(DECELERATION_RATE);
// inertia 的初速度为 power · velocity / timeConstant，令其等于松手速度。
const INERTIA_POWER = TIME_CONSTANT / 1000;
const BOUNCE_STIFFNESS = 200;
const BOUNCE_DAMPING = 28;
// 分页时，速度超过它（px/s）的轻甩即使没过半也翻一页。
const FLICK_VELOCITY = 400;
// 吸附步长不小于视口宽度的这个比例时按分页处理（每次松手最多 ±1 页）。
const PAGING_RATIO = 0.75;
// 松手弹簧：带松手速度出发；只有甩得快时才带一点回弹（20000 px/s 时达到上限）。
const RELEASE_VISUAL_DURATION = 0.45;
const RELEASE_MAX_BOUNCE = 0.1;
const RELEASE_BOUNCE_VELOCITY = 20000;
// 位移以 px 计：离目标 0.5px 以内、速度低于 10px/s 即视为停稳，尽早触发 onSettle 与 inert 更新。
const REST = { restDelta: 0.5, restSpeed: 10 } as const;
const PROGRAM_SPRING: ValueAnimationTransition<number> = {
  type: "spring",
  visualDuration: 0.5,
  bounce: 0,
  ...REST,
};
const WHEEL_SPRING: ValueAnimationTransition<number> = {
  type: "spring",
  duration: 0.3,
  bounce: 0,
};
// 滚轮停下多久后吸附（ms）：触控板的惯性也会持续发 wheel，等它结束再吸附。
const WHEEL_SNAP_DELAY = 150;
const WHEEL_IDLE = 200;
// 分页时触控板滑过视口宽度的这个比例就朝滑动方向翻一页（不必过半）。
const WHEEL_PAGE_RATIO = 0.15;
// 触控板松手后系统还会继续发一串逐帧衰减的惯性 wheel（浏览器不暴露手势阶段）。
// 同向的最近这么多次位移逐次不增、且末次比首次小一成以上，即视为手指已离开：
// 立即按速度吸附，余下的惯性事件只吞掉不再移动；明显变大或反向则是新的一次滑动。
const WHEEL_MOMENTUM_WINDOW = 5;
const WHEEL_MOMENTUM_DECAY = 0.9;
const WHEEL_REGAIN_RATIO = 1.5;
const WHEEL_REGAIN_SLOP = 2;
// 按下接住动画时，离目标还有这么远（px）或速度超过这个值（px/s）视为仍在运动：
// 这次轻点只用来停住，不触发幻灯片里的链接（与 iOS 一致）。
const CATCH_DISTANCE = 2;
const CATCH_SPEED = 30;
// 键盘聚焦到部分可见的幻灯片时，滚到完整可见并在边缘留出的余量（px）。
const REVEAL_MARGIN = 16;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
// 减少动态效果：约 200ms 无回弹的缓动。
const REDUCED_TWEEN: ValueAnimationTransition<number> = {
  duration: 0.2,
  ease: EASE_OUT,
};
// scale 效果：相邻一张缩小 12%、亮度降低 35%（压暗而不是变透明，浅色背景上也不会发灰）；
// fade 效果附带 2% 的缩放。
const SCALE_DEPTH = 0.12;
const SCALE_DIM = 0.35;
const FADE_ZOOM = 0.02;
// 指示点：6px 圆点，活动时变为 22px 胶囊；每个点左右各 5px 点击余量（间距与 UIPageControl 相同）。
const DOT_SIZE = 6;
const DOT_EXTRA = 16;
const DOT_SLOT = 16;
// 不活动的点的不透明度（浅色背景上约 3.2:1）；自动播放时活动胶囊未填满部分的不透明度。
const DOT_BASE = { plain: 0.45, overlay: 0.5 } as const;
const DOT_TRACK = { plain: 0.55, overlay: 0.6 } as const;
const DOT_WINDOW_SPRING: ValueAnimationTransition<number> = {
  type: "spring",
  visualDuration: 0.35,
  bounce: 0,
};

const INPUT_SELECTOR =
  'input, textarea, select, [contenteditable=""], [contenteditable="true"]';
const TABBABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable=""], [contenteditable="true"]';

/** 把焦点移进一张幻灯片：优先第一个可 Tab 的元素，否则是幻灯片本身（tabIndex -1）。 */
function focusSlide(element: HTMLElement, preferContainer: boolean) {
  const inner = preferContainer
    ? null
    : Array.from(element.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).find(
        (node) => !node.closest("[inert]") && node.getClientRects().length > 0,
      );
  (inner ?? element).focus({ preventScroll: true });
}

declare const process: { env: { NODE_ENV?: string } };

function isDevelopment() {
  try {
    return process.env.NODE_ENV === "development";
  } catch {
    return false;
  }
}

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const mod = (value: number, size: number) => ((value % size) + size) % size;

/* ------------------------------------------------------------------ */
/* 物理（与 HoneycombView 相同，改为单轴）                               */
/* ------------------------------------------------------------------ */

/** 橡皮筋：越界越多，跟随越少。 */
function rubberBand(overshoot: number, dimension: number) {
  return (
    (overshoot * dimension * RUBBER_BAND) / (dimension + RUBBER_BAND * overshoot)
  );
}

/** rubberBand 的反函数，用于中途抓住越界状态时还原原始拖动量。 */
function inverseRubberBand(distance: number, dimension: number) {
  const safe = Math.min(distance, dimension * 0.999);
  return (safe * dimension) / (RUBBER_BAND * (dimension - safe));
}

function applyRubber(raw: number, min: number, max: number, dimension: number) {
  if (raw < min) return min - rubberBand(min - raw, dimension);
  if (raw > max) return max + rubberBand(raw - max, dimension);
  return raw;
}

function removeRubber(value: number, min: number, max: number, dimension: number) {
  if (value < min) return min - inverseRubberBand(min - value, dimension);
  if (value > max) return max + inverseRubberBand(value - max, dimension);
  return value;
}

/** Apple 的动量投影：按减速率估算松手后的停止位置（px）。 */
function projectMomentum(velocity: number) {
  return ((velocity / 1000) * DECELERATION_RATE) / (1 - DECELERATION_RATE);
}

interface Sample {
  t: number;
  x: number;
}

function velocityFrom(samples: Sample[], now: number) {
  const last = samples[samples.length - 1];
  if (!last || now - last.t > VELOCITY_IDLE) return 0;
  const first = samples.find((sample) => last.t - sample.t <= VELOCITY_WINDOW);
  if (!first || first === last || last.t === first.t) return 0;
  return ((last.x - first.x) / (last.t - first.t)) * 1000;
}

interface WheelSample {
  t: number;
  dx: number;
}

/** 最近 WHEEL_MOMENTUM_WINDOW 次位移是否呈系统惯性那样的同向逐帧衰减。 */
function isWheelMomentum(samples: WheelSample[]) {
  if (samples.length < WHEEL_MOMENTUM_WINDOW) return false;
  const sign = Math.sign(samples[0].dx);
  let previous = Infinity;
  for (const { dx } of samples) {
    const magnitude = Math.abs(dx);
    if (Math.sign(dx) !== sign || magnitude > previous) return false;
    previous = magnitude;
  }
  return previous <= Math.abs(samples[0].dx) * WHEEL_MOMENTUM_DECAY;
}

/** 由最近几次 wheel 位移估算速度（px/s）。 */
function wheelVelocity(samples: WheelSample[]) {
  const first = samples[0];
  const last = samples[samples.length - 1];
  if (!first || !last) return 0;
  if (last.t <= first.t) return last.dx * 60;
  let distance = 0;
  for (let i = 1; i < samples.length; i++) distance += samples[i].dx;
  return (distance / (last.t - first.t)) * 1000;
}

/* ------------------------------------------------------------------ */
/* 轨道几何                                                              */
/* ------------------------------------------------------------------ */

interface TrackInput {
  /** 视口宽度 */
  width: number;
  gap: number;
  /** 每张的宽度 */
  sizes: number[];
  align: CarouselAlign;
  loop: boolean;
  snap: CarouselSnap;
  /** 数字 slidesPerView 时每页张数；"auto" 时为 null（按宽度贪心分页） */
  pageSize: number | null;
  fade: boolean;
  /** autoHeight 时每张的自然高度 */
  heights: number[] | null;
}

interface Track {
  width: number;
  gap: number;
  sizes: number[];
  /** 每张在轨道上的起点 */
  bases: number[];
  /** 循环周期：所有幻灯片宽度与间距之和 */
  period: number;
  maxSize: number;
  align: CarouselAlign;
  fade: boolean;
  /** 实际是否循环（总长不足时退化） */
  loop: boolean;
  /** 每个吸附点对应的 offset */
  snaps: number[];
  /** 每个吸附点包含的幻灯片 */
  snapSlides: number[][];
  /** 每张所属的吸附点 */
  slideSnap: number[];
  /** 非循环时 offset 的范围 */
  min: number;
  max: number;
  /** 吸附步长接近一屏：每次松手最多翻一页 */
  paging: boolean;
  /** 只有一个吸附点：不可拖动、不显示控件 */
  static: boolean;
  /** autoHeight：每个吸附点的视口高度 */
  snapHeights: number[] | null;
}

function buildTrack(input: TrackInput): Track {
  const { width, gap, sizes, align, snap, fade } = input;
  const count = sizes.length;
  const bases: number[] = [];
  let cursor = 0;
  for (const size of sizes) {
    bases.push(cursor);
    cursor += size + gap;
  }
  const period = cursor;
  const contentLength = count ? cursor - gap : 0;
  const maxSize = count ? Math.max(...sizes) : 0;
  // 循环需要轨道总长 ≥ 视口宽 + 最宽的一张（含间距），绕回点才会落在视口之外。
  const loop =
    input.loop && count > 1 && period >= width + maxSize + gap - 0.5;
  const alignX = (span: number) => (align === "center" ? (width - span) / 2 : 0);

  const groups: number[][] = [];
  if (snap === "page") {
    let start = 0;
    while (start < count) {
      const group = [start];
      for (let next = start + 1; next < count; next++) {
        const fits = input.pageSize
          ? next - start < input.pageSize
          : bases[next] + sizes[next] - bases[start] <= width + 0.5;
        if (!fits) break;
        group.push(next);
      }
      groups.push(group);
      start = group[group.length - 1] + 1;
    }
  } else {
    for (let slide = 0; slide < count; slide++) groups.push([slide]);
  }

  // 起始对齐且不循环：末尾不留空白，超出的吸附点合并到最后一个位置。
  const maxScroll = Math.max(0, contentLength - width);
  const clampStart = !loop && align === "start";
  const snaps: number[] = [];
  const snapSlides: number[][] = [];
  const slideSnap: number[] = new Array(count).fill(0);
  for (const group of groups) {
    const first = group[0];
    const last = group[group.length - 1];
    const span = bases[last] + sizes[last] - bases[first];
    let target = bases[first] - alignX(span);
    if (clampStart) target = clamp(target, 0, maxScroll);
    const previous = snaps.length - 1;
    if (!loop && previous >= 0 && Math.abs(target - snaps[previous]) < 0.5) {
      snapSlides[previous].push(...group);
      for (const slide of group) slideSnap[slide] = previous;
      continue;
    }
    snaps.push(target);
    snapSlides.push([...group]);
    for (const slide of group) slideSnap[slide] = snaps.length - 1;
  }
  if (!snaps.length) {
    snaps.push(0);
    snapSlides.push([]);
  }

  const min = loop ? -Infinity : clampStart ? 0 : snaps[0];
  const max = loop ? Infinity : clampStart ? maxScroll : snaps[snaps.length - 1];
  const isStatic = snaps.length <= 1 && (snap !== "none" || max - min < 0.5);
  const averageStep =
    snaps.length > 1
      ? loop
        ? period / snaps.length
        : (snaps[snaps.length - 1] - snaps[0]) / (snaps.length - 1)
      : width;

  const track: Track = {
    width,
    gap,
    sizes,
    bases,
    period,
    maxSize,
    align,
    fade,
    loop,
    snaps,
    snapSlides,
    slideSnap,
    min,
    max,
    paging: fade || averageStep >= width * PAGING_RATIO,
    static: isStatic,
    snapHeights: null,
  };

  if (input.heights) {
    const heights = input.heights;
    track.snapHeights = snaps.map((offset, snapIndex) => {
      if (fade) {
        return Math.max(0, ...snapSlides[snapIndex].map((slide) => heights[slide] ?? 0));
      }
      let tallest = 0;
      for (let slide = 0; slide < count; slide++) {
        if (isSlideVisible(track, slide, offset)) {
          tallest = Math.max(tallest, heights[slide] ?? 0);
        }
      }
      return tallest;
    });
  }
  return track;
}

/** 预渲染（服务端首帧、测量前）用的轨道：以「一个幻灯片步长」为单位，间距为 0。 */
function buildStepTrack(
  count: number,
  slidesPerView: number,
  align: CarouselAlign,
  loop: boolean,
  snap: CarouselSnap,
  fade: boolean,
) {
  return buildTrack({
    width: slidesPerView,
    gap: 0,
    sizes: new Array(count).fill(1),
    align,
    loop,
    snap,
    pageSize: Math.max(1, Math.floor(slidesPerView + 1e-3)),
    fade,
    heights: null,
  });
}

function sameNumbers(a: number[] | null, b: number[] | null) {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let index = 0; index < a.length; index++) {
    if (Math.abs(a[index] - b[index]) > 0.01) return false;
  }
  return true;
}

/** 影响幻灯片位置的部分是否相同（不含 autoHeight 的高度）。 */
function sameLayout(a: Track, b: Track) {
  return (
    Math.abs(a.width - b.width) < 0.01 &&
    Math.abs(a.gap - b.gap) < 0.01 &&
    a.loop === b.loop &&
    a.align === b.align &&
    a.fade === b.fade &&
    sameNumbers(a.sizes, b.sizes) &&
    sameNumbers(a.snaps, b.snaps)
  );
}

const wrapInto = (value: number, low: number, period: number) =>
  low + mod(value - low, period);

/** 第 index 张相对视口左缘的位置（px）。循环时每张自己绕回，不复制幻灯片。 */
function slideX(track: Track, index: number, offset: number) {
  const x = track.bases[index] - offset;
  return track.loop ? wrapInto(x, -(track.maxSize + track.gap), track.period) : x;
}

/** 距对齐位置多少个「幻灯片宽度 + 间距」：0 为对齐位置，±1 为相邻一张。 */
function slideProgress(track: Track, index: number, offset: number) {
  const step = track.sizes[index] + track.gap || 1;
  if (track.fade) {
    const distance = track.bases[index] - offset;
    return (
      (track.loop ? wrapInto(distance, -track.period / 2, track.period) : distance) /
      step
    );
  }
  const x = slideX(track, index, offset);
  const aligned = track.align === "center" ? (track.width - track.sizes[index]) / 2 : 0;
  return (x - aligned) / step;
}

/** 幻灯片中心距视口中心多少个步长，用于视差。 */
function slideCenter(track: Track, index: number, offset: number) {
  if (track.fade) return 0;
  const step = track.sizes[index] + track.gap || 1;
  const x = slideX(track, index, offset);
  return (x + track.sizes[index] / 2 - track.width / 2) / step;
}

function isSlideVisible(track: Track, index: number, offset: number) {
  if (track.fade) return Math.abs(slideProgress(track, index, offset)) < 0.999;
  const x = slideX(track, index, offset);
  return x + track.sizes[index] > 0.5 && x < track.width - 0.5;
}

/** 连续位置（不绕回）：循环时可以超过 count，便于计算最短方向与投影。 */
function virtualPosition(track: Track, offset: number) {
  const { snaps } = track;
  const count = snaps.length;
  if (count <= 1) return 0;
  if (track.loop) {
    const relative = offset - snaps[0];
    const cycles = Math.floor(relative / track.period);
    const local = snaps[0] + (relative - cycles * track.period);
    let segment = count - 1;
    for (let index = 0; index < count - 1; index++) {
      if (local < snaps[index + 1]) {
        segment = index;
        break;
      }
    }
    const next = segment + 1 < count ? snaps[segment + 1] : snaps[0] + track.period;
    return (
      cycles * count + segment + (local - snaps[segment]) / (next - snaps[segment])
    );
  }
  if (offset <= snaps[0]) return (offset - snaps[0]) / (snaps[1] - snaps[0]);
  const lastIndex = count - 1;
  if (offset >= snaps[lastIndex]) {
    return lastIndex + (offset - snaps[lastIndex]) / (snaps[lastIndex] - snaps[lastIndex - 1]);
  }
  for (let index = 0; index < lastIndex; index++) {
    if (offset <= snaps[index + 1]) {
      return index + (offset - snaps[index]) / (snaps[index + 1] - snaps[index]);
    }
  }
  return lastIndex;
}

/** 第 k 个吸附点（循环时 k 可以超出 [0, count)）的 offset。 */
function snapOffset(track: Track, virtualIndex: number) {
  const count = track.snaps.length;
  if (track.loop) {
    const cycles = Math.floor(virtualIndex / count);
    return track.snaps[mod(virtualIndex, count)] + cycles * track.period;
  }
  return track.snaps[clamp(Math.round(virtualIndex), 0, count - 1)];
}

function displayPosition(track: Track, offset: number) {
  const count = track.snaps.length;
  const position = virtualPosition(track, offset);
  return track.loop ? mod(position, count) : clamp(position, 0, count - 1);
}

interface ViewState {
  /** 停稳后与视口相交的幻灯片 */
  visible: boolean[];
  /** 曾经进入可见范围 ±1 张的幻灯片（图片懒加载） */
  near: boolean[];
}

function visibleAt(track: Track, offset: number, count: number) {
  const visible: boolean[] = [];
  for (let index = 0; index < count; index++) {
    visible.push(index < track.sizes.length ? isSlideVisible(track, index, offset) : false);
  }
  return visible;
}

function expandNear(visible: boolean[], loop: boolean, previous?: boolean[]) {
  const count = visible.length;
  return visible.map((_, index) => {
    if (previous?.[index]) return true;
    for (const delta of [-1, 0, 1]) {
      const neighbor = loop ? mod(index + delta, count) : index + delta;
      if (visible[neighbor]) return true;
    }
    return false;
  });
}

function sameFlags(a: boolean[], b: boolean[]) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/* ------------------------------------------------------------------ */
/* 断点                                                                  */
/* ------------------------------------------------------------------ */

function isBreakpoints(value: unknown): value is CarouselBreakpoints<number> {
  return typeof value === "object" && value !== null;
}

function breakpointKeys(value: CarouselBreakpoints<number>) {
  return Object.keys(value)
    .map(Number)
    .filter((key) => Number.isFinite(key))
    .sort((a, b) => a - b);
}

function resolveResponsive(
  value: number | CarouselBreakpoints<number>,
  width: number,
  fallback: number,
) {
  if (!isBreakpoints(value)) return value;
  const keys = breakpointKeys(value);
  if (!keys.length) return fallback;
  let result = value[keys[0]];
  for (const key of keys) if (width >= key) result = value[key];
  return result;
}

function smallestBreakpoint(value: number | CarouselBreakpoints<number>, fallback: number) {
  if (!isBreakpoints(value)) return value;
  const keys = breakpointKeys(value);
  return keys.length ? value[keys[0]] : fallback;
}

const formatNumber = (value: number) => Number(value.toFixed(4));

/* ------------------------------------------------------------------ */
/* 样式                                                                  */
/* ------------------------------------------------------------------ */

// 布局与外观用 Tailwind 类，用户的 className 可以覆盖；这里只放触摸行为、
// 依赖悬停 / 聚焦的箭头显隐、骨架微光与减少动态效果等无法用类名表达的部分。
// React 19 <style href precedence>：提升到 <head> 并按 href 去重，Vite 等环境同样可用。
const CAROUSEL_CSS = `
/* 不设 overscroll-behavior：视口是 overflow: hidden 的滚动容器，Chrome 中带一点横向分量的
   纵向滚轮（触控板常见）会被它截住，页面不再滚动。横向滚轮由 wheel 监听 preventDefault，
   不会触发浏览器的前进 / 后退手势。 */
.qy-carousel-viewport {
  touch-action: pan-y pinch-zoom;
  -webkit-tap-highlight-color: transparent;
}
.qy-carousel-viewport img {
  -webkit-user-drag: none;
}
@media (hover: hover) {
  .qy-carousel-viewport[data-draggable] {
    cursor: grab;
  }
}
.qy-carousel[data-dragging] .qy-carousel-viewport,
.qy-carousel[data-dragging] .qy-carousel-viewport * {
  cursor: grabbing;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
/* 键盘切换后焦点落在幻灯片上：描边画在内侧，不会被视口裁掉。 */
.qy-carousel-viewport [data-slot="carousel-item"]:focus-visible {
  outline: 2px solid var(--ring, currentColor);
  outline-offset: -2px;
}
/* 触屏上指示点的点击区域向上下各延伸 10px（视觉不变）。 */
@media (pointer: coarse) {
  .qy-carousel-dot::after {
    content: "";
    position: absolute;
    inset: -10px 0;
  }
}

.qy-carousel-arrow {
  transition:
    opacity 200ms ease,
    translate 320ms cubic-bezier(0.23, 1, 0.32, 1),
    scale 140ms ease-out,
    background-color 150ms ease,
    color 150ms ease;
}
.qy-carousel-arrow:not([aria-disabled="true"]):active {
  scale: 0.92;
  transition-duration: 200ms, 320ms, 80ms, 150ms, 150ms;
}
.qy-carousel-arrow[aria-disabled="true"] {
  opacity: 0.4;
  cursor: default;
}
.qy-carousel-arrow[data-reveal="hover"] {
  opacity: 0;
  pointer-events: none;
}
.qy-carousel-arrow[data-reveal="hover"][data-direction="prev"] {
  translate: -6px 0;
}
.qy-carousel-arrow[data-reveal="hover"][data-direction="next"] {
  translate: 6px 0;
}
/* 只在指针位于视口上时显示（不含同一个 Carousel 里的标题、信息栏等其他内容），
   嵌套轮播的箭头也只跟随自己的视口。 */
@media (hover: hover) {
  .qy-carousel-viewport:hover > .qy-carousel-arrow[data-reveal="hover"] {
    opacity: 1;
    translate: 0 0;
    pointer-events: auto;
  }
  .qy-carousel-viewport:hover > .qy-carousel-arrow[data-reveal="hover"][aria-disabled="true"] {
    opacity: 0.4;
  }
}
@media (hover: none) {
  .qy-carousel-arrow[data-reveal="hover"] {
    visibility: hidden;
  }
}
.qy-carousel-viewport:has(:focus-visible) > .qy-carousel-arrow[data-reveal="hover"] {
  visibility: visible;
  opacity: 1;
  translate: 0 0;
  pointer-events: auto;
}
.qy-carousel-viewport:has(:focus-visible) > .qy-carousel-arrow[data-reveal="hover"][aria-disabled="true"] {
  opacity: 0.4;
}

.qy-carousel-skeleton {
  overflow: hidden;
}
.qy-carousel-skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  translate: -100% 0;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in oklab, var(--foreground, #000) 7%, transparent),
    transparent
  );
  animation: qy-carousel-shimmer 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
@keyframes qy-carousel-shimmer {
  to {
    translate: 100% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .qy-carousel-arrow[data-reveal="hover"] {
    translate: 0 0;
  }
  .qy-carousel-skeleton::after {
    animation: none;
    opacity: 0;
  }
}
`;

function CarouselStyles() {
  return (
    <style href="qiuye-carousel" precedence="default">
      {CAROUSEL_CSS}
    </style>
  );
}

/* ------------------------------------------------------------------ */
/* Context                                                              */
/* ------------------------------------------------------------------ */

interface SlideLayout {
  /** 平移量：测量后为 px，测量前为基于百分比的 calc() 字符串 */
  x: number | string;
  progress: number;
  center: number;
}

type InteractionSource = "user" | "program" | "autoplay" | "layout" | "prop";

interface CarouselContextValue {
  uid: string;
  trackId: string;
  slideId: (index: number) => string;
  labels: CarouselLabels;
  // 配置
  loop: boolean;
  effect: CarouselEffect;
  crossFade: boolean;
  /** 停稳后把视口外的幻灯片设为 inert（分页类模式）；自由滚动与按内容宽度时保持可 Tab */
  hideOffscreen: boolean;
  parallax: number;
  autoHeight: boolean;
  autoWidth: boolean;
  arrows: CarouselArrows;
  indicators: CarouselIndicatorType;
  indicatorsPlacement: CarouselIndicatorsPlacement;
  maxDots: number;
  mouseDraggable: boolean;
  breakpointCss: string | null;
  trackVars: React.CSSProperties | undefined;
  // 状态
  measured: boolean;
  slideCount: number;
  count: number;
  index: number;
  isStatic: boolean;
  canPrev: boolean;
  canNext: boolean;
  view: ViewState;
  slideSnap: number[];
  snapSlides: number[][];
  tabsMounted: boolean;
  /** 已挂载的外部暂停 / 播放按钮个数（CarouselIndicators 或 CarouselAutoplayToggle） */
  toggleCount: number;
  autoplayEnabled: boolean;
  playing: boolean;
  completedIndex: number | null;
  // 运动值
  offset: MotionValue<number>;
  position: MotionValue<number>;
  autoplayProgress: MotionValue<number>;
  viewportHeight: MotionValue<number | string>;
  getLayout: (index: number, offset: number) => SlideLayout;
  // 行为
  api: CarouselApi;
  markInteraction: () => void;
  registerViewport: (node: HTMLDivElement | null) => void;
  registerTrack: (node: HTMLDivElement | null) => void;
  registerSlide: (index: number, node: HTMLElement) => void;
  unregisterSlide: (index: number, node: HTMLElement | null) => void;
  registerSlideCount: (count: number | null) => void;
  registerTabs: () => () => void;
  registerToggle: () => () => void;
  viewportHandlers: ViewportHandlers;
}

interface ViewportHandlers {
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void;
  onLostPointerCapture: (event: React.PointerEvent<HTMLDivElement>) => void;
  onClickCapture: (event: React.MouseEvent<HTMLDivElement>) => void;
  onFocus: (event: React.FocusEvent<HTMLDivElement>) => void;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);
const SlideIndexContext = React.createContext<number | null>(null);

interface CarouselItemContextValue {
  index: number;
  progress: MotionValue<number>;
  center: MotionValue<number>;
  active: boolean;
  visible: boolean;
  near: boolean;
}

const CarouselItemContext = React.createContext<CarouselItemContextValue | null>(null);

function useCarouselContext(component: string) {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error(`${component} 必须放在 <Carousel> 内使用`);
  return context;
}

/** useCarousel 的返回值 */
export type UseCarouselResult = CarouselApi;

/**
 * useCarousel — 读取所在轮播的状态与控制方法
 *
 * 用于缩略图条、故事进度条、自定义计数等控件：
 * - `index` / `count` / `slideCount` / `canPrev` / `canNext`
 * - `next` / `prev` / `goTo` / `goToSlide` / `play` / `pause`
 * - `position`：连续位置的 MotionValue，拖动时连续变化
 * - `autoplayProgress`：当前一张的自动播放进度（0–1）
 *
 * @example
 * ```tsx
 * function Thumbs() {
 *   const { index, goTo } = useCarousel();
 *   return photos.map((photo, i) => (
 *     <button key={photo.id} aria-current={i === index} onClick={() => goTo(i)}>
 *       <img src={photo.thumb} alt="" />
 *     </button>
 *   ));
 * }
 * ```
 */
export function useCarousel(): UseCarouselResult {
  return useCarouselContext("useCarousel").api;
}

/** useCarouselItem 的返回值 */
export interface UseCarouselItemResult {
  /** 幻灯片序号（从 0 开始） */
  index: number;
  /** 距对齐位置多少张：0 为对齐位置，±1 为相邻一张，拖动时连续变化 */
  progress: MotionValue<number>;
  /** 是否属于当前吸附点 */
  active: boolean;
  /** 停稳后是否在视口内 */
  visible: boolean;
}

/**
 * useCarouselItem — 在幻灯片内部读取自身的位置，用于自定义每张的效果
 *
 * - `progress` 是 MotionValue，可直接交给 `useTransform` 派生位移、缩放、透明度
 * - `active` / `visible` 是停稳后的状态，适合切换样式或暂停视频
 *
 * @example
 * ```tsx
 * function Caption({ children }: { children: React.ReactNode }) {
 *   const { progress } = useCarouselItem();
 *   const y = useTransform(progress, [-1, 0, 1], [24, 0, 24]);
 *   const opacity = useTransform(progress, [-0.6, 0, 0.6], [0, 1, 0]);
 *   return <motion.p style={{ y, opacity }}>{children}</motion.p>;
 * }
 * ```
 */
export function useCarouselItem(): UseCarouselItemResult {
  const item = React.useContext(CarouselItemContext);
  if (!item) throw new Error("useCarouselItem 必须在 <CarouselItem> 内使用");
  return {
    index: item.index,
    progress: item.progress,
    active: item.active,
    visible: item.visible,
  };
}

/** 在 Carousel 的子树中找到 CarouselContent，数出幻灯片个数（服务端首帧用）。 */
function findSlideCount(node: React.ReactNode, depth = 0): number | null {
  if (depth > 16) return null;
  let found: number | null = null;
  React.Children.forEach(node, (child) => {
    if (found !== null || !React.isValidElement(child)) return;
    const props = child.props as { children?: React.ReactNode };
    if (child.type === CarouselContent) {
      found = React.Children.toArray(props.children).length;
      return;
    }
    if (props.children !== undefined) found = findSlideCount(props.children, depth + 1);
  });
  return found;
}

/* ------------------------------------------------------------------ */
/* Carousel                                                              */
/* ------------------------------------------------------------------ */

/** Carousel 组件的属性 */
export interface CarouselProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "draggable" | "onChange"> {
  /**
   * 无限循环：每张幻灯片自己绕回，不复制节点。
   * 轨道总长不足「视口宽 + 最宽的一张」时自动退化为不循环。
   * @default false
   */
  loop?: boolean;
  /**
   * 自动播放
   * - `true`：使用默认配置（5 秒一张，悬停暂停）
   * - 对象：`{ delay, pauseOnHover, stopOnInteraction, ignoreReducedMotion }`
   *
   * 悬停、键盘聚焦、拖动、离开视口、标签页隐藏时暂停；系统开启「减少动态效果」时默认不播放。
   * @default false
   */
  autoplay?: boolean | CarouselAutoplayOptions;
  /**
   * 每屏显示的幻灯片数
   * - 数字：可为小数，如 `1.15` 露出下一张
   * - `"auto"`：按每张内容的宽度排布（宽度可用 CarouselItem 的 className 指定）
   * - 断点对象：`{ 0: 1.15, 640: 2, 1024: 3 }`，键为视口容器宽度（px）
   * @default 1
   */
  slidesPerView?: CarouselSlidesPerView;
  /**
   * 幻灯片间距（px），可为断点对象
   * @default 0
   */
  gap?: number | CarouselBreakpoints<number>;
  /**
   * 吸附点的对齐方式
   * @default "start"
   */
  align?: CarouselAlign;
  /**
   * 吸附方式：`"slide"` 每张、`"page"` 每屏一组、`"none"` 自由惯性滚动。
   * `"none"` 与 `slidesPerView="auto"` 时视口外的幻灯片仍可用 Tab 聚焦（聚焦时滚入视野），
   * 其他模式停稳后视口外的幻灯片为 `inert`。`effect="fade"` 时 `"none"` 按 `"slide"` 处理。
   * @default "slide"
   */
  snap?: CarouselSnap;
  /**
   * 切换效果：`"slide"` 平移、`"fade"` 叠在同一位置淡入淡出、`"scale"` 两侧缩小变暗。
   * `"fade"` 时固定每屏 1 张、`align="start"`、`snap="none"` 按 `"slide"` 处理、不做视差。
   * @default "slide"
   */
  effect?: CarouselEffect;
  /**
   * `effect="fade"` 时两张同时淡出淡入（先淡出再淡入，中途不重叠），用于背景透明的幻灯片（如纯文字）。
   * 默认只淡化上面一张、下面一张保持不透明，图片幻灯片在切换途中不会透出背景。
   * @default false
   */
  crossFade?: boolean;
  /**
   * 视差（0–0.5）：CarouselImage 随拖动反向轻移的比例，仅 `fit="cover"` 时生效（`effect="fade"` 时无效）
   * @default 0
   */
  parallax?: number;
  /**
   * 视口高度随当前幻灯片的高度连续过渡（拖动时同样连续）
   * @default false
   */
  autoHeight?: boolean;
  /**
   * 内置箭头：`"hover"` 可悬停设备上悬停或键盘聚焦时显示（纯触屏隐藏）、`"always"` 始终显示、`"none"` 不显示
   * @default "hover"
   */
  arrows?: CarouselArrows;
  /**
   * 内置指示器：`"dots"` 随拖动连续变形的指示点、`"fraction"` 分数「3 / 12」、`"none"` 不显示。
   * 自动播放时指示器内带暂停 / 播放按钮；为 `"none"` 且没有放置 `CarouselIndicators` 或
   * `CarouselAutoplayToggle` 时，视口右下角显示一个独立的暂停按钮（WCAG 2.2.2）。
   * @default "dots"
   */
  indicators?: CarouselIndicatorType;
  /**
   * 内置指示器的位置：`"inside"` 叠在内容底部（深色半透明胶囊）、`"outside"` 视口下方
   * @default "inside"
   */
  indicatorsPlacement?: CarouselIndicatorsPlacement;
  /**
   * 指示点最多显示的个数，超出时只显示一个跟随当前位置滑动的窗口，边缘的点缩小
   * @default 9
   */
  maxDots?: number;
  /**
   * 鼠标拖拽
   * @default true
   */
  draggable?: boolean;
  /**
   * 触摸滑动（触屏、触控笔）
   * @default true
   */
  swipe?: boolean;
  /**
   * 触控板横向滑动、Shift + 滚轮；纵向滚轮始终交还给页面
   * @default true
   */
  wheel?: boolean;
  /**
   * 焦点在轮播内（不在输入框中）时用 ← → Home End 切换
   * @default true
   */
  keyboard?: boolean;
  /**
   * 点击未选中的幻灯片时切换到它（中心聚焦常用），此时该次点击不会触发幻灯片内的链接
   * @default false
   */
  selectOnClick?: boolean;
  /**
   * 当前吸附点序号（受控）。用户操作时先移动并调用 `onIndexChange`；
   * 若父组件没有把新值写回（拒绝这次切换），轮播会滑回该值。
   */
  index?: number;
  /**
   * 初始吸附点序号（非受控）
   * @default 0
   */
  defaultIndex?: number;
  /** 吸附点序号变化时调用（松手、点击箭头等决定目标时，而不是停稳后） */
  onIndexChange?: (index: number) => void;
  /** 停稳后调用 */
  onSettle?: (index: number) => void;
  /** 外部控制：`{ next, prev, goTo, goToSlide, play, pause, index, ... }` */
  apiRef?: React.Ref<CarouselApi | null>;
  /**
   * 界面与读屏文案，未提供的字段使用默认值
   * @default DEFAULT_CAROUSEL_LABELS
   */
  labels?: Partial<CarouselLabels>;
}

interface DragState {
  pointerId: number;
  pointerType: string;
  startX: number;
  startY: number;
  startRaw: number;
  /** 按下时打断了动画（或进行中的触控板手势） */
  wasAnimating: boolean;
  /** 按下时内容仍在明显运动：轻点只用来停住，吞掉随后的 click */
  caughtMoving: boolean;
  dragging: boolean;
  samples: Sample[];
}

/**
 * Carousel — 桌面端与移动端通用的轮播图
 *
 * 手感对标 iOS 的分页滚动：
 * - 鼠标拖拽、触摸滑动 1:1 跟手，纵向滑动交还给页面滚动
 * - 非循环时拉过两端是橡皮筋；松手按速度投影选择吸附点，用带初速度的弹簧滑过去，
 *   动画途中按下立即接住（包括橡皮筋回弹途中）
 * - 无限循环（不复制幻灯片）、每屏多张与断点配置、居中对齐、按页吸附与自由惯性滚动
 * - `fade` / `scale` 效果、图片视差、自动高度
 * - 悬停显示的玻璃箭头、随拖动连续变形的指示点（自动播放时显示进度）、分数指示、触控板与键盘
 * - 自动播放在悬停、聚焦、拖动、离开视口、标签页隐藏时暂停，带暂停 / 播放按钮
 * - 键盘切换时焦点跟随到新的幻灯片；聚焦到部分可见的幻灯片时自动滚入视野
 *
 * 视口的尺寸与圆角写在 `CarouselContent` 上。
 *
 * @example
 * ```tsx
 * <Carousel loop autoplay parallax={0.2}>
 *   <CarouselContent className="aspect-video rounded-2xl">
 *     {banners.map((banner) => (
 *       <CarouselImage key={banner.id} src={banner.src} alt={banner.alt} overlay>
 *         <h3 className="p-6 pb-12 text-2xl font-semibold">{banner.title}</h3>
 *       </CarouselImage>
 *     ))}
 *   </CarouselContent>
 * </Carousel>
 * ```
 *
 * @example
 * ```tsx
 * // 货架：断点配置每屏张数，箭头放在标题右侧
 * <Carousel slidesPerView={{ 0: 1.15, 640: 2, 1024: 3 }} gap={16} snap="page"
 *   arrows="none" indicatorsPlacement="outside">
 *   <div className="mb-3 flex items-center justify-between">
 *     <h3>精选</h3>
 *     <div className="flex gap-2"><CarouselPrevious /><CarouselNext /></div>
 *   </div>
 *   <CarouselContent>{cards}</CarouselContent>
 * </Carousel>
 * ```
 */
export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  function Carousel(
    {
      loop = false,
      autoplay = false,
      slidesPerView = 1,
      gap = 0,
      align = "start",
      snap = "slide",
      effect = "slide",
      crossFade = false,
      parallax = 0,
      autoHeight = false,
      arrows = "hover",
      indicators = "dots",
      indicatorsPlacement = "inside",
      maxDots = 9,
      draggable = true,
      swipe = true,
      wheel = true,
      keyboard = true,
      selectOnClick = false,
      index: indexProp,
      defaultIndex = 0,
      onIndexChange,
      onSettle,
      apiRef,
      labels: labelsProp,
      className,
      children,
      onKeyDown,
      onPointerEnter,
      onPointerLeave,
      onFocus,
      onBlur,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) {
    const fade = effect === "fade";
    const spvConfig: CarouselSlidesPerView = fade ? 1 : slidesPerView;
    const autoWidth = spvConfig === "auto";
    const alignMode: CarouselAlign = fade ? "start" : align;
    const snapMode: CarouselSnap = fade && snap === "none" ? "slide" : snap;
    const parallaxAmount = fade ? 0 : clamp(parallax || 0, 0, 0.5);
    const hideOffscreen = snapMode !== "none" && !autoWidth;
    const breakpointMode = !autoWidth && (isBreakpoints(spvConfig) || isBreakpoints(gap));
    const spvKey = JSON.stringify(spvConfig);
    const gapKey = JSON.stringify(gap);

    const labels = React.useMemo(
      () => ({ ...DEFAULT_CAROUSEL_LABELS, ...labelsProp }),
      [labelsProp],
    );

    const reactId = React.useId();
    const uid = React.useMemo(() => reactId.replace(/[^a-zA-Z0-9_-]/g, ""), [reactId]);
    const trackId = `qy-carousel-${uid}-track`;
    const slideId = React.useCallback(
      (slide: number) => `qy-carousel-${uid}-slide-${slide}`,
      [uid],
    );

    const reducedMotion = useReducedMotion() ?? false;
    const reducedRef = React.useRef(reducedMotion);
    reducedRef.current = reducedMotion;

    /* ---------------- 幻灯片个数与预渲染模型 ---------------- */

    const scannedCount = findSlideCount(children) ?? 0;
    const [registeredCount, setRegisteredCount] = React.useState<number | null>(null);
    const slideCount = registeredCount ?? scannedCount;

    const preSpv = autoWidth
      ? null
      : clamp(smallestBreakpoint(spvConfig as number | CarouselBreakpoints<number>, 1), 1, 50);
    const premodel = React.useMemo(
      () =>
        preSpv === null
          ? null
          : buildStepTrack(slideCount, preSpv, alignMode, loop, snapMode, fade),
      [preSpv, slideCount, alignMode, loop, snapMode, fade],
    );

    const [geometry, setGeometry] = React.useState<Track | null>(null);
    const geometryRef = React.useRef<Track | null>(null);
    const premodelRef = React.useRef(premodel);
    premodelRef.current = premodel;
    const model = geometry ?? premodel;
    const count = model ? model.snaps.length : Math.max(1, slideCount);
    const isStatic = model ? model.static : slideCount <= 1;
    const effectiveLoop = model ? model.loop : loop;

    const [index, setIndex] = React.useState(() =>
      clamp(Math.round(indexProp ?? defaultIndex), 0, Math.max(0, count - 1)),
    );
    const indexRef = React.useRef(index);
    // 目标吸附点（循环时不绕回），连点箭头时从它继续累加。
    const virtualRef = React.useRef(index);
    // 当前吸附点的第一张：尺寸或断点变化后让它保持在视野内。
    const [initialAnchor] = React.useState(
      () => premodel?.snapSlides[index]?.[0] ?? index,
    );
    const anchorRef = React.useRef(initialAnchor);

    const offset = useMotionValue(0);
    const autoplayProgress = useMotionValue(0);
    // Motion 在 MotionValue 的最后一个 change 订阅者离开时会停止它的动画：
    // 指示点按条件卸载（或所有幻灯片被移除）时，自动播放与位移动画不能因此冻结。
    React.useEffect(() => {
      const noop = () => {};
      const offOffset = offset.on("change", noop);
      const offProgress = autoplayProgress.on("change", noop);
      return () => {
        offOffset();
        offProgress();
      };
    }, [offset, autoplayProgress]);

    const position = useTransform(offset, (value) =>
      geometry ? displayPosition(geometry, value) : index,
    );
    const viewportHeight = useTransform(position, (value): number | string => {
      const heights = geometry?.snapHeights;
      if (!autoHeight || !heights || !heights.length) return "auto";
      const lower = Math.floor(value);
      const upper = geometry.loop ? mod(lower + 1, heights.length) : Math.min(lower + 1, heights.length - 1);
      const from = heights[mod(lower, heights.length)];
      const to = heights[upper];
      return from + (to - from) * (value - lower);
    });

    // 测量前：数字 slidesPerView 时用百分比摆好 defaultIndex，水合前就是正确画面。
    const preOffset = premodel ? snapOffset(premodel, index) : 0;
    const getLayout = React.useCallback(
      (slide: number, value: number): SlideLayout => {
        if (geometry) {
          return {
            x: fade ? 0 : slideX(geometry, slide, value),
            progress: slideProgress(geometry, slide, value),
            center: slideCenter(geometry, slide, value),
          };
        }
        if (premodel && slide < premodel.sizes.length) {
          const steps = formatNumber(slideX(premodel, slide, preOffset));
          return {
            x: fade
              ? 0
              : breakpointMode
                ? "calc(var(--qy-pos, 0) * (100% + var(--qy-gap, 0px)))"
                : `calc(${steps} * (100% + var(--qy-gap, 0px)))`,
            progress: slideProgress(premodel, slide, preOffset),
            center: 0,
          };
        }
        // 还不知道幻灯片个数（例如 CarouselContent 包在自定义组件里，服务端首帧扫描不到）：
        // 按每屏一张、起始对齐依次排开，而不是全部叠在一起。
        return {
          x: fade ? 0 : `calc(${slide - index} * (100% + var(--qy-gap, 0px)))`,
          progress: slide - index,
          center: 0,
        };
      },
      [geometry, premodel, preOffset, fade, breakpointMode, index],
    );

    const breakpointCss = React.useMemo(() => {
      if (!breakpointMode) return null;
      const spv = spvConfig as number | CarouselBreakpoints<number>;
      const keys = new Set<number>();
      if (isBreakpoints(spv)) breakpointKeys(spv).forEach((key) => keys.add(key));
      if (isBreakpoints(gap)) breakpointKeys(gap).forEach((key) => keys.add(key));
      const list = [...keys].sort((a, b) => a - b);
      const selector = `[data-qy-carousel-track="${uid}"]`;
      return list
        .map((key, listIndex) => {
          const width = listIndex === 0 ? 0 : key;
          const perView = clamp(resolveResponsive(spv, width, 1), 1, 50);
          const gapPx = Math.max(0, resolveResponsive(gap, width, 0));
          const stepModel = buildStepTrack(slideCount, perView, alignMode, loop, snapMode, fade);
          const snapIndex = stepModel.slideSnap[clamp(initialAnchor, 0, slideCount - 1)] ?? 0;
          const at = snapOffset(stepModel, snapIndex);
          let rules = `${selector}{--qy-spv:${perView};--qy-gap:${gapPx}px}`;
          for (let slide = 0; slide < slideCount; slide++) {
            const steps = fade ? 0 : formatNumber(slideX(stepModel, slide, at));
            rules += `${selector}>[data-qy-slide="${slide}"]{--qy-pos:${steps}}`;
          }
          return listIndex === 0 ? rules : `@container (min-width: ${key}px){${rules}}`;
        })
        .join("\n");
      // spvKey / gapKey 代表断点对象的内容。
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [breakpointMode, spvKey, gapKey, uid, slideCount, alignMode, loop, snapMode, fade, initialAnchor]);

    const trackVars = React.useMemo<React.CSSProperties | undefined>(() => {
      if (breakpointMode) return undefined;
      // "auto" 时只需要间距：测量前按普通横向排布（flex + gap）。
      const gapPx = isBreakpoints(gap) ? smallestBreakpoint(gap, 0) : gap;
      return {
        "--qy-spv": autoWidth ? undefined : clamp(spvConfig as number, 1, 50),
        "--qy-gap": `${Math.max(0, gapPx)}px`,
      } as React.CSSProperties;
      // spvKey / gapKey 代表断点对象的内容，行内对象每次渲染都是新引用。
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoWidth, breakpointMode, spvKey, gapKey]);

    /* ---------------- 可见性（inert / 懒加载） ---------------- */

    const [view, setView] = React.useState<ViewState>(() => {
      if (!premodel) {
        const all = new Array(slideCount).fill(true);
        return { visible: all, near: all };
      }
      const visible = visibleAt(premodel, preOffset, slideCount);
      return { visible, near: expandNear(visible, premodel.loop) };
    });

    const slideElements = React.useRef<Array<HTMLElement | null>>([]);
    const hideOffscreenRef = React.useRef(hideOffscreen);
    hideOffscreenRef.current = hideOffscreen;
    // 键盘切换后要聚焦的幻灯片：目标幻灯片解除 inert 并提交后再聚焦。
    const focusRequestRef = React.useRef<{
      slide: number;
      container: boolean;
      time: number;
    } | null>(null);

    /** 焦点所在的幻灯片即将设为 inert 时，先把焦点移到当前吸附点的可见幻灯片上，避免落回 body。 */
    const rescueFocus = React.useCallback((track: Track, visibleNow: boolean[]) => {
      if (!hideOffscreenRef.current || typeof document === "undefined") return;
      const active = document.activeElement as HTMLElement | null;
      if (!active) return;
      const slides = slideElements.current;
      const holder = slides.findIndex((element) => element?.contains(active));
      if (holder < 0 || visibleNow[holder]) return;
      const group = track.snapSlides[indexRef.current] ?? [];
      const target = group.find((slide) => visibleNow[slide]) ?? visibleNow.indexOf(true);
      const element = target >= 0 ? slides[target] : null;
      if (element) focusSlide(element, active === slides[holder]);
    }, []);

    const updateView = React.useCallback(
      (track: Track, at: number, settle: boolean) => {
        const total = track.sizes.length;
        const visibleNow = visibleAt(track, at, total);
        if (settle) rescueFocus(track, visibleNow);
        setView((previous) => {
          // 决定目标时先解除目标位置上的 inert（滑入途中即可交互），停稳后再按实际位置收紧。
          const visible =
            settle || previous.visible.length !== total
              ? visibleNow
              : previous.visible.map((flag, slide) => flag || visibleNow[slide]);
          const near = expandNear(visibleNow, track.loop, previous.near.length === total ? previous.near : undefined);
          if (sameFlags(visible, previous.visible) && sameFlags(near, previous.near)) {
            return previous;
          }
          return { visible, near };
        });
      },
      [rescueFocus],
    );

    /* ---------------- 回调与外部状态 ---------------- */

    const callbacksRef = React.useRef({ onIndexChange, onSettle });
    callbacksRef.current = { onIndexChange, onSettle };

    const autoplayOptions = autoplay
      ? autoplay === true
        ? {}
        : autoplay
      : null;
    const autoplayDelay = Math.max(500, autoplayOptions?.delay ?? 5000);
    const pauseOnHover = autoplayOptions?.pauseOnHover ?? true;
    const stopOnInteraction = autoplayOptions?.stopOnInteraction ?? false;
    const ignoreReducedMotion = autoplayOptions?.ignoreReducedMotion ?? false;
    const autoplayConfigured = Boolean(autoplayOptions);

    const [playing, setPlaying] = React.useState(true);
    const userToggledRef = React.useRef(false);
    const [completedIndex, setCompletedIndex] = React.useState<number | null>(null);
    const [hovered, setHovered] = React.useState(false);
    const [focusVisible, setFocusVisible] = React.useState(false);
    const [pressed, setPressed] = React.useState(false);
    const [wheeling, setWheeling] = React.useState(false);
    const [documentHidden, setDocumentHidden] = React.useState(false);

    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const inView = useInView(rootRef, { amount: 0.25 });

    const setRootRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const commitIndex = React.useCallback(
      (next: number, source: InteractionSource) => {
        const track = geometryRef.current ?? premodelRef.current;
        if (next === indexRef.current) return;
        indexRef.current = next;
        anchorRef.current = track?.snapSlides[next]?.[0] ?? next;
        autoplayProgress.jump(0);
        setIndex(next);
        if (source !== "prop") callbacksRef.current.onIndexChange?.(next);
      },
      [autoplayProgress],
    );

    /* ---------------- 动画 ---------------- */

    const animationRef = React.useRef<{
      id: number;
      controls: AnimationPlaybackControlsWithThen | null;
      /** 当前位移动画的目标（惯性滑行时未知，为 null） */
      target: number | null;
    }>({ id: 0, controls: null, target: null });

    // 触控板手势：target 为跟随的目标位置，startVirtual 为手势开始时的吸附点，
    // samples 为本次手势最近几次的位移；识别到松手惯性时立即吸附，否则停止 WHEEL_SNAP_DELAY 后由定时器吸附。
    // coast 记录吸附后仍在到来的惯性：time 为上一次被吞掉的事件，last 为它的位移绝对值。
    const wheelRef = React.useRef({
      target: 0,
      time: -Infinity,
      startVirtual: 0,
      origin: 0,
      samples: [] as WheelSample[],
      coast: { time: -Infinity, sign: 0, last: 0 },
    });
    const wheelTimer = React.useRef<number | undefined>(undefined);

    const endWheel = React.useCallback(() => {
      window.clearTimeout(wheelTimer.current);
      wheelTimer.current = undefined;
      wheelRef.current.time = -Infinity;
      setWheeling(false);
    }, []);

    const settle = React.useCallback(() => {
      const track = geometryRef.current;
      if (!track) return;
      updateView(track, offset.get(), true);
      callbacksRef.current.onSettle?.(indexRef.current);
    }, [offset, updateView]);

    const stopOffset = React.useCallback(() => {
      animationRef.current.id++;
      animationRef.current.controls = null;
      animationRef.current.target = null;
      offset.stop();
    }, [offset]);

    const runOffset = React.useCallback(
      (target: number, transition: ValueAnimationTransition<number>) => {
        const id = ++animationRef.current.id;
        const controls = animate(offset, target, transition);
        animationRef.current.controls = controls;
        animationRef.current.target = target;
        controls.then(() => {
          if (animationRef.current.id === id) settle();
        });
      },
      [offset, settle],
    );

    const goToVirtual = React.useCallback(
      (virtualIndex: number, source: InteractionSource, options?: CarouselGoToOptions) => {
        const track = geometryRef.current;
        if (!track) {
          // 测量前：只记录目标，测量后直接摆到这里。
          const total = premodel?.snaps.length ?? Math.max(1, slideCount);
          const next = effectiveLoop ? mod(virtualIndex, total) : clamp(virtualIndex, 0, total - 1);
          virtualRef.current = next;
          commitIndex(next, source);
          return;
        }
        // 箭头、键盘、程序跳转接管进行中的触控板手势，不再等它的定时吸附。
        if (wheelTimer.current !== undefined) endWheel();
        const total = track.snaps.length;
        const target = track.loop ? virtualIndex : clamp(virtualIndex, 0, total - 1);
        virtualRef.current = target;
        commitIndex(track.loop ? mod(target, total) : target, source);
        const to = snapOffset(track, target);
        updateView(track, to, false);
        if (options?.instant) {
          stopOffset();
          offset.jump(to);
          settle();
          return;
        }
        runOffset(to, reducedRef.current ? REDUCED_TWEEN : PROGRAM_SPRING);
      },
      [commitIndex, effectiveLoop, endWheel, offset, premodel, runOffset, settle, slideCount, stopOffset, updateView],
    );

    const goTo = React.useCallback(
      (target: number, options?: CarouselGoToOptions, source: InteractionSource = "program") => {
        const track = geometryRef.current;
        const total = track ? track.snaps.length : count;
        const rounded = Math.round(target);
        if (track?.loop) {
          const current = virtualRef.current;
          const delta = mod(rounded - current, total);
          const shortest = delta > total / 2 ? delta - total : delta;
          goToVirtual(current + shortest, source, options);
        } else {
          goToVirtual(clamp(rounded, 0, total - 1), source, options);
        }
      },
      [count, goToVirtual],
    );

    const markInteraction = React.useCallback(() => {
      setCompletedIndex(null);
      if (stopOnInteraction && autoplayConfigured) {
        userToggledRef.current = true;
        setPlaying(false);
      }
    }, [stopOnInteraction, autoplayConfigured]);

    /* ---------------- 测量 ---------------- */

    const viewportRef = React.useRef<HTMLDivElement | null>(null);
    const trackRef = React.useRef<HTMLDivElement | null>(null);
    const [viewportNode, setViewportNode] = React.useState<HTMLDivElement | null>(null);
    const dragRef = React.useRef<DragState | null>(null);
    const warnedRef = React.useRef(false);

    const configRef = React.useRef({
      spvConfig,
      gap,
      alignMode,
      loop,
      snapMode,
      fade,
      autoHeight,
      slideCount,
    });
    configRef.current = {
      spvConfig,
      gap,
      alignMode,
      loop,
      snapMode,
      fade,
      autoHeight,
      slideCount,
    };

    const measure = React.useCallback(
      (sync: boolean) => {
        const viewport = viewportRef.current;
        const trackElement = trackRef.current;
        const config = configRef.current;
        if (!viewport || !trackElement) return;
        // 与 CSS 量同一个盒子：幻灯片的百分比宽度基于轨道的内容盒（轨道铺满视口的内容盒，
        // 容器查询也按它判断），且保留小数——clientWidth 含 padding 且取整，
        // 断点附近会与容器查询选到不同的每屏张数。
        const trackStyle = getComputedStyle(trackElement);
        const chromeX =
          parseFloat(trackStyle.paddingLeft) +
          parseFloat(trackStyle.paddingRight) +
          parseFloat(trackStyle.borderLeftWidth) +
          parseFloat(trackStyle.borderRightWidth);
        const declared = parseFloat(trackStyle.width);
        const width = trackStyle.boxSizing === "border-box" ? declared - chromeX : declared;
        // 断点按容器查询的宽度（视口内容盒 = 轨道的外框）解析。
        const containerWidth = width + chromeX;
        if (!Number.isFinite(width) || width <= 0) return;
        const total = config.slideCount;
        const perView =
          config.spvConfig === "auto"
            ? null
            : clamp(resolveResponsive(config.spvConfig, containerWidth, 1), 1, 50);
        const gapPx = Math.max(0, resolveResponsive(config.gap, containerWidth, 0));
        const sizes: number[] = [];
        const heights: number[] | null = config.autoHeight ? [] : null;
        for (let slide = 0; slide < total; slide++) {
          const element = slideElements.current[slide];
          if (perView !== null) {
            sizes.push((width - gapPx * (perView - 1)) / perView);
          } else {
            const measured = element ? parseFloat(getComputedStyle(element).width) : 0;
            sizes.push(Number.isFinite(measured) ? measured : element?.offsetWidth ?? 0);
          }
          heights?.push(element?.offsetHeight ?? 0);
        }
        const track = buildTrack({
          width,
          gap: gapPx,
          sizes,
          align: config.alignMode,
          loop: config.loop,
          snap: config.snapMode,
          pageSize: perView === null ? null : Math.max(1, Math.floor(perView + 1e-3)),
          fade: config.fade,
          heights,
        });
        if (track.snapHeights) {
          // autoHeight 设置的是视口的高度：border-box 时要加上视口自己的上下 padding 与边框。
          const style = getComputedStyle(viewport);
          const chrome =
            style.boxSizing === "border-box"
              ? parseFloat(style.paddingTop) +
                parseFloat(style.paddingBottom) +
                parseFloat(style.borderTopWidth) +
                parseFloat(style.borderBottomWidth)
              : 0;
          if (chrome > 0) track.snapHeights = track.snapHeights.map((height) => height + chrome);
        }
        if (config.loop && !track.loop && total > 1 && !warnedRef.current && isDevelopment()) {
          warnedRef.current = true;
          console.warn(
            "[Carousel] 轨道总长不足「视口宽 + 最宽的一张」，loop 已退化为不循环。",
          );
        }
        const previous = geometryRef.current;
        if (
          previous &&
          sameLayout(previous, track) &&
          sameNumbers(previous.snapHeights, track.snapHeights)
        ) {
          return;
        }
        const layoutChanged = !previous || !sameLayout(previous, track);
        geometryRef.current = track;
        let interrupted = false;
        if (layoutChanged) {
          // 尺寸或断点变化：让原来的第一张保持对齐，直接设置位置（不做动画）。
          const anchor = clamp(anchorRef.current, 0, Math.max(0, total - 1));
          const nextIndex = clamp(
            track.slideSnap[anchor] ?? 0,
            0,
            track.snaps.length - 1,
          );
          if (!dragRef.current?.dragging) {
            // 打断了进行中的切换（或触控板手势）：跳到位后补发 onSettle。
            interrupted = Boolean(previous) && (offset.isAnimating() || wheelTimer.current !== undefined);
            if (wheelTimer.current !== undefined) endWheel();
            stopOffset();
            virtualRef.current = nextIndex;
            offset.jump(snapOffset(track, nextIndex));
          }
          if (nextIndex !== indexRef.current) {
            indexRef.current = nextIndex;
            autoplayProgress.jump(0);
            if (previous) callbacksRef.current.onIndexChange?.(nextIndex);
          }
        }
        const apply = () => {
          setGeometry(track);
          setIndex(indexRef.current);
          updateView(track, offset.get(), true);
        };
        if (sync) flushSync(apply);
        else apply();
        if (interrupted) callbacksRef.current.onSettle?.(indexRef.current);
      },
      [autoplayProgress, endWheel, offset, stopOffset, updateView],
    );

    useIsoLayoutEffect(() => {
      measure(false);
    }, [measure, slideCount, spvKey, gapKey, alignMode, loop, snapMode, fade, autoHeight]);

    React.useEffect(() => {
      if (!viewportNode || typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(() => measure(true));
      observer.observe(viewportNode);
      return () => observer.disconnect();
    }, [viewportNode, measure]);

    // autoWidth / autoHeight 依赖每张的尺寸：每个幻灯片节点挂载时观察、卸载时取消，
    // 换了 key（个数不变）的新节点同样会被观察，observe 的首次回调也会触发一次测量。
    const slideObserverRef = React.useRef<ResizeObserver | null>(null);
    React.useEffect(() => {
      if (!(autoWidth || autoHeight) || typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(() => measure(true));
      slideObserverRef.current = observer;
      slideElements.current.forEach((element) => element && observer.observe(element));
      return () => {
        slideObserverRef.current = null;
        observer.disconnect();
      };
    }, [measure, autoWidth, autoHeight]);

    /* ---------------- 受控 index ---------------- */

    // 依赖 index：用户切换后若父组件没有写回新值（拒绝这次切换），滑回受控的值。
    React.useEffect(() => {
      if (indexProp === undefined) return;
      const rounded = Math.round(indexProp);
      const target = effectiveLoop ? mod(rounded, count) : clamp(rounded, 0, count - 1);
      if (target !== indexRef.current) goTo(target, undefined, "prop");
    }, [indexProp, index, count, effectiveLoop, goTo]);

    /* ---------------- 拖动 ---------------- */

    const suppressClickRef = React.useRef(false);
    const pressCleanupRef = React.useRef<(() => void) | null>(null);

    /** 松手：按速度投影选择吸附点，用带速度的弹簧滑过去；snap="none" 时惯性滑行。 */
    const release = React.useCallback(
      (velocity: number) => {
        const track = geometryRef.current;
        if (!track) return;
        const current = offset.get();
        const outside = !track.loop && (current < track.min - 0.5 || current > track.max + 0.5);
        let v = velocity;
        // 越界时朝外的速度不再继续推远。
        if ((current < track.min && v < 0) || (current > track.max && v > 0)) v = 0;
        const total = track.snaps.length;

        if (snapMode === "none") {
          const landing = track.loop
            ? current + projectMomentum(v)
            : clamp(current + projectMomentum(v), track.min, track.max);
          const nearest = Math.round(virtualPosition(track, landing));
          virtualRef.current = track.loop ? nearest : clamp(nearest, 0, total - 1);
          commitIndex(track.loop ? mod(nearest, total) : clamp(nearest, 0, total - 1), "user");
          updateView(track, landing, false);
          if (reducedRef.current) {
            // 减少动态效果：直接缓动到投影的落点（已夹在两端），没有越界回弹。
            runOffset(landing, REDUCED_TWEEN);
            return;
          }
          const id = ++animationRef.current.id;
          // inertia 只用起点和速度计算落点，目标值不参与；但起止相同时 Motion 会跳过动画
          // （PIT-0009），所以传一个不同的占位目标。
          const controls = animate(offset, current + 1, {
            type: "inertia",
            velocity: v,
            power: INERTIA_POWER,
            timeConstant: TIME_CONSTANT,
            min: track.loop ? undefined : track.min,
            max: track.loop ? undefined : track.max,
            bounceStiffness: BOUNCE_STIFFNESS,
            bounceDamping: BOUNCE_DAMPING,
            restDelta: 0.5,
          });
          animationRef.current.controls = controls;
          animationRef.current.target = null;
          controls.then(() => {
            if (animationRef.current.id === id) settle();
          });
          return;
        }

        let target: number;
        if (track.paging) {
          // 分页：只在松手位置两侧的两页之间选择（与 iOS 分页一致）——
          // 轻甩按速度方向翻到下一页，用力甩也只到下一页；慢慢松手落在最近的一页，
          // 一次拖过多页时不会被拉回手势开始的那一页。
          const pos = virtualPosition(track, current);
          const lower = Math.floor(pos + 1e-3);
          const upper = Math.ceil(pos - 1e-3);
          if (Math.abs(v) >= FLICK_VELOCITY) {
            target = v > 0 ? lower + 1 : upper - 1;
          } else {
            target = clamp(
              Math.round(virtualPosition(track, current + projectMomentum(v))),
              lower,
              upper,
            );
          }
        } else {
          target = Math.round(virtualPosition(track, current + projectMomentum(v)));
        }
        if (!track.loop) target = clamp(target, 0, total - 1);
        virtualRef.current = target;
        commitIndex(track.loop ? mod(target, total) : target, "user");
        const to = snapOffset(track, target);
        updateView(track, to, false);
        runOffset(
          to,
          reducedRef.current
            ? REDUCED_TWEEN
            : {
                type: "spring",
                visualDuration: RELEASE_VISUAL_DURATION,
                bounce: outside
                  ? 0
                  : clamp(Math.abs(v) / RELEASE_BOUNCE_VELOCITY, 0, RELEASE_MAX_BOUNCE),
                velocity: v,
                ...REST,
              },
        );
      },
      [commitIndex, offset, runOffset, settle, snapMode, updateView],
    );

    /** 触控板手势的吸附目标：最近的吸附点；分页时滑过 15% 视口宽就朝滑动方向翻一页。 */
    const wheelSnapTarget = React.useCallback((track: Track) => {
      const { target: landing, startVirtual, origin } = wheelRef.current;
      const moved = landing - origin;
      let nearest = Math.round(virtualPosition(track, landing));
      // 吸附途中又开始的手势：弹簧还没到位，当前位置可能更靠近上一页，不能逆着这次滑动的方向退回去。
      if ((nearest - startVirtual) * moved < 0) nearest = startVirtual;
      if (track.paging && nearest === startVirtual) {
        const delta = landing - snapOffset(track, startVirtual);
        if (Math.abs(delta) > track.width * WHEEL_PAGE_RATIO && delta * moved > 0) {
          nearest += Math.sign(delta);
        }
      }
      return track.loop ? nearest : clamp(nearest, 0, track.snaps.length - 1);
    }, []);

    /**
     * 触控板松手（识别到惯性）：与拖动松手一致，按速度选择吸附点，用带当前速度的弹簧直接滑过去，
     * 不再先跟着系统惯性停到半路、等惯性结束再吸附。
     */
    const releaseWheel = React.useCallback(
      (track: Track, velocity: number) => {
        const { target: landing } = wheelRef.current;
        const total = track.snaps.length;
        let target: number;
        if (track.paging) {
          const pos = virtualPosition(track, landing);
          target =
            Math.abs(velocity) >= FLICK_VELOCITY
              ? velocity > 0
                ? Math.floor(pos + 1e-3) + 1
                : Math.ceil(pos - 1e-3) - 1
              : wheelSnapTarget(track);
        } else {
          target = Math.round(virtualPosition(track, landing + projectMomentum(velocity)));
          const { startVirtual } = wheelRef.current;
          if ((target - startVirtual) * velocity < 0) target = startVirtual;
        }
        if (!track.loop) target = clamp(target, 0, total - 1);
        endWheel();
        markInteraction();
        virtualRef.current = target;
        commitIndex(track.loop ? mod(target, total) : target, "user");
        const to = snapOffset(track, target);
        updateView(track, to, false);
        runOffset(
          to,
          reducedRef.current
            ? REDUCED_TWEEN
            : {
                type: "spring",
                visualDuration: RELEASE_VISUAL_DURATION,
                bounce: clamp(Math.abs(velocity) / RELEASE_BOUNCE_VELOCITY, 0, RELEASE_MAX_BOUNCE),
                // 从屏幕上正在跟随的速度出发，衔接处没有顿挫。
                velocity: offset.getVelocity(),
                ...REST,
              },
        );
      },
      [commitIndex, endWheel, markInteraction, offset, runOffset, updateView, wheelSnapTarget],
    );

    /** 结束一次按下（松手、取消、或按键已经松开的鼠标移动）。 */
    const finishPress = React.useCallback(
      (pointerId: number, timeStamp: number, cancelled: boolean) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== pointerId) return;
        dragRef.current = null;
        pressCleanupRef.current?.();
        pressCleanupRef.current = null;
        setPressed(false);
        rootRef.current?.removeAttribute("data-dragging");
        const track = geometryRef.current;
        if (!track) return;
        if (!drag.dragging) {
          if (!drag.wasAnimating) return;
          // 轻点打断了动画：从停下的位置继续滑到原来的目标；
          // 若按下时还在明显运动，这次轻点只用来停住，不触发幻灯片里的链接。
          if (drag.caughtMoving && !cancelled) {
            suppressClickRef.current = true;
            window.setTimeout(() => {
              suppressClickRef.current = false;
            }, 0);
          }
          if (snapMode === "none") release(0);
          else goToVirtual(virtualRef.current, "program");
          return;
        }
        // 这次松手是拖动，吞掉随后的 click。
        suppressClickRef.current = true;
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
        markInteraction();
        release(cancelled ? 0 : -velocityFrom(drag.samples, timeStamp));
      },
      [goToVirtual, markInteraction, release, snapMode],
    );

    const finishPressRef = React.useRef(finishPress);
    finishPressRef.current = finishPress;

    /** 让第 slide 张完整可见：分页类模式跳到它所在的吸附点，自由滚动时只移动刚好够的距离。 */
    const revealSlide = React.useCallback(
      (slide: number) => {
        const track = geometryRef.current;
        if (!track || track.static || dragRef.current?.dragging || slide >= track.sizes.length) {
          return;
        }
        const free = snapMode === "none";
        const pending = animationRef.current.target;
        const at = free
          ? offset.isAnimating() && pending !== null
            ? pending
            : offset.get()
          : snapOffset(track, virtualRef.current);
        const x = slideX(track, slide, at);
        const size = track.sizes[slide];
        if (track.fade || (x >= -0.5 && x + size <= track.width + 0.5)) return;
        markInteraction();
        if (!free) {
          goTo(track.slideSnap[slide] ?? 0, undefined, "user");
          return;
        }
        if (wheelTimer.current !== undefined) endWheel();
        const margin = Math.min(REVEAL_MARGIN, Math.max(0, (track.width - size) / 2));
        let next = x < 0 || size > track.width ? at + x - margin : at + x + size - track.width + margin;
        if (!track.loop) next = clamp(next, track.min, track.max);
        const total = track.snaps.length;
        const nearest = Math.round(virtualPosition(track, next));
        virtualRef.current = track.loop ? nearest : clamp(nearest, 0, total - 1);
        commitIndex(track.loop ? mod(nearest, total) : clamp(nearest, 0, total - 1), "user");
        updateView(track, next, false);
        runOffset(next, reducedRef.current ? REDUCED_TWEEN : PROGRAM_SPRING);
      },
      [commitIndex, endWheel, goTo, markInteraction, offset, runOffset, snapMode, updateView],
    );

    // 卸载时移除仍挂在 window 上的按下监听。
    React.useEffect(
      () => () => {
        pressCleanupRef.current?.();
        pressCleanupRef.current = null;
      },
      [],
    );

    const viewportHandlers = React.useMemo<ViewportHandlers>(
      () => ({
        onPointerDown: (event) => {
          if (event.defaultPrevented) return;
          const existing = dragRef.current;
          if (existing) {
            // 已有一次按下：其他手指（双指轻点、捏合）一律忽略。只有同一个指针再次按下，
            // 或同类型的主指针（说明上一次的抬起丢失了）才替换它，并沿用它打断动画的状态。
            const stale =
              existing.pointerId === event.pointerId ||
              (event.isPrimary && existing.pointerType === event.pointerType && !existing.dragging);
            if (!stale) return;
            pressCleanupRef.current?.();
            pressCleanupRef.current = null;
            dragRef.current = null;
            rootRef.current?.removeAttribute("data-dragging");
          }
          if (event.pointerType === "mouse" && event.button !== 0) return;
          const track = geometryRef.current;
          if (!track || track.static) return;
          if (event.pointerType === "mouse" ? !draggable : !swipe) return;
          const target = event.target as Element;
          // 内置控件、输入框与嵌套轮播自己处理。
          if (
            target.closest("[data-carousel-control]") ||
            target.closest(INPUT_SELECTOR) ||
            target.closest('[data-slot="carousel-content"]') !== event.currentTarget
          ) {
            return;
          }
          // 进行中的触控板手势同样视为动画：按下后从它的吸附目标继续，而不是手势开始前的那一张。
          const wheelPending = wheelTimer.current !== undefined;
          if (wheelPending) {
            virtualRef.current = wheelSnapTarget(track);
            endWheel();
          }
          const current = offset.get();
          const speed = Math.abs(offset.getVelocity());
          const wasAnimating =
            offset.isAnimating() || wheelPending || Boolean(existing?.wasAnimating);
          const caughtMoving =
            Boolean(existing?.caughtMoving) ||
            (wasAnimating &&
              (speed > CATCH_SPEED ||
                (snapMode !== "none" &&
                  Math.abs(snapOffset(track, virtualRef.current) - current) > CATCH_DISTANCE)));
          // 立即停下正在进行的动画，从屏幕上的当前值继续。
          stopOffset();
          setPressed(true);
          dragRef.current = {
            pointerId: event.pointerId,
            pointerType: event.pointerType,
            startX: event.clientX,
            startY: event.clientY,
            startRaw: track.loop
              ? current
              : removeRubber(current, track.min, track.max, track.width),
            wasAnimating,
            caughtMoving,
            dragging: false,
            samples: [{ t: event.timeStamp, x: event.clientX }],
          };
          // 拖动开始前没有捕获指针：在视口外松开时视口收不到 pointerup，由 window 兜底结束这次按下。
          const pointerId = event.pointerId;
          const onUp = (native: PointerEvent) => {
            if (native.pointerId === pointerId) {
              finishPressRef.current(pointerId, native.timeStamp, native.type === "pointercancel");
            }
          };
          window.addEventListener("pointerup", onUp, true);
          window.addEventListener("pointercancel", onUp, true);
          pressCleanupRef.current = () => {
            window.removeEventListener("pointerup", onUp, true);
            window.removeEventListener("pointercancel", onUp, true);
          };
        },
        onPointerMove: (event) => {
          const drag = dragRef.current;
          const track = geometryRef.current;
          if (!drag || !track || drag.pointerId !== event.pointerId) return;
          if (event.pointerType === "mouse" && event.buttons === 0) {
            // 鼠标键已经松开（抬起事件丢失）：结束这次按下，而不是在悬停时拖动。
            finishPress(event.pointerId, event.timeStamp, false);
            return;
          }
          const dx = event.clientX - drag.startX;
          const dy = event.clientY - drag.startY;
          if (!drag.dragging) {
            if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
            if (Math.abs(dy) > Math.abs(dx)) {
              // 纵向为主：放弃本次拖动（触摸时浏览器会接管滚动）。
              dragRef.current = null;
              pressCleanupRef.current?.();
              pressCleanupRef.current = null;
              setPressed(false);
              if (drag.wasAnimating) {
                if (snapMode === "none") release(0);
                else goToVirtual(virtualRef.current, "program");
              }
              return;
            }
            drag.dragging = true;
            // 确认是拖动后才捕获指针，否则幻灯片内的 click 落不到原元素。
            try {
              event.currentTarget.setPointerCapture(event.pointerId);
            } catch {
              // 指针已失效（如合成事件），不捕获也能继续跟随。
            }
            rootRef.current?.setAttribute("data-dragging", "");
            window.getSelection()?.removeAllRanges();
          }
          drag.samples.push({ t: event.timeStamp, x: event.clientX });
          while (
            drag.samples.length > 2 &&
            event.timeStamp - drag.samples[0].t > VELOCITY_WINDOW
          ) {
            drag.samples.shift();
          }
          const raw = drag.startRaw - dx;
          offset.set(track.loop ? raw : applyRubber(raw, track.min, track.max, track.width));
        },
        onPointerUp: (event) => finishPress(event.pointerId, event.timeStamp, false),
        onPointerCancel: (event) => finishPress(event.pointerId, event.timeStamp, true),
        onLostPointerCapture: (event) => {
          // 触屏按下时浏览器会把指针隐式捕获到手指下的元素，拖动开始后改由视口捕获，
          // 原元素冒泡上来的 lostpointercapture 不是拖动结束（PIT-0011）。
          if (event.target !== event.currentTarget) return;
          if (dragRef.current?.dragging) finishPress(event.pointerId, event.timeStamp, false);
        },
        onFocus: (event) => {
          // 键盘聚焦到不完整可见的幻灯片（部分露出的下一张、自由滚动时视口外的标签）时滚入视野；
          // 浏览器自己的滚动会被 onScroll 归零。
          const target = event.target as HTMLElement;
          if (!target.matches?.(":focus-visible")) return;
          const slide = slideElements.current.findIndex((element) => element?.contains(target));
          if (slide >= 0) revealSlide(slide);
        },
        onClickCapture: (event) => {
          if (suppressClickRef.current) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          if (!selectOnClick) return;
          const slide = (event.target as Element).closest<HTMLElement>(
            '[data-slot="carousel-item"]',
          );
          const track = geometryRef.current;
          if (!slide || !track || slide.closest('[data-slot="carousel-content"]') !== event.currentTarget) {
            return;
          }
          const slideIndex = Number(slide.dataset.index);
          const snapIndex = track.slideSnap[slideIndex];
          if (snapIndex === undefined || snapIndex === indexRef.current) return;
          event.preventDefault();
          event.stopPropagation();
          markInteraction();
          goTo(snapIndex, undefined, "user");
        },
        onScroll: (event) => {
          // overflow: hidden 的视口在聚焦时仍可能被浏览器滚动，归零以免与平移叠加。
          event.currentTarget.scrollLeft = 0;
          event.currentTarget.scrollTop = 0;
        },
      }),
      [draggable, swipe, offset, snapMode, endWheel, wheelSnapTarget, stopOffset, finishPress, release, goToVirtual, selectOnClick, markInteraction, goTo, revealSlide],
    );

    /* ---------------- 滚轮 / 触控板 ---------------- */

    const markInteractionRef = React.useRef(markInteraction);
    markInteractionRef.current = markInteraction;

    const wheelConfigRef = React.useRef({ wheel, snapMode });
    wheelConfigRef.current = { wheel, snapMode };

    React.useEffect(() => {
      const node = viewportNode;
      if (!node) return;
      const onWheel = (event: WheelEvent) => {
        const track = geometryRef.current;
        if (!wheelConfigRef.current.wheel || !track || track.static) return;
        if (dragRef.current || event.ctrlKey) return;
        // 嵌套轮播：只由最近的那个处理。
        if ((event.target as Element).closest?.('[data-slot="carousel-content"]') !== node) return;
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? track.width : 1;
        let dx = event.deltaX * unit;
        const dy = event.deltaY * unit;
        if (event.shiftKey && !dx) dx = dy;
        else if (Math.abs(dx) <= Math.abs(dy)) return; // 纵向为主：交还给页面。
        if (!dx) return;
        event.preventDefault();
        const wheelState = wheelRef.current;
        const { coast } = wheelState;
        const magnitude = Math.abs(dx);
        // 已经吸附：同向且没有重新加速的事件都是松手后的系统惯性，吞掉不再移动。
        if (
          event.timeStamp - coast.time <= WHEEL_IDLE &&
          Math.sign(dx) === coast.sign &&
          magnitude <= coast.last * WHEEL_REGAIN_RATIO + WHEEL_REGAIN_SLOP
        ) {
          coast.time = event.timeStamp;
          coast.last = magnitude;
          return;
        }
        coast.time = -Infinity;
        if (wheelTimer.current === undefined || event.timeStamp - wheelState.time > WHEEL_IDLE) {
          const current = offset.get();
          wheelState.target = track.loop ? current : clamp(current, track.min, track.max);
          wheelState.origin = wheelState.target;
          // 手势开始时的吸附点：动画途中开始的手势以动画的目标为准。
          wheelState.startVirtual = offset.isAnimating()
            ? virtualRef.current
            : Math.round(virtualPosition(track, wheelState.target));
          wheelState.samples = [];
          setWheeling(true);
        }
        wheelState.time = event.timeStamp;
        let next = wheelState.target + dx;
        if (!track.loop) next = clamp(next, track.min, track.max);
        wheelState.target = next;
        const { samples } = wheelState;
        samples.push({ t: event.timeStamp, dx });
        if (samples.length > WHEEL_MOMENTUM_WINDOW) samples.shift();
        // 随手势更新目标吸附点：途中按下、按方向键或调用 api.next() 都从这里继续。
        virtualRef.current = wheelSnapTarget(track);
        if (wheelConfigRef.current.snapMode !== "none" && isWheelMomentum(samples)) {
          coast.time = event.timeStamp;
          coast.sign = Math.sign(dx);
          coast.last = magnitude;
          releaseWheel(track, wheelVelocity(samples));
          return;
        }
        const id = ++animationRef.current.id;
        const controls = animate(offset, next, reducedRef.current ? { duration: 0 } : WHEEL_SPRING);
        animationRef.current.controls = controls;
        animationRef.current.target = next;
        window.clearTimeout(wheelTimer.current);
        wheelTimer.current = window.setTimeout(() => {
          const latest = geometryRef.current;
          if (!latest) {
            endWheel();
            return;
          }
          const target = wheelSnapTarget(latest);
          endWheel();
          markInteractionRef.current();
          if (wheelConfigRef.current.snapMode === "none") {
            const total = latest.snaps.length;
            virtualRef.current = target;
            commitIndex(latest.loop ? mod(target, total) : target, "user");
            // 等跟随的短弹簧真正停下再触发 onSettle 与 inert 更新。
            if (animationRef.current.id === id && offset.isAnimating()) {
              controls.then(() => {
                if (animationRef.current.id === id) settle();
              });
            } else if (animationRef.current.id === id) {
              settle();
            }
            return;
          }
          goToVirtual(target, "user");
        }, WHEEL_SNAP_DELAY);
      };
      // iOS 上仅靠 touch-action 有时仍会接管手势；拖动中阻止 touchmove 的默认行为。
      const onTouchMove = (event: TouchEvent) => {
        if (dragRef.current?.dragging && event.cancelable) event.preventDefault();
      };
      const onSelectStart = (event: Event) => {
        if (dragRef.current?.dragging) event.preventDefault();
      };
      // 阻止浏览器原生拖动图片 / 链接。
      const onNativeDragStart = (event: DragEvent) => event.preventDefault();
      node.addEventListener("wheel", onWheel, { passive: false });
      node.addEventListener("touchmove", onTouchMove, { passive: false });
      node.addEventListener("selectstart", onSelectStart);
      node.addEventListener("dragstart", onNativeDragStart);
      return () => {
        node.removeEventListener("wheel", onWheel);
        node.removeEventListener("touchmove", onTouchMove);
        node.removeEventListener("selectstart", onSelectStart);
        node.removeEventListener("dragstart", onNativeDragStart);
        window.clearTimeout(wheelTimer.current);
      };
    }, [viewportNode, offset, endWheel, wheelSnapTarget, releaseWheel, commitIndex, settle, goToVirtual]);

    /* ---------------- 自动播放 ---------------- */

    React.useEffect(() => {
      if (reducedMotion && autoplayConfigured && !ignoreReducedMotion && !userToggledRef.current) {
        setPlaying(false);
      }
    }, [reducedMotion, autoplayConfigured, ignoreReducedMotion]);

    React.useEffect(() => {
      const update = () => setDocumentHidden(document.hidden);
      update();
      document.addEventListener("visibilitychange", update);
      return () => document.removeEventListener("visibilitychange", update);
    }, []);

    const autoplayEnabled = autoplayConfigured && !isStatic;
    const autoplayRunning =
      autoplayEnabled &&
      playing &&
      inView &&
      !documentHidden &&
      !pressed &&
      !wheeling &&
      !(hovered && pauseOnHover) &&
      !focusVisible;

    const advanceRef = React.useRef<() => void>(() => {});
    advanceRef.current = () => {
      setCompletedIndex(indexRef.current);
      const track = geometryRef.current;
      const total = track ? track.snaps.length : count;
      if (track?.loop || indexRef.current < total - 1) goToVirtual(virtualRef.current + 1, "autoplay");
      else goTo(0, undefined, "autoplay");
    };

    React.useEffect(() => {
      if (!autoplayRunning) return;
      const remaining = Math.max(0, 1 - autoplayProgress.get()) * (autoplayDelay / 1000);
      let cancelled = false;
      const controls = animate(autoplayProgress, 1, { duration: remaining, ease: "linear" });
      controls.then(() => {
        if (!cancelled && autoplayProgress.get() >= 1) advanceRef.current();
      });
      return () => {
        cancelled = true;
        controls.stop();
      };
    }, [autoplayRunning, autoplayDelay, autoplayProgress, index]);

    /* ---------------- 键盘 / 悬停 / 聚焦 ---------------- */

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || !keyboard || isStatic) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as Element;
      if (target.closest(INPUT_SELECTOR) || target.closest('[role="tablist"]')) return;
      const total = count;
      const before = indexRef.current;
      // 焦点在某张幻灯片内时，切换后焦点跟到新的吸附点（原幻灯片停稳后会变为 inert）。
      const fromSlide = slideElements.current.findIndex((element) => element?.contains(target));
      switch (event.key) {
        case "ArrowLeft":
          goToVirtual(virtualRef.current - 1, "user");
          break;
        case "ArrowRight":
          goToVirtual(virtualRef.current + 1, "user");
          break;
        case "Home":
          goTo(0, undefined, "user");
          break;
        case "End":
          goTo(total - 1, undefined, "user");
          break;
        default:
          return;
      }
      event.preventDefault();
      markInteraction();
      const track = geometryRef.current;
      if (fromSlide >= 0 && track && indexRef.current !== before) {
        const slide = track.snapSlides[indexRef.current]?.[0];
        if (slide !== undefined) {
          focusRequestRef.current = {
            slide,
            container: target === slideElements.current[fromSlide],
            time: Date.now(),
          };
        }
      }
    };

    // 目标幻灯片解除 inert 并提交后再聚焦（每次渲染检查一次，过期的请求丢弃）。
    useIsoLayoutEffect(() => {
      const request = focusRequestRef.current;
      if (!request) return;
      if (Date.now() - request.time > 1000) {
        focusRequestRef.current = null;
        return;
      }
      const element = slideElements.current[request.slide];
      if (!element || element.inert) return;
      focusRequestRef.current = null;
      focusSlide(element, request.container);
    });

    /* ---------------- 注册 ---------------- */

    const registerViewport = React.useCallback((node: HTMLDivElement | null) => {
      viewportRef.current = node;
      setViewportNode(node);
    }, []);
    const registerTrack = React.useCallback((node: HTMLDivElement | null) => {
      trackRef.current = node;
    }, []);
    const registerSlide = React.useCallback((slide: number, node: HTMLElement) => {
      const previous = slideElements.current[slide];
      if (previous === node) return;
      const observer = slideObserverRef.current;
      if (previous && observer) observer.unobserve(previous);
      slideElements.current[slide] = node;
      observer?.observe(node);
    }, []);
    const unregisterSlide = React.useCallback((slide: number, node: HTMLElement | null) => {
      if (!node || slideElements.current[slide] !== node) return;
      slideElements.current[slide] = null;
      slideObserverRef.current?.unobserve(node);
    }, []);
    const registerSlideCount = React.useCallback((value: number | null) => {
      setRegisteredCount(value);
    }, []);
    const [tabsCount, setTabsCount] = React.useState(0);
    const registerTabs = React.useCallback(() => {
      setTabsCount((value) => value + 1);
      return () => setTabsCount((value) => value - 1);
    }, []);
    const [toggleCount, setToggleCount] = React.useState(0);
    const registerToggle = React.useCallback(() => {
      setToggleCount((value) => value + 1);
      return () => setToggleCount((value) => value - 1);
    }, []);

    /* ---------------- 对外接口 ---------------- */

    const canPrev = effectiveLoop || index > 0;
    const canNext = effectiveLoop || index < count - 1;

    const play = React.useCallback(() => {
      userToggledRef.current = true;
      setPlaying(true);
    }, []);
    const pause = React.useCallback(() => {
      userToggledRef.current = true;
      setPlaying(false);
    }, []);

    const api = React.useMemo<CarouselApi>(
      () => ({
        index,
        count,
        slideCount,
        canPrev,
        canNext,
        playing: autoplayConfigured && playing,
        next: () => goToVirtual(virtualRef.current + 1, "program"),
        prev: () => goToVirtual(virtualRef.current - 1, "program"),
        goTo: (target, options) => goTo(target, options),
        goToSlide: (slide, options) => {
          const snaps = geometryRef.current?.slideSnap ?? premodel?.slideSnap;
          goTo(snaps?.[clamp(slide, 0, slideCount - 1)] ?? slide, options);
        },
        play,
        pause,
        position,
        autoplayProgress,
      }),
      [index, count, slideCount, canPrev, canNext, autoplayConfigured, playing, goToVirtual, goTo, premodel, play, pause, position, autoplayProgress],
    );

    React.useImperativeHandle(apiRef, () => api, [api]);

    const context = React.useMemo<CarouselContextValue>(
      () => ({
        uid,
        trackId,
        slideId,
        labels,
        loop: effectiveLoop,
        effect,
        crossFade,
        hideOffscreen,
        parallax: parallaxAmount,
        autoHeight,
        autoWidth,
        arrows,
        indicators,
        indicatorsPlacement,
        maxDots: Math.max(3, Math.round(maxDots)),
        mouseDraggable: draggable,
        breakpointCss,
        trackVars,
        measured: geometry !== null,
        slideCount,
        count,
        index,
        isStatic,
        canPrev,
        canNext,
        view,
        slideSnap: model?.slideSnap ?? [],
        snapSlides: model?.snapSlides ?? [],
        tabsMounted: tabsCount > 0,
        toggleCount,
        autoplayEnabled,
        playing: autoplayConfigured && playing,
        completedIndex,
        offset,
        position,
        autoplayProgress,
        viewportHeight,
        getLayout,
        api,
        markInteraction,
        registerViewport,
        registerTrack,
        registerSlide,
        unregisterSlide,
        registerSlideCount,
        registerTabs,
        registerToggle,
        viewportHandlers,
      }),
      [uid, trackId, slideId, labels, effectiveLoop, effect, crossFade, hideOffscreen, parallaxAmount, autoHeight, autoWidth, arrows, indicators, indicatorsPlacement, maxDots, draggable, breakpointCss, trackVars, geometry, slideCount, count, index, isStatic, canPrev, canNext, view, model, tabsCount, toggleCount, autoplayEnabled, autoplayConfigured, playing, completedIndex, offset, position, autoplayProgress, viewportHeight, getLayout, api, markInteraction, registerViewport, registerTrack, registerSlide, unregisterSlide, registerSlideCount, registerTabs, registerToggle, viewportHandlers],
    );

    return (
      <CarouselContext.Provider value={context}>
        <div
          ref={setRootRef}
          role="region"
          aria-roledescription={labels.roleDescription}
          aria-label={ariaLabel ?? labels.region}
          data-slot="carousel"
          {...props}
          className={cn("qy-carousel relative", className)}
          onKeyDown={handleKeyDown}
          onPointerEnter={(event) => {
            onPointerEnter?.(event);
            if (event.pointerType !== "touch") setHovered(true);
          }}
          onPointerLeave={(event) => {
            onPointerLeave?.(event);
            setHovered(false);
          }}
          onFocus={(event) => {
            onFocus?.(event);
            if ((event.target as Element).matches?.(":focus-visible")) setFocusVisible(true);
          }}
          onBlur={(event) => {
            onBlur?.(event);
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setFocusVisible(false);
            }
          }}
        >
          <CarouselStyles />
          {children}
          <div
            className="sr-only"
            aria-live={autoplayRunning ? "off" : "polite"}
            aria-atomic="true"
          >
            {count > 1 && snapMode !== "none"
              ? count === slideCount
                ? labels.slide(index + 1, count)
                : labels.page(index + 1, count)
              : null}
          </div>
        </div>
      </CarouselContext.Provider>
    );
  },
);

Carousel.displayName = "Carousel";

/* ------------------------------------------------------------------ */
/* CarouselContent                                                       */
/* ------------------------------------------------------------------ */

type MotionSafeDivProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
>;

/** CarouselContent 组件的属性 */
export interface CarouselContentProps extends MotionSafeDivProps {
  /** 轨道（所有幻灯片的容器）的类名 */
  trackClassName?: string;
}

/**
 * CarouselContent — 轮播的视口与轨道
 *
 * - 尺寸、宽高比与圆角写在这里（如 `aspect-video rounded-2xl`）
 * - 每个直接子元素是一张幻灯片；不是 `CarouselItem` 时自动包一层
 * - 按 Carousel 的 `arrows` / `indicators` 渲染内置箭头与指示器
 * - 承担拖动、触控板与点击拦截；不复制幻灯片，循环时每张自己绕回
 *
 * @example
 * ```tsx
 * <CarouselContent className="aspect-video rounded-2xl">
 *   <CarouselImage src="/a.jpg" alt="" />
 *   <CarouselImage src="/b.jpg" alt="" />
 * </CarouselContent>
 * ```
 */
export const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(
  function CarouselContent(
    {
      className,
      trackClassName,
      style,
      children,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture,
      onClickCapture,
      onFocus,
      onScroll,
      ...props
    },
    ref,
  ) {
    const context = useCarouselContext("CarouselContent");
    const slides = React.Children.toArray(children);
    const { registerSlideCount, registerViewport, viewportHandlers: handlers } = context;

    useIsoLayoutEffect(() => {
      registerSlideCount(slides.length);
    }, [registerSlideCount, slides.length]);
    React.useEffect(() => () => registerSlideCount(null), [registerSlideCount]);

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        registerViewport(node);
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref, registerViewport],
    );

    const showControls = !context.isStatic && context.count > 1;
    const showIndicators = showControls && context.indicators !== "none";
    // 自动播放必须能暂停（WCAG 2.2.2）：没有指示器、也没有在别处放置暂停按钮时，补一个独立按钮。
    const fallbackToggle =
      showControls &&
      context.autoplayEnabled &&
      context.indicators === "none" &&
      context.toggleCount === 0;
    const flexPreview = context.autoWidth && !context.measured;

    return (
      <>
        <motion.div
          ref={setRefs}
          data-slot="carousel-content"
          data-draggable={context.mouseDraggable && !context.isStatic ? "" : undefined}
          {...props}
          className={cn(
            "qy-carousel-viewport relative isolate overflow-hidden",
            context.breakpointCss && "@container",
            className,
          )}
          style={{
            ...style,
            height: context.autoHeight && context.measured ? context.viewportHeight : style?.height,
          }}
          onPointerDown={(event) => {
            onPointerDown?.(event);
            handlers.onPointerDown(event);
          }}
          onPointerMove={(event) => {
            onPointerMove?.(event);
            handlers.onPointerMove(event);
          }}
          onPointerUp={(event) => {
            onPointerUp?.(event);
            handlers.onPointerUp(event);
          }}
          onPointerCancel={(event) => {
            onPointerCancel?.(event);
            handlers.onPointerCancel(event);
          }}
          onLostPointerCapture={(event) => {
            onLostPointerCapture?.(event);
            handlers.onLostPointerCapture(event);
          }}
          onClickCapture={(event) => {
            onClickCapture?.(event);
            handlers.onClickCapture(event);
          }}
          onFocus={(event) => {
            onFocus?.(event);
            handlers.onFocus(event);
          }}
          onScroll={(event) => {
            onScroll?.(event);
            handlers.onScroll(event);
          }}
        >
          {context.breakpointCss ? <style>{context.breakpointCss}</style> : null}
          <div
            ref={context.registerTrack}
            id={context.trackId}
            data-qy-carousel-track={context.uid}
            className={cn(
              "relative h-full",
              flexPreview ? "flex" : "grid grid-cols-1",
              trackClassName,
            )}
            style={{
              ...context.trackVars,
              gap: flexPreview ? "var(--qy-gap, 0px)" : undefined,
            }}
          >
            <CarouselItemContext.Provider value={null}>
            {slides.map((child, slide) => (
              <SlideIndexContext.Provider
                key={React.isValidElement(child) && child.key !== null ? child.key : slide}
                value={slide}
              >
                {React.isValidElement(child) && child.type === CarouselItem ? (
                  child
                ) : (
                  <CarouselItem>{child}</CarouselItem>
                )}
              </SlideIndexContext.Provider>
            ))}
            </CarouselItemContext.Provider>
          </div>
          {showControls && context.arrows !== "none" ? (
            <>
              <CarouselArrow direction="prev" builtin />
              <CarouselArrow direction="next" builtin />
            </>
          ) : null}
          {showIndicators && context.indicatorsPlacement === "inside" ? (
            <CarouselIndicators
              appearance="overlay"
              className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2"
            />
          ) : null}
          {fallbackToggle ? (
            <AutoplayToggleButton
              context={context}
              variant="overlay"
              className="absolute right-3 bottom-3 z-20"
            />
          ) : null}
        </motion.div>
        {showIndicators && context.indicatorsPlacement === "outside" ? (
          <CarouselIndicators className="mt-3 flex justify-center" />
        ) : null}
      </>
    );
  },
);

CarouselContent.displayName = "CarouselContent";

/* ------------------------------------------------------------------ */
/* CarouselItem                                                          */
/* ------------------------------------------------------------------ */

/** CarouselItem 组件的属性 */
export type CarouselItemProps = MotionSafeDivProps;

interface SlideProps extends CarouselItemProps {
  slide: number;
  context: CarouselContextValue;
}

const Slide = React.forwardRef<HTMLDivElement, SlideProps>(function Slide(
  { slide, context, className, style, children, ...props },
  ref,
) {
  const { offset, getLayout, effect, crossFade, registerSlide, unregisterSlide } = context;
  const x = useTransform(offset, (value) => getLayout(slide, value).x);
  const progress = useTransform(offset, (value) => getLayout(slide, value).progress);
  const center = useTransform(offset, (value) => getLayout(slide, value).center);
  const scale = useTransform(progress, (value) => {
    const distance = Math.min(Math.abs(value), 1);
    if (effect === "scale") return 1 - SCALE_DEPTH * distance;
    if (effect === "fade") return 1 + FADE_ZOOM * distance;
    return 1;
  });
  // fade：p 为距对齐位置的张数（右侧为正）。
  // - 默认：右侧的一张（0 < p < 1）在上层、不透明度 1 − p；左侧的一张（−1 < p ≤ 0）在下层保持不透明。
  //   画面始终是两张的加权混合 (1 − p)·右 + p·左，中途不会透出背景；按符号而不是距离分层，
  //   正中间也不会出现两张同层、由 DOM 顺序决定的情况。
  // - crossFade：先淡出再淡入（各占一半），背景透明的文字幻灯片不会两段文字叠在一起。
  const opacity = useTransform(progress, (value) => {
    if (effect !== "fade") return 1;
    if (crossFade) return Math.max(0, 1 - 2 * Math.min(Math.abs(value), 1));
    if (value > 0) return Math.max(0, 1 - value);
    return value > -1 ? 1 : 0;
  });
  const filter = useTransform(progress, (value) =>
    effect === "scale"
      ? `brightness(${formatNumber(1 - SCALE_DIM * Math.min(Math.abs(value), 1))})`
      : "none",
  );
  // 严格的上下层顺序：右侧进入的一张在上，左侧的一张在下，其余在最底层。
  const zIndex = useTransform(progress, (value) =>
    value > 0 && value < 1 ? 2 : value <= 0 && value > -1 ? 1 : 0,
  );
  const pointerEvents = useTransform(progress, (value) =>
    Math.abs(value) < 0.5 ? "auto" : "none",
  );

  const nodeRef = React.useRef<HTMLDivElement | null>(null);
  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (node) registerSlide(slide, node);
      else unregisterSlide(slide, nodeRef.current);
      nodeRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref, registerSlide, unregisterSlide, slide],
  );

  const visible = context.view.visible[slide] ?? true;
  const near = context.view.near[slide] ?? true;
  const active = (context.slideSnap[slide] ?? slide) === context.index;
  const itemContext = React.useMemo<CarouselItemContextValue>(
    () => ({ index: slide, progress, center, active, visible, near }),
    [slide, progress, center, active, visible, near],
  );

  // 指示点是 tab 且吸附点与幻灯片一一对应时，幻灯片是 tabpanel。
  const asTabPanel =
    context.tabsMounted && context.indicators === "dots" && context.count === context.slideCount;
  const hidden = context.hideOffscreen && !visible;
  // autoHeight 测量前（含服务端首帧）：初始视野外的幻灯片移出文档流，
  // 视口自然高度就是初始一张的高度，测量后不会再跳一次。
  const outOfFlow = context.autoHeight && !context.measured && !visible;

  return (
    <CarouselItemContext.Provider value={itemContext}>
      <motion.div
        ref={setRefs}
        id={context.slideId(slide)}
        role={asTabPanel ? "tabpanel" : "group"}
        aria-roledescription={asTabPanel ? undefined : context.labels.slideRoleDescription}
        aria-label={context.labels.slide(slide + 1, context.slideCount)}
        aria-hidden={hidden || undefined}
        inert={hidden || undefined}
        tabIndex={-1}
        data-slot="carousel-item"
        data-index={slide}
        data-qy-slide={slide}
        data-active={active ? "" : undefined}
        data-visible={visible ? "" : undefined}
        {...props}
        className={cn(
          "relative col-start-1 row-start-1 min-w-0 shrink-0 justify-self-start",
          context.autoWidth && "w-max max-w-full",
          context.autoHeight && "self-start",
          className,
        )}
        style={{
          ...(outOfFlow ? { position: "absolute", top: 0, left: 0 } : null),
          ...style,
          width: context.autoWidth
            ? style?.width
            : "calc((100% - (var(--qy-spv, 1) - 1) * var(--qy-gap, 0px)) / var(--qy-spv, 1))",
          x: effect === "fade" ? 0 : x,
          scale: effect === "slide" ? undefined : scale,
          opacity: effect === "fade" ? opacity : undefined,
          filter: effect === "scale" ? filter : undefined,
          zIndex: effect === "fade" ? zIndex : undefined,
          pointerEvents: effect === "fade" ? pointerEvents : undefined,
          willChange:
            effect === "fade"
              ? "transform, opacity"
              : effect === "scale"
                ? "transform, filter"
                : "transform",
        }}
      >
        {children}
      </motion.div>
    </CarouselItemContext.Provider>
  );
});

/**
 * CarouselItem — 一张幻灯片
 *
 * - 放在 `CarouselContent` 的直接子级；直接放其他元素时会自动包一层
 * - 宽度由 Carousel 的 `slidesPerView` 与 `gap` 决定（`"auto"` 时按内容或 className 的宽度）
 * - 分页类模式下停稳后完全不在视口内时设置 `inert` 与 `aria-hidden`，Tab 不会进入看不见的链接；
 *   `snap="none"` 或 `slidesPerView="auto"` 时保持可 Tab，键盘聚焦时滚入视野
 * - 自身 `tabIndex={-1}`：键盘切换后焦点可以落在幻灯片上（内侧描边）
 * - 内部可用 `useCarouselItem()` 读取连续的 `progress` 自定义效果
 *
 * @example
 * ```tsx
 * <CarouselContent>
 *   <CarouselItem className="p-1">
 *     <Card>...</Card>
 *   </CarouselItem>
 * </CarouselContent>
 * ```
 */
export const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(
  function CarouselItem(props, ref) {
    const context = useCarouselContext("CarouselItem");
    const slide = React.useContext(SlideIndexContext);
    const parent = React.useContext(CarouselItemContext);
    // 不在 CarouselContent 的直接子级（或被自动包裹后又嵌套了一层）时退化为普通容器。
    if (slide === null || (parent && parent.index === slide)) {
      const { className, ...rest } = props;
      return <div ref={ref} className={cn("min-w-0", className)} {...rest} />;
    }
    return <Slide ref={ref} slide={slide} context={context} {...props} />;
  },
);

CarouselItem.displayName = "CarouselItem";

/* ------------------------------------------------------------------ */
/* 箭头                                                                  */
/* ------------------------------------------------------------------ */

/** CarouselPrevious / CarouselNext 组件的属性 */
export type CarouselArrowProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

interface InternalArrowProps extends CarouselArrowProps {
  direction: "prev" | "next";
  builtin?: boolean;
}

const CarouselArrow = React.forwardRef<HTMLButtonElement, InternalArrowProps>(
  function CarouselArrow(
    { direction, builtin = false, className, children, onClick, ...props },
    ref,
  ) {
    const context = useCarouselContext(
      direction === "prev" ? "CarouselPrevious" : "CarouselNext",
    );
    const disabled =
      context.isStatic || (direction === "prev" ? !context.canPrev : !context.canNext);
    const Icon = direction === "prev" ? ChevronLeftIcon : ChevronRightIcon;
    return (
      <button
        ref={ref}
        type="button"
        data-slot={direction === "prev" ? "carousel-previous" : "carousel-next"}
        data-carousel-control=""
        data-direction={direction}
        data-reveal={builtin ? context.arrows : undefined}
        aria-controls={context.trackId}
        aria-label={direction === "prev" ? context.labels.previous : context.labels.next}
        aria-disabled={disabled || undefined}
        {...props}
        className={cn(
          "qy-carousel-arrow inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full text-foreground outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
          builtin
            ? "absolute top-1/2 z-20 -mt-[18px] size-9 border border-border/60 bg-background/80 shadow-[0_2px_8px_-2px_rgb(0_0_0/0.18)] backdrop-blur-md backdrop-saturate-150 [&_svg]:size-[18px]"
            : "size-8 border bg-background shadow-xs not-aria-disabled:hover:bg-muted [&_svg]:size-4",
          builtin && (direction === "prev" ? "left-3" : "right-3"),
          className,
        )}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || disabled) return;
          context.markInteraction();
          if (direction === "prev") context.api.prev();
          else context.api.next();
        }}
      >
        {children ?? <Icon aria-hidden />}
      </button>
    );
  },
);

/**
 * CarouselPrevious — 上一张按钮
 *
 * - 放在 `<Carousel>` 内任意位置（例如标题右侧），默认是普通的行内圆形按钮
 * - 非循环到达开头时 `aria-disabled` 并降低不透明度（仍可聚焦）
 * - 可传入 children 替换图标
 *
 * @example
 * ```tsx
 * <Carousel arrows="none">
 *   <div className="flex gap-2"><CarouselPrevious /><CarouselNext /></div>
 *   <CarouselContent>...</CarouselContent>
 * </Carousel>
 * ```
 */
export const CarouselPrevious = React.forwardRef<HTMLButtonElement, CarouselArrowProps>(
  function CarouselPrevious(props, ref) {
    return <CarouselArrow ref={ref} direction="prev" {...props} />;
  },
);

CarouselPrevious.displayName = "CarouselPrevious";

/**
 * CarouselNext — 下一张按钮
 *
 * - 放在 `<Carousel>` 内任意位置，默认是普通的行内圆形按钮
 * - 非循环到达末尾时 `aria-disabled` 并降低不透明度（仍可聚焦）
 * - 可传入 children 替换图标
 *
 * @example
 * ```tsx
 * <CarouselNext className="size-10" />
 * ```
 */
export const CarouselNext = React.forwardRef<HTMLButtonElement, CarouselArrowProps>(
  function CarouselNext(props, ref) {
    return <CarouselArrow ref={ref} direction="next" {...props} />;
  },
);

CarouselNext.displayName = "CarouselNext";

/* ------------------------------------------------------------------ */
/* 指示器                                                                */
/* ------------------------------------------------------------------ */

/** CarouselIndicators 组件的属性 */
export interface CarouselIndicatorsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 指示器类型
   * @default 跟随 Carousel 的 `indicators`（为 `"none"` 时使用 `"dots"`）
   */
  type?: "dots" | "fraction";
  /**
   * 外观：`"plain"` 按主题着色，`"overlay"` 深色半透明模糊胶囊 + 白色点（叠在图片上）
   * @default "plain"
   */
  appearance?: "plain" | "overlay";
  /**
   * 自动播放时是否在指示器旁显示暂停 / 播放按钮
   * @default true
   */
  playButton?: boolean;
  /**
   * 指示点最多显示的个数
   * @default 跟随 Carousel 的 `maxDots`
   */
  maxDots?: number;
}

/** 窗口边缘的点逐渐缩小（Instagram 式）：u 为点在窗口中的位置（单位：点）。 */
function edgeScale(u: number, start: number, count: number, maxDots: number) {
  const fold = (distance: number) => clamp(0.5 + 0.25 * distance, 0.5, 1);
  const leftRoom = clamp(start, 0, 1);
  const rightRoom = clamp(count - maxDots - start, 0, 1);
  const left = 1 - leftRoom * (1 - fold(u));
  const right = 1 - rightRoom * (1 - fold(maxDots - 1 - u));
  const outside = u < -0.5 || u > maxDots - 0.5 ? 0 : 1;
  return left * right * outside;
}

interface DotProps {
  dot: number;
  context: CarouselContextValue;
  windowStart: MotionValue<number>;
  windowed: boolean;
  maxDots: number;
  overlay: boolean;
  selected: boolean;
  onSelect: (dot: number) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  registerTab: (dot: number, node: HTMLButtonElement | null) => void;
}

function IndicatorDot({
  dot,
  context,
  windowStart,
  windowed,
  maxDots,
  overlay,
  selected,
  onSelect,
  onKeyDown,
  registerTab,
}: DotProps) {
  const { position, autoplayProgress, count, loop } = context;
  const showProgress = context.autoplayEnabled && context.playing;
  const completed = context.completedIndex;
  const index = context.index;
  // 「活动度」：连续位置距该点越近越接近 1，拖动时胶囊从一个点连续流到下一个点。
  const activity = useTransform(position, (value) => {
    let distance = Math.abs(value - dot);
    if (loop) distance = Math.min(distance, count - distance);
    return Math.max(0, 1 - distance);
  });
  const width = useTransform(activity, (value) => DOT_SIZE + DOT_EXTRA * value);
  const base = overlay ? DOT_BASE.overlay : DOT_BASE.plain;
  const peak = showProgress ? (overlay ? DOT_TRACK.overlay : DOT_TRACK.plain) : 1;
  const trackOpacity = useTransform(activity, (value) => base + (peak - base) * value);
  const fillOpacity = useTransform(activity, (value) => (showProgress ? value : 0));
  const fillScale = useTransform(autoplayProgress, (value) =>
    dot === index ? value : dot === completed ? 1 : 0,
  );
  const scale = useTransform(windowStart, (value) =>
    windowed ? edgeScale(dot - value, value, count, maxDots) : 1,
  );
  const panelSlide = context.snapSlides[dot]?.[0] ?? dot;

  return (
    <button
      ref={(node) => registerTab(dot, node)}
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={context.slideId(panelSlide)}
      aria-label={
        count === context.slideCount ? context.labels.goTo(dot + 1) : context.labels.goToPage(dot + 1)
      }
      tabIndex={selected ? 0 : -1}
      className={cn(
        "qy-carousel-dot relative flex h-6 shrink-0 cursor-pointer items-center justify-center rounded-full px-[5px] outline-none focus-visible:ring-2",
        overlay ? "focus-visible:ring-white/70" : "focus-visible:ring-ring/60",
      )}
      onClick={() => onSelect(dot)}
      onKeyDown={onKeyDown}
    >
      <motion.span
        aria-hidden
        className="relative block h-1.5 overflow-hidden rounded-full"
        style={{ width, scale }}
      >
        <motion.span
          className="absolute inset-0 rounded-full bg-current"
          style={{ opacity: trackOpacity }}
        />
        <motion.span
          className="absolute inset-0 origin-left bg-current"
          style={{ opacity: fillOpacity, scaleX: fillScale }}
        />
      </motion.span>
    </button>
  );
}

type ToggleVariant = "pill-overlay" | "pill-plain" | "overlay" | "plain";

interface AutoplayToggleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  context: CarouselContextValue;
  variant: ToggleVariant;
}

const AutoplayToggleButton = React.forwardRef<HTMLButtonElement, AutoplayToggleButtonProps>(
  function AutoplayToggleButton({ context, variant, className, children, onClick, ...props }, ref) {
    const { playing, labels, api } = context;
    const Icon = playing ? PauseIcon : PlayIcon;
    const small = variant === "pill-overlay";
    return (
      <button
        ref={ref}
        type="button"
        data-slot="carousel-autoplay-toggle"
        data-carousel-control=""
        data-playing={playing ? "" : undefined}
        aria-label={playing ? labels.pause : labels.play}
        {...props}
        className={cn(
          "relative flex shrink-0 cursor-pointer items-center justify-center rounded-full outline-none transition-[background-color,color,scale] duration-150 active:scale-90 focus-visible:ring-2",
          variant === "pill-overlay" && "size-6 hover:bg-white/15 focus-visible:ring-white/70",
          variant === "pill-plain" &&
            "size-7 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring/60",
          variant === "overlay" &&
            "size-8 bg-black/55 text-white shadow-[0_1px_6px_-1px_rgb(0_0_0/0.25)] backdrop-blur-md backdrop-saturate-150 hover:bg-black/65 focus-visible:ring-white/70",
          variant === "plain" &&
            "size-8 border bg-background text-foreground shadow-xs hover:bg-muted focus-visible:ring-ring/60",
          className,
        )}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          if (playing) api.pause();
          else api.play();
        }}
      >
        {children ?? (
          <Icon aria-hidden className={cn("fill-current", small ? "size-2.5" : "size-3")} strokeWidth={0} />
        )}
      </button>
    );
  },
);

/** CarouselAutoplayToggle 组件的属性 */
export interface CarouselAutoplayToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 外观：`"plain"` 按主题着色的圆形按钮，`"overlay"` 深色半透明模糊圆形按钮（叠在图片上）
   * @default "plain"
   */
  appearance?: "plain" | "overlay";
}

/**
 * CarouselAutoplayToggle — 自动播放的暂停 / 播放按钮
 *
 * - 放在 `<Carousel>` 内任意位置；未开启 `autoplay`（或只有一屏）时不渲染
 * - 文案来自 `labels.pause` / `labels.play`，可传入 children 替换图标
 * - 挂载后 Carousel 不再在 `indicators="none"` 时补内置的暂停按钮
 *
 * @example
 * ```tsx
 * <Carousel loop autoplay indicators="none">
 *   <div className="relative">
 *     <CarouselContent className="aspect-video rounded-2xl">...</CarouselContent>
 *     <CarouselAutoplayToggle appearance="overlay" className="absolute top-3 right-3" />
 *   </div>
 * </Carousel>
 * ```
 */
export const CarouselAutoplayToggle = React.forwardRef<
  HTMLButtonElement,
  CarouselAutoplayToggleProps
>(function CarouselAutoplayToggle({ appearance = "plain", ...props }, ref) {
  const context = useCarouselContext("CarouselAutoplayToggle");
  const { registerToggle } = context;
  React.useEffect(() => registerToggle(), [registerToggle]);
  if (!context.autoplayEnabled) return null;
  return <AutoplayToggleButton ref={ref} context={context} variant={appearance} {...props} />;
});

CarouselAutoplayToggle.displayName = "CarouselAutoplayToggle";

function FractionNumber({ value, direction, reduced }: { value: number; direction: number; reduced: boolean }) {
  return (
    <span className="relative inline-grid overflow-hidden text-right">
      <AnimatePresence initial={false} custom={direction}>
        <motion.span
          key={value}
          custom={direction}
          className="col-start-1 row-start-1"
          variants={{
            enter: (dir: number) => ({ y: dir >= 0 ? "100%" : "-100%", opacity: 0 }),
            center: { y: "0%", opacity: 1 },
            exit: (dir: number) => ({ y: dir >= 0 ? "-100%" : "100%", opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={
            reduced
              ? { duration: 0.15, y: { duration: 0 } }
              : { duration: 0.28, ease: EASE_OUT }
          }
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * CarouselIndicators — 指示点或分数指示器
 *
 * - 指示点的宽度与不透明度从连续位置派生：拖动时活动胶囊从一个点连续流到下一个点
 * - 自动播放时活动胶囊内有从左到右填满的进度，旁边有暂停 / 播放按钮
 * - 点数超过 `maxDots` 时只显示跟随当前位置滑动的窗口，边缘的点缩小
 * - `role="tablist"` 与漫游 tabindex：方向键移动并激活，Home / End 到两端
 * - 默认是普通的行内元素，可放在 `<Carousel>` 内任意位置
 *
 * @example
 * ```tsx
 * <Carousel indicators="none">
 *   <CarouselContent>...</CarouselContent>
 *   <CarouselIndicators className="mt-4 flex justify-center" />
 * </Carousel>
 * ```
 */
export const CarouselIndicators = React.forwardRef<HTMLDivElement, CarouselIndicatorsProps>(
  function CarouselIndicators(
    { type, appearance = "plain", playButton = true, maxDots: maxDotsProp, className, ...props },
    ref,
  ) {
    const context = useCarouselContext("CarouselIndicators");
    const reduced = useReducedMotion() ?? false;
    const kind = type ?? (context.indicators === "fraction" ? "fraction" : "dots");
    const overlay = appearance === "overlay";
    const { count, index, registerTabs, registerToggle } = context;
    const maxDots = Math.max(3, Math.round(maxDotsProp ?? context.maxDots));
    const windowed = kind === "dots" && count > maxDots;
    const windowTarget = windowed
      ? clamp(index - (maxDots - 1) / 2, 0, count - maxDots)
      : 0;
    const windowStart = useMotionValue(windowTarget);
    const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
    const previousIndex = React.useRef(index);
    const [direction, setDirection] = React.useState(1);

    if (previousIndex.current !== index) {
      const delta = index - previousIndex.current;
      const wrapped = context.loop && Math.abs(delta) > count / 2 ? -Math.sign(delta) : Math.sign(delta);
      previousIndex.current = index;
      if (wrapped !== 0 && wrapped !== direction) setDirection(wrapped);
    }

    React.useEffect(() => {
      if (kind !== "dots") return;
      return registerTabs();
    }, [kind, registerTabs]);

    React.useEffect(() => {
      if (reduced) windowStart.jump(windowTarget);
      else animate(windowStart, windowTarget, DOT_WINDOW_SPRING);
    }, [windowStart, windowTarget, reduced]);

    const select = (dot: number) => {
      context.markInteraction();
      context.api.goTo(dot);
    };

    const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      let next: number | null = null;
      if (event.key === "ArrowRight") next = context.loop ? mod(index + 1, count) : Math.min(count - 1, index + 1);
      else if (event.key === "ArrowLeft") next = context.loop ? mod(index - 1, count) : Math.max(0, index - 1);
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = count - 1;
      if (next === null) return;
      event.preventDefault();
      event.stopPropagation();
      select(next);
      tabRefs.current[next]?.focus();
    };

    const showPlay = playButton && context.autoplayEnabled;
    React.useEffect(() => {
      if (!playButton) return;
      return registerToggle();
    }, [playButton, registerToggle]);
    const rowX = useTransform(windowStart, (value) => -value * DOT_SLOT);
    const windowWidth = (windowed ? maxDots : count) * DOT_SLOT + DOT_EXTRA;
    const positionLabel =
      count === context.slideCount
        ? context.labels.slide(index + 1, count)
        : context.labels.page(index + 1, count);

    return (
      <div
        ref={ref}
        data-slot="carousel-indicators"
        data-carousel-control=""
        data-appearance={appearance}
        {...props}
        className={cn(
          "flex items-center",
          overlay
            ? "h-6 rounded-full bg-black/55 px-1.5 text-white shadow-[0_1px_6px_-1px_rgb(0_0_0/0.25)] backdrop-blur-md backdrop-saturate-150"
            : "text-foreground",
          overlay && showPlay && "pl-0.5",
          overlay && kind === "fraction" && !showPlay && "px-2.5",
          className,
        )}
      >
        {showPlay ? (
          <AutoplayToggleButton
            context={context}
            variant={overlay ? "pill-overlay" : "pill-plain"}
          />
        ) : null}
        {kind === "fraction" ? (
          <div
            className={cn(
              "flex items-center gap-1 text-xs leading-none font-medium tabular-nums",
              !overlay && "text-sm text-muted-foreground",
              overlay && showPlay && "pr-2 pl-0.5",
            )}
          >
            {/* 视觉上的「3 / 12」对读屏隐藏，改读完整的一句（切换时由 live region 播报）。 */}
            <span className="sr-only">{positionLabel}</span>
            <span aria-hidden className={cn(overlay ? "text-white" : "text-foreground")}>
              <FractionNumber value={index + 1} direction={direction} reduced={reduced} />
            </span>
            <span aria-hidden className={cn(overlay && "opacity-80")}>
              /
            </span>
            <span aria-hidden className={cn(overlay && "opacity-80")}>
              {count}
            </span>
          </div>
        ) : (
          <div
            role="tablist"
            aria-label={context.labels.indicators}
            className="relative overflow-hidden"
            style={{ width: windowWidth }}
          >
            <motion.div className="flex w-max items-center" style={{ x: rowX }}>
              {Array.from({ length: count }, (_, dot) => (
                <IndicatorDot
                  key={dot}
                  dot={dot}
                  context={context}
                  windowStart={windowStart}
                  windowed={windowed}
                  maxDots={maxDots}
                  overlay={overlay}
                  selected={dot === index}
                  onSelect={select}
                  onKeyDown={handleTabKeyDown}
                  registerTab={(tab, node) => {
                    tabRefs.current[tab] = node;
                  }}
                />
              ))}
            </motion.div>
          </div>
        )}
      </div>
    );
  },
);

CarouselIndicators.displayName = "CarouselIndicators";

/* ------------------------------------------------------------------ */
/* CarouselImage                                                         */
/* ------------------------------------------------------------------ */

/** CarouselImage 组件的属性 */
export interface CarouselImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "className" | "style" | "children"> {
  /** 图片地址 */
  src: string;
  /** 替代文本；纯装饰图片传空字符串 */
  alt: string;
  /**
   * 填充方式：`"cover"` 裁切铺满、`"contain"` 完整显示
   * @default "cover"
   */
  fit?: "cover" | "contain";
  /**
   * `fit="contain"` 时在留白处铺一层同图的大模糊衬底
   * @default true
   */
  backdrop?: boolean;
  /**
   * 立即加载；否则只在所在幻灯片进入可见范围 ±1 张时才设置 `src`
   * @default false
   */
  priority?: boolean;
  /**
   * 底部渐变遮罩，用于在图片上叠加白色标题与按钮
   * @default false
   */
  overlay?: boolean;
  /** 根元素的类名（尺寸、圆角） */
  className?: string;
  /** 根元素的样式 */
  style?: React.CSSProperties;
  /** `<img>` 的类名 */
  imgClassName?: string;
  /** 叠加在图片上的内容，放在一个铺满图片、底部对齐的容器中 */
  children?: React.ReactNode;
}

type ImageStatus = "loading" | "loaded" | "error";

/**
 * CarouselImage — 轮播用的图片
 *
 * - `cover` 裁切铺满，`contain` 完整显示并在留白处铺同图的大模糊衬底
 * - 加载前显示柔和微光骨架，加载后淡入（已缓存的直接显示），失败显示占位图标
 * - 懒加载：所在幻灯片进入可见范围 ±1 张时才设置 `src`，不会一次加载全部大图
 * - Carousel 设置 `parallax` 时随拖动反向轻移，拖动时有景深
 * - 可选底部渐变遮罩与叠加内容
 *
 * 图片铺满所在幻灯片，需要给 `CarouselContent` 设置高度或宽高比。
 *
 * @example
 * ```tsx
 * <CarouselImage src="/hero.jpg" alt="雪山日出" overlay>
 *   <div className="p-6 pb-12">
 *     <h3 className="text-2xl font-semibold">雪山日出</h3>
 *   </div>
 * </CarouselImage>
 * ```
 */
export const CarouselImage = React.forwardRef<HTMLDivElement, CarouselImageProps>(
  function CarouselImage(
    {
      src,
      alt,
      fit = "cover",
      backdrop = true,
      priority = false,
      overlay = false,
      className,
      style,
      imgClassName,
      children,
      srcSet,
      sizes,
      onLoad,
      onError,
      loading,
      ...imgProps
    },
    ref,
  ) {
    const carousel = React.useContext(CarouselContext);
    const item = React.useContext(CarouselItemContext);
    const wanted = priority || !item || item.near;
    const [armed, setArmed] = React.useState(wanted);
    if (wanted && !armed) setArmed(true);

    const [status, setStatus] = React.useState<ImageStatus>("loading");
    const [instant, setInstant] = React.useState(false);
    const [currentSrc, setCurrentSrc] = React.useState(src);
    if (currentSrc !== src) {
      setCurrentSrc(src);
      setStatus("loading");
      setInstant(false);
    }
    const imageRef = React.useRef<HTMLImageElement>(null);

    // 服务端渲染的图片可能在水合前就已加载完成，错过了 onLoad：挂载时检查一次。
    useIsoLayoutEffect(() => {
      const image = imageRef.current;
      if (!armed || !image || !image.complete) return;
      if (image.naturalWidth > 0) {
        setStatus("loaded");
        setInstant(true);
      } else if (image.getAttribute("src")) {
        setStatus("error");
      }
    }, [armed, src]);

    const amount = carousel && item && fit === "cover" ? carousel.parallax : 0;
    // 减少动态效果时不做视差（测量前 center 恒为 0，水合前后渲染一致）。
    const reducedMotion = useReducedMotion() ?? false;
    const fallbackCenter = useMotionValue(0);
    const parallaxX = useTransform(item?.center ?? fallbackCenter, (value) =>
      amount && !reducedMotion
        ? `${formatNumber((-clamp(value, -1.5, 1.5) * amount * 100) / (1 + 2 * amount))}%`
        : "0%",
    );

    const loaded = status === "loaded";
    const image = (
      <img
        ref={imageRef}
        src={armed ? src : undefined}
        srcSet={armed ? srcSet : undefined}
        sizes={sizes}
        alt={alt}
        draggable={false}
        decoding="async"
        loading={loading ?? (armed ? "eager" : "lazy")}
        data-loaded={loaded ? "" : undefined}
        {...imgProps}
        className={cn(
          "absolute inset-0 size-full opacity-0 select-none data-loaded:opacity-100",
          fit === "contain" ? "object-contain" : "object-cover",
          instant ? "transition-none" : "transition-opacity duration-500 ease-out",
          imgClassName,
        )}
        onLoad={(event) => {
          onLoad?.(event);
          setStatus("loaded");
        }}
        onError={(event) => {
          onError?.(event);
          setStatus("error");
        }}
      />
    );

    return (
      <div
        ref={ref}
        data-slot="carousel-image"
        data-status={status}
        className={cn("relative h-full w-full overflow-hidden bg-muted", className)}
        style={style}
      >
        {status === "loading" ? (
          <div
            aria-hidden
            className={cn("absolute inset-0 bg-muted", armed && "qy-carousel-skeleton")}
          />
        ) : null}
        {status === "error" ? (
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center text-muted-foreground/70"
          >
            <ImageOffIcon className="size-7" strokeWidth={1.5} />
          </div>
        ) : null}
        {fit === "contain" && backdrop && armed && status !== "error" ? (
          <img
            aria-hidden
            alt=""
            src={src}
            srcSet={srcSet}
            sizes={sizes}
            draggable={false}
            decoding="async"
            className={cn(
              "absolute inset-0 size-full scale-125 object-cover opacity-0 blur-2xl saturate-150 select-none",
              instant ? "transition-none" : "transition-opacity duration-700 ease-out",
              loaded && "opacity-55 dark:opacity-40",
            )}
          />
        ) : null}
        {amount ? (
          <motion.div
            className="absolute inset-y-0"
            style={{ left: `${-amount * 100}%`, right: `${-amount * 100}%`, x: parallaxX }}
          >
            {image}
          </motion.div>
        ) : (
          image
        )}
        {overlay ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-black/70 via-black/25 to-transparent"
          />
        ) : null}
        {children != null ? (
          <div
            data-slot="carousel-image-content"
            className={cn(
              "absolute inset-0 flex flex-col justify-end",
              overlay && "text-white",
            )}
          >
            {children}
          </div>
        ) : null}
      </div>
    );
  },
);

CarouselImage.displayName = "CarouselImage";
