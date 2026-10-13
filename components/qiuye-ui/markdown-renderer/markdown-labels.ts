"use client";

import { createContext, useContext } from "react";
import type {
  CodeBlockLabels,
  CodeBlockPanelLabels,
} from "@/components/qiuye-ui/code-block";
import type { ImageViewerLabels } from "@/components/qiuye-ui/image-viewer";

// ============================================
// MermaidBlock 文案
// ============================================

/** MermaidBlock 的界面文案 */
export interface MermaidBlockLabels {
  /** 客户端挂载前的占位 */
  loading: string;
  /** 图表渲染中的占位 */
  rendering: string;
  /** Mermaid 语法校验失败 */
  invalidSyntax: string;
  /** 渲染失败且没有具体错误信息时的提示 */
  renderFailed: string;
  /** 「代码」切换按钮文字 */
  codeTab: string;
  /** 「代码」切换按钮的提示 */
  codeTabTitle: string;
  /** 「预览」切换按钮文字 */
  previewTab: string;
  /** 「预览」切换按钮的提示 */
  previewTabTitle: string;
  /** 进入全屏按钮的提示 */
  enterFullscreen: string;
  /** 全屏工具栏标题 */
  fullscreenTitle: string;
  /** 全屏对话框的无障碍标签 */
  fullscreenDialog: string;
  /** 缩小按钮的提示 */
  zoomOut: string;
  /** 放大按钮的提示 */
  zoomIn: string;
  /** 重置视图按钮的提示 */
  resetView: string;
  /** 工具栏退出按钮的提示 */
  exitFullscreenTitle: string;
  /** 触屏设备底部退出按钮文字 */
  exitFullscreen: string;
  /** 桌面端操作提示：滚轮缩放 */
  hintWheelZoom: string;
  /** 桌面端操作提示：拖拽移动 */
  hintDragPan: string;
  /** 桌面端操作提示：ESC 退出 */
  hintEscExit: string;
}

/** MermaidBlock 默认界面文案 */
export const DEFAULT_MERMAID_BLOCK_LABELS: MermaidBlockLabels = {
  loading: "加载中...",
  rendering: "渲染中...",
  invalidSyntax: "Mermaid 语法验证失败",
  renderFailed: "Mermaid 渲染失败",
  codeTab: "代码",
  codeTabTitle: "查看源码",
  previewTab: "预览",
  previewTabTitle: "查看预览",
  enterFullscreen: "全屏查看",
  fullscreenTitle: "Mermaid 图表预览",
  fullscreenDialog: "Mermaid 图表全屏预览",
  zoomOut: "缩小",
  zoomIn: "放大",
  resetView: "重置视图",
  exitFullscreenTitle: "退出预览 (ESC)",
  exitFullscreen: "退出预览",
  hintWheelZoom: "滚轮缩放",
  hintDragPan: "拖拽移动",
  hintEscExit: "ESC 退出",
};

// ============================================
// Widget 文案
// ============================================

/** 内置 Widget 与 Widget 降级展示的界面文案 */
export interface MarkdownWidgetLabels {
  /** 未注册或解析失败的 Widget 标题前缀 */
  unknownWidget: string;
  /** Widget 代码块 JSON 解析失败的原因 */
  invalidJson: string;
  /** Widget 渲染抛错时的提示 */
  renderError: string;
  /** tool-call：等待中 */
  toolCallStatusPending: string;
  /** tool-call：执行中 */
  toolCallStatusRunning: string;
  /** tool-call：完成 */
  toolCallStatusSuccess: string;
  /** tool-call：失败 */
  toolCallStatusError: string;
  /** tool-call：输入前缀（含标点） */
  toolCallInput: string;
  /** tool-call：输出前缀（含标点） */
  toolCallOutput: string;
  /** tool-call：错误前缀（含标点） */
  toolCallError: string;
  /** artifact：下载按钮 */
  artifactDownload: string;
  /** artifact：打开按钮 */
  artifactOpen: string;
}

/** Widget 默认界面文案 */
export const DEFAULT_MARKDOWN_WIDGET_LABELS: MarkdownWidgetLabels = {
  unknownWidget: "未知组件",
  invalidJson: "JSON 解析失败",
  renderError: "Widget 渲染失败",
  toolCallStatusPending: "等待中",
  toolCallStatusRunning: "执行中",
  toolCallStatusSuccess: "完成",
  toolCallStatusError: "失败",
  toolCallInput: "输入: ",
  toolCallOutput: "输出: ",
  toolCallError: "错误: ",
  artifactDownload: "下载",
  artifactOpen: "打开",
};

// ============================================
// MarkdownRenderer 文案汇总
// ============================================

/** MarkdownRenderer 内部各模块的界面文案（已合并默认值） */
export interface MarkdownRendererLabels {
  /** Mermaid 图表 */
  mermaid: MermaidBlockLabels;
  /** 内置 Widget 与降级展示 */
  widgets: MarkdownWidgetLabels;
  /** 透传给 CodeBlock，未传入的字段使用 CodeBlock 自身默认值 */
  codeBlock: Partial<CodeBlockLabels>;
  /** 透传给 CodeBlockPanel，未传入的字段使用 CodeBlockPanel 自身默认值 */
  codeBlockPanel: Partial<CodeBlockPanelLabels>;
  /** 透传给 ImageViewer，未传入的字段使用 ImageViewer 自身默认值 */
  imageViewer: Partial<ImageViewerLabels>;
}

/** `labels` 属性的输入形式：每个分组都可以只传部分字段 */
export type MarkdownRendererLabelsInput = {
  [K in keyof MarkdownRendererLabels]?: Partial<MarkdownRendererLabels[K]>;
};

/** MarkdownRenderer 默认界面文案 */
export const DEFAULT_MARKDOWN_RENDERER_LABELS: MarkdownRendererLabels = {
  mermaid: DEFAULT_MERMAID_BLOCK_LABELS,
  widgets: DEFAULT_MARKDOWN_WIDGET_LABELS,
  codeBlock: {},
  codeBlockPanel: {},
  imageViewer: {},
};

/** 将部分文案与默认文案按分组合并 */
export function resolveMarkdownRendererLabels(
  input?: MarkdownRendererLabelsInput,
): MarkdownRendererLabels {
  if (!input) return DEFAULT_MARKDOWN_RENDERER_LABELS;
  return {
    mermaid: { ...DEFAULT_MERMAID_BLOCK_LABELS, ...input.mermaid },
    widgets: { ...DEFAULT_MARKDOWN_WIDGET_LABELS, ...input.widgets },
    codeBlock: { ...input.codeBlock },
    codeBlockPanel: { ...input.codeBlockPanel },
    imageViewer: { ...input.imageViewer },
  };
}

/**
 * 供 Widget 读取文案的 Context。
 * Widget 组件的 props 签名是对外协议，文案通过 Context 下发而不是额外 props。
 */
export const MarkdownLabelsContext = createContext<MarkdownRendererLabels>(
  DEFAULT_MARKDOWN_RENDERER_LABELS,
);

/** 读取当前 MarkdownRenderer 的界面文案 */
export function useMarkdownLabels(): MarkdownRendererLabels {
  return useContext(MarkdownLabelsContext);
}
