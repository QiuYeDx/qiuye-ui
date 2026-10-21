"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AudioLinesIcon,
  BookOpenIcon,
  FileTextIcon,
  FlaskConicalIcon,
  FolderPenIcon,
  LanguagesIcon,
  LayersIcon,
  MousePointer2Icon,
  RotateCcwIcon,
  ScanTextIcon,
  SquareStackIcon,
  WandSparklesIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  SpotlightTile,
  SpotlightTileLink,
} from "@/components/qiuye-ui/spotlight-tile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ViewSourceButton } from "@/components/view-source-button";
import { cn } from "@/lib/utils";

/** 演示用色调：中等明度的 oklch，浅色与深色主题下都清晰 */
const TONES = {
  blue: "oklch(0.62 0.19 255)",
  violet: "oklch(0.6 0.22 295)",
  emerald: "oklch(0.64 0.15 160)",
  amber: "oklch(0.72 0.16 70)",
  rose: "oklch(0.63 0.21 15)",
  cyan: "oklch(0.66 0.12 215)",
} as const;

const preventNavigation = {
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    toast(`打开「${event.currentTarget.textContent}」`);
  },
};

/* ------------------------------------------------------------------ */
/* 首页 / 详情页快速预览：组件目录便当格                                  */
/* ------------------------------------------------------------------ */

/** SpotlightTile 快速预览：链接到其他组件的小型便当格 */
export function SpotlightTilePreview() {
  return (
    <div className="@container w-full">
      <div className="grid grid-cols-2 gap-3 @md:grid-cols-3 @md:grid-rows-[repeat(2,minmax(9.5rem,auto))]">
        <SpotlightTile
          className="col-span-2 p-4"
          tone={TONES.blue}
          icon={<SquareStackIcon />}
          badge="New"
          title={
            <SpotlightTileLink asChild>
              <Link href="/components/expandable-card">ExpandableCard</Link>
            </SpotlightTileLink>
          }
          arrow
          description="从原位置连续放大为居中详情，封面带分层视差。"
          chips={["容器变形", "视差", "浮层"]}
          index={0}
        />
        <SpotlightTile
          className="hidden p-4 @md:col-start-3 @md:row-span-2 @md:row-start-1 @md:flex"
          tone={TONES.violet}
          icon={<MousePointer2Icon />}
          title={
            <SpotlightTileLink asChild>
              <Link href="/components/adaptive-pointer">AdaptivePointer</Link>
            </SpotlightTileLink>
          }
          arrow
          description="iPadOS 风格的自适应指针。"
          chips={["指针", "弹簧"]}
          index={1}
        >
          <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
            {["悬停变形为圆角板", "正文上变为 I 形竖条", "外环 1:1 标出位置"].map(
              (feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ background: TONES.violet }}
                  />
                  {feature}
                </li>
              ),
            )}
          </ul>
        </SpotlightTile>
        <SpotlightTile
          className="p-4"
          tone={TONES.emerald}
          icon={<LayersIcon />}
          title={
            <SpotlightTileLink asChild>
              <Link href="/components/smooth-corners">SmoothCorners</Link>
            </SpotlightTileLink>
          }
          arrow
          description="Figma / iOS 风格的平滑圆角。"
          index={2}
        />
        <SpotlightTile
          className="p-4"
          tone={TONES.amber}
          icon={<WandSparklesIcon />}
          title={
            <SpotlightTileLink asChild>
              <Link href="/components/matrix-effect">MatrixEffect</Link>
            </SpotlightTileLink>
          }
          arrow
          description="点阵与 ASCII 字符画实时渲染。"
          index={3}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 完整演示                                                              */
/* ------------------------------------------------------------------ */

const tools = [
  {
    title: "字幕翻译",
    description: "批量翻译 SRT / ASS 字幕，保留时间轴、样式与双语排版。",
    icon: <LanguagesIcon />,
    tone: TONES.blue,
    chips: ["SRT", "ASS", "双语"],
    action: true,
  },
  {
    title: "语音转写",
    description: "从音视频中识别语音，生成带时间轴的字幕草稿。",
    icon: <AudioLinesIcon />,
    tone: TONES.violet,
    chips: ["Whisper", "多语言"],
    badge: "Beta",
    action: true,
  },
  {
    title: "格式转换",
    description: "在常见字幕格式之间互转，自动修正编码与换行。",
    icon: <FileTextIcon />,
    tone: TONES.emerald,
    chips: ["SRT", "VTT", "LRC"],
  },
  {
    title: "字幕提取",
    description: "从视频的内嵌轨道或画面中提取字幕。",
    icon: <ScanTextIcon />,
    tone: TONES.amber,
    chips: ["MKV", "OCR"],
  },
  {
    title: "批量重命名",
    description: "按剧集规则让字幕与视频文件名一一对应。",
    icon: <FolderPenIcon />,
    tone: TONES.rose,
    chips: ["正则", "预览"],
  },
  {
    title: "实验功能",
    description: "还在打磨中的小工具，欢迎试用并反馈。",
    icon: <FlaskConicalIcon />,
    tone: TONES.cyan,
    chips: ["预览版"],
    badge: "Labs",
  },
];

const gridCode = `import { LanguagesIcon } from "lucide-react";
import { SpotlightTile } from "@/components/qiuye-ui/spotlight-tile";
import { Button } from "@/components/ui/button";

const tools = [
  {
    href: "/tools/translate",
    title: "字幕翻译",
    description: "批量翻译 SRT / ASS 字幕，保留时间轴、样式与双语排版。",
    icon: <LanguagesIcon />,
    tone: "oklch(0.62 0.19 255)",
    chips: ["SRT", "ASS", "双语"],
  },
  // ...
];

export function ToolGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool, index) => (
        <SpotlightTile
          key={tool.href}
          index={index} // 错开上浮淡入
          tone={tool.tone}
          icon={tool.icon}
          title={tool.title}
          description={tool.description}
          chips={tool.chips}
          href={tool.href} // 标题成为铺满整张卡片的链接
          className="min-h-44"
          actions={
            // 浮在卡片链接之上，可以单独点击
            <Button size="sm" variant="outline" className="h-7 rounded-full px-3 text-xs">
              快速开始
            </Button>
          }
        />
      ))}
    </div>
  );
}`;

const toneCode = `// tone 接受任意 CSS 颜色
<SpotlightTile tone="#e11d48" ... />
<SpotlightTile tone="oklch(0.62 0.19 255)" ... />
<SpotlightTile tone="var(--chart-2)" ... />`;

const variantsCode = `import Link from "next/link";
import { SpotlightTile, SpotlightTileLink } from "@/components/qiuye-ui/spotlight-tile";

// 1. 整张卡片就是一个 <a>（asChild）
<SpotlightTile asChild tone="#10b981" icon={<BookOpenIcon />} title="阅读文档" description="...">
  <a href="/docs" />
</SpotlightTile>

// 2. 路由链接：用 SpotlightTileLink asChild 包住标题
<SpotlightTile
  arrow
  title={
    <SpotlightTileLink asChild>
      <Link href="/components">组件目录</Link>
    </SpotlightTileLink>
  }
/>

// 3. 静态信息卡：不传链接，没有箭头与上浮；children 显示在描述下方
<SpotlightTile icon={<RocketIcon />} title="本周发布" watermark={false}>
  <p className="mt-4 text-3xl font-semibold tabular-nums">12</p>
</SpotlightTile>`;

const swatches = [
  { label: "Blue", value: TONES.blue },
  { label: "Violet", value: TONES.violet },
  { label: "Emerald", value: TONES.emerald },
  { label: "Amber", value: TONES.amber },
  { label: "Rose", value: "#e11d48" },
  { label: "chart-2", value: "var(--chart-2)" },
  { label: "primary", value: "var(--primary)" },
];

/** SpotlightTile 完整演示 */
export function SpotlightTileDemo() {
  const [replay, setReplay] = useState(0);
  const [tone, setTone] = useState<string>(TONES.violet);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>工具目录</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReplay((value) => value + 1)}
              >
                <RotateCcwIcon />
                重播入场
              </Button>
              <ViewSourceButton code={gridCode} />
            </div>
          </div>
          <CardDescription>
            指针移到卡片上，边框沿指针位置亮起色调光；标题链接的点击区域铺满整张卡片，
            「快速开始」按钮仍可单独点击。Tab 聚焦时整张卡片显示色调描边。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div key={replay} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, index) => (
              <SpotlightTile
                key={tool.title}
                index={index}
                tone={tool.tone}
                icon={tool.icon}
                badge={tool.badge}
                title={tool.title}
                description={tool.description}
                chips={tool.chips}
                href={`#${tool.title}`}
                linkProps={preventNavigation}
                className="min-h-44"
                actions={
                  tool.action ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 rounded-full px-3 text-xs"
                      onClick={() => toast(`用「${tool.title}」快速开始`)}
                    >
                      快速开始
                    </Button>
                  ) : undefined
                }
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>任意色调</CardTitle>
            <ViewSourceButton code={toneCode} />
          </div>
          <CardDescription>
            <code>tone</code> 接受任意 CSS 颜色，边框光、柔光、图标底板、水印、阴影与聚焦描边都由它派生。
          </CardDescription>
        </CardHeader>
        <CardContent className="grid items-start gap-6 md:grid-cols-[minmax(0,22rem)_1fr]">
          <SpotlightTile
            tone={tone}
            icon={<WandSparklesIcon />}
            badge="Beta"
            title="智能校对"
            description="检查错别字、标点与时间轴重叠，一键修正。"
            chips={["校对", "时间轴"]}
            href="#智能校对"
            linkProps={preventNavigation}
            className="min-h-44"
          />
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {swatches.map((swatch) => (
                <button
                  key={swatch.label}
                  type="button"
                  aria-pressed={tone === swatch.value}
                  onClick={() => setTone(swatch.value)}
                  className={cn(
                    "flex h-8 items-center gap-2 rounded-full border px-3 text-xs transition-colors hover:bg-muted",
                    tone === swatch.value &&
                      "border-foreground/30 bg-muted font-medium",
                  )}
                >
                  <span
                    aria-hidden
                    className="size-3 rounded-full"
                    style={{ background: swatch.value }}
                  />
                  {swatch.label}
                </button>
              ))}
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              tone=&quot;{tone}&quot;
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>更多形态</CardTitle>
            <ViewSourceButton code={variantsCode} />
          </div>
          <CardDescription>
            整张卡片作为链接（asChild）、配合路由库的标题链接，以及不可点击的静态信息卡。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SpotlightTile
              asChild
              tone={TONES.emerald}
              icon={<BookOpenIcon />}
              title="阅读文档"
              description="整张卡片就是一个链接，适合没有内层按钮的入口。"
              className="min-h-40"
            >
              <a
                href="#阅读文档"
                onClick={(event) => {
                  event.preventDefault();
                  toast("打开「阅读文档」");
                }}
              />
            </SpotlightTile>
            <SpotlightTile
              tone={TONES.blue}
              icon={<SquareStackIcon />}
              arrow
              title={
                <SpotlightTileLink asChild>
                  <Link href="/components">组件目录</Link>
                </SpotlightTileLink>
              }
              description="用 SpotlightTileLink asChild 接入 next/link 等路由链接。"
              className="min-h-40"
            />
            <SpotlightTile
              tone={TONES.amber}
              icon={<LayersIcon />}
              watermark={false}
              title="本周处理"
              description="不传链接时没有箭头，也不会上浮。"
              className="min-h-40"
            >
              <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">
                1,284
                <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                  条字幕
                </span>
              </p>
            </SpotlightTile>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
