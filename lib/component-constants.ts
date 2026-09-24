/**
 * 组件常量和枚举定义
 * 统一管理所有组件的标识符，避免硬编码字符串
 */

// 组件 ID 枚举
// TODO: 新增自定义组件时需要更新这里
export enum ComponentId {
  ANIMATED_NUMBER = "animated-number",
  RESPONSIVE_TABS = "responsive-tabs",
  CLIP_PATH_TABS = "clip-path-tabs",
  SEGMENTED_CONTROL = "segmented-control",
  SCROLLABLE_DIALOG = "scrollable-dialog",
  DOT_GLASS = "dot-glass",
  IMAGE_VIEWER = "image-viewer",
  DUAL_STATE_TOGGLE = "dual-state-toggle",
  THEME_TRANSITION_TOGGLE = "theme-transition-toggle",
  CODE_BLOCK = "code-block",
  TYPEWRITER = "typewriter",
  MARKDOWN_RENDERER = "markdown-renderer",
  COLOR_PICKER = "color-picker",
  SMOOTH_CORNERS = "smooth-corners",
  TOUR = "tour",
  MATRIX_EFFECT = "matrix-effect",
}

// 组件 ID 数组，方便遍历
export const COMPONENT_IDS = Object.values(ComponentId);

// 基础使用示例配置
export interface BasicUsageExample {
  import: string;
  usage: string;
}

export type BasicUsageExamples = Record<ComponentId, BasicUsageExample>;

// 基础使用示例数据
export const basicUsageExamples: BasicUsageExamples = {
  [ComponentId.ANIMATED_NUMBER]: {
    import: `import { AnimatedNumber } from "@/components/qiuye-ui/animated-number";\nimport { useState } from "react";`,
    usage: `const [count, setCount] = useState(99);\n\nreturn (\n  <div className="flex items-baseline gap-2">\n    <AnimatedNumber value={count} className="text-4xl" />\n    <span>次</span>\n    <button onClick={() => setCount(value => value + 1)}>增加</button>\n  </div>\n);`,
  },
  [ComponentId.RESPONSIVE_TABS]: {
    import: `import { ResponsiveTabs } from "@/components/qiuye-ui/responsive-tabs";
import { useState } from "react";`,
    usage: `const [value, setValue] = useState("all");
const items = [
  { value: "all", label: "全部" },
  { value: "active", label: "进行中" },
  { value: "review", label: "等待审批" },
];

return (
  <ResponsiveTabs value={value} onValueChange={setValue} items={items}>
    <div className="p-4">
      当前选中：{items.find((item) => item.value === value)?.label}
    </div>
  </ResponsiveTabs>
);`,
  },
  [ComponentId.CLIP_PATH_TABS]: {
    import: `import {
  ClipPathTabs,
  ClipPathTabsContent,
} from "@/components/qiuye-ui/clip-path-tabs";
import { useState } from "react";`,
    usage: `const [value, setValue] = useState("overview");

return (
  <ClipPathTabs
    ariaLabel="项目视图"
    value={value}
    onValueChange={setValue}
    items={[
      { value: "overview", label: "概览" },
      { value: "activity", label: "动态" },
      { value: "settings", label: "设置" },
    ]}
  >
    <ClipPathTabsContent value="overview">概览内容</ClipPathTabsContent>
    <ClipPathTabsContent value="activity">动态内容</ClipPathTabsContent>
    <ClipPathTabsContent value="settings">设置内容</ClipPathTabsContent>
  </ClipPathTabs>
);`,
  },
  [ComponentId.SEGMENTED_CONTROL]: {
    import: `import { SegmentedControl } from "@/components/qiuye-ui/segmented-control";
import { useState } from "react";`,
    usage: `const [mode, setMode] = useState("chat");

return (
  <SegmentedControl
    aria-label="工作模式"
    value={mode}
    onValueChange={setMode}
    items={[
      { value: "chat", label: "Chat" },
      { value: "work", label: "Work" },
    ]}
  />
);`,
  },
  [ComponentId.SCROLLABLE_DIALOG]: {
    import: `import {
  ScrollableDialog,
  ScrollableDialogHeader,
  ScrollableDialogContent,
  ScrollableDialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/qiuye-ui/scrollable-dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";`,
    usage: `const [open, setOpen] = useState(false);

return (
  <>
    <Button onClick={() => setOpen(true)}>打开对话框</Button>
    <ScrollableDialog open={open} onOpenChange={setOpen}>
      <ScrollableDialogHeader>
        <DialogTitle>标题</DialogTitle>
        <DialogDescription>描述</DialogDescription>
      </ScrollableDialogHeader>
      
      <ScrollableDialogContent>
        {/* 可滚动的内容 */}
        <p>这里是对话框的内容</p>
      </ScrollableDialogContent>
      
      <ScrollableDialogFooter>
        <Button onClick={() => setOpen(false)}>确认</Button>
      </ScrollableDialogFooter>
    </ScrollableDialog>
  </>
);`,
  },
  [ComponentId.DOT_GLASS]: {
    import: `import { DotGlass } from "@/components/qiuye-ui/dot-glass";`,
    usage: `<DotGlass
  className="absolute inset-0 left-1/2"
  dotSize={3}
  dotGap={6}
  blur={4}
  saturation={140}
  glassAlpha={0.45}
  coverColor={"#ffffff"}
></DotGlass>`,
  },
  [ComponentId.IMAGE_VIEWER]: {
    import: `import { ImageViewer } from "@/components/qiuye-ui/image-viewer";`,
    usage: `<ImageViewer
  src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
  alt="荒漠公路"
  maxHeight={400}
  rounded="2xl"
  lightboxRounded="2xl"
  smoothCorners
  smoothCornerSmoothing={0.72}
  className="w-full"
  wrapperClassName="flex justify-center items-center"
/>`,
  },
  [ComponentId.DUAL_STATE_TOGGLE]: {
    import: `import { DualStateToggle } from "@/components/qiuye-ui/dual-state-toggle";
import { useState } from "react";
import { Menu, X } from "lucide-react";`,
    usage: `const [isOpen, setIsOpen] = useState(false);

return (
  <DualStateToggle
    active={isOpen}
    onToggle={setIsOpen}
    activeIcon={<X />}
    inactiveIcon={<Menu />}
    activeLabel="关闭"
    inactiveLabel="打开"
    effect="rotate"
  />
);`,
  },
  [ComponentId.THEME_TRANSITION_TOGGLE]: {
    import: `import { ThemeTransitionToggle } from "@/components/qiuye-ui/theme-transition-toggle";
import { useTheme } from "next-themes";`,
    usage: `const { resolvedTheme, setTheme } = useTheme();
const isDark = resolvedTheme === "dark";

return (
  <ThemeTransitionToggle
    isDark={isDark}
    onToggle={(nextDark) => setTheme(nextDark ? "dark" : "light")}
  />
);`,
  },
  [ComponentId.CODE_BLOCK]: {
    import: `import { CodeBlock, CodeBlockPanel } from "@/components/qiuye-ui/code-block";`,
    usage: `<CodeBlockPanel filename="app.ts" code={code}>
  <CodeBlock language="typescript" isDark>
    {code}
  </CodeBlock>
</CodeBlockPanel>`,
  },
  [ComponentId.TYPEWRITER]: {
    import: `import { Typewriter } from "@/components/qiuye-ui/typewriter";`,
    usage: `<Typewriter
  phrases={["Hello", "World", "React"]}
  typingSpeed={90}
  loop
/>`,
  },
  [ComponentId.MARKDOWN_RENDERER]: {
    import: `import { MarkdownRenderer } from "@/components/qiuye-ui/markdown-renderer";`,
    usage: `const content = \`# MarkdownRenderer

支持 **GFM**、表格、代码块、Mermaid 和图片预览。

\`\`\`tsx title="hello.tsx" {2}
export function Hello() {
  return <span>Hello QiuYe UI</span>;
}
\`\`\`
\`;

return <MarkdownRenderer content={content} />;`,
  },
  [ComponentId.COLOR_PICKER]: {
    import: `import { ColorPicker } from "@/components/qiuye-ui/color-picker";
import { useState } from "react";`,
    usage: `const [color, setColor] = useState("#6366F1");

return (
  <div className="flex items-center gap-4">
    <ColorPicker value={color} onChange={setColor} />
    <span className="font-mono text-sm">{color}</span>
  </div>
);`,
  },
  [ComponentId.SMOOTH_CORNERS]: {
    import: `import { SmoothCorners } from "@/components/qiuye-ui/smooth-corners";`,
    usage: `<SmoothCorners
  radius={28}
  smoothing={0.7}
  className="bg-primary p-6 text-primary-foreground"
>
  Smooth corner card
</SmoothCorners>`,
  },
  [ComponentId.TOUR]: {
    import: `import { Tour } from "@/components/qiuye-ui/tour";
import { Button } from "@/components/ui/button";
import { useState } from "react";`,
    usage: `const [open, setOpen] = useState(false);

return (
  <>
    <Button onClick={() => setOpen(true)}>Start tour</Button>
    <Tour
      open={open}
      onOpenChange={setOpen}
      steps={[
        {
          target: "#sidebar",
          title: "Navigation",
          content: "Browse your projects here.",
          placement: "right",
        },
        {
          target: "#search",
          title: "Search",
          content: "Find anything in your workspace.",
          placement: "bottom",
        },
      ]}
    />
  </>
);`,
  },
  [ComponentId.MATRIX_EFFECT]: {
    import: `import { DotMatrixEffect } from "@/components/qiuye-ui/matrix-effect";`,
    usage: `<DotMatrixEffect
  className="aspect-video w-full overflow-hidden rounded-md"
  color="#9C9C9C"
  backgroundColor="#F6F6F6"
  grid={{ mode: "auto", cellSize: 10, maxCells: 7_000 }}
  radiusRange={[0, 3]}
  blobOptions={{
    count: 4,
    minRadius: 0.18,
    maxRadius: 0.48,
    speed: 0.4,
    baseValue: 0.025,
    seed: 17,
  }}
  levels={{ contrast: 1.25 }}
  frameRate="auto"
  maxDpr={2}
  pauseWhenOffscreen
  decorative={false}
  ariaLabel="流动的柔和光团圆点矩阵"
/>`,
  },
};

// 获取基础使用示例的辅助函数
export function getBasicUsageExample(
  componentId: string,
): BasicUsageExample | null {
  return basicUsageExamples[componentId as ComponentId] || null;
}
