"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowDownToLineIcon,
  BoxIcon,
  GlobeIcon,
  ImageIcon,
  SparklesIcon,
} from "lucide-react";
import {
  ExpandableCard,
  ExpandableCardLayer,
  useExpandableCard,
} from "@/components/qiuye-ui/expandable-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ViewSourceButton } from "@/components/view-source-button";

const galleryCode = `import {
  ExpandableCard,
  ExpandableCardLayer,
  useExpandableCard,
} from "@/components/qiuye-ui/expandable-card";

function AuroraCover() {
  const { live } = useExpandableCard();
  return (
    <>
      <ExpandableCardLayer
        depth={-4}
        className="-inset-6 bg-gradient-to-br from-indigo-950 via-violet-900 to-fuchsia-900"
      />
      <ExpandableCardLayer
        depth={10}
        className="right-[12%] top-[38%] size-[30cqmin] rounded-full bg-amber-100/90 blur-[1px]"
        style={{ animationPlayState: live ? "running" : "paused" }}
      />
    </>
  );
}

<ExpandableCard
  className="h-[30rem]"
  cover={<AuroraCover />}
  eyebrow="灵感"
  title={"把光影留在界面里，\\n也留在回忆里"}
  icon={<img src="/icon.png" alt="" />}
  name="Aurora"
  subtitle="分层视差与柔光插画"
  actions={<Button size="sm" className="rounded-full">获取</Button>}
>
  <p>展开后的详细内容……</p>
</ExpandableCard>`;

const controlledCode = `const [open, setOpen] = useState(false);

return (
  <>
    <Button onClick={() => setOpen(true)}>从外部打开</Button>
    <ExpandableCard
      open={open}
      onOpenChange={setOpen}
      actionLabel={null}
      className="h-72"
      cover={<Cover />}
      eyebrow="受控模式"
      title="由外部状态驱动展开"
    >
      <p>适合与 URL 参数、路由或全局状态同步。</p>
    </ExpandableCard>
  </>
);`;

/* ------------------------------------------------------------------ */
/* 演示封面                                                             */
/* ------------------------------------------------------------------ */

function AuroraCover() {
  const { live } = useExpandableCard();
  const play = { animationPlayState: live ? "running" : "paused" } as const;
  return (
    <>
      <ExpandableCardLayer
        depth={-4}
        className="-inset-6 bg-[radial-gradient(55%_50%_at_12%_8%,rgb(124_140_255/0.5),transparent_70%),radial-gradient(50%_45%_at_92%_96%,rgb(209_77_154/0.55),transparent_70%),linear-gradient(165deg,#141a3d_0%,#2a2160_45%,#55296c_78%,#74306a_100%)]"
      />
      <ExpandableCardLayer
        depth={-2}
        className="-inset-6 opacity-70 [background-image:radial-gradient(1.2px_1.2px_at_18%_34%,#fff,transparent),radial-gradient(1px_1px_at_32%_18%,#fff,transparent),radial-gradient(1.4px_1.4px_at_47%_40%,#fff,transparent),radial-gradient(1px_1px_at_71%_46%,#fff,transparent),radial-gradient(1.3px_1.3px_at_88%_14%,#fff,transparent)]"
      />
      <ExpandableCardLayer
        depth={4}
        className="-inset-x-6 -bottom-6 h-[46%] bg-[#1d1648]/80 [clip-path:polygon(0_48%,12%_30%,24%_44%,38%_18%,52%_40%,64%_26%,78%_46%,90%_22%,100%_38%,100%_100%,0_100%)]"
      />
      <ExpandableCardLayer
        depth={12}
        className="right-[14%] top-[40%] size-[22cqmin] animate-pulse rounded-full bg-[radial-gradient(circle_at_35%_35%,#fffaf0,#f3dcb6_70%)] shadow-[0_0_40px_rgb(255_228_190/0.55)] [animation-duration:9s]"
        style={play}
      />
      <ExpandableCardLayer
        depth={9}
        className="-inset-x-6 -bottom-6 h-[30%] bg-[#0f0b28] [clip-path:polygon(0_32%,10%_48%,24%_22%,38%_52%,52%_34%,66%_58%,80%_30%,92%_46%,100%_34%,100%_100%,0_100%)]"
      />
    </>
  );
}

function TileCover() {
  return (
    <>
      <ExpandableCardLayer
        depth={-3}
        className="-inset-6 bg-[#f2f0eb] [background-image:radial-gradient(45%_50%_at_88%_12%,rgb(214_200_166/0.75),transparent_70%),radial-gradient(40%_45%_at_8%_92%,rgb(124_167_255/0.35),transparent_70%)]"
      />
      <div className="absolute inset-x-[8%] bottom-[10%] top-[34%] [perspective:900px]">
        <div className="relative size-full [transform:rotateX(14deg)_rotateY(-10deg)_rotateZ(-3deg)]">
          <ExpandableCardLayer
            depth={8}
            className="left-0 top-[6%] flex h-[24%] w-[56%] items-center gap-1 rounded-2xl bg-zinc-100 p-1 shadow-lg"
          >
            {["预览", "代码", "API"].map((tab, index) => (
              <span
                key={tab}
                className={
                  index === 0
                    ? "flex h-full flex-1 items-center justify-center rounded-xl bg-white text-[11px] font-semibold text-zinc-900 shadow-sm"
                    : "flex flex-1 items-center justify-center text-[11px] font-semibold text-zinc-500"
                }
              >
                {tab}
              </span>
            ))}
          </ExpandableCardLayer>
          <ExpandableCardLayer
            depth={16}
            className="right-0 top-0 flex h-[46%] w-[36%] flex-col justify-between rounded-2xl bg-white p-3 shadow-xl"
          >
            <span className="text-[10px] font-medium text-zinc-500">Rendering</span>
            <span className="text-3xl font-bold tracking-tight text-zinc-900">
              72<small className="text-sm text-zinc-500">%</small>
            </span>
            <span className="h-1.5 rounded-full bg-gradient-to-r from-sky-400 to-amber-200" />
          </ExpandableCardLayer>
          <ExpandableCardLayer
            depth={5}
            className="bottom-[26%] left-[2%] size-[28%] rounded-[30%] bg-gradient-to-br from-[#e9dcbc] to-[#c8b68a] shadow-xl"
          />
          <ExpandableCardLayer
            depth={20}
            className="bottom-0 left-[12%] rounded-xl bg-zinc-900 px-3 py-2.5 font-mono text-[clamp(9px,2.8cqw,12px)] whitespace-nowrap text-zinc-200 shadow-xl"
          >
            <span className="text-zinc-500">$</span> shadcn add{" "}
            <span className="text-amber-200">@qiuye-ui/expandable-card</span>
          </ExpandableCardLayer>
        </div>
      </div>
    </>
  );
}

function ImageCover() {
  return (
    <ExpandableCardLayer depth={-6} className="-inset-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/examples/matrix-effect/source.webp"
        alt=""
        className="size-full object-cover"
      />
    </ExpandableCardLayer>
  );
}

function AppIcon({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <span
      className={`grid size-full place-items-center text-white [&_svg]:size-6 ${className}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 演示正文                                                             */
/* ------------------------------------------------------------------ */

function Facts({ items }: { items: [string, string][] }) {
  return (
    <dl className="mt-4 grid grid-cols-2 gap-y-4 border-y py-3.5 sm:grid-cols-4 sm:gap-y-0">
      {items.map(([label, value], index) => (
        <div
          key={label}
          className={`flex flex-col items-center gap-1 px-2 text-center ${
            index > 0 ? "sm:border-l" : ""
          } ${index % 2 === 1 ? "border-l" : ""}`}
        >
          <dt className="text-[11px] font-medium tracking-wide text-muted-foreground">
            {label}
          </dt>
          <dd className="text-base font-semibold tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function DetailBody({
  facts,
  paragraphs,
  highlights,
}: {
  facts: [string, string][];
  paragraphs: string[];
  highlights: [string, string][];
}) {
  return (
    <div className="space-y-8">
      <Facts items={facts} />
      <div className="space-y-4">
        {paragraphs.map((text) => (
          <p
            key={text}
            className="text-[15px] leading-[1.9] text-foreground/80 text-pretty"
          >
            {text}
          </p>
        ))}
      </div>
      <section className="space-y-3.5">
        <h3 className="text-lg font-semibold">亮点</h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {highlights.map(([title, description]) => (
            <li key={title} className="rounded-2xl bg-muted px-4 py-4">
              <strong className="text-[15px] font-semibold">{title}</strong>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

const auroraBody = (
  <DetailBody
    facts={[
      ["类型", "插画"],
      ["图层", "5"],
      ["视差", "指针"],
      ["循环", "可暂停"],
    ]}
    paragraphs={[
      "封面由多个 ExpandableCardLayer 组成，每层设置不同的 depth：远景反向轻移，近景位移更大，指针离开后共同回到原位。",
      "封面在卡片与浮层中各渲染一次。通过 useExpandableCard() 读取 live，在卡片不可见、浮层占用、展开/收起过程中或用户偏好减少动态效果时暂停循环动画。",
    ]}
    highlights={[
      ["数值驱动的变形", "按数值动画位置与尺寸，文字和圆角在过渡中不会被拉伸。"],
      ["阴影无缝交接", "深阴影随浮层升起，落地前归零，与卡片阴影逐值一致。"],
      ["不重排的滚动", "叠加滚动条不占宽度，展开完成前后内容不跳动。"],
      ["完整的可访问性", "焦点陷阱、Esc 与遮罩关闭、关闭后焦点回到卡片。"],
    ]}
  />
);

/** 首页与详情快速预览：单张可展开卡片 */
export function ExpandableCardPreview() {
  return (
    <div className="mx-auto w-full max-w-[340px] py-2">
      <ExpandableCard
        className="h-[23rem]"
        cover={<AuroraCover />}
        eyebrow="灵感"
        title={"把光影留在界面里，\n也留在回忆里"}
        icon={
          <AppIcon className="bg-gradient-to-br from-indigo-500 to-fuchsia-500">
            <SparklesIcon />
          </AppIcon>
        }
        name="Aurora"
        subtitle="分层视差与柔光插画"
        actions={
          <Button size="sm" className="rounded-full">
            获取
          </Button>
        }
      >
        {auroraBody}
      </ExpandableCard>
    </div>
  );
}

/** ExpandableCard 完整演示 */
export function ExpandableCardDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>App Store 风格卡片</CardTitle>
            <ViewSourceButton code={galleryCode} />
          </div>
          <CardDescription>
            点击卡片，从原位置放大为居中详情；Esc、遮罩或右上角按钮关闭后飞回原卡片。
            悬停可以看到分层视差与高光。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <ExpandableCard
              className="h-[30rem]"
              cover={<AuroraCover />}
              eyebrow="灵感"
              title={"把光影留在界面里，\n也留在回忆里"}
              icon={
                <AppIcon className="bg-gradient-to-br from-indigo-500 to-fuchsia-500">
                  <SparklesIcon />
                </AppIcon>
              }
              name="Aurora"
              subtitle="分层视差与柔光插画"
              actions={
                <>
                  <Button size="sm" className="rounded-full">
                    <ArrowDownToLineIcon />
                    获取
                  </Button>
                </>
              }
            >
              {auroraBody}
            </ExpandableCard>

            <ExpandableCard
              className="h-[30rem]"
              tone="dark"
              cover={<TileCover />}
              eyebrow="组件库"
              title={"把打磨过的细节，\n装进你的项目里"}
              icon={
                <AppIcon className="bg-zinc-950">
                  <BoxIcon />
                </AppIcon>
              }
              name="QiuYe UI"
              subtitle="以源码分发的 React 组件集"
              actions={
                <Button size="sm" className="rounded-full" asChild>
                  <a href="https://ui.qiuyedx.com" target="_blank" rel="noreferrer">
                    <GlobeIcon />
                    访问官网
                  </a>
                </Button>
              }
            >
              <DetailBody
                facts={[
                  ["封面文字", "深色"],
                  ["tone", "dark"],
                  ["透视", "CSS 3D"],
                  ["图层", "5"],
                ]}
                paragraphs={[
                  "浅色封面使用 tone=\"dark\"，标题改为深色文字，并配合由白色渐隐的衬底保证可读性。",
                  "封面容器设置了 container-type: size，可以用 cqw、cqh、cqmin 让构图随卡片与浮层的尺寸连续缩放。",
                ]}
                highlights={[
                  ["源码即组件", "通过 shadcn CLI 安装后以源码形式进入项目。"],
                  ["深浅主题", "卡片、浮层与滚动条全部使用主题语义色。"],
                ]}
              />
            </ExpandableCard>

            <ExpandableCard
              className="h-[30rem] md:col-span-2 xl:col-span-1"
              cover={<ImageCover />}
              eyebrow="摄影"
              title={"一张照片，\n也可以是一张封面"}
              icon={
                <AppIcon className="bg-gradient-to-br from-sky-500 to-emerald-500">
                  <ImageIcon />
                </AppIcon>
              }
              name="Image Cover"
              subtitle="任意节点都可以作为封面"
            >
              <DetailBody
                facts={[
                  ["封面", "图片"],
                  ["视差", "整图"],
                  ["操作区", "无"],
                  ["标题", "两行"],
                ]}
                paragraphs={[
                  "图片作为单一图层时只能整体位移；给图层设置负 inset 预留出血，避免视差时露出边缘。",
                  "未传 actions 时，展开后胶囊淡出、底栏右侧留空。",
                ]}
                highlights={[
                  ["任意封面", "图片、视频、Canvas 或纯 CSS 插画都可以。"],
                  ["标题换行", "字符串中的 \\n 作为换行，卡片与浮层断行一致。"],
                ]}
              />
            </ExpandableCard>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>受控模式与纯封面卡片</CardTitle>
            <ViewSourceButton code={controlledCode} />
          </div>
          <CardDescription>
            通过 open / onOpenChange 由外部状态驱动，适合同步 URL 参数；actionLabel 设为 null 且不传底栏信息时，只显示封面。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => setOpen(true)}>
              从外部打开
            </Button>
            <span className="text-sm text-muted-foreground">
              open = <code className="font-mono">{String(open)}</code>
            </span>
          </div>
          <ExpandableCard
            open={open}
            onOpenChange={setOpen}
            actionLabel={null}
            label="受控模式示例"
            className="h-72"
            cover={<AuroraCover />}
            eyebrow="受控模式"
            title="由外部状态驱动展开"
          >
            <DetailBody
              facts={[
                ["模式", "受控"],
                ["底栏", "隐藏"],
                ["关闭", "回调"],
                ["深链", "可选"],
              ]}
              paragraphs={[
                "卡片点击、Esc、遮罩与关闭按钮都会调用 onOpenChange；外部把 open 改为 false 时，同样完整播放收起动画。",
              ]}
              highlights={[
                ["URL 同步", "在 onOpenChange 中写入 ?item=，页面加载时据此设置 open。"],
                ["独立实例", "多张卡片各自管理展开状态，互不影响。"],
              ]}
            />
          </ExpandableCard>
        </CardContent>
      </Card>
    </div>
  );
}
