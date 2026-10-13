"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, Package, Copy, Check } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "motion/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SmoothCorners } from "@/components/qiuye-ui/smooth-corners";
import { DualStateToggle } from "@/components/qiuye-ui/dual-state-toggle";
import { SegmentedControl } from "@/components/qiuye-ui/segmented-control";
import {
  ResponsiveTabs,
  type TabItem,
} from "@/components/qiuye-ui/responsive-tabs";
import {
  getAllComponents,
  getCategories,
  getComponentsByCategory,
  searchComponents,
  type ComponentInfo,
} from "@/lib/registry";
import { useClipboard } from "use-clipboard-copy";
import { toast } from "sonner";

const ENTRANCE_EASE = [0.22, 1, 0.36, 1] as const;

const pageVariants = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.04,
      staggerChildren: 0.07,
    },
  },
} satisfies Variants;

const sectionVariants = {
  hidden: {
    opacity: 0,
    transform: "translate3d(0, 10px, 0)",
  },
  show: {
    opacity: 1,
    transform: "translate3d(0, 0, 0)",
    transition: {
      duration: 0.38,
      ease: ENTRANCE_EASE,
    },
  },
} satisfies Variants;

const gridVariants = {
  exit: {
    opacity: 0,
    transition: {
      duration: 0.14,
      ease: ENTRANCE_EASE,
    },
  },
} satisfies Variants;

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.992,
  },
  show: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.14 + index * 0.04,
      duration: 0.36,
      ease: ENTRANCE_EASE,
    },
  }),
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.995,
    transition: {
      duration: 0.16,
      ease: ENTRANCE_EASE,
    },
  },
} satisfies Variants;

const emptyStateVariants = {
  hidden: {
    opacity: 0,
    transform: "translate3d(0, 8px, 0)",
  },
  show: {
    opacity: 1,
    transform: "translate3d(0, 0, 0)",
    transition: {
      duration: 0.24,
      ease: ENTRANCE_EASE,
    },
  },
  exit: {
    opacity: 0,
    transform: "translate3d(0, 4px, 0)",
    transition: {
      duration: 0.14,
      ease: ENTRANCE_EASE,
    },
  },
} satisfies Variants;

export default function ComponentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [packageManager, setPackageManager] = useState<"npm" | "pnpm">("pnpm");
  const prefersReducedMotion = useReducedMotion();
  const clipboard = useClipboard();
  const initialState = prefersReducedMotion ? "show" : "hidden";

  const allComponents = getAllComponents();
  const categories = getCategories();

  // 将分类数据转换为 ResponsiveTabs 需要的格式
  const categoryItems: TabItem[] = [
    { value: "all", label: "全部" },
    ...categories.map((category) => ({
      value: category,
      label: category,
    })),
  ];

  // 根据搜索和分类过滤组件
  const filteredComponents = searchQuery
    ? searchComponents(searchQuery)
    : selectedCategory === "all"
      ? allComponents
      : getComponentsByCategory(selectedCategory);

  const getCommandPrefix = () => {
    return packageManager === "npm" ? "npx" : "pnpm dlx";
  };

  const generateCommand = (componentId: string) => {
    return `${getCommandPrefix()} shadcn@latest add @qiuye-ui/${componentId}`;
  };

  const handleCopyCommand = (componentId: string) => {
    const command = generateCommand(componentId);
    clipboard.copy(command);
    toast.success("复制成功！", {
      id: `copy-command-${componentId}`,
      description: `已复制命令: ${command}`,
    });
  };

  return (
    <motion.div
      className="@container container mx-auto px-6 py-8"
      variants={pageVariants}
      initial={initialState}
      animate="show"
    >
      {/* Header */}
      <div className="mb-8">
        <motion.div variants={sectionVariants}>
          <h1 className="text-4xl font-bold tracking-tight mb-4">QiuYe UI</h1>
          <p className="text-xl text-muted-foreground mb-6">
            精心设计的自定义UI组件，让您的应用更加出色
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>{allComponents.length} 个组件</span>
            </div>
            <div className="flex items-center gap-2">
              <span>•</span>
              <span>{categories.length} 个分类</span>
            </div>
            <div className="flex items-center gap-2">
              <span>•</span>
              <span>一键复制CLI命令</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <motion.div className="mb-8" variants={sectionVariants}>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索组件..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground shrink-0">
              包管理器:
            </span>
            <SegmentedControl
              aria-label="包管理器"
              value={packageManager}
              onValueChange={(value) =>
                setPackageManager(value as "npm" | "pnpm")
              }
              items={[
                { value: "npm", label: "npm" },
                { value: "pnpm", label: "pnpm" },
              ]}
              size="sm"
              className="w-[140px]"
            />
          </div>
        </div>

        <div className="-mx-6 px-6">
          <ResponsiveTabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            items={categoryItems}
            triggerClassName="text-xs"
          />
        </div>
      </motion.div>

      {/* Components Grid / Empty State */}
      <AnimatePresence mode="wait">
        {filteredComponents.length === 0 ? (
          <motion.div
            key="empty"
            className="text-center py-12"
            variants={emptyStateVariants}
            initial={initialState}
            animate="show"
            exit={prefersReducedMotion ? undefined : "exit"}
          >
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">没有找到匹配的组件</h3>
            <p className="text-muted-foreground">
              尝试修改搜索关键词或选择其他分类
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            className="grid grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3 gap-6"
            variants={gridVariants}
            exit={prefersReducedMotion ? undefined : "exit"}
          >
            <AnimatePresence mode="popLayout">
              {filteredComponents.map((component, index) => (
                <motion.div
                  key={component.cliName}
                  custom={index}
                  variants={cardVariants}
                  initial={prefersReducedMotion ? false : "hidden"}
                  animate="show"
                  exit={prefersReducedMotion ? undefined : "exit"}
                  layout={!prefersReducedMotion}
                  transition={{
                    layout: {
                      type: "spring",
                      duration: 0.3,
                      bounce: 0.08,
                    },
                  }}
                >
                  <motion.div
                    className="h-full"
                    whileHover={prefersReducedMotion ? undefined : { y: -3 }}
                    transition={{ duration: 0.16, ease: ENTRANCE_EASE }}
                  >
                    <ComponentCard
                      component={component}
                      onCopyCommand={handleCopyCommand}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface ComponentCardProps {
  component: ComponentInfo;
  onCopyCommand: (componentId: string) => void;
}

function ComponentCard({ component, onCopyCommand }: ComponentCardProps) {
  const [copied, setCopied] = useState(false);
  const resetCopiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    return () => {
      if (resetCopiedTimerRef.current) {
        clearTimeout(resetCopiedTimerRef.current);
      }
    };
  }, []);

  const handleCopy = () => {
    onCopyCommand(component.cliName);
    setCopied(true);

    if (resetCopiedTimerRef.current) {
      clearTimeout(resetCopiedTimerRef.current);
    }

    resetCopiedTimerRef.current = setTimeout(() => {
      setCopied(false);
      resetCopiedTimerRef.current = null;
    }, 2000);
  };

  return (
    <SmoothCorners
      radius={18}
      smoothing={0.68}
      // 没有使用 <Card>，需要自行提供 radix-nova Card 子组件依赖的 --card-spacing
      className="flex h-full flex-col gap-(--card-spacing) rounded-lg border bg-card py-(--card-spacing) text-sm text-card-foreground shadow-sm transition-shadow duration-200 [--card-spacing:--spacing(4)] hover:shadow-lg"
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{component.name}</CardTitle>
            <CardDescription className="text-sm line-clamp-2 h-[40px]">
              {component.description}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2">
            {component.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {component.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {component.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{component.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* CLI Command */}
        <div className="bg-muted/50 rounded-md p-3">
          <div className="flex items-center justify-between gap-2">
            <code className="min-w-0 truncate text-sm font-mono">
              @qiuye-ui/{component.cliName}
            </code>
            <DualStateToggle
              active={copied}
              onToggle={handleCopy}
              activeIcon={
                <Check className="text-emerald-500" strokeWidth={2} />
              }
              inactiveIcon={<Copy />}
              activeLabel={`已复制 ${component.name} 安装命令`}
              inactiveLabel={`复制 ${component.name} 安装命令`}
              variant="ghost"
              effect="scale"
              transitionDuration={0.18}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/components/${component.cliName}`}>查看详情</Link>
          </Button>
          <Button
            onClick={handleCopy}
            size="sm"
            className="flex-1 cursor-pointer active:scale-[0.97]"
          >
            <span className="relative inline-flex h-5 min-w-[4em] items-center justify-center">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={copied ? "copied" : "copy"}
                  initial={{ opacity: 0, filter: "blur(2px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(2px)" }}
                  transition={{ duration: 0.18 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {copied ? "已复制" : "复制命令"}
                </motion.span>
              </AnimatePresence>
            </span>
          </Button>
        </div>

        {/* Metadata */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>v{component.version}</span>
          <span>by {component.author}</span>
        </div>
      </CardContent>
    </SmoothCorners>
  );
}
