# QIUYE-UI-PIT-0011: Touch drag ends early because a child's lostpointercapture bubbles up

## Area

Frontend / Pointer events

## Triggers

Custom drag on a container with `setPointerCapture`, React
`onLostPointerCapture` on the container, touch devices (iOS Safari, Android,
Chromium touch emulation), drag starting on a child (button, svg, img)

## Symptoms

On a phone, dragging from empty space works, but dragging that starts on an
item moves one step and then stops as if the finger was lifted. Mouse dragging
on desktop is fine.

## Root cause

For touch, browsers implicitly capture the pointer to the element under the
finger at `pointerdown` (often an inner `svg path`). When the container later
calls `setPointerCapture`, that child fires `lostpointercapture`, which bubbles
to the container. A handler that ends the drag on any `lostpointercapture`
ends it right after it started. Mouse pointers have no implicit capture, so
desktop never shows it.

## Do

- In the container's `lostpointercapture` handler, ignore events whose
  `target !== currentTarget`.
- On iOS also `preventDefault()` a non-passive `touchmove` while a drag is
  active, and set `-webkit-touch-callout: none`.

## Validation

Reproduce with CDP `Input.dispatchTouchEvent` (Playwright `hasTouch` page)
starting on an item: the offset should keep following every move. Log
`gotpointercapture` / `lostpointercapture` targets with a capturing listener.
