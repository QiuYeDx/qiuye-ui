"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import * as React from "react";

import { withReducedMotion } from "@/components/home/home-entrance-motion";
import { HomePreviewCard } from "@/components/home/home-preview-card";
import { homePreviewComponents } from "@/components/home/home-component-previews";
import {
  homePreviewConfigs,
  type HomePreviewConfig,
} from "@/lib/home-component-preview-config";
import {
  getAllComponents,
  getComponent,
  type ComponentInfo,
} from "@/lib/registry";
import { ComponentId } from "@/lib/component-constants";

type PreviewItem = {
  component: ComponentInfo;
  config: HomePreviewConfig;
  Preview: React.ComponentType;
};

const WALL_EASE = [0.22, 1, 0.36, 1] as const;

const wallSectionVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: WALL_EASE,
    },
  },
} satisfies Variants;

const wallHeaderVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.38,
      ease: WALL_EASE,
    },
  },
} satisfies Variants;

const wallGridVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.045,
    },
  },
} satisfies Variants;

const wallCardVariants = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.985,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      duration: 0.5,
      bounce: 0.12,
    },
  },
} satisfies Variants;

const wallVariants = {
  section: wallSectionVariants,
  header: wallHeaderVariants,
  grid: wallGridVariants,
  card: wallCardVariants,
};

const reducedWallVariants = {
  section: withReducedMotion(wallSectionVariants),
  header: withReducedMotion(wallHeaderVariants),
  grid: withReducedMotion(wallGridVariants),
  card: withReducedMotion(wallCardVariants),
};

function createPreviewItems(): PreviewItem[] {
  const configuredIds = new Set(homePreviewConfigs.map((config) => config.id));

  const configuredItems = homePreviewConfigs.flatMap((config) => {
    const component = getComponent(config.id);
    const Preview = homePreviewComponents[config.id];

    if (!component || !Preview) {
      return [];
    }

    return [{ component, config, Preview }];
  });

  const fallbackItems = getAllComponents()
    .filter((component) => !configuredIds.has(component.cliName as ComponentId))
    .flatMap((component) => {
      const id = component.cliName as ComponentId;
      const Preview = homePreviewComponents[id];

      if (!Preview) {
        return [];
      }

      return [
        {
          component,
          config: {
            id,
            size: "compact" as const,
          },
          Preview,
        },
      ];
    });

  return [...configuredItems, ...fallbackItems];
}

export function HomeComponentWall() {
  const items = React.useMemo(() => createPreviewItems(), []);
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? reducedWallVariants : wallVariants;

  return (
    <motion.section
      className="border-y bg-muted/30 px-4 py-6 sm:px-6 lg:px-8"
      variants={variants.section}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.01, margin: "0px 0px 18% 0px" }}
    >
      <div className="mx-auto max-w-screen-2xl">
        <motion.div className="mb-5" variants={variants.header}>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Component previews
            </p>
            <h2 className="mt-1 text-2xl font-semibold">真实组件，轻量展示</h2>
          </div>
        </motion.div>

        <motion.div
          className="grid auto-rows-[minmax(240px,auto)] grid-flow-dense grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          variants={variants.grid}
        >
          {items.map(({ component, config, Preview }) => (
            <HomePreviewCard
              key={component.cliName}
              component={component}
              size={config.size}
              featured={config.featured}
              variants={variants.card}
              className="will-change-transform"
            >
              <Preview />
            </HomePreviewCard>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
