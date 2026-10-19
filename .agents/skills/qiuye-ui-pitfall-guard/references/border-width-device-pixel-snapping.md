# QIUYE-UI-PIT-0015: Fractional-DPR border widths lose a device pixel, and emulated DPR lies about it

## Area

Frontend / Rendering, Visual QA / Environment

## Triggers

Writing `border-width` as `deviceWidth / devicePixelRatio` from JS
(AdaptivePointer ring, any hairline drawn to whole device pixels), DPR 1.25 /
1.5 screenshots, Playwright `deviceScaleFactor`, DevTools device mode

## Symptoms

- At DPR 1.5 a ring meant to be 2 device px draws 1 device px; WebKit also
  loses a pixel at DPR 1.25. `getComputedStyle(el).borderTopWidth` reads
  `0.666667px` (or `0.8px`) instead of `1.33333px` (`1.6px`).
- In Playwright's emulated `deviceScaleFactor` (Chromium and Firefox) every
  border between 1 and 2 CSS px computes to `1px`, so DPR 2 shows 2 device px
  instead of 3. A real HiDPI display does not do this.
- A box narrower than its two borders (`box-sizing: border-box`, a 2px I-beam
  with 2px borders) renders at the border sum, wider than written and shifted
  right of the position computed from the written width.

## Root cause

- Browsers floor border widths of 1 device px or more to whole device pixels
  after storing them at their own precision: `1.333px` (from `toFixed(3)`) ×
  1.5 = 1.9995 floors to 1; WebKit first truncates to 1/64 px, so `1.6px` × 1.25
  falls just under 2. Firefox rounds to app units first and is unaffected.
- Emulated DPR in Chromium (CDP `setDeviceMetricsOverride`) and Firefox
  (Juggler) does not go through zoom-for-DSF, so the floor happens in CSS px.
- Content width cannot go negative, so the border box grows to fit the borders.

## Do

- Write the border as `(deviceWidth + 0.25) / dpr`; flooring still lands on
  `deviceWidth` with any engine's precision loss.
- When a shape becomes too narrow for its border, switch to `border-width: 0`
  plus a solid background instead of keeping the border.
- Take DPR screenshots on a real device scale: Chromium
  `--force-device-scale-factor=<dpr>` with `viewport: null`; Firefox
  `firefoxUserPrefs: { "layout.css.devPixelsPerPx": "<dpr>" }` with
  `viewport: null`; WebKit's `deviceScaleFactor` is already real.

## Avoid

- Judging hairline widths from Playwright `deviceScaleFactor` or DevTools
  device mode in Chromium / Firefox.
- Expecting WinCairo WebKit at DPR 1.5 to draw a rounded 2-device-px border
  symmetrically: a plain CSS circle draws 2 px on the left and 1 px on the right
  there too. Safari on macOS only uses integer DPRs.

## Validation

Scan the luminance row through the hotspot of a device-scale screenshot: border
runs should be 2 / 2 / 2 / 3 device px at DPR 1 / 1.25 / 1.5 / 2 with no
partially covered pixels, and an I-beam's border box should equal its written
width.

## Related files

- `components/qiuye-ui/adaptive-pointer.tsx` (`bwPaint`, `writeLayers`)
