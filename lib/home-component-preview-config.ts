import { ComponentId } from "@/lib/component-constants";

export type HomePreviewSize = "wide" | "tall" | "square" | "compact";

export interface HomePreviewConfig {
  id: ComponentId;
  size: HomePreviewSize;
  featured?: boolean;
}

export const homePreviewConfigs: HomePreviewConfig[] = [
  { id: ComponentId.ANIMATED_NUMBER, size: "compact", featured: true },
  {
    id: ComponentId.MATRIX_EFFECT,
    size: "wide",
    featured: true,
  },
  {
    id: ComponentId.DOT_GLASS,
    size: "wide",
    featured: true,
  },
  {
    id: ComponentId.CODE_BLOCK,
    size: "wide",
    featured: true,
  },
  {
    id: ComponentId.IMAGE_VIEWER,
    size: "tall",
  },
  {
    id: ComponentId.TOUR,
    size: "wide",
    featured: true,
  },
  {
    id: ComponentId.CLIP_PATH_TABS,
    size: "compact",
  },
  {
    id: ComponentId.SEGMENTED_CONTROL,
    size: "compact",
  },
  {
    id: ComponentId.COLOR_PICKER,
    size: "compact",
  },
  {
    id: ComponentId.SMOOTH_CORNERS,
    size: "compact",
  },
  {
    id: ComponentId.DUAL_STATE_TOGGLE,
    size: "compact",
  },
  {
    id: ComponentId.THEME_TRANSITION_TOGGLE,
    size: "compact",
  },
  {
    id: ComponentId.TYPEWRITER,
    size: "compact",
  },
  {
    id: ComponentId.RESPONSIVE_TABS,
    size: "square",
  },
  {
    id: ComponentId.SCROLLABLE_DIALOG,
    size: "square",
  },
  {
    id: ComponentId.MARKDOWN_RENDERER,
    size: "square",
    featured: true,
  },
];
