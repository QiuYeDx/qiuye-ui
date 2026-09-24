# QIUYE-UI-PIT-0003: Keep glyph painting stable during width changes

## Area

Frontend / Motion / AnimatedNumber

## Triggers and symptoms

Digit-count changes, cross-year date transitions, subtle horizontal glyph jitter near the end, including with blur disabled.

## Evidence and limitation

The old implementation had monotonic DOM coordinates, but restored transform:none at rest and retained filter:blur(0px) with blur=false. The width-animated slot also owned its visual effects. These are potential rasterization/compositing changes; coordinate sampling alone does not prove a browser compositor root cause.

## Do

- Separate actual width allocation from intrinsic-width visual layers.
- Keep a consistent transform path for resting and animating glyphs.
- Set filter:none directly when blur is disabled. Animate a blur-strength CSS variable when enabled so Motion does not interpolate none into a neutral blur filter.
- Preserve usePresence cleanup on the actual width animation, including interrupted exits.
- Inspect continuous frames and actual computed styles alongside DOM positions.

## Avoid

- Do not treat blur(0px) as equivalent to removing filter for painting behavior.
- Do not fix visual jitter by rounding all widths or disabling the requested width transition.
- Do not infer perceptual smoothness solely from monotonic coordinates.

## Validation

Use the date presets 2025 December and 2026 January with blur on/off, at default and 1-second duration. Check rapid 1000→9→10 leaves exactly two slots, animation-disabled output is immediate, registry source parity, lint, typecheck and build.

## Related files

- components/qiuye-ui/animated-number.tsx
- components/qiuye-ui/demos/animated-number-demo.tsx
- public/registry/animated-number.json
