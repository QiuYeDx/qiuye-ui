"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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

function AppIcon({ app }: { app: DemoApp }) {
  const Icon = app.icon;
  return (
    <span
      className="flex size-full items-center justify-center rounded-full text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35),inset_0_-2px_6px_rgb(0_0_0/0.18)]"
      style={{
        backgroundImage: `linear-gradient(160deg, ${app.colors[0]}, ${app.colors[1]})`,
      }}
    >
      <Icon className="size-[46%]" strokeWidth={2.2} />
    </span>
  );
}

const watchCode = `const [open, setOpen] = useState<DemoApp | null>(null);

return (
  <div className="relative h-[360px] w-[300px] overflow-hidden rounded-[56px] bg-black">
    <HoneycombView
      className="size-full"
      mode={mode}          // "free" | "vertical"
      layout={layout}      // "spiral" | "grid"
      snap={snap}
      cornerRadius={56}
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
  count: number;
}

const DEFAULT_CONFIG: WatchConfig = {
  width: 300,
  height: 360,
  radius: 60,
  itemSize: 60,
  gap: 10,
  edgeWidth: null,
  count: APPS.length,
};

const COMPACT_CONFIG: WatchConfig = {
  ...DEFAULT_CONFIG,
  width: 220,
  height: 264,
  radius: 46,
  itemSize: 46,
  gap: 7,
};

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
  const reducedMotion = useReducedMotion();
  const { width, height, radius } = config;
  const edge = config.edgeWidth ?? config.itemSize;
  // 与组件内部一致：渐近线距视口边缘 0.18 · edgeWidth。
  const inset = edge * 0.18;

  const open = (app: DemoApp, element: HTMLElement) => {
    const screen = screenRef.current?.getBoundingClientRect();
    const icon = element.getBoundingClientRect();
    if (!screen) return;
    setLaunch({
      app,
      rect: {
        left: icon.left - screen.left,
        top: icon.top - screen.top,
        size: icon.width,
      },
      screen: { width: screen.width, height: screen.height },
    });
  };

  const origin = launch
    ? `${launch.rect.left + launch.rect.size / 2}px ${launch.rect.top + launch.rect.size / 2}px`
    : "50% 50%";
  const LaunchIcon = launch?.app.icon;
  const transition = reducedMotion
    ? { duration: 0.2 }
    : { type: "spring" as const, duration: 0.5, bounce: 0 };

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
          style={{ transformOrigin: origin }}
          animate={
            launch
              ? { scale: reducedMotion ? 1 : 2.4, opacity: 0 }
              : { scale: 1, opacity: 1 }
          }
          transition={transition}
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
            items={
              config.count < APPS.length ? APPS.slice(0, config.count) : APPS
            }
            getItemKey={(app) => app.id}
            getItemLabel={(app) => app.name}
            renderItem={(app) => <AppIcon app={app} />}
            onItemSelect={(app, _index, element) => open(app, element)}
            aria-hidden={launch ? true : undefined}
          />
        </motion.div>
        {showGuides && (
          <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
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
        <AnimatePresence>
          {launch && LaunchIcon && (
            <motion.button
              key={launch.app.id}
              type="button"
              aria-label={`关闭 ${launch.app.name}`}
              className="absolute flex cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden text-white outline-none"
              style={{
                backgroundImage: `linear-gradient(160deg, ${launch.app.colors[0]}, ${launch.app.colors[1]})`,
              }}
              initial={{
                left: launch.rect.left,
                top: launch.rect.top,
                width: launch.rect.size,
                height: launch.rect.size,
                borderRadius: launch.rect.size / 2,
                opacity: reducedMotion ? 0 : 1,
              }}
              animate={{
                left: 0,
                top: 0,
                width: launch.screen.width,
                height: launch.screen.height,
                borderRadius: radius,
                opacity: 1,
              }}
              exit={{
                left: launch.rect.left,
                top: launch.rect.top,
                width: launch.rect.size,
                height: launch.rect.size,
                borderRadius: launch.rect.size / 2,
                opacity: reducedMotion ? 0 : 1,
              }}
              transition={transition}
              onClick={() => setLaunch(null)}
            >
              <motion.span
                className="flex flex-col items-center gap-3"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
              >
                <LaunchIcon className="size-14" strokeWidth={1.8} />
                <span className="text-lg font-semibold tracking-tight">
                  {launch.app.name}
                </span>
                <span className="text-xs text-white/70">轻点返回</span>
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const sliderSpecs: Array<{
  key: Exclude<keyof WatchConfig, "edgeWidth">;
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
function HoneycombPlayground() {
  const [config, setConfig] = useState<WatchConfig>(DEFAULT_CONFIG);
  const [mode, setMode] = useState<HoneycombViewMode>("free");
  const [layout, setLayout] = useState<HoneycombViewLayout>("spiral");
  const [snap, setSnap] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const edge = config.edgeWidth ?? config.itemSize;
  const update = (patch: Partial<WatchConfig>) =>
    setConfig((prev) => ({ ...prev, ...patch }));
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
    `  cornerRadius={${radius}}`,
    snap ? `  snap` : null,
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
                setConfig(DEFAULT_CONFIG);
                setMode("free");
                setLayout("spiral");
                setSnap(false);
              }}
            >
              <RotateCcw className="size-3.5" />
              重置
            </Button>
            <ViewSourceButton code={code} description="按当前参数生成的用法。" />
          </div>
        </div>
        <CardDescription>
          实时调整参数观察效果。白色虚线是满尺寸区域的边界，蓝色虚线是边缘小圆点的渐近线（上下滚动模式中各列在水平方向不缩放）。
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
            value={edge}
            min={0}
            max={160}
            hint={config.edgeWidth === null ? "（默认 = itemSize）" : ""}
            onChange={(value) => update({ edgeWidth: value })}
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
        snap={false}
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
  const [snap, setSnap] = useState(false);

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
              <Label htmlFor="honeycomb-snap" className="flex-col items-start gap-1">
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
              靠近边缘的图标按「空间被压缩多少就缩小多少」连续缩小并向内收拢；
              上下滚动模式中各列保持满尺寸，只有顶部和底部缩小。
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
