# QIUYE-UI-PIT-0017: Gating Motion `initial` on useReducedMotion leaves elements invisible

## Area

Frontend / Motion entrance animation

## Triggers

`initial={reduceMotion ? false : { opacity: 0, y: 14 }}`, `useReducedMotion()`,
`whileInView` / `animate` entrance, SpotlightTile, staggered rise-in,
static export / SSR

## Symptoms

With `prefers-reduced-motion: reduce`, cards that should simply appear stay at
`opacity: 0` with an inline `transform: translateY(14px)`. Full motion works.

## Root cause

`useReducedMotion()` returns `null` on the server and during the first client
render, so the first render picks the animated `initial`. Motion reads
`initial` only on mount; when the hook resolves to `true` after hydration, the
code also drops `whileInView` / `animate`, so nothing ever moves the element
out of its hidden starting state.

## Do

- Keep `initial` and the target (`whileInView` / `animate`) independent of the
  reduced-motion flag; switch only the `transition`, e.g.
  `{ duration: 0.2, y: { duration: 0 } }` for a fade without movement.

## Avoid

- Removing the animation target based on a value that can change after mount.

## Validation

Emulate `prefers-reduced-motion: reduce` over CDP, load the page, scroll the
element into view, and read `getComputedStyle(el).opacity` (expect `1`) and
its inline style (expect `transform: none`).
