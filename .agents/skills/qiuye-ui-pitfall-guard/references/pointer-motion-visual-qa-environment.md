# QIUYE-UI-PIT-0012: Pointer-driven motion looks frozen or wrong in the built-in browser pane

## Area

Visual QA / Environment

## Triggers

Verifying hover / pointer animations (AdaptivePointer, HoneycombView drag,
ExpandableCard) in the Claude desktop browser pane, or driving headless
Chromium over CDP on this Windows machine

## Symptoms

- In the browser pane, values read right after a hover are half-way through an
  animation, and `requestAnimationFrame` runs about 4 times per second.
- Parallax, springs and pop-in never show up in the pane even though the code
  path exists.
- A headless Chromium started with `--remote-debugging-port=9333` (or any
  fixed 9xxx port) never accepts connections; started from the Bash tool its log
  shows `Network service crashed`.
- `Page.captureScreenshot` with a `clip` returns a blank image after scrolling.

## Root cause

- The pane runs its page as a background page while it is hidden, so rAF is
  throttled. The pane also reports `prefers-reduced-motion: reduce`, so
  components correctly switch to their reduced-motion path.
- Windows (Hyper-V / WinNAT) reserves port ranges; fixed debug ports inside
  them are refused. The Bash tool's sandbox kills Chromium's network service.
- The CDP screenshot `clip` is in document coordinates, not viewport
  coordinates.

## Do

- Treat the pane as a smoke test only. For timing, geometry and frame-by-frame
  checks drive Playwright's cached Chromium
  (`%LOCALAPPDATA%/ms-playwright/chromium-*/chrome-win64/chrome.exe`) over CDP:
  start it with `--remote-debugging-port=0`, read the port from
  `<user-data-dir>/DevToolsActivePort`, and run the script outside the Bash
  sandbox.
- Emulate `prefers-reduced-motion: no-preference` with
  `Emulation.setEmulatedMedia` to test the full-motion path, and `reduce` to
  test the fallback.
- Use `Input.dispatchMouseEvent`: it produces trusted `pointerType: "mouse"`
  events, which components that gate on `isTrusted` require.
- Add `scrollX` / `scrollY` to a viewport rect before passing it as a
  screenshot `clip`.
- Record per-frame style values with an injected rAF logger and check
  continuity numerically instead of judging motion from a few screenshots.

## Avoid

- Do not conclude "the animation is broken" from pane screenshots or from reads
  taken right after a pane hover.
- Do not use Playwright `page.mouse` for long drags (see PIT-0010).

## Validation

Count rAF ticks in 500ms (`~30` in headless Chromium, `~2` in a hidden pane)
before trusting any timing measurement.
