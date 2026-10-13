"use client";

import React, { Component } from "react";
import type { ReactNode } from "react";
import { DEFAULT_MARKDOWN_WIDGET_LABELS } from "../markdown-labels";

// 仅为本模块声明 process 的类型：Next.js / Vite / webpack 会在构建时静态替换
// process.env.NODE_ENV。模块级声明让未安装 @types/node 的项目（如 Vite）也能通过类型检查，
// 且不会与 @types/node 的全局声明冲突。
declare const process: { env: { NODE_ENV?: string } };

function isDevelopment() {
  try {
    return process.env.NODE_ENV === "development";
  } catch {
    // 未经打包器替换、运行时也没有 process 时（如浏览器直接运行 ESM）视为非开发环境
    return false;
  }
}

interface WidgetErrorBoundaryProps {
  widgetId: string;
  widgetType: string;
  children: ReactNode;
  fallback?: ReactNode;
  /** 渲染失败时的提示文案 */
  errorLabel?: string;
}

interface WidgetErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class WidgetErrorBoundary extends Component<
  WidgetErrorBoundaryProps,
  WidgetErrorBoundaryState
> {
  constructor(props: WidgetErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): WidgetErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (isDevelopment()) {
      console.error(
        `[Widget Error] ${this.props.widgetType}#${this.props.widgetId}:`,
        error,
        errorInfo,
      );
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="my-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium text-destructive">
            {this.props.errorLabel ??
              DEFAULT_MARKDOWN_WIDGET_LABELS.renderError}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {this.props.widgetType}
            {isDevelopment() &&
              this.state.error &&
              ` — ${this.state.error.message}`}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
