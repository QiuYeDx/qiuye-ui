"use client";

import * as React from "react";
import { AnimatedNumberPreview } from "@/components/qiuye-ui/demos/animated-number-demo";
import {
  ArrowUpRightIcon,
  BellOffIcon,
  BellIcon,
  ChevronsLeftRightIcon,
  CircleOffIcon,
  GripVerticalIcon,
  ListFilterIcon,
  MenuIcon,
  MoveDiagonal2Icon,
  MousePointer2Icon,
  MoonIcon,
  ScanLineIcon,
  SunIcon,
  TriangleAlertIcon,
  UserRoundIcon,
  WalletCardsIcon,
  XIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";

import {
  DialogDescription,
  DialogTitle,
  ScrollableDialog,
  ScrollableDialogContent,
  ScrollableDialogFooter,
  ScrollableDialogHeader,
} from "@/components/qiuye-ui/scrollable-dialog";
import { CodeBlock, CodeBlockPanel } from "@/components/qiuye-ui/code-block";
import { ColorPicker } from "@/components/qiuye-ui/color-picker";
import { ClipPathTabs } from "@/components/qiuye-ui/clip-path-tabs";
import { DotGlass } from "@/components/qiuye-ui/dot-glass";
import { DualStateToggle } from "@/components/qiuye-ui/dual-state-toggle";
import { MarkdownRenderer } from "@/components/qiuye-ui/markdown-renderer";
import {
  AsciiEffect,
  createSoftBlobSource,
  DotMatrixEffect,
} from "@/components/qiuye-ui/matrix-effect";
import { ThemeTransitionToggle } from "@/components/qiuye-ui/theme-transition-toggle";
import { ImageViewer } from "@/components/qiuye-ui/image-viewer";
import { ResponsiveTabs } from "@/components/qiuye-ui/responsive-tabs";
import { SegmentedControl } from "@/components/qiuye-ui/segmented-control";
import {
  SmoothCorners,
  useSmoothCornersSupport,
} from "@/components/qiuye-ui/smooth-corners";
import { Tour, type TourStep } from "@/components/qiuye-ui/tour";
import { Typewriter } from "@/components/qiuye-ui/typewriter";
import { SmoothCornersSupportNotice } from "@/components/smooth-corners-support-notice";
import { Button } from "@/components/ui/button";
import { ComponentId } from "@/lib/component-constants";
import { useHoverSupport } from "@/hooks/use-hover-support";
import { cn } from "@/lib/utils";

function ResponsiveTabsPreview() {
  const [value, setValue] = React.useState("overview");

  return (
    <div className="w-full max-w-sm space-y-4">
      <ResponsiveTabs
        value={value}
        onValueChange={setValue}
        items={[
          { value: "overview", label: "Overview" },
          { value: "tasks", label: "Tasks" },
          { value: "files", label: "Files" },
        ]}
        layout="grid"
        gridColsClass="grid-cols-3"
        scrollButtons={false}
        fadeMasks={false}
      >
        <div className="rounded-md border bg-muted/30 p-4">
          <div className="mb-3 text-sm font-medium capitalize">{value}</div>
          <div className="space-y-2">
            <div className="h-2 w-3/4 rounded bg-foreground/15" />
            <div className="h-2 w-1/2 rounded bg-foreground/10" />
          </div>
        </div>
      </ResponsiveTabs>
    </div>
  );
}

function ClipPathTabsPreview() {
  const [value, setValue] = React.useState("payments");
  const labels: Record<string, string> = {
    payments: "支付",
    balances: "余额",
    customers: "客户",
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <ClipPathTabs
        ariaLabel="项目视图"
        value={value}
        onValueChange={setValue}
        size="sm"
        items={[
          {
            value: "payments",
            label: "支付",
            icon: <WalletCardsIcon />,
          },
          {
            value: "balances",
            label: "余额",
            icon: <ListFilterIcon />,
          },
          {
            value: "customers",
            label: "客户",
            icon: <UserRoundIcon />,
          },
        ]}
      />
      <div className="w-full max-w-48 rounded-md border bg-muted/30 px-3 py-2 text-center text-xs text-muted-foreground">
        当前视图：
        <span className="font-medium text-foreground">{labels[value]}</span>
      </div>
    </div>
  );
}

function SegmentedControlPreview() {
  const [value, setValue] = React.useState("chat");

  return (
    <div className="w-full max-w-xs space-y-4">
      <SegmentedControl
        aria-label="工作模式"
        value={value}
        onValueChange={setValue}
        items={[
          { value: "chat", label: "Chat" },
          { value: "work", label: "Work" },
        ]}
        className="w-full"
      />
      <p className="text-center text-xs text-muted-foreground">
        {value === "chat" ? "Conversation mode" : "Workspace mode"}
      </p>
    </div>
  );
}

function ScrollableDialogPreview() {
  const [open, setOpen] = React.useState(false);
  const [ctaVisible, setCtaVisible] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();
  const canHover = useHoverSupport();
  const skeletonSections = [
    ["w-7/12", "w-full", "w-10/12"],
    ["w-5/12", "w-11/12", "w-8/12"],
    ["w-6/12", "w-full", "w-9/12"],
    ["w-4/12", "w-10/12", "w-7/12"],
    ["w-6/12", "w-full", "w-8/12"],
    ["w-5/12", "w-11/12", "w-9/12"],
  ];

  const isFirstEffect = React.useRef(true);

  React.useEffect(() => {
    if (isFirstEffect.current) {
      isFirstEffect.current = false;
      if (!window.matchMedia("(hover: hover)").matches && !open) {
        setCtaVisible(true);
      }
      return;
    }

    if (!canHover && !open) {
      setCtaVisible(true);
    } else if (canHover && !open) {
      setCtaVisible(false);
    }
  }, [canHover, open]);

  const showCta = () => {
    if (open) return;
    setCtaVisible(true);
  };

  const hideCta = () => {
    if (open || !canHover) return;
    setCtaVisible(false);
  };

  const openDialog = () => {
    setCtaVisible(false);
    setOpen(true);
  };

  return (
    <div className="group/scroll-dialog-preview relative -m-4 flex h-[calc(100%+2rem)] min-h-[260px] w-[calc(100%+2rem)] items-center justify-center overflow-hidden p-5 sm:p-6">
      <div
        className={cn(
          "relative z-0 flex h-full min-h-[210px] w-full max-w-lg items-center justify-center overflow-hidden rounded-lg border bg-background p-4 transition-[filter,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none group-hover/scroll-dialog-preview:saturate-[0.9] group-hover/scroll-dialog-preview:opacity-90 group-hover/scroll-dialog-preview:duration-300 sm:p-5",
          !canHover && !open && "saturate-[0.94] opacity-[0.96]",
        )}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 flex flex-col gap-3 p-4 opacity-55 sm:p-5"
        >
          <div className="flex h-10 shrink-0 items-center gap-2 rounded-md border bg-muted/35 px-3">
            <div className="size-5 rounded-full bg-muted-foreground/18" />
            <div className="h-2.5 w-28 rounded-full bg-muted-foreground/14" />
            <div className="ml-auto flex gap-1.5">
              <div className="size-5 rounded bg-muted-foreground/12" />
              <div className="size-5 rounded bg-muted-foreground/12" />
            </div>
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-[72px_minmax(0,1fr)] gap-3 sm:grid-cols-[104px_minmax(0,1fr)]">
            <div className="space-y-2 rounded-md border bg-muted/20 p-2">
              <div className="h-6 rounded bg-muted-foreground/14" />
              <div className="h-6 rounded bg-muted-foreground/10" />
              <div className="h-6 rounded bg-muted-foreground/10" />
            </div>
            <div className="rounded-md border bg-muted/15 p-3">
              <div className="space-y-2">
                <div className="h-3 w-32 max-w-[48%] rounded-full bg-muted-foreground/16" />
                <div className="h-2.5 rounded-full bg-muted-foreground/10" />
                <div className="h-2.5 w-5/6 rounded-full bg-muted-foreground/10" />
              </div>
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="relative w-full max-w-[340px] overflow-hidden rounded-lg border bg-background shadow-[0_22px_70px_-34px_rgba(0,0,0,0.45)] dark:shadow-[0_24px_76px_-32px_rgba(0,0,0,0.85)]"
        >
          <div className="border-b px-4 py-3">
            <div className="h-3 w-28 rounded-full bg-foreground/18" />
            <div className="mt-2 h-2 w-40 rounded-full bg-muted-foreground/14" />
          </div>
          <div className="relative max-h-[166px] overflow-hidden px-4 py-3">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-background to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-background to-transparent" />
            <div className="space-y-3">
              {skeletonSections.slice(0, 4).map((section, index) => (
                <div key={index} className="rounded-md border bg-muted/20 p-3">
                  <div
                    className={cn(
                      "h-2.5 rounded-full bg-foreground/18",
                      section[0],
                    )}
                  />
                  <div className="mt-2 space-y-1.5">
                    <div
                      className={cn(
                        "h-2 rounded-full bg-muted-foreground/12",
                        section[1],
                      )}
                    />
                    <div
                      className={cn(
                        "h-2 rounded-full bg-muted-foreground/10",
                        section[2],
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t px-4 py-3">
            <div className="h-8 w-16 rounded-md border bg-background" />
            <div className="h-8 w-20 rounded-md bg-foreground/90" />
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="打开 Scrollable Dialog"
        onPointerEnter={showCta}
        onPointerLeave={hideCta}
        onFocus={showCta}
        onBlur={hideCta}
        onClick={openDialog}
        className={cn(
          "absolute inset-0 z-10 isolate flex items-center justify-center overflow-hidden bg-background/0 px-6 text-center",
          "transition-[background-color,backdrop-filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          "hover:bg-background/20 hover:backdrop-blur-[0.75px] hover:duration-300 focus-visible:bg-background/20 focus-visible:backdrop-blur-[0.75px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-inset",
          "[&:focus-visible_.scroll-dialog-preview-glow]:scale-100 [&:focus-visible_.scroll-dialog-preview-glow]:opacity-100 [&:focus-visible_.scroll-dialog-preview-glow]:duration-500",
          "[&:hover_.scroll-dialog-preview-glow]:scale-100 [&:hover_.scroll-dialog-preview-glow]:opacity-100 [&:hover_.scroll-dialog-preview-glow]:duration-500",
          open ? "pointer-events-none" : "cursor-pointer",
        )}
      >
        <span
          aria-hidden
          className="scroll-dialog-preview-glow pointer-events-none absolute size-64 scale-75 rounded-full bg-background/70 opacity-0 blur-3xl transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
        />
        <motion.span
          className="group/scroll-dialog-cta relative flex items-center gap-2.5 rounded-full border border-foreground/10 bg-background/88 py-1.5 pr-3.5 pl-1.5 text-foreground shadow-[0_14px_36px_-18px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.7)_inset] backdrop-blur-xl transition-shadow duration-500 ease-out hover:shadow-[0_18px_42px_-18px_rgba(0,0,0,0.58),0_1px_0_rgba(255,255,255,0.7)_inset] dark:border-white/80 dark:bg-white/95 dark:text-zinc-950 dark:shadow-[0_18px_48px_-18px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.95)_inset] dark:hover:shadow-[0_20px_52px_-18px_rgba(0,0,0,0.95),0_1px_0_rgba(255,255,255,0.95)_inset]"
          initial={false}
          animate={{
            opacity: ctaVisible ? 1 : 0,
            y: prefersReducedMotion ? 0 : ctaVisible ? 0 : 16,
            scale: ctaVisible ? 1 : 0.975,
          }}
          transition={{
            duration: prefersReducedMotion ? 0 : ctaVisible ? 0.28 : 0.36,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background shadow-sm dark:bg-zinc-950 dark:text-white">
            <MousePointer2Icon className="size-3.5" />
          </span>
          <span className="text-sm font-medium">打开 Dialog</span>
          <ArrowUpRightIcon className="size-3.5 text-muted-foreground transition-transform duration-300 ease-out group-hover/scroll-dialog-cta:translate-x-0.5 group-hover/scroll-dialog-cta:-translate-y-0.5 motion-reduce:transition-none dark:text-zinc-500" />
        </motion.span>
      </button>

      <ScrollableDialog
        open={open}
        onOpenChange={setOpen}
        maxWidth="sm:max-w-xl"
      >
        <ScrollableDialogHeader className="px-5 py-4 pr-12 text-left">
          <DialogTitle>Dialog Preview</DialogTitle>
          <DialogDescription>
            固定头部、可滚动内容与常驻底部操作。
          </DialogDescription>
        </ScrollableDialogHeader>
        <ScrollableDialogContent>
          <div aria-hidden="true" className="space-y-3">
            {skeletonSections.map((section, index) => (
              <div key={index} className="rounded-lg border bg-muted/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-md bg-foreground/10" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div
                      className={cn(
                        "h-2.5 rounded-full bg-foreground/18",
                        section[0],
                      )}
                    />
                    <div className="h-2 w-full rounded-full bg-muted-foreground/12" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div
                    className={cn(
                      "h-2 rounded-full bg-muted-foreground/12",
                      section[1],
                    )}
                  />
                  <div
                    className={cn(
                      "h-2 rounded-full bg-muted-foreground/10",
                      section[2],
                    )}
                  />
                </div>
              </div>
            ))}
            <div className="grid grid-cols-3 gap-2 rounded-lg border bg-background p-3">
              <div className="h-12 rounded-md bg-muted-foreground/10" />
              <div className="h-12 rounded-md bg-muted-foreground/10" />
              <div className="h-12 rounded-md bg-muted-foreground/10" />
            </div>
          </div>
        </ScrollableDialogContent>
        <ScrollableDialogFooter className="flex flex-col-reverse items-center justify-end gap-2 sm:flex-row">
          <Button
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setOpen(false)}
          >
            关闭
          </Button>
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setOpen(false)}
          >
            完成
          </Button>
        </ScrollableDialogFooter>
      </ScrollableDialog>
    </div>
  );
}

const dotGlassMarqueeTiles = [
  {
    width: "5.75rem",
    background: "linear-gradient(135deg, #22d3ee 0%, #2563eb 100%)",
  },
  {
    width: "7rem",
    background: "linear-gradient(135deg, #fb7185 0%, #c026d3 100%)",
  },
  {
    width: "4.75rem",
    background: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
  },
  {
    width: "6.5rem",
    background: "linear-gradient(135deg, #34d399 0%, #0f766e 100%)",
  },
  {
    width: "5.25rem",
    background: "linear-gradient(135deg, #a78bfa 0%, #4f46e5 100%)",
  },
  {
    width: "6rem",
    background: "linear-gradient(135deg, #f472b6 0%, #be123c 100%)",
  },
];

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

function DotGlassMarqueeStrip({
  duration,
  reverse = false,
}: {
  duration: number;
  reverse?: boolean;
}) {
  const tiles = reverse
    ? [...dotGlassMarqueeTiles].reverse()
    : dotGlassMarqueeTiles;
  const longTileSet = Array.from({ length: 3 }).flatMap(() => tiles);

  return (
    <div aria-hidden="true" className="relative h-14 w-full overflow-hidden">
      <div
        className="dot-glass-home-marquee-track flex w-max"
        style={{
          animation: `dot-glass-home-marquee-track ${duration}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {[0, 1].map((groupIndex) => (
          <div key={groupIndex} className="flex shrink-0 gap-5 pr-5">
            {longTileSet.map((tile, tileIndex) => (
              <div
                key={`${groupIndex}-${tileIndex}`}
                className="h-14 rounded-md shadow-sm ring-1 ring-white/45 dark:ring-white/10"
                style={{ width: tile.width, background: tile.background }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const MATRIX_EFFECT_HOME_SOURCE = createSoftBlobSource({
  count: 4,
  minRadius: 0.18,
  maxRadius: 0.48,
  speed: 0.4,
  baseValue: 0.025,
  seed: 17,
});
const MATRIX_EFFECT_HOME_GRID = {
  mode: "auto",
  cellSize: 9,
  maxCells: 3_200,
} as const;
const MATRIX_EFFECT_HOME_LEVELS = { contrast: 1.2 } as const;
const MATRIX_EFFECT_HOME_PALETTES = {
  light: {
    backgroundColor: "#F6F6F6",
    dotColor: "#9C9C9C",
    asciiColor: "#52525B",
  },
  dark: {
    backgroundColor: "#09090B",
    dotColor: "#F4F4F5",
    asciiColor: "#D4D4D8",
  },
} as const;

function MatrixEffectPreview() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const palette =
    mounted && resolvedTheme === "dark"
      ? MATRIX_EFFECT_HOME_PALETTES.dark
      : MATRIX_EFFECT_HOME_PALETTES.light;

  return (
    <div className="grid w-full gap-3 sm:h-[230px] sm:grid-cols-2">
      <div
        className="relative aspect-video min-h-[168px] overflow-hidden rounded-md border sm:aspect-auto sm:h-full sm:min-h-0"
        style={{ backgroundColor: palette.backgroundColor }}
      >
        <span
          aria-hidden="true"
          className="absolute top-3 left-3 z-10 rounded-sm border border-foreground/10 bg-background/85 px-2 py-1 font-mono text-[10px] font-medium text-foreground shadow-sm backdrop-blur-sm"
        >
          DOT
        </span>
        <DotMatrixEffect
          className="h-full w-full"
          source={MATRIX_EFFECT_HOME_SOURCE}
          grid={MATRIX_EFFECT_HOME_GRID}
          radiusRange={[0, 2.7]}
          levels={MATRIX_EFFECT_HOME_LEVELS}
          color={palette.dotColor}
          backgroundColor={palette.backgroundColor}
          frameRate={30}
          maxDpr={1.5}
          pauseWhenOffscreen
          decorative={false}
          ariaLabel="随页面主题切换配色的流动光团圆点矩阵"
        />
      </div>

      <div
        className="relative aspect-video min-h-[168px] overflow-hidden rounded-md border sm:aspect-auto sm:h-full sm:min-h-0"
        style={{ backgroundColor: palette.backgroundColor }}
      >
        <span
          aria-hidden="true"
          className="absolute top-3 left-3 z-10 rounded-sm border border-foreground/10 bg-background/85 px-2 py-1 font-mono text-[10px] font-medium text-foreground shadow-sm backdrop-blur-sm"
        >
          ASCII
        </span>
        <AsciiEffect
          className="h-full w-full"
          source={MATRIX_EFFECT_HOME_SOURCE}
          grid={MATRIX_EFFECT_HOME_GRID}
          levels={MATRIX_EFFECT_HOME_LEVELS}
          colorMode="fixed"
          color={palette.asciiColor}
          backgroundColor={palette.backgroundColor}
          fontScale={0.82}
          frameRate={30}
          maxDpr={1.5}
          pauseWhenOffscreen
          decorative={false}
          ariaLabel="随页面主题切换配色的流动光团 ASCII 字符矩阵"
        />
      </div>
    </div>
  );
}

function DotGlassPreview() {
  const [split, setSplit] = React.useState(50);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const draggingRef = React.useRef(false);

  const updateSplitFromClientX = React.useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const ratio = rect.width > 0 ? (clientX - rect.left) / rect.width : 0.5;
    setSplit(Math.round(clampPercent(ratio * 100)));
  }, []);

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      draggingRef.current = true;
      updateSplitFromClientX(event.clientX);

      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // 嵌入式预览里指针捕获尽量启用即可。
      }

      event.preventDefault();
    },
    [updateSplitFromClientX],
  );

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      updateSplitFromClientX(event.clientX);
      event.preventDefault();
    },
    [updateSplitFromClientX],
  );

  const handlePointerEnd = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      draggingRef.current = false;

      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // 指针捕获可能已被浏览器释放。
      }

      event.preventDefault();
    },
    [],
  );

  const handleLostPointerCapture = React.useCallback(() => {
    draggingRef.current = false;
  }, []);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const step = event.shiftKey ? 10 : 2;

      if (event.key === "ArrowLeft") {
        setSplit((value) => clampPercent(value - step));
        event.preventDefault();
      }

      if (event.key === "ArrowRight") {
        setSplit((value) => clampPercent(value + step));
        event.preventDefault();
      }

      if (event.key === "Home") {
        setSplit(0);
        event.preventDefault();
      }

      if (event.key === "End") {
        setSplit(100);
        event.preventDefault();
      }
    },
    [],
  );

  return (
    <div
      ref={containerRef}
      className="relative h-[230px] w-full overflow-hidden rounded-lg border bg-background text-foreground"
    >
      <style>
        {`
          @keyframes dot-glass-home-marquee-track {
            from { transform: translate3d(0, 0, 0); }
            to { transform: translate3d(-50%, 0, 0); }
          }

          .dot-glass-home-marquee-track {
            will-change: transform;
          }

          @media (prefers-reduced-motion: reduce) {
            .dot-glass-home-marquee-track {
              animation: none !important;
            }
          }
        `}
      </style>

      <div className="absolute inset-0 flex flex-col justify-center gap-5 overflow-hidden bg-muted/40">
        <div className="w-full">
          <DotGlassMarqueeStrip duration={38} />
        </div>
        <div className="w-full">
          <DotGlassMarqueeStrip duration={32} reverse />
        </div>
        <div className="w-full">
          <DotGlassMarqueeStrip duration={26} />
        </div>
        <div className="absolute inset-0 bg-background/10" />
      </div>

      <DotGlass
        absolute
        className="pointer-events-none inset-y-0 left-0"
        style={{ width: `${split}%` }}
        dotSize={3}
        dotGap={6}
        dotFade={0}
        blur={5}
        saturation={150}
        glassAlpha={0}
        coverColor="var(--background)"
      />
      <div
        className="pointer-events-none absolute inset-y-0 z-20 w-px bg-foreground/35"
        style={{ left: `${split}%` }}
      />
      <div
        role="slider"
        tabIndex={0}
        aria-label="调整 Dot Glass 覆盖区域"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={split}
        className="absolute top-1/2 z-30 flex h-16 w-8 -translate-x-1/2 -translate-y-1/2 cursor-col-resize items-center justify-center rounded-full border bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        style={{ left: `${split}%`, touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onLostPointerCapture={handleLostPointerCapture}
        onKeyDown={handleKeyDown}
      >
        <GripVerticalIcon className="size-4" />
      </div>
    </div>
  );
}

const imageViewerPreviewSrc =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=720&h=1080&q=80";

function ImageViewerPreview() {
  return (
    <div className="relative flex h-full min-h-[320px] w-full items-center justify-center overflow-visible py-3">
      {/* 原生 img 用于避开 iOS Safari 对 CSS background-image + filter 的首屏合成裁边。 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        aria-hidden="true"
        src={imageViewerPreviewSrc}
        alt=""
        loading="eager"
        decoding="async"
        draggable={false}
        className="pointer-events-none absolute h-[82%] max-h-[360px] w-[72%] max-w-[260px] rounded-2xl object-cover object-center opacity-20 blur-xl saturate-125 dark:opacity-25"
        style={{
          backfaceVisibility: "hidden",
          transform: "translate3d(0, 0, 0)",
          WebkitBackfaceVisibility: "hidden",
          WebkitTransform: "translate3d(0, 0, 0)",
          willChange: "filter, transform",
        }}
      />
      <ImageViewer
        src={imageViewerPreviewSrc}
        alt="Road crossing a desert landscape"
        maxHeight={340}
        maxWidth={250}
        hoverScale={1.045}
        rounded="2xl"
        lightboxRounded="2xl"
        smoothCorners
        smoothCornerSmoothing={0.72}
        className="shadow-2xl shadow-black/25 dark:shadow-black/45"
        wrapperClassName="relative z-10 my-0 flex w-full items-center justify-center overflow-visible py-4"
      />
    </div>
  );
}

function DualStateTogglePreview() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [theme, setTheme] = React.useState(false);
  const [notificationsMuted, setNotificationsMuted] = React.useState(false);

  return (
    <div className="flex items-center justify-center gap-3 rounded-full border bg-muted/30 p-3">
      <DualStateToggle
        active={theme}
        onToggle={setTheme}
        activeIcon={<MoonIcon />}
        inactiveIcon={<SunIcon />}
        activeLabel="深色"
        inactiveLabel="浅色"
        effect="slide-up"
        variant="secondary"
        shape="circle"
      />
      <DualStateToggle
        active={menuOpen}
        onToggle={setMenuOpen}
        activeIcon={<XIcon />}
        inactiveIcon={<MenuIcon />}
        activeLabel="关闭菜单"
        inactiveLabel="打开菜单"
        effect="rotate"
        variant="outline"
      />
      <DualStateToggle
        active={notificationsMuted}
        onToggle={setNotificationsMuted}
        activeIcon={<BellOffIcon />}
        inactiveIcon={<BellIcon />}
        activeLabel="通知关闭"
        inactiveLabel="通知开启"
        effect="scale"
        variant="ghost"
        shape="circle"
      />
    </div>
  );
}

function ThemeTransitionTogglePreview() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const examples = [
    {
      transitionEffect: "wipe",
      transitionAxis: "vertical",
      transitionCorner: "auto",
      label: "边缘扫入",
      icon: ScanLineIcon,
      variant: "outline",
    },
    {
      transitionEffect: "split",
      transitionAxis: "horizontal",
      transitionCorner: "auto",
      label: "轴线展开",
      icon: ChevronsLeftRightIcon,
      variant: "secondary",
    },
    {
      transitionEffect: "diagonal",
      transitionAxis: "auto",
      transitionCorner: "bottom-right",
      label: "对角揭幕",
      icon: MoveDiagonal2Icon,
      variant: "outline",
    },
  ] as const;

  return (
    <div className="flex items-center justify-center gap-3 rounded-full border bg-muted/30 p-3">
      {examples.map(
        ({
          transitionEffect,
          transitionAxis,
          transitionCorner,
          label,
          icon: Icon,
          variant,
        }) => (
          <ThemeTransitionToggle
            key={transitionEffect}
            isDark={isDark}
            onToggle={(nextDark) => setTheme(nextDark ? "dark" : "light")}
            transitionEffect={transitionEffect}
            transitionAxis={transitionAxis}
            transitionCorner={transitionCorner}
            variant={variant}
            buttonShape="circle"
            lightIcon={<Icon className="size-4" />}
            darkIcon={<Icon className="size-4" />}
            lightLabel={`${label}切换到深色主题`}
            darkLabel={`${label}切换到浅色主题`}
            className="size-10"
          />
        ),
      )}
    </div>
  );
}

function CodeBlockPreview() {
  const code = `import { useState, useCallback } from "react";

interface UseCounterOptions {
  min?: number;
  max?: number;
}

export function useCounter(initial = 0, opts?: UseCounterOptions) {
  const [count, setCount] = useState(initial);

  const increment = useCallback(
    () => setCount((c) => opts?.max != null ? Math.min(c + 1, opts.max) : c + 1),
    [opts?.max]
  );

  const reset = useCallback(() => setCount(initial), [initial]);

  return { count, increment, reset } as const;
}`;

  return (
    <div className="w-full max-w-xl">
      <CodeBlockPanel
        filename="use-counter.ts"
        code={code}
        isDark
        colorTheme="github"
        className="shadow-none"
      >
        <CodeBlock
          language="typescript"
          isDark
          colorTheme="github"
          displayMode="scroll"
          maxHeight={200}
          highlightLines="3-6,11-14"
          noShadow
        >
          {code}
        </CodeBlock>
      </CodeBlockPanel>
    </div>
  );
}

function TypewriterPreview() {
  return (
    <div className="rounded-full border bg-muted/30 px-5 py-3 text-sm font-medium">
      <Typewriter
        phrases={["Install components", "Build your system", "Ship faster"]}
        typingSpeed={65}
        deletingSpeed={35}
        pauseDuration={1000}
        switchInterval={350}
      />
    </div>
  );
}

const homeMarkdownPreviewContent = [
  "# MarkdownRenderer",
  "",
  "这是一段放在首页弹窗里的 Markdown 内容，用来展示长文排版、GFM 表格、任务列表和代码块高亮。",
  "",
  "## 发布检查",
  "",
  "- [x] 标题、段落和列表保持稳定间距",
  "- [x] 表格在弹窗内容区内可读",
  "- [x] 代码块使用 QiuYe UI CodeBlock 渲染",
  "- [ ] 接入你自己的内容源",
  "",
  "## 能力表",
  "",
  "| 场景 | 默认表现 | 适合内容 |",
  "| --- | --- | --- |",
  "| Blog | 标题锚点 + 文章密度 | 文档、教程、知识库 |",
  "| Code | 语法高亮 + 行号 | API 示例、配置片段 |",
  "| GFM | 表格 + 任务列表 | 发布说明、检查清单 |",
  "",
  "## 代码示例",
  "",
  '```tsx title="preview.tsx" {4}',
  'import { MarkdownRenderer } from "@/components/qiuye-ui/markdown-renderer";',
  "",
  "export function Preview({ content }: { content: string }) {",
  "  return <MarkdownRenderer content={content} />;",
  "}",
  "```",
  "",
  "> 弹窗头尾保持固定，正文区域负责滚动，MarkdownRenderer 专注内容渲染。",
].join("\n");

function MarkdownRendererPreview() {
  const [open, setOpen] = React.useState(false);
  const [ctaVisible, setCtaVisible] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();
  const canHover = useHoverSupport();
  const paragraphLines = ["w-full", "w-11/12", "w-8/12"];
  const tableRows = ["w-7/12", "w-5/12", "w-6/12"];
  const codeLines = ["w-8/12", "w-11/12", "w-6/12"];

  const isFirstEffect = React.useRef(true);

  React.useEffect(() => {
    if (isFirstEffect.current) {
      isFirstEffect.current = false;
      if (!window.matchMedia("(hover: hover)").matches && !open) {
        setCtaVisible(true);
      }
      return;
    }

    if (!canHover && !open) {
      setCtaVisible(true);
    } else if (canHover && !open) {
      setCtaVisible(false);
    }
  }, [canHover, open]);

  const showCta = () => {
    if (open) return;
    setCtaVisible(true);
  };

  const hideCta = () => {
    if (open || !canHover) return;
    setCtaVisible(false);
  };

  const openMarkdownDialog = () => {
    setCtaVisible(false);
    setOpen(true);
  };

  return (
    <div className="group/markdown-renderer-preview relative -m-4 flex h-[calc(100%+2rem)] min-h-[260px] w-[calc(100%+2rem)] items-center justify-center overflow-hidden p-5 sm:p-6">
      <div
        aria-hidden="true"
        className={cn(
          "relative z-0 h-full min-h-[210px] w-full max-w-lg overflow-hidden rounded-lg border bg-background transition-[filter,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none group-hover/markdown-renderer-preview:saturate-[0.9] group-hover/markdown-renderer-preview:opacity-90 group-hover/markdown-renderer-preview:duration-300",
          !canHover && !open && "saturate-[0.94] opacity-[0.96]",
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-background to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center px-7 py-6 sm:px-8">
          <div className="relative w-full max-w-[340px]">
            <div className="absolute top-1 bottom-2 left-0 w-px bg-border" />
            <div className="absolute top-1 left-0 size-2 -translate-x-[3.5px] rounded-full bg-muted-foreground/26" />
            <div className="absolute top-24 left-0 size-2 -translate-x-[3.5px] rounded-full bg-muted-foreground/16" />
            <div className="absolute top-48 left-0 size-2 -translate-x-[3.5px] rounded-full bg-muted-foreground/16" />

            <div className="space-y-4 pl-5">
              <div className="space-y-2">
                <div className="h-4 w-7/12 rounded-full bg-foreground/22" />
                <div className="h-2.5 w-9/12 rounded-full bg-muted-foreground/16" />
              </div>

              <div className="space-y-2">
                {paragraphLines.map((width, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-2 rounded-full bg-muted-foreground/14",
                      width,
                    )}
                  />
                ))}
              </div>

              <div className="overflow-hidden rounded-md bg-muted/30">
                <div className="grid grid-cols-3 gap-2 bg-muted/45 px-3 py-2">
                  <div className="h-2 rounded-full bg-muted-foreground/22" />
                  <div className="h-2 rounded-full bg-muted-foreground/22" />
                  <div className="h-2 rounded-full bg-muted-foreground/22" />
                </div>
                {tableRows.map((width, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 gap-2 border-t border-background/80 px-3 py-2 dark:border-background/40"
                  >
                    <div
                      className={cn(
                        "h-2 rounded-full bg-muted-foreground/14",
                        width,
                      )}
                    />
                    <div className="h-2 rounded-full bg-muted-foreground/12" />
                    <div className="h-2 rounded-full bg-muted-foreground/12" />
                  </div>
                ))}
              </div>

              <div className="rounded-md bg-foreground/[0.075] p-3 dark:bg-white/[0.09]">
                <div className="mb-3 flex gap-1.5">
                  <div className="size-2 rounded-full bg-muted-foreground/22" />
                  <div className="size-2 rounded-full bg-muted-foreground/16" />
                </div>
                <div className="space-y-2">
                  {codeLines.map((width, index) => (
                    <div
                      key={index}
                      className={cn("h-2 rounded-full bg-foreground/14", width)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-r-md border-l-2 border-foreground/12 bg-muted/25 py-2.5 pr-3 pl-3">
                <div className="size-8 rounded-md bg-foreground/12" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-2.5 w-5/12 rounded-full bg-foreground/18" />
                  <div className="h-2 w-full rounded-full bg-muted-foreground/14" />
                </div>
                <div className="size-6 rounded-full bg-background ring-1 ring-border" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="打开 MarkdownRenderer 预览"
        onPointerEnter={showCta}
        onPointerLeave={hideCta}
        onMouseEnter={showCta}
        onMouseLeave={hideCta}
        onFocus={showCta}
        onBlur={hideCta}
        onClick={openMarkdownDialog}
        className={cn(
          "absolute inset-0 z-10 isolate flex items-center justify-center overflow-hidden bg-background/0 px-6 text-center",
          "transition-[background-color,backdrop-filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          "hover:bg-background/20 hover:backdrop-blur-[0.75px] hover:duration-300 focus-visible:bg-background/20 focus-visible:backdrop-blur-[0.75px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-inset",
          "[&:focus-visible_.markdown-renderer-preview-glow]:scale-100 [&:focus-visible_.markdown-renderer-preview-glow]:opacity-100 [&:focus-visible_.markdown-renderer-preview-glow]:duration-500",
          "[&:hover_.markdown-renderer-preview-glow]:scale-100 [&:hover_.markdown-renderer-preview-glow]:opacity-100 [&:hover_.markdown-renderer-preview-glow]:duration-500",
          open ? "pointer-events-none" : "cursor-pointer",
        )}
      >
        <span
          aria-hidden
          className="markdown-renderer-preview-glow pointer-events-none absolute size-64 scale-75 rounded-full bg-background/70 opacity-0 blur-3xl transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
        />
        <motion.span
          className="group/markdown-renderer-cta relative flex items-center gap-2.5 rounded-full border border-foreground/10 bg-background/88 py-1.5 pr-3.5 pl-1.5 text-foreground shadow-[0_14px_36px_-18px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.7)_inset] backdrop-blur-xl transition-shadow duration-500 ease-out hover:shadow-[0_18px_42px_-18px_rgba(0,0,0,0.58),0_1px_0_rgba(255,255,255,0.7)_inset] dark:border-white/80 dark:bg-white/95 dark:text-zinc-950 dark:shadow-[0_18px_48px_-18px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.95)_inset] dark:hover:shadow-[0_20px_52px_-18px_rgba(0,0,0,0.95),0_1px_0_rgba(255,255,255,0.95)_inset]"
          initial={false}
          animate={{
            opacity: ctaVisible ? 1 : 0,
            y: prefersReducedMotion ? 0 : ctaVisible ? 0 : 16,
            scale: ctaVisible ? 1 : 0.975,
          }}
          transition={{
            duration: prefersReducedMotion ? 0 : ctaVisible ? 0.28 : 0.36,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background shadow-sm dark:bg-zinc-950 dark:text-white">
            <MousePointer2Icon className="size-3.5" />
          </span>
          <span className="text-sm font-medium">预览 Markdown</span>
          <ArrowUpRightIcon className="size-3.5 text-muted-foreground transition-transform duration-300 ease-out group-hover/markdown-renderer-cta:translate-x-0.5 group-hover/markdown-renderer-cta:-translate-y-0.5 motion-reduce:transition-none dark:text-zinc-500" />
        </motion.span>
      </button>

      <ScrollableDialog
        open={open}
        onOpenChange={setOpen}
        maxWidth="sm:max-w-[600px] md:max-w-[720px]"
      >
        <ScrollableDialogHeader className="px-5 py-4 pr-12 text-left">
          <DialogTitle>MarkdownRenderer Preview</DialogTitle>
          <DialogDescription>
            使用 MarkdownRenderer 在弹窗内容区渲染真实 Markdown。
          </DialogDescription>
        </ScrollableDialogHeader>
        <ScrollableDialogContent fadeMaskHeight={48}>
          <MarkdownRenderer
            content={homeMarkdownPreviewContent}
            codeBlockDisplayMode="collapse"
            codeBlockMaxLines={7}
            codeBlockColorTheme="github"
            className={cn(
              "min-w-0 max-w-full overflow-hidden",
              "[&_h1]:mt-6 [&_h1]:mb-4 [&_h1]:break-words [&_h1]:text-[clamp(2rem,9vw,2.5rem)]",
              "[&_h2]:break-words [&_h2]:text-[clamp(1.625rem,7vw,1.875rem)]",
              "[&_p]:break-words",
              "[&_ul]:ml-0 [&_ul]:list-inside sm:[&_ul]:ml-6 sm:[&_ul]:list-disc",
              "[&_table]:table-fixed [&_td]:break-words [&_td]:px-3 [&_th]:break-words [&_th]:px-3",
            )}
          />
        </ScrollableDialogContent>
        <ScrollableDialogFooter className="flex flex-col-reverse items-center justify-end gap-2 sm:flex-row">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setOpen(false)}
          >
            关闭
          </Button>
        </ScrollableDialogFooter>
      </ScrollableDialog>
    </div>
  );
}

function ColorPickerPreview() {
  const [color, setColor] = React.useState("#6366F1");
  const swatches = ["#6366F1", "#06B6D4", "#F59E0B", "#22C55E"];

  return (
    <div className="flex flex-col items-center gap-4">
      <ColorPicker
        value={color}
        onChange={setColor}
        triggerSize="lg"
        presetColors={swatches}
        showRecent={false}
      />
      <div className="flex items-center gap-2">
        {swatches.map((swatch) => (
          <button
            key={swatch}
            type="button"
            aria-label={`选择 ${swatch}`}
            onClick={() => setColor(swatch)}
            className="size-6 rounded-full border"
            style={{ backgroundColor: swatch }}
          />
        ))}
      </div>
      <code className="rounded-md bg-muted px-2 py-1 text-xs">{color}</code>
    </div>
  );
}

function TourPreview() {
  const [open, setOpen] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [ctaVisible, setCtaVisible] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();
  const canHover = useHoverSupport();
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  const steps = React.useMemo<TourStep[]>(
    () => [
      {
        id: "home-tour-toolbar",
        target: () => toolbarRef.current,
        title: "顶部工具栏",
        content: "Tour 会聚焦到指定目标，并把说明贴近目标展示。",
        placement: "bottom",
        align: "center",
      },
      {
        id: "home-tour-sidebar",
        target: () => sidebarRef.current,
        title: "侧边区域",
        content: "步骤可以绑定页面上的任意元素。",
        placement: "bottom",
        align: "start",
      },
      {
        id: "home-tour-panel",
        target: () => panelRef.current,
        title: "主要内容",
        content: "最后一步收束到关键内容区，完成一次引导流程。",
        placement: "top",
        align: "center",
      },
    ],
    [],
  );

  const isFirstEffect = React.useRef(true);

  React.useEffect(() => {
    if (isFirstEffect.current) {
      isFirstEffect.current = false;
      // canHover 的 SSR 默认值为 false，首次 effect 时尚未结算，
      // 用同步 matchMedia 判断避免桌面端闪现
      if (!window.matchMedia("(hover: hover)").matches && !open) {
        setCtaVisible(true);
      }
      return;
    }
    if (!canHover && !open) {
      setCtaVisible(true);
    } else if (canHover && !open) {
      setCtaVisible(false);
    }
  }, [canHover, open]);

  const startTour = () => {
    setCtaVisible(false);
    setCurrentStep(0);
    setOpen(true);
  };

  const showCta = () => {
    if (open) return;
    setCtaVisible(true);
  };

  const hideCta = () => {
    if (open || !canHover) return;
    setCtaVisible(false);
  };

  return (
    <div className="group/tour-preview relative -m-4 flex h-[calc(100%+2rem)] min-h-[260px] w-[calc(100%+2rem)] items-center justify-center overflow-hidden p-5 sm:p-6">
      <div
        className={cn(
          "relative z-0 h-full min-h-[210px] w-full max-w-2xl overflow-hidden rounded-lg border bg-background p-3 transition-[filter,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none group-hover/tour-preview:saturate-[0.88] group-hover/tour-preview:opacity-90 group-hover/tour-preview:duration-300 sm:p-4",
          !canHover && !open && "saturate-[0.92] opacity-[0.94]",
        )}
      >
        <div className="flex h-full min-h-0 flex-col gap-3">
          <div
            ref={toolbarRef}
            className="flex h-10 shrink-0 items-center gap-2 rounded-md border bg-muted/35 px-3 sm:h-12 sm:px-4"
          >
            <div className="size-5 shrink-0 rounded-full bg-muted-foreground/25 sm:size-6" />
            <div className="h-2.5 w-24 max-w-[44%] rounded-full bg-muted-foreground/20 sm:w-40" />
            <div className="ml-auto flex shrink-0 gap-1.5 sm:gap-2">
              <div className="size-5 rounded bg-muted-foreground/15 sm:size-7" />
              <div className="size-5 rounded bg-muted-foreground/15 sm:size-7" />
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[76px_minmax(0,1fr)] gap-3 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-4">
            <div
              ref={sidebarRef}
              className="space-y-2 rounded-md border bg-muted/25 p-2 sm:p-3"
            >
              <div className="h-6 rounded bg-muted-foreground/20 sm:h-8" />
              <div className="h-6 rounded bg-muted-foreground/12 sm:h-8" />
              <div className="h-6 rounded bg-muted-foreground/12 sm:h-8" />
            </div>

            <div
              ref={panelRef}
              className="flex min-h-0 flex-col justify-between rounded-md border bg-muted/20 p-3 sm:p-4"
            >
              <div className="space-y-2">
                <div className="h-3 w-28 max-w-[48%] rounded-full bg-muted-foreground/20 sm:w-44" />
                <div className="h-2.5 rounded-full bg-muted-foreground/14" />
                <div className="h-2.5 w-5/6 rounded-full bg-muted-foreground/14" />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:gap-3">
                <div className="h-10 rounded bg-muted-foreground/12 sm:h-14" />
                <div className="h-10 rounded bg-muted-foreground/12 sm:h-14" />
                <div className="h-10 rounded bg-muted-foreground/12 sm:h-14" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="体验 Tour 引导"
        onPointerEnter={showCta}
        onPointerLeave={hideCta}
        onFocus={showCta}
        onBlur={hideCta}
        onClick={startTour}
        className={cn(
          "absolute inset-0 z-10 isolate flex items-center justify-center overflow-hidden bg-background/0 px-6 text-center",
          "transition-[background-color,backdrop-filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          "hover:bg-background/20 hover:backdrop-blur-[0.75px] hover:duration-300 focus-visible:bg-background/20 focus-visible:backdrop-blur-[0.75px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-inset",
          "[&:focus-visible_.tour-preview-glow]:scale-100 [&:focus-visible_.tour-preview-glow]:opacity-100 [&:focus-visible_.tour-preview-glow]:duration-500",
          "[&:hover_.tour-preview-glow]:scale-100 [&:hover_.tour-preview-glow]:opacity-100 [&:hover_.tour-preview-glow]:duration-500",
          open ? "pointer-events-none" : "cursor-pointer",
        )}
      >
        <span
          aria-hidden
          className="tour-preview-glow pointer-events-none absolute size-64 scale-75 rounded-full bg-background/70 opacity-0 blur-3xl transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
        />
        <motion.span
          className="group/tour-cta tour-preview-cta relative flex items-center gap-2.5 rounded-full border border-foreground/10 bg-background/88 py-1.5 pr-3.5 pl-1.5 text-foreground shadow-[0_14px_36px_-18px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.7)_inset] backdrop-blur-xl transition-shadow duration-500 ease-out hover:shadow-[0_18px_42px_-18px_rgba(0,0,0,0.58),0_1px_0_rgba(255,255,255,0.7)_inset] dark:border-white/80 dark:bg-white/95 dark:text-zinc-950 dark:shadow-[0_18px_48px_-18px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.95)_inset] dark:hover:shadow-[0_20px_52px_-18px_rgba(0,0,0,0.95),0_1px_0_rgba(255,255,255,0.95)_inset]"
          initial={false}
          animate={{
            opacity: ctaVisible ? 1 : 0,
            y: prefersReducedMotion ? 0 : ctaVisible ? 0 : 16,
            scale: ctaVisible ? 1 : 0.975,
          }}
          transition={{
            duration: prefersReducedMotion ? 0 : ctaVisible ? 0.28 : 0.36,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background shadow-sm dark:bg-zinc-950 dark:text-white">
            <MousePointer2Icon className="size-3.5" />
          </span>
          <span className="text-sm font-medium tracking-[-0.01em]">
            体验 Tour 引导
          </span>
          <ArrowUpRightIcon className="size-3.5 text-muted-foreground transition-transform duration-300 ease-out group-hover/tour-cta:translate-x-0.5 group-hover/tour-cta:-translate-y-0.5 motion-reduce:transition-none dark:text-zinc-500" />
        </motion.span>
      </button>

      <Tour
        open={open}
        onOpenChange={setOpen}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        steps={steps}
        popoverWidth={260}
        viewportPadding={12}
        scrollIntoView={false}
        maskClosable
        allowTargetInteraction
      />
    </div>
  );
}

function SmoothCornersPreview() {
  const supportsSmoothCorners = useSmoothCornersSupport();

  return (
    <div className="w-full max-w-xs space-y-2.5">
      <SmoothCornersSupportNotice supported={supportsSmoothCorners} compact />

      {supportsSmoothCorners === true && (
        <div className="flex w-full items-end gap-3">
          {[
            {
              label: "0",
              smoothing: 0,
              className: "bg-primary text-primary-foreground",
            },
            {
              label: "0.6",
              smoothing: 0.6,
              className: "bg-primary text-primary-foreground",
            },
          ].map((item) => (
            <SmoothCorners
              key={item.label}
              radius={24}
              smoothing={item.smoothing}
              style={
                item.smoothing === 0
                  ? ({ cornerShape: "round" } as React.CSSProperties)
                  : undefined
              }
              className={cn(
                "flex h-24 min-w-0 flex-1 flex-col justify-between p-3 text-xs shadow-sm",
                item.className,
              )}
            >
              {item.smoothing === 0 ? (
                <CircleOffIcon className="size-3.5" aria-hidden="true" />
              ) : (
                <span className="font-medium">smooth</span>
              )}
              <span
                className={cn(
                  item.smoothing === 0
                    ? "whitespace-nowrap text-[10px] font-medium"
                    : "font-mono",
                )}
              >
                {item.smoothing === 0 ? "普通圆角" : item.label}
              </span>
            </SmoothCorners>
          ))}
        </div>
      )}

      {supportsSmoothCorners === false && (
        <div className="flex items-center justify-center gap-3">
          <SmoothCorners
            radius={24}
            smoothing={0.6}
            className="flex h-20 w-28 shrink-0 flex-col justify-between bg-primary p-3 text-primary-foreground shadow-sm"
          >
            <TriangleAlertIcon className="size-3.5" aria-hidden="true" />
            <span className="font-mono text-[10px]">border-radius</span>
          </SmoothCorners>
          <p className="max-w-24 text-[11px] leading-4 text-muted-foreground">
            平滑度对比已隐藏，避免误判为没有差异。
          </p>
        </div>
      )}

      {supportsSmoothCorners === null && (
        <SmoothCorners
          radius={24}
          smoothing={0}
          className="mx-auto h-20 w-28 animate-pulse bg-muted"
          aria-hidden="true"
        ></SmoothCorners>
      )}
    </div>
  );
}

export const homePreviewComponents: Partial<
  Record<ComponentId, React.ComponentType>
> = {
  [ComponentId.ANIMATED_NUMBER]: AnimatedNumberPreview,
  [ComponentId.MATRIX_EFFECT]: MatrixEffectPreview,
  [ComponentId.RESPONSIVE_TABS]: ResponsiveTabsPreview,
  [ComponentId.CLIP_PATH_TABS]: ClipPathTabsPreview,
  [ComponentId.SEGMENTED_CONTROL]: SegmentedControlPreview,
  [ComponentId.SCROLLABLE_DIALOG]: ScrollableDialogPreview,
  [ComponentId.DOT_GLASS]: DotGlassPreview,
  [ComponentId.IMAGE_VIEWER]: ImageViewerPreview,
  [ComponentId.DUAL_STATE_TOGGLE]: DualStateTogglePreview,
  [ComponentId.THEME_TRANSITION_TOGGLE]: ThemeTransitionTogglePreview,
  [ComponentId.CODE_BLOCK]: CodeBlockPreview,
  [ComponentId.TYPEWRITER]: TypewriterPreview,
  [ComponentId.MARKDOWN_RENDERER]: MarkdownRendererPreview,
  [ComponentId.COLOR_PICKER]: ColorPickerPreview,
  [ComponentId.SMOOTH_CORNERS]: SmoothCornersPreview,
  [ComponentId.TOUR]: TourPreview,
};
