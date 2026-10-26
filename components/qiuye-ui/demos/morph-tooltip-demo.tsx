"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  CalendarDaysIcon,
  CheckIcon,
  ChevronDownIcon,
  CodeIcon,
  CompassIcon,
  CopyIcon,
  DownloadIcon,
  FolderIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  MailIcon,
  MusicIcon,
  NotebookPenIcon,
  Redo2Icon,
  RemoveFormattingIcon,
  RotateCcwIcon,
  SearchIcon,
  SettingsIcon,
  StarIcon,
  StrikethroughIcon,
  UnderlineIcon,
  Undo2Icon,
  Volume2Icon,
  VolumeXIcon,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  DEFAULT_MORPH_TOOLTIP_OPTIONS,
  MorphTooltip,
  MorphTooltipProvider,
  type MorphTooltipAlign,
  type MorphTooltipSide,
  type MorphTooltipVariant,
} from "@/components/qiuye-ui/morph-tooltip";
import { SegmentedControl } from "@/components/qiuye-ui/segmented-control";
import { SmoothCorners } from "@/components/qiuye-ui/smooth-corners";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ViewSourceButton } from "@/components/view-source-button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* 首页 / 详情页快速预览：Dock 风格的图标栏                               */
/* ------------------------------------------------------------------ */

interface DockApp {
  id: string;
  label: string;
  shortcut?: string;
  icon: LucideIcon;
  colors: [string, string];
  running?: boolean;
  /** 窄容器中隐藏的图标 */
  hideClassName?: string;
}

const DOCK_APPS: DockApp[] = [
  { id: "files", label: "文件", icon: FolderIcon, colors: ["#6cc4ff", "#1a7cf0"], running: true },
  {
    id: "browser",
    label: "浏览器",
    icon: CompassIcon,
    colors: ["#7be3f0", "#0f8fd6"],
    running: true,
  },
  { id: "mail", label: "邮件 · 3 封未读", icon: MailIcon, colors: ["#9bb8ff", "#4a6cf0"] },
  { id: "calendar", label: "日历", icon: CalendarDaysIcon, colors: ["#ff8f8f", "#e8364f"] },
  {
    id: "notes",
    label: "备忘录",
    icon: NotebookPenIcon,
    colors: ["#ffe27a", "#f0a800"],
    hideClassName: "hidden @[17rem]:flex",
  },
  {
    id: "music",
    label: "音乐 · 正在播放",
    icon: MusicIcon,
    colors: ["#ff8bc8", "#e8408f"],
    running: true,
    hideClassName: "hidden @[20rem]:flex",
  },
];

const DOCK_SETTINGS: DockApp = {
  id: "settings",
  label: "系统设置",
  shortcut: "⌘,",
  icon: SettingsIcon,
  colors: ["#c9ced6", "#7d8591"],
};

function DockIcon({ app, className }: { app: DockApp; className?: string }) {
  const Icon = app.icon;
  return (
    <MorphTooltip content={app.label} shortcut={app.shortcut}>
      <SmoothCorners asChild radius={11} smoothing={0.6}>
        <button
          type="button"
          aria-label={app.label}
          className={cn(
            "relative flex size-9 shrink-0 items-center justify-center rounded-[11px] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_1px_2px_rgb(0_0_0/0.18)] outline-none transition-[translate,scale] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 @md:size-11 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
            app.hideClassName,
            className,
          )}
          style={{ background: `linear-gradient(160deg, ${app.colors[0]}, ${app.colors[1]})` }}
        >
          <Icon className="size-[18px] @md:size-[22px]" strokeWidth={2.1} />
          {app.running ? (
            <span
              aria-hidden
              className="absolute -bottom-[5px] left-1/2 size-[3px] -translate-x-1/2 rounded-full bg-foreground/45"
            />
          ) : null}
        </button>
      </SmoothCorners>
    </MorphTooltip>
  );
}

/** MorphTooltip 快速预览：一条 Dock 风格的图标栏，悬停时气泡在图标间滑动 */
export function MorphTooltipPreview() {
  return (
    <div className="@container flex w-full flex-col items-center justify-center gap-4 py-2">
      <MorphTooltipProvider sideOffset={10}>
        <SmoothCorners asChild radius={20} smoothing={0.6}>
          <div className="flex items-center gap-1.5 rounded-[20px] border bg-background/80 p-1.5 pb-2 shadow-sm @md:gap-2 @md:p-2 @md:pb-2.5">
            {DOCK_APPS.map((app) => (
              <DockIcon key={app.id} app={app} />
            ))}
            <span
              aria-hidden
              className="mx-0.5 hidden h-7 w-px self-center bg-border @[14rem]:block"
            />
            <DockIcon app={DOCK_SETTINGS} />
          </div>
        </SmoothCorners>
      </MorphTooltipProvider>
      <p className="text-center text-xs text-muted-foreground">悬停或长按图标，气泡在图标间滑动</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 计时说明：首次等待 / 立即                                             */
/* ------------------------------------------------------------------ */

type TimelinePhase = "idle" | "pending" | "open" | "grace";

/** 用 onOpenChange 与指针进出复现范围的计时，给演示显示「等待 / 立即」 */
function useScopeTimeline(skipDelayDuration: number) {
  const [phase, setPhase] = useState<TimelinePhase>("idle");
  const [stamp, setStamp] = useState(0);
  const graceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(graceTimer.current), []);

  const onOpenChange = useCallback(
    (open: boolean) => {
      clearTimeout(graceTimer.current);
      if (open) {
        setPhase("open");
        return;
      }
      // 在元素间切换时先收到旧提示的 false、再收到新提示的 true，二者在同一事件中合并渲染
      setPhase("grace");
      setStamp((value) => value + 1);
      graceTimer.current = setTimeout(() => setPhase("idle"), skipDelayDuration);
    },
    [skipDelayDuration],
  );

  const onPointerOver = useCallback((event: React.PointerEvent) => {
    if (event.pointerType === "touch") return;
    if (!(event.target as Element).closest("[data-toolbar-item]")) return;
    setPhase((current) => {
      if (current !== "idle") return current;
      setStamp((value) => value + 1);
      return "pending";
    });
  }, []);

  const onPointerOut = useCallback((event: React.PointerEvent) => {
    const next = event.relatedTarget as Element | null;
    if (next?.closest?.("[data-toolbar-item]")) return;
    setPhase((current) => (current === "pending" ? "idle" : current));
  }, []);

  return { phase, stamp, onOpenChange, onPointerOver, onPointerOut };
}

function TimelineStatus({
  phase,
  stamp,
  delay,
  skipDelayDuration,
}: {
  phase: TimelinePhase;
  stamp: number;
  delay: number;
  skipDelayDuration: number;
}) {
  const text = {
    idle: `首次悬停需等待 ${delay}ms`,
    pending: `等待 ${delay}ms…`,
    open: "显示中 · 移到其他按钮立即滑过去",
    grace: `已隐藏 · ${skipDelayDuration}ms 内回来无需等待`,
  }[phase];

  return (
    <div className="flex min-w-0 items-center gap-2.5 text-xs text-muted-foreground">
      <span className="relative h-1 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
        {phase === "pending" ? (
          <motion.span
            key={`pending-${stamp}`}
            className="absolute inset-y-0 left-0 rounded-full bg-amber-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: delay / 1000, ease: "linear" }}
          />
        ) : phase === "grace" ? (
          <motion.span
            key={`grace-${stamp}`}
            className="absolute inset-y-0 left-0 rounded-full bg-emerald-500"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: skipDelayDuration / 1000, ease: "linear" }}
          />
        ) : phase === "open" ? (
          <span className="absolute inset-0 rounded-full bg-emerald-500" />
        ) : null}
      </span>
      <span className="truncate">{text}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1. 编辑器工具栏                                                       */
/* ------------------------------------------------------------------ */

type MarkKey = "bold" | "italic" | "underline" | "strike" | "code";
type AlignKey = "left" | "center" | "right";

const MARKS: Array<{ key: MarkKey; label: string; shortcut: string[]; icon: LucideIcon }> = [
  { key: "bold", label: "加粗", shortcut: ["⌘", "B"], icon: BoldIcon },
  { key: "italic", label: "斜体", shortcut: ["⌘", "I"], icon: ItalicIcon },
  { key: "underline", label: "下划线", shortcut: ["⌘", "U"], icon: UnderlineIcon },
  { key: "strike", label: "删除线", shortcut: ["⌘", "⇧", "X"], icon: StrikethroughIcon },
  { key: "code", label: "行内代码", shortcut: ["⌘", "E"], icon: CodeIcon },
];

const ALIGNS: Array<{ key: AlignKey; label: string; icon: LucideIcon }> = [
  { key: "left", label: "左对齐", icon: AlignLeftIcon },
  { key: "center", label: "居中", icon: AlignCenterIcon },
  { key: "right", label: "右对齐", icon: AlignRightIcon },
];

const BLOCKS = [
  { value: "p", label: "正文" },
  { value: "h1", label: "标题 1" },
  { value: "h2", label: "标题 2" },
  { value: "quote", label: "引用" },
];

const toolbarCode = `import { BoldIcon, ItalicIcon, ChevronDownIcon } from "lucide-react";
import { MorphTooltip, MorphTooltipProvider } from "@/components/qiuye-ui/morph-tooltip";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function EditorToolbar() {
  return (
    // 整条工具栏一个范围：只有第一次悬停等待 400ms，之后气泡在按钮间滑动
    <MorphTooltipProvider>
      <div role="group" aria-label="格式" className="flex items-center gap-0.5">
        {/* 下拉菜单：按下时提示自动隐藏，菜单照常打开 */}
        <DropdownMenu>
          <MorphTooltip content="段落样式">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                正文
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
          </MorphTooltip>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>正文</DropdownMenuItem>
            <DropdownMenuItem>标题 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <MorphTooltip content="加粗" shortcut={["⌘", "B"]}>
          <Button variant="ghost" size="icon-sm" aria-label="加粗">
            <BoldIcon />
          </Button>
        </MorphTooltip>
        <MorphTooltip content="斜体" shortcut="⌘I">
          <Button variant="ghost" size="icon-sm" aria-label="斜体">
            <ItalicIcon />
          </Button>
        </MorphTooltip>
        {/* ... */}
      </div>
    </MorphTooltipProvider>
  );
}`;

function ToolbarButton({
  label,
  shortcut,
  icon: Icon,
  pressed,
  onClick,
  onOpenChange,
}: {
  label: string;
  shortcut?: string[];
  icon: LucideIcon;
  pressed?: boolean;
  onClick?: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <MorphTooltip content={label} shortcut={shortcut} onOpenChange={onOpenChange}>
      <Button
        data-toolbar-item
        variant="ghost"
        size="icon-sm"
        aria-label={label}
        aria-pressed={pressed}
        onClick={onClick}
        className={cn(pressed && "bg-muted text-foreground")}
      >
        <Icon />
      </Button>
    </MorphTooltip>
  );
}

function EditorToolbarDemo() {
  const { delay, skipDelayDuration } = DEFAULT_MORPH_TOOLTIP_OPTIONS;
  const timeline = useScopeTimeline(skipDelayDuration);
  const [marks, setMarks] = useState<Record<MarkKey, boolean>>({
    bold: true,
    italic: false,
    underline: false,
    strike: false,
    code: false,
  });
  const [align, setAlign] = useState<AlignKey>("left");
  const [block, setBlock] = useState("p");
  const [list, setList] = useState<"none" | "bullet" | "ordered">("none");

  const toggleMark = (key: MarkKey) =>
    setMarks((current) => ({ ...current, [key]: !current[key] }));
  const blockLabel = BLOCKS.find((item) => item.value === block)?.label ?? "正文";

  const textClassName = cn(
    marks.bold && "font-semibold",
    marks.italic && "italic",
    marks.underline && "underline underline-offset-4",
    marks.strike && "line-through",
    marks.code && "rounded bg-muted px-1 font-mono text-[0.9em]",
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>编辑器工具栏</CardTitle>
          <ViewSourceButton code={toolbarCode} />
        </div>
        <CardDescription>
          {
            "整条工具栏是一个范围：第一次悬停等待 400ms，之后在按钮之间移动，气泡不消失、直接滑过去并变形尺寸；快速扫过时文字直接替换，只有气泡在滑。离开后 500ms 内回来无需等待；Tab 键在按钮间移动同样会滑动，触屏上长按按钮显示。"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <MorphTooltipProvider>
          <div
            role="group"
            aria-label="格式"
            className="flex items-center gap-0.5 overflow-x-auto rounded-xl border bg-background p-1 [scrollbar-width:none]"
            onPointerOver={timeline.onPointerOver}
            onPointerOut={timeline.onPointerOut}
          >
            <ToolbarButton
              label="撤销"
              shortcut={["⌘", "Z"]}
              icon={Undo2Icon}
              onOpenChange={timeline.onOpenChange}
              onClick={() => toast("撤销")}
            />
            <ToolbarButton
              label="重做"
              shortcut={["⌘", "⇧", "Z"]}
              icon={Redo2Icon}
              onOpenChange={timeline.onOpenChange}
              onClick={() => toast("重做")}
            />
            <Separator orientation="vertical" className="mx-1 h-5 shrink-0 self-center" />
            <DropdownMenu>
              <MorphTooltip content="段落样式" onOpenChange={timeline.onOpenChange}>
                <DropdownMenuTrigger asChild>
                  <Button data-toolbar-item variant="ghost" size="sm" className="shrink-0 px-2">
                    {blockLabel}
                    <ChevronDownIcon className="opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
              </MorphTooltip>
              <DropdownMenuContent align="start" className="min-w-28">
                <DropdownMenuRadioGroup value={block} onValueChange={setBlock}>
                  {BLOCKS.map((item) => (
                    <DropdownMenuRadioItem key={item.value} value={item.value}>
                      {item.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Separator orientation="vertical" className="mx-1 h-5 shrink-0 self-center" />
            {MARKS.map((mark) => (
              <ToolbarButton
                key={mark.key}
                label={mark.label}
                shortcut={mark.shortcut}
                icon={mark.icon}
                pressed={marks[mark.key]}
                onClick={() => toggleMark(mark.key)}
                onOpenChange={timeline.onOpenChange}
              />
            ))}
            <ToolbarButton
              label="插入链接"
              shortcut={["⌘", "K"]}
              icon={LinkIcon}
              onOpenChange={timeline.onOpenChange}
              onClick={() => toast("插入链接")}
            />
            <Separator orientation="vertical" className="mx-1 h-5 shrink-0 self-center" />
            {ALIGNS.map((item) => (
              <ToolbarButton
                key={item.key}
                label={item.label}
                icon={item.icon}
                pressed={align === item.key}
                onClick={() => setAlign(item.key)}
                onOpenChange={timeline.onOpenChange}
              />
            ))}
            <Separator orientation="vertical" className="mx-1 h-5 shrink-0 self-center" />
            <ToolbarButton
              label="无序列表"
              icon={ListIcon}
              pressed={list === "bullet"}
              onClick={() => setList((current) => (current === "bullet" ? "none" : "bullet"))}
              onOpenChange={timeline.onOpenChange}
            />
            <ToolbarButton
              label="有序列表"
              icon={ListOrderedIcon}
              pressed={list === "ordered"}
              onClick={() => setList((current) => (current === "ordered" ? "none" : "ordered"))}
              onOpenChange={timeline.onOpenChange}
            />
            <ToolbarButton
              label="清除格式"
              shortcut={["⌘", "\\"]}
              icon={RemoveFormattingIcon}
              onOpenChange={timeline.onOpenChange}
              onClick={() => {
                setMarks({
                  bold: false,
                  italic: false,
                  underline: false,
                  strike: false,
                  code: false,
                });
                setBlock("p");
                setList("none");
                setAlign("left");
              }}
            />
          </div>
        </MorphTooltipProvider>

        <TimelineStatus
          phase={timeline.phase}
          stamp={timeline.stamp}
          delay={delay}
          skipDelayDuration={skipDelayDuration}
        />

        <div
          className={cn(
            "rounded-xl border border-dashed px-4 py-3.5 text-sm leading-6 text-foreground/85",
            align === "center" && "text-center",
            align === "right" && "text-right",
          )}
        >
          {block === "h1" ? (
            <p className="mb-1 text-xl font-semibold tracking-tight">一个范围，一个气泡</p>
          ) : block === "h2" ? (
            <p className="mb-1 text-base font-semibold">一个范围，一个气泡</p>
          ) : null}
          {list === "none" ? (
            <p className={cn(block === "quote" && "border-l-2 pl-3 text-muted-foreground")}>
              <span className={textClassName}>提示气泡在整条工具栏里只有一个</span>
              ，从一个按钮移到另一个按钮时，它滑过去并连续变形，而不是消失再出现。
            </p>
          ) : (
            <ul
              className={cn(
                "space-y-0.5 pl-5",
                list === "bullet" ? "list-disc" : "list-decimal",
                align !== "left" && "list-inside pl-0",
              )}
            >
              <li>
                <span className={textClassName}>提示气泡在整条工具栏里只有一个</span>
              </li>
              <li>只有第一次悬停需要等待</li>
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 2. 贡献热力图                                                         */
/* ------------------------------------------------------------------ */

const HEATMAP_END = new Date(2026, 9, 24);
const HEATMAP_WEEKS = 53;
const WEEKDAY_LABELS = "日一二三四五六";

interface ContributionDay {
  key: string;
  count: number;
  level: number;
  label: string;
  future: boolean;
  month: number;
}

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 生成固定的演示数据（服务端与客户端一致）：从 52 周前的周日开始，按列（周）排布 */
function buildContributions(): ContributionDay[] {
  const random = mulberry32(20261024);
  const start = new Date(HEATMAP_END);
  start.setDate(HEATMAP_END.getDate() - HEATMAP_END.getDay() - 52 * 7);
  const days: ContributionDay[] = [];
  for (let index = 0; index < HEATMAP_WEEKS * 7; index++) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const future = date > HEATMAP_END;
    const weekday = date.getDay();
    const season = 0.55 + 0.45 * Math.sin(index / 26);
    const r = random();
    let count = 0;
    if (!future) {
      const idle = weekday === 0 || weekday === 6 ? 0.62 : 0.3;
      if (r > idle * (1.2 - season * 0.5)) {
        count = Math.max(1, Math.round(random() ** 1.6 * 16 * season));
      }
    }
    const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 9 ? 3 : 4;
    days.push({
      key: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      count,
      level,
      label: `${date.getMonth() + 1}月${date.getDate()}日 周${WEEKDAY_LABELS[weekday]}`,
      future,
      month: date.getMonth(),
    });
  }
  return days;
}

const LEVEL_CLASSNAMES = [
  "bg-foreground/[0.07]",
  "bg-emerald-500/30",
  "bg-emerald-500/55",
  "bg-emerald-500/80",
  "bg-emerald-500",
];

const heatmapCode = `import { MorphTooltip, MorphTooltipProvider } from "@/components/qiuye-ui/morph-tooltip";

const levels = ["bg-muted", "bg-emerald-500/30", "bg-emerald-500/55", "bg-emerald-500/80", "bg-emerald-500"];

export function ContributionGraph({ days }: { days: { key: string; count: number; level: number; label: string }[] }) {
  return (
    // 371 个格子共享一个气泡；格子之间只有 3px 缝隙，closeDelay 让气泡跨过缝隙时不消失。
    // 气泡会盖住上方的格子：关闭 hoverable，让它对指针透明
    <MorphTooltipProvider delay={200} arrow hoverable={false}>
      <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
        {days.map((day) => (
          <MorphTooltip
            key={day.key}
            content={day.count ? \`\${day.count} 次贡献 · \${day.label}\` : \`没有贡献 · \${day.label}\`}
          >
            <div
              className={\`size-[11px] rounded-[3px] data-[tooltip-state=open]:ring-1 data-[tooltip-state=open]:ring-foreground/50 \${levels[day.level]}\`}
            />
          </MorphTooltip>
        ))}
      </div>
    </MorphTooltipProvider>
  );
}`;

function ContributionHeatmapDemo() {
  const days = useMemo(buildContributions, []);
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const monthLabels = useMemo(() => {
    const labels: Array<{ week: number; text: string }> = [];
    let lastMonth = -1;
    for (let week = 0; week < HEATMAP_WEEKS; week++) {
      const month = days[week * 7].month;
      if (month !== lastMonth) {
        if (week < HEATMAP_WEEKS - 2) labels.push({ week, text: `${month + 1}月` });
        lastMonth = month;
      }
    }
    // 第一列通常是上个月的尾巴，离下一个标签太近时去掉
    if (labels.length > 1 && labels[1].week - labels[0].week < 3) labels.shift();
    return labels;
  }, [days]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>贡献热力图</CardTitle>
          <ViewSourceButton code={heatmapCode} />
        </div>
        <CardDescription>
          {
            "53 × 7 个格子共享一个带箭头的气泡。指针扫过时气泡在格子之间连续滑动、宽度随文字变化，扫动途中文字直接替换保持可读，停下时内容沿移动方向交叉淡入。气泡会盖住上方的格子，所以这里关闭了 hoverable，让它对指针透明。"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="overflow-x-auto pb-1 [scrollbar-width:thin]">
          <MorphTooltipProvider delay={200} arrow hoverable={false}>
            <div className="inline-flex flex-col gap-1.5">
              <div className="relative ml-6 h-4 text-[11px] text-muted-foreground">
                {monthLabels.map((label) => (
                  <span
                    key={label.week}
                    className="absolute top-0"
                    style={{ left: label.week * 14 }}
                  >
                    {label.text}
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <div className="grid w-[18px] grid-rows-7 gap-[3px] text-[10px] leading-[11px] text-muted-foreground">
                  {Array.from(WEEKDAY_LABELS).map((label, index) => (
                    <span key={label} className={index % 2 === 1 ? "" : "invisible"}>
                      {label}
                    </span>
                  ))}
                </div>
                <div
                  role="img"
                  aria-label={`过去一年共 ${total} 次贡献`}
                  className="grid grid-flow-col grid-rows-7 gap-[3px]"
                >
                  {days.map((day) =>
                    day.future ? (
                      <span key={day.key} className="size-[11px]" />
                    ) : (
                      <MorphTooltip
                        key={day.key}
                        content={
                          day.count
                            ? `${day.count} 次贡献 · ${day.label}`
                            : `没有贡献 · ${day.label}`
                        }
                      >
                        <span
                          className={cn(
                            "size-[11px] rounded-[3px] transition-shadow duration-150 data-[tooltip-state=open]:ring-1 data-[tooltip-state=open]:ring-foreground/50",
                            LEVEL_CLASSNAMES[day.level],
                          )}
                        />
                      </MorphTooltip>
                    ),
                  )}
                </div>
              </div>
            </div>
          </MorphTooltipProvider>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            过去一年共{" "}
            <span className="font-medium text-foreground tabular-nums">
              {total.toLocaleString()}
            </span>{" "}
            次贡献
          </span>
          <span className="flex items-center gap-1">
            少
            {LEVEL_CLASSNAMES.map((className) => (
              <span key={className} className={cn("size-[11px] rounded-[3px]", className)} />
            ))}
            多
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 3. 方向、对齐与碰撞                                                   */
/* ------------------------------------------------------------------ */

const ALIGN_ORDER: MorphTooltipAlign[] = ["start", "center", "end"];

const placementCode = `import { useState } from "react";
import { MorphTooltip, MorphTooltipProvider } from "@/components/qiuye-ui/morph-tooltip";
import { Button } from "@/components/ui/button";

// 方向 × 对齐：side 决定在哪一侧，align 决定沿那条边靠哪一端
export function PlacementGrid() {
  return (
    <MorphTooltipProvider arrow>
      <MorphTooltip side="top" align="start" content="top · start">
        <Button variant="outline" size="sm">start</Button>
      </MorphTooltip>
      <MorphTooltip side="left" align="end" content="left · end">
        <Button variant="outline" size="sm">end</Button>
      </MorphTooltip>
    </MorphTooltipProvider>
  );
}

// 局部的碰撞边界：在可滚动区域里，以「视口 ∩ 区域」为界翻转与平移
export function Stage() {
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setStage} className="relative h-72 overflow-auto">
      <MorphTooltipProvider arrow collisionBoundary={stage}>
        <MorphTooltip content="上方放不下时翻到下方">
          <Button size="sm">靠上</Button>
        </MorphTooltip>
      </MorphTooltipProvider>
    </div>
  );
}`;

function PlacementButton({ side, align }: { side: MorphTooltipSide; align: MorphTooltipAlign }) {
  return (
    <MorphTooltip side={side} align={align} content={`${side} · ${align}`}>
      <Button variant="outline" size="xs" className="w-14 font-mono text-[11px]">
        {align}
      </Button>
    </MorphTooltip>
  );
}

const STAGE_TRIGGERS = [
  { label: "靠上", content: "上方放不下时翻到下方", className: "top-3 left-[38%]" },
  {
    label: "左上角",
    content: "贴着左边：气泡向右平移，箭头仍指向按钮",
    className: "top-16 left-2",
  },
  { label: "右边缘", content: "贴着右边：向左平移留在区域内", className: "top-[42%] right-2" },
  { label: "中间", content: "空间充足时按首选方向显示", className: "top-[34%] left-[50%]" },
  {
    label: "靠下",
    content: "滚动时气泡贴着按钮走，滚出区域就隐藏",
    className: "bottom-3 left-[30%]",
  },
  { label: "左下", content: "试着滚动这个小舞台", className: "bottom-20 left-6" },
];

function CollisionStage() {
  const [stage, setStage] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!stage) return;
    stage.scrollTop = (stage.scrollHeight - stage.clientHeight) / 2;
    stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2;
  }, [stage]);

  return (
    <div
      ref={setStage}
      className="relative h-72 overflow-auto overscroll-contain rounded-xl border bg-[radial-gradient(circle,var(--border)_1px,transparent_1px)] bg-size-[16px_16px] [scrollbar-width:thin]"
    >
      <MorphTooltipProvider arrow collisionBoundary={stage} maxWidth={200}>
        <div className="relative h-[34rem] w-[150%] min-w-[28rem]">
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-xs text-muted-foreground">
            在这里上下左右滚动
          </div>
          {STAGE_TRIGGERS.map((trigger) => (
            <MorphTooltip key={trigger.label} content={trigger.content}>
              <Button
                size="xs"
                variant="secondary"
                className={cn("absolute shadow-sm", trigger.className)}
              >
                {trigger.label}
              </Button>
            </MorphTooltip>
          ))}
        </div>
      </MorphTooltipProvider>
    </div>
  );
}

function PlacementDemo() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>方向、对齐与碰撞</CardTitle>
          <ViewSourceButton code={placementCode} />
        </div>
        <CardDescription>
          {
            "左侧是四个方向 × 三种对齐，同一范围内跨方向移动时箭头在滑动途中隐藏、到位后在新的一侧出现；右侧的小舞台把自身设为 Provider 的碰撞边界，按钮靠近边缘时气泡翻到对侧或沿边平移，滚动时贴着按钮走，滚出舞台即隐藏。"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="grid items-center gap-6 lg:grid-cols-2">
        <MorphTooltipProvider arrow>
          <div className="mx-auto grid grid-cols-[auto_repeat(3,3.5rem)_auto] grid-rows-[auto_repeat(3,2.25rem)_auto] place-items-center gap-1.5">
            {ALIGN_ORDER.map((align, index) => (
              <div key={`top-${align}`} style={{ gridColumn: index + 2, gridRow: 1 }}>
                <PlacementButton side="top" align={align} />
              </div>
            ))}
            {ALIGN_ORDER.map((align, index) => (
              <div key={`left-${align}`} style={{ gridColumn: 1, gridRow: index + 2 }}>
                <PlacementButton side="left" align={align} />
              </div>
            ))}
            <div
              className="flex size-full items-center justify-center rounded-xl border border-dashed text-center text-xs leading-5 text-muted-foreground"
              style={{ gridColumn: "2 / 5", gridRow: "2 / 5" }}
            >
              side × align
            </div>
            {ALIGN_ORDER.map((align, index) => (
              <div key={`right-${align}`} style={{ gridColumn: 5, gridRow: index + 2 }}>
                <PlacementButton side="right" align={align} />
              </div>
            ))}
            {ALIGN_ORDER.map((align, index) => (
              <div key={`bottom-${align}`} style={{ gridColumn: index + 2, gridRow: 5 }}>
                <PlacementButton side="bottom" align={align} />
              </div>
            ))}
          </div>
        </MorphTooltipProvider>
        <CollisionStage />
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 4. 内容与样式                                                         */
/* ------------------------------------------------------------------ */

const contentCode = `import { SearchIcon } from "lucide-react";
import { MorphTooltip, MorphTooltipProvider } from "@/components/qiuye-ui/morph-tooltip";
import { Button } from "@/components/ui/button";

export function ContentExamples() {
  return (
    <MorphTooltipProvider>
      {/* 长文本：超过 maxWidth 自动换行，并收窄到最长的一行 */}
      <MorphTooltip maxWidth={240} content="提示内容超过最大宽度时自动换行……">
        <Button variant="outline" size="sm">长文本</Button>
      </MorphTooltip>

      {/* 富内容：任意节点，读取的是这里（触发元素处）的 Context */}
      <MorphTooltip
        content={
          <div className="flex items-center gap-2.5 py-1">
            <span className="size-8 rounded-full bg-linear-to-br from-amber-300 to-rose-500" />
            <span className="flex flex-col">
              <span className="font-semibold">秋叶</span>
              <span className="opacity-65">前端工程师 · 写组件与动效</span>
            </span>
          </div>
        }
      >
        <button type="button">@秋叶</button>
      </MorphTooltip>

      {/* 快捷键与箭头 */}
      <MorphTooltip content="打开命令面板" shortcut="⌘K">
        <Button variant="outline" size="sm"><SearchIcon />搜索</Button>
      </MorphTooltip>
      <MorphTooltip arrow content="箭头随气泡滑动">
        <Button variant="outline" size="sm">带箭头</Button>
      </MorphTooltip>

      {/* 可交互：指针可以移进气泡点击链接；键盘聚焦按钮后按 Tab 进入气泡 */}
      <MorphTooltip interactive content={<span>已发布 · <a href="/changelog">查看更新日志</a></span>}>
        <Button variant="outline" size="sm">可交互</Button>
      </MorphTooltip>

      {/* 配色：dark（默认）/ light / inverse，或用 className 换背景色 */}
      <MorphTooltip variant="light" content="白底深字">
        <Button variant="outline" size="sm">light</Button>
      </MorphTooltip>
      <MorphTooltip variant="inverse" content="与主题相反">
        <Button variant="outline" size="sm">inverse</Button>
      </MorphTooltip>
      <MorphTooltip className="bg-blue-600 text-white" content="自定义颜色">
        <Button variant="outline" size="sm">自定义颜色</Button>
      </MorphTooltip>
    </MorphTooltipProvider>
  );
}`;

function ContentStyleDemo() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>内容与样式</CardTitle>
          <ViewSourceButton code={contentCode} />
        </div>
        <CardDescription>
          {
            "所有按钮在同一个范围里：在不同配色之间移动时，背景与文字颜色随形变一起过渡；长文本换行后收窄到最长一行，富内容按自身尺寸形变。指针可以移进任何气泡阅读；可交互的气泡里的链接可以点击，键盘聚焦按钮后按 Tab 也能进入。"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MorphTooltipProvider>
          <div className="grid gap-5 sm:grid-cols-[5.5rem_1fr] sm:items-center">
            <span className="text-xs font-medium text-muted-foreground">内容</span>
            <div className="flex flex-wrap items-center gap-2">
              <MorphTooltip
                maxWidth={240}
                content="提示内容超过最大宽度时自动换行，并收窄到最长的一行，左右留白保持对称。这里的 maxWidth 是 240px。"
              >
                <Button variant="outline" size="sm">
                  长文本
                </Button>
              </MorphTooltip>
              <MorphTooltip
                content={
                  <div className="flex items-center gap-2.5 py-1 pr-1">
                    <span
                      aria-hidden
                      className="size-8 shrink-0 rounded-full bg-linear-to-br from-amber-300 to-rose-500 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.2)]"
                    />
                    <span className="flex flex-col">
                      <span className="font-semibold">秋叶</span>
                      <span className="text-[11.5px] leading-4 opacity-65">
                        前端工程师 · 写组件与动效
                      </span>
                    </span>
                  </div>
                }
              >
                <button
                  type="button"
                  className="h-7 rounded-md px-1.5 text-sm font-medium text-blue-600 outline-none hover:bg-blue-500/10 focus-visible:ring-2 focus-visible:ring-ring dark:text-blue-400"
                >
                  @秋叶
                </button>
              </MorphTooltip>
              <MorphTooltip content="打开命令面板" shortcut="⌘K">
                <Button variant="outline" size="sm">
                  <SearchIcon />
                  搜索
                </Button>
              </MorphTooltip>
              <MorphTooltip arrow content="箭头随气泡滑动，始终指向按钮中心">
                <Button variant="outline" size="sm">
                  带箭头
                </Button>
              </MorphTooltip>
              <MorphTooltip
                interactive
                content={
                  <span>
                    v1.0 已发布 ·{" "}
                    <a
                      href="#morph-tooltip-docs"
                      className="underline decoration-current/40 underline-offset-2 hover:decoration-current"
                      onClick={(event) => {
                        event.preventDefault();
                        toast("打开更新日志");
                      }}
                    >
                      查看更新日志
                    </a>
                  </span>
                }
              >
                <Button variant="outline" size="sm">
                  可交互
                </Button>
              </MorphTooltip>
            </div>

            <span className="text-xs font-medium text-muted-foreground">配色</span>
            <div className="flex flex-wrap items-center gap-2">
              <MorphTooltip content="dark：高级黑，深浅主题都是黑">
                <Button variant="outline" size="sm">
                  dark
                </Button>
              </MorphTooltip>
              <MorphTooltip variant="light" content="light：白底深字">
                <Button variant="outline" size="sm">
                  light
                </Button>
              </MorphTooltip>
              <MorphTooltip variant="inverse" content="inverse：与当前主题相反">
                <Button variant="outline" size="sm">
                  inverse
                </Button>
              </MorphTooltip>
              <MorphTooltip
                arrow
                className="bg-blue-600 text-white"
                content="className 换背景色，箭头跟着变"
              >
                <Button variant="outline" size="sm">
                  自定义颜色
                </Button>
              </MorphTooltip>
            </div>
          </div>
        </MorphTooltipProvider>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 5. 内容变化                                                           */
/* ------------------------------------------------------------------ */

const changeCode = `import { useRef, useState } from "react";
import { CheckIcon, CopyIcon, DownloadIcon } from "lucide-react";
import { MorphTooltip, MorphTooltipProvider } from "@/components/qiuye-ui/morph-tooltip";
import { Button } from "@/components/ui/button";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <MorphTooltip
      // 按下时不隐藏，内容变化时气泡原地形变
      closeOnClick={false}
      // 节点内容用 contentKey 标识「换了一条」，触发交叉淡入
      contentKey={copied ? "copied" : "copy"}
      content={
        copied ? (
          <span className="flex items-center gap-1">
            <CheckIcon className="size-3.5" />
            已复制
          </span>
        ) : (
          "复制链接"
        )
      }
    >
      <Button
        variant="outline"
        size="icon"
        aria-label="复制链接"
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </Button>
    </MorphTooltip>
  );
}

// 受控 + 原地更新：下载期间保持显示（被同组的其他提示接替后，它们关闭时会交还回来）；
// contentKey 不变时进度原地更新，尺寸变化时平滑形变
export function DownloadButton() {
  const [hovered, setHovered] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const done = progress === 100;

  const start = () => {
    setProgress(0);
    timer.current = setInterval(() => {
      setProgress((value) => {
        const next = Math.min(100, (value ?? 0) + 8);
        if (next === 100) {
          clearInterval(timer.current);
          setTimeout(() => setProgress(null), 1400);
        }
        return next;
      });
    }, 140);
  };

  return (
    <MorphTooltipProvider>
      <MorphTooltip
        open={progress !== null || hovered}
        onOpenChange={setHovered}
        closeOnClick={false}
        contentKey={done ? "done" : progress !== null ? "progress" : "idle"}
        content={done ? "下载完成" : progress !== null ? \`下载中 \${progress}%\` : "下载安装包"}
      >
        <Button variant="outline" onClick={start}>
          <DownloadIcon />
          下载
        </Button>
      </MorphTooltip>
    </MorphTooltipProvider>
  );
}`;

function ContentChangeDemo() {
  const [copied, setCopied] = useState(false);
  const [starred, setStarred] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [hovered, setHovered] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const downloadTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(
    () => () => {
      clearTimeout(copyTimer.current);
      clearInterval(downloadTimer.current);
    },
    [],
  );

  const startDownload = () => {
    if (phase === "running") return;
    clearInterval(downloadTimer.current);
    setProgress(0);
    setPhase("running");
    let value = 0;
    downloadTimer.current = setInterval(() => {
      value = Math.min(100, value + 3 + Math.round(Math.random() * 7));
      setProgress(value);
      if (value >= 100) {
        clearInterval(downloadTimer.current);
        setPhase("done");
        downloadTimer.current = setTimeout(() => setPhase("idle"), 1400);
      }
    }, 140);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>内容变化</CardTitle>
          <ViewSourceButton code={changeCode} />
        </div>
        <CardDescription>
          这些按钮设置了 <code>closeOnClick=&#123;false&#125;</code>
          {
            "：点击后气泡不消失，内容换成新的一条时原地交叉淡入、变形尺寸，并播报给读屏软件。「下载」是受控的：下载期间一直显示（悬停别的按钮后，回来仍会显示），进度在同一条内容里原地更新。"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MorphTooltipProvider>
          <div className="flex flex-wrap items-center gap-2">
            <MorphTooltip
              closeOnClick={false}
              contentKey={copied ? "copied" : "copy"}
              content={
                copied ? (
                  <span className="flex items-center gap-1">
                    <CheckIcon className="size-3.5 text-emerald-400" strokeWidth={2.6} />
                    已复制
                  </span>
                ) : (
                  "复制链接"
                )
              }
            >
              <Button
                variant="outline"
                size="icon"
                aria-label="复制链接"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
                  setCopied(true);
                  clearTimeout(copyTimer.current);
                  copyTimer.current = setTimeout(() => setCopied(false), 1600);
                }}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </Button>
            </MorphTooltip>
            <MorphTooltip closeOnClick={false} content={starred ? "取消收藏" : "收藏"} shortcut="S">
              <Button
                variant="outline"
                size="icon"
                aria-label="收藏"
                aria-pressed={starred}
                onClick={() => setStarred((value) => !value)}
              >
                <StarIcon
                  className={cn(
                    "transition-[color,fill,scale] duration-200",
                    starred && "scale-110 fill-amber-400 text-amber-400",
                  )}
                />
              </Button>
            </MorphTooltip>
            <MorphTooltip closeOnClick={false} content={muted ? "取消静音" : "静音"} shortcut="M">
              <Button
                variant="outline"
                size="icon"
                aria-label="静音"
                aria-pressed={muted}
                onClick={() => setMuted((value) => !value)}
              >
                {muted ? <VolumeXIcon /> : <Volume2Icon />}
              </Button>
            </MorphTooltip>
            <MorphTooltip
              open={phase !== "idle" || hovered}
              onOpenChange={setHovered}
              closeOnClick={false}
              contentKey={phase === "done" ? "done" : phase === "running" ? "progress" : "idle"}
              content={
                phase === "done" ? (
                  <span className="flex items-center gap-1">
                    <CheckIcon className="size-3.5 text-emerald-400" strokeWidth={2.6} />
                    下载完成
                  </span>
                ) : phase === "running" ? (
                  <span className="flex items-center gap-2">
                    <span className="tabular-nums">下载中 {progress}%</span>
                    <span className="relative h-1 w-16 overflow-hidden rounded-full bg-current/20">
                      <span
                        className="absolute inset-y-0 left-0 rounded-full bg-current transition-[width] duration-150 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </span>
                  </span>
                ) : (
                  "下载安装包 · 24.6 MB"
                )
              }
            >
              <Button variant="outline" onClick={startDownload}>
                <DownloadIcon />
                下载
              </Button>
            </MorphTooltip>
          </div>
        </MorphTooltipProvider>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 6. 范围                                                               */
/* ------------------------------------------------------------------ */

const scopeCode = `import { MorphTooltip, MorphTooltipProvider } from "@/components/qiuye-ui/morph-tooltip";
import { Button } from "@/components/ui/button";

export function Scopes() {
  return (
    <>
      {/* 两个相邻的 Provider：各自一个气泡、各自计时，从左组移到右组时左边的气泡退场、右边重新等待 */}
      <div className="flex gap-3">
        <MorphTooltipProvider>{/* 左组按钮 */}</MorphTooltipProvider>
        <MorphTooltipProvider>{/* 右组按钮 */}</MorphTooltipProvider>
      </div>

      {/* 没有 Provider：每个 MorphTooltip 自成一个范围，各自出现与消失，不会滑动 */}
      <MorphTooltip content="独立的提示">
        <Button>…</Button>
      </MorphTooltip>
    </>
  );
}

// 整个应用一个范围：在应用外层包一层（节点内容读取的是触发元素处的 Context，放在哪一层都可以）
export function Providers({ children }: { children: React.ReactNode }) {
  return <MorphTooltipProvider>{children}</MorphTooltipProvider>;
}`;

function ScopeGroup({ items }: { items: Array<{ label: string; icon: LucideIcon }> }) {
  return (
    <div className="flex items-center gap-0.5 rounded-xl border bg-background p-1">
      {items.map((item) => (
        <MorphTooltip key={item.label} content={item.label}>
          <Button variant="ghost" size="icon-sm" aria-label={item.label}>
            <item.icon />
          </Button>
        </MorphTooltip>
      ))}
    </div>
  );
}

const SCOPE_LEFT = [
  { label: "文件", icon: FolderIcon },
  { label: "搜索", icon: SearchIcon },
  { label: "邮件", icon: MailIcon },
];
const SCOPE_RIGHT = [
  { label: "日历", icon: CalendarDaysIcon },
  { label: "音乐", icon: MusicIcon },
  { label: "设置", icon: SettingsIcon },
];
const SCOPE_ALONE = [
  { label: "加粗", icon: BoldIcon },
  { label: "斜体", icon: ItalicIcon },
  { label: "下划线", icon: UnderlineIcon },
];

function ScopeDemo() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>范围</CardTitle>
          <ViewSourceButton code={scopeCode} />
        </div>
        <CardDescription>
          {
            "气泡只在同一个 Provider 里共享。相邻的两个 Provider 互不影响；没有 Provider 的提示各自成一个范围，每次都重新等待，也不会在元素之间滑动。"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-3">
            <MorphTooltipProvider>
              <ScopeGroup items={SCOPE_LEFT} />
            </MorphTooltipProvider>
            <MorphTooltipProvider>
              <ScopeGroup items={SCOPE_RIGHT} />
            </MorphTooltipProvider>
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            两个相邻的 Provider：组内滑动，跨组时重新出现
          </p>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center gap-0.5 self-start rounded-xl border bg-background p-1 sm:w-fit">
            {SCOPE_ALONE.map((item) => (
              <MorphTooltip key={item.label} content={item.label}>
                <Button variant="ghost" size="icon-sm" aria-label={item.label}>
                  <item.icon />
                </Button>
              </MorphTooltip>
            ))}
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            没有 Provider：每个提示独立出现与消失
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 7. 参数调试                                                           */
/* ------------------------------------------------------------------ */

interface PlaygroundConfig {
  delay: number;
  skipDelayDuration: number;
  closeDelay: number;
  morph: boolean;
  side: MorphTooltipSide;
  align: MorphTooltipAlign;
  sideOffset: number;
  arrow: boolean;
  variant: MorphTooltipVariant;
  maxWidth: number;
  hoverable: boolean;
}

const PLAYGROUND_DEFAULTS: PlaygroundConfig = {
  delay: DEFAULT_MORPH_TOOLTIP_OPTIONS.delay,
  skipDelayDuration: DEFAULT_MORPH_TOOLTIP_OPTIONS.skipDelayDuration,
  closeDelay: DEFAULT_MORPH_TOOLTIP_OPTIONS.closeDelay,
  morph: DEFAULT_MORPH_TOOLTIP_OPTIONS.morph,
  side: DEFAULT_MORPH_TOOLTIP_OPTIONS.side,
  align: DEFAULT_MORPH_TOOLTIP_OPTIONS.align,
  sideOffset: DEFAULT_MORPH_TOOLTIP_OPTIONS.sideOffset,
  arrow: DEFAULT_MORPH_TOOLTIP_OPTIONS.arrow,
  variant: DEFAULT_MORPH_TOOLTIP_OPTIONS.variant,
  maxWidth: DEFAULT_MORPH_TOOLTIP_OPTIONS.maxWidth,
  hoverable: DEFAULT_MORPH_TOOLTIP_OPTIONS.hoverable,
};

const PLAYGROUND_ITEMS: Array<{ label: string; icon: LucideIcon; shortcut?: string }> = [
  { label: "撤销", icon: Undo2Icon, shortcut: "⌘Z" },
  { label: "加粗", icon: BoldIcon, shortcut: "⌘B" },
  { label: "插入链接", icon: LinkIcon, shortcut: "⌘K" },
  { label: "居中", icon: AlignCenterIcon },
  { label: "复制", icon: CopyIcon, shortcut: "⌘C" },
  { label: "设置", icon: SettingsIcon },
];

const PLAYGROUND_LONG_TEXT =
  "这是一段较长的说明文字，用来观察最大宽度与换行：超过 maxWidth 时自动换行，气泡收窄到最长的一行。";

function ParamSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span>{label}</span>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {value}
          {unit}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([next]) => onChange(next)}
        aria-label={label}
      />
    </div>
  );
}

function PlaygroundDemo() {
  const [config, setConfig] = useState(PLAYGROUND_DEFAULTS);
  const update = (patch: Partial<PlaygroundConfig>) =>
    setConfig((current) => ({ ...current, ...patch }));

  const providerProps = (
    [
      ["delay", `{${config.delay}}`],
      ["skipDelayDuration", `{${config.skipDelayDuration}}`],
      ["closeDelay", `{${config.closeDelay}}`],
      ["morph", config.morph ? null : "{false}"],
      ["side", `"${config.side}"`],
      ["align", `"${config.align}"`],
      ["sideOffset", `{${config.sideOffset}}`],
      ["arrow", config.arrow ? "" : null],
      ["variant", `"${config.variant}"`],
      ["maxWidth", `{${config.maxWidth}}`],
      ["hoverable", config.hoverable ? null : "{false}"],
    ] as const
  ).filter(([key, value]) => {
    if (value === null) return false;
    if (key === "morph" || key === "arrow" || key === "hoverable") return true;
    return config[key] !== PLAYGROUND_DEFAULTS[key];
  });

  const code = [
    `import { BoldIcon } from "lucide-react";`,
    `import { MorphTooltip, MorphTooltipProvider } from "@/components/qiuye-ui/morph-tooltip";`,
    `import { Button } from "@/components/ui/button";`,
    ``,
    `export function Toolbar() {`,
    `  return (`,
    providerProps.length
      ? `    <MorphTooltipProvider\n${providerProps
          .map(([key, value]) => (value === "" ? `      ${key}` : `      ${key}=${value}`))
          .join("\n")}\n    >`
      : `    <MorphTooltipProvider>`,
    `      <MorphTooltip content="加粗" shortcut="⌘B">`,
    `        <Button variant="ghost" size="icon" aria-label="加粗">`,
    `          <BoldIcon />`,
    `        </Button>`,
    `      </MorphTooltip>`,
    `      {/* ... */}`,
    `    </MorphTooltipProvider>`,
    `  );`,
    `}`,
  ].join("\n");

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>参数调试</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setConfig(PLAYGROUND_DEFAULTS)}>
              <RotateCcwIcon className="size-3.5" />
              重置
            </Button>
            <ViewSourceButton code={code} description="按当前参数生成的用法。" />
          </div>
        </div>
        <CardDescription>
          {
            "实时调整范围的计时、方向与外观。把 closeDelay 调到 0 再快速扫过按钮，可以看到气泡在缝隙处先消失再出现；关闭 morph 后气泡仍是单例，但直接跳到新位置。"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="flex min-h-56 flex-col items-center justify-center gap-6 rounded-xl border border-dashed bg-muted/20 px-4 py-10">
          <MorphTooltipProvider
            delay={config.delay}
            skipDelayDuration={config.skipDelayDuration}
            closeDelay={config.closeDelay}
            morph={config.morph}
            side={config.side}
            align={config.align}
            sideOffset={config.sideOffset}
            arrow={config.arrow}
            variant={config.variant}
            maxWidth={config.maxWidth}
            hoverable={config.hoverable}
          >
            <div className="flex flex-wrap items-center justify-center gap-1 rounded-xl border bg-background p-1">
              {PLAYGROUND_ITEMS.map((item) => (
                <MorphTooltip key={item.label} content={item.label} shortcut={item.shortcut}>
                  <Button variant="ghost" size="icon-sm" aria-label={item.label}>
                    <item.icon />
                  </Button>
                </MorphTooltip>
              ))}
            </div>
            <MorphTooltip content={PLAYGROUND_LONG_TEXT}>
              <Button variant="outline" size="sm">
                长文本
              </Button>
            </MorphTooltip>
          </MorphTooltipProvider>
        </div>
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <span className="text-sm">方向 side</span>
            <SegmentedControl
              size="sm"
              fullWidth
              items={[
                { value: "top", label: "上" },
                { value: "right", label: "右" },
                { value: "bottom", label: "下" },
                { value: "left", label: "左" },
              ]}
              value={config.side}
              onValueChange={(value) => update({ side: value as MorphTooltipSide })}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm">对齐 align</span>
            <SegmentedControl
              size="sm"
              fullWidth
              items={[
                { value: "start", label: "start" },
                { value: "center", label: "center" },
                { value: "end", label: "end" },
              ]}
              value={config.align}
              onValueChange={(value) => update({ align: value as MorphTooltipAlign })}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm">配色 variant</span>
            <SegmentedControl
              size="sm"
              fullWidth
              items={[
                { value: "dark", label: "dark" },
                { value: "light", label: "light" },
                { value: "inverse", label: "inverse" },
              ]}
              value={config.variant}
              onValueChange={(value) => update({ variant: value as MorphTooltipVariant })}
            />
          </div>
          <ParamSlider
            label="首次等待 delay"
            value={config.delay}
            min={0}
            max={1200}
            step={50}
            unit="ms"
            onChange={(value) => update({ delay: value })}
          />
          <ParamSlider
            label="免等待窗口 skipDelayDuration"
            value={config.skipDelayDuration}
            min={0}
            max={2000}
            step={50}
            unit="ms"
            onChange={(value) => update({ skipDelayDuration: value })}
          />
          <ParamSlider
            label="隐藏延迟 closeDelay"
            value={config.closeDelay}
            min={0}
            max={600}
            step={10}
            unit="ms"
            onChange={(value) => update({ closeDelay: value })}
          />
          <ParamSlider
            label="距离 sideOffset"
            value={config.sideOffset}
            min={0}
            max={24}
            unit="px"
            onChange={(value) => update({ sideOffset: value })}
          />
          <ParamSlider
            label="最大宽度 maxWidth"
            value={config.maxWidth}
            min={120}
            max={400}
            step={10}
            unit="px"
            onChange={(value) => update({ maxWidth: value })}
          />
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="morph-tooltip-playground-morph">滑动形变 morph</Label>
            <Switch
              id="morph-tooltip-playground-morph"
              checked={config.morph}
              onCheckedChange={(checked) => update({ morph: checked })}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="morph-tooltip-playground-arrow">箭头 arrow</Label>
            <Switch
              id="morph-tooltip-playground-arrow"
              checked={config.arrow}
              onCheckedChange={(checked) => update({ arrow: checked })}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="morph-tooltip-playground-hoverable">可移入气泡 hoverable</Label>
            <Switch
              id="morph-tooltip-playground-hoverable"
              checked={config.hoverable}
              onCheckedChange={(checked) => update({ hoverable: checked })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 完整演示                                                              */
/* ------------------------------------------------------------------ */

/** MorphTooltip 完整演示 */
export function MorphTooltipDemo() {
  return (
    <div className="space-y-6">
      <EditorToolbarDemo />
      <ContributionHeatmapDemo />
      <PlacementDemo />
      <ContentStyleDemo />
      <ContentChangeDemo />
      <ScopeDemo />
      <PlaygroundDemo />
    </div>
  );
}
