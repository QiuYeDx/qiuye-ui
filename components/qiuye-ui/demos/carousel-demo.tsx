"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useTransform,
} from "motion/react";
import {
  HandIcon,
  InfinityIcon,
  KeyboardIcon,
  QuoteIcon,
  RotateCcwIcon,
  SparklesIcon,
  WindIcon,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  Carousel,
  CarouselContent,
  CarouselImage,
  CarouselIndicators,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
  useCarouselItem,
  type CarouselAlign,
  type CarouselArrows,
  type CarouselEffect,
  type CarouselIndicatorType,
  type CarouselIndicatorsPlacement,
  type CarouselSnap,
} from "@/components/qiuye-ui/carousel";
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
/* 数据                                                                  */
/* ------------------------------------------------------------------ */

const unsplash = (id: string, width = 1600, height = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&h=${height}&q=75`;

const BANNERS = [
  {
    id: "1506905925346-21bda4d32df4",
    title: "云海之上",
    caption: "黄昏时分，群峰浮出云层",
    tag: "风光",
  },
  {
    id: "1501785888041-af3ef285b470",
    title: "湖光山色",
    caption: "一叶小舟划过碧绿的湖面",
    tag: "湖泊",
  },
  {
    id: "1519681393784-d120267933ba",
    title: "星河入梦",
    caption: "雪山之上，银河缓缓升起",
    tag: "星空",
  },
  {
    id: "1507525428034-b723cf961d3e",
    title: "海边日落",
    caption: "潮水退去，天边只剩一抹橘色",
    tag: "海洋",
  },
  {
    id: "1500530855697-b586d89ba3ee",
    title: "无尽公路",
    caption: "红色峡谷之间，一条路通向远方",
    tag: "旅途",
  },
];

const DESTINATIONS = [
  { id: "1470071459604-3b5ec3a7fe05", title: "晨雾山谷", place: "苏格兰高地", days: "5 天" },
  { id: "1493246507139-91e8fad9978e", title: "冰川湖", place: "加拿大班夫", days: "7 天" },
  { id: "1447752875215-b2761acb3c5d", title: "林间栈道", place: "日本屋久岛", days: "4 天" },
  { id: "1469474968028-56623f02e42e", title: "金色丘陵", place: "新西兰南岛", days: "8 天" },
  { id: "1433086966358-54859d0ed716", title: "瀑布与石桥", place: "美国俄勒冈", days: "3 天" },
  { id: "1482192596544-9eb780fc7f66", title: "云杉雾海", place: "瑞士伯尔尼", days: "6 天" },
  { id: "1518548419970-58e3b4079ab2", title: "海神庙", place: "印尼巴厘岛", days: "5 天" },
  { id: "1465146344425-f00d5f5c8f07", title: "罂粟花田", place: "意大利托斯卡纳", days: "4 天" },
];

const FOCUS = [
  { id: "1493246507139-91e8fad9978e", title: "梦莲湖" },
  { id: "1454496522488-7a8e488e8606", title: "雪峰" },
  { id: "1426604966848-d7adac402bff", title: "优胜美地" },
  { id: "1518548419970-58e3b4079ab2", title: "海神庙" },
  { id: "1433086966358-54859d0ed716", title: "多瀑布" },
  { id: "1441974231531-c6227db76b6e", title: "林间小径" },
  { id: "1490750967868-88aa4486c946", title: "花海" },
];

/** 商品图集：不同宽高比的照片，contain + 模糊衬底 */
const PRODUCTS = [
  { id: "1505740420928-5e560c06d30e", w: 1200, h: 1200, name: "无线头戴耳机", price: "¥ 1,299" },
  { id: "1542291026-7eec264c27ff", w: 900, h: 1200, name: "轻量跑鞋", price: "¥ 899" },
  { id: "1526170375885-4d8ecf77b99f", w: 1600, h: 1000, name: "拍立得相机", price: "¥ 749" },
  { id: "1585386959984-a4155224a1ad", w: 900, h: 1300, name: "经典香水", price: "¥ 1,080" },
  { id: "1546868871-7041f2a55e12", w: 1100, h: 1100, name: "智能手表", price: "¥ 2,999" },
  { id: "1572635196237-14b3f281503f", w: 1600, h: 800, name: "飞行员墨镜", price: "¥ 1,450" },
];

const QUOTES = [
  {
    text: "拖动时它真的跟着手指走，松手后的那一下弹簧，和 iPhone 上翻页几乎一样。",
    name: "林晓",
    role: "iOS 工程师",
    tone: "oklch(0.62 0.19 255)",
  },
  {
    text: "我们把首页横幅换成了它。最惊喜的是自动播放的进度条就在指示点里，用户一眼就知道下一张什么时候来；鼠标移上去、键盘聚焦、页面切到后台时都会停下，回来后从剩下的时间继续，不会突然跳到下一张。",
    name: "Chen Yu",
    role: "产品设计师",
    tone: "oklch(0.6 0.22 295)",
  },
  {
    text: "循环不复制节点这一点很关键：轮播里放的是有状态的视频卡片，以前克隆出来的那一份总是不同步。",
    name: "周明",
    role: "前端负责人",
    tone: "oklch(0.64 0.15 160)",
  },
  {
    text: "触控板横向一扫就走，纵向滚动不受影响。",
    name: "Ava Zhang",
    role: "独立开发者",
    tone: "oklch(0.72 0.16 70)",
  },
  {
    text: "读屏可以听到「第 3 张，共 5 张」，看不见的幻灯片里的链接也不会被 Tab 到。无障碍做得比我们自己写的要完整得多，评审时一次就过了。",
    name: "王蕾",
    role: "无障碍顾问",
    tone: "oklch(0.63 0.21 15)",
  },
];

const ALBUM = [
  { id: "1523275335684-37898b6baf30", w: "w-64", label: "腕表" },
  { id: "1491553895911-0055eca6402d", w: "w-44", label: "运动鞋" },
  { id: "1511499767150-a48a237f0083", w: "w-56", label: "墨镜" },
  { id: "1434493789847-2f02dc6ca35d", w: "w-36", label: "日常" },
  { id: "1505740420928-5e560c06d30e", w: "w-48", label: "耳机" },
  { id: "1526170375885-4d8ecf77b99f", w: "w-72", label: "相机" },
  { id: "1585386959984-a4155224a1ad", w: "w-40", label: "香水" },
  { id: "1542291026-7eec264c27ff", w: "w-60", label: "跑鞋" },
  { id: "1572635196237-14b3f281503f", w: "w-52", label: "眼镜" },
];

const TAGS = [
  "全部",
  "风光",
  "城市",
  "人像",
  "美食",
  "建筑",
  "星空",
  "海洋",
  "森林",
  "沙漠",
  "雪山",
  "极光",
  "街头",
  "静物",
  "黑白",
  "胶片",
  "航拍",
  "微距",
  "野生动物",
  "夜景",
];

/* ------------------------------------------------------------------ */
/* 首页 / 详情页快速预览                                                  */
/* ------------------------------------------------------------------ */

interface PreviewSlide {
  title: string;
  text: string;
  icon: LucideIcon;
  /** 渐变的两个端点（深色，白字在浅色与深色主题下都清晰） */
  colors: [string, string];
  glow: string;
}

const PREVIEW_SLIDES: PreviewSlide[] = [
  {
    title: "跟手拖拽",
    text: "1:1 跟随指针，拉过两端是越拉越沉的橡皮筋",
    icon: HandIcon,
    colors: ["oklch(0.46 0.17 262)", "oklch(0.32 0.14 285)"],
    glow: "oklch(0.72 0.16 230)",
  },
  {
    title: "轻甩即翻页",
    text: "按速度投影选择吸附点，带着松手速度滑过去",
    icon: WindIcon,
    colors: ["oklch(0.55 0.17 30)", "oklch(0.4 0.15 10)"],
    glow: "oklch(0.82 0.14 70)",
  },
  {
    title: "无缝循环",
    text: "每张自己绕回，不复制任何一张幻灯片",
    icon: InfinityIcon,
    colors: ["oklch(0.5 0.12 175)", "oklch(0.34 0.09 205)"],
    glow: "oklch(0.8 0.13 160)",
  },
  {
    title: "连续变形的指示点",
    text: "拖动时胶囊从一个点流到下一个点，自动播放时显示进度",
    icon: SparklesIcon,
    colors: ["oklch(0.48 0.2 305)", "oklch(0.33 0.15 325)"],
    glow: "oklch(0.76 0.16 340)",
  },
  {
    title: "触控板与键盘",
    text: "横向轻扫、方向键切换，纵向滚动交还页面",
    icon: KeyboardIcon,
    colors: ["oklch(0.4 0.03 260)", "oklch(0.26 0.02 265)"],
    glow: "oklch(0.7 0.08 250)",
  },
];

/** 预览幻灯片：用 useCarouselItem 的 progress 让光斑与图标随拖动错位，形成景深。 */
function PreviewBanner({ slide }: { slide: PreviewSlide }) {
  const { progress } = useCarouselItem();
  const glowX = useTransform(progress, (value) => `${value * -38}%`);
  const iconX = useTransform(progress, (value) => `${value * -60}%`);
  const textX = useTransform(progress, (value) => `${value * 12}%`);
  const Icon = slide.icon;
  return (
    // 悬停箭头占据距左右边缘 12–48px 的区域：宽卡片上左右各留 64px，文字与图标不会被箭头盖住。
    <div
      className="relative flex h-full flex-col justify-end overflow-hidden p-5 pb-14 text-white @md:px-16 @md:pt-7 @md:pb-15"
      style={{
        backgroundImage: `linear-gradient(135deg, ${slide.colors[0]}, ${slide.colors[1]})`,
      }}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -top-1/3 right-[-10%] size-[85%] rounded-full opacity-45 blur-3xl @md:size-[70%]"
        style={{ backgroundColor: slide.glow, x: glowX }}
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-16 -mt-12 hidden size-24 items-center justify-center rounded-[28px] border border-white/20 bg-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] backdrop-blur-sm @md:flex @2xl:-mt-14 @2xl:size-28"
        style={{ x: iconX }}
      >
        <Icon className="size-10 @2xl:size-12" strokeWidth={1.6} />
      </motion.span>
      <motion.span
        aria-hidden
        className="absolute top-5 left-5 flex size-8 items-center justify-center rounded-[10px] border border-white/20 bg-white/10 @md:hidden"
        style={{ x: textX }}
      >
        <Icon className="size-4" strokeWidth={1.8} />
      </motion.span>
      <motion.div className="relative max-w-[26rem]" style={{ x: textX }}>
        <h3 className="text-xl leading-tight font-semibold tracking-[-0.02em] @md:text-2xl @2xl:text-[28px]">
          {slide.title}
        </h3>
        <p className="mt-1.5 text-[13px] leading-5 text-white/75 @md:text-sm @2xl:mt-2 @2xl:text-[15px] @2xl:leading-6">
          {slide.text}
        </p>
      </motion.div>
    </div>
  );
}

/** Carousel 快速预览：渐变横幅，循环 + 自动播放 + 指示点在内 + 悬停箭头 */
export function CarouselPreview() {
  return (
    <div className="@container w-full">
      <Carousel loop autoplay={{ delay: 4000 }} aria-label="Carousel 功能一览">
        <CarouselContent className="h-48 rounded-2xl @md:h-52 @2xl:h-60">
          {PREVIEW_SLIDES.map((slide) => (
            <PreviewBanner key={slide.title} slide={slide} />
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 源码                                                                  */
/* ------------------------------------------------------------------ */

const bannerCode = `import {
  Carousel,
  CarouselContent,
  CarouselImage,
} from "@/components/qiuye-ui/carousel";

const banners = [
  { src: "/images/sea-of-clouds.jpg", title: "云海之上", caption: "黄昏时分，群峰浮出云层", tag: "风光" },
  // ...
];

export function HeroCarousel() {
  return (
    <Carousel loop autoplay parallax={0.2}>
      <CarouselContent className="aspect-[4/3] rounded-2xl sm:aspect-video">
        {banners.map((banner, index) => (
          <CarouselImage
            key={banner.src}
            src={banner.src}
            alt={banner.title}
            priority={index === 0}
            overlay // 底部渐变遮罩，叠加白色文字
          >
            <div className="p-5 pb-12 sm:p-8 sm:pb-14">
              <span className="text-xs font-medium tracking-wide text-white/70">{banner.tag}</span>
              <h3 className="mt-1 text-2xl font-semibold sm:text-3xl">{banner.title}</h3>
              <p className="mt-1 text-sm text-white/80">{banner.caption}</p>
            </div>
          </CarouselImage>
        ))}
      </CarouselContent>
    </Carousel>
  );
}`;

const shelfCode = `import {
  Carousel,
  CarouselContent,
  CarouselImage,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/qiuye-ui/carousel";

const destinations = [
  { src: "/images/misty-valley.jpg", title: "晨雾山谷", place: "苏格兰高地", days: "5 天" },
  // ...
];

export function DestinationShelf() {
  return (
    <Carousel
      slidesPerView={{ 0: 1.15, 640: 2, 1024: 3 }} // 键为视口容器宽度
      gap={16}
      snap="page"
      arrows="none" // 内置箭头关掉，换成标题右侧的一对
      indicatorsPlacement="outside"
    >
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">旅行灵感</h3>
          <p className="text-sm text-muted-foreground">每屏一组，按页吸附</p>
        </div>
        <div className="flex gap-2">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </div>
      <CarouselContent>
        {destinations.map((item) => (
          <CarouselItem key={item.src}>
            <article className="h-full overflow-hidden rounded-xl border bg-card">
              <CarouselImage src={item.src} alt={item.title} className="aspect-[4/3] h-auto" />
              <div className="p-4">
                <h4 className="font-medium">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.place} · {item.days}</p>
              </div>
            </article>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}`;

const focusCode = `import {
  Carousel,
  CarouselContent,
  CarouselImage,
  CarouselItem,
} from "@/components/qiuye-ui/carousel";

const photos = [
  { src: "/images/moraine-lake.jpg", title: "梦莲湖" },
  // ...
];

export function FocusGallery() {
  return (
    <Carousel
      loop
      align="center"
      slidesPerView={{ 0: 1.35, 640: 1.6 }}
      gap={12}
      effect="scale" // 两侧缩小变暗
      selectOnClick // 点击两侧的幻灯片切换过去
      indicatorsPlacement="outside"
    >
      <CarouselContent className="py-2">
        {photos.map((photo) => (
          <CarouselItem key={photo.src}>
            <CarouselImage
              src={photo.src}
              alt={photo.title}
              overlay
              className="aspect-[4/3] h-auto rounded-2xl"
            >
              <p className="p-4 text-base font-semibold">{photo.title}</p>
            </CarouselImage>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}`;

const galleryCode = `import { motion, useTransform } from "motion/react";
import {
  Carousel,
  CarouselContent,
  CarouselImage,
  CarouselIndicators,
  useCarousel,
} from "@/components/qiuye-ui/carousel";

type Photo = { src: string; thumb: string; name: string };

const photos: Photo[] = [
  { src: "/images/headphones.jpg", thumb: "/images/headphones-thumb.jpg", name: "无线头戴耳机" },
  // ...
];

const THUMB = 64; // 缩略图边长（size-16）
const GAP = 8; // 缩略图间距（gap-2）

function Thumbnails() {
  // index：当前张；position：拖动时连续变化的位置，高亮框跟着它走
  const { index, goTo, position } = useCarousel();
  const x = useTransform(position, (p) => p * (THUMB + GAP));
  return (
    <div className="relative mt-3 flex gap-2">
      <motion.span
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 z-10 size-16 rounded-lg ring-2 ring-foreground"
        style={{ x }}
      />
      {photos.map((photo, i) => (
        <button
          key={photo.src}
          type="button"
          aria-label={photo.name}
          aria-current={i === index ? "true" : undefined}
          onClick={() => goTo(i)}
        >
          <img src={photo.thumb} alt="" className="size-16 rounded-lg object-cover" />
        </button>
      ))}
    </div>
  );
}

export function ProductGallery() {
  return (
    <Carousel indicators="none">
      <div className="relative">
        <CarouselContent className="aspect-square rounded-2xl sm:aspect-[4/3]">
          {photos.map((photo) => (
            // contain：完整显示，留白处铺同图的大模糊衬底
            <CarouselImage key={photo.src} src={photo.src} alt={photo.name} fit="contain" />
          ))}
        </CarouselContent>
        {/* 指示器可以放在任意位置 */}
        <CarouselIndicators type="fraction" appearance="overlay" className="absolute top-3 right-3" />
      </div>
      <Thumbnails />
    </Carousel>
  );
}`;

const quotesCode = `import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/qiuye-ui/carousel";

const quotes = [
  { text: "拖动时它真的跟着手指走……", name: "林晓", role: "iOS 工程师" },
  // ...
];

export function Testimonials() {
  return (
    <Carousel
      effect="fade" // 叠在同一位置淡入淡出
      crossFade // 幻灯片背景透明（纯文字）：先淡出再淡入，两段文字不会叠在一起
      autoHeight // 视口高度随当前一张连续过渡
      loop
      autoplay={{ delay: 6000 }}
      arrows="none"
      indicatorsPlacement="outside"
    >
      <CarouselContent className="rounded-2xl border bg-card">
        {quotes.map((quote) => (
          <CarouselItem key={quote.name} className="p-6 sm:p-8">
            <figure>
              <blockquote className="text-lg">{quote.text}</blockquote>
              <figcaption className="mt-5 text-sm">
                {quote.name} · {quote.role}
              </figcaption>
            </figure>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}`;

const freeCode = `import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselImage,
  CarouselItem,
} from "@/components/qiuye-ui/carousel";
import { cn } from "@/lib/utils";

const album = [
  { src: "/images/watch.jpg", label: "腕表", width: "w-64" },
  { src: "/images/sneakers.jpg", label: "运动鞋", width: "w-44" },
  // ...
];

const tags = ["全部", "风光", "城市", "人像" /* ... */];

// 宽度不一：slidesPerView="auto" 按每张的宽度排布，snap="none" 惯性滚动 + 两端回弹。
// 自由滚动时视口外的幻灯片仍可用 Tab 聚焦，聚焦时自动滚入视野。
export function Album() {
  return (
    <Carousel slidesPerView="auto" snap="none" gap={12} indicators="none">
      <CarouselContent>
        {album.map((photo) => (
          <CarouselItem key={photo.src} className={cn("h-44", photo.width)}>
            <CarouselImage src={photo.src} alt={photo.label} className="rounded-xl" />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

export function TagRow() {
  const [selected, setSelected] = useState("全部");
  return (
    <Carousel slidesPerView="auto" snap="none" gap={8} arrows="none" indicators="none">
      <CarouselContent>
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            aria-pressed={selected === tag}
            onClick={() => setSelected(tag)}
            className="h-8 rounded-full border px-3.5 text-sm whitespace-nowrap"
          >
            {tag}
          </button>
        ))}
      </CarouselContent>
    </Carousel>
  );
}`;

/* ------------------------------------------------------------------ */
/* 演示块                                                                */
/* ------------------------------------------------------------------ */

function DemoCard({
  title,
  description,
  code,
  children,
  contentClassName,
}: {
  title: string;
  description: React.ReactNode;
  code: string;
  children: React.ReactNode;
  contentClassName?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>{title}</CardTitle>
          <ViewSourceButton code={code} />
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}

function BannerDemo() {
  return (
    <Carousel loop autoplay parallax={0.2} aria-label="风光横幅">
      <CarouselContent className="aspect-[4/3] rounded-2xl sm:aspect-video">
        {BANNERS.map((banner, index) => (
          <CarouselImage
            key={banner.id}
            src={unsplash(banner.id)}
            alt={banner.title}
            priority={index === 0}
            sizes="(min-width: 1024px) 960px, 100vw"
            overlay
          >
            <div className="p-5 pb-12 sm:p-8 sm:pb-14">
              <span className="text-xs font-medium tracking-wide text-white/70">
                {banner.tag}
              </span>
              <h3 className="mt-1 text-2xl leading-tight font-semibold tracking-[-0.02em] sm:text-3xl">
                {banner.title}
              </h3>
              <p className="mt-1 text-sm text-white/80">{banner.caption}</p>
            </div>
          </CarouselImage>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

function ShelfDemo() {
  return (
    <Carousel
      slidesPerView={{ 0: 1.15, 640: 2, 1024: 3 }}
      gap={16}
      snap="page"
      arrows="none"
      indicatorsPlacement="outside"
      aria-label="旅行灵感"
    >
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-[-0.01em]">旅行灵感</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            窄屏露出下一张，宽屏每屏 2–3 张
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </div>
      <CarouselContent>
        {DESTINATIONS.map((item) => (
          <CarouselItem key={item.id}>
            <article className="flex h-full flex-col overflow-hidden rounded-xl border bg-card">
              <CarouselImage
                src={unsplash(item.id, 800, 600)}
                alt={item.title}
                className="aspect-[4/3] h-auto"
              />
              <div className="flex flex-1 items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-medium">{item.title}</h4>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {item.place}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground tabular-nums">
                  {item.days}
                </span>
              </div>
            </article>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

function FocusDemo() {
  return (
    <Carousel
      loop
      align="center"
      slidesPerView={{ 0: 1.35, 640: 1.6 }}
      gap={12}
      effect="scale"
      selectOnClick
      indicatorsPlacement="outside"
      aria-label="中心聚焦相册"
    >
      <CarouselContent className="py-2">
        {FOCUS.map((photo) => (
          <CarouselItem key={photo.id}>
            <CarouselImage
              src={unsplash(photo.id, 1200, 900)}
              alt={photo.title}
              overlay
              className="aspect-[4/3] h-auto rounded-2xl"
            >
              <p className="p-4 text-base font-semibold tracking-[-0.01em] sm:p-5 sm:text-lg">
                {photo.title}
              </p>
            </CarouselImage>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

const THUMB_GAP = 8;

/** 缩略图条：useCarousel 读取当前张，高亮框跟随连续位置移动。 */
function GalleryThumbnails() {
  const { index, goTo, position } = useCarousel();
  const listRef = useRef<HTMLDivElement>(null);
  const [slots, setSlots] = useState<Array<{ left: number; width: number }>>([]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const buttons = Array.from(list.querySelectorAll<HTMLElement>("[data-thumb]"));
      setSlots(buttons.map((button) => ({ left: button.offsetLeft, width: button.offsetWidth })));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  // 当前缩略图滚进可视范围（只滚动缩略图条，不滚动页面）。
  useLayoutEffect(() => {
    const list = listRef.current;
    const slot = slots[index];
    if (!list || !slot) return;
    const target = slot.left - (list.clientWidth - slot.width) / 2;
    list.scrollTo({ left: target, behavior: "smooth" });
  }, [index, slots]);

  const frameX = useTransform(position, (value) => {
    if (!slots.length) return 0;
    const lower = Math.max(0, Math.min(slots.length - 1, Math.floor(value)));
    const upper = Math.min(slots.length - 1, lower + 1);
    const t = Math.max(0, Math.min(1, value - lower));
    return slots[lower].left + (slots[upper].left - slots[lower].left) * t;
  });

  return (
    <div
      ref={listRef}
      className="relative mt-3 flex gap-2 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ gap: THUMB_GAP }}
    >
      {slots.length ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute top-1 left-0 z-10 size-14 rounded-[10px] ring-2 ring-foreground ring-offset-2 ring-offset-background sm:size-16"
          style={{ x: frameX }}
        />
      ) : null}
      {PRODUCTS.map((product, thumb) => (
        <button
          key={product.id}
          type="button"
          data-thumb=""
          aria-label={product.name}
          aria-current={thumb === index ? "true" : undefined}
          onClick={() => goTo(thumb)}
          className={cn(
            "relative size-14 shrink-0 cursor-pointer overflow-hidden rounded-[10px] bg-muted outline-none transition-opacity duration-200 focus-visible:ring-2 focus-visible:ring-ring sm:size-16",
            thumb === index ? "opacity-100" : "opacity-55 hover:opacity-85",
          )}
        >
          <CarouselImage src={unsplash(product.id, 160, 160)} alt="" className="size-full" />
        </button>
      ))}
    </div>
  );
}

/** 当前商品的名称与价格，随 index 交叉淡入。 */
function GalleryInfo() {
  const { index } = useCarousel();
  const reducedMotion = useReducedMotion();
  const product = PRODUCTS[index];
  return (
    <div className="relative min-h-16">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={
            reducedMotion
              ? { duration: 0.15, y: { duration: 0 } }
              : { duration: 0.24, ease: [0.23, 1, 0.32, 1] }
          }
        >
          <h4 className="text-lg font-semibold tracking-[-0.01em]">{product.name}</h4>
          <p className="mt-1 text-sm text-muted-foreground tabular-nums">{product.price}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function GalleryDemo() {
  return (
    <Carousel indicators="none" aria-label="商品图集">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_14rem] md:items-start">
        <div className="min-w-0">
          <div className="relative">
            <CarouselContent className="aspect-square rounded-2xl sm:aspect-[4/3]">
              {PRODUCTS.map((product) => (
                <CarouselImage
                  key={product.id}
                  src={unsplash(product.id, product.w, product.h)}
                  alt={product.name}
                  fit="contain"
                />
              ))}
            </CarouselContent>
            <CarouselIndicators
              type="fraction"
              appearance="overlay"
              className="pointer-events-none absolute top-3 right-3 z-20"
            />
          </div>
          <GalleryThumbnails />
        </div>
        <div className="space-y-4 md:pt-2">
          <GalleryInfo />
          <p className="text-sm leading-relaxed text-muted-foreground">
            照片宽高比各不相同：<code className="text-foreground">fit=&quot;contain&quot;</code>{" "}
            完整显示，留白处铺一层同图的大模糊衬底。缩略图条用{" "}
            <code className="text-foreground">useCarousel()</code>{" "}
            读取当前张，高亮框跟随拖动连续移动。
          </p>
          <Button
            className="w-full md:w-auto"
            onClick={() => toast.success("已加入购物车")}
          >
            加入购物车
          </Button>
        </div>
      </div>
    </Carousel>
  );
}

function QuotesDemo() {
  return (
    <Carousel
      effect="fade"
      crossFade
      autoHeight
      loop
      autoplay={{ delay: 6000 }}
      arrows="none"
      indicatorsPlacement="outside"
      aria-label="用户评价"
      className="mx-auto max-w-xl"
    >
      <CarouselContent className="rounded-2xl border bg-card">
        {QUOTES.map((quote) => (
          <CarouselItem key={quote.name} className="p-6 sm:p-8">
            <figure>
              <QuoteIcon
                aria-hidden
                className="size-6 text-muted-foreground/50"
                strokeWidth={1.5}
              />
              <blockquote className="mt-3 text-[15px] leading-7 text-pretty sm:text-lg sm:leading-8">
                {quote.text}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: quote.tone }}
                >
                  {quote.name.slice(0, 1)}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{quote.name}</span>
                  <span className="block text-xs text-muted-foreground">{quote.role}</span>
                </span>
              </figcaption>
            </figure>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

function FreeScrollDemo() {
  const [selected, setSelected] = useState("全部");
  return (
    <div className="space-y-5">
      <Carousel
        slidesPerView="auto"
        snap="none"
        gap={12}
        indicators="none"
        aria-label="宽度不一的相册"
      >
        <CarouselContent>
          {ALBUM.map((photo) => (
            <CarouselItem key={photo.id} className={cn("h-44 sm:h-52", photo.w)}>
              <CarouselImage
                src={unsplash(photo.id, 640, 480)}
                alt={photo.label}
                className="rounded-xl"
              >
                <span className="m-2 self-start rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                  {photo.label}
                </span>
              </CarouselImage>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <Carousel
        slidesPerView="auto"
        snap="none"
        gap={8}
        arrows="none"
        indicators="none"
        aria-label="标签"
      >
        <CarouselContent className="py-0.5">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              aria-pressed={selected === tag}
              onClick={() => setSelected(tag)}
              className={cn(
                "h-8 cursor-pointer rounded-full border px-3.5 text-sm whitespace-nowrap transition-colors",
                selected === tag
                  ? "border-foreground bg-foreground text-background"
                  : "bg-background hover:bg-muted",
              )}
            >
              {tag}
            </button>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 参数调试                                                              */
/* ------------------------------------------------------------------ */

interface PlaygroundConfig {
  slidesPerView: number;
  gap: number;
  align: CarouselAlign;
  loop: boolean;
  snap: CarouselSnap;
  effect: CarouselEffect;
  parallax: number;
  autoplay: boolean;
  delay: number;
  arrows: CarouselArrows;
  indicators: CarouselIndicatorType;
  placement: CarouselIndicatorsPlacement;
  autoHeight: boolean;
  draggable: boolean;
  selectOnClick: boolean;
  crossFade: boolean;
  count: number;
}

const PLAYGROUND_DEFAULTS: PlaygroundConfig = {
  slidesPerView: 1,
  gap: 12,
  align: "start",
  loop: true,
  snap: "slide",
  effect: "slide",
  crossFade: false,
  selectOnClick: false,
  parallax: 0.2,
  autoplay: false,
  delay: 4000,
  arrows: "hover",
  indicators: "dots",
  placement: "inside",
  autoHeight: false,
  draggable: true,
  count: 8,
};

const PLAYGROUND_PHOTOS = [
  "1506905925346-21bda4d32df4",
  "1501785888041-af3ef285b470",
  "1519681393784-d120267933ba",
  "1507525428034-b723cf961d3e",
  "1500530855697-b586d89ba3ee",
  "1470071459604-3b5ec3a7fe05",
  "1493246507139-91e8fad9978e",
  "1433086966358-54859d0ed716",
  "1454496522488-7a8e488e8606",
  "1469474968028-56623f02e42e",
  "1518548419970-58e3b4079ab2",
  "1447752875215-b2761acb3c5d",
];

// 每张的最小高度不同：开启 autoHeight 时视口高度随当前一张过渡，否则都拉伸到最高的一张。
const PLAYGROUND_HEIGHTS = [300, 220, 340, 260, 320, 240];

function ParamSlider({
  label,
  value,
  min,
  max,
  step = 1,
  format = (current) => String(current),
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
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
        disabled={disabled}
        onValueChange={([next]) => onChange(next)}
        aria-label={label}
      />
    </div>
  );
}

function ParamGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-5">
      <p className="text-xs font-medium tracking-wide text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function ParamSwitch({
  id,
  label,
  hint,
  checked,
  disabled,
  onCheckedChange,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4", disabled && "opacity-50")}>
      <Label htmlFor={id} className="flex-col items-start gap-0.5">
        <span>{label}</span>
        {hint ? (
          <span className="text-xs font-normal text-muted-foreground">{hint}</span>
        ) : null}
      </Label>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

function ParamSegment<T extends string>({
  label,
  value,
  items,
  onChange,
  disabled,
}: {
  label: string;
  value: T;
  items: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label className={cn(disabled && "opacity-50")}>{label}</Label>
      <SegmentedControl
        size="sm"
        items={items}
        value={value}
        disabled={disabled}
        onValueChange={(next) => onChange(next as T)}
      />
    </div>
  );
}

function playgroundCode(config: PlaygroundConfig) {
  const fade = config.effect === "fade";
  const props: string[] = [];
  if (config.loop) props.push("loop");
  if (config.autoplay) {
    props.push(
      config.delay === 5000 ? "autoplay" : `autoplay={{ delay: ${config.delay} }}`,
    );
  }
  // fade 时固定每屏 1 张、起始对齐、不吸附为 none、没有间距与视差，这些参数不输出。
  if (!fade && config.slidesPerView !== 1) props.push(`slidesPerView={${config.slidesPerView}}`);
  if (!fade && config.gap) props.push(`gap={${config.gap}}`);
  if (!fade && config.align !== "start") props.push(`align="${config.align}"`);
  if (config.snap !== "slide" && !(fade && config.snap === "none")) {
    props.push(`snap="${config.snap}"`);
  }
  if (config.effect !== "slide") props.push(`effect="${config.effect}"`);
  if (fade && config.crossFade) props.push("crossFade");
  if (!fade && config.parallax) props.push(`parallax={${config.parallax}}`);
  if (config.autoHeight) props.push("autoHeight");
  if (config.arrows !== "hover") props.push(`arrows="${config.arrows}"`);
  if (config.indicators !== "dots") props.push(`indicators="${config.indicators}"`);
  if (config.indicators !== "none" && config.placement !== "inside") {
    props.push(`indicatorsPlacement="${config.placement}"`);
  }
  if (!config.draggable) props.push("draggable={false}");
  if (config.selectOnClick) props.push("selectOnClick");
  const open = props.length
    ? `<Carousel\n${props.map((prop) => `      ${prop}`).join("\n")}\n    >`
    : "<Carousel>";
  const imageClass = !fade && config.gap > 0 ? ` className="rounded-xl"` : "";
  const image = `<CarouselImage src={photo.src} alt={photo.title} overlay${imageClass}>
              <p className="p-4 pb-11 text-lg font-semibold">{photo.title}</p>
            </CarouselImage>`;
  // autoHeight：每张自己的高度不同，视口高度随当前一张过渡；否则在视口上给定宽高比。
  const content = config.autoHeight
    ? `<CarouselContent className="rounded-2xl">
        {photos.map((photo) => (
          <CarouselItem key={photo.src} className="grid" style={{ minHeight: photo.height }}>
            ${image}
          </CarouselItem>
        ))}
      </CarouselContent>`
    : `<CarouselContent className="aspect-video rounded-2xl">
        {photos.map((photo) => (
          <CarouselItem key={photo.src}>
            ${image}
          </CarouselItem>
        ))}
      </CarouselContent>`;
  const photoShape = config.autoHeight
    ? `{ src: "/images/1.jpg", title: "1", height: ${PLAYGROUND_HEIGHTS[0]} }`
    : `{ src: "/images/1.jpg", title: "1" }`;
  return `import {
  Carousel,
  CarouselContent,
  CarouselImage,
  CarouselItem,
} from "@/components/qiuye-ui/carousel";

const photos = [
  ${photoShape},
  // ...共 ${config.count} 张
];

export function Example() {
  return (
    ${open}
      ${content}
    </Carousel>
  );
}`;
}

function CarouselPlayground() {
  const [config, setConfig] = useState(PLAYGROUND_DEFAULTS);
  const update = (patch: Partial<PlaygroundConfig>) =>
    setConfig((previous) => ({ ...previous, ...patch }));
  const fade = config.effect === "fade";
  const photos = PLAYGROUND_PHOTOS.slice(0, config.count);
  // 结构性参数变化时重新挂载，从第一张开始。
  const resetKey = [
    config.count,
    config.loop,
    config.snap,
    config.effect,
    config.align,
    config.autoHeight,
  ].join("|");

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
            <ViewSourceButton
              code={playgroundCode(config)}
              description="按当前参数生成的用法。"
            />
          </div>
        </div>
        <CardDescription>
          实时调整参数观察效果；拖动、甩动、拉过两端，或用触控板横向滑动、方向键切换。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="min-w-0">
          <Carousel
            key={resetKey}
            loop={config.loop}
            autoplay={config.autoplay ? { delay: config.delay } : false}
            slidesPerView={config.slidesPerView}
            gap={config.gap}
            align={config.align}
            snap={config.snap}
            effect={config.effect}
            crossFade={config.crossFade}
            parallax={config.parallax}
            autoHeight={config.autoHeight}
            arrows={config.arrows}
            indicators={config.indicators}
            indicatorsPlacement={config.placement}
            draggable={config.draggable}
            selectOnClick={config.selectOnClick}
            aria-label="参数调试轮播"
          >
            <CarouselContent className="rounded-2xl">
              {photos.map((id, index) => (
                <CarouselItem
                  key={id}
                  className="grid"
                  style={{ minHeight: PLAYGROUND_HEIGHTS[index % PLAYGROUND_HEIGHTS.length] }}
                >
                  <CarouselImage
                    src={unsplash(id, 1200, 900)}
                    alt={`第 ${index + 1} 张`}
                    overlay
                    className={cn(!fade && config.gap > 0 && "rounded-xl")}
                  >
                    <p className="p-4 pb-11 text-lg font-semibold tabular-nums">
                      {index + 1}
                    </p>
                  </CarouselImage>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-3">
          <ParamGroup title="布局">
            <ParamSlider
              label="每屏张数 slidesPerView"
              value={config.slidesPerView}
              min={1}
              max={4}
              step={0.05}
              format={(value) => value.toFixed(2).replace(/\.?0+$/, "")}
              disabled={fade}
              onChange={(slidesPerView) => update({ slidesPerView })}
            />
            <ParamSlider
              label="间距 gap"
              value={config.gap}
              min={0}
              max={32}
              format={(value) => `${value}px`}
              disabled={fade}
              onChange={(gap) => update({ gap })}
            />
            <ParamSlider
              label="幻灯片数量"
              value={config.count}
              min={1}
              max={PLAYGROUND_PHOTOS.length}
              onChange={(count) => update({ count })}
            />
            <ParamSegment
              label="对齐 align"
              value={config.align}
              disabled={fade}
              items={[
                { value: "start", label: "start" },
                { value: "center", label: "center" },
              ]}
              onChange={(align) => update({ align })}
            />
            <ParamSegment
              label="吸附 snap"
              value={config.snap}
              items={[
                { value: "slide", label: "slide" },
                { value: "page", label: "page" },
                { value: "none", label: "none" },
              ]}
              onChange={(snap) => update({ snap })}
            />
          </ParamGroup>
          <ParamGroup title="效果与导航">
            <ParamSegment
              label="效果 effect"
              value={config.effect}
              items={[
                { value: "slide", label: "slide" },
                { value: "fade", label: "fade" },
                { value: "scale", label: "scale" },
              ]}
              onChange={(effect) => update({ effect })}
            />
            <ParamSwitch
              id="carousel-playground-cross-fade"
              label="先淡出再淡入 crossFade"
              hint="fade 时生效，用于背景透明的幻灯片"
              checked={config.crossFade}
              disabled={!fade}
              onCheckedChange={(crossFade) => update({ crossFade })}
            />
            <ParamSlider
              label="视差 parallax"
              value={config.parallax}
              min={0}
              max={0.5}
              step={0.05}
              format={(value) => value.toFixed(2)}
              disabled={fade}
              onChange={(parallax) => update({ parallax })}
            />
            <ParamSegment
              label="箭头 arrows"
              value={config.arrows}
              items={[
                { value: "hover", label: "hover" },
                { value: "always", label: "always" },
                { value: "none", label: "none" },
              ]}
              onChange={(arrows) => update({ arrows })}
            />
            <ParamSegment
              label="指示器 indicators"
              value={config.indicators}
              items={[
                { value: "dots", label: "dots" },
                { value: "fraction", label: "fraction" },
                { value: "none", label: "none" },
              ]}
              onChange={(indicators) => update({ indicators })}
            />
            <ParamSegment
              label="指示器位置 indicatorsPlacement"
              value={config.placement}
              disabled={config.indicators === "none"}
              items={[
                { value: "inside", label: "inside" },
                { value: "outside", label: "outside" },
              ]}
              onChange={(placement) => update({ placement })}
            />
          </ParamGroup>
          <ParamGroup title="行为">
            <ParamSwitch
              id="carousel-playground-loop"
              label="循环 loop"
              hint="不复制幻灯片，每张自己绕回"
              checked={config.loop}
              onCheckedChange={(loop) => update({ loop })}
            />
            <ParamSwitch
              id="carousel-playground-autoplay"
              label="自动播放 autoplay"
              hint="悬停、聚焦、拖动时暂停"
              checked={config.autoplay}
              onCheckedChange={(autoplay) => update({ autoplay })}
            />
            <ParamSlider
              label="播放间隔 delay"
              value={config.delay}
              min={2000}
              max={10000}
              step={500}
              format={(value) => `${value}ms`}
              disabled={!config.autoplay}
              onChange={(delay) => update({ delay })}
            />
            <ParamSwitch
              id="carousel-playground-auto-height"
              label="自动高度 autoHeight"
              hint="演示中每张的高度不同"
              checked={config.autoHeight}
              onCheckedChange={(autoHeight) => update({ autoHeight })}
            />
            <ParamSwitch
              id="carousel-playground-draggable"
              label="鼠标拖拽 draggable"
              hint="触摸滑动始终可用"
              checked={config.draggable}
              onCheckedChange={(draggable) => update({ draggable })}
            />
            <ParamSwitch
              id="carousel-playground-select-on-click"
              label="点击切换 selectOnClick"
              hint="点击露出的相邻幻灯片切换过去"
              checked={config.selectOnClick}
              onCheckedChange={(selectOnClick) => update({ selectOnClick })}
            />
          </ParamGroup>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 完整演示                                                              */
/* ------------------------------------------------------------------ */

/** Carousel 完整演示 */
export function CarouselDemo() {
  return (
    <div className="space-y-6">
      <DemoCard
        title="横幅大图"
        code={bannerCode}
        description="循环 + 自动播放 + 视差：拖动或甩动切换，图片反向轻移带出景深；指针移入时暂停并显示两侧箭头，活动指示点里是播放进度。"
      >
        <BannerDemo />
      </DemoCard>

      <DemoCard
        title="卡片货架"
        code={shelfCode}
        description="按视口宽度配置每屏张数（窄屏 1.15 张露出下一张），按页吸附；箭头放在标题右侧，指示点在视口下方。"
      >
        <ShelfDemo />
      </DemoCard>

      <DemoCard
        title="中心聚焦"
        code={focusCode}
        description="居中对齐 + effect=&quot;scale&quot;：两侧的幻灯片缩小变暗，点击两侧即可切换过去。"
      >
        <FocusDemo />
      </DemoCard>

      <DemoCard
        title="商品图集"
        code={galleryCode}
        description="contain + 模糊衬底完整显示不同比例的照片，右上角是分数指示器，下方缩略图条与当前张联动。"
      >
        <GalleryDemo />
      </DemoCard>

      <DemoCard
        title="推荐语"
        code={quotesCode}
        description="effect=&quot;fade&quot; + crossFade：纯文字幻灯片先淡出再淡入；autoHeight 让视口高度随文字长度连续过渡（拖动时同样连续）。"
      >
        <QuotesDemo />
      </DemoCard>

      <DemoCard
        title="自由滚动"
        code={freeCode}
        description="slidesPerView=&quot;auto&quot; 按内容宽度排布，snap=&quot;none&quot; 松手后按 UIScrollView 的减速率惯性滑行，两端回弹；视口外的标签也能用 Tab 聚焦，聚焦时自动滚入视野。"
      >
        <FreeScrollDemo />
      </DemoCard>

      <CarouselPlayground />
    </div>
  );
}
