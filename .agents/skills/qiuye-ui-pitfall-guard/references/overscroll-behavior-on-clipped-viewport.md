# QIUYE-UI-PIT-0020: overscroll-behavior on an overflow-hidden viewport traps vertical wheel scrolling

## Area

Frontend / Scrolling

## Triggers

Carousel or slider viewport with `overflow: hidden` plus
`overscroll-behavior-x: contain` (or `overscroll-behavior: contain`), Chrome,
trackpad scrolling, custom horizontal wheel handling

## Symptoms

With the pointer over the carousel, a mostly vertical two-finger scroll on a
trackpad stops scrolling the page. A pure mouse wheel (deltaX 0) may still
work, so the bug looks intermittent.

## Root cause

An `overflow: hidden` element is still a scroll container. When a wheel event
has a non-zero `deltaX`, Chrome starts the scroll chain at that container, and
`overscroll-behavior` set to `contain` stops it from propagating to the page,
so the vertical part is swallowed too.

## Do

- Leave `overscroll-behavior` unset on clipped viewports that are moved with
  transforms. Handle horizontal wheel in a non-passive listener and
  `preventDefault()` only when the gesture is horizontal-dominant; that also
  prevents the browser's back / forward swipe.

## Avoid

- Adding `overscroll-behavior: contain` "to stop history swipes" on a
  container that is not itself scrolled natively.

## Validation

In Chrome, dispatch wheel events with `deltaY: 100, deltaX: 4` over the
viewport and check that `scrollY` increases.
