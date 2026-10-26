"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import {
  HeartIcon,
  ListPlusIcon,
  LoaderCircleIcon,
  QuoteIcon,
  RotateCcwIcon,
  ShuffleIcon,
  Trash2Icon,
  TrendingUpIcon,
  XIcon,
} from "lucide-react";

import {
  Masonry,
  MasonryImage,
  MasonrySkeleton,
  type MasonryLayoutInfo,
  type MasonryStrategy,
} from "@/components/qiuye-ui/masonry";
import { SegmentedControl } from "@/components/qiuye-ui/segmented-control";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ViewSourceButton } from "@/components/view-source-button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* 演示数据：Unsplash 照片                                               */
/* ------------------------------------------------------------------ */

// 已验证可访问的 Unsplash 照片 ID（fit=crop 可以按任意比例裁切）。
const PHOTO_IDS = [
  "1500530855697-b586d89ba3ee",
  "1482192596544-9eb780fc7f66",
  "1506905925346-21bda4d32df4",
  "1469474968028-56623f02e42e",
  "1441974231531-c6227db76b6e",
  "1470071459604-3b5ec3a7fe05",
  "1501785888041-af3ef285b470",
  "1447752875215-b2761acb3c5d",
  "1433086966358-54859d0ed716",
  "1472214103451-9374bd1c798e",
  "1490750967868-88aa4486c946",
  "1507525428034-b723cf961d3e",
  "1493246507139-91e8fad9978e",
  "1500964757637-c85e8a162699",
  "1426604966848-d7adac402bff",
  "1465146344425-f00d5f5c8f07",
  "1418065460487-3e41a6c84dc5",
  "1454496522488-7a8e488e8606",
  "1519681393784-d120267933ba",
  "1502082553048-f009c37129b9",
  "1494500764479-0c8f2919a3d8",
  "1511884642898-4c92249e20b6",
  "1475924156734-496f6cac6ec1",
  "1505765050516-f72dcac9c60e",
  "1414609245224-afa02bfb3fda",
  "1500534314209-a25ddb2bd429",
];

/** 宽 : 高 */
const PHOTO_RATIOS: Array<[number, number]> = [
  [3, 4],
  [4, 5],
  [2, 3],
  [1, 1],
  [4, 3],
  [3, 2],
  [5, 7],
  [4, 5],
  [3, 4],
  [16, 10],
];

const PHOTO_TITLES = [
  "晨光",
  "远山",
  "林间",
  "海风",
  "旷野",
  "薄雾",
  "溪流",
  "云端",
  "旅途",
  "静谧",
  "回声",
  "黄昏",
  "山谷",
  "湖畔",
  "微光",
  "远行",
];

interface Photo {
  id: string;
  src: string;
  width: number;
  height: number;
  title: string;
  likes: number;
}

function photoUrl(id: string, width: number, height: number) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&h=${height}&q=70`;
}

/** 第 n 张照片：7 与 26 互质，依次取遍所有 ID，比例与 ID 错开循环 */
function makePhoto(n: number): Photo {
  const id = PHOTO_IDS[(n * 7) % PHOTO_IDS.length];
  const [rw, rh] =
    PHOTO_RATIOS[(n * 3 + Math.floor(n / PHOTO_IDS.length)) % PHOTO_RATIOS.length];
  const width = 600;
  const height = Math.round((width * rh) / rw);
  return {
    id: `photo-${n}`,
    src: photoUrl(id, width, height),
    width,
    height,
    title: PHOTO_TITLES[n % PHOTO_TITLES.length],
    likes: 40 + ((n * 37) % 260),
  };
}

/* ------------------------------------------------------------------ */
/* 首页 / 详情页快速预览：彩色渐变块，骨架 → 入场 → 定时打乱                 */
/* ------------------------------------------------------------------ */

const PREVIEW_PALETTE: Array<[string, string]> = [
  ["#ffd3b0", "#ff8f6b"],
  ["#b9ecd6", "#3fbf9a"],
  ["#c3d0ff", "#6a7dff"],
  ["#f8c4ea", "#d46ec4"],
  ["#ffe6a3", "#f6ad3c"],
  ["#aee9ff", "#3fa2f5"],
  ["#dacbff", "#8e6cf0"],
  ["#cdeec6", "#6bbf6a"],
];

interface PreviewTile {
  id: string;
  /** 高 / 宽 */
  ratio: number;
  colors: [string, string];
  lines: boolean;
}

const PREVIEW_RATIOS = [
  1.25, 0.8, 1.5, 1, 1.3, 0.75, 1.15, 0.9, 1.4, 0.85, 1.2, 1, 1.35, 0.8, 1.1, 1.45,
  0.9, 1.2, 0.78, 1.3,
];

const PREVIEW_TILES: PreviewTile[] = PREVIEW_RATIOS.map((ratio, index) => ({
  id: `tile-${index}`,
  ratio,
  colors: PREVIEW_PALETTE[(index * 3) % PREVIEW_PALETTE.length],
  lines: index % 3 === 1,
}));

const NO_TILES: PreviewTile[] = [];
const PREVIEW_COLUMNS = { 0: 2, 240: 3, 480: 4, 640: 5 };

function shuffled<T>(list: readonly T[]) {
  const next = [...list];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [next[index], next[swap]] = [next[swap], next[index]];
  }
  // 避免偶尔打乱后与原顺序相同
  if (next.every((item, index) => item === list[index]) && next.length > 1) {
    [next[0], next[1]] = [next[1], next[0]];
  }
  return next;
}

function PreviewTileView({ tile }: { tile: PreviewTile }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl shadow-[inset_0_1px_0_rgb(255_255_255/0.35)]"
      style={{
        aspectRatio: `1 / ${tile.ratio}`,
        backgroundImage: `linear-gradient(160deg, ${tile.colors[0]}, ${tile.colors[1]})`,
      }}
    >
      <span
        aria-hidden
        className="absolute -top-1/3 -left-1/4 size-3/4 rounded-full bg-white/25 blur-2xl"
      />
      {tile.lines ? (
        <span aria-hidden className="absolute inset-x-2.5 bottom-2.5 space-y-1.5">
          <span className="block h-1.5 w-3/5 rounded-full bg-white/80" />
          <span className="block h-1.5 w-2/5 rounded-full bg-white/55" />
        </span>
      ) : null}
    </div>
  );
}

const renderPreviewTile = (tile: PreviewTile) => <PreviewTileView tile={tile} />;
const previewTileKey = (tile: PreviewTile) => tile.id;

type PreviewPhase = "loading" | "ready";

/** Masonry 快速预览：骨架微光 → 彩色块自上而下入场 → 每 3.5 秒打乱一次 */
export function MasonryPreview() {
  const frameRef = useRef<HTMLDivElement>(null);
  const inView = useInView(frameRef, { margin: "120px 0px" });
  const reducedMotion = useReducedMotion();
  const [state, setState] = useState<{
    phase: PreviewPhase;
    tiles: PreviewTile[];
    shuffles: number;
  }>({ phase: "loading", tiles: PREVIEW_TILES, shuffles: 0 });

  useEffect(() => {
    // 减少动态效果时直接显示内容，不循环。
    if (reducedMotion) {
      if (state.phase !== "ready") {
        setState({ phase: "ready", tiles: PREVIEW_TILES, shuffles: 0 });
      }
      return;
    }
    // 离开视口时暂停，回来后从当前阶段继续。
    if (!inView) return;
    const timer = window.setTimeout(
      () =>
        setState((previous) => {
          if (previous.phase === "loading") {
            return { phase: "ready", tiles: PREVIEW_TILES, shuffles: 0 };
          }
          if (previous.shuffles >= 3) {
            return { phase: "loading", tiles: previous.tiles, shuffles: 0 };
          }
          return {
            phase: "ready",
            tiles: shuffled(previous.tiles),
            shuffles: previous.shuffles + 1,
          };
        }),
      state.phase === "loading" ? 1900 : 3500,
    );
    return () => window.clearTimeout(timer);
  }, [inView, reducedMotion, state]);

  // 纯装饰的循环预览：对读屏与键盘隐藏，不反复播报「正在加载」，也不暴露 20 个空列表项
  return (
    <div
      ref={frameRef}
      aria-hidden
      inert
      className="@container relative h-full min-h-[330px] w-full overflow-clip [mask-image:linear-gradient(to_bottom,black_80%,transparent)]"
    >
      <Masonry
        className="absolute inset-x-0 top-0"
        items={state.phase === "ready" ? state.tiles : NO_TILES}
        getItemKey={previewTileKey}
        renderItem={renderPreviewTile}
        loading={state.phase === "loading"}
        skeletonCount={PREVIEW_TILES.length}
        columns={PREVIEW_COLUMNS}
        gap={8}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 演示 1：图片瀑布流 + 无限加载                                          */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 12;
const FEED_TOTAL = 60;

function PhotoCard({ photo }: { photo: Photo }) {
  return (
    <figure>
      <MasonryImage
        src={photo.src}
        alt={`示例照片：${photo.title}`}
        width={photo.width}
        height={photo.height}
        className="rounded-xl"
      />
      <figcaption className="flex items-center justify-between gap-2 px-0.5 pt-2 text-xs">
        <span className="truncate font-medium">{photo.title}</span>
        <span className="flex shrink-0 items-center gap-1 text-muted-foreground tabular-nums">
          <HeartIcon aria-hidden className="size-3" />
          {photo.likes}
        </span>
      </figcaption>
    </figure>
  );
}

const renderPhoto = (photo: Photo) => <PhotoCard photo={photo} />;
const photoKey = (photo: Photo) => photo.id;

const feedCode = `import { useCallback, useEffect, useRef, useState } from "react";
import { Masonry, MasonryImage } from "@/components/qiuye-ui/masonry";

const PAGE_SIZE = 12;

export function PhotoFeed() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // 加载更多：try / finally 保证请求失败时也会结束 loading（失败后不会自动重试，
  // 等最短一列的底部再次进入视口时才会再次触发）
  const loadMore = useCallback(async () => {
    setLoading(true);
    try {
      const next = await fetchPhotos({ offset: photos.length, limit: PAGE_SIZE });
      setPhotos((prev) => [...prev, ...next]);
      setHasMore(next.length === PAGE_SIZE);
    } finally {
      setLoading(false);
    }
  }, [photos.length]);

  // 首屏：loading 初始为 true，铺满骨架。可取消，StrictMode 下的二次执行不会重复请求。
  useEffect(() => {
    let cancelled = false;
    fetchPhotos({ offset: 0, limit: PAGE_SIZE })
      .then((next) => {
        if (cancelled) return;
        setPhotos(next);
        setHasMore(next.length === PAGE_SIZE);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      ref={scrollerRef}
      tabIndex={0}
      role="region"
      aria-label="图片瀑布流"
      className="h-[560px] overflow-y-auto rounded-xl border p-3"
    >
      <Masonry
        items={photos}
        getItemKey={(photo) => photo.id}
        renderItem={(photo) => (
          <figure>
            <MasonryImage
              src={photo.src}
              alt={photo.title}
              width={photo.width} // 只用来得出宽高比：加载前后高度不变，不会重排
              height={photo.height}
              className="rounded-xl"
            />
            <figcaption className="pt-2 text-xs">{photo.title}</figcaption>
          </figure>
        )}
        minColumnWidth={130}
        maxColumns={5}
        gap={12}
        loading={loading} // 已有数据时，骨架落在最短的几列底部
        hasMore={hasMore}
        onLoadMore={loadMore} // 最短一列的底部接近可视区域时触发
        loadMoreOffset={240}
        scrollRoot={scrollerRef} // 在自定义滚动容器中滚动
      />
      {!hasMore && (
        <p className="py-6 text-center text-xs text-muted-foreground">没有更多了</p>
      )}
    </div>
  );
}`;

function PhotoFeedDemo() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(0);
  const loadedRef = useRef(0);
  const timerRef = useRef(0);
  const hasMore = photos.length < FEED_TOTAL;

  // 模拟网络请求：900–1500ms 后返回下一页。
  const loadMore = useCallback(() => {
    window.clearTimeout(timerRef.current);
    setLoading(true);
    timerRef.current = window.setTimeout(
      () => {
        const start = loadedRef.current;
        loadedRef.current = start + PAGE_SIZE;
        setPhotos((previous) => [
          ...previous,
          ...Array.from({ length: PAGE_SIZE }, (_, index) => makePhoto(start + index)),
        ]);
        setLoading(false);
      },
      900 + Math.random() * 600,
    );
  }, []);

  useEffect(() => {
    loadMore();
    return () => window.clearTimeout(timerRef.current);
  }, [loadMore, session]);

  const reload = () => {
    window.clearTimeout(timerRef.current);
    loadedRef.current = 0;
    setPhotos([]);
    setSession((value) => value + 1);
    scrollerRef.current?.scrollTo({ top: 0 });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>图片瀑布流 · 无限加载</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={reload}>
              <RotateCcwIcon />
              重新加载
            </Button>
            <ViewSourceButton
              code={feedCode}
              description="在自定义滚动容器中无限加载，fetchPhotos 替换为你的接口。"
            />
          </div>
        </div>
        <CardDescription>
          首屏铺满高度错落的骨架，整面墙共享一道对角线微光；图片按宽高比占位，加载后柔和淡入。
          滚到底部时骨架出现在最短的几列底部——正是新内容将要出现的位置。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref={scrollerRef}
          tabIndex={0}
          role="region"
          aria-label="图片瀑布流"
          className="h-[480px] overflow-y-auto overscroll-contain rounded-xl border bg-muted/20 p-3 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:h-[560px] sm:p-4"
        >
          <Masonry
            items={photos}
            getItemKey={photoKey}
            renderItem={renderPhoto}
            minColumnWidth={130}
            maxColumns={5}
            gap={12}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            loadMoreOffset={240}
            scrollRoot={scrollerRef}
          />
          {!hasMore && !loading ? (
            <p className="pt-6 pb-2 text-center text-xs text-muted-foreground">
              没有更多了 · 共 {photos.length} 张
            </p>
          ) : null}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
          {loading ? (
            <LoaderCircleIcon aria-hidden className="size-3.5 animate-spin" />
          ) : null}
          已加载 {photos.length} / {FEED_TOTAL} 张 · 照片来自 Unsplash
        </p>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 演示 2：参数调试                                                      */
/* ------------------------------------------------------------------ */

interface Tile {
  id: number;
  height: number;
  hue: number;
}

const makeTile = (id: number): Tile => ({
  id,
  height: 64 + ((id * 53) % 150),
  hue: (id * 47) % 360,
});

const INITIAL_TILES = Array.from({ length: 18 }, (_, index) => makeTile(index + 1));

function TileView({ tile }: { tile: Tile }) {
  return (
    <div
      className="flex items-end rounded-xl p-2.5 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.28)]"
      style={{
        height: tile.height,
        backgroundImage: `linear-gradient(160deg, oklch(0.8 0.11 ${tile.hue}), oklch(0.62 0.15 ${(tile.hue + 40) % 360}))`,
      }}
    >
      <span className="tabular-nums [text-shadow:0_1px_2px_rgb(0_0_0/0.25)]">
        #{tile.id}
      </span>
    </div>
  );
}

const renderTile = (tile: Tile) => <TileView tile={tile} />;
const tileKey = (tile: Tile) => tile.id;

type ColumnsMode = "auto" | "fixed" | "responsive";

interface PlaygroundConfig {
  mode: ColumnsMode;
  minColumnWidth: number;
  maxColumns: number;
  fixedColumns: number;
  gap: number;
  strategy: MasonryStrategy;
  appear: boolean;
  animateLayout: boolean;
}

const PLAYGROUND_DEFAULTS: PlaygroundConfig = {
  mode: "auto",
  minColumnWidth: 120,
  maxColumns: 6,
  fixedColumns: 3,
  gap: 12,
  strategy: "shortest",
  appear: true,
  animateLayout: true,
};

const RESPONSIVE_COLUMNS = { 0: 2, 480: 3, 720: 4 };
const MIN_FRAME_WIDTH = 220;

function ParamSlider({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
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
        step={1}
        value={[value]}
        onValueChange={([next]) => onChange(next)}
        aria-label={label}
      />
    </div>
  );
}

/** 可拖动右边缘调整宽度的容器，用来演示「按容器宽度」自适应列数。 */
function ResizableFrame({
  width,
  onWidthChange,
  children,
}: {
  /** null 表示铺满 */
  width: number | null;
  onWidthChange: (width: number | null) => void;
  children: React.ReactNode;
}) {
  const areaRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(0);
  const dragRef = useRef<{ pointerId: number; startX: number; startWidth: number } | null>(
    null,
  );

  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    const observer = new ResizeObserver(([entry]) =>
      setAvailable(entry.contentRect.width),
    );
    observer.observe(area);
    return () => observer.disconnect();
  }, []);

  const measured = available > 0;
  const current = width === null ? available : Math.min(width, available);
  const commit = (next: number) => {
    if (!measured) return;
    const clamped = Math.max(MIN_FRAME_WIDTH, Math.min(available, next));
    onWidthChange(clamped >= available - 1 ? null : clamped);
  };

  return (
    <div ref={areaRef} className="relative">
      <div
        ref={frameRef}
        className="relative rounded-xl border border-dashed bg-muted/25"
        style={{ width: width === null ? "100%" : current }}
      >
        {/* 限制高度、超出时在框内滚动：拖动把手始终在框的可见范围内；
            窄屏上参数控件就在框下方，调整时能同时看到效果 */}
        <div className="max-h-[440px] overflow-y-auto p-3 pr-5 [scrollbar-width:thin] lg:max-h-[600px]">
          {children}
        </div>
        <div
          role="slider"
          tabIndex={0}
          aria-label="容器宽度"
          aria-valuemin={MIN_FRAME_WIDTH}
          aria-valuemax={measured ? Math.round(available) : undefined}
          aria-valuenow={measured ? Math.round(current) : undefined}
          aria-valuetext={measured ? `${Math.round(current)}px` : undefined}
          aria-orientation="horizontal"
          className="group/handle absolute inset-y-0 -right-2.5 flex w-5 cursor-ew-resize touch-none items-center justify-center outline-none pointer-coarse:-right-5.5 pointer-coarse:w-11"
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            dragRef.current = {
              pointerId: event.pointerId,
              startX: event.clientX,
              startWidth: frameRef.current?.getBoundingClientRect().width ?? current,
            };
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current;
            if (!drag || drag.pointerId !== event.pointerId) return;
            commit(drag.startWidth + event.clientX - drag.startX);
          }}
          onPointerUp={() => {
            dragRef.current = null;
          }}
          onPointerCancel={() => {
            dragRef.current = null;
          }}
          onLostPointerCapture={(event) => {
            // 触摸时内部的竖条先被隐式捕获，转交捕获时它的 lostpointercapture 会冒泡上来（PIT-0011）
            if (event.target !== event.currentTarget) return;
            dragRef.current = null;
          }}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 64 : 16;
            if (event.key === "ArrowLeft" || event.key === "ArrowDown") commit(current - step);
            else if (event.key === "ArrowRight" || event.key === "ArrowUp") commit(current + step);
            else if (event.key === "PageDown") commit(current - 64);
            else if (event.key === "PageUp") commit(current + 64);
            else if (event.key === "Home") commit(MIN_FRAME_WIDTH);
            else if (event.key === "End") commit(available);
            else return;
            event.preventDefault();
          }}
        >
          <span className="h-12 w-1.5 shrink-0 rounded-full bg-foreground/25 shadow-sm transition-[background-color,height] duration-200 group-hover/handle:h-16 group-hover/handle:bg-foreground/50 group-focus-visible/handle:h-16 group-focus-visible/handle:bg-primary group-active/handle:bg-foreground/70" />
        </div>
      </div>
    </div>
  );
}

function MasonryPlayground() {
  const [config, setConfig] = useState(PLAYGROUND_DEFAULTS);
  const [tiles, setTiles] = useState(INITIAL_TILES);
  // 编号放在 ref 中：「模拟加载」的定时器回调里追加时也能拿到最新的编号，不会产生重复的 key
  const nextIdRef = useRef(INITIAL_TILES.length + 1);
  const [loading, setLoading] = useState(false);
  const [frameWidth, setFrameWidth] = useState<number | null>(null);
  const [layout, setLayout] = useState<MasonryLayoutInfo | null>(null);
  const [mountKey, setMountKey] = useState(0);
  const loadTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(loadTimer.current), []);

  const update = (patch: Partial<PlaygroundConfig>) =>
    setConfig((previous) => ({ ...previous, ...patch }));

  const append = (count: number) => {
    const start = nextIdRef.current;
    nextIdRef.current = start + count;
    setTiles((previous) => [
      ...previous,
      ...Array.from({ length: count }, (_, index) => makeTile(start + index)),
    ]);
  };

  const removeRandom = () =>
    setTiles((previous) => {
      if (previous.length === 0) return previous;
      const index = Math.floor(Math.random() * previous.length);
      return previous.filter((_, itemIndex) => itemIndex !== index);
    });

  const simulateLoad = () => {
    if (loading) return;
    setLoading(true);
    loadTimer.current = window.setTimeout(() => {
      setLoading(false);
      append(6);
    }, 1400);
  };

  const reset = () => {
    window.clearTimeout(loadTimer.current);
    setConfig(PLAYGROUND_DEFAULTS);
    setTiles(INITIAL_TILES);
    nextIdRef.current = INITIAL_TILES.length + 1;
    setLoading(false);
    setFrameWidth(null);
    setMountKey((value) => value + 1);
  };

  const columns =
    config.mode === "fixed"
      ? config.fixedColumns
      : config.mode === "responsive"
        ? RESPONSIVE_COLUMNS
        : undefined;

  const code = [
    `<Masonry`,
    `  items={tiles}`,
    `  getItemKey={(tile) => tile.id}`,
    `  renderItem={(tile) => <Tile tile={tile} />}`,
    config.mode === "auto" ? `  minColumnWidth={${config.minColumnWidth}}` : null,
    config.mode === "auto" ? `  maxColumns={${config.maxColumns}}` : null,
    config.mode === "fixed" ? `  columns={${config.fixedColumns}}` : null,
    config.mode === "responsive"
      ? `  columns={{ 0: 2, 480: 3, 720: 4 }} // 键为容器宽度（px）`
      : null,
    `  gap={${config.gap}}`,
    config.strategy === "sequential" ? `  strategy="sequential"` : null,
    config.appear ? null : `  appear={false}`,
    config.animateLayout ? null : `  animateLayout={false}`,
    `  loading={loading}`,
    `  skeletonCount={6}`,
    `/>`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>参数调试</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcwIcon />
              重置
            </Button>
            <ViewSourceButton code={code} description="按当前参数生成的用法。" />
          </div>
        </div>
        <CardDescription>
          拖动虚线框右边缘改变容器宽度：宽度连续变化时各项跟手，列数变化时沿弹簧滑到新位置。
          列数按容器宽度计算，与视口无关。
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => append(3)}>
              <ListPlusIcon />
              追加
            </Button>
            <Button variant="outline" size="sm" onClick={removeRandom}>
              <Trash2Icon />
              随机删除
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTiles((previous) => shuffled(previous))}
            >
              <ShuffleIcon />
              打乱
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={simulateLoad}
              disabled={loading}
            >
              <LoaderCircleIcon className={cn(loading && "animate-spin")} />
              模拟加载
            </Button>
            <span className="ml-auto font-mono text-xs text-muted-foreground tabular-nums">
              {layout
                ? `${Math.round(layout.width)}px · ${layout.columns} 列 · 列宽 ${Math.round(layout.columnWidth)}px`
                : "测量中…"}
            </span>
          </div>
          <ResizableFrame width={frameWidth} onWidthChange={setFrameWidth}>
            <Masonry
              key={mountKey}
              items={tiles}
              getItemKey={tileKey}
              renderItem={renderTile}
              columns={columns}
              minColumnWidth={config.minColumnWidth}
              maxColumns={config.maxColumns}
              gap={config.gap}
              strategy={config.strategy}
              appear={config.appear}
              animateLayout={config.animateLayout}
              loading={loading}
              skeletonCount={6}
              onLayoutChange={setLayout}
            />
          </ResizableFrame>
        </div>

        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <p id="masonry-playground-columns" className="text-sm leading-none font-medium">
              列数
            </p>
            <SegmentedControl
              aria-labelledby="masonry-playground-columns"
              size="sm"
              items={[
                { value: "auto", label: "自动" },
                { value: "fixed", label: "固定" },
                { value: "responsive", label: "断点" },
              ]}
              value={config.mode}
              onValueChange={(value) => update({ mode: value as ColumnsMode })}
            />
            {config.mode === "responsive" ? (
              <p className="font-mono text-xs leading-5 text-muted-foreground">
                {"columns={{ 0: 2, 480: 3, 720: 4 }}"}
              </p>
            ) : null}
          </div>
          {config.mode === "auto" ? (
            <>
              <ParamSlider
                label="最小列宽 minColumnWidth"
                value={config.minColumnWidth}
                min={80}
                max={320}
                unit="px"
                onChange={(value) => update({ minColumnWidth: value })}
              />
              <ParamSlider
                label="最大列数 maxColumns"
                value={config.maxColumns}
                min={1}
                max={8}
                onChange={(value) => update({ maxColumns: value })}
              />
            </>
          ) : null}
          {config.mode === "fixed" ? (
            <ParamSlider
              label="列数 columns"
              value={config.fixedColumns}
              min={1}
              max={6}
              onChange={(value) => update({ fixedColumns: value })}
            />
          ) : null}
          <ParamSlider
            label="间距 gap"
            value={config.gap}
            min={0}
            max={32}
            unit="px"
            onChange={(value) => update({ gap: value })}
          />
          <div className="space-y-2">
            <p id="masonry-playground-strategy" className="text-sm leading-none font-medium">
              排布策略 strategy
            </p>
            <SegmentedControl
              aria-labelledby="masonry-playground-strategy"
              size="sm"
              items={[
                { value: "shortest", label: "最短列优先" },
                { value: "sequential", label: "按序轮流" },
              ]}
              value={config.strategy}
              onValueChange={(value) =>
                update({ strategy: value as MasonryStrategy })
              }
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="masonry-playground-animate" className="flex-col items-start gap-1">
              <span>位置过渡 animateLayout</span>
              <span className="text-xs font-normal text-muted-foreground">
                关闭后各项直接到位
              </span>
            </Label>
            <Switch
              id="masonry-playground-animate"
              checked={config.animateLayout}
              onCheckedChange={(checked) => update({ animateLayout: checked })}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="masonry-playground-appear" className="flex-col items-start gap-1">
              <span>首次入场 appear</span>
              <span className="text-xs font-normal text-muted-foreground">
                切换后重新挂载以查看效果
              </span>
            </Label>
            <Switch
              id="masonry-playground-appear"
              checked={config.appear}
              onCheckedChange={(checked) => {
                update({ appear: checked });
                setMountKey((value) => value + 1);
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 演示 3：筛选与排序（混合内容）                                          */
/* ------------------------------------------------------------------ */

type FeedCategory = "photo" | "text" | "data";

type FeedItem = {
  id: string;
  category: FeedCategory;
  /** 发布时间（越大越新） */
  date: number;
  /** 热度 */
  hot: number;
} & (
  | { kind: "photo"; photo: Photo }
  | { kind: "quote"; text: string; source: string }
  | { kind: "note"; title: string; body: string }
  | { kind: "stat"; label: string; value: string; trend: number[] }
);

const FEED_ITEMS: FeedItem[] = [
  { id: "f1", category: "photo", kind: "photo", date: 12, hot: 88, photo: makePhoto(2) },
  {
    id: "f2",
    category: "text",
    kind: "quote",
    date: 9,
    hot: 64,
    text: "好的过渡不会被注意到，它只是让变化显得理所当然。",
    source: "动效笔记",
  },
  {
    id: "f3",
    category: "text",
    kind: "note",
    date: 14,
    hot: 52,
    title: "稳定列",
    body: "已经排进某一列的项会一直留在该列。图片加载、内容展开只会让同一列下方的项上下平移，不会跨列跳动。",
  },
  {
    id: "f4",
    category: "data",
    kind: "stat",
    date: 6,
    hot: 71,
    label: "本周新增",
    value: "1,284",
    trend: [32, 44, 38, 52, 61, 58, 74],
  },
  { id: "f5", category: "photo", kind: "photo", date: 3, hot: 93, photo: makePhoto(5) },
  {
    id: "f6",
    category: "text",
    kind: "note",
    date: 11,
    hot: 47,
    title: "骨架屏",
    body: "骨架是排在真实项之后的虚拟项，同样走最短列优先。加载更多时它们自然填进最短的几列底部，内容到达后在几乎相同的位置淡入，读起来就像骨架变成了内容。",
  },
  { id: "f7", category: "photo", kind: "photo", date: 8, hot: 59, photo: makePhoto(9) },
  {
    id: "f8",
    category: "text",
    kind: "quote",
    date: 2,
    hot: 82,
    text: "留白不是空，是给内容呼吸的空间。",
    source: "排版手记",
  },
  {
    id: "f9",
    category: "data",
    kind: "stat",
    date: 13,
    hot: 38,
    label: "平均停留",
    value: "3m 42s",
    trend: [58, 52, 60, 47, 66, 70, 64],
  },
  {
    id: "f10",
    category: "text",
    kind: "note",
    date: 5,
    hot: 66,
    title: "无限加载",
    body: "瀑布流里最短的一列最先见底，所以加载哨兵放在最短一列的底部。",
  },
  { id: "f11", category: "photo", kind: "photo", date: 10, hot: 75, photo: makePhoto(14) },
  {
    id: "f12",
    category: "text",
    kind: "quote",
    date: 7,
    hot: 41,
    text: "先让它能用，再让它好用，最后让它好看。",
    source: "产品随想",
  },
  { id: "f13", category: "photo", kind: "photo", date: 1, hot: 68, photo: makePhoto(19) },
  {
    id: "f14",
    category: "text",
    kind: "note",
    date: 4,
    hot: 57,
    title: "减少动态效果",
    body: "系统开启减少动态效果时，各项直接到位，入场与退场只做短暂的淡入淡出，骨架不再扫光。",
  },
];

type FeedFilter = "all" | FeedCategory;
type FeedSort = "default" | "latest" | "hot";

function feedItemTitle(item: FeedItem) {
  if (item.kind === "photo") return item.photo.title;
  if (item.kind === "quote") return item.source;
  if (item.kind === "note") return item.title;
  return item.label;
}

function FeedCard({ item, onRemove }: { item: FeedItem; onRemove: () => void }) {
  // 视觉 24px，伪元素把可点区域扩到 44px；触屏上常驻但减弱
  const removeButton = (
    <button
      type="button"
      aria-label={`移除「${feedItemTitle(item)}」`}
      onClick={onRemove}
      className="absolute top-2 right-2 z-10 flex size-6 items-center justify-center rounded-full border bg-background/85 text-muted-foreground opacity-0 shadow-sm backdrop-blur transition-[opacity,color] duration-150 group-hover:opacity-100 after:absolute after:-inset-2.5 after:content-[''] hover:text-foreground focus-visible:opacity-100 pointer-coarse:top-1.5 pointer-coarse:right-1.5 pointer-coarse:bg-background/70 pointer-coarse:opacity-75 pointer-coarse:shadow-none"
    >
      <XIcon className="size-3.5" />
    </button>
  );

  if (item.kind === "photo") {
    return (
      <div className="group relative overflow-hidden rounded-xl border bg-card">
        {removeButton}
        <MasonryImage
          src={item.photo.src}
          alt={`示例照片：${item.photo.title}`}
          width={item.photo.width}
          height={item.photo.height}
        />
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 text-xs">
          <span className="font-medium">{item.photo.title}</span>
          <span className="flex items-center gap-1 text-muted-foreground tabular-nums">
            <HeartIcon aria-hidden className="size-3" />
            {item.hot}
          </span>
        </div>
      </div>
    );
  }

  if (item.kind === "quote") {
    return (
      <figure className="group relative rounded-xl border bg-card p-4">
        {removeButton}
        <QuoteIcon aria-hidden className="size-4 text-muted-foreground/60" />
        <blockquote className="mt-2 text-[15px] leading-6 font-medium tracking-[-0.01em]">
          {item.text}
        </blockquote>
        <figcaption className="mt-3 text-xs text-muted-foreground">— {item.source}</figcaption>
      </figure>
    );
  }

  if (item.kind === "note") {
    return (
      <article className="group relative rounded-xl border bg-card p-4">
        {removeButton}
        <h4 className="pr-6 text-sm font-semibold">{item.title}</h4>
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{item.body}</p>
      </article>
    );
  }

  const max = Math.max(...item.trend);
  return (
    <div className="group relative rounded-xl border bg-card p-4">
      {removeButton}
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <TrendingUpIcon aria-hidden className="size-3.5" />
        {item.label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{item.value}</p>
      <div aria-hidden className="mt-3 flex h-12 items-end gap-1">
        {item.trend.map((value, index) => (
          <span
            key={index}
            className="flex-1 rounded-sm bg-primary/15 last:bg-primary/70"
            style={{ height: `${(value / max) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}

const filterCode = `const [filter, setFilter] = useState<"all" | Category>("all");
const [sort, setSort] = useState<"default" | "latest" | "hot">("default");
const [removed, setRemoved] = useState<Set<string>>(new Set());

const visible = useMemo(() => {
  const list = items.filter(
    (item) => !removed.has(item.id) && (filter === "all" || item.category === filter),
  );
  if (sort === "latest") return [...list].sort((a, b) => b.date - a.date);
  if (sort === "hot") return [...list].sort((a, b) => b.hot - a.hot);
  return list;
}, [filter, sort, removed]);

<Masonry
  items={visible}                      // 筛选、排序、删除都只是换一个数组
  getItemKey={(item) => item.id}       // 稳定的 key 让各项从旧位置滑到新位置
  renderItem={(item) => (
    <FeedCard
      item={item}
      onRemove={() => setRemoved((prev) => new Set(prev).add(item.id))}
    />
  )}
  minColumnWidth={140}
  maxColumns={5}
  gap={12}
/>`;

function FilterSortDemo() {
  const [filter, setFilter] = useState<FeedFilter>("all");
  const [sort, setSort] = useState<FeedSort>("default");
  const [removed, setRemoved] = useState<ReadonlySet<string>>(() => new Set());

  const visible = useMemo(() => {
    const list = FEED_ITEMS.filter(
      (item) => !removed.has(item.id) && (filter === "all" || item.category === filter),
    );
    if (sort === "latest") return [...list].sort((a, b) => b.date - a.date);
    if (sort === "hot") return [...list].sort((a, b) => b.hot - a.hot);
    return list;
  }, [filter, sort, removed]);

  const renderFeedItem = useCallback(
    (item: FeedItem) => (
      <FeedCard
        item={item}
        onRemove={() =>
          setRemoved((previous) => new Set(previous).add(item.id))
        }
      />
    ),
    [],
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>筛选与排序</CardTitle>
          <ViewSourceButton
            code={filterCode}
            description="筛选、排序与删除都只是传入新的 items 数组。"
          />
        </div>
        <CardDescription>
          图片、引用、笔记、数据卡混排，文字卡没有宽高比提示，高度由内容测量得出。
          筛选与排序时各项沿弹簧滑到新位置，可以随时打断；移除的卡片在原位置缩小淡出。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            aria-label="筛选分类"
            size="sm"
            items={[
              { value: "all", label: "全部" },
              { value: "photo", label: "图片" },
              { value: "text", label: "文字" },
              { value: "data", label: "数据" },
            ]}
            value={filter}
            onValueChange={(value) => setFilter(value as FeedFilter)}
          />
          <SegmentedControl
            aria-label="排序"
            size="sm"
            items={[
              { value: "default", label: "默认" },
              { value: "latest", label: "最新" },
              { value: "hot", label: "最热" },
            ]}
            value={sort}
            onValueChange={(value) => setSort(value as FeedSort)}
          />
          {removed.size > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setRemoved(new Set())}
            >
              <RotateCcwIcon />
              恢复 {removed.size} 项
            </Button>
          ) : null}
        </div>
        <Masonry
          items={visible}
          getItemKey={(item) => item.id}
          renderItem={renderFeedItem}
          minColumnWidth={140}
          maxColumns={5}
          gap={12}
        />
        {visible.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            这里空空如也
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 演示 4：自定义骨架                                                    */
/* ------------------------------------------------------------------ */

interface Article {
  id: string;
  cover: Photo;
  title: string;
  excerpt: string;
  meta: string;
}

const ARTICLE_TEXTS: Array<[string, string]> = [
  ["在山里住一周", "没有信号的日子，时间被拉得很长，每天只记得日出和晚饭。"],
  ["一条路走到海边", "沿着旧铁轨往南，走到第三天，终于听见了浪声。"],
  ["雾里的早晨", "能见度不足五十米，所有颜色都退成了灰，只剩轮廓。"],
  ["城市边缘", "地铁的终点站之外，是另一种节奏的生活。"],
  ["冬天的湖", "冰面下的气泡被冻成一串串白点，像停住的时间。"],
  ["慢一点", "把相机调成手动，每一张都要想清楚再按快门。"],
  ["回到原点", "十年后再去同一个地方，变了的其实是自己。"],
  ["长焦与距离", "隔着很远的距离拍摄，反而更容易看清楚细节。"],
  ["黄昏十分钟", "太阳落下后的十分钟，天空的颜色变化最快。"],
];

const COVER_RATIOS = [4 / 3, 3 / 4, 1, 4 / 5, 3 / 2, 5 / 7, 4 / 3, 1, 3 / 4];

const ARTICLES: Article[] = ARTICLE_TEXTS.map(([title, excerpt], index) => {
  const ratio = COVER_RATIOS[index];
  const width = 600;
  const height = Math.round(width / ratio);
  return {
    id: `article-${index}`,
    cover: {
      ...makePhoto(index * 3 + 1),
      width,
      height,
      src: photoUrl(PHOTO_IDS[(index * 5 + 3) % PHOTO_IDS.length], width, height),
    },
    title,
    excerpt,
    meta: `${3 + ((index * 7) % 9)} 分钟阅读`,
  };
});

function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="rounded-xl border bg-card p-2.5">
      <MasonryImage
        src={article.cover.src}
        alt={`封面：${article.title}`}
        width={article.cover.width}
        height={article.cover.height}
        className="rounded-lg"
      />
      <h4 className="mt-3 px-1 text-sm leading-5 font-semibold">{article.title}</h4>
      <p className="mt-1 line-clamp-2 px-1 text-xs leading-5 text-muted-foreground">
        {article.excerpt}
      </p>
      <p className="mt-2 px-1 pb-1 text-[11px] leading-4 text-muted-foreground">
        {article.meta}
      </p>
    </article>
  );
}

/**
 * 骨架与真实卡片结构一致：封面 + 标题 + 两行摘要 + 阅读时间。
 * 每根文字条放在与真实文字相同高度的行盒里垂直居中，骨架与卡片等高，内容到达时原地替换。
 */
function ArticleSkeleton({ index }: { index: number }) {
  return (
    <div className="rounded-xl border bg-card p-2.5">
      <MasonrySkeleton
        aspectRatio={COVER_RATIOS[index % COVER_RATIOS.length]}
        className="rounded-lg"
      />
      <div className="mt-3 flex h-5 items-center px-1">
        <MasonrySkeleton className="h-3.5 w-3/5 rounded-full" />
      </div>
      <div className="mt-1 flex h-5 items-center px-1">
        <MasonrySkeleton className="h-2.5 w-full rounded-full" />
      </div>
      <div className="flex h-5 items-center px-1">
        <MasonrySkeleton className="h-2.5 w-4/5 rounded-full" />
      </div>
      <div className="mt-2 mb-1 flex h-4 items-center px-1">
        <MasonrySkeleton className="h-2 w-1/4 rounded-full" />
      </div>
    </div>
  );
}

const renderArticle = (article: Article) => <ArticleCard article={article} />;
const renderArticleSkeleton = (index: number) => <ArticleSkeleton index={index} />;
const articleKey = (article: Article) => article.id;

const skeletonCode = `import { Masonry, MasonryImage, MasonrySkeleton } from "@/components/qiuye-ui/masonry";

// 骨架与真实卡片结构一致：封面 + 标题 + 两行摘要 + 阅读时间，且与卡片等高，
// 内容到达时每块骨架与替代它的卡片原地交叉淡出。
// 多个 MasonrySkeleton 各自按在瀑布流中的位置对齐微光，整面墙仍是同一道对角线波。
function ArticleSkeleton({ index }: { index: number }) {
  return (
    <div className="rounded-xl border bg-card p-2.5">
      <MasonrySkeleton aspectRatio={COVER_RATIOS[index % COVER_RATIOS.length]} className="rounded-lg" />
      {/* 每根文字条放在与真实文字同高的行盒里 */}
      <div className="mt-3 flex h-5 items-center px-1">
        <MasonrySkeleton className="h-3.5 w-3/5 rounded-full" />
      </div>
      <div className="mt-1 flex h-5 items-center px-1">
        <MasonrySkeleton className="h-2.5 w-full rounded-full" />
      </div>
      <div className="flex h-5 items-center px-1">
        <MasonrySkeleton className="h-2.5 w-4/5 rounded-full" />
      </div>
      <div className="mt-2 mb-1 flex h-4 items-center px-1">
        <MasonrySkeleton className="h-2 w-1/4 rounded-full" />
      </div>
    </div>
  );
}

<Masonry
  items={articles}
  getItemKey={(article) => article.id}
  renderItem={(article) => <ArticleCard article={article} />}
  loading={loading}
  skeletonCount={9}
  renderSkeleton={(index) => <ArticleSkeleton index={index} />}
  minColumnWidth={140}
  maxColumns={5}
  gap={12}
/>`;

function CustomSkeletonDemo() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(0);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 2600);
    return () => window.clearTimeout(timer);
  }, [session]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>自定义骨架</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSession((value) => value + 1)}
              disabled={loading}
            >
              <RotateCcwIcon />
              重新加载
            </Button>
            <ViewSourceButton code={skeletonCode} />
          </div>
        </div>
        <CardDescription>
          <code>renderSkeleton</code> 组合多个 <code>MasonrySkeleton</code>
          （封面、标题、两行摘要），每一块按自己在瀑布流中的位置对齐微光，
          整面墙仍是同一道从左上扫向右下的波。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Masonry
          items={loading ? [] : ARTICLES}
          getItemKey={articleKey}
          renderItem={renderArticle}
          loading={loading}
          skeletonCount={9}
          renderSkeleton={renderArticleSkeleton}
          minColumnWidth={140}
          maxColumns={5}
          gap={12}
        />
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 演示 5：children 模式 · 内容展开                                       */
/* ------------------------------------------------------------------ */

interface Note {
  id: string;
  title: string;
  body: string;
  tag: string;
}

const NOTES: Note[] = [
  {
    id: "n1",
    title: "按容器宽度计算列数",
    tag: "排布",
    body: "列数由容器宽度决定而不是视口，所以把瀑布流放进侧栏、对话框或分栏里同样正确。列宽 = (容器宽 − 间距 × (列数 − 1)) / 列数。",
  },
  {
    id: "n2",
    title: "首帧没有闪烁",
    tag: "渲染",
    body: "新挂载的项在 useLayoutEffect 中同步测量高度并定位，首帧绘制前就已经在正确的位置。服务端渲染时先用 CSS 多列近似排布。",
  },
  {
    id: "n3",
    title: "共享一个 ResizeObserver",
    tag: "性能",
    body: "所有项共用一个 ResizeObserver，读取 borderBoxSize，不受入场动画 transform 的影响。同一个回调里的多项变化只排布一次。",
  },
  {
    id: "n4",
    title: "定位层与内容层分开",
    tag: "动效",
    body: "定位层只写 transform，不挂类名；入场与退场放在内容层，两者互不覆盖。位置用弹簧过渡，已有动画时从当前值与速度重新出发，可以随时改变目标。",
  },
  {
    id: "n5",
    title: "键盘顺序",
    tag: "无障碍",
    body: "DOM 顺序就是数据顺序，Tab 键的顺序与数据一致，不受视觉上的列影响。",
  },
  {
    id: "n6",
    title: "同步的微光",
    tag: "骨架",
    body: "所有微光共用同一个 CSS 动画。每个微光元素按它在瀑布流中的 x + y 换算出负的 animation-delay，并校正动画实际开始的时间，整面墙上就是一道连续的对角线波，而不是各块各闪各的。",
  },
  {
    id: "n7",
    title: "减少动态效果",
    tag: "无障碍",
    body: "系统开启减少动态效果时，位置直接到位，入场与退场只做约 200ms 的淡入淡出，骨架只保留静态底色。",
  },
  {
    id: "n8",
    title: "稳定列",
    tag: "排布",
    body: "每一项所在的列会被缓存。展开这张卡片试试：只有同一列下方的卡片向下让位，其他列纹丝不动。",
  },
];

// 断点的键是容器宽度（px），手机上也保持两列
const NOTE_COLUMNS = { 0: 2, 600: 3, 900: 4 };

function NoteCard({ note }: { note: Note }) {
  const [expanded, setExpanded] = useState(false);
  const long = note.body.length > 64;
  return (
    <article className="rounded-xl border bg-card p-4">
      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] text-foreground/75">
        {note.tag}
      </span>
      <h4 className="mt-2.5 text-sm font-semibold">{note.title}</h4>
      <p
        className={cn(
          "mt-1.5 text-xs leading-5 text-muted-foreground",
          long && !expanded && "line-clamp-3",
        )}
      >
        {note.body}
      </p>
      {long ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 text-xs font-medium text-foreground/80 underline-offset-4 hover:underline"
        >
          {expanded ? "收起" : "展开全文"}
        </button>
      ) : null}
    </article>
  );
}

const childrenCode = `// children 模式：不传 items，每个带 key 的子元素是一项。
// 卡片没有任何宽高比提示，高度由内容测量得出；展开后只有同一列下方的项让位。
<Masonry columns={{ 0: 2, 600: 3, 900: 4 }} gap={12}>
  {notes.map((note) => (
    <NoteCard key={note.id} note={note} />
  ))}
</Masonry>`;

function ChildrenModeDemo() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>children 模式 · 内容展开</CardTitle>
          <ViewSourceButton code={childrenCode} />
        </div>
        <CardDescription>
          静态内容可以直接把带 key 的元素作为子元素传入。文字卡片没有宽高比提示，
          展开某张卡片时，只有同一列下方的卡片向下让位，不会跨列跳动。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Masonry columns={NOTE_COLUMNS} gap={12}>
          {NOTES.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </Masonry>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 完整演示                                                              */
/* ------------------------------------------------------------------ */

/** Masonry 完整演示：无限加载、参数调试、筛选排序、自定义骨架与 children 模式 */
export function MasonryDemo() {
  return (
    <div className="space-y-6">
      <PhotoFeedDemo />
      <MasonryPlayground />
      <FilterSortDemo />
      <CustomSkeletonDemo />
      <ChildrenModeDemo />
    </div>
  );
}
