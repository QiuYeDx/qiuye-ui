# QIUYE-UI-PIT-0016: Pointer hit testing during a View Transition

## Area

Frontend / Pointer events

## Triggers

A software cursor or hover-driven overlay (AdaptivePointer) on a page that calls
`document.startViewTransition` (ThemeTransitionToggle), moving the mouse while
the transition runs

## Symptoms

- In a local `AdaptivePointerArea`, the overlay disappears for the whole
  transition and the native arrow shows instead.
- After the transition ends with the mouse resting over the scope, there is no
  pointer at all: the element under it computes `cursor: none`, the overlay
  stays hidden until the next move.

## Root cause

- Chromium hit-tests every point to `<html>` while the transition is active:
  `pointermove` targets `<html>` and `elementFromPoint` returns it. At the end it
  sends only boundary events (`pointerout` from `<html>`, `pointerover` on the
  real element), no `pointermove`.
- WebKit sends no pointer events at all during the transition, except one
  `pointerout` with `relatedTarget: null` on the first move, and nothing when it
  ends, so the real position is unknown until the next move.

## Do

- Treat `<html>` hits during `:active-view-transition` as "outside every
  element": with a page-level scope (`<html>` carries the hide rule) the overlay
  stays live in its own `view-transition-name` group; in a local scope the
  native arrow takes over.
- On a `pointerout` whose target is `<html>` and whose `relatedTarget` is an
  element, mark the hit dirty and re-probe with `elementFromPoint`.
- On `pointerout` with `relatedTarget: null` while `:active-view-transition`
  matches, hand back the native pointer (deactivate) and re-activate on the next
  move, instead of a hide that waits for a move.

## Avoid

- Concluding the overlay is live from DOM transforms alone: read the screenshots
  while the transition's animations are paused.
- Expecting `pointermove` after the transition ends in Chromium.

## Validation

Freeze the transition (`document.getAnimations().forEach((a) => a.pause())`
after `ready`), move the mouse, and take two screenshots; resume, wait for
`finished`, and without moving assert that the overlay is shown or the computed
cursor under the pointer is not `none`. Run it in Chromium and WebKit, for page
and local scope.

## Related files

- `components/qiuye-ui/adaptive-pointer.tsx` (`onPointerOut`, `viewTransitionActive`)
- `components/qiuye-ui/theme-transition-toggle.tsx`
