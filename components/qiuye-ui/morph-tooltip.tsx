"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Slot } from "radix-ui";
import {
  animate,
  cancelFrame,
  frame,
  motion,
  useMotionValue,
  type MotionValue,
  type TargetAndTransition,
} from "motion/react";

import { cn } from "@/lib/utils";
import { SmoothCorners } from "@/components/qiuye-ui/smooth-corners";

/* ------------------------------------------------------------------ */
/* 类型与默认值                                                          */
/* ------------------------------------------------------------------ */

/** 气泡相对触发元素的方向 */
export type MorphTooltipSide = "top" | "right" | "bottom" | "left";

/** 气泡沿触发元素边缘的对齐方式 */
export type MorphTooltipAlign = "start" | "center" | "end";

/**
 * 气泡的配色
 * - `"dark"`：高级黑，浅色与深色主题下都是近黑底（深色主题略浅一点，与页面拉开层次）
 * - `"light"`：白底深字；浅色主题下跟随项目的 `--popover` / `--popover-foreground` / `--border`，深色主题下仍是白底
 * - `"inverse"`：与当前主题相反，浅色主题为 dark，深色主题为 light
 *
 * 深色主题通过祖先上的 `.dark` 类或 `data-theme="dark"` 属性识别（shadcn/ui 与 next-themes 的默认做法）。
 */
export type MorphTooltipVariant = "dark" | "light" | "inverse";

/** MorphTooltipProvider 与 MorphTooltip 各项配置的默认值 */
export interface MorphTooltipDefaults {
  /** 第一次显示前的悬停等待（ms） */
  delay: number;
  /** 气泡消失后多长时间内，移到范围内其他元素上立即显示（ms） */
  skipDelayDuration: number;
  /** 指针离开元素后多久开始隐藏（ms） */
  closeDelay: number;
  /** 是否在元素之间滑动形变 */
  morph: boolean;
  /** 首选方向 */
  side: MorphTooltipSide;
  /** 对齐方式 */
  align: MorphTooltipAlign;
  /** 与元素的距离（px） */
  sideOffset: number;
  /** 沿对齐方向的偏移（px） */
  alignOffset: number;
  /** 放不下时是否翻转与平移 */
  avoidCollisions: boolean;
  /** 与视口边缘保持的最小距离（px） */
  collisionPadding: number;
  /** 最大宽度（px） */
  maxWidth: number;
  /** 配色 */
  variant: MorphTooltipVariant;
  /** 是否显示箭头 */
  arrow: boolean;
  /** 指针移进气泡时是否保持显示 */
  hoverable: boolean;
  /** 内容是否含链接、按钮等可交互元素 */
  interactive: boolean;
  /** 按下元素时是否隐藏 */
  closeOnClick: boolean;
  /** 触屏是否长按显示 */
  touch: boolean;
}

/**
 * MorphTooltip 各项配置的默认值。
 * 可用于在外部封装时保持一致，或在文档中展示默认行为。
 */
export const DEFAULT_MORPH_TOOLTIP_OPTIONS: Readonly<MorphTooltipDefaults> = Object.freeze({
  delay: 400,
  skipDelayDuration: 500,
  closeDelay: 100,
  morph: true,
  side: "top",
  align: "center",
  sideOffset: 8,
  alignOffset: 0,
  avoidCollisions: true,
  collisionPadding: 8,
  maxWidth: 280,
  variant: "dark",
  arrow: false,
  hoverable: true,
  interactive: false,
  closeOnClick: true,
  touch: true,
});

/** MorphTooltipProvider 组件的属性 */
export interface MorphTooltipProviderProps {
  /** 范围内的内容；其中的每个 MorphTooltip 共享同一个气泡 */
  children?: React.ReactNode;
  /**
   * 第一次显示前的悬停等待（ms）。之后在范围内移动无需再等。
   * @default 400
   */
  delay?: number;
  /**
   * 气泡消失后多长时间内，移到范围内其他元素上立即显示（ms）；`0` 关闭。
   * @default 500
   */
  skipDelayDuration?: number;
  /**
   * 指针离开元素后多久开始隐藏（ms）。跨过按钮之间的缝隙时气泡不会先消失，从而保持滑动。
   * @default 100
   */
  closeDelay?: number;
  /**
   * 是否在元素之间滑动形变；`false` 时仍是单例，但直接切换位置与内容。
   * @default true
   */
  morph?: boolean;
  /**
   * 范围内的默认方向，单个 MorphTooltip 可覆盖
   * @default "top"
   */
  side?: MorphTooltipSide;
  /**
   * 范围内的默认对齐方式，单个 MorphTooltip 可覆盖
   * @default "center"
   */
  align?: MorphTooltipAlign;
  /**
   * 范围内默认与元素的距离（px），单个 MorphTooltip 可覆盖
   * @default 8
   */
  sideOffset?: number;
  /**
   * 范围内默认沿对齐方向的偏移（px），单个 MorphTooltip 可覆盖
   * @default 0
   */
  alignOffset?: number;
  /**
   * 范围内默认是否在放不下时翻转与平移，单个 MorphTooltip 可覆盖
   * @default true
   */
  avoidCollisions?: boolean;
  /**
   * 范围内默认与视口（或 collisionBoundary）边缘保持的最小距离（px），单个 MorphTooltip 可覆盖
   * @default 8
   */
  collisionPadding?: number;
  /**
   * 范围内默认的额外碰撞边界元素（如可滚动的局部区域），单个 MorphTooltip 可覆盖
   */
  collisionBoundary?: Element | null;
  /**
   * 范围内的默认配色，单个 MorphTooltip 可覆盖
   * @default "dark"
   */
  variant?: MorphTooltipVariant;
  /**
   * 范围内默认是否显示箭头，单个 MorphTooltip 可覆盖
   * @default false
   */
  arrow?: boolean;
  /**
   * 范围内的默认最大宽度
   * - 传入 `number` 时单位为 px
   * - 传入 `string` 时作为 CSS 长度（如 `"20rem"`），不支持百分比
   * @default 280
   */
  maxWidth?: number | string;
  /**
   * 范围内默认是否允许指针移进气泡而不关闭（见 MorphTooltip 的 `hoverable`）。
   * 元素密集、气泡会盖住其他元素时（如日历、热力图）设为 `false`。
   * @default true
   */
  hoverable?: boolean;
  /**
   * 范围内默认内容是否可交互（见 MorphTooltip 的 `interactive`）
   * @default false
   */
  interactive?: boolean;
  /**
   * 范围内默认按下元素时是否隐藏，单个 MorphTooltip 可覆盖
   * @default true
   */
  closeOnClick?: boolean;
  /**
   * 范围内默认触屏是否长按显示，单个 MorphTooltip 可覆盖
   * @default true
   */
  touch?: boolean;
  /**
   * 气泡 Portal 到的容器。气泡使用 `position: fixed`，容器及其祖先不应带 transform / filter。
   * @default document.body
   */
  container?: HTMLElement | null;
  /**
   * 关闭范围内所有提示
   * @default false
   */
  disabled?: boolean;
}

/** MorphTooltip 组件的属性 */
export interface MorphTooltipProps {
  /**
   * 唯一子元素作为触发元素（Radix `Slot` 方式）：
   * - 事件处理函数与子元素自带的合并，ref 转发到这个元素
   * - 子元素是组件时，它需要把 props 展开到 DOM 元素上，并把 ref 转发给这个 DOM 元素
   * - 不是元素（如纯文本）时自动包一层 `span`
   * - 禁用的按钮不会派发指针事件，请在外面包一层 `span`
   *
   * 提示显示期间，触发元素会获得 `aria-describedby`（与自带的值合并）和 `data-tooltip-state="open"`，
   * 可用于高亮当前元素，如 Tailwind 的 `data-[tooltip-state=open]:ring-1`。
   */
  children: React.ReactNode;
  /**
   * 提示内容：字符串或任意节点；为空（`null`、`undefined`、`false`、`""`）时不显示。
   * 节点内容通过 Portal 从触发元素所在的位置渲染，读取的是触发元素处的 Context（路由、主题、i18n 等）。
   */
  content?: React.ReactNode;
  /**
   * 快捷键，显示为内容右侧的键帽
   * - 传入数组时每一项是一个键帽，如 `["⌘", "B"]`
   * - 传入字符串时按 `+` 或空格拆分（`"Ctrl+K"`），结尾的 `+` 本身是一个键（`"⌘+"`、`"Ctrl++"`）；
   *   每段开头的 ⌘ ⇧ ⌥ ⌃ 各自成为一个键帽（`"⌘⇧P"`）
   */
  shortcut?: string | string[];
  /**
   * 首选方向；放不下且对侧更宽裕时自动翻转
   * @default "top"（或 Provider 的 side）
   */
  side?: MorphTooltipSide;
  /**
   * 沿元素边缘的对齐方式
   * @default "center"（或 Provider 的 align）
   */
  align?: MorphTooltipAlign;
  /**
   * 气泡与元素的距离（px）
   * @default 8（或 Provider 的 sideOffset）
   */
  sideOffset?: number;
  /**
   * 沿对齐方向的偏移（px）：`start` / `center` 时正值向右（下），`end` 时正值向左（上），即远离对齐的那条边
   * @default 0（或 Provider 的 alignOffset）
   */
  alignOffset?: number;
  /**
   * 放不下时是否翻到对侧，并沿另一轴平移留在视口内
   * @default true（或 Provider 的 avoidCollisions）
   */
  avoidCollisions?: boolean;
  /**
   * 与视口（或 collisionBoundary）边缘保持的最小距离（px）
   * @default 8（或 Provider 的 collisionPadding）
   */
  collisionPadding?: number;
  /**
   * 额外的碰撞边界元素：翻转与平移时以「视口 ∩ 该元素」为界，适合可滚动的局部区域。
   * 不传时使用 Provider 的 collisionBoundary，都没有时只以视口为界。
   */
  collisionBoundary?: Element | null;
  /**
   * 最大宽度，超出后自动换行
   * - 传入 `number` 时单位为 px
   * - 传入 `string` 时作为 CSS 长度（如 `"20rem"`），不支持百分比
   * @default 280（或 Provider 的 maxWidth）
   */
  maxWidth?: number | string;
  /**
   * 配色：`"dark"` 高级黑 / `"light"` 白底深字 / `"inverse"` 与主题相反
   * @default "dark"（或 Provider 的 variant）
   */
  variant?: MorphTooltipVariant;
  /**
   * 是否显示指向元素的小箭头，随气泡滑动并始终指向元素中心
   * @default false（或 Provider 的 arrow）
   */
  arrow?: boolean;
  /**
   * 覆盖范围的首次等待时间（ms）
   * @default Provider 的 delay（400）
   */
  delay?: number;
  /**
   * 指针从元素移进气泡时是否保持显示（WCAG 1.4.13：放大镜用户需要把指针移到内容上阅读）。
   * 为 `true` 时元素与气泡之间有一条看不见的桥，指针跨过缝隙不会关闭；气泡会接收指针事件。
   * 元素密集、气泡会盖住其他元素时（如日历、热力图）设为 `false`，气泡对指针完全透明。
   * @default true（或 Provider 的 hoverable）
   */
  hoverable?: boolean;
  /**
   * 内容含链接或按钮等可交互元素时设为 `true`（隐含 `hoverable`）：
   * - 指针可以移进气泡点击
   * - 键盘：元素聚焦且提示显示时按 Tab 进入气泡，最后一项再按 Tab 回到元素之后的下一个可聚焦元素，
   *   第一项按 Shift+Tab 回到元素，Esc 关闭并把焦点还给元素
   *
   * 提示只适合放一两个辅助链接；真正的交互面板请用 Popover。
   * @default false（或 Provider 的 interactive）
   */
  interactive?: boolean;
  /**
   * 按下元素时是否隐藏（之后直到指针离开元素前不再显示）。
   * 「复制」类按钮可设为 `false`，配合内容变化原地形变。
   * @default true（或 Provider 的 closeOnClick）
   */
  closeOnClick?: boolean;
  /**
   * 内容「换了一条」的标识。字符串内容会自动比较；节点内容变化需要交叉淡入时传它。
   * 标识不变时节点内容原地更新，尺寸变化时气泡平滑形变；
   * 同一元素上的内容换了一条时，还会通过一个礼貌的实时区域（aria-live）播报新内容。
   */
  contentKey?: string | number;
  /**
   * 受控的显示状态。同一范围同一时刻只显示一个提示：被其他提示接替时会收到 `onOpenChange(false)`；
   * 如果外部仍保持 `true`，这是一个「持续的显示请求」，接替它的提示关闭后（或内容、禁用状态恢复后）会重新显示它。
   */
  open?: boolean;
  /**
   * 非受控模式下挂载时是否立即显示
   * @default false
   */
  defaultOpen?: boolean;
  /** 显示状态变化回调 */
  onOpenChange?: (open: boolean) => void;
  /**
   * 禁用这一个提示
   * @default false
   */
  disabled?: boolean;
  /**
   * 触屏是否长按（约 450ms）显示；抬起后 1.5 秒隐藏，并吞掉这次长按之后的 click 与 contextmenu。
   * 按住期间元素不可选中文字，避免系统的文字选择与放大镜盖住提示。
   * @default true（或 Provider 的 touch）
   */
  touch?: boolean;
  /**
   * 这个提示显示时气泡表面的额外类名（如换背景色）；不同类名之间切换时颜色会过渡。
   * 箭头的颜色跟随表面的背景色。
   */
  className?: string;
}

/* ------------------------------------------------------------------ */
/* 样式                                                                 */
/* ------------------------------------------------------------------ */

// 放在 components 层：Tailwind v4 的 utilities 层能覆盖表面的颜色与排版（className），
// base 层的重置（preflight）不会覆盖这里的样式。
// 开头的层顺序声明与 Tailwind v4 的输出一致：Vite 等环境里这张样式表可能先于 Tailwind 插入
// <head>，没有这句时 components 会被排到 base 之前，preflight 反而会清掉内边距与键帽样式。
// Tailwind v3 的 preflight 不在层里，会覆盖键帽的字体，不在支持范围内。
// React 19 <style href precedence>：提升到 <head> 并按 href 去重。
const MORPH_TOOLTIP_CSS = `
@layer properties, theme, base, components, utilities;
@layer components {
  .qy-morph-tooltip {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 50;
    pointer-events: none;
    will-change: transform;
  }
  .qy-morph-tooltip[data-hoverable][data-state="open"] {
    pointer-events: auto;
  }
  .qy-morph-tooltip-offset {
    position: relative;
    will-change: transform;
  }
  .qy-morph-tooltip-bridge {
    position: absolute;
  }
  .qy-morph-tooltip-scale {
    will-change: transform, opacity;
  }

  /* 表面：默认高级黑。颜色都走变量，切换配色时用 transition 过渡。 */
  .qy-morph-tooltip-surface {
    --qy-morph-tooltip-bg: oklch(0.2 0 0);
    --qy-morph-tooltip-fg: oklch(1 0 0 / 0.92);
    --qy-morph-tooltip-ring: oklch(1 0 0 / 0.08);
    --qy-morph-tooltip-key-bg: oklch(1 0 0 / 0.12);
    --qy-morph-tooltip-key-fg: oklch(1 0 0 / 0.7);
    --qy-morph-tooltip-shadow: 0 10px 30px -8px oklch(0 0 0 / 0.35),
      0 2px 6px oklch(0 0 0 / 0.18);
    position: relative;
    isolation: isolate;
    box-sizing: border-box;
    background-color: var(--qy-morph-tooltip-bg);
    color: var(--qy-morph-tooltip-fg);
    box-shadow: var(--qy-morph-tooltip-shadow);
    font-size: 12.5px;
    font-weight: 500;
    line-height: 18px;
    letter-spacing: 0.005em;
    text-align: start;
    text-transform: none;
    white-space: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition:
      background-color 180ms ease,
      color 180ms ease,
      box-shadow 180ms ease;
  }
  /* 深色主题：浮起的表面比卡片与悬停中的按钮更亮一点（接近 Apple 的 elevated 深色） */
  :where(.dark, [data-theme="dark"]) .qy-morph-tooltip-surface {
    --qy-morph-tooltip-bg: oklch(0.29 0 0);
    --qy-morph-tooltip-ring: oklch(1 0 0 / 0.12);
    --qy-morph-tooltip-shadow: 0 12px 32px -8px oklch(0 0 0 / 0.6),
      0 2px 6px oklch(0 0 0 / 0.32);
  }
  /* light：浅色主题下跟随项目的 popover 主题色 */
  .qy-morph-tooltip-surface[data-variant="light"] {
    --qy-morph-tooltip-bg: var(--popover, oklch(0.995 0 0));
    --qy-morph-tooltip-fg: var(--popover-foreground, oklch(0.21 0 0));
    --qy-morph-tooltip-ring: var(--border, oklch(0 0 0 / 0.08));
    --qy-morph-tooltip-key-bg: oklch(0 0 0 / 0.06);
    --qy-morph-tooltip-key-fg: oklch(0 0 0 / 0.55);
    --qy-morph-tooltip-shadow: 0 10px 28px -10px oklch(0 0 0 / 0.24),
      0 2px 6px oklch(0 0 0 / 0.08);
  }
  /* 深色主题下的 light 与 inverse：仍是白底（主题色此时是深色，不能跟随） */
  :where(.dark, [data-theme="dark"]) .qy-morph-tooltip-surface[data-variant="light"],
  :where(.dark, [data-theme="dark"]) .qy-morph-tooltip-surface[data-variant="inverse"] {
    --qy-morph-tooltip-bg: oklch(0.985 0 0);
    --qy-morph-tooltip-fg: oklch(0.21 0 0);
    --qy-morph-tooltip-ring: oklch(0 0 0 / 0);
    --qy-morph-tooltip-key-bg: oklch(0 0 0 / 0.06);
    --qy-morph-tooltip-key-fg: oklch(0 0 0 / 0.55);
    --qy-morph-tooltip-shadow: 0 12px 32px -8px oklch(0 0 0 / 0.6),
      0 2px 6px oklch(0 0 0 / 0.3);
  }

  /* 极细的内高光描边：画在内容之上，富内容贴边时也不被盖住。 */
  .qy-morph-tooltip-surface::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    border-radius: inherit;
    corner-shape: inherit;
    box-shadow: inset 0 0 0 1px var(--qy-morph-tooltip-ring);
    pointer-events: none;
    transition: box-shadow 180ms ease;
  }
  .qy-morph-tooltip-clip {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: inherit;
    corner-shape: inherit;
  }

  /* 内容层：以表面中心为锚点（宽高在测量后固定，形变时文字不重排）。 */
  .qy-morph-tooltip-content {
    position: absolute;
    top: 50%;
    left: 50%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 8px;
    width: max-content;
    max-width: min(var(--qy-morph-tooltip-max-width, 280px), calc(100vw - 16px));
    margin: 0;
    padding: 6px 10px;
  }
  .qy-morph-tooltip-content[aria-hidden] {
    pointer-events: none;
  }
  .qy-morph-tooltip-text {
    min-width: 0;
    text-wrap: pretty;
    overflow-wrap: break-word;
  }
  .qy-morph-tooltip-body {
    min-width: 0;
  }
  .qy-morph-tooltip-host,
  .qy-morph-tooltip-live,
  .qy-morph-tooltip-snapshot {
    display: contents;
  }
  .qy-morph-tooltip-keys {
    display: inline-flex;
    flex: none;
    align-self: flex-start;
    gap: 3px;
  }
  .qy-morph-tooltip-key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    border-radius: 5px;
    background-color: var(--qy-morph-tooltip-key-bg);
    color: var(--qy-morph-tooltip-key-fg);
    font-family: inherit;
    font-size: 11px;
    font-weight: 500;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    transition:
      background-color 180ms ease,
      color 180ms ease;
  }

  /* 箭头：表面的子元素但在裁切层之外；底色继承表面（含用户类名与过渡中的颜色），
     上沿压进表面 1px 盖住那一段描边，两条斜边再接着画同色描边。不透明度由动画值控制。 */
  .qy-morph-tooltip-arrow {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    width: 10px;
    height: 6px;
    background-color: inherit;
    -webkit-clip-path: path("M0 0H10V1C8.5 1 7.6 1.7 6.6 3.1L5.75 4.75Q5 6.1 4.25 4.75L3.4 3.1C2.4 1.7 1.5 1 0 1Z");
    clip-path: path("M0 0H10V1C8.5 1 7.6 1.7 6.6 3.1L5.75 4.75Q5 6.1 4.25 4.75L3.4 3.1C2.4 1.7 1.5 1 0 1Z");
    pointer-events: none;
  }
  .qy-morph-tooltip-arrow > svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .qy-morph-tooltip-arrow path {
    fill: none;
    stroke: var(--qy-morph-tooltip-ring);
    stroke-width: 2px;
    transition: stroke 180ms ease;
  }
  .qy-morph-tooltip[data-side="top"] .qy-morph-tooltip-arrow {
    top: calc(100% - 1px);
  }
  .qy-morph-tooltip[data-side="bottom"] .qy-morph-tooltip-arrow {
    top: -5px;
  }
  .qy-morph-tooltip[data-side="left"] .qy-morph-tooltip-arrow {
    left: calc(100% - 3px);
  }
  .qy-morph-tooltip[data-side="right"] .qy-morph-tooltip-arrow {
    left: -7px;
  }

  @media (forced-colors: active) {
    .qy-morph-tooltip-surface {
      outline: 1px solid CanvasText;
    }
  }
}
`;

function MorphTooltipStyles() {
  return (
    <style href="qiuye-morph-tooltip" precedence="default">
      {MORPH_TOOLTIP_CSS}
    </style>
  );
}

/** 只给读屏软件的实时区域：视觉上隐藏 */
const SR_ONLY_STYLE: React.CSSProperties = {
  position: "fixed",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  border: 0,
  overflow: "hidden",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
};

/* ------------------------------------------------------------------ */
/* 动效参数                                                             */
/* ------------------------------------------------------------------ */

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
/** 位置与尺寸的形变：x / y / width / height / 箭头共用 */
const MORPH_SPRING = { type: "spring", visualDuration: 0.3, bounce: 0.12 } as const;
/** 形变途中再次换目标（连续扫过）：更紧、不回弹，箭头不会落后指针好几格 */
const TRACK_SPRING = { type: "spring", visualDuration: 0.15, bounce: 0 } as const;
/** 出现时的缩放与位移：短而带一点回弹 */
const APPEAR_SPRING = { type: "spring", visualDuration: 0.22, bounce: 0.2 } as const;
const OPACITY_IN = { duration: 0.16, ease: EASE_OUT } as const;
const OPACITY_OUT = { duration: 0.12, ease: EASE_OUT } as const;
/** 减少动态效果时只保留的淡入淡出（只用于出现与消失） */
const REDUCED_FADE = { duration: 0.15, ease: "easeOut" } as const;
const CONTENT_IN = { duration: 0.12, ease: EASE_OUT } as const;
const CONTENT_OUT = { duration: 0.12, ease: EASE_OUT } as const;
/** 箭头开关时的淡入淡出 */
const ARROW_FADE = { duration: 0.15, ease: EASE_OUT } as const;
/** 箭头换边：滑动途中藏起来，气泡快到位时再在新的一侧出现 */
const ARROW_REVEAL = { duration: 0.12, delay: 0.18, ease: EASE_OUT } as const;

const APPEAR_SCALE = 0.94;
const EXIT_SCALE = 0.97;
const APPEAR_SHIFT = 4;
const CONTENT_SHIFT = 8;
const CONTENT_REPLACE_SCALE = 0.96;
const CONTENT_BLUR = "blur(2px)";
/**
 * 上一条内容出现不到这么久又换了元素（连续扫过）：新内容直接替换、不再交叉淡入，
 * 让文字在扫动途中始终清晰可读，只有表面在滑动。
 */
const RAPID_SWITCH_MS = 150;

const SURFACE_RADIUS = 10;
const SURFACE_SMOOTHING = 0.6;
const ARROW_WIDTH = 10;
const ARROW_BOX_HEIGHT = 6;
/** 箭头中心距表面两端的最小距离：避开圆角 */
const ARROW_INSET = SURFACE_RADIUS * 0.8 + ARROW_WIDTH / 2;

const LONG_PRESS_MS = 450;
const LONG_PRESS_SLOP = 8;
const TOUCH_HIDE_MS = 1500;
/** 可交互气泡的最小隐藏延迟：给指针从元素移到气泡里的链接上的时间 */
const INTERACTIVE_CLOSE_DELAY = 120;

const ARROW_STROKE_PATH =
  "M0 1C1.5 1 2.4 1.7 3.4 3.1L4.25 4.75Q5 6.1 5.75 4.75L6.6 3.1C7.6 1.7 8.5 1 10 1";

const ARROW_ROTATION: Record<MorphTooltipSide, number> = {
  top: 0,
  bottom: 180,
  left: -90,
  right: 90,
};

/* ------------------------------------------------------------------ */
/* 工具函数                                                             */
/* ------------------------------------------------------------------ */

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

function prefersReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hasContent(content: React.ReactNode) {
  return content !== null && content !== undefined && content !== false && content !== "";
}

function isTextContent(content: React.ReactNode): content is string | number {
  return typeof content === "string" || typeof content === "number";
}

const MODIFIER_GLYPHS = "⌘⇧⌥⌃⇪";

/** 每段开头的修饰键符号各自成为一个键帽：「⌘⇧P」→ ⌘ ⇧ P */
function splitModifierGlyphs(part: string) {
  const chars = Array.from(part);
  const keys: string[] = [];
  let index = 0;
  while (index < chars.length - 1 && MODIFIER_GLYPHS.includes(chars[index])) {
    keys.push(chars[index]);
    index += 1;
  }
  keys.push(chars.slice(index).join(""));
  return keys;
}

function normalizeShortcut(shortcut: string | string[] | undefined): string[] {
  if (!shortcut) return [];
  if (Array.isArray(shortcut)) return shortcut.filter((key) => key !== "");
  let body = shortcut.trim();
  if (!body) return [];
  // 结尾的 + 是一个键（放大「⌘+」「Ctrl++」），其余的 + 与空格都是分隔符
  const tail: string[] = [];
  if (body.length > 1 && body.endsWith("+")) {
    tail.push("+");
    body = body.slice(0, -1);
  }
  const parts = body.length > 1 ? body.split(/[\s+]+/).filter(Boolean) : [body];
  return [...parts.flatMap(splitModifierGlyphs), ...tail];
}

function toCssLength(value: number | string) {
  return typeof value === "number" ? `${value}px` : value;
}

function contentIdentity(props: MorphTooltipProps) {
  const keys = normalizeShortcut(props.shortcut).join(" ");
  if (props.contentKey !== undefined) return `k:${String(props.contentKey)}|${keys}`;
  if (isTextContent(props.content)) return `t:${props.content}|${keys}`;
  return `n|${keys}`;
}

function isDisabledElement(element: Element) {
  try {
    return element.matches(":disabled");
  } catch {
    return false;
  }
}

function matchesFocusVisible(element: Element) {
  try {
    return element.matches(":focus-visible");
  } catch {
    return true;
  }
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref && "current" in ref) {
    (ref as React.RefObject<T | null>).current = value;
  }
}

const TABBABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "audio[controls]",
  "video[controls]",
  '[contenteditable]:not([contenteditable="false"])',
  "[tabindex]",
].join(",");

/** 容器里可以用 Tab 聚焦的元素（按文档顺序；不处理正数 tabindex） */
function getTabbables(container: ParentNode, skipHidden: boolean) {
  return Array.from(container.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.closest("[inert]") &&
      !(skipHidden && element.closest('[aria-hidden="true"]')) &&
      element.getClientRects().length > 0,
  );
}

/** 文档中排在 anchor 之后、且不在 exclude 里的第一个可聚焦元素 */
function getNextTabbable(anchor: Element, exclude: Element) {
  return getTabbables(document.body, false).find(
    (element) =>
      !anchor.contains(element) &&
      !exclude.contains(element) &&
      Boolean(anchor.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING),
  );
}

/** 节点内容的宿主：触发元素把内容 Portal 进来，气泡再把它收进当前的内容层 */
function createContentHost() {
  if (typeof document === "undefined") return null;
  const host = document.createElement("div");
  host.className = "qy-morph-tooltip-host";
  host.style.display = "contents";
  return host;
}

/** 按住期间禁止选中文字，返回恢复函数 */
function lockTextSelection(element: HTMLElement) {
  const style = element.style;
  const previous = [
    style.getPropertyValue("-webkit-user-select"),
    style.getPropertyValue("user-select"),
  ];
  style.setProperty("-webkit-user-select", "none");
  style.setProperty("user-select", "none");
  return () => {
    ["-webkit-user-select", "user-select"].forEach((name, index) => {
      if (previous[index]) style.setProperty(name, previous[index]);
      else style.removeProperty(name);
    });
  };
}

let warnedMissingElement = false;

/* ------------------------------------------------------------------ */
/* 定位                                                                 */
/* ------------------------------------------------------------------ */

interface Size {
  w: number;
  h: number;
}

interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface Placement {
  side: MorphTooltipSide;
  x: number;
  y: number;
  /** 箭头中心在气泡上的位置：上下方向为横坐标，左右方向为纵坐标 */
  arrow: number;
}

interface PlacementOptions {
  side: MorphTooltipSide;
  align: MorphTooltipAlign;
  sideOffset: number;
  alignOffset: number;
  avoidCollisions: boolean;
  collisionPadding: number;
}

const OPPOSITE_SIDE: Record<MorphTooltipSide, MorphTooltipSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

function clamp(value: number, min: number, max: number) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

function getViewportBounds(boundary: Element | null | undefined): Bounds {
  const root = document.documentElement;
  const bounds: Bounds = {
    left: 0,
    top: 0,
    right: root.clientWidth || window.innerWidth,
    bottom: root.clientHeight || window.innerHeight,
  };
  if (boundary && boundary.isConnected) {
    const rect = boundary.getBoundingClientRect();
    bounds.left = Math.max(bounds.left, rect.left);
    bounds.top = Math.max(bounds.top, rect.top);
    bounds.right = Math.min(bounds.right, rect.right);
    bounds.bottom = Math.min(bounds.bottom, rect.bottom);
  }
  return bounds;
}

/** 翻转 + 平移 + 箭头夹取：一个够用的碰撞感知定位 */
function computePlacement(
  anchor: DOMRect,
  size: Size,
  options: PlacementOptions,
  bounds: Bounds,
): Placement {
  const { align, sideOffset, alignOffset, avoidCollisions, collisionPadding: pad } = options;
  let side = options.side;

  if (avoidCollisions) {
    const space = (s: MorphTooltipSide) => {
      switch (s) {
        case "top":
          return anchor.top - bounds.top;
        case "bottom":
          return bounds.bottom - anchor.bottom;
        case "left":
          return anchor.left - bounds.left;
        default:
          return bounds.right - anchor.right;
      }
    };
    const vertical = side === "top" || side === "bottom";
    const need = (vertical ? size.h : size.w) + sideOffset + pad;
    const opposite = OPPOSITE_SIDE[side];
    if (space(side) < need && space(opposite) > space(side)) side = opposite;
  }

  const vertical = side === "top" || side === "bottom";
  let x: number;
  let y: number;

  if (vertical) {
    y = side === "top" ? anchor.top - sideOffset - size.h : anchor.bottom + sideOffset;
    x =
      align === "start"
        ? anchor.left + alignOffset
        : align === "end"
          ? anchor.right - size.w - alignOffset
          : anchor.left + anchor.width / 2 - size.w / 2 + alignOffset;
    if (avoidCollisions) x = clamp(x, bounds.left + pad, bounds.right - pad - size.w);
  } else {
    x = side === "left" ? anchor.left - sideOffset - size.w : anchor.right + sideOffset;
    y =
      align === "start"
        ? anchor.top + alignOffset
        : align === "end"
          ? anchor.bottom - size.h - alignOffset
          : anchor.top + anchor.height / 2 - size.h / 2 + alignOffset;
    if (avoidCollisions) y = clamp(y, bounds.top + pad, bounds.bottom - pad - size.h);
  }

  // 停稳时落在整数设备像素上，文字保持清晰
  x = snapToDevicePixel(x);
  y = snapToDevicePixel(y);

  const extent = vertical ? size.w : size.h;
  const along = vertical ? anchor.left + anchor.width / 2 - x : anchor.top + anchor.height / 2 - y;
  const arrow =
    extent - ARROW_INSET < ARROW_INSET
      ? extent / 2
      : clamp(along, ARROW_INSET, extent - ARROW_INSET);

  return { side, x, y, arrow };
}

function snapToDevicePixel(value: number) {
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  return Math.round(value * dpr) / dpr;
}

const clipAncestorCache = new WeakMap<Element, Element[]>();

/** 会裁切触发元素的祖先（overflow 不是 visible 的元素） */
function getClipAncestors(element: Element) {
  const cached = clipAncestorCache.get(element);
  if (cached) return cached;
  const list: Element[] = [];
  const root = document.documentElement;
  for (
    let node = element.parentElement;
    node && node !== document.body && node !== root;
    node = node.parentElement
  ) {
    const style = getComputedStyle(node);
    if (style.overflowX !== "visible" || style.overflowY !== "visible") list.push(node);
  }
  clipAncestorCache.set(element, list);
  return list;
}

/** 触发元素是否还看得见：在视口内，且没有被滚动容器完全裁掉 */
function isAnchorVisible(element: Element, rect: DOMRect) {
  if (!element.isConnected || (rect.width === 0 && rect.height === 0)) return false;
  const root = document.documentElement;
  const vw = root.clientWidth || window.innerWidth;
  const vh = root.clientHeight || window.innerHeight;
  if (rect.bottom <= 0 || rect.right <= 0 || rect.top >= vh || rect.left >= vw) return false;
  for (const ancestor of getClipAncestors(element)) {
    const clip = ancestor.getBoundingClientRect();
    if (
      rect.bottom <= clip.top ||
      rect.top >= clip.bottom ||
      rect.right <= clip.left ||
      rect.left >= clip.right
    ) {
      return false;
    }
  }
  return true;
}

/* ------------------------------------------------------------------ */
/* 范围：每个 Provider 一个状态机                                         */
/* ------------------------------------------------------------------ */

interface ScopeOptions extends MorphTooltipDefaults {
  maxWidth: number;
  maxWidthValue: number | string;
  collisionBoundary: Element | null | undefined;
  disabled: boolean;
}

interface TriggerRecord {
  id: string;
  getElement: () => HTMLElement | null;
  props: MorphTooltipProps;
  /** 节点内容的宿主元素（服务端渲染时为 null） */
  host: HTMLElement | null;
}

interface ScopeSnapshot {
  /** 当前（或刚刚）显示的触发元素 */
  activeId: string | null;
  /** 气泡是否应当可见 */
  open: boolean;
  /** 当前触发元素最新的属性；元素卸载后保留最后一次，供退场使用 */
  props: MorphTooltipProps | null;
  /** 切换到新元素时，新元素中心相对旧元素中心的方向（-1 / 0 / 1） */
  dir: { x: number; y: number };
  /** 这次变化发生的时间（performance.now） */
  at: number;
  rev: number;
}

type Timer = ReturnType<typeof setTimeout>;

function resolveScopeOptions(props: Omit<MorphTooltipProviderProps, "children" | "container">) {
  const d = DEFAULT_MORPH_TOOLTIP_OPTIONS;
  const options: ScopeOptions = {
    delay: props.delay ?? d.delay,
    skipDelayDuration: props.skipDelayDuration ?? d.skipDelayDuration,
    closeDelay: props.closeDelay ?? d.closeDelay,
    morph: props.morph ?? d.morph,
    disabled: props.disabled ?? false,
    side: props.side ?? d.side,
    align: props.align ?? d.align,
    sideOffset: props.sideOffset ?? d.sideOffset,
    alignOffset: props.alignOffset ?? d.alignOffset,
    avoidCollisions: props.avoidCollisions ?? d.avoidCollisions,
    collisionPadding: props.collisionPadding ?? d.collisionPadding,
    collisionBoundary: props.collisionBoundary,
    variant: props.variant ?? d.variant,
    arrow: props.arrow ?? d.arrow,
    maxWidth: typeof props.maxWidth === "number" ? props.maxWidth : d.maxWidth,
    maxWidthValue: props.maxWidth ?? d.maxWidth,
    hoverable: props.hoverable ?? d.hoverable,
    interactive: props.interactive ?? d.interactive,
    closeOnClick: props.closeOnClick ?? d.closeOnClick,
    touch: props.touch ?? d.touch,
  };
  return options;
}

const ROOT_OPTIONS = resolveScopeOptions({});

/**
 * 范围状态机：closed → pending（等待 delay）→ open → closing（等待 closeDelay）→ 退场 → closed。
 * 只保存交互状态，气泡的动画由 MorphTooltipBubble 负责。
 */
class MorphTooltipScope {
  options: ScopeOptions;
  readonly tooltipId: string;
  snapshot: ScopeSnapshot = {
    activeId: null,
    open: false,
    props: null,
    dir: { x: 0, y: 0 },
    at: 0,
    rev: 0,
  };
  /** 气泡是否还在页面上（显示中或退场动画中） */
  bubblePresent = false;
  /** 当前挂载的气泡根元素：键盘从元素 Tab 进可交互气泡时使用 */
  bubbleElement: HTMLElement | null = null;

  private records = new Map<string, TriggerRecord>();
  private listeners = new Set<() => void>();
  private hoverId: string | null = null;
  private focusId: string | null = null;
  /** 按下（closeOnClick）或 Esc 之后暂不显示的元素：指针离开或失焦后恢复 */
  private suppressedId: string | null = null;
  private pendingId: string | null = null;
  private bubbleHovered = false;
  private bubbleFocused = false;
  private lastClosedAt = -Infinity;
  private pendingTimer: Timer | undefined;
  private closeTimer: Timer | undefined;
  private touchTimer: Timer | undefined;

  constructor(options: ScopeOptions, tooltipId: string) {
    this.options = options;
    this.tooltipId = tooltipId;
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.snapshot;

  isOpenFor(id: string) {
    return this.snapshot.open && this.snapshot.activeId === id;
  }

  getRecord(id: string | null) {
    return id ? this.records.get(id) : undefined;
  }

  register(record: TriggerRecord) {
    this.records.set(record.id, record);
  }

  unregister(id: string) {
    if (this.pendingId === id) this.clearPending();
    if (this.hoverId === id) this.hoverId = null;
    if (this.focusId === id) this.focusId = null;
    if (this.suppressedId === id) this.suppressedId = null;
    this.records.delete(id);
    const snap = this.snapshot;
    if (snap.activeId === id && snap.open) {
      this.clearClose();
      this.lastClosedAt = now();
      this.emit({ open: false });
      this.reclaim();
    }
  }

  /** 触发元素重新渲染后调用：内容或配置变化时通知气泡，受控的持续显示请求在这里重新生效 */
  recordUpdated(id: string) {
    const record = this.records.get(id);
    if (!record) return;
    const snap = this.snapshot;
    if (snap.activeId === id) {
      if (snap.open && !this.isShowable(record)) {
        // 内容清空或被禁用：不论是否受控都立即收起，不再显示旧内容
        this.forceClose(id);
        return;
      }
      if (snap.props !== record.props) this.emit({ props: record.props });
    }
    if (record.props.open === true && !this.snapshot.open && this.isShowable(record)) {
      this.commit(id, true, true);
    }
  }

  setOptions(options: ScopeOptions) {
    const wasDisabled = this.options.disabled;
    this.options = options;
    const snap = this.snapshot;
    if (options.disabled && snap.open && snap.activeId) this.forceClose(snap.activeId);
    else if (wasDisabled && !options.disabled) this.reclaim();
  }

  /* ---------------- 事件 ---------------- */

  enter(id: string) {
    this.hoverId = id;
    if (!this.canShow(id)) return;
    const snap = this.snapshot;
    if (snap.open && snap.activeId === id) {
      this.clearClose();
      return;
    }
    // 气泡还在（包括 closing 与退场动画中），或刚消失不久：立即切过去
    if (snap.open || this.bubblePresent || this.withinSkipWindow()) {
      this.clearPending();
      this.request(id, true);
      return;
    }
    this.schedulePending(id);
  }

  leave(id: string) {
    if (this.hoverId === id) this.hoverId = null;
    if (this.suppressedId === id) this.suppressedId = null;
    if (this.pendingId === id) this.clearPending();
    const snap = this.snapshot;
    if (snap.open && snap.activeId === id && this.focusId !== id) this.scheduleClose();
  }

  press(id: string) {
    const record = this.records.get(id);
    if (!record) return;
    if (!(record.props.closeOnClick ?? this.options.closeOnClick)) return;
    this.suppressedId = id;
    if (this.pendingId === id) this.clearPending();
    if (this.isOpenFor(id)) this.request(id, false);
  }

  focus(id: string) {
    this.focusId = id;
    if (!this.canShow(id)) return;
    this.clearPending();
    this.request(id, true);
  }

  blur(id: string) {
    if (this.focusId === id) this.focusId = null;
    if (this.suppressedId === id && this.hoverId !== id) this.suppressedId = null;
    const snap = this.snapshot;
    if (snap.open && snap.activeId === id && this.hoverId !== id) this.scheduleClose();
  }

  touchShow(id: string) {
    if (!this.canShow(id)) return;
    this.clearTouch();
    this.request(id, true);
  }

  touchRelease(id: string) {
    this.clearTouch();
    this.touchTimer = setTimeout(() => {
      this.touchTimer = undefined;
      if (this.isOpenFor(id)) this.request(id, false);
    }, TOUCH_HIDE_MS);
  }

  enterBubble() {
    if (!this.snapshot.open) return;
    this.bubbleHovered = true;
    this.clearClose();
  }

  leaveBubble() {
    this.bubbleHovered = false;
    if (this.shouldCloseAfterLeaving()) this.scheduleClose();
  }

  enterBubbleFocus() {
    if (!this.snapshot.open) return;
    this.bubbleFocused = true;
    this.clearClose();
  }

  /** 焦点离开可交互气泡：回到触发元素时由元素自己的聚焦处理 */
  leaveBubbleFocus(next: Node | null) {
    this.bubbleFocused = false;
    const element = this.getRecord(this.snapshot.activeId)?.getElement();
    if (next && element?.contains(next)) return;
    if (this.shouldCloseAfterLeaving()) this.scheduleClose();
  }

  /** Esc、窗口失焦、元素移出视口：立即隐藏。suppress 时直到指针离开或失焦前不再显示 */
  dismiss(suppress = false) {
    this.clearPending();
    const snap = this.snapshot;
    if (snap.open && snap.activeId) {
      if (suppress) this.suppressedId = snap.activeId;
      this.request(snap.activeId, false);
    }
  }

  /** 气泡的退场动画结束 */
  markExited() {
    this.bubblePresent = false;
    this.bubbleHovered = false;
    this.bubbleFocused = false;
    this.lastClosedAt = now();
  }

  dispose() {
    this.clearPending();
    this.clearClose();
    this.clearTouch();
  }

  /* ---------------- 显示 / 隐藏 ---------------- */

  /** 交互触发的显示 / 隐藏：受控的提示只通知 onOpenChange，等外部改 open */
  request(id: string, open: boolean) {
    const record = this.records.get(id);
    if (!record) return;
    const controlled = record.props.open;
    if (controlled !== undefined) {
      if (controlled === open) this.commit(id, open, true);
      else record.props.onOpenChange?.(open);
      return;
    }
    this.commit(id, open);
  }

  /** 真正改变气泡状态；fromProp 为 true 表示来自受控属性，不再回调 onOpenChange */
  commit(id: string, open: boolean, fromProp = false) {
    const snap = this.snapshot;
    if (open) {
      const record = this.records.get(id);
      if (!record || !this.isShowable(record)) return;
      this.clearClose();
      this.clearPending();
      this.clearTouch();
      if (snap.open && snap.activeId === id) return;
      const prevId = snap.activeId;
      const switching = prevId !== null && prevId !== id && (snap.open || this.bubblePresent);
      const dir = switching ? this.directionBetween(prevId, id) : { x: 0, y: 0 };
      if (snap.open && prevId && prevId !== id) {
        this.records.get(prevId)?.props.onOpenChange?.(false);
      }
      if (prevId !== id) {
        this.bubbleHovered = false;
        this.bubbleFocused = false;
      }
      this.emit({ activeId: id, open: true, props: record.props, dir });
      if (!fromProp) record.props.onOpenChange?.(true);
      return;
    }
    if (snap.activeId !== id || !snap.open) return;
    this.clearClose();
    this.lastClosedAt = now();
    this.emit({ open: false });
    if (!fromProp) this.records.get(id)?.props.onOpenChange?.(false);
    this.reclaim(id);
  }

  /* ---------------- 内部 ---------------- */

  /** 不论是否受控都收起，并通知一次 onOpenChange(false) */
  private forceClose(id: string) {
    this.commit(id, false, true);
    this.records.get(id)?.props.onOpenChange?.(false);
  }

  /** 气泡空出来时，交还给仍然保持 open={true} 的受控提示 */
  private reclaim(exceptId?: string) {
    if (this.snapshot.open) return;
    for (const record of this.records.values()) {
      if (record.id !== exceptId && record.props.open === true && this.isShowable(record)) {
        this.commit(record.id, true, true);
        return;
      }
    }
  }

  private shouldCloseAfterLeaving() {
    const snap = this.snapshot;
    return Boolean(
      snap.open &&
        snap.activeId &&
        !this.bubbleHovered &&
        !this.bubbleFocused &&
        this.hoverId !== snap.activeId &&
        this.focusId !== snap.activeId,
    );
  }

  private isShowable(record: TriggerRecord) {
    return !this.options.disabled && !record.props.disabled && hasContent(record.props.content);
  }

  private canShow(id: string) {
    const record = this.records.get(id);
    return Boolean(record && this.isShowable(record) && this.suppressedId !== id);
  }

  private withinSkipWindow() {
    const duration = this.options.skipDelayDuration;
    return duration > 0 && now() - this.lastClosedAt < duration;
  }

  private schedulePending(id: string) {
    this.clearPending();
    const record = this.records.get(id);
    const delay = record?.props.delay ?? this.options.delay;
    if (delay <= 0) {
      this.request(id, true);
      return;
    }
    this.pendingId = id;
    this.pendingTimer = setTimeout(() => {
      this.pendingTimer = undefined;
      this.pendingId = null;
      if (this.hoverId === id || this.focusId === id) this.request(id, true);
    }, delay);
  }

  private scheduleClose() {
    this.clearClose();
    const id = this.snapshot.activeId;
    if (!id) return;
    const interactive = this.snapshot.props?.interactive ?? this.options.interactive;
    const delay = interactive
      ? Math.max(this.options.closeDelay, INTERACTIVE_CLOSE_DELAY)
      : Math.max(this.options.closeDelay, 0);
    // 即使是 0 也放到下一个任务：指针离开元素与进入气泡（桥）的事件在同一次派发里
    this.closeTimer = setTimeout(() => {
      this.closeTimer = undefined;
      if (this.bubbleHovered || this.bubbleFocused) return;
      this.request(id, false);
    }, delay);
  }

  private directionBetween(fromId: string, toId: string) {
    const from = this.records.get(fromId)?.getElement();
    const to = this.records.get(toId)?.getElement();
    if (!from || !to) return { x: 0, y: 0 };
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    return {
      x: Math.abs(dx) < 1 ? 0 : Math.sign(dx),
      y: Math.abs(dy) < 1 ? 0 : Math.sign(dy),
    };
  }

  private clearPending() {
    if (this.pendingTimer !== undefined) clearTimeout(this.pendingTimer);
    this.pendingTimer = undefined;
    this.pendingId = null;
  }

  private clearClose() {
    if (this.closeTimer !== undefined) clearTimeout(this.closeTimer);
    this.closeTimer = undefined;
  }

  private clearTouch() {
    if (this.touchTimer !== undefined) clearTimeout(this.touchTimer);
    this.touchTimer = undefined;
  }

  private emit(patch: Partial<ScopeSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch, at: now(), rev: this.snapshot.rev + 1 };
    this.listeners.forEach((listener) => listener());
  }
}

const MorphTooltipScopeContext = React.createContext<MorphTooltipScope | null>(null);
/** Provider 解析后的默认值：触发元素渲染时需要（如触屏开关） */
const MorphTooltipOptionsContext = React.createContext<ScopeOptions>(ROOT_OPTIONS);

/* ------------------------------------------------------------------ */
/* 气泡                                                                 */
/* ------------------------------------------------------------------ */

interface ResolvedTooltip extends PlacementOptions {
  collisionBoundary: Element | null | undefined;
  maxWidth: string;
  variant: MorphTooltipVariant;
  arrow: boolean;
  hoverable: boolean;
  interactive: boolean;
  className: string | undefined;
}

function resolveTooltip(props: MorphTooltipProps | null, scope: ScopeOptions): ResolvedTooltip {
  const interactive = props?.interactive ?? scope.interactive;
  return {
    side: props?.side ?? scope.side,
    align: props?.align ?? scope.align,
    sideOffset: props?.sideOffset ?? scope.sideOffset,
    alignOffset: props?.alignOffset ?? scope.alignOffset,
    avoidCollisions: props?.avoidCollisions ?? scope.avoidCollisions,
    collisionPadding: props?.collisionPadding ?? scope.collisionPadding,
    collisionBoundary:
      props?.collisionBoundary !== undefined ? props.collisionBoundary : scope.collisionBoundary,
    maxWidth: toCssLength(props?.maxWidth ?? scope.maxWidthValue),
    variant: props?.variant ?? scope.variant,
    arrow: props?.arrow ?? scope.arrow,
    hoverable: interactive || (props?.hoverable ?? scope.hoverable),
    interactive,
    className: props?.className,
  };
}

interface LayerView {
  content: React.ReactNode;
  keys: string[];
  maxWidth: string;
}

/**
 * 内容层的进场方式
 * - appear：随气泡一起出现，自身不动画
 * - switch：换到另一个元素，沿移动方向滑入并交叉淡入
 * - replace：同一元素上内容换了一条，原地淡入并轻微缩放
 * - instant：直接替换（连续扫过、morph 关闭、减少动态效果）
 */
type LayerMode = "appear" | "switch" | "replace" | "instant";

interface LayerState {
  id: number;
  ownerId: string;
  identity: string;
  mode: LayerMode;
  /** 同一元素上的内容换了一条（用于读屏播报） */
  inPlace: boolean;
  /** 表面直接跳到新位置与尺寸（morph 关闭或减少动态效果） */
  jump: boolean;
  axis: "x" | "y";
  dir: number;
  /** 这一层出现的时间（来自范围快照） */
  createdAt: number;
  /** 退场中的层保留离场那一刻的内容 */
  view: LayerView;
  exiting: boolean;
  exitMode?: "switch" | "replace";
  exitAxis?: "x" | "y";
  exitDir?: number;
}

function viewOf(props: MorphTooltipProps | null, scope: ScopeOptions): LayerView {
  return {
    content: props?.content,
    keys: normalizeShortcut(props?.shortcut),
    maxWidth: toCssLength(props?.maxWidth ?? scope.maxWidthValue),
  };
}

/** 测量内容层：先按 max-content / maxWidth 自然排版，再把宽度固定住 */
function measureLayer(element: HTMLElement, text: boolean): Size {
  element.style.width = "";
  const style = getComputedStyle(element);
  let w = parseFloat(style.width) || 0;
  const h = parseFloat(style.height) || 0;
  if (text) w = shrinkWrappedText(element, w, h);
  element.style.width = `${w}px`;
  element.style.marginLeft = `${-w / 2}px`;
  element.style.marginTop = `${-h / 2}px`;
  return { w, h };
}

/** 文字换行后，盒子仍按 maxWidth 撑满；收窄到最长的一行，让左右留白对称 */
function shrinkWrappedText(element: HTMLElement, w: number, h: number) {
  const text = element.firstElementChild as HTMLElement | null;
  if (!text || !text.classList.contains("qy-morph-tooltip-text")) return w;
  const textStyle = getComputedStyle(text);
  const lineHeight = parseFloat(textStyle.lineHeight) || 18;
  const textWidth = parseFloat(textStyle.width) || 0;
  if ((parseFloat(textStyle.height) || 0) < lineHeight * 1.5) return w;

  // 祖先上可能有出现动画的缩放：用整体比例把客户端坐标换回 CSS 像素
  const ratio = element.getBoundingClientRect().width / w;
  if (!ratio || !Number.isFinite(ratio)) return w;
  const range = document.createRange();
  range.selectNodeContents(text);
  const lines = new Map<number, [number, number]>();
  for (const rect of Array.from(range.getClientRects())) {
    if (rect.width === 0) continue;
    const key = Math.round(rect.top / ratio);
    const line = lines.get(key);
    if (line) {
      line[0] = Math.min(line[0], rect.left);
      line[1] = Math.max(line[1], rect.right);
    } else {
      lines.set(key, [rect.left, rect.right]);
    }
  }
  range.detach();
  let longest = 0;
  lines.forEach(([left, right]) => {
    longest = Math.max(longest, (right - left) / ratio);
  });
  const slack = textWidth - longest;
  if (!longest || slack < 1) return w;
  const next = Math.ceil(w - slack + 0.5);
  element.style.width = `${next}px`;
  // 收窄后行数变了就退回
  if (Math.abs((parseFloat(getComputedStyle(element).height) || 0) - h) > 0.5) return w;
  return next;
}

/** Motion 的完成回调只认退场目标（opacity 为 0），进场被打断时的回调不算 */
function isExitDefinition(definition: unknown) {
  return (
    typeof definition === "object" &&
    definition !== null &&
    !Array.isArray(definition) &&
    (definition as TargetAndTransition).opacity === 0
  );
}

const axisOffset = (axis: "x" | "y", value: number) =>
  axis === "x" ? { x: value, y: 0 } : { x: 0, y: value };

interface TooltipLayerProps {
  layer: LayerState;
  view: LayerView;
  /** 节点内容的宿主（只给仍在显示的节点内容层） */
  host: HTMLElement | null;
  onMeasure: (id: number, size: Size, reason: "mount" | "resize") => void;
  onExitComplete: (id: number) => void;
  onAnnounce: (text: string) => void;
}

function TooltipLayer({
  layer,
  view,
  host,
  onMeasure,
  onExitComplete,
  onAnnounce,
}: TooltipLayerProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const exitingRef = React.useRef(layer.exiting);
  const text = isTextContent(view.content);
  const layerId = layer.id;
  const announce = layer.inPlace;

  React.useLayoutEffect(() => {
    exitingRef.current = layer.exiting;
  }, [layer.exiting]);

  // 节点内容：把触发元素 Portal 进来的宿主收进这一层；宿主里已经有新内容时，清掉上一次留下的快照。
  // 每次提交都检查一遍，退场途中重新打开（宿主重新有内容）时同样适用。
  React.useLayoutEffect(() => {
    if (layer.exiting || text || !host) return;
    const body = bodyRef.current;
    if (!body) return;
    if (host.parentElement !== body) body.appendChild(host);
    if (host.firstChild) {
      Array.from(body.children).forEach((child) => {
        if (child.classList.contains("qy-morph-tooltip-snapshot")) child.remove();
      });
    }
  });

  // 挂载时（绘制之前）测量，作为表面的目标尺寸；内容自身变化（异步加载、节点更新）时重新测量
  React.useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    onMeasure(layerId, measureLayer(element, text), "mount");
    if (typeof ResizeObserver === "undefined") return;
    let first = true;
    const observer = new ResizeObserver(() => {
      if (first) {
        first = false;
        return;
      }
      if (exitingRef.current) return;
      onMeasure(layerId, measureLayer(element, text), "resize");
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [layerId, onMeasure, text]);

  // 同一元素上的内容换了一条（如「复制」→「已复制」）：读屏软件不会重读 aria-describedby，主动播报一次
  React.useLayoutEffect(() => {
    if (!announce) return;
    const source = ref.current?.querySelector(".qy-morph-tooltip-text, .qy-morph-tooltip-body");
    const message = source?.textContent?.trim();
    if (message) onAnnounce(message);
  }, [announce, onAnnounce]);

  // 最大宽度变化：重新按新的上限排版
  const maxWidthRef = React.useRef(view.maxWidth);
  React.useLayoutEffect(() => {
    if (maxWidthRef.current === view.maxWidth) return;
    maxWidthRef.current = view.maxWidth;
    const element = ref.current;
    if (!element || exitingRef.current) return;
    onMeasure(layerId, measureLayer(element, text), "resize");
  }, [layerId, onMeasure, text, view.maxWidth]);

  // 进场、常驻与退场的目标都带同一组键（opacity / x / y / scale / filter）：
  // 少了某个键时 Motion 会为它另起一个立即完成的回退动画，旧内容会被提前移除。
  let initial: false | TargetAndTransition = false;
  if (layer.mode === "switch") {
    initial = {
      opacity: 0,
      ...axisOffset(layer.axis, layer.dir * CONTENT_SHIFT),
      scale: 1,
      filter: CONTENT_BLUR,
    };
  } else if (layer.mode === "replace") {
    initial = { opacity: 0, x: 0, y: 0, scale: CONTENT_REPLACE_SCALE, filter: CONTENT_BLUR };
  }

  let target: TargetAndTransition;
  if (layer.exiting) {
    // 旧内容：沿移动的反方向滑出（同一元素上则轻微缩小），模糊并淡出
    const sliding = layer.exitMode === "switch";
    target = {
      opacity: 0,
      ...(sliding
        ? axisOffset(layer.exitAxis ?? "x", -(layer.exitDir ?? 0) * CONTENT_SHIFT)
        : { x: 0, y: 0 }),
      scale: sliding ? 1 : CONTENT_REPLACE_SCALE,
      filter: ["blur(0px)", CONTENT_BLUR],
      transition: CONTENT_OUT,
    };
  } else if (initial === false) {
    target = { opacity: 1, x: 0, y: 0, scale: 1, filter: "none" };
  } else {
    // 新内容：从移动方向 8px 外滑入、去模糊、淡入；结束后移除 filter，保持文字清晰
    target = {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: CONTENT_IN,
      transitionEnd: { filter: "none" },
    };
  }

  return (
    <motion.div
      ref={ref}
      data-slot="morph-tooltip-content"
      aria-hidden={layer.exiting || undefined}
      className="qy-morph-tooltip-content"
      style={{ "--qy-morph-tooltip-max-width": view.maxWidth } as React.CSSProperties}
      initial={initial}
      animate={target}
      onAnimationComplete={(definition) => {
        if (layer.exiting && isExitDefinition(definition)) onExitComplete(layer.id);
      }}
    >
      {text ? (
        <span className="qy-morph-tooltip-text">{view.content}</span>
      ) : (
        <div ref={bodyRef} className="qy-morph-tooltip-body" />
      )}
      {view.keys.length > 0 ? (
        <span data-slot="morph-tooltip-shortcut" className="qy-morph-tooltip-keys">
          {view.keys.map((key, index) => (
            <kbd key={`${key}-${index}`} className="qy-morph-tooltip-key">
              {key}
            </kbd>
          ))}
        </span>
      ) : null}
    </motion.div>
  );
}

type Spring = typeof MORPH_SPRING | typeof TRACK_SPRING;

/** 把偏移量换到新的基准上并保持速度，继续用弹簧收回到 0 */
function rebase(
  base: MotionValue<number>,
  offset: MotionValue<number>,
  target: number,
  spring: Spring,
) {
  const visual = base.get() + offset.get();
  const velocity = offset.getVelocity();
  base.jump(target);
  const delta = visual - target;
  if (Math.abs(delta) < 0.01 && Math.abs(velocity) < 0.01) {
    offset.jump(0);
    return;
  }
  offset.jump(delta);
  animate(offset, 0, { ...spring, velocity });
}

type RelayoutKind = "appear" | "morph" | "jump" | "follow";

interface MorphTooltipBubbleProps {
  scope: MorphTooltipScope;
  snap: ScopeSnapshot;
  options: ScopeOptions;
  onExited: () => void;
  onAnnounce: (text: string) => void;
}

function MorphTooltipBubble({ scope, snap, options, onExited, onAnnounce }: MorphTooltipBubbleProps) {
  const resolved = resolveTooltip(snap.props, options);
  const rootRef = React.useRef<HTMLDivElement>(null);

  /* ---------------- 内容层 ---------------- */

  const [layers, setLayers] = React.useState<LayerState[]>(() => [
    {
      id: 0,
      ownerId: snap.activeId ?? "",
      identity: snap.props ? contentIdentity(snap.props) : "",
      mode: "appear",
      inPlace: false,
      jump: false,
      axis: "x",
      dir: 0,
      createdAt: snap.at,
      view: viewOf(snap.props, options),
      exiting: false,
    },
  ]);
  const [prevSnap, setPrevSnap] = React.useState(snap);
  const [side, setSide] = React.useState<MorphTooltipSide>(resolved.side);

  // 根据上一次渲染的快照推导内容层（React 文档中的「在渲染期间根据前一次的值调整状态」）
  if (snap !== prevSnap) {
    setPrevSnap(snap);
    const top = layers[layers.length - 1];
    if (
      snap.open &&
      snap.activeId &&
      snap.props &&
      (top.ownerId !== snap.activeId || top.identity !== contentIdentity(snap.props))
    ) {
      const switching = top.ownerId !== snap.activeId;
      const still = !options.morph || prefersReducedMotion();
      const rapid = switching && snap.at - top.createdAt < RAPID_SWITCH_MS;
      const mode: LayerMode = still || rapid ? "instant" : switching ? "switch" : "replace";
      const vertical = side === "top" || side === "bottom";
      const axis = vertical ? "x" : "y";
      const dir = switching ? (vertical ? snap.dir.x : snap.dir.y) : 0;
      // 交叉淡入时保留旧层退场（最多两层）；直接替换时旧层立即移除
      const previous =
        mode === "switch" || mode === "replace"
          ? layers
              .map((layer) =>
                layer.exiting
                  ? layer
                  : {
                      ...layer,
                      view: viewOf(prevSnap.props, options),
                      exiting: true,
                      exitMode: mode,
                      exitAxis: axis as "x" | "y",
                      exitDir: dir,
                    },
              )
              .slice(-2)
          : [];
      setLayers([
        ...previous,
        {
          id: top.id + 1,
          ownerId: snap.activeId,
          identity: contentIdentity(snap.props),
          mode,
          inPlace: !switching,
          jump: still,
          axis,
          dir,
          createdAt: snap.at,
          view: viewOf(snap.props, options),
          exiting: false,
        },
      ]);
    }
  }

  const topLayer = layers[layers.length - 1];
  const liveView = viewOf(snap.props, options);

  /* ---------------- 动画值 ---------------- */

  // 位置 = 基准（外层，直接跟随元素）+ 偏移（内层，弹簧收回到 0）。滚动只改基准，形变中也贴着元素走。
  // 两层各自持有 MotionValue，不用 useTransform 组合：开发模式下 StrictMode 重挂 effect 时
  // 会取消组合值排队中的更新，第一次出现的位置就丢了。
  const baseX = useMotionValue(0);
  const baseY = useMotionValue(0);
  const offsetX = useMotionValue(0);
  const offsetY = useMotionValue(0);
  const width = useMotionValue(0);
  const height = useMotionValue(0);
  const arrowX = useMotionValue(0);
  const arrowY = useMotionValue(0);
  const arrowRotate = useMotionValue(0);
  const arrowOpacity = useMotionValue(resolved.arrow ? 1 : 0);
  const opacity = useMotionValue(0);
  const scale = useMotionValue(APPEAR_SCALE);
  const shiftX = useMotionValue(0);
  const shiftY = useMotionValue(0);
  const origin = useMotionValue("50% 100%");

  /* ---------------- 排布 ---------------- */

  const activeIdRef = React.useRef(snap.activeId);
  const resolvedRef = React.useRef(resolved);
  const topLayerRef = React.useRef(topLayer);
  const sizesRef = React.useRef(new Map<number, Size>());
  const placementRef = React.useRef<Placement | null>(null);
  const targetsRef = React.useRef({ w: 0, h: 0, arrow: 0 });
  /** 是否已经播放过出现动画（找不到触发元素时会推迟到下一帧再试） */
  const appearedRef = React.useRef(false);
  const laidOutLayerRef = React.useRef(-1);
  const wasOpenRef = React.useRef(snap.open);
  const offscreenRef = React.useRef<string | null>(null);
  const onExitedRef = React.useRef(onExited);

  // 子组件的 layout effect 先于这里运行：子层测量 → 这里排布，都在绘制之前
  React.useLayoutEffect(() => {
    activeIdRef.current = snap.activeId;
    resolvedRef.current = resolved;
    topLayerRef.current = topLayer;
    onExitedRef.current = onExited;
  });

  const relayout = React.useCallback(
    (kind: RelayoutKind, rectArg?: DOMRect) => {
      const element = scope.getRecord(activeIdRef.current)?.getElement();
      const size = sizesRef.current.get(topLayerRef.current.id);
      if (!element || !size) return;
      const o = resolvedRef.current;
      const rect = rectArg ?? element.getBoundingClientRect();
      const p = computePlacement(rect, size, o, getViewportBounds(o.collisionBoundary));
      const prev = placementRef.current;
      const targets = targetsRef.current;

      if (
        kind !== "appear" &&
        prev &&
        prev.side === p.side &&
        Math.abs(prev.x - p.x) < 0.01 &&
        Math.abs(prev.y - p.y) < 0.01 &&
        Math.abs(prev.arrow - p.arrow) < 0.01 &&
        targets.w === size.w &&
        targets.h === size.h
      ) {
        return;
      }
      placementRef.current = p;
      const sideChanged = !prev || prev.side !== p.side;
      if (sideChanged) setSide(p.side);

      // 箭头：沿边的坐标与表面共用弹簧；换边时直接放到位（此时箭头是隐藏的）
      const placeArrow = (mode: "jump" | "animate" | "follow", spring: Spring = MORPH_SPRING) => {
        const vertical = p.side === "top" || p.side === "bottom";
        const along = vertical ? arrowX : arrowY;
        const across = vertical ? arrowY : arrowX;
        const target = p.arrow - (vertical ? ARROW_WIDTH : ARROW_BOX_HEIGHT) / 2;
        across.jump(0);
        arrowRotate.jump(ARROW_ROTATION[p.side]);
        if (mode === "jump") along.jump(target);
        else if (mode === "animate" || along.isAnimating()) animate(along, target, spring);
        else along.jump(target);
      };

      const instant = kind === "appear" || kind === "jump" || !prev || prefersReducedMotion();
      if (instant) {
        baseX.jump(p.x);
        baseY.jump(p.y);
        offsetX.jump(0);
        offsetY.jump(0);
        width.jump(size.w);
        height.jump(size.h);
        placeArrow("jump");
      } else if (kind === "morph" || sideChanged) {
        // 形变（或滚动时翻转）：从当前位置与速度出发，用同一个弹簧滑到新目标；
        // 上一段形变还没停又换目标（连续扫过）时用更紧的弹簧，气泡不会落后指针太多
        const chained =
          offsetX.isAnimating() ||
          offsetY.isAnimating() ||
          width.isAnimating() ||
          height.isAnimating();
        const spring: Spring = chained ? TRACK_SPRING : MORPH_SPRING;
        rebase(baseX, offsetX, p.x, spring);
        rebase(baseY, offsetY, p.y, spring);
        if (targets.w !== size.w) animate(width, size.w, spring);
        if (targets.h !== size.h) animate(height, size.h, spring);
        if (sideChanged) {
          // 换边：箭头先藏起来，气泡快到位时再在新的一侧淡入，不在滑动途中指向空白处
          placeArrow("jump");
          arrowOpacity.jump(0);
          if (o.arrow) animate(arrowOpacity, 1, ARROW_REVEAL);
        } else if (targets.arrow !== p.arrow) {
          placeArrow("animate", spring);
        }
      } else {
        // 跟随滚动 / 视口变化：基准直接设置，进行中的形变偏移不受影响
        baseX.jump(p.x);
        baseY.jump(p.y);
        if (targets.arrow !== p.arrow) placeArrow("follow");
      }
      targetsRef.current = { w: size.w, h: size.h, arrow: p.arrow };
    },
    [
      scope,
      baseX,
      baseY,
      offsetX,
      offsetY,
      width,
      height,
      arrowX,
      arrowY,
      arrowRotate,
      arrowOpacity,
    ],
  );

  const applyOrigin = React.useCallback(() => {
    const p = placementRef.current;
    const size = sizesRef.current.get(topLayerRef.current.id);
    if (!p || !size) return;
    const gap = resolvedRef.current.sideOffset;
    const point =
      p.side === "top"
        ? [p.arrow, size.h + gap]
        : p.side === "bottom"
          ? [p.arrow, -gap]
          : p.side === "left"
            ? [size.w + gap, p.arrow]
            : [-gap, p.arrow];
    origin.set(`${point[0]}px ${point[1]}px`);
  }, [origin]);

  const playAppear = React.useCallback(() => {
    applyOrigin();
    opacity.jump(0);
    if (prefersReducedMotion()) {
      scale.jump(1);
      shiftX.jump(0);
      shiftY.jump(0);
      animate(opacity, 1, REDUCED_FADE);
      return;
    }
    const s = placementRef.current?.side ?? "top";
    scale.jump(APPEAR_SCALE);
    shiftX.jump(s === "left" ? APPEAR_SHIFT : s === "right" ? -APPEAR_SHIFT : 0);
    shiftY.jump(s === "top" ? APPEAR_SHIFT : s === "bottom" ? -APPEAR_SHIFT : 0);
    animate(opacity, 1, OPACITY_IN);
    animate(scale, 1, APPEAR_SPRING);
    animate(shiftX, 0, APPEAR_SPRING);
    animate(shiftY, 0, APPEAR_SPRING);
  }, [applyOrigin, opacity, scale, shiftX, shiftY]);

  /** 第一次出现：只有拿到了位置才播放，否则保持透明，等下一帧再试 */
  const tryAppear = React.useCallback(() => {
    relayout("appear");
    if (!placementRef.current) return false;
    appearedRef.current = true;
    playAppear();
    return true;
  }, [relayout, playAppear]);

  const handleMeasure = React.useCallback(
    (id: number, size: Size, reason: "mount" | "resize") => {
      sizesRef.current.set(id, size);
      if (reason === "resize" && appearedRef.current && id === topLayerRef.current.id) {
        relayout("morph");
      }
    },
    [relayout],
  );

  const handleExitComplete = React.useCallback((id: number) => {
    sizesRef.current.delete(id);
    setLayers((current) => current.filter((layer) => layer.id !== id));
  }, []);

  // 被直接替换掉的层不会走退场回调：清理它们的尺寸记录
  React.useLayoutEffect(() => {
    for (const id of Array.from(sizesRef.current.keys())) {
      if (!layers.some((layer) => layer.id === id)) sizesRef.current.delete(id);
    }
  }, [layers]);

  // 箭头开关（在不同提示之间移动时）：淡入淡出。写在排布之前，换边的隐藏逻辑可以覆盖它
  const arrowEnabled = resolved.arrow;
  const arrowEnabledRef = React.useRef(arrowEnabled);
  React.useLayoutEffect(() => {
    if (arrowEnabledRef.current === arrowEnabled) return;
    arrowEnabledRef.current = arrowEnabled;
    animate(arrowOpacity, arrowEnabled ? 1 : 0, prefersReducedMotion() ? REDUCED_FADE : ARROW_FADE);
  }, [arrowEnabled, arrowOpacity]);

  // 新的内容层测量完毕：第一次是出现，之后是形变（或直接切换）
  React.useLayoutEffect(() => {
    if (laidOutLayerRef.current === topLayer.id) return;
    laidOutLayerRef.current = topLayer.id;
    if (!appearedRef.current) {
      tryAppear();
      return;
    }
    relayout(topLayer.jump ? "jump" : "morph");
  }, [topLayer, relayout, tryAppear]);

  // 方向、对齐、距离等配置变化：形变到新位置
  const placementSignature = [
    resolved.side,
    resolved.align,
    resolved.sideOffset,
    resolved.alignOffset,
    resolved.avoidCollisions,
    resolved.collisionPadding,
  ].join("|");
  const signatureRef = React.useRef(placementSignature);
  React.useLayoutEffect(() => {
    if (signatureRef.current === placementSignature) return;
    signatureRef.current = placementSignature;
    if (appearedRef.current) relayout("morph");
  }, [placementSignature, relayout]);

  // 显示 / 隐藏：退场中再次显示时从当前不透明度与缩放反向回来
  React.useLayoutEffect(() => {
    if (wasOpenRef.current === snap.open) return;
    wasOpenRef.current = snap.open;
    const reduced = prefersReducedMotion();
    if (snap.open) {
      offscreenRef.current = null;
      if (!appearedRef.current) return;
      animate(opacity, 1, reduced ? REDUCED_FADE : OPACITY_IN);
      if (!reduced) {
        animate(scale, 1, APPEAR_SPRING);
        animate(shiftX, 0, APPEAR_SPRING);
        animate(shiftY, 0, APPEAR_SPRING);
      }
      return;
    }
    applyOrigin();
    animate(opacity, 0, {
      ...(reduced ? REDUCED_FADE : OPACITY_OUT),
      onComplete: () => {
        if (!scope.snapshot.open) onExitedRef.current();
      },
    });
    if (!reduced) animate(scale, EXIT_SCALE, OPACITY_OUT);
  }, [snap.open, scope, applyOrigin, opacity, scale, shiftX, shiftY]);

  // 每帧读取元素位置：滚动、视口尺寸、元素自身的位移与缩放都能跟上
  React.useEffect(() => {
    let last = [NaN, NaN, NaN, NaN, NaN, NaN];
    let missingFrames = 0;
    const update = () => {
      const id = activeIdRef.current;
      const element = scope.getRecord(id)?.getElement();
      if (!appearedRef.current) {
        if (!scope.snapshot.open) return;
        if (element) {
          tryAppear();
        } else if (++missingFrames === 30 && !warnedMissingElement) {
          warnedMissingElement = true;
          console.warn(
            "[MorphTooltip] 找不到触发元素的 DOM 节点：作为 children 的组件需要把 ref 转发到 DOM 元素上。",
          );
        }
        return;
      }
      if (!element) return;
      // 被禁用的按钮不再派发指针事件（收不到 pointerleave），在这里收起（每次显示只收一次）
      if (scope.snapshot.open && isDisabledElement(element)) {
        if (offscreenRef.current !== id) {
          offscreenRef.current = id;
          scope.dismiss();
        }
        return;
      }
      const rect = element.getBoundingClientRect();
      const root = document.documentElement;
      const next = [
        rect.left,
        rect.top,
        rect.width,
        rect.height,
        root.clientWidth,
        root.clientHeight,
      ];
      if (next.every((value, index) => value === last[index])) return;
      last = next;
      if (scope.snapshot.open && !isAnchorVisible(element, rect)) {
        if (offscreenRef.current !== id) {
          offscreenRef.current = id;
          scope.dismiss();
        }
        return;
      }
      relayout("follow", rect);
    };
    frame.read(update, true);
    return () => cancelFrame(update);
  }, [scope, relayout, tryAppear]);

  // Esc 与窗口失焦
  React.useEffect(() => {
    if (!snap.open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !scope.snapshot.open) return;
      const active = document.activeElement;
      const root = rootRef.current;
      const trigger = scope.getRecord(scope.snapshot.activeId)?.getElement() ?? null;
      const inBubble = Boolean(root && active && root.contains(active));
      const onTrigger = Boolean(trigger && active && trigger.contains(active));
      // 焦点在提示自己的元素（或可交互气泡）上：这次 Esc 只关闭提示，不让外层（如对话框）跟着关闭。
      // 焦点在别处（如正在输入的输入框）：照常传递，同时收起提示
      if (inBubble || onTrigger) event.stopPropagation();
      scope.dismiss(true);
      if (inBubble) trigger?.focus();
    };
    const onBlur = () => scope.dismiss();
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("blur", onBlur);
    };
  }, [snap.open, scope]);

  // 指针与焦点进出气泡、可交互气泡里的 Tab 导航。用原生事件：节点内容是从触发元素 Portal 进来的，
  // React 合成的 pointerenter / leave 按组件树计算，会把移到内容上误判为离开气泡。
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    scope.bubbleElement = root;
    const onPointerEnter = () => scope.enterBubble();
    const onPointerLeave = () => scope.leaveBubble();
    const onFocusIn = () => scope.enterBubbleFocus();
    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget as Node | null;
      if (next && root.contains(next)) return;
      scope.leaveBubbleFocus(next);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || event.defaultPrevented) return;
      const items = getTabbables(root, true);
      const trigger = scope.getRecord(scope.snapshot.activeId)?.getElement();
      if (!items.length || !trigger) return;
      const active = document.activeElement;
      if (event.shiftKey && active === items[0]) {
        event.preventDefault();
        trigger.focus();
      } else if (!event.shiftKey && active === items[items.length - 1]) {
        const next = getNextTabbable(trigger, root);
        if (next) {
          event.preventDefault();
          next.focus();
        }
      }
    };
    root.addEventListener("pointerenter", onPointerEnter);
    root.addEventListener("pointerleave", onPointerLeave);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    root.addEventListener("keydown", onKeyDown);
    return () => {
      root.removeEventListener("pointerenter", onPointerEnter);
      root.removeEventListener("pointerleave", onPointerLeave);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
      root.removeEventListener("keydown", onKeyDown);
      if (scope.bubbleElement === root) scope.bubbleElement = null;
    };
  }, [scope]);

  const hoverable = resolved.hoverable;
  const gap = resolved.sideOffset;
  const bridgeStyle: React.CSSProperties =
    side === "top"
      ? { left: 0, right: 0, top: "100%", height: gap }
      : side === "bottom"
        ? { left: 0, right: 0, bottom: "100%", height: gap }
        : side === "left"
          ? { top: 0, bottom: 0, left: "100%", width: gap }
          : { top: 0, bottom: 0, right: "100%", width: gap };

  return (
    <motion.div
      ref={rootRef}
      role="tooltip"
      id={scope.tooltipId}
      data-slot="morph-tooltip"
      data-side={side}
      data-state={snap.open ? "open" : "closed"}
      data-hoverable={hoverable ? "" : undefined}
      data-interactive={resolved.interactive ? "" : undefined}
      className="qy-morph-tooltip"
      style={{ x: baseX, y: baseY }}
    >
      <MorphTooltipStyles />
      <motion.div className="qy-morph-tooltip-offset" style={{ x: offsetX, y: offsetY }}>
        {hoverable ? (
          <span aria-hidden className="qy-morph-tooltip-bridge" style={bridgeStyle} />
        ) : null}
        <motion.div
          className="qy-morph-tooltip-scale"
          style={{ opacity, scale, x: shiftX, y: shiftY, transformOrigin: origin }}
        >
          <SmoothCorners asChild radius={SURFACE_RADIUS} smoothing={SURFACE_SMOOTHING}>
            <motion.div
              data-slot="morph-tooltip-surface"
              data-variant={resolved.variant}
              className={cn("qy-morph-tooltip-surface", resolved.className)}
              style={{ width, height }}
            >
              <div className="qy-morph-tooltip-clip">
                {layers.map((layer) => {
                  const view = layer.exiting ? layer.view : liveView;
                  const liveNode = !layer.exiting && !isTextContent(view.content);
                  return (
                    <TooltipLayer
                      key={layer.id}
                      layer={layer}
                      view={view}
                      host={liveNode ? (scope.getRecord(layer.ownerId)?.host ?? null) : null}
                      onMeasure={handleMeasure}
                      onExitComplete={handleExitComplete}
                      onAnnounce={onAnnounce}
                    />
                  );
                })}
              </div>
              <motion.div
                aria-hidden
                data-slot="morph-tooltip-arrow"
                data-hidden={resolved.arrow ? undefined : ""}
                className="qy-morph-tooltip-arrow"
                style={{ x: arrowX, y: arrowY, rotate: arrowRotate, opacity: arrowOpacity }}
              >
                <svg viewBox={`0 0 ${ARROW_WIDTH} ${ARROW_BOX_HEIGHT}`} focusable="false">
                  <path d={ARROW_STROKE_PATH} />
                </svg>
              </motion.div>
            </motion.div>
          </SmoothCorners>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

interface MorphTooltipBubbleHostProps {
  scope: MorphTooltipScope;
  options: ScopeOptions;
  container: HTMLElement | null | undefined;
}

/** 气泡只在显示与退场期间挂载；退场结束后卸载，下一次全新出现 */
function MorphTooltipBubbleHost({ scope, options, container }: MorphTooltipBubbleHostProps) {
  const snap = React.useSyncExternalStore(scope.subscribe, scope.getSnapshot, scope.getSnapshot);
  const [present, setPresent] = React.useState(false);
  if (snap.open && !present) setPresent(true);
  const liveRef = React.useRef<HTMLSpanElement>(null);

  React.useLayoutEffect(() => {
    if (present) scope.bubblePresent = true;
  }, [present, scope]);

  const handleExited = React.useCallback(() => {
    if (scope.snapshot.open) return;
    scope.markExited();
    setPresent(false);
  }, [scope]);

  // 礼貌的实时区域放在 role="tooltip" 之外，不会混进元素的描述里
  const handleAnnounce = React.useCallback((text: string) => {
    const region = liveRef.current;
    if (!region) return;
    region.textContent = "";
    setTimeout(() => {
      if (region.isConnected) region.textContent = text;
    }, 60);
  }, []);

  if (!present || typeof document === "undefined") return null;
  return createPortal(
    <>
      <MorphTooltipBubble
        scope={scope}
        snap={snap}
        options={options}
        onExited={handleExited}
        onAnnounce={handleAnnounce}
      />
      <span
        ref={liveRef}
        data-slot="morph-tooltip-announcer"
        aria-live="polite"
        aria-atomic="true"
        style={SR_ONLY_STYLE}
      />
    </>,
    container ?? document.body,
  );
}

/* ------------------------------------------------------------------ */
/* MorphTooltipProvider                                                 */
/* ------------------------------------------------------------------ */

/**
 * MorphTooltipProvider — 提示气泡的共享范围
 *
 * 范围内的所有 MorphTooltip 共享**一个**气泡：
 * - 只有第一次悬停需要等待 `delay`，之后在范围内移动立即显示
 * - 从一个元素移到另一个元素时，气泡作为共享元素滑过去并连续变形尺寸，内容按方向交叉淡入；
 *   连续快速扫过时文字直接替换，只有气泡在滑动
 * - 气泡消失后 `skipDelayDuration` 内再次悬停也立即显示
 * - 为范围内的提示提供方向、对齐、配色、箭头、最大宽度、碰撞、可悬停、触屏等默认值
 * - 可嵌套：内层 Provider 开启新的独立范围；在应用外层包一层即全站一个气泡
 *
 * @example
 * ```tsx
 * <MorphTooltipProvider>
 *   <MorphTooltip content="加粗" shortcut={["⌘", "B"]}>
 *     <Button size="icon" variant="ghost" aria-label="加粗"><BoldIcon /></Button>
 *   </MorphTooltip>
 *   <MorphTooltip content="斜体" shortcut={["⌘", "I"]}>
 *     <Button size="icon" variant="ghost" aria-label="斜体"><ItalicIcon /></Button>
 *   </MorphTooltip>
 * </MorphTooltipProvider>
 * ```
 *
 * @example
 * ```tsx
 * // 元素密集的网格：气泡会盖住别的格子，关闭 hoverable 让它对指针透明
 * <MorphTooltipProvider delay={200} arrow hoverable={false}>
 *   {days.map((day) => (
 *     <MorphTooltip key={day.key} content={day.label}><span className="size-3 rounded-sm" /></MorphTooltip>
 *   ))}
 * </MorphTooltipProvider>
 * ```
 */
export function MorphTooltipProvider({
  children,
  container,
  delay,
  skipDelayDuration,
  closeDelay,
  morph,
  side,
  align,
  sideOffset,
  alignOffset,
  avoidCollisions,
  collisionPadding,
  collisionBoundary,
  variant,
  arrow,
  maxWidth,
  hoverable,
  interactive,
  closeOnClick,
  touch,
  disabled,
}: MorphTooltipProviderProps) {
  const tooltipId = React.useId();
  const options = React.useMemo(
    () =>
      resolveScopeOptions({
        delay,
        skipDelayDuration,
        closeDelay,
        morph,
        side,
        align,
        sideOffset,
        alignOffset,
        avoidCollisions,
        collisionPadding,
        collisionBoundary,
        variant,
        arrow,
        maxWidth,
        hoverable,
        interactive,
        closeOnClick,
        touch,
        disabled,
      }),
    [
      delay,
      skipDelayDuration,
      closeDelay,
      morph,
      side,
      align,
      sideOffset,
      alignOffset,
      avoidCollisions,
      collisionPadding,
      collisionBoundary,
      variant,
      arrow,
      maxWidth,
      hoverable,
      interactive,
      closeOnClick,
      touch,
      disabled,
    ],
  );
  const [scope] = React.useState(
    () => new MorphTooltipScope(options, `morph-tooltip-${tooltipId.replace(/[^\w-]/g, "")}`),
  );

  React.useLayoutEffect(() => {
    scope.setOptions(options);
  }, [scope, options]);

  React.useEffect(() => () => scope.dispose(), [scope]);

  return (
    <>
      <MorphTooltipOptionsContext.Provider value={options}>
        <MorphTooltipScopeContext.Provider value={scope}>{children}</MorphTooltipScopeContext.Provider>
      </MorphTooltipOptionsContext.Provider>
      <MorphTooltipBubbleHost scope={scope} options={options} container={container} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* MorphTooltip                                                         */
/* ------------------------------------------------------------------ */

interface TouchSession {
  pointerId: number;
  x: number;
  y: number;
  timer: Timer | undefined;
  fired: boolean;
  restoreSelection: () => void;
}

type TriggerProps = React.HTMLAttributes<HTMLElement> & {
  ref: React.Ref<HTMLElement>;
  [key: `data-${string}`]: string | undefined;
};

interface MorphTooltipTriggerProps extends MorphTooltipProps {
  scope: MorphTooltipScope;
  forwardedRef: React.Ref<HTMLElement>;
}

/**
 * 节点内容：从触发元素的位置 Portal 到气泡里，保留触发元素处的 Context。
 * 卸载（换到别的元素、内容换了一条、关闭）时把当前 DOM 复制一份留在原来的内容层，供退场动画使用。
 */
function MorphTooltipLiveContent({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const snapshotRef = React.useRef<HTMLElement | null>(null);

  React.useLayoutEffect(() => {
    const element = ref.current;
    const host = element?.parentElement ?? null;
    // 开发模式 StrictMode 会模拟一次卸载再挂载：去掉那次留下的快照
    snapshotRef.current?.remove();
    snapshotRef.current = null;
    return () => {
      const body = host?.parentElement;
      if (!element || !body) return;
      const snapshot = element.cloneNode(true) as HTMLElement;
      snapshot.className = "qy-morph-tooltip-snapshot";
      snapshot.style.display = "contents";
      snapshot.setAttribute("aria-hidden", "true");
      snapshot.setAttribute("inert", "");
      body.appendChild(snapshot);
      snapshotRef.current = snapshot;
    };
  }, []);

  return (
    // 内容里的 MorphTooltip 不加入外层范围（否则悬停它会把气泡切走）
    <MorphTooltipScopeContext.Provider value={null}>
      <div ref={ref} className="qy-morph-tooltip-live" style={{ display: "contents" }}>
        {children}
      </div>
    </MorphTooltipScopeContext.Provider>
  );
}

function MorphTooltipTrigger(props: MorphTooltipTriggerProps) {
  const { scope, forwardedRef, children, open, defaultOpen, touch, content, disabled } = props;
  const defaults = React.useContext(MorphTooltipOptionsContext);
  const id = React.useId();
  const elementRef = React.useRef<HTMLElement | null>(null);
  const [record] = React.useState<TriggerRecord>(() => ({
    id,
    getElement: () => elementRef.current,
    props,
    host: createContentHost(),
  }));
  const touchRef = React.useRef<TouchSession | null>(null);
  const pointerDownAtRef = React.useRef(-Infinity);
  const suppressClickUntilRef = React.useRef(-Infinity);

  React.useLayoutEffect(() => {
    scope.register(record);
    return () => scope.unregister(record.id);
  }, [scope, record]);

  // 每次渲染后同步最新属性；当前显示的就是它时，气泡跟着更新（内容变化时原地形变）
  React.useLayoutEffect(() => {
    record.props = props;
    scope.recordUpdated(record.id);
  });

  // 受控：open 变化时切换；open 保持 true 但内容 / 禁用状态恢复可显示时也重新显示
  const showable = hasContent(content) && !disabled;
  React.useLayoutEffect(() => {
    if (open === undefined) return;
    if (open && !showable) return;
    scope.commit(record.id, open, true);
  }, [open, showable, scope, record]);

  // defaultOpen 只在挂载时生效（依赖不变，开发模式 StrictMode 重挂时再执行一次，结果相同）
  const [initialOpen] = React.useState(() => Boolean(defaultOpen) && open === undefined);
  React.useLayoutEffect(() => {
    if (initialOpen) scope.request(record.id, true);
  }, [scope, record, initialOpen]);

  const isOpen = React.useSyncExternalStore(
    scope.subscribe,
    () => scope.isOpenFor(record.id),
    () => false,
  );

  React.useEffect(
    () => () => {
      const session = touchRef.current;
      if (session?.timer !== undefined) clearTimeout(session.timer);
    },
    [],
  );

  // 转发 ref；React 19 的回调 ref 可以返回清理函数，这里保留它
  const composedRef = React.useCallback(
    (node: HTMLElement | null) => {
      elementRef.current = node;
      let cleanup: unknown;
      if (typeof forwardedRef === "function") cleanup = forwardedRef(node);
      else assignRef(forwardedRef, node);
      return () => {
        elementRef.current = null;
        if (typeof cleanup === "function") (cleanup as () => void)();
        else assignRef(forwardedRef, null);
      };
    },
    [forwardedRef],
  );

  const touchEnabled = touch ?? defaults.touch;

  // 结束一次触屏按压：没到长按时间（或滚动取消）时什么都不做
  const endTouch = () => {
    const session = touchRef.current;
    if (!session) return;
    if (session.timer !== undefined) clearTimeout(session.timer);
    session.restoreSelection();
    touchRef.current = null;
    if (session.fired) {
      // 长按已经显示：抬起后稍等再隐藏，并吞掉随后的 click
      suppressClickUntilRef.current = now() + 600;
      scope.touchRelease(record.id);
    }
  };

  const triggerProps: TriggerProps = {
    ref: composedRef,
    onPointerEnter: (event) => {
      if (event.pointerType === "touch") return;
      scope.enter(record.id);
    },
    onPointerLeave: (event) => {
      if (event.pointerType === "touch") return;
      scope.leave(record.id);
    },
    onPointerDown: (event) => {
      pointerDownAtRef.current = now();
      if (event.pointerType !== "touch") {
        scope.press(record.id);
        return;
      }
      if (!touchEnabled || !event.isPrimary) return;
      endTouch();
      const session: TouchSession = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        timer: undefined,
        fired: false,
        // 按住期间不能选中文字：iOS / Android 长按文字会弹出选择手柄与放大镜
        restoreSelection: lockTextSelection(event.currentTarget),
      };
      session.timer = setTimeout(() => {
        session.timer = undefined;
        session.fired = true;
        scope.touchShow(record.id);
      }, LONG_PRESS_MS);
      touchRef.current = session;
    },
    onPointerMove: (event) => {
      const session = touchRef.current;
      if (!session || session.fired || event.pointerId !== session.pointerId) return;
      if (Math.hypot(event.clientX - session.x, event.clientY - session.y) > LONG_PRESS_SLOP) {
        endTouch();
      }
    },
    onPointerUp: (event) => {
      if (touchRef.current?.pointerId === event.pointerId) endTouch();
    },
    onPointerCancel: (event) => {
      if (touchRef.current?.pointerId === event.pointerId) endTouch();
    },
    onContextMenu: (event) => {
      const session = touchRef.current;
      if (!session) return;
      // 与 Android 的长按提示一致：长按只显示提示，不弹出系统菜单
      event.preventDefault();
      if (!session.fired) {
        if (session.timer !== undefined) clearTimeout(session.timer);
        session.timer = undefined;
        session.fired = true;
        scope.touchShow(record.id);
      }
    },
    onClickCapture: (event) => {
      if (now() < suppressClickUntilRef.current) {
        suppressClickUntilRef.current = -Infinity;
        event.preventDefault();
        event.stopPropagation();
      }
    },
    onKeyDown: (event) => {
      // 可交互气泡：元素聚焦时 Tab 进入气泡里的第一个可聚焦元素
      if (event.key !== "Tab" || event.shiftKey || event.defaultPrevented) return;
      if (!scope.isOpenFor(record.id)) return;
      if (!(record.props.interactive ?? defaults.interactive)) return;
      const bubble = scope.bubbleElement;
      const first = bubble ? getTabbables(bubble, true)[0] : undefined;
      if (!first) return;
      event.preventDefault();
      first.focus();
    },
    onFocus: (event) => {
      // 指针按下引起的聚焦不显示，只响应键盘聚焦（:focus-visible）
      if (now() - pointerDownAtRef.current < 500) return;
      if (!matchesFocusVisible(event.currentTarget)) return;
      scope.focus(record.id);
    },
    onBlur: () => {
      scope.blur(record.id);
    },
  };

  if (isOpen) {
    triggerProps["aria-describedby"] = scope.tooltipId;
    triggerProps["data-tooltip-state"] = "open";
  }
  if (touchEnabled) {
    triggerProps.style = { WebkitTouchCallout: "none" };
  }

  let child: React.ReactElement = React.isValidElement(children) ? (
    children
  ) : (
    <span>{children}</span>
  );
  if (isOpen) {
    // 子元素自带 aria-describedby 时合并，而不是被覆盖
    const own = (child.props as { "aria-describedby"?: string })["aria-describedby"];
    if (own) {
      child = React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
        "aria-describedby": `${own} ${scope.tooltipId}`,
      });
    }
  }

  // 节点内容在这里（触发元素的位置）渲染，再 Portal 进气泡；字符串内容由气泡直接渲染
  const nodeContent = hasContent(content) && !isTextContent(content);
  const portal =
    isOpen && nodeContent && record.host
      ? createPortal(
          <MorphTooltipLiveContent key={contentIdentity(props)}>{content}</MorphTooltipLiveContent>,
          record.host,
        )
      : null;

  return (
    <>
      <Slot.Root {...triggerProps}>{child}</Slot.Root>
      {portal}
    </>
  );
}

/**
 * MorphTooltip — 形变提示气泡
 *
 * 现代化的通用 tooltip：
 * - 默认高级黑、平滑圆角（超椭圆）、极细内高光描边与柔和投影；另有 light / inverse 配色
 * - 同一个 MorphTooltipProvider 内共享一个气泡：第一次悬停等待 `delay`，之后移到其他元素立即显示，
 *   气泡滑到新目标并连续变形尺寸，内容沿移动方向交叉淡入；退场途中再进入会从当前状态反向回来
 * - 方向与对齐、碰撞翻转与平移、跟随滚动、元素移出视口时隐藏；可选箭头始终指向元素中心
 * - 最大宽度与自动换行（收窄到最长一行）、快捷键键帽、富内容（保留触发元素处的 Context）、可交互内容、受控与禁用
 * - 指针可以移进气泡（WCAG 1.4.13）；内容变化时原地形变（如「复制」→「已复制」）并播报给读屏软件
 * - 键盘聚焦显示、Esc 关闭、触屏长按显示
 * - 没有 Provider 时自成一个范围；系统开启减少动态效果时只保留淡入淡出
 *
 * ref 转发到触发元素（children）上。
 *
 * @example
 * ```tsx
 * <MorphTooltip content="复制链接" shortcut="⌘C">
 *   <Button size="icon" variant="ghost" aria-label="复制链接"><LinkIcon /></Button>
 * </MorphTooltip>
 * ```
 *
 * @example
 * ```tsx
 * // 内容变化时原地形变：按下不隐藏，文字从「复制」变为「已复制」
 * <MorphTooltip content={copied ? "已复制" : "复制"} closeOnClick={false}>
 *   <Button onClick={copy}>复制</Button>
 * </MorphTooltip>
 * ```
 */
export const MorphTooltip = React.forwardRef<HTMLElement, MorphTooltipProps>(
  (props, forwardedRef) => {
    const scope = React.useContext(MorphTooltipScopeContext);
    if (!scope) {
      // 没有 Provider：自成一个范围（独立气泡，同样有动画，只是不会跨元素滑动）
      return (
        <MorphTooltipProvider>
          <MorphTooltip {...props} ref={forwardedRef} />
        </MorphTooltipProvider>
      );
    }
    return <MorphTooltipTrigger {...props} scope={scope} forwardedRef={forwardedRef} />;
  },
);

MorphTooltip.displayName = "MorphTooltip";
