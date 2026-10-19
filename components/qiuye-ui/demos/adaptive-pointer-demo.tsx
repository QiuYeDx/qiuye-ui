"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  AlignCenter,
  AlignLeft,
  Bold,
  Bookmark,
  Heart,
  Info,
  Italic,
  Link2,
  MoreHorizontal,
  MousePointer2,
  Redo2,
  RotateCcw,
  Send,
  Share2,
  Underline,
  Undo2,
  type LucideIcon,
} from "lucide-react";

import {
  AdaptivePointerArea,
  pointerTarget,
  useAdaptivePointerStatus,
  type AdaptivePointerStateInfo,
} from "@/components/qiuye-ui/adaptive-pointer";
import { SegmentedControl } from "@/components/qiuye-ui/segmented-control";
import { ViewSourceButton } from "@/components/view-source-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   示例代码                                  */
/* -------------------------------------------------------------------------- */

const labCode = `import {
  AdaptivePointerArea,
  pointerContent,
  pointerTarget,
} from "@/components/qiuye-ui/adaptive-pointer";

// 只在这块区域内生效（也覆盖它打开的菜单、对话框）
// 默认：单层指针、内容视差、正文 I 形竖条、静止 2 秒后隐藏；系统开启「减少动态效果」时用系统指针
<AdaptivePointerArea
  parallax={1}        // 阻尼偏移强度，0 关闭
  ring={false}        // 外环定位：开启后外环缩成小圆，1:1 标出真实位置
  contentParallax     // 图标按钮里的图标跟着板子轻微移动
  textBeam            // 正文上显示 I 形竖条
  autoHide={2000}     // 静止 2 秒后淡出，false 常驻
  className="rounded-2xl border p-6"
>
  <div role="toolbar" aria-label="格式" className="flex gap-0.5">
    <Button
      variant="ghost"
      size="icon"
      aria-label="加粗"
      // 圆角板存在时去掉按钮自带的 hover 背景，避免叠两层（深色主题的 ghost 变体要单独覆盖）
      className="data-[pointer-state=highlight]:hover:bg-transparent dark:data-[pointer-state=highlight]:hover:bg-transparent"
    >
      <BoldIcon />  {/* 只有图标的按钮默认带内容视差 */}
    </Button>
  </div>

  {/* 图标与文字混排时默认不移动；想让某个子元素参与，显式标记 */}
  <Button><SendIcon {...pointerContent()} />发布</Button>

  {/* 大卡片：高度超过 96px 自动判定为 hover，保持跟手的柔和圆，不变形 */}
  <a href="/posts/1" className="block h-32 rounded-xl border p-4">…</a>

  {/* 也可以显式指定效果 */}
  <button {...pointerTarget({ effect: "highlight", padding: [8, 4] })}>…</button>

  {/* 交还原生指针 */}
  <div data-pointer="native"><canvas /></div>

  {/* 不想显示 I 形竖条的子树 */}
  <figure data-pointer="none">…</figure>
</AdaptivePointerArea>`;

const compareCode = `<AdaptivePointerArea>…</AdaptivePointerArea>      // 默认：经典单层
<AdaptivePointerArea ring>…</AdaptivePointerArea> // 外环定位：外环 1:1 标出真实位置`;

const themeCode = `// 局部深色岛：令牌随 .dark 重新求值
<AdaptivePointerArea className="dark bg-background text-foreground">…</AdaptivePointerArea>

// 品牌色：覆盖 CSS 变量即可（也可以写在全局的 :root / .dark 里）
<AdaptivePointerArea
  className="[--adaptive-pointer-fill:var(--color-blue-500)] [--adaptive-pointer-ring:var(--color-blue-600)]"
>
  …
</AdaptivePointerArea>`;

/* -------------------------------------------------------------------------- */
/*                                   小组件                                    */
/* -------------------------------------------------------------------------- */

const TOOLBAR: Array<{ label: string; icon: LucideIcon; toggle?: boolean }> = [
  { label: "加粗", icon: Bold, toggle: true },
  { label: "斜体", icon: Italic, toggle: true },
  { label: "下划线", icon: Underline, toggle: true },
  { label: "链接", icon: Link2 },
];

const TOOLBAR_TAIL: Array<{ label: string; icon: LucideIcon }> = [
  { label: "左对齐", icon: AlignLeft },
  { label: "居中", icon: AlignCenter },
  { label: "撤销", icon: Undo2 },
  { label: "重做", icon: Redo2 },
];

/**
 * 圆角板存在时去掉 ghost 按钮自带的 hover 背景（只在板子真的吸附时生效）。
 * ghost 变体在深色主题下另有 `dark:hover:bg-muted/50`，优先级相同且写在后面，要用 dark 变体再覆盖一次。
 */
const PLATE_AWARE =
  "data-[pointer-state=highlight]:hover:bg-transparent dark:data-[pointer-state=highlight]:hover:bg-transparent";

/** 按下状态的切换按钮：悬停时也保持底色，否则点击后在板子下面看不出状态变化 */
const TOGGLE_ON = "bg-muted hover:bg-muted dark:bg-muted dark:hover:bg-muted";

function ToolbarButton({
  label,
  icon: Icon,
  pressed,
  onToggle,
}: {
  label: string;
  icon: LucideIcon;
  pressed?: boolean;
  onToggle?: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onToggle}
      className={pressed ? TOGGLE_ON : PLATE_AWARE}
    >
      <Icon />
    </Button>
  );
}

function Toolbar({ short = false }: { short?: boolean }) {
  const [active, setActive] = useState<Record<string, boolean>>({
    加粗: true,
  });
  return (
    <div
      role="toolbar"
      aria-label="格式"
      className="flex w-fit max-w-full flex-wrap items-center gap-0.5 rounded-xl border bg-background p-1 shadow-xs"
    >
      {TOOLBAR.map((item) => (
        <ToolbarButton
          key={item.label}
          label={item.label}
          icon={item.icon}
          pressed={item.toggle ? !!active[item.label] : undefined}
          onToggle={
            item.toggle
              ? () =>
                  setActive((current) => ({
                    ...current,
                    [item.label]: !current[item.label],
                  }))
              : undefined
          }
        />
      ))}
      {!short && (
        <>
          <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
          {TOOLBAR_TAIL.map((item) => (
            <ToolbarButton
              key={item.label}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </>
      )}
    </div>
  );
}

/** 场景卡片：标题 + 一句说明 + 内容 */
function Scene({
  title,
  hint,
  className,
  children,
}: {
  title: string;
  hint: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4",
        className,
      )}
    >
      <div className="space-y-0.5">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-xs leading-5 text-muted-foreground">{hint}</p>
      </div>
      {children}
    </section>
  );
}

const preventDefault = (event: React.MouseEvent) => event.preventDefault();

function ParamSlider({
  label,
  value,
  min,
  max,
  step,
  format = (next) => String(next),
  disabled = false,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (value: number) => string;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className={cn("space-y-2", disabled && "opacity-50")}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span>{label}</span>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {format(value)}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([next]) => onChange(next)}
        disabled={disabled}
        aria-label={label}
      />
    </div>
  );
}

function SwitchRow({
  id,
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor={id} className="flex-col items-start gap-0.5">
        <span>{label}</span>
        {hint && (
          <span className="text-xs font-normal text-muted-foreground">
            {hint}
          </span>
        )}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

const STATE_LABELS: Record<AdaptivePointerStateInfo["state"], string> = {
  inactive: "未激活",
  hidden: "已隐藏",
  native: "原生指针",
  idle: "静止圆",
  pending: "高速掠过",
  highlight: "圆角板",
  lift: "上浮",
  hover: "柔和圆",
  text: "I 形竖条",
};

function describeTarget(target: Element | null) {
  if (!target) return "";
  const label = target.getAttribute("aria-label");
  if (label) return label;
  // 开关、单选等没有自身文字的控件，取关联的 <label>。
  const labelled =
    target instanceof HTMLButtonElement || target instanceof HTMLInputElement
      ? (target.labels?.[0] ?? null)
      : null;
  const source = target.textContent?.trim() ? target : (labelled ?? target);
  // 只取第一行可见文字：开关的 Label 里还带着一行说明，全部拼上去太长。
  const rendered =
    source instanceof HTMLElement ? source.innerText : source.textContent;
  const text = rendered?.trim().split("\n")[0]?.trim().replace(/\s+/g, " ");
  if (text) return text.length > 16 ? `${text.slice(0, 16)}…` : text;
  return target.tagName.toLowerCase();
}

type StateSubscribe = (
  listener: (info: AdaptivePointerStateInfo) => void,
) => () => void;

const INITIAL_INFO: AdaptivePointerStateInfo = {
  state: "inactive",
  target: null,
  pressed: false,
};

/** 状态读数：订阅 onStateChange，只重渲染自己 */
function StateReadout({
  subscribe,
  floating = false,
}: {
  subscribe: StateSubscribe;
  /** 浮在视口底部：只在指针位于实验台内时出现，滚到下方的场景时也能看到读数 */
  floating?: boolean;
}) {
  const [info, setInfo] = useState<AdaptivePointerStateInfo>(INITIAL_INFO);
  useEffect(() => subscribe(setInfo), [subscribe]);
  const target = describeTarget(info.target);
  const away = info.state === "inactive" || info.state === "hidden";
  return (
    // 固定为单行、固定高度：目标名称长短不一，换行会让整个控制面板跟着上下跳动。
    <div
      className={cn(
        "flex h-9 items-center gap-1.5 overflow-hidden rounded-lg border bg-muted/40 px-2.5 font-mono text-xs whitespace-nowrap",
        floating &&
          "pointer-events-none fixed bottom-4 left-1/2 z-40 max-w-[calc(100vw-2rem)] -translate-x-1/2 bg-background/90 shadow-lg backdrop-blur transition-opacity duration-200 motion-reduce:transition-none",
        floating && away && "opacity-0",
      )}
      aria-hidden={floating || undefined}
      aria-live="off"
    >
      <Badge
        variant={info.state === "highlight" ? "default" : "secondary"}
        className="shrink-0"
      >
        {STATE_LABELS[info.state]}
      </Badge>
      <span className="min-w-0 flex-1 truncate text-muted-foreground">
        {target}
      </span>
      {info.pressed && (
        <Badge variant="outline" className="shrink-0">
          按下
        </Badge>
      )}
    </div>
  );
}

/** 用 Motion 由 JS 往返移动的按钮：静止指针下的目标移动靠轮询发现，板子刚性跟随 */
function DriftingButton() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="w-fit"
      animate={reduceMotion ? undefined : { x: [0, 56, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <Button variant="outline" size="sm">
        移动中的按钮
      </Button>
    </motion.div>
  );
}

/** 点击后移除自己、1 秒后恢复：每帧检查目标是否还在文档里，被移除时立即脱离 */
function VanishingButton() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (visible) return;
    const timer = window.setTimeout(() => setVisible(true), 1000);
    return () => window.clearTimeout(timer);
  }, [visible]);
  return (
    <div className="flex h-7 items-center">
      {visible ? (
        <Button variant="secondary" size="sm" onClick={() => setVisible(false)}>
          点我消失
        </Button>
      ) : (
        <span className="text-xs text-muted-foreground">1 秒后回来…</span>
      )}
    </div>
  );
}

const IFRAME_DOC = `<!doctype html><html><body style="margin:0;display:grid;place-items:center;height:100vh;font:12px system-ui;color:#737373;background:transparent">iframe 内由系统指针负责</body></html>`;

/* -------------------------------------------------------------------------- */
/*                                  交互实验台                                 */
/* -------------------------------------------------------------------------- */

const ENABLED_KEY = "qiuye-ui:adaptive-pointer-demo-enabled";

interface LabOptions {
  enabled: boolean;
  ring: boolean;
  parallax: number;
  size: number;
  ringSize: number;
  ringWidth: number;
  content: boolean;
  text: boolean;
  autoHide: boolean;
  slow: boolean;
}

/** 与组件默认值一致 */
const LAB_DEFAULTS: LabOptions = {
  enabled: true,
  ring: false,
  parallax: 1,
  size: 20,
  ringSize: 8,
  ringWidth: 1.5,
  content: true,
  text: true,
  autoHide: true,
  slow: false,
};

function PointerLab() {
  const [options, setOptions] = useState(LAB_DEFAULTS);
  const set = <K extends keyof LabOptions>(key: K, value: LabOptions[K]) =>
    setOptions((current) => ({ ...current, [key]: value }));

  // 示范「使用系统指针」偏好：由应用自己持久化，组件不读 localStorage。
  useEffect(() => {
    try {
      if (window.localStorage.getItem(ENABLED_KEY) === "false") {
        setOptions((current) => ({ ...current, enabled: false }));
      }
    } catch {
      // 隐私模式等情况下读不到，保持默认
    }
  }, []);
  const setEnabled = (enabled: boolean) => {
    set("enabled", enabled);
    try {
      window.localStorage.setItem(ENABLED_KEY, String(enabled));
    } catch {
      // 忽略
    }
  };

  const listenersRef = useRef(
    new Set<(info: AdaptivePointerStateInfo) => void>(),
  );
  const subscribe = useCallback<StateSubscribe>((listener) => {
    const listeners = listenersRef.current;
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  const onStateChange = useCallback((info: AdaptivePointerStateInfo) => {
    listenersRef.current.forEach((listener) => listener(info));
  }, []);

  const [tab, setTab] = useState("week");
  const [segment, setSegment] = useState("list");
  const [radio, setRadio] = useState("auto");
  const [checked, setChecked] = useState(true);
  const [switchOn, setSwitchOn] = useState(true);
  const [volume, setVolume] = useState(40);

  return (
    <AdaptivePointerArea
      disabled={!options.enabled}
      ring={options.ring}
      parallax={options.parallax}
      size={options.size}
      ringSize={options.ringSize}
      ringWidth={options.ringWidth}
      contentParallax={options.content}
      textBeam={options.text}
      autoHide={options.autoHide ? 2000 : false}
      timeScale={options.slow ? 0.25 : 1}
      onStateChange={onStateChange}
      className="grid gap-4 rounded-2xl border bg-muted/30 p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_17rem]"
    >
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <Scene
          title="工具栏"
          hint="相邻按钮之间直接滑行，不回缩成圆；缝隙里外环立即恢复。"
          className="sm:col-span-2"
        >
          <Toolbar />
        </Scene>

        <Scene title="分段与标签" hint="tablist 自动成组，板子贴合当前选项。">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="day">日</TabsTrigger>
              <TabsTrigger value="week">周</TabsTrigger>
              <TabsTrigger value="month">月</TabsTrigger>
            </TabsList>
          </Tabs>
          <SegmentedControl
            size="sm"
            aria-label="视图"
            items={[
              { value: "list", label: "列表" },
              { value: "grid", label: "网格" },
              { value: "board", label: "看板" },
            ]}
            value={segment}
            onValueChange={setSegment}
          />
        </Scene>

        <Scene
          title="正文与链接"
          hint={
            options.text
              ? "正文上是吸附到行的 I 形竖条，行尾空白处恢复圆形；折行的链接只贴合指针所在的那一段。"
              : "行内链接外扩 4×2；折行的链接贴合指针所在的那一段。"
          }
        >
          <p className="max-w-[17rem] text-sm leading-6 text-muted-foreground">
            指针落在{" "}
            <a
              href="#"
              onClick={preventDefault}
              className="font-medium text-foreground underline underline-offset-4"
            >
              链接
            </a>{" "}
            上时，填充层变成垫在下方的圆角板；遇到{" "}
            <a
              href="#"
              onClick={preventDefault}
              className="font-medium text-foreground underline underline-offset-4"
            >
              一条刻意写得很长、会折到下一行的链接
            </a>
            ，板子只贴合当前那一段。
          </p>
        </Scene>

        <Scene
          title="按钮与控件"
          hint="不透明按钮外扩一圈光边；禁用控件保持大外环，诚实地表示不可点击。"
          className="sm:col-span-2"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Button>保存</Button>
            <Button variant="outline">取消</Button>
            <Button variant="secondary">草稿</Button>
            <Button variant="ghost" className={PLATE_AWARE}>
              更多
            </Button>
            <Button variant="link">了解更多</Button>
            <Button
              {...pointerTarget({ effect: "lift" })}
              className="data-[pointer-state=lift]:scale-[1.04] data-[pointer-state=lift]:shadow-lg"
            >
              <Send data-icon="inline-start" />
              发布（lift）
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" disabled>
              禁用
            </Button>
            <Button
              variant="outline"
              aria-disabled="true"
              onClick={preventDefault}
              className="opacity-50"
            >
              aria-disabled
            </Button>
            <button
              type="button"
              disabled
              className="h-8 rounded-lg border px-2.5 text-sm text-muted-foreground opacity-60"
            >
              原生 disabled
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <Switch
                id="ap-switch"
                checked={switchOn}
                onCheckedChange={setSwitchOn}
              />
              <Label htmlFor="ap-switch">开关</Label>
            </div>
            <RadioGroup
              aria-label="模式"
              value={radio}
              onValueChange={setRadio}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="auto" id="ap-radio-auto" />
                <Label htmlFor="ap-radio-auto">自动</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="manual" id="ap-radio-manual" />
                <Label htmlFor="ap-radio-manual">手动</Label>
              </div>
            </RadioGroup>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => setChecked(event.target.checked)}
                className="size-4 accent-foreground"
              />
              原生复选框
            </label>
            <div className="flex w-40 items-center gap-3">
              <Slider
                value={[volume]}
                onValueChange={([next]) => setVolume(next)}
                aria-label="音量"
              />
            </div>
          </div>
        </Scene>

        <Scene
          title="大卡片"
          hint="高或面积超过阈值的目标只显示跟手的柔和圆；叠在卡片上的按钮直接切换为圆角板。"
          className="sm:col-span-2"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href="#"
              onClick={preventDefault}
              className="flex h-32 flex-col justify-between rounded-xl border bg-background p-4"
            >
              <span className="text-sm font-medium">整张卡片是链接</span>
              <span className="text-xs text-muted-foreground">
                高 128px，超过 96px 自动判定为 hover
              </span>
            </a>
            {/* 按钮与链接是兄弟节点、叠放在卡片上，而不是嵌在链接里（交互元素不能互相嵌套） */}
            <div className="relative">
              <a
                href="#"
                onClick={preventDefault}
                className="flex h-32 flex-col justify-between rounded-xl border bg-background p-4"
              >
                <span className="text-sm font-medium">卡片上叠着按钮</span>
                <span className="text-xs text-muted-foreground">
                  移到右上角的按钮上试试
                </span>
              </a>
              <div className="absolute top-2 right-2 flex gap-0.5">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="收藏"
                  className={PLATE_AWARE}
                >
                  <Heart />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="分享"
                  className={PLATE_AWARE}
                >
                  <Share2 />
                </Button>
              </div>
            </div>
          </div>
        </Scene>

        <Scene
          title="表单与原生区"
          hint="输入框用原生 I 形光标；原生区、语义光标与 iframe 交还系统指针。"
        >
          <Input placeholder="原生 I 形光标" aria-label="示例输入框" />
          <Textarea
            rows={2}
            placeholder="多行文本同样是原生光标"
            aria-label="示例多行输入框"
          />
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div
              data-pointer="native"
              className="flex h-16 items-center justify-center rounded-lg border border-dashed text-center"
            >
              data-pointer
              <br />= native
            </div>
            <div className="flex h-16 cursor-crosshair items-center justify-center rounded-lg border bg-[radial-gradient(circle,var(--border)_1px,transparent_1px)] [background-size:10px_10px] text-center">
              cursor-crosshair
            </div>
          </div>
          {/* 与站点主题无关地固定为浅色方案：两边方案不同时浏览器会给 iframe 垫一层不透明白底 */}
          <iframe
            title="iframe 示例"
            srcDoc={IFRAME_DOC}
            className="h-12 w-full rounded-lg border [color-scheme:light]"
          />
        </Scene>

        <Scene
          title="浮层"
          hint="局部作用域也覆盖 Portal 出去的菜单与对话框；菜单项自带高亮，改用柔和圆。"
        >
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal data-icon="inline-start" />
                  菜单
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent data-pointer-default="hover">
                <DropdownMenuItem>新建文档</DropdownMenuItem>
                <DropdownMenuItem>复制链接</DropdownMenuItem>
                <DropdownMenuItem>移动到…</DropdownMenuItem>
                <DropdownMenuItem disabled>归档（禁用）</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">删除</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Select defaultValue="medium">
              <SelectTrigger size="sm" aria-label="字号">
                <SelectValue />
              </SelectTrigger>
              <SelectContent data-pointer-default="hover">
                <SelectItem value="small">小号</SelectItem>
                <SelectItem value="medium">中号</SelectItem>
                <SelectItem value="large">大号</SelectItem>
              </SelectContent>
            </Select>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  对话框
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>浮层里同样生效</DialogTitle>
                  <DialogDescription>
                    对话框渲染在 body 下，但仍属于这块区域的 React 子树。
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">稍后</Button>
                  <Button>好的</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="说明"
                  className={PLATE_AWARE}
                >
                  <Info />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Tooltip 不影响指针</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* 预留往返平移的距离，避免移动中的按钮盖住旁边的按钮 */}
            <div className="pr-14">
              <DriftingButton />
            </div>
            <VanishingButton />
          </div>
        </Scene>

        <Scene
          title="滚动列表"
          hint="停住指针再滚动：外环每帧如实，板子与容器边缘求交、不会溢出。"
          className="sm:col-span-2"
        >
          <ScrollArea className="h-44 rounded-lg border bg-background">
            <div className="flex flex-col p-1">
              {Array.from({ length: 16 }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  // 宽屏下整行面积会超过大目标阈值，显式指定圆角板，演示与容器求交
                  {...pointerTarget({ effect: "highlight" })}
                  className="flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-left text-sm"
                >
                  <Bookmark className="size-3.5 text-muted-foreground" />第{" "}
                  {index + 1} 条收藏
                </button>
              ))}
            </div>
          </ScrollArea>
        </Scene>
      </div>

      <aside className="flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-4 lg:self-start">
        <div className="space-y-1.5">
          <span className="text-xs text-muted-foreground">当前形态</span>
          <StateReadout subscribe={subscribe} />
          <StateReadout subscribe={subscribe} floating />
        </div>
        <SwitchRow
          id="ap-enabled"
          label="启用"
          hint="示范「使用系统指针」偏好"
          checked={options.enabled}
          onCheckedChange={setEnabled}
        />
        <SwitchRow
          id="ap-ring"
          label="外环定位"
          hint="外环缩成小圆标出真实位置；关闭即 Apple 经典单层"
          checked={options.ring}
          onCheckedChange={(value) => set("ring", value)}
        />
        <ParamSlider
          label="偏移强度"
          value={options.parallax}
          min={0}
          max={2}
          step={0.1}
          format={(value) => `×${value.toFixed(1)}`}
          onChange={(value) => set("parallax", value)}
        />
        <ParamSlider
          label="指针直径"
          value={options.size}
          min={14}
          max={28}
          step={2}
          format={(value) => `${value}px`}
          onChange={(value) => set("size", value)}
        />
        <ParamSlider
          label="外环小圆"
          disabled={!options.ring}
          value={options.ringSize}
          min={4}
          max={12}
          step={2}
          format={(value) => `${value}px`}
          onChange={(value) => set("ringSize", value)}
        />
        <ParamSlider
          label="描边宽度"
          disabled={!options.ring}
          value={options.ringWidth}
          min={1}
          max={3}
          step={0.5}
          format={(value) => `${value}px`}
          onChange={(value) => set("ringWidth", value)}
        />
        <SwitchRow
          id="ap-content"
          label="内容视差"
          hint="图标按钮里的图标跟着板子轻微移动"
          checked={options.content}
          onCheckedChange={(value) => set("content", value)}
        />
        <SwitchRow
          id="ap-text"
          label="正文 I 形竖条"
          checked={options.text}
          onCheckedChange={(value) => set("text", value)}
        />
        <SwitchRow
          id="ap-autohide"
          label="静止 2 秒后隐藏"
          checked={options.autoHide}
          onCheckedChange={(value) => set("autoHide", value)}
        />
        <SwitchRow
          id="ap-slow"
          label="慢动作 ¼"
          hint="观察填充层的变形、偏移与回弹"
          checked={options.slow}
          onCheckedChange={(value) => set("slow", value)}
        />
        <p className="text-xs leading-5 text-muted-foreground">
          系统开启「减少动态效果」时自动改用系统指针。
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setOptions({ ...LAB_DEFAULTS, enabled: options.enabled })
          }
        >
          <RotateCcw data-icon="inline-start" />
          恢复默认
        </Button>
      </aside>
    </AdaptivePointerArea>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    导出                                     */
/* -------------------------------------------------------------------------- */

function TouchNotice() {
  const { supported } = useAdaptivePointerStatus();
  if (supported !== false) return null;
  return (
    <div className="flex items-start gap-2 rounded-lg border border-dashed bg-muted/40 p-3 text-sm text-muted-foreground">
      <MousePointer2 className="mt-0.5 size-4 shrink-0" />
      <p>
        自适应指针需要鼠标或触控板，并且系统没有开启「减少动态效果」；否则保持系统指针，下面的控件照常可用。
      </p>
    </div>
  );
}

/** 首页与详情快速预览：工具栏、分段标签与一行链接，指针只在本区域内生效。 */
export function AdaptivePointerPreview() {
  const { supported } = useAdaptivePointerStatus();
  return (
    <AdaptivePointerArea className="flex w-full flex-col items-center justify-center gap-3 rounded-xl p-2">
      <Toolbar short />
      <Tabs defaultValue="week">
        <TabsList>
          <TabsTrigger value="day">日</TabsTrigger>
          <TabsTrigger value="week">周</TabsTrigger>
          <TabsTrigger value="month">月</TabsTrigger>
        </TabsList>
      </Tabs>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MousePointer2 className="size-3.5" aria-hidden="true" />
        {supported === false ? (
          "当前使用系统指针"
        ) : (
          <span>
            把指针移到按钮或
            <a
              href="#"
              onClick={preventDefault}
              className="mx-0.5 text-foreground underline underline-offset-4"
            >
              链接
            </a>
            上
          </span>
        )}
      </p>
    </AdaptivePointerArea>
  );
}

/** AdaptivePointer 完整演示：交互实验台、单层与双层对比、主题与品牌色定制。 */
export function AdaptivePointerDemo() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>交互实验台</CardTitle>
            <ViewSourceButton
              code={labCode}
              description="自适应指针只在 AdaptivePointerArea 内生效，站点其余部分保持原生指针。"
            />
          </div>
          <CardDescription>
            在下方区域内移动鼠标或触控板：悬停可点击元素时，淡灰填充层变形为垫在元素下方的圆角板，并朝指针做有阻尼的偏移；深灰外环缩成小圆，始终标出真实指针位置。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TouchNotice />
          <PointerLab />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>经典单层 vs 双层</CardTitle>
            <ViewSourceButton code={compareCode} />
          </div>
          <CardDescription>
            在两边的同一个按钮上缓慢移动：左边只知道「在哪个按钮上」，右边还能看见指针落在按钮的哪个位置。
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {[false, true].map((ring) => (
            <AdaptivePointerArea
              key={String(ring)}
              ring={ring}
              className="flex flex-col items-center gap-4 rounded-xl border bg-muted/30 px-4 py-6"
            >
              <span className="text-xs text-muted-foreground">
                {ring ? "外环定位：外环 1:1 标出真实位置" : "经典单层（默认）"}
              </span>
              <Toolbar short />
              <a
                href="#"
                onClick={preventDefault}
                className="text-sm font-medium underline underline-offset-4"
              >
                一个文字链接
              </a>
            </AdaptivePointerArea>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>主题与品牌色</CardTitle>
            <ViewSourceButton code={themeCode} />
          </div>
          <CardDescription>
            颜色全部来自 CSS
            变量：局部深色岛按区域重新求值，品牌色只需覆盖两个变量。
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <AdaptivePointerArea className="dark flex flex-col items-center gap-4 rounded-xl border bg-background px-4 py-6 text-foreground">
            <span className="text-xs text-muted-foreground">局部深色岛</span>
            <Toolbar short />
            <div className="flex gap-2">
              <Button size="sm">确认</Button>
              <Button size="sm" variant="outline">
                取消
              </Button>
            </div>
          </AdaptivePointerArea>
          <AdaptivePointerArea className="flex flex-col items-center gap-4 rounded-xl border bg-blue-500/5 px-4 py-6 [--adaptive-pointer-fill:var(--color-blue-500)] [--adaptive-pointer-ring:var(--color-blue-600)] dark:[--adaptive-pointer-ring:var(--color-blue-400)]">
            <span className="text-xs text-muted-foreground">品牌色</span>
            <Toolbar short />
            <div className="flex gap-2">
              <Button size="sm" variant="secondary">
                订阅
              </Button>
              <Button size="sm" variant="ghost" className={PLATE_AWARE}>
                稍后
              </Button>
            </div>
          </AdaptivePointerArea>
        </CardContent>
      </Card>
    </div>
  );
}
