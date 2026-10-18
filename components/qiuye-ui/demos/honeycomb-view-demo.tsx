"use client";

import { useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  Activity,
  AlarmClock,
  AudioLines,
  Bell,
  Bike,
  BookOpen,
  Calculator,
  Calendar,
  Camera,
  Clock,
  CloudSun,
  Compass,
  Contact,
  Dumbbell,
  Flashlight,
  Footprints,
  Gauge,
  Globe,
  Headphones,
  Heart,
  HeartPulse,
  House,
  Image,
  Key,
  Leaf,
  Mail,
  Map,
  MessageCircle,
  Mic,
  Moon,
  Music,
  Navigation,
  Newspaper,
  Phone,
  Pill,
  Plane,
  Podcast,
  Radio,
  RotateCcw,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Sun,
  Thermometer,
  Timer,
  TreePine,
  Umbrella,
  Wallet,
  Waves,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";

import {
  HoneycombView,
  type HoneycombViewLayout,
  type HoneycombViewMode,
} from "@/components/qiuye-ui/honeycomb-view";
import { SegmentedControl } from "@/components/qiuye-ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ViewSourceButton } from "@/components/view-source-button";

interface DemoApp {
  id: string;
  name: string;
  icon: LucideIcon;
  /** 渐变的两个端点 */
  colors: [string, string];
}

const PALETTE: Array<[string, string]> = [
  ["#ff6b6b", "#e8364f"],
  ["#ffb648", "#ff7a1a"],
  ["#ffe066", "#f6b500"],
  ["#7be38b", "#24b14a"],
  ["#5fe0d2", "#0fa3a3"],
  ["#6cc4ff", "#1a7cf0"],
  ["#8f8bff", "#5a4fe8"],
  ["#d58bff", "#9c3fe0"],
  ["#ff8bc8", "#e8408f"],
  ["#c9ced6", "#8a929e"],
];

const APP_DEFS: Array<[string, LucideIcon]> = [
  ["时钟", Clock],
  ["活动", Activity],
  ["心率", HeartPulse],
  ["信息", MessageCircle],
  ["电话", Phone],
  ["邮件", Mail],
  ["天气", CloudSun],
  ["音乐", Music],
  ["地图", Map],
  ["日历", Calendar],
  ["相机", Camera],
  ["闹钟", AlarmClock],
  ["计时器", Timer],
  ["钱包", Wallet],
  ["设置", Settings],
  ["指南针", Compass],
  ["体能训练", Dumbbell],
  ["睡眠", Moon],
  ["正念", Wind],
  ["噪声", AudioLines],
  ["照片", Image],
  ["播客", Podcast],
  ["收音机", Radio],
  ["图书", BookOpen],
  ["计算器", Calculator],
  ["提醒事项", Bell],
  ["通讯录", Contact],
  ["手电筒", Flashlight],
  ["步数", Footprints],
  ["仪表", Gauge],
  ["世界时钟", Globe],
  ["耳机", Headphones],
  ["健康", Heart],
  ["家庭", House],
  ["钥匙", Key],
  ["自然", Leaf],
  ["语音备忘录", Mic],
  ["导航", Navigation],
  ["新闻", Newspaper],
  ["用药", Pill],
  ["航班", Plane],
  ["购物", ShoppingBag],
  ["精选", Sparkles],
  ["收藏", Star],
  ["日照", Sun],
  ["体温", Thermometer],
  ["户外", TreePine],
  ["降雨", Umbrella],
  ["潮汐", Waves],
  ["快捷指令", Zap],
  ["骑行", Bike],
];

const APPS: DemoApp[] = APP_DEFS.map(([name, icon], index) => ({
  id: `app-${index}`,
  name,
  icon,
  colors: PALETTE[(index * 7) % PALETTE.length],
}));

// 图标与打开转场的浮层共用同一套底色与高光，落地时两者逐像素一致。
const ICON_SHADE =
  "shadow-[inset_0_1px_0_rgb(255_255_255/0.35),inset_0_-2px_6px_rgb(0_0_0/0.18)]";
const iconBackground = (app: DemoApp) => ({
  backgroundImage: `linear-gradient(160deg, ${app.colors[0]}, ${app.colors[1]})`,
});

function AppIcon({ app, hidden = false }: { app: DemoApp; hidden?: boolean }) {
  const Icon = app.icon;
  return (
    <span
      className={`flex size-full items-center justify-center rounded-full text-white ${ICON_SHADE}`}
      style={{
        ...iconBackground(app),
        visibility: hidden ? "hidden" : undefined,
      }}
    >
      <Icon className="size-[46%]" strokeWidth={2.2} />
    </span>
  );
}

const watchCode = `const [open, setOpen] = useState<DemoApp | null>(null);

return (
  <div className="relative h-[360px] w-[300px] overflow-hidden rounded-[60px] bg-black">
    <HoneycombView
      className="size-full"
      mode={mode}          // "free" | "vertical"
      layout={layout}      // "spiral" | "grid"
      snap={snap}
      cornerRadius={60}
      itemSize={72}        // 视口宽度约为图标直径的 4 倍
      items={apps}
      getItemKey={(app) => app.id}
      getItemLabel={(app) => app.name}
      renderItem={(app) => <AppIcon app={app} />}
      onItemSelect={(app, index, element) => setOpen(app)}
    />
  </div>
);`;

const canvasCode = `<HoneycombView
  className="h-[420px] w-full rounded-2xl bg-muted/40"
  itemSize={72}
  gap={14}
  items={apps}
  renderItem={(app) => <AppIcon app={app} />}
/>`;

interface LaunchState {
  app: DemoApp;
  /** 图标相对表盘的矩形 */
  rect: { left: number; top: number; size: number };
  /** 打开时表盘的尺寸 */
  screen: { width: number; height: number };
}

/** 表盘与组件的可调参数（参数调试卡片使用） */
interface WatchConfig {
  width: number;
  height: number;
  radius: number;
  itemSize: number;
  gap: number;
  /** null 时使用组件默认值（itemSize） */
  edgeWidth: number | null;
  /** null 时使用组件默认值（0.4） */
  curvature: number | null;
  count: number;
}

// 按 watchOS 的比例：视口宽度约为图标直径的 4 倍（上下滚动时宽行 4 个、首行 3 个）。
const DEFAULT_CONFIG: WatchConfig = {
  width: 300,
  height: 360,
  radius: 60,
  itemSize: 72,
  gap: 10,
  edgeWidth: null,
  curvature: null,
  count: APPS.length,
};

const COMPACT_CONFIG: WatchConfig = {
  ...DEFAULT_CONFIG,
  width: 220,
  height: 264,
  radius: 46,
  itemSize: 53,
  gap: 7,
};

/** 与组件内部一致：edgeWidth 默认为 0.65 × itemSize。 */
const defaultEdgeWidth = (itemSize: number) => itemSize * 0.65;

const mix = (from: number, to: number, t: number) => from + (to - from) * t;

// 字形在进度 0.25–0.5 之间淡出、应用内容在 0.5–0.85 之间淡入：关闭时浮层还明显大于图标，
// 字形就已完全显现（落地前一直看得到图标），两者首尾相接，中间不会只剩底色。
const GLYPH_FADE = [0.25, 0.5] as const;
const CONTENT_FADE = [0.5, 0.85] as const;

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * 打开应用的浮层：同一个元素从图标长成应用。
 * - 形状：前段保持圆形（圆角 = 短边的一半），接近铺满时才收成屏幕圆角，读起来是「图标在长大」。
 * - 内容：图标字形与图标同为浮层宽度的 46%，随浮层放大并在前段淡出；应用内容在后段淡入。
 *   关闭时倒放：内容先淡出，字形在落地前完全显现，最后一帧与蜂窝中的原图标一致。
 */
function LaunchOverlay({
  launch,
  progress,
  radius,
  reducedMotion,
  onClose,
}: {
  launch: LaunchState;
  progress: MotionValue<number>;
  radius: number;
  reducedMotion: boolean;
  onClose: () => void;
}) {
  const { app, rect, screen } = launch;
  const Icon = app.icon;
  const box = (p: number) =>
    reducedMotion
      ? { left: 0, top: 0, width: screen.width, height: screen.height }
      : {
          left: mix(rect.left, 0, p),
          top: mix(rect.top, 0, p),
          width: mix(rect.size, screen.width, p),
          height: mix(rect.size, screen.height, p),
        };
  const left = useTransform(progress, (p) => box(p).left);
  const top = useTransform(progress, (p) => box(p).top);
  const width = useTransform(progress, (p) => box(p).width);
  const height = useTransform(progress, (p) => box(p).height);
  const borderRadius = useTransform(progress, (p) => {
    if (reducedMotion) return radius;
    const { width: w, height: h } = box(p);
    return mix(Math.min(w, h) / 2, radius, p * p);
  });
  // 减少动态效果时不做位移与缩放，只在原地淡入淡出。
  const opacity = useTransform(progress, (p) => (reducedMotion ? p : 1));
  const glyphOpacity = useTransform(
    progress,
    (p) => 1 - smoothstep(GLYPH_FADE[0], GLYPH_FADE[1], p),
  );
  const contentOpacity = useTransform(progress, (p) =>
    smoothstep(CONTENT_FADE[0], CONTENT_FADE[1], p),
  );
  const contentScale = useTransform(progress, (p) =>
    mix(0.92, 1, smoothstep(CONTENT_FADE[0], CONTENT_FADE[1], p)),
  );

  return (
    <motion.button
      type="button"
      aria-label={`关闭 ${app.name}`}
      className={`absolute cursor-pointer overflow-hidden text-white outline-none ${ICON_SHADE}`}
      style={{
        ...iconBackground(app),
        left,
        top,
        width,
        height,
        borderRadius,
        opacity,
      }}
      onClick={onClose}
    >
      <motion.span
        aria-hidden
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: glyphOpacity }}
      >
        <Icon style={{ width: "46%", height: "auto" }} strokeWidth={2.2} />
      </motion.span>
      <motion.span
        className="absolute inset-0 flex flex-col items-center justify-center gap-3"
        style={{ opacity: contentOpacity, scale: contentScale }}
      >
        <Icon className="size-14" strokeWidth={1.8} />
        <span className="text-lg font-semibold tracking-tight">{app.name}</span>
        <span className="text-xs text-white/70">轻点返回</span>
      </motion.span>
    </motion.button>
  );
}

/** 表盘外壳 + 打开应用的放大转场（演示 onItemSelect 第三个参数的用法） */
function WatchFrame({
  mode,
  layout,
  snap,
  compact = false,
  config = compact ? COMPACT_CONFIG : DEFAULT_CONFIG,
  showGuides = false,
  maxScreenWidth = "calc(100vw - 8.5rem)",
}: {
  mode: HoneycombViewMode;
  layout: HoneycombViewLayout;
  snap: boolean;
  compact?: boolean;
  config?: WatchConfig;
  /** 叠加显示满尺寸区域与小圆点渐近线 */
  showGuides?: boolean;
  /** 屏幕的最大宽度（CSS 长度），窄容器中等比缩小表盘 */
  maxScreenWidth?: string;
}) {
  const screenRef = useRef<HTMLDivElement>(null);
  const [launch, setLaunch] = useState<LaunchState | null>(null);
  // 打开到关闭落地前，蜂窝中的原图标一直隐藏：全程只有浮层这一个元素在变形。
  const [hiddenId, setHiddenId] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const { width, height, radius } = config;
  const edge = config.edgeWidth ?? defaultEdgeWidth(config.itemSize);
  // 与组件内部一致：渐近线距视口边缘 0.18 · edgeWidth。
  const inset = edge * 0.18;

  // 整个转场由一个进度值驱动：0 = 蜂窝中的图标，1 = 铺满屏幕的应用。
  // 浮层几何、字形与内容的透明度、蜂窝的放大都从它派生，开合互为镜像，中途可反向。
  const progress = useMotionValue(0);
  const runRef = useRef(0);
  const spring = reducedMotion
    ? { duration: 0.2, ease: "easeOut" as const }
    : { type: "spring" as const, duration: 0.5, bounce: 0 };

  const open = (app: DemoApp, element: HTMLElement) => {
    const screen = screenRef.current?.getBoundingClientRect();
    const icon = element.getBoundingClientRect();
    if (!screen) return;
    setHiddenId(app.id);
    setLaunch({
      app,
      rect: {
        left: icon.left - screen.left,
        top: icon.top - screen.top,
        size: icon.width,
      },
      screen: { width: screen.width, height: screen.height },
    });
    runRef.current++;
    animate(progress, 1, spring);
  };

  const close = () => {
    const run = ++runRef.current;
    animate(progress, 0, spring).then(() => {
      if (runRef.current !== run) return;
      // 落地后浮层与原图标逐像素一致，同一帧换回原图标。
      setLaunch(null);
      setHiddenId(null);
    });
  };

  const origin = launch
    ? `${launch.rect.left + launch.rect.size / 2}px ${launch.rect.top + launch.rect.size / 2}px`
    : "50% 50%";
  const zoomScale = useTransform(progress, (p) =>
    reducedMotion ? 1 : 1 + 1.4 * p,
  );
  const zoomOpacity = useTransform(progress, (p) => 1 - smoothstep(0, 0.7, p));

  return (
    <div
      className="shrink-0 rounded-[72px] bg-gradient-to-b from-neutral-700 to-neutral-900 p-3 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6),inset_0_1px_0_rgb(255_255_255/0.15)] dark:from-neutral-800 dark:to-neutral-950"
      style={{ borderRadius: radius + 12 }}
    >
      <div
        ref={screenRef}
        className="relative overflow-hidden bg-black"
        // 窄屏时等比缩小表盘，图标数量随视口自适应。
        style={{
          width: `min(${width}px, ${maxScreenWidth})`,
          aspectRatio: `${width} / ${height}`,
          borderRadius: radius,
        }}
      >
        <motion.div
          className="size-full"
          style={{
            transformOrigin: origin,
            scale: zoomScale,
            opacity: zoomOpacity,
          }}
        >
          <HoneycombView
            className="size-full"
            mode={mode}
            layout={layout}
            snap={snap}
            // 圆角由外层屏幕裁切，需要告诉组件，缩放带才会沿圆角弯曲。
            cornerRadius={radius}
            itemSize={config.itemSize}
            gap={config.gap}
            edgeWidth={config.edgeWidth ?? undefined}
            curvature={config.curvature ?? undefined}
            items={
              config.count < APPS.length ? APPS.slice(0, config.count) : APPS
            }
            getItemKey={(app) => app.id}
            getItemLabel={(app) => app.name}
            renderItem={(app) => (
              <AppIcon app={app} hidden={app.id === hiddenId} />
            )}
            onItemSelect={(app, _index, element) => open(app, element)}
            aria-hidden={launch ? true : undefined}
          />
        </motion.div>
        {showGuides && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10"
          >
            <div
              className="absolute border border-dashed border-white/45"
              style={{ inset: edge, borderRadius: Math.max(0, radius - edge) }}
            />
            <div
              className="absolute border border-dashed border-sky-400/60"
              style={{ inset, borderRadius: Math.max(0, radius - inset) }}
            />
          </div>
        )}
        {launch && (
          <LaunchOverlay
            key={launch.app.id}
            launch={launch}
            progress={progress}
            radius={radius}
            reducedMotion={Boolean(reducedMotion)}
            onClose={close}
          />
        )}
      </div>
    </div>
  );
}

const sliderSpecs: Array<{
  key: Exclude<keyof WatchConfig, "edgeWidth" | "curvature">;
  label: string;
  min: number;
  max: number;
}> = [
  { key: "itemSize", label: "图标直径 itemSize", min: 32, max: 96 },
  { key: "gap", label: "间距 gap", min: 0, max: 30 },
  { key: "width", label: "视口宽度", min: 200, max: 420 },
  { key: "height", label: "视口高度", min: 220, max: 480 },
  { key: "radius", label: "视口圆角 cornerRadius", min: 0, max: 120 },
  { key: "count", label: "图标数量", min: 1, max: APPS.length },
];

function ParamSlider({
  label,
  value,
  min,
  max,
  hint,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  hint?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span>{label}</span>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {value}
          {hint}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={([next]) => onChange(next)}
        aria-label={label}
      />
    </div>
  );
}

/** 参数调试：实时调整尺寸、间距、缩放带与视口，叠加显示缩放带边界。 */
// 两种模式各自一套参数，默认值与上方「Apple Watch 主屏」示例相同。
const PLAYGROUND_DEFAULTS: Record<HoneycombViewMode, WatchConfig> = {
  free: DEFAULT_CONFIG,
  vertical: DEFAULT_CONFIG,
};

function HoneycombPlayground() {
  const [configs, setConfigs] = useState(PLAYGROUND_DEFAULTS);
  const [mode, setMode] = useState<HoneycombViewMode>("free");
  const [layout, setLayout] = useState<HoneycombViewLayout>("spiral");
  const [snap, setSnap] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const config = configs[mode];
  const edge = config.edgeWidth ?? defaultEdgeWidth(config.itemSize);
  const curvature = config.curvature ?? 0.4;
  const update = (patch: Partial<WatchConfig>) =>
    setConfigs((prev) => ({ ...prev, [mode]: { ...prev[mode], ...patch } }));
  // 圆角不超过视口较短边的一半。
  const maxRadius = Math.floor(Math.min(config.width, config.height) / 2);
  const radius = Math.min(config.radius, maxRadius);

  const lines = [
    `<HoneycombView`,
    `  className="size-full"`,
    `  mode="${mode}"`,
    mode === "free" ? `  layout="${layout}"` : null,
    `  itemSize={${config.itemSize}}`,
    `  gap={${config.gap}}`,
    config.edgeWidth === null ? null : `  edgeWidth={${config.edgeWidth}}`,
    config.curvature === null ? null : `  curvature={${config.curvature}}`,
    `  cornerRadius={${radius}}`,
    snap ? null : `  snap={false}`,
    `  items={apps}`,
    `  renderItem={(app) => <AppIcon app={app} />}`,
    `/>`,
    `// 视口：${config.width} × ${config.height}，圆角 ${radius}px`,
  ];
  const code = lines.filter((line) => line !== null).join("\n");

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>参数调试</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setConfigs(PLAYGROUND_DEFAULTS);
                setMode("free");
                setLayout("spiral");
                setSnap(true);
              }}
            >
              <RotateCcw className="size-3.5" />
              重置
            </Button>
            <ViewSourceButton
              code={code}
              description="按当前参数生成的用法。"
            />
          </div>
        </div>
        <CardDescription>
          实时调整参数观察效果。白色虚线是满尺寸区域的边界，蓝色虚线是边缘小圆点的渐近线（上下滚动模式中缩放带只作用于上下两端）。
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center lg:gap-14">
        <div className="flex items-center lg:min-h-[504px]">
          <WatchFrame
            mode={mode}
            layout={layout}
            snap={snap}
            config={{ ...config, radius }}
            showGuides={showGuides}
          />
        </div>
        <div className="flex w-full max-w-xs flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            <SegmentedControl
              size="sm"
              items={[
                { value: "free", label: "自由拖动" },
                { value: "vertical", label: "上下滚动" },
              ]}
              value={mode}
              onValueChange={(value) => setMode(value as HoneycombViewMode)}
            />
            <SegmentedControl
              size="sm"
              items={[
                { value: "spiral", label: "螺旋" },
                { value: "grid", label: "网格" },
              ]}
              value={mode === "vertical" ? "grid" : layout}
              onValueChange={(value) => setLayout(value as HoneycombViewLayout)}
              disabled={mode === "vertical"}
            />
          </div>
          <ParamSlider
            label="缩放带宽度 edgeWidth"
            value={Math.round(edge)}
            min={0}
            max={160}
            hint={config.edgeWidth === null ? "（默认 = 0.65 × itemSize）" : ""}
            onChange={(value) => update({ edgeWidth: value })}
          />
          <ParamSlider
            label="球面感 curvature"
            value={Math.round(curvature * 100)}
            min={0}
            max={90}
            hint={config.curvature === null ? "%（默认 0.4）" : "%"}
            onChange={(value) => update({ curvature: value / 100 })}
          />
          {sliderSpecs.map((spec) => (
            <ParamSlider
              key={spec.key}
              label={spec.label}
              value={spec.key === "radius" ? radius : config[spec.key]}
              min={spec.min}
              max={spec.key === "radius" ? maxRadius : spec.max}
              onChange={(value) => update({ [spec.key]: value })}
            />
          ))}
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="honeycomb-playground-snap">松手吸附 snap</Label>
            <Switch
              id="honeycomb-playground-snap"
              checked={snap}
              onCheckedChange={setSnap}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="honeycomb-playground-guides">显示缩放带边界</Label>
            <Switch
              id="honeycomb-playground-guides"
              checked={showGuides}
              onCheckedChange={setShowGuides}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** 首页与详情快速预览：小尺寸表盘，自由拖动。 */
export function HoneycombViewPreview() {
  return (
    // 以容器宽度为准缩小表盘：首页四列布局中卡片只有约 220px 宽。
    <div className="@container flex w-full justify-center py-2">
      <WatchFrame
        mode="free"
        layout="spiral"
        snap
        compact
        maxScreenWidth="calc(100cqw - 1.5rem)"
      />
    </div>
  );
}

/** HoneycombView 完整演示：两种模式、排布与吸附，以及任意尺寸画布。 */
export function HoneycombViewDemo() {
  const [mode, setMode] = useState<HoneycombViewMode>("free");
  const [layout, setLayout] = useState<HoneycombViewLayout>("spiral");
  const [snap, setSnap] = useState(true);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Apple Watch 主屏</CardTitle>
            <ViewSourceButton
              code={watchCode}
              description="表盘外壳与打开应用的转场由调用方实现，组件只负责蜂窝视图。"
            />
          </div>
          <CardDescription>
            拖动、甩动、拉过边界再松手；轻点图标打开应用。桌面端也可以用滚轮或触控板。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center lg:gap-14">
          <WatchFrame mode={mode} layout={layout} snap={snap} />
          <div className="flex w-full max-w-xs flex-col gap-5 lg:pt-6">
            <div className="space-y-2">
              <Label>模式</Label>
              <SegmentedControl
                size="sm"
                items={[
                  { value: "free", label: "自由拖动" },
                  { value: "vertical", label: "上下滚动" },
                ]}
                value={mode}
                onValueChange={(value) => setMode(value as HoneycombViewMode)}
              />
            </div>
            <div className="space-y-2">
              <Label>排布</Label>
              <SegmentedControl
                size="sm"
                items={[
                  { value: "spiral", label: "螺旋" },
                  { value: "grid", label: "网格" },
                ]}
                value={mode === "vertical" ? "grid" : layout}
                onValueChange={(value) =>
                  setLayout(value as HoneycombViewLayout)
                }
                disabled={mode === "vertical"}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label
                htmlFor="honeycomb-snap"
                className="flex-col items-start gap-1"
              >
                <span>松手吸附</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {mode === "vertical"
                    ? "让某一行停在顶端"
                    : "让最近的图标停在正中"}
                </span>
              </Label>
              <Switch
                id="honeycomb-snap"
                checked={snap}
                onCheckedChange={setSnap}
              />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              靠近边缘的图标按「空间被压缩多少就缩小多少」连续缩小并向内收拢。
              上下滚动模式参照 watchOS 10 网格：首行 3
              个，正中的图标最大、向外逐渐变小。
            </p>
          </div>
        </CardContent>
      </Card>

      <HoneycombPlayground />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>任意尺寸</CardTitle>
            <ViewSourceButton
              code={canvasCode}
              description="视口尺寸由 className 决定，边缘缩放带随之适配。"
            />
          </div>
          <CardDescription>
            不限于表盘：放进任意矩形容器，边缘缩放带随视口尺寸适配。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HoneycombView
            className="h-[420px] w-full rounded-2xl bg-muted/40"
            itemSize={72}
            gap={14}
            items={APPS}
            getItemKey={(app) => app.id}
            getItemLabel={(app) => app.name}
            renderItem={(app) => <AppIcon app={app} />}
          />
        </CardContent>
      </Card>
    </div>
  );
}
