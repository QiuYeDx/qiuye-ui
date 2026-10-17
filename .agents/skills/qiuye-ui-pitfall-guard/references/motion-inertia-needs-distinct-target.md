# QIUYE-UI-PIT-0009: Motion inertia silently does nothing when the target equals the current value

## Area

Frontend / Motion physics

## Triggers

`animate(value, value.get(), { type: "inertia", velocity, min, max })`,
custom drag / pan release, momentum scrolling, rubber-band settle

## Symptoms

Dragging works, but after release nothing moves: no momentum glide, and a
value left past `min` / `max` never springs back. No error is thrown.

## Root cause

Motion skips an animation when its start and end keyframes are equal; it only
lets equal keyframes through for `spring` and generator-function types. The
inertia generator ignores the target (it computes the landing point from the
origin and `velocity`), so passing the current value as the target looks
harmless but turns the call into an instant no-op.

## Do

- Pass any target different from the current value, e.g.
  `animate(value, value.get() + 1, { type: "inertia", ... })`, with a comment
  explaining that the target is a placeholder (see `honeycomb-view.tsx`).

## Avoid

- Verifying release physics in a hidden browser pane: `requestAnimationFrame`
  does not run there, so every animation looks frozen. Use headless Playwright
  or a visible window.

## Validation

Sample the animated value for ~1s after a fling: it must keep changing and
settle inside the bounds.
