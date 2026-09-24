# QIUYE-UI-PIT-0004: Give repeated glyph appearances independent lifetimes

## Area

Frontend / Motion / AnimatedNumber

## Triggers

High-frequency updates, digits cycling after 0–9, new glyphs entering from the exit side, invisible exit copies accumulating.

## Symptoms and root cause

At 40ms per update the original character-keyed AnimatePresence retains old exiting glyphs while other exits continue. When a character recurs, its key reuses an exit-position node. The first cycle enters correctly; subsequent cycles appear above the baseline during increasing values.

## Do

- Keep stable place-value keys for slots, but assign a monotonically increasing occurrence ID for each changed glyph.
- Retire each glyph on its own exit completion, without waiting for the entire group to become idle.
- Freeze each outgoing glyph's direction; later updates must not redirect old exits.
- Preserve an independent initial boundary: ancestor initial=false must not disable subsequent glyph entrances. Only the first glyph starts without animation.
- Retain the width/painting separation and optional blur from PIT-0003.

## Avoid

- Do not use character text as the identity of an animation occurrence.
- Do not solve it only with unique keys while leaving unbounded exit retention.
- Do not assume a one-cycle test or a final screenshot covers continuous updating.

## Validation

Run at least 120 changes at 40ms in both directions, blur on/off and 280ms/1000ms durations. Sample the current glyph relative to its baseline: increasing enters below, decreasing above. Verify exits are bounded by active animation time and return to one per slot after stopping. Also test 1000→9→10, width changes and disabled animation.

## Related files

- components/qiuye-ui/animated-number.tsx
- components/qiuye-ui/demos/animated-number-demo.tsx
- docs/设计并开发AnimatedNumber组件/AnimatedNumber组件开发设计文档.md
