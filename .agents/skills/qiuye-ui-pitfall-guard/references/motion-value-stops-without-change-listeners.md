# QIUYE-UI-PIT-0018: A MotionValue animation stops when its last change listener goes away

## Area

Frontend / Motion physics

## Triggers

`animate(motionValue, ...)` used as a timer or as shared state (autoplay
progress, carousel offset), UI bound through `useTransform` / `motion.*` style
that mounts and unmounts conditionally, Carousel indicators

## Symptoms

Autoplay freezes forever after the indicators are hidden (for example
`indicators="none"` or a breakpoint that unmounts them), or a settle animation
stops half-way when the only element reading the value unmounts. Nothing
throws; `value.isAnimating()` simply turns false.

## Root cause

In `motion-dom` (`value/index.mjs`, `on("change")`), the unsubscribe function
schedules a `frame.read` check: if the value has no `change` listeners left by
the next frame, it calls `this.stop()`. A value whose animation drives logic
(not just pixels) therefore depends on some UI happening to subscribe.

## Do

- Keep one permanent no-op subscription on values whose animation carries
  logic, owned by the component that starts the animation:
  `React.useEffect(() => value.on("change", () => {}), [value])`
  (see `components/qiuye-ui/carousel.tsx`).
- Drive completion from the animation's own `onComplete` / promise, not from a
  listener in optional UI.

## Avoid

- Assuming an `animate()` started on a MotionValue runs to completion
  independently of who renders it.

## Validation

Start autoplay, unmount every element bound to the progress value, wait longer
than `delay`, and check that the slide still advances.
