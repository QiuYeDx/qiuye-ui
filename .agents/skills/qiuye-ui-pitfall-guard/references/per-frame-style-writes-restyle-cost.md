# QIUYE-UI-PIT-0010: Per-frame inline transform writes are expensive on buttons and inherit-dependent children

## Area

Frontend / Rendering performance

## Triggers

Writing `element.style.transform` for dozens of elements every frame (custom
drag, fisheye, parallax), HoneycombView, `rounded-[inherit]`, `<button>` as the
moving element

## Symptoms

Dragging feels fine at first, then frames drop; DevTools Performance monitor
shows renderer CPU near 100%. A trace shows `UpdateLayoutTree` taking several
ms per frame for only ~100 elements (~30µs each).

## Root cause

An inline style change misses Chrome's matched-properties cache, so each
touched element is re-cascaded against the whole site stylesheet. Two things
multiply that cost:

- A child whose style depends on the parent (`inherit`, e.g. Tailwind
  `rounded-[inherit]`) is re-cascaded too every time the parent's transform
  changes.
- `<button>` (form-control UA styles) costs ~4× a plain `div` per restyle.

## Do

- Move a classless positioning `div` every frame; put the focusable `button`
  and content inside it, with no `inherit` dependency on the moving element.
- Cache the last written strings per element (WeakMap) and skip unchanged
  writes; hide fully faded elements (`visibility: hidden`) and stop updating
  them.
- Keep `will-change: transform` on the moving elements; without it the content
  repaints every frame.

## Avoid

- Measuring long-drag drift with Playwright `page.mouse` while the button is
  held: its drag-and-drop interception (`crDragDrop`) adds and removes
  listeners on every move and grows over time. Use CDP
  `Input.dispatchMouseEvent` instead.

## Validation

Trace a 3s drag in headed Chromium: `UpdateLayoutTree` should be well under
1ms per frame and its `elementCount` should match the number of moving
elements, not twice that. Layerize cost scales with the whole page and is not
the component's.
