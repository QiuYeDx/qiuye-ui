import type { TargetAndTransition, Transition } from "motion/react";

export type EntranceVariants = {
  hidden: TargetAndTransition;
  visible: TargetAndTransition;
};

// useReducedMotion() is null on the server, so it may only pick the
// transition; the hidden start state has to render the same on both sides.
const REDUCED_MOTION_TRANSITION = {
  duration: 0.2,
  ease: "easeOut",
  y: { duration: 0 },
  scale: { duration: 0 },
  filter: { duration: 0 },
} satisfies Transition;

export function withReducedMotion(variants: EntranceVariants): EntranceVariants {
  return {
    ...variants,
    visible: { ...variants.visible, transition: REDUCED_MOTION_TRANSITION },
  };
}
