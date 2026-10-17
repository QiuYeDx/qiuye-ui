"use client";

import * as React from "react";
import {
  animate,
  cancelFrame,
  frame,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

import { cn } from "@/lib/utils";

/** HoneycombView 的交互模式 */
export type HoneycombViewMode = "free" | "vertical";

/** free 模式下的排布方式 */
export type HoneycombViewLayout = "spiral" | "grid";

/** HoneycombView 组件的属性 */
export interface HoneycombViewProps<T>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** 数据列表 */
  items: readonly T[];
  /**
   * 渲染单个图标的视觉内容，按 `itemSize` 设计即可，缩放由组件统一处理。
   * 返回纯视觉内容，不要再嵌套按钮等可交互元素。
   */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** 返回 React key，默认使用下标 */
  getItemKey?: (item: T, index: number) => React.Key;
  /** 返回图标的无障碍名称 */
  getItemLabel?: (item: T, index: number) => string;
  /**
   * 点击、回车或空格选中图标时触发；拖动后的松手不会触发。
   * 第三个参数是图标元素，便于从图标位置做打开动画。
   * 未传时图标不可聚焦、不可点击。
   */
  onItemSelect?: (item: T, index: number, element: HTMLElement) => void;
  /**
   * 交互模式
   * - `"free"`：四个方向自由拖动（watchOS 蜂窝视图）
   * - `"vertical"`：只能上下滚动（watchOS 10 网格视图）
   * @default "free"
   */
  mode?: HoneycombViewMode;
  /**
   * free 模式下的排布：`"spiral"` 从中心一圈圈向外，`"grid"` 为宽窄行交替的矩形蜂窝。
   * vertical 模式固定为 `"grid"`。
   * @default "spiral"
   */
  layout?: HoneycombViewLayout;
  /**
   * 宽行的列数，窄行为 `columns - 1`。
   * vertical 模式默认按视口宽度自动计算；free + grid 默认取接近正方形的列数。
   */
  columns?: number;
  /**
   * 图标直径（px）
   * @default 60
   */
  itemSize?: number;
  /**
   * 相邻图标的间距（px）
   * @default 10
   */
  gap?: number;
  /**
   * 边缘缩放带的宽度（px）：图标中心距视口边缘小于该值时开始缩小，
   * 越靠近边缘越小，最终缩成贴着边缘内侧的小圆点。越宽越早开始缩小。
   * @default itemSize
   */
  edgeWidth?: number;
  /**
   * 视口的圆角（px），用于让缩放带沿圆角屏幕弯曲：角落的图标比边中点更早缩小。
   * 默认读取根节点的 `border-radius`；圆角由外层容器裁切时需要手动传入。
   */
  cornerRadius?: number;
  /**
   * 松手后吸附：free 模式让最近的图标停在正中，vertical 模式让某一行停在顶端
   * @default false
   */
  snap?: boolean;
  /** 每个图标外层的类名（默认圆形焦点框；图标形状由 renderItem 决定） */
  itemClassName?: string;
}

interface Point {
  x: number;
  y: number;
}

interface AxisBounds {
  min: number;
  max: number;
}

interface Geometry {
  width: number;
  height: number;
  points: Point[];
  rows: number[];
  boundsX: AxisBounds;
  boundsY: AxisBounds;
  /** 满尺寸区域的半宽、半高与圆角 */
  innerX: number;
  innerY: number;
  radius: number;
  /** 从满尺寸区域到小圆点渐近线的距离 */
  band: number;
  spacing: number;
  vertical: boolean;
}

const SQRT3_2 = Math.sqrt(3) / 2;
const DRAG_THRESHOLD = 6;
const VELOCITY_WINDOW = 100;
const RUBBER_BAND = 0.55;
// UIScrollView 的常规减速率：每毫秒速度保留 99.8%。
const DECELERATION_RATE = 0.998;
const TIME_CONSTANT = -1 / Math.log(DECELERATION_RATE);
// inertia 的初速度为 power · velocity / timeConstant，令其等于松手速度。
const INERTIA_POWER = TIME_CONSTANT / 1000;
// 越界回弹：约 0.45s 响应的临界阻尼弹簧。
const BOUNCE_STIFFNESS = 200;
const BOUNCE_DAMPING = 28;
const SNAP_SPRING = { type: "spring" as const, duration: 0.6, bounce: 0.12 };
const SETTLE_SPRING = { type: "spring" as const, duration: 0.45, bounce: 0 };
const WHEEL_SPRING = { type: "spring" as const, duration: 0.32, bounce: 0 };
const INTRO_DURATION = 0.8;
const INTRO_SPREAD = 0.4;
// free 模式的平移边界：最外圈图标最远拖进缩放带的这一比例处（缩放约 0.8）。
const FREE_REACH = 0.3;
// 小圆点渐近线距视口边缘的距离，占缩放带宽度的比例。
const EDGE_INSET = 0.18;
// 缩放小于 FADE_START + FADE_RANGE 时开始淡出，挤在渐近线上的小圆点不会叠成一圈。
const FADE_START = 0.03;
const FADE_RANGE = 0.07;
const HIT_MIN_SCALE = 0.5;
// 层级按缩放分档的数量。
const Z_LEVELS = 40;

// 六边形轴向坐标的六个方向（尖顶朝上，横向成行）。
const HEX_DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** 从中心按圈螺旋排布：第 0 个在正中，第 k 圈 6k 个，从左上角顺时针。 */
function spiralLayout(count: number, spacing: number) {
  const points: Point[] = [];
  const rows: number[] = [];
  const push = (q: number, r: number) => {
    points.push({ x: spacing * (q + r / 2), y: -spacing * SQRT3_2 * r });
    rows.push(-r);
  };
  if (count > 0) push(0, 0);
  for (let ring = 1; points.length < count; ring++) {
    let q = HEX_DIRECTIONS[4][0] * ring;
    let r = HEX_DIRECTIONS[4][1] * ring;
    for (let side = 0; side < 6; side++) {
      for (let step = 0; step < ring && points.length < count; step++) {
        push(q, r);
        q += HEX_DIRECTIONS[side][0];
        r += HEX_DIRECTIONS[side][1];
      }
    }
  }
  return { points, rows };
}

/** 宽窄行交替：宽行 columns 个，窄行 columns - 1 个，窄行落在宽行两个图标之间。 */
function gridLayout(count: number, spacing: number, columns: number) {
  const points: Point[] = [];
  const rows: number[] = [];
  const wide = Math.max(1, Math.round(columns));
  for (let row = 0; points.length < count; row++) {
    const size = row % 2 === 0 || wide === 1 ? wide : wide - 1;
    const offset = wide === 1 && row % 2 === 1 ? spacing / 2 : 0;
    for (let col = 0; col < size && points.length < count; col++) {
      points.push({
        x: (col - (size - 1) / 2) * spacing + offset,
        y: row * spacing * SQRT3_2,
      });
      rows.push(row);
    }
  }
  return { points, rows };
}

/** 让内容两端恰好能进入满尺寸区域边缘的平移范围；内容较小时固定居中。 */
function axisBounds(min: number, max: number, inner: number): AxisBounds {
  const lower = inner - max;
  const upper = -inner - min;
  if (lower > upper) {
    const center = -(min + max) / 2;
    return { min: center, max: center };
  }
  return { min: lower, max: upper };
}

/** 橡皮筋：越界越多，跟随越少。 */
function rubberBand(overshoot: number, dimension: number) {
  return (
    (overshoot * dimension * RUBBER_BAND) /
    (dimension + RUBBER_BAND * overshoot)
  );
}

/** rubberBand 的反函数，用于中途抓住越界状态时还原原始拖动量。 */
function inverseRubberBand(distance: number, dimension: number) {
  const safe = Math.min(distance, dimension * 0.999);
  return (safe * dimension) / (RUBBER_BAND * (dimension - safe));
}

function applyRubber(raw: number, bounds: AxisBounds, dimension: number) {
  if (raw < bounds.min) return bounds.min - rubberBand(bounds.min - raw, dimension);
  if (raw > bounds.max) return bounds.max + rubberBand(raw - bounds.max, dimension);
  return raw;
}

function removeRubber(value: number, bounds: AxisBounds, dimension: number) {
  if (value < bounds.min) {
    return bounds.min - inverseRubberBand(bounds.min - value, dimension);
  }
  if (value > bounds.max) {
    return bounds.max + inverseRubberBand(value - bounds.max, dimension);
  }
  return value;
}

/** Apple 的动量投影：按减速率估算松手后的停止位置。 */
function projectMomentum(velocity: number) {
  return ((velocity / 1000) * DECELERATION_RATE) / (1 - DECELERATION_RATE);
}

/**
 * 缩放随屏幕上的位置变化：x 为图标中心在缩放带中走过的比例（0 为满尺寸区域边缘，
 * 1 为渐近线）。前半段二次缓入、后半段线性降到 0。参数按 Apple Watch 截图拟合
 * （图标直径 S）：距边缘约 0.7S 处缩放约 0.8，约 0.25S 处约 0.1，贴着边缘内侧缩成小圆点。
 */
const PROFILE_EASE = 0.5;
function edgeProfile(x: number) {
  const g = x < PROFILE_EASE ? (x * x) / (2 * PROFILE_EASE) : x - PROFILE_EASE / 2;
  return Math.max(0, 1 - g / (1 - PROFILE_EASE / 2));
}

/**
 * 越界距离 → 屏幕位置的查找表（以缩放带宽度为单位）。屏幕位置 v 满足 dv/du = s(v)：
 * 空间被压缩多少，图标就缩小多少，相邻图标沿径向的间隙随之收紧，不会留出空洞。
 */
const LUT_RANGE = 8;
const LUT_STEPS = 512;
const EDGE_LUT = (() => {
  const table = new Float32Array(LUT_STEPS + 1);
  const du = LUT_RANGE / LUT_STEPS;
  let v = 0;
  for (let index = 1; index <= LUT_STEPS; index++) {
    const k1 = edgeProfile(v);
    const k2 = edgeProfile(v + k1 * du);
    v = Math.min(1, v + ((k1 + k2) / 2) * du);
    table[index] = v;
  }
  return table;
})();

function lookupEdge(u: number) {
  const position = (u / LUT_RANGE) * LUT_STEPS;
  if (position >= LUT_STEPS) return EDGE_LUT[LUT_STEPS];
  const index = Math.floor(position);
  const t = position - index;
  return EDGE_LUT[index] + (EDGE_LUT[index + 1] - EDGE_LUT[index]) * t;
}

/**
 * 把相对视口中心的点映射到屏幕：满尺寸区域（视口内缩 edgeWidth 的圆角矩形）内保持不变；
 * 区域外按到区域的最近距离沿法线方向压缩，并按查找表缩小。
 */
function mapToScreen(x: number, y: number, g: Geometry) {
  const coreX = g.innerX - g.radius;
  const coreY = g.innerY - g.radius;
  const cx = clamp(x, -coreX, coreX);
  const cy = clamp(y, -coreY, coreY);
  const dx = x - cx;
  const dy = y - cy;
  const distance = Math.hypot(dx, dy);
  if (distance <= g.radius) return { x, y, scale: 1 };
  const reached = lookupEdge((distance - g.radius) / g.band);
  const reach = g.radius + reached * g.band;
  return {
    x: cx + (dx / distance) * reach,
    y: cy + (dy / distance) * reach,
    scale: edgeProfile(reached),
  };
}

function velocityFrom(
  samples: Array<{ t: number; x: number; y: number }>,
  now: number,
) {
  const last = samples[samples.length - 1];
  if (!last || now - last.t > 50) return { x: 0, y: 0 };
  const first = samples.find((sample) => last.t - sample.t <= VELOCITY_WINDOW);
  if (!first || first === last) return { x: 0, y: 0 };
  const dt = (last.t - first.t) / 1000;
  return { x: (last.x - first.x) / dt, y: (last.y - first.y) / dt };
}

interface PaintCache {
  transform: string;
  opacity: string;
  zIndex: string;
  pointerEvents: string;
  hidden: boolean;
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  rawX: number;
  rawY: number;
  dragging: boolean;
  pressed: HTMLElement | null;
  samples: Array<{ t: number; x: number; y: number }>;
}

function HoneycombViewInner<T>(
  {
    items,
    renderItem,
    getItemKey,
    getItemLabel,
    onItemSelect,
    mode = "free",
    layout = "spiral",
    columns,
    itemSize = 60,
    gap = 10,
    edgeWidth,
    cornerRadius,
    snap = false,
    itemClassName,
    className,
    style,
    "aria-label": ariaLabel = "应用列表",
    ...props
  }: HoneycombViewProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const itemRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const offsetX = useMotionValue(0);
  const offsetY = useMotionValue(0);
  const intro = useMotionValue(0);
  const reducedMotion = useReducedMotion() ?? false;
  const [size, setSize] = React.useState({ width: 0, height: 0, radius: 0 });
  const geometryRef = React.useRef<Geometry | null>(null);
  // 按元素缓存上次写入的值；数据重排后元素换了位置也不会读到别人的缓存。
  const paintCache = React.useRef(new WeakMap<HTMLElement, PaintCache>());
  const dragRef = React.useRef<DragState | null>(null);
  const suppressClickRef = React.useRef(false);
  const wheelRef = React.useRef({ x: 0, y: 0, time: 0 });
  const resetKeyRef = React.useRef<string | null>(null);
  const vertical = mode === "vertical";
  const count = items.length;

  const setRootRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  // 视口尺寸
  React.useLayoutEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const measure = () => {
      const width = node.clientWidth;
      const height = node.clientHeight;
      // 百分比圆角按较短边换算。
      const raw = getComputedStyle(node).borderTopLeftRadius;
      const radius = raw.endsWith("%")
        ? (parseFloat(raw) / 100) * Math.min(width, height)
        : parseFloat(raw) || 0;
      setSize((prev) =>
        prev.width === width && prev.height === height && prev.radius === radius
          ? prev
          : { width, height, radius },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const geometry = React.useMemo<Geometry | null>(() => {
    const { width, height } = size;
    if (!width || !height) return null;
    const spacing = itemSize + gap;
    const edge = Math.max(1, edgeWidth ?? itemSize);
    const band = edge * (1 - EDGE_INSET);
    const autoColumns = vertical
      ? Math.max(2, Math.floor((width - gap * 2 + gap) / spacing))
      : Math.max(2, Math.round(Math.sqrt(count * 1.15)));
    const { points, rows } =
      vertical || layout === "grid"
        ? gridLayout(count, spacing, columns ?? autoColumns)
        : spiralLayout(count, spacing);
    let minX = 0;
    let maxX = 0;
    let minY = 0;
    let maxY = 0;
    points.forEach((point, index) => {
      if (index === 0 || point.x < minX) minX = point.x;
      if (index === 0 || point.x > maxX) maxX = point.x;
      if (index === 0 || point.y < minY) minY = point.y;
      if (index === 0 || point.y > maxY) maxY = point.y;
    });
    let innerX = Math.max(0, width / 2 - edge);
    const innerY = Math.max(0, height / 2 - edge);
    // vertical 模式水平方向不压缩：各列保持满尺寸。
    if (vertical) innerX = Math.max(innerX, Math.max(-minX, maxX));
    // 满尺寸区域与视口圆角同心。
    const radius = clamp(
      (cornerRadius ?? size.radius) - edge,
      0,
      Math.min(innerX, innerY),
    );
    const reach = edge * FREE_REACH;
    return {
      width,
      height,
      points,
      rows,
      // free 模式最外圈只拖到缩放带中段，视口边缘不留大片空白；
      // vertical 模式首行停在满尺寸区域顶端。
      boundsX: vertical
        ? { min: 0, max: 0 }
        : axisBounds(minX, maxX, innerX + reach),
      boundsY: axisBounds(minY, maxY, vertical ? innerY : innerY + reach),
      innerX,
      innerY,
      radius,
      band,
      spacing,
      vertical,
    };
  }, [
    size,
    itemSize,
    gap,
    edgeWidth,
    cornerRadius,
    vertical,
    layout,
    columns,
    count,
  ]);

  /**
   * 每帧最多绘制一次：直接写图标的 transform 与 opacity，不走 React 渲染。
   * 只写发生变化的值；完全淡出的图标设为 visibility: hidden，之后不再更新它的 transform。
   */
  const paint = React.useCallback(() => {
    const g = geometryRef.current;
    if (!g) return;
    const ox = offsetX.get();
    const oy = offsetY.get();
    const progress = intro.get();
    const diagonal = Math.hypot(g.width / 2, g.height / 2) || 1;
    for (let index = 0; index < g.points.length; index++) {
      const element = itemRefs.current[index];
      if (!element) continue;
      let x = g.points[index].x + ox;
      let y = g.points[index].y + oy;
      let appear = 1;
      if (progress < 1) {
        // 入场：按到中心的距离依次从内向外散开。
        const delay = INTRO_SPREAD * Math.min(1, Math.hypot(x, y) / diagonal);
        const local = clamp((progress - delay) / (1 - INTRO_SPREAD), 0, 1);
        appear = 1 - Math.pow(1 - local, 3);
        const spread = 0.55 + 0.45 * appear;
        x *= spread;
        y *= spread;
      }
      const mapped = mapToScreen(x, y, g);
      const opacity =
        clamp((mapped.scale - FADE_START) / FADE_RANGE, 0, 1) * appear;
      let cache = paintCache.current.get(element);
      if (!cache) {
        cache = {
          transform: "",
          opacity: "",
          zIndex: "",
          pointerEvents: "",
          hidden: false,
        };
        paintCache.current.set(element, cache);
      }
      const hidden = opacity <= 0;
      if (hidden !== cache.hidden) {
        cache.hidden = hidden;
        element.style.visibility = hidden ? "hidden" : "";
      }
      if (hidden) continue;
      const scale = mapped.scale * (0.4 + 0.6 * appear);
      const transform = `translate3d(${mapped.x.toFixed(2)}px, ${mapped.y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      if (transform !== cache.transform) {
        cache.transform = transform;
        element.style.transform = transform;
      }
      const nextOpacity = opacity.toFixed(3);
      if (nextOpacity !== cache.opacity) {
        cache.opacity = nextOpacity;
        element.style.opacity = nextOpacity;
      }
      // 越大的图标越靠上：中间的盖住更靠近边缘的，而不是按 DOM 顺序后来者居上。
      // 量化成整数档位，缩放细微变化时不改写层级。
      const zIndex = String(Math.round(mapped.scale * Z_LEVELS));
      if (zIndex !== cache.zIndex) {
        cache.zIndex = zIndex;
        element.style.zIndex = zIndex;
      }
      // 太小的边缘图标不响应点击。
      const pointerEvents =
        mapped.scale < HIT_MIN_SCALE || appear < 1 ? "none" : "";
      if (pointerEvents !== cache.pointerEvents) {
        cache.pointerEvents = pointerEvents;
        element.style.pointerEvents = pointerEvents;
      }
    }
  }, [offsetX, offsetY, intro]);

  const schedulePaint = React.useCallback(() => {
    frame.render(paint);
  }, [paint]);

  React.useEffect(() => {
    const unsubscribe = [offsetX, offsetY, intro].map((value) =>
      value.on("change", schedulePaint),
    );
    return () => {
      unsubscribe.forEach((stop) => stop());
      cancelFrame(paint);
    };
  }, [offsetX, offsetY, intro, schedulePaint, paint]);

  // 几何变化：切换模式时回到初始位置，其余情况（尺寸、数量）夹回新边界。
  React.useLayoutEffect(() => {
    geometryRef.current = geometry;
    if (!geometry) return;
    const resetKey = `${mode}|${layout}|${columns ?? ""}`;
    const { boundsX, boundsY } = geometry;
    offsetX.stop();
    offsetY.stop();
    if (resetKeyRef.current !== resetKey) {
      resetKeyRef.current = resetKey;
      offsetX.jump(clamp(0, boundsX.min, boundsX.max));
      offsetY.jump(
        geometry.vertical ? boundsY.max : clamp(0, boundsY.min, boundsY.max),
      );
      if (reducedMotion) {
        intro.jump(1);
      } else {
        intro.jump(0);
        animate(intro, 1, { duration: INTRO_DURATION, ease: "linear" });
      }
    } else {
      offsetX.jump(clamp(offsetX.get(), boundsX.min, boundsX.max));
      offsetY.jump(clamp(offsetY.get(), boundsY.min, boundsY.max));
    }
    paint();
  }, [geometry, mode, layout, columns, offsetX, offsetY, intro, paint, reducedMotion]);

  const stopMotion = React.useCallback(() => {
    offsetX.stop();
    offsetY.stop();
  }, [offsetX, offsetY]);

  /** 松手：吸附时投影落点后用弹簧带着速度过去，否则按 UIScrollView 的减速率惯性滑行。 */
  const release = React.useCallback(
    (velocityX: number, velocityY: number) => {
      const g = geometryRef.current;
      if (!g) return;
      const axes: Array<[MotionValue<number>, number, AxisBounds]> = [
        [offsetY, velocityY, g.boundsY],
      ];
      if (!g.vertical) axes.push([offsetX, velocityX, g.boundsX]);
      // 越界时朝外的速度不再继续推远。
      const settled = axes.map(([value, velocity, bounds]) => {
        const current = value.get();
        if (
          (current < bounds.min && velocity < 0) ||
          (current > bounds.max && velocity > 0)
        ) {
          return 0;
        }
        return velocity;
      });

      if (snap && g.points.length) {
        const projectedY = clamp(
          offsetY.get() + projectMomentum(settled[0]),
          g.boundsY.min,
          g.boundsY.max,
        );
        const projectedX = g.vertical
          ? 0
          : clamp(
              offsetX.get() + projectMomentum(settled[1]),
              g.boundsX.min,
              g.boundsX.max,
            );
        let targetX = projectedX;
        let targetY = projectedY;
        let best = Infinity;
        if (g.vertical) {
          // 某一行停在满尺寸区域顶端。
          const rowY = new Map<number, number>();
          g.points.forEach((point, index) => rowY.set(g.rows[index], point.y));
          rowY.forEach((y) => {
            const candidate = clamp(-g.innerY - y, g.boundsY.min, g.boundsY.max);
            const distance = Math.abs(candidate - projectedY);
            if (distance < best) {
              best = distance;
              targetY = candidate;
            }
          });
        } else {
          for (const point of g.points) {
            const candidateX = clamp(-point.x, g.boundsX.min, g.boundsX.max);
            const candidateY = clamp(-point.y, g.boundsY.min, g.boundsY.max);
            const distance = Math.hypot(
              candidateX - projectedX,
              candidateY - projectedY,
            );
            if (distance < best) {
              best = distance;
              targetX = candidateX;
              targetY = candidateY;
            }
          }
        }
        const spring = reducedMotion ? { ...SNAP_SPRING, bounce: 0 } : SNAP_SPRING;
        animate(offsetY, targetY, { ...spring, velocity: settled[0] });
        if (!g.vertical) {
          animate(offsetX, targetX, { ...spring, velocity: settled[1] });
        }
        return;
      }

      axes.forEach(([value, , bounds], index) => {
        // inertia 只用起点和速度计算落点，目标值不参与；但起止相同时 Motion 会跳过动画，
        // 所以传一个不同的占位目标。
        animate(value, value.get() + 1, {
          type: "inertia",
          velocity: settled[index],
          power: INERTIA_POWER,
          timeConstant: TIME_CONSTANT,
          min: bounds.min,
          max: bounds.max,
          bounceStiffness: BOUNCE_STIFFNESS,
          bounceDamping: reducedMotion ? BOUNCE_DAMPING * 1.5 : BOUNCE_DAMPING,
          restDelta: 0.5,
        });
      });
    },
    [offsetX, offsetY, snap, reducedMotion],
  );

  const setPressed = (element: HTMLElement | null, pressed: boolean) => {
    if (!element) return;
    if (pressed) element.setAttribute("data-pressed", "");
    else element.removeAttribute("data-pressed");
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    props.onPointerDown?.(event);
    if (event.defaultPrevented || dragRef.current) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const g = geometryRef.current;
    if (!g) return;
    // 立即停下惯性或回弹，从屏幕上的当前值继续。
    stopMotion();
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-honeycomb-item]",
    );
    const pressed =
      target && rootRef.current?.contains(target) && onItemSelect ? target : null;
    setPressed(pressed, true);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      rawX: removeRubber(offsetX.get(), g.boundsX, g.width),
      rawY: removeRubber(offsetY.get(), g.boundsY, g.height),
      dragging: false,
      pressed,
      samples: [{ t: event.timeStamp, x: event.clientX, y: event.clientY }],
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    props.onPointerMove?.(event);
    const drag = dragRef.current;
    const g = geometryRef.current;
    if (!drag || !g || drag.pointerId !== event.pointerId) return;
    const dx = g.vertical ? 0 : event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.dragging) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      drag.dragging = true;
      setPressed(drag.pressed, false);
      // 确认是拖动后才捕获指针，否则 click 会落到根节点而不是图标上。
      try {
        rootRef.current?.setPointerCapture(event.pointerId);
      } catch {
        // 指针已失效（如合成事件），不捕获也能继续跟随。
      }
      rootRef.current?.setAttribute("data-dragging", "");
    }
    drag.samples.push({ t: event.timeStamp, x: event.clientX, y: event.clientY });
    while (
      drag.samples.length > 2 &&
      event.timeStamp - drag.samples[0].t > VELOCITY_WINDOW
    ) {
      drag.samples.shift();
    }
    offsetY.set(applyRubber(drag.rawY + dy, g.boundsY, g.height));
    if (!g.vertical) offsetX.set(applyRubber(drag.rawX + dx, g.boundsX, g.width));
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setPressed(drag.pressed, false);
    rootRef.current?.removeAttribute("data-dragging");
    if (!drag.dragging) return;
    // 这次松手是拖动，吞掉随后的 click。
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
    const velocity = cancelled
      ? { x: 0, y: 0 }
      : velocityFrom(drag.samples, event.timeStamp);
    release(velocity.x, velocity.y);
  };

  // 滚轮 / 触控板：非 passive 监听，累加目标后用短弹簧跟随；到边界后交还给页面。
  React.useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      const g = geometryRef.current;
      if (!g || dragRef.current || event.ctrlKey) return;
      const unit =
        event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? g.height : 1;
      let deltaX = event.deltaX * unit;
      let deltaY = event.deltaY * unit;
      if (g.vertical) {
        deltaY = deltaY || deltaX;
        deltaX = 0;
      } else if (event.shiftKey && !deltaX) {
        deltaX = deltaY;
        deltaY = 0;
      }
      const wheel = wheelRef.current;
      if (event.timeStamp - wheel.time > 200) {
        wheel.x = clamp(offsetX.get(), g.boundsX.min, g.boundsX.max);
        wheel.y = clamp(offsetY.get(), g.boundsY.min, g.boundsY.max);
      }
      const nextX = clamp(wheel.x - deltaX, g.boundsX.min, g.boundsX.max);
      const nextY = clamp(wheel.y - deltaY, g.boundsY.min, g.boundsY.max);
      if (nextX === wheel.x && nextY === wheel.y) return;
      event.preventDefault();
      wheel.time = event.timeStamp;
      if (nextX !== wheel.x) animate(offsetX, nextX, WHEEL_SPRING);
      if (nextY !== wheel.y) animate(offsetY, nextY, WHEEL_SPRING);
      wheel.x = nextX;
      wheel.y = nextY;
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [offsetX, offsetY]);

  /** 键盘聚焦时把图标平移进满尺寸区域。 */
  const revealItem = React.useCallback(
    (index: number) => {
      const g = geometryRef.current;
      const point = g?.points[index];
      if (!g || !point) return;
      const limitX = Math.max(0, g.innerX - itemSize / 2);
      const limitY = Math.max(0, g.innerY - itemSize / 2);
      const x = point.x + offsetX.get();
      const y = point.y + offsetY.get();
      const targetX = clamp(
        offsetX.get() + clamp(x, -limitX, limitX) - x,
        g.boundsX.min,
        g.boundsX.max,
      );
      const targetY = clamp(
        offsetY.get() + clamp(y, -limitY, limitY) - y,
        g.boundsY.min,
        g.boundsY.max,
      );
      const spring = reducedMotion ? { duration: 0 } : SETTLE_SPRING;
      if (!g.vertical && targetX !== offsetX.get()) {
        animate(offsetX, targetX, spring);
      }
      if (targetY !== offsetY.get()) animate(offsetY, targetY, spring);
    },
    [itemSize, offsetX, offsetY, reducedMotion],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    props.onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const direction = {
      ArrowRight: [1, 0],
      ArrowLeft: [-1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }[event.key];
    const g = geometryRef.current;
    const current = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-honeycomb-item]",
    );
    if (!direction || !g || !current) return;
    const from = Number(current.dataset.index);
    const origin = g.points[from];
    if (!origin) return;
    // 在相邻图标中选方向最接近的一个。
    let best = -1;
    let bestScore = -Infinity;
    g.points.forEach((point, index) => {
      if (index === from) return;
      const dx = point.x - origin.x;
      const dy = point.y - origin.y;
      const distance = Math.hypot(dx, dy);
      if (distance > g.spacing * 1.5) return;
      const alignment = (dx * direction[0] + dy * direction[1]) / distance;
      if (alignment < 0.4) return;
      const score = alignment - distance / (g.spacing * 10);
      if (score > bestScore) {
        bestScore = score;
        best = index;
      }
    });
    if (best < 0) return;
    event.preventDefault();
    const next = itemRefs.current[best];
    if (!next) return;
    // 边缘完全淡出的图标是 visibility: hidden，无法聚焦：先显示出来，
    // 聚焦后由 revealItem 把它平移进视野，之后的绘制会重新计算是否隐藏。
    next.style.visibility = "";
    const cache = paintCache.current.get(next);
    if (cache) cache.hidden = false;
    next.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
  };

  itemRefs.current.length = count;
  const selectable = Boolean(onItemSelect);

  return (
    <div
      ref={setRootRef}
      role="group"
      aria-label={ariaLabel}
      {...props}
      className={cn(
        "relative touch-none overflow-hidden overscroll-contain select-none [-webkit-tap-highlight-color:transparent]",
        "cursor-grab data-dragging:cursor-grabbing data-dragging:*:cursor-grabbing",
        className,
      )}
      style={{ contain: "layout paint", ...style }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => {
        props.onPointerUp?.(event);
        endDrag(event, false);
      }}
      onPointerCancel={(event) => {
        props.onPointerCancel?.(event);
        endDrag(event, true);
      }}
      onLostPointerCapture={(event) => {
        props.onLostPointerCapture?.(event);
        if (dragRef.current?.dragging) endDrag(event, false);
      }}
      onKeyDown={handleKeyDown}
      onScroll={(event) => {
        props.onScroll?.(event);
        // overflow: hidden 的容器在聚焦时仍可能被浏览器滚动，归零以免与平移叠加。
        event.currentTarget.scrollTop = 0;
        event.currentTarget.scrollLeft = 0;
      }}
      onDragStart={(event) => {
        props.onDragStart?.(event);
        event.preventDefault();
      }}
    >
      {items.map((item, index) => {
        const label = getItemLabel?.(item, index);
        const Content = selectable ? "button" : "span";
        return (
          // 外层只负责定位，每帧改写 transform：用没有类名的 div，样式重算最便宜
          // （button 自带表单控件样式，每次重算约贵 4 倍）。内层不能依赖外层样式（如 inherit），
          // 否则每帧都会连带对内容做完整的样式重算。
          <div
            key={getItemKey ? getItemKey(item, index) : index}
            ref={(node: HTMLDivElement | null) => {
              itemRefs.current[index] = node;
            }}
            data-honeycomb-item=""
            data-index={index}
            className="group/honeycomb-item"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: itemSize,
              height: itemSize,
              marginLeft: -itemSize / 2,
              marginTop: -itemSize / 2,
              opacity: 0,
              willChange: "transform",
            }}
          >
            <Content
              {...(selectable ? { type: "button" as const } : {})}
              aria-label={label}
              className={cn(
                "block size-full rounded-full p-0 outline-none transition-transform duration-200 ease-out group-data-pressed/honeycomb-item:scale-[0.9] group-data-pressed/honeycomb-item:duration-75 [&_img]:pointer-events-none",
                selectable &&
                  "cursor-pointer focus-visible:ring-[3px] focus-visible:ring-ring/60",
                itemClassName,
              )}
              onClick={
                selectable
                  ? (event: React.MouseEvent<HTMLElement>) => {
                      if (suppressClickRef.current) {
                        event.preventDefault();
                        return;
                      }
                      onItemSelect?.(item, index, event.currentTarget);
                    }
                  : undefined
              }
              onFocus={
                selectable
                  ? (event: React.FocusEvent<HTMLElement>) => {
                      // 只在键盘聚焦时移动视图，点击不移动。
                      if (event.currentTarget.matches(":focus-visible")) {
                        revealItem(index);
                      }
                    }
                  : undefined
              }
            >
              {renderItem(item, index)}
            </Content>
          </div>
        );
      })}
    </div>
  );
}

/**
 * HoneycombView — Apple Watch 风格的蜂窝图标视图
 *
 * 圆形图标按六边形密排，靠近视口边缘的图标连续缩小并向内收拢；
 * 拖动 1:1 跟手、松手按 UIScrollView 的减速率惯性滑行，越界有橡皮筋与回弹，
 * 任何时刻都可以再次抓住。支持四向自由拖动（`free`）与仅上下滚动（`vertical`）两种模式。
 *
 * 视口尺寸由调用方通过 className / style 决定。
 *
 * @example
 * ```tsx
 * <HoneycombView
 *   className="h-[360px] w-[300px] rounded-[48px] bg-black"
 *   items={apps}
 *   getItemKey={(app) => app.id}
 *   getItemLabel={(app) => app.name}
 *   renderItem={(app) => <AppIcon app={app} />}
 *   onItemSelect={(app) => open(app)}
 * />
 * ```
 */
export const HoneycombView = React.forwardRef(HoneycombViewInner) as <T>(
  props: HoneycombViewProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;
