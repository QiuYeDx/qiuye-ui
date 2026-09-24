"use client";

import { useState, useSyncExternalStore, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ArrowLeft, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CodeBlock as CodeBlockDisplay,
  CodeBlockPanel,
} from "@/components/qiuye-ui/code-block";
import {
  ResponsiveTabs,
  type TabItem,
} from "@/components/qiuye-ui/responsive-tabs";
import {
  SegmentedControl,
  type SegmentedControlItem,
} from "@/components/qiuye-ui/segmented-control";
import { useClipboard } from "use-clipboard-copy";
import { toast } from "sonner";

// ============ 包管理器 localStorage Hook ============
type PackageManager = "npm" | "pnpm";

const STORAGE_KEY = "qiuye-ui-package-manager";
const DEFAULT_PM: PackageManager = "pnpm";

// 用于跨组件同步的订阅机制
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): PackageManager {
  if (typeof window === "undefined") return DEFAULT_PM;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "npm" || stored === "pnpm" ? stored : DEFAULT_PM;
}

function getServerSnapshot(): PackageManager {
  return DEFAULT_PM;
}

function usePackageManager() {
  const packageManager = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setPackageManager = useCallback((pm: PackageManager) => {
    localStorage.setItem(STORAGE_KEY, pm);
    notifyListeners();
  }, []);

  return { packageManager, setPackageManager };
}

const pmItems: SegmentedControlItem[] = [
  { value: "npm", label: "npm" },
  { value: "pnpm", label: "pnpm" },
];

// 包管理器选择器组件
function PackageManagerSelector() {
  const { packageManager, setPackageManager } = usePackageManager();

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="text-sm text-muted-foreground shrink-0">包管理器:</span>
      <SegmentedControl
        aria-label="包管理器"
        value={packageManager}
        onValueChange={(value) => setPackageManager(value as PackageManager)}
        items={pmItems}
        size="sm"
        className="min-w-0 flex-1"
      />
    </div>
  );
}

// ============ 通用组件 ============

// 返回按钮组件
export function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.back()}
      className="flex items-center gap-2 cursor-pointer -translate-x-3"
    >
      <ArrowLeft className="h-4 w-4" />
      返回
    </Button>
  );
}

// CLI 命令复制按钮组件
interface CopyCommandButtonProps {
  cliName: string;
}

export function CopyCommandButton({ cliName }: CopyCommandButtonProps) {
  const { packageManager } = usePackageManager();

  const generateCommand = () => {
    const prefix = packageManager === "npm" ? "npx" : "pnpm dlx";
    return `${prefix} shadcn@latest add @qiuye-ui/${cliName}`;
  };

  return (
    <div className="space-y-3">
      <PackageManagerSelector />
      <SidebarCodeBlock code={generateCommand()} language="shell" />
    </div>
  );
}

const subscribeHydration = () => () => {};
const getClientHydration = () => true;
const getServerHydration = () => false;

interface SidebarCodeBlockProps {
  code: string;
  language?: string;
}

// 侧栏统一代码展示：由 CodeBlockPanel 提供复制交互，代码区域只负责滚动。
export function SidebarCodeBlock({
  code,
  language = "tsx",
}: SidebarCodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    getClientHydration,
    getServerHydration,
  );
  const isDark = hydrated && resolvedTheme === "dark";

  return (
    <CodeBlockPanel
      code={code}
      language={language}
      isDark={isDark}
      className="min-w-0 rounded-lg"
    >
      <CodeBlockDisplay
        language={language}
        isDark={isDark}
        showLineNumbers={false}
      >
        {code}
      </CodeBlockDisplay>
    </CodeBlockPanel>
  );
}

// 依赖复制按钮组件（使用全局 packageManager）
interface CopyDependencyButtonProps {
  dependency: string;
}

function CopyDependencyButton({ dependency }: CopyDependencyButtonProps) {
  const clipboard = useClipboard();
  const { packageManager } = usePackageManager();

  const handleCopyDependency = () => {
    const command = `${packageManager} ${packageManager === "npm" ? "install" : "add"} ${dependency}`;
    clipboard.copy(command);
    toast.success("复制成功！", {
      description: `已复制安装命令: ${command}`,
    });
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleCopyDependency}>
      <Copy className="h-4 w-4" />
    </Button>
  );
}

// 批量复制依赖按钮组件（使用全局 packageManager）
interface CopyAllDependenciesButtonProps {
  dependencies: string[];
}

function CopyAllDependenciesButton({
  dependencies,
}: CopyAllDependenciesButtonProps) {
  const clipboard = useClipboard();
  const { packageManager } = usePackageManager();

  const handleCopyAllDependencies = () => {
    const installCmd = packageManager === "npm" ? "install" : "add";
    const command = `${packageManager} ${installCmd} ${dependencies.join(" ")}`;
    clipboard.copy(command);
    toast.success("复制成功！", {
      description: "已复制批量安装命令",
    });
  };

  return (
    <Button variant="outline" onClick={handleCopyAllDependencies}>
      <Copy className="h-4 w-4" />
      复制安装命令
    </Button>
  );
}

// 依赖项区块组件（使用全局 packageManager，不再显示选择器）
interface DependenciesSectionProps {
  dependencies: string[];
}

// 组件详情页标签区域（受控 ResponsiveTabs 包装器，供 server component 使用）
interface ComponentDetailTabsProps {
  items: TabItem[];
  children: React.ReactNode;
  defaultValue?: string;
  layout?: "responsive" | "scroll" | "grid";
  gridColsClass?: string;
  listClassName?: string;
  className?: string;
}

export function ComponentDetailTabs({
  items,
  children,
  defaultValue,
  layout = "grid",
  gridColsClass,
  listClassName,
  className,
}: ComponentDetailTabsProps) {
  const [tab, setTab] = useState(defaultValue ?? items[0]?.value ?? "");

  return (
    <ResponsiveTabs
      value={tab}
      onValueChange={setTab}
      items={items}
      layout={layout}
      gridColsClass={gridColsClass}
      listClassName={listClassName}
      className={className}
    >
      {children}
    </ResponsiveTabs>
  );
}

export function DependenciesSection({
  dependencies,
}: DependenciesSectionProps) {
  const { packageManager } = usePackageManager();

  const generateInstallCommand = () => {
    const installCmd = packageManager === "npm" ? "install" : "add";
    return `${packageManager} ${installCmd} ${dependencies.join(" ")}`;
  };

  if (dependencies.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        该组件无额外依赖
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 依赖列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dependencies.map((dep) => (
          <div
            key={dep}
            className="flex min-w-0 items-center justify-between gap-2 rounded-md bg-muted/50 p-3"
          >
            <code className="min-w-0 truncate font-mono text-sm">{dep}</code>
            <CopyDependencyButton dependency={dep} />
          </div>
        ))}
      </div>

      <div className="h-px bg-border" />

      {/* 一键安装所有依赖 */}
      <div>
        <h4 className="font-semibold mb-2">一键安装所有依赖</h4>
        <div className="bg-muted/50 rounded-md p-3 mb-3">
          <code className="text-sm font-mono">{generateInstallCommand()}</code>
        </div>
        <CopyAllDependenciesButton dependencies={dependencies} />
      </div>
    </div>
  );
}

// ============ 基本用法代码块（深浅模式自适应） ============

interface BasicUsageBlockProps {
  componentName: string;
  cliName: string;
  importCode: string;
  usageCode: string;
}

export function BasicUsageBlock({
  componentName,
  importCode,
  usageCode,
}: BasicUsageBlockProps) {
  const { resolvedTheme } = useTheme();
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    getClientHydration,
    getServerHydration,
  );
  const isDark = hydrated && resolvedTheme === "dark";

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">基本用法</h2>
        <p className="text-sm text-muted-foreground">
          使用 {componentName} 组件的基础示例
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">
            导入组件
          </h3>
          <CodeBlockDisplay
            language="tsx"
            isDark={isDark}
            className="[&_pre]:my-0!"
          >
            {importCode}
          </CodeBlockDisplay>
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">
            使用组件
          </h3>
          <CodeBlockDisplay
            language="tsx"
            isDark={isDark}
            className="[&_pre]:my-0!"
          >
            {usageCode}
          </CodeBlockDisplay>
        </div>
      </div>
    </section>
  );
}
