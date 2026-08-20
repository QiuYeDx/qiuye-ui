# QIUYE-UI-PIT-0002: Clamp horizontal scroll targets on touch

## Area

Frontend / Horizontal scrolling

## Triggers

ResponsiveTabs, iOS Safari, `scrollTo`, `scrollBy`, overscroll, pagination arrows

## Symptoms

Selecting or paging toward the last tab can leave a horizontal scroller visibly
beyond its end on iOS Safari. Repeated smooth-scroll calls make the overshoot
more noticeable.

## Root cause

The target derived from an item's offset can be larger than
`scrollWidth - clientWidth`. Safari may expose that out-of-range smooth-scroll
target as momentum overscroll instead of immediately clamping it.

## Do

- Clamp every programmatic target to `[0, Math.max(0, scrollWidth - clientWidth)]`.
- Use instant scrolling for touch devices; reserve smooth scrolling for devices
  that advertise fine hover input.
- Keep horizontal scrollers explicitly `overflow-y-hidden` and contain their
  horizontal overscroll.
- Keep pagination controls available only on hover-capable devices; touch users
  can scroll the tab row directly with a gesture.

## Avoid

- Do not rely on browser clamping for out-of-range smooth-scroll targets.
- Do not call smooth scrolling repeatedly from resize observers.
- Do not add pagination controls to touch devices where direct gesture scrolling
  is available.

## Validation

```text
node_modules/.bin/eslint components/qiuye-ui/responsive-tabs.tsx
node_modules/.bin/next build
node scripts/update-registry.mjs --dir public/registry --base .
```

## Related files

- `components/qiuye-ui/responsive-tabs.tsx`
- `public/registry/responsive-tabs.json`
