"use client";

import Link from "next/link";
import { motion, type HTMLMotionProps } from "motion/react";
import * as React from "react";

import { SmoothCorners } from "@/components/qiuye-ui/smooth-corners";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ComponentInfo } from "@/lib/registry";
import type { HomePreviewSize } from "@/lib/home-component-preview-config";
import { cn } from "@/lib/utils";

const sizeClassName: Record<HomePreviewSize, string> = {
  feature: "sm:col-span-2 lg:row-span-2 min-h-[500px]",
  wide: "sm:col-span-2 min-h-[320px]",
  tall: "lg:row-span-2 min-h-[420px]",
  square: "min-h-[320px]",
  compact: "min-h-[250px]",
};

interface HomePreviewCardProps {
  component: ComponentInfo;
  size: HomePreviewSize;
  featured?: boolean;
  children: React.ReactNode;
}

type MotionHomePreviewCardProps = HomePreviewCardProps &
  Omit<HTMLMotionProps<"article">, keyof HomePreviewCardProps>;

export function HomePreviewCard({
  component,
  size,
  featured,
  children,
  className,
  ...motionProps
}: MotionHomePreviewCardProps) {
  return (
    <SmoothCorners asChild radius={20} smoothing={0.72}>
      <motion.article
        {...motionProps}
        className={cn(
          "group flex h-full flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-colors hover:border-foreground/20",
          sizeClassName[size],
          featured && "border-foreground/15",
          className
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b p-4">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">{component.name}</h2>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
              {component.description}
            </p>
          </div>
          <Badge variant={featured ? "default" : "secondary"}>
            {component.category}
          </Badge>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center p-4">
          {children}
        </div>

        <div className="flex items-center justify-between gap-3 border-t p-4">
          <div className="flex min-w-0 flex-wrap gap-1">
            {component.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="max-w-[120px] truncate text-[10px]"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <Button asChild variant="ghost" size="sm" className="shrink-0">
            <Link href={`/components/${component.cliName}`}>详情</Link>
          </Button>
        </div>
      </motion.article>
    </SmoothCorners>
  );
}
