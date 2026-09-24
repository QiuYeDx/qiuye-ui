import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SmoothCorners } from "@/components/qiuye-ui/smooth-corners";
import { TabsContent } from "@/components/qiuye-ui/responsive-tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getComponent,
  componentRegistry,
  type ComponentInfo,
} from "@/lib/registry";
import { ComponentId } from "@/lib/component-constants";
import {
  BackButton,
  CopyCommandButton,
  SidebarCodeBlock,
  DependenciesSection,
  ComponentDetailTabs,
  BasicUsageBlock,
} from "./client-interactions";

// 生成静态参数，用于静态站点生成
export async function generateStaticParams() {
  return Object.keys(componentRegistry).map((id) => ({
    id: id,
  }));
}

import { AnimatedNumberDemo } from "@/components/qiuye-ui/demos/animated-number-demo";

// 导入演示组件
import { ResponsiveTabsDemo } from "@/components/qiuye-ui/demos/responsive-tabs-demo";
import { ClipPathTabsDemo } from "@/components/qiuye-ui/demos/clip-path-tabs-demo";
import { SegmentedControlDemo } from "@/components/qiuye-ui/demos/segmented-control-demo";
import { ScrollableDialogDemo } from "@/components/qiuye-ui/demos/scrollable-dialog-demo";
import { DotGlassDemo } from "@/components/qiuye-ui/demos/dot-glass-demo";
import { ImageViewerDemo } from "@/components/qiuye-ui/demos/image-viewer-demo";
import { DualStateToggleDemo } from "@/components/qiuye-ui/demos/dual-state-toggle-demo";
import { ThemeTransitionToggleDemo } from "@/components/qiuye-ui/demos/theme-transition-toggle-demo";
import { CodeBlockDemo } from "@/components/qiuye-ui/demos/code-block-demo";
import { TypewriterDemo } from "@/components/qiuye-ui/demos/typewriter-demo";
import { MarkdownRendererDemo } from "@/components/qiuye-ui/demos/markdown-renderer-demo";
import { ColorPickerDemo } from "@/components/qiuye-ui/demos/color-picker-demo";
import { SmoothCornersDemo } from "@/components/qiuye-ui/demos/smooth-corners-demo";
import { TourDemo } from "@/components/qiuye-ui/demos/tour-demo";
import { MatrixEffectDemo } from "@/components/qiuye-ui/demos/matrix-effect-demo";

// TODO: 新增 qiuye-ui 自定义组件时需要完善 demo 文件
const demoComponents = {
  [ComponentId.ANIMATED_NUMBER]: AnimatedNumberDemo,
  [ComponentId.RESPONSIVE_TABS]: ResponsiveTabsDemo,
  [ComponentId.CLIP_PATH_TABS]: ClipPathTabsDemo,
  [ComponentId.SEGMENTED_CONTROL]: SegmentedControlDemo,
  [ComponentId.SCROLLABLE_DIALOG]: ScrollableDialogDemo,
  [ComponentId.DOT_GLASS]: DotGlassDemo,
  [ComponentId.IMAGE_VIEWER]: ImageViewerDemo,
  [ComponentId.DUAL_STATE_TOGGLE]: DualStateToggleDemo,
  [ComponentId.THEME_TRANSITION_TOGGLE]: ThemeTransitionToggleDemo,
  [ComponentId.CODE_BLOCK]: CodeBlockDemo,
  [ComponentId.TYPEWRITER]: TypewriterDemo,
  [ComponentId.MARKDOWN_RENDERER]: MarkdownRendererDemo,
  [ComponentId.COLOR_PICKER]: ColorPickerDemo,
  [ComponentId.SMOOTH_CORNERS]: SmoothCornersDemo,
  [ComponentId.TOUR]: TourDemo,
  [ComponentId.MATRIX_EFFECT]: MatrixEffectDemo,
};

// 导入简单演示组件
import {
  AnimatedNumberSimpleDemo,
  ResponsiveTabsSimpleDemo,
  ClipPathTabsSimpleDemo,
  SegmentedControlSimpleDemo,
  ScrollableDialogSimpleDemo,
  DotGlassSimpleDemo,
  ImageViewerSimpleDemo,
  DualStateToggleSimpleDemo,
  ThemeTransitionToggleSimpleDemo,
  CodeBlockSimpleDemo,
  TypewriterSimpleDemo,
  MarkdownRendererSimpleDemo,
  ColorPickerSimpleDemo,
  SmoothCornersSimpleDemo,
  TourSimpleDemo,
  MatrixEffectSimpleDemo,
} from "./simple-demos";

// 精简的单例演示组件
const simpleDemoComponents = {
  [ComponentId.ANIMATED_NUMBER]: AnimatedNumberSimpleDemo,
  [ComponentId.RESPONSIVE_TABS]: ResponsiveTabsSimpleDemo,
  [ComponentId.CLIP_PATH_TABS]: ClipPathTabsSimpleDemo,
  [ComponentId.SEGMENTED_CONTROL]: SegmentedControlSimpleDemo,
  [ComponentId.SCROLLABLE_DIALOG]: ScrollableDialogSimpleDemo,
  [ComponentId.DOT_GLASS]: DotGlassSimpleDemo,
  [ComponentId.IMAGE_VIEWER]: ImageViewerSimpleDemo,
  [ComponentId.DUAL_STATE_TOGGLE]: DualStateToggleSimpleDemo,
  [ComponentId.THEME_TRANSITION_TOGGLE]: ThemeTransitionToggleSimpleDemo,
  [ComponentId.CODE_BLOCK]: CodeBlockSimpleDemo,
  [ComponentId.TYPEWRITER]: TypewriterSimpleDemo,
  [ComponentId.MARKDOWN_RENDERER]: MarkdownRendererSimpleDemo,
  [ComponentId.COLOR_PICKER]: ColorPickerSimpleDemo,
  [ComponentId.SMOOTH_CORNERS]: SmoothCornersSimpleDemo,
  [ComponentId.TOUR]: TourSimpleDemo,
  [ComponentId.MATRIX_EFFECT]: MatrixEffectSimpleDemo,
};

// 简单的演示预览组件
function DemoPreview({
  componentId,
  component,
}: {
  componentId: string;
  component: ComponentInfo;
}) {
  const SimpleDemoComponent =
    simpleDemoComponents[componentId as keyof typeof simpleDemoComponents];

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">快速预览</h2>
        <p className="text-sm text-muted-foreground">
          查看 {component.name} 组件的基本效果
        </p>
      </div>
      <SmoothCorners
        radius={20}
        smoothing={0.7}
        className="rounded-lg bg-muted/30 p-4 sm:p-5"
      >
        {SimpleDemoComponent ? (
          <SimpleDemoComponent />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            演示组件正在开发中...
          </div>
        )}
      </SmoothCorners>
    </section>
  );
}

// 基本用法代码块 — 服务端预计算代码文本，客户端组件负责主题感知渲染
function getBasicUsageCodes(component: ComponentInfo) {
  const example = component.basicUsage;
  const importCode =
    example?.import ||
    `import { ${String(component.name || "").replace(/\s+/g, "")} } from "@/components/qiuye-ui/${component.cliName}";`;
  const usageCode =
    example?.usage || `<${String(component.name || "").replace(/\s+/g, "")} />`;
  return { importCode, usageCode };
}

interface ComponentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ComponentDetailPage({
  params,
}: ComponentDetailPageProps) {
  const { id: componentId } = await params;
  const component = getComponent(componentId);

  if (!component) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">组件未找到</h1>
          <p className="text-muted-foreground mb-6">请检查组件ID是否正确</p>
          <Button asChild>
            <Link href="/components">返回组件列表</Link>
          </Button>
        </div>
      </div>
    );
  }

  const DemoComponent =
    demoComponents[componentId as keyof typeof demoComponents];
  const componentImportName = String(component.name || "").replace(/\s+/g, "");
  const importStatement = `import { ${componentImportName} } from "@/components/qiuye-ui/${component.cliName}";`;

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-8 lg:mb-10">
        {/* 顶部返回 + 分类 */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <BackButton />
            <Badge variant="outline" className="hidden sm:inline-flex">
              {component.category}
            </Badge>
          </div>
          <Badge variant="outline" className="sm:hidden">
            {component.category}
          </Badge>
        </div>

        {/* 主体布局：12 栅格 */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* 主内容列 */}
          <div className="min-w-0 lg:col-span-8 xl:col-span-9">
            <h1 className="text-3xl lg:text-4xl font-bold mb-3 lg:mb-4">
              {component.name}
            </h1>

            {component.description && (
              <p className="text-base lg:text-lg text-muted-foreground mb-4 lg:mb-6 max-w-[70ch]">
                {component.description}
              </p>
            )}

            {Array.isArray(component.tags) && component.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {component.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="space-y-7">
              <DemoPreview componentId={componentId} component={component} />
              <BasicUsageBlock
                componentName={component.name}
                cliName={component.cliName}
                {...getBasicUsageCodes(component)}
              />
            </div>
          </div>

          {/* 侧栏：sticky，避免出现右侧空白 */}
          <aside className="min-w-0 lg:col-span-4 xl:col-span-3">
            <SmoothCorners
              radius={18}
              smoothing={0.68}
              className="space-y-5 rounded-lg border bg-muted/20 p-4 sm:p-5 lg:sticky lg:top-24"
            >
              {/* 安装命令 */}
              <section className="space-y-3">
                <h2 className="text-sm font-semibold">安装命令</h2>
                <CopyCommandButton cliName={component.cliName} />
              </section>

              <div className="h-px bg-border/70" />

              {/* 导入代码 */}
              <section className="space-y-3">
                <h2 className="text-sm font-semibold">导入代码</h2>
                <SidebarCodeBlock code={importStatement} />
              </section>

              <div className="h-px bg-border/70" />

              {/* 组件信息 */}
              <section className="space-y-3 text-sm">
                <h2 className="text-sm font-semibold">组件信息</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">版本</span>
                    <span className="min-w-0 truncate">
                      {component.version}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">作者</span>
                    <span className="min-w-0 truncate">{component.author}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">分类</span>
                    <span className="min-w-0 truncate">
                      {component.category}
                    </span>
                  </div>
                </div>
              </section>
            </SmoothCorners>
          </aside>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="mt-8 lg:mt-10">
        <ComponentDetailTabs
          items={[
            { value: "demo", label: "演示" },
            { value: "api", label: "API" },
            { value: "dependencies", label: "依赖" },
          ]}
          defaultValue="demo"
          layout="grid"
          gridColsClass="grid-cols-3"
        >
          {/* Demo Tab */}
          <TabsContent value="demo" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">组件演示</h2>
              <p className="text-sm text-muted-foreground">
                查看组件的各种使用方式和效果
              </p>
            </div>
            {DemoComponent ? (
              <DemoComponent />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                演示组件正在开发中...
              </div>
            )}
          </TabsContent>

          {/* API Tab */}
          <TabsContent value="api" className="space-y-8">
            {/* 多组件 Props 展示 */}
            {component.propsInfo && component.propsInfo.length > 0 ? (
              component.propsInfo.map((propsInfo, index) => (
                <section
                  key={propsInfo.componentName}
                  className="space-y-4 border-t pt-6 first:border-t-0 first:pt-0"
                >
                  <div>
                    <h2 className="text-xl font-semibold">
                      {propsInfo.componentName}
                      {index === 0 && (
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          (主组件)
                        </span>
                      )}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {propsInfo.componentName} 组件支持的属性和参数
                    </p>
                  </div>
                  <div className="overflow-x-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>属性名</TableHead>
                          <TableHead>类型</TableHead>
                          <TableHead>描述</TableHead>
                          <TableHead>必需</TableHead>
                          <TableHead>默认值</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {propsInfo.props.map((prop) => (
                          <TableRow key={prop.name}>
                            <TableCell className="font-mono text-sm">
                              {prop.name}
                            </TableCell>
                            <TableCell className="font-mono text-sm text-muted-foreground">
                              {prop.type}
                            </TableCell>
                            <TableCell>{prop.description}</TableCell>
                            <TableCell>
                              {prop.required ? (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  必需
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  可选
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {prop.default || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </section>
              ))
            ) : component.props && component.props.length > 0 ? (
              /* 单组件 Props 展示（兼容旧格式） */
              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Props API</h2>
                  <p className="text-sm text-muted-foreground">
                    组件支持的属性和参数
                  </p>
                </div>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>属性名</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>描述</TableHead>
                        <TableHead>必需</TableHead>
                        <TableHead>默认值</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {component.props.map((prop) => (
                        <TableRow key={prop.name}>
                          <TableCell className="font-mono text-sm">
                            {prop.name}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {prop.type}
                          </TableCell>
                          <TableCell>{prop.description}</TableCell>
                          <TableCell>
                            {prop.required ? (
                              <Badge variant="destructive" className="text-xs">
                                必需
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                可选
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {prop.default || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </section>
            ) : (
              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Props API</h2>
                  <p className="text-sm text-muted-foreground">
                    组件支持的属性和参数
                  </p>
                </div>
                <div className="text-center py-8 text-muted-foreground">
                  该组件暂无API文档
                </div>
              </section>
            )}
          </TabsContent>

          {/* Dependencies Tab */}
          <TabsContent value="dependencies" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">依赖项</h2>
              <p className="text-sm text-muted-foreground">
                使用此组件需要安装的依赖包
              </p>
            </div>
            <DependenciesSection dependencies={component.dependencies} />
          </TabsContent>
        </ComponentDetailTabs>
      </div>
    </div>
  );
}
