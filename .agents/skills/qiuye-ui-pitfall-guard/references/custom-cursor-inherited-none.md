# QIUYE-UI-PIT-0013: Native zones inherit `cursor: none` from a custom-cursor scope

## Area

Frontend / Custom cursor

## Triggers

AdaptivePointer, any software cursor that hides the native one with
`cursor: none` on a container and "excludes" inputs, iframes or opt-out regions
with `:not(...)`

## Symptoms

Over a contenteditable, a `data-pointer="native"` box, an open `<dialog>`, or a
disabled `<button>` inside the scope there is no pointer at all: the overlay
hides itself there (by design) and the native cursor is gone too.

## Root cause

`cursor` is an inherited property. Excluding an element from the
`cursor: none` rule only removes the declaration; an element without its own
cursor declaration still inherits `none` from its hidden ancestor.

## Do

- Explicitly restore `cursor: auto` on the structural native hosts with a
  zero-specificity rule, skipping hosts that carry an author cursor class or
  inline cursor, so author CSS still wins:
  `:where([data-adaptive-pointer="on"] :is(<native hosts>)):not(:where([class^="cursor-"], [class*=" cursor-"], [style*="cursor"])) { cursor: auto }`.
- Decide overlay visibility from the hit element's computed `cursor`
  (`=== "none"` means the overlay owns the pointer). Then a mismatch between
  the CSS and JS selector lists can only produce "overlay visible" or "native
  visible", never neither.
- Keep author semantic cursors (`cursor-grab`, `cursor-crosshair`, ...) by
  excluding unprefixed Tailwind tokens and inline cursors from the hide rule.

## Avoid

- `revert-layer` / `revert` on the excluded elements: they fall back to
  inheritance and still compute to `none`.
- Injecting `:disabled { pointer-events: none }` to dodge missing events on
  disabled controls; it changes which element receives clicks.

## Validation

With the scope active, assert `getComputedStyle(el).cursor !== "none"` for an
input, a textarea, a contenteditable, a `data-pointer="native"` host without a
cursor class and its child, an iframe, and a `cursor-crosshair` element.

## Related files

- `components/qiuye-ui/adaptive-pointer.tsx` (`ADAPTIVE_POINTER_CSS`, `NATIVE_HOST`)
