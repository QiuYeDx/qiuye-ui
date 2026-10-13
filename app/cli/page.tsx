"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  GithubIcon,
  LifeBuoyIcon,
  PackageCheckIcon,
  PaletteIcon,
  RocketIcon,
  Settings2Icon,
  SparklesIcon,
  WandSparklesIcon,
  type LucideIcon,
} from "lucide-react";
import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "motion/react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useClipboard } from "use-clipboard-copy";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CodeBlock as CodeBlockDisplay,
  CodeBlockPanel,
} from "@/components/qiuye-ui/code-block";
import { DualStateToggle } from "@/components/qiuye-ui/dual-state-toggle";
import { SegmentedControl } from "@/components/qiuye-ui/segmented-control";
import { SmoothCorners } from "@/components/qiuye-ui/smooth-corners";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAllComponents, type ComponentInfo } from "@/lib/registry";
import { cn } from "@/lib/utils";

type PackageManager = "npm" | "pnpm";

const ENTRANCE_EASE = [0.22, 1, 0.36, 1] as const;
const REVEAL_VIEWPORT = {
  once: true,
  amount: 0.08,
  margin: "0px 0px -56px 0px",
} as const;
const TRAILING_ICON_BUTTON_CLASS =
  "gap-1.5 pl-4 pr-3 has-[>svg]:pl-4 has-[>svg]:pr-3";
const LEADING_ICON_BUTTON_CLASS =
  "gap-1.5 pl-3 pr-4 has-[>svg]:pl-3 has-[>svg]:pr-4";

const heroCopyVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.06,
      staggerChildren: 0.06,
    },
  },
} satisfies Variants;

const heroItemVariants = {
  hidden: {
    opacity: 0,
    transform: "translate3d(0, 10px, 0)",
  },
  visible: {
    opacity: 1,
    transform: "translate3d(0, 0, 0)",
    transition: {
      duration: 0.42,
      ease: ENTRANCE_EASE,
    },
  },
} satisfies Variants;

const heroTitleVariants = {
  hidden: {
    opacity: 0,
    transform: "translate3d(0, 14px, 0)",
  },
  visible: {
    opacity: 1,
    transform: "translate3d(0, 0, 0)",
    transition: {
      duration: 0.5,
      ease: ENTRANCE_EASE,
    },
  },
} satisfies Variants;

const heroPanelVariants = {
  hidden: {
    opacity: 0,
    transform: "translate3d(14px, 8px, 0) scale(0.985)",
  },
  visible: {
    opacity: 1,
    transform: "translate3d(0, 0, 0) scale(1)",
    transition: {
      delay: 0.16,
      duration: 0.52,
      ease: ENTRANCE_EASE,
    },
  },
} satisfies Variants;

const sectionFlowVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.02,
      staggerChildren: 0.1,
    },
  },
} satisfies Variants;

const sectionColumnsVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.02,
      staggerChildren: 0.08,
    },
  },
} satisfies Variants;

const sectionHeaderVariants = {
  hidden: {
    opacity: 0,
    transform: "translate3d(0, 12px, 0)",
  },
  visible: {
    opacity: 1,
    transform: "translate3d(0, 0, 0)",
    transition: {
      duration: 0.4,
      ease: ENTRANCE_EASE,
    },
  },
} satisfies Variants;

const cardGridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
} satisfies Variants;

const componentGridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.045,
    },
  },
} satisfies Variants;

const sideColumnVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
} satisfies Variants;

const cardVariants = {
  hidden: {
    opacity: 0,
    transform: "translate3d(0, 14px, 0) scale(0.99)",
  },
  visible: {
    opacity: 1,
    transform: "translate3d(0, 0, 0) scale(1)",
    transition: {
      duration: 0.42,
      ease: ENTRANCE_EASE,
    },
  },
} satisfies Variants;

const footerActionsVariants = {
  hidden: {
    opacity: 0,
    transform: "translate3d(10px, 0, 0)",
  },
  visible: {
    opacity: 1,
    transform: "translate3d(0, 0, 0)",
    transition: {
      duration: 0.4,
      ease: ENTRANCE_EASE,
    },
  },
} satisfies Variants;

const registryConfig = `{
  "registries": {
    "@qiuye-ui": "https://ui.qiuyedx.com/registry/{name}.json"
  }
}`;

const usageExample = `import { useState } from "react";
import { ResponsiveTabs } from "@/components/qiuye-ui/responsive-tabs";

const items = [
  { value: "overview", label: "Overview" },
  { value: "details", label: "Details" },
];

export function Demo() {
  const [value, setValue] = useState("overview");

  return (
    <ResponsiveTabs value={value} onValueChange={setValue} items={items}>
      <div className="rounded-md border p-4">Your content</div>
    </ResponsiveTabs>
  );
}`;

const cursorMcpConfig = `{
  "mcpServers": {
    "@qiuye-ui/mcp": {
      "command": "npx",
      "args": ["-y", "--package", "@qiuye-ui/mcp@latest", "qiuye-ui-mcp"]
    }
  }
}`;

function Surface({
  children,
  className,
  ...props
}: HTMLMotionProps<"div"> & {
  children: ReactNode;
}) {
  return (
    <SmoothCorners asChild radius={8} smoothing={0.62}>
      <motion.div
        className={cn(
          "min-w-0 max-w-full rounded-lg border bg-card text-card-foreground",
          className,
        )}
        {...props}
      >
        {children}
      </motion.div>
    </SmoothCorners>
  );
}

function CodeSample({
  code,
  language = "bash",
  filename,
  isDark,
}: {
  code: string;
  language?: string;
  filename?: string;
  isDark: boolean;
}) {
  return (
    <CodeBlockPanel
      code={code}
      filename={filename}
      language={language}
      isDark={isDark}
      colorTheme="github"
      className="min-w-0 rounded-lg"
    >
      <CodeBlockDisplay
        language={language}
        isDark={isDark}
        colorTheme="github"
        showLineNumbers={false}
      >
        {code}
      </CodeBlockDisplay>
    </CodeBlockPanel>
  );
}

function CopyCommandButton({
  copied,
  label,
  onCopy,
  tooltip = "复制命令",
}: {
  copied: boolean;
  label: string;
  onCopy: () => void;
  tooltip?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <DualStateToggle
          active={copied}
          onToggle={onCopy}
          activeIcon={<CheckIcon className="text-emerald-500" />}
          inactiveIcon={<CopyIcon />}
          activeLabel={`已${label}`}
          inactiveLabel={label}
          variant="ghost"
          effect="scale"
          transitionDuration={0.18}
        />
      </TooltipTrigger>
      <TooltipContent>{copied ? "已复制" : tooltip}</TooltipContent>
    </Tooltip>
  );
}

function StepIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex size-10 items-center justify-center rounded-md border bg-background text-foreground">
      <Icon className="size-5" />
    </div>
  );
}

export default function QuickStartPage() {
  const { resolvedTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const clipboard = useClipboard();
  const [packageManager, setPackageManager] = useState<PackageManager>("pnpm");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const isDark = resolvedTheme === "dark";
  const initialState = prefersReducedMotion ? "visible" : "hidden";

  const components = useMemo(() => getAllComponents(), []);
  const featuredComponents = useMemo(() => {
    const priority = [
      "responsive-tabs",
      "clip-path-tabs",
      "segmented-control",
      "scrollable-dialog",
      "code-block",
      "smooth-corners",
      "tour",
      "color-picker",
    ];
    const byCliName = new Map(
      components.map((component) => [component.cliName, component]),
    );
    const prioritized = priority
      .map((name) => byCliName.get(name))
      .filter(Boolean) as ComponentInfo[];
    const remaining = components.filter(
      (component) => !priority.includes(component.cliName),
    );

    return [...prioritized, ...remaining].slice(0, 6);
  }, [components]);

  const commandPrefix = packageManager === "npm" ? "npx" : "pnpm dlx";
  const initCommand = `${commandPrefix} shadcn@latest init`;
  const addCommand = `${commandPrefix} shadcn@latest add @qiuye-ui/responsive-tabs`;
  const directUrlCommand = `${commandPrefix} shadcn@latest add https://ui.qiuyedx.com/registry/responsive-tabs.json`;

  const copyText = (text: string, key: string, label = "内容") => {
    clipboard.copy(text);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1800);
    toast.success(`${label}已复制`);
  };

  const steps = [
    {
      eyebrow: "01",
      title: "准备 shadcn/ui 项目",
      description:
        "QiuYe UI 组件会被添加到你的项目源码里，因此先确认项目已经完成 shadcn/ui 初始化。",
      icon: Settings2Icon,
      code: initCommand,
      language: "bash",
      filename: "Terminal",
    },
    {
      eyebrow: "02",
      title: "接入 QiuYe UI registry",
      description:
        "在 components.json 里添加 registry alias，之后就可以用 @qiuye-ui/name 安装组件。",
      icon: PackageCheckIcon,
      code: registryConfig,
      language: "json",
      filename: "components.json",
    },
    {
      eyebrow: "03",
      title: "添加第一个组件",
      description:
        "从一个组件开始验证路径。安装完成后，组件文件会出现在你的 components 目录中。",
      icon: RocketIcon,
      code: addCommand,
      language: "bash",
      filename: "Terminal",
    },
    {
      eyebrow: "04",
      title: "在业务界面中使用",
      description:
        "组件是普通 React 代码，可以按项目需要继续改样式、组合交互或抽象业务封装。",
      icon: PaletteIcon,
      code: usageExample,
      language: "tsx",
      filename: "Demo.tsx",
    },
  ];

  return (
    <div className="bg-background">
      <motion.section
        className="border-b"
        initial={initialState}
        animate="visible"
      >
        <div className="mx-auto grid w-full max-w-screen-2xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_28rem] lg:px-8 lg:py-16">
          <motion.div
            className="flex min-w-0 flex-col justify-center"
            variants={heroCopyVariants}
          >
            <motion.div
              className="mb-5 flex flex-wrap items-center gap-2"
              variants={heroItemVariants}
            >
              <Badge variant="outline" className="gap-1.5">
                <SparklesIcon className="size-3" />
                {components.length} 个可安装组件
              </Badge>
              <Badge variant="secondary">Based on shadcn/ui</Badge>
            </motion.div>

            <motion.h1
              className="max-w-3xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl lg:text-6xl"
              variants={heroTitleVariants}
            >
              QiuYe UI 快速开始
            </motion.h1>
            <motion.p
              className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg"
              variants={heroItemVariants}
            >
              用 shadcn/ui 熟悉的方式，把 QiuYe UI 的交互组件添加到你的项目里。
              先接入 registry，再按需安装组件，组件源码会落在你自己的代码库中。
            </motion.p>

            <motion.div
              className="mt-7 flex flex-col gap-3 sm:flex-row"
              variants={heroItemVariants}
            >
              <Button
                asChild
                className={cn(
                  TRAILING_ICON_BUTTON_CLASS,
                  "w-full sm:w-auto",
                )}
              >
                <Link href="/components">
                  浏览组件
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className={cn(
                  LEADING_ICON_BUTTON_CLASS,
                  "w-full sm:w-auto",
                )}
              >
                <Link
                  href="https://github.com/qiuyedx/qiuye-ui"
                  target="_blank"
                  rel="noreferrer"
                >
                  <GithubIcon className="size-4" />
                  GitHub
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          <Surface className="p-4 shadow-sm" variants={heroPanelVariants}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">推荐第一步</p>
                <p className="text-sm text-muted-foreground">
                  选择你的包管理器后复制命令
                </p>
              </div>
              <SegmentedControl
                aria-label="包管理器"
                value={packageManager}
                onValueChange={(value) =>
                  setPackageManager(value as PackageManager)
                }
                items={[
                  { value: "pnpm", label: "pnpm" },
                  { value: "npm", label: "npm" },
                ]}
                size="sm"
                fullWidth
                className="sm:w-36"
              />
            </div>

            <CodeSample
              code={addCommand}
              language="bash"
              filename="Terminal"
              isDark={isDark}
            />

            <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2Icon className="mt-0.5 size-4 text-emerald-500" />
                <span>已配置 registry 时，用组件名安装最顺手。</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2Icon className="mt-0.5 size-4 text-emerald-500" />
                <span>还没配置时，也可以先用下方 URL 方式验证。</span>
              </div>
            </div>
          </Surface>
        </div>
      </motion.section>

      <motion.section
        className="mx-auto w-full max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8"
        variants={sectionFlowVariants}
        initial={initialState}
        whileInView="visible"
        viewport={REVEAL_VIEWPORT}
      >
        <motion.div
          className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
          variants={sectionHeaderVariants}
        >
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Start Path
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              四步接入
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            这条路径适合 Next.js、Vite、React Router 等已经使用 shadcn/ui
            的项目。复制命令前先确认当前终端位于项目根目录。
          </p>
        </motion.div>

        <motion.div
          className="grid gap-4 lg:grid-cols-2"
          variants={cardGridVariants}
        >
          {steps.map((step) => (
            <Surface
              key={step.eyebrow}
              className="p-5 shadow-sm"
              variants={cardVariants}
            >
              <div className="mb-5 flex items-start gap-4">
                <StepIcon icon={step.icon} />
                <div className="min-w-0">
                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                    {step.eyebrow}
                  </div>
                  <h3 className="text-xl font-semibold tracking-normal">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
              <CodeSample
                code={step.code}
                language={step.language}
                filename={step.filename}
                isDark={isDark}
              />
            </Surface>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        className="border-y bg-muted/25"
        initial={initialState}
        whileInView="visible"
        viewport={REVEAL_VIEWPORT}
      >
        <motion.div
          className="mx-auto grid w-full max-w-screen-2xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8"
          variants={sectionColumnsVariants}
        >
          <motion.div variants={sectionFlowVariants}>
            <motion.div
              className="mb-6 flex items-center justify-between gap-4"
              variants={sectionHeaderVariants}
            >
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Components
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                  先从这些组件开始
                </h2>
              </div>
              <Button
                asChild
                variant="outline"
                className={cn(
                  TRAILING_ICON_BUTTON_CLASS,
                  "hidden sm:inline-flex",
                )}
              >
                <Link href="/components">
                  全部组件
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
              variants={componentGridVariants}
            >
              {featuredComponents.map((component) => {
                const command = `${commandPrefix} shadcn@latest add @qiuye-ui/${component.cliName}`;
                const key = `component-${component.cliName}`;

                return (
                  <motion.div
                    key={component.cliName}
                    className="flex min-h-52 flex-col justify-between rounded-lg border bg-background p-4 shadow-sm"
                    variants={cardVariants}
                  >
                    <div className="min-w-0">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <Badge variant="secondary">{component.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          v{component.version}
                        </span>
                      </div>
                      <Link
                        href={`/components/${component.cliName}`}
                        className="text-lg font-semibold tracking-normal transition-colors hover:text-primary"
                      >
                        {component.name}
                      </Link>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {component.description}
                      </p>
                    </div>

                    <div className="mt-5 flex min-w-0 items-center gap-2 rounded-md border bg-muted/35 px-2 py-1.5">
                      <code className="min-w-0 flex-1 truncate text-xs">
                        @qiuye-ui/{component.cliName}
                      </code>
                      <CopyCommandButton
                        copied={copiedKey === key}
                        label={`复制 ${component.name} 安装命令`}
                        onCopy={() => copyText(command, key, "安装命令")}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          <motion.div
            className="grid content-start gap-4"
            variants={sideColumnVariants}
          >
            <Surface className="p-5" variants={cardVariants}>
              <div className="mb-4 flex items-center gap-3">
                <WandSparklesIcon className="size-5" />
                <h3 className="text-lg font-semibold tracking-normal">
                  不想先改配置？
                </h3>
              </div>
              <p className="mb-4 text-sm leading-6 text-muted-foreground">
                可以直接使用 registry JSON
                地址安装组件，适合快速验证或临时试用。
              </p>
              <CodeSample
                code={directUrlCommand}
                language="bash"
                filename="Terminal"
                isDark={isDark}
              />
            </Surface>

            <Surface className="p-5" variants={cardVariants}>
              <div className="mb-4 flex items-center gap-3">
                <LifeBuoyIcon className="size-5" />
                <h3 className="text-lg font-semibold tracking-normal">
                  接入检查
                </h3>
              </div>
              <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                <li className="flex gap-2">
                  <CheckCircle2Icon className="mt-1 size-4 text-emerald-500" />
                  <span>项目根目录存在 components.json。</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2Icon className="mt-1 size-4 text-emerald-500" />
                  <span>components.json 里的 aliases 指向项目真实目录。</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2Icon className="mt-1 size-4 text-emerald-500" />
                  <span>安装后按组件详情页示例补齐必要状态和 props。</span>
                </li>
              </ul>
            </Surface>
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.section
        className="mx-auto grid w-full max-w-screen-2xl gap-4 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8"
        variants={cardGridVariants}
        initial={initialState}
        whileInView="visible"
        viewport={REVEAL_VIEWPORT}
      >
        <Surface className="p-5" variants={cardVariants}>
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Registry
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-normal">
                国内访问优先使用 ui.qiuyedx.com
              </h2>
            </div>
            <CopyCommandButton
              copied={copiedKey === "registry"}
              label="复制 Registry 配置"
              tooltip="复制配置"
              onCopy={() =>
                copyText(registryConfig, "registry", "Registry 配置")
              }
            />
          </div>
          <CodeSample
            code={registryConfig}
            language="json"
            filename="components.json"
            isDark={isDark}
          />
          <div className="mt-4 rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
            国际备用地址：{" "}
            <code className="break-all text-foreground">
              https://qiuye-ui.vercel.app/registry/{"{name}"}.json
            </code>
          </div>
          <div className="mt-3 rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
            仍在使用旧版 new-york 风格的项目，可以改用冻结的 v1 快照：{" "}
            <code className="break-all text-foreground">
              https://ui.qiuyedx.com/registry/v1/{"{name}"}.json
            </code>
          </div>
        </Surface>

        <Surface className="p-5" variants={cardVariants}>
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                AI Assistant
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-normal">
                在编辑器里读取组件库
              </h2>
            </div>
            <Button asChild variant="outline" size="icon">
              <Link
                href="https://www.npmjs.com/package/@qiuye-ui/mcp"
                target="_blank"
                rel="noreferrer"
                aria-label="打开 @qiuye-ui/mcp"
              >
                <ExternalLinkIcon className="size-4" />
              </Link>
            </Button>
          </div>
          <p className="mb-4 text-sm leading-6 text-muted-foreground">
            Cursor、Claude、Codex 等支持 MCP 的工具可以通过 @qiuye-ui/mcp
            查询组件、读取 registry，并生成安装命令。
          </p>
          <CodeSample
            code={cursorMcpConfig}
            language="json"
            filename=".cursor/mcp.json"
            isDark={isDark}
          />
        </Surface>
      </motion.section>

      <motion.section
        className="border-t"
        initial={initialState}
        whileInView="visible"
        viewport={REVEAL_VIEWPORT}
      >
        <motion.div
          className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8"
          variants={sectionColumnsVariants}
        >
          <motion.div variants={sectionHeaderVariants}>
            <h2 className="text-2xl font-semibold tracking-normal">
              准备挑组件了？
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              组件页包含预览、Props、基础用法和安装命令。
            </p>
          </motion.div>
          <motion.div
            className="flex flex-col gap-3 sm:flex-row"
            variants={footerActionsVariants}
          >
            <Button asChild className={TRAILING_ICON_BUTTON_CLASS}>
              <Link href="/components">
                打开组件列表
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className={TRAILING_ICON_BUTTON_CLASS}
            >
              <Link
                href="https://github.com/qiuyedx/qiuye-ui/issues"
                target="_blank"
                rel="noreferrer"
              >
                反馈问题
                <ExternalLinkIcon className="size-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.section>
    </div>
  );
}
