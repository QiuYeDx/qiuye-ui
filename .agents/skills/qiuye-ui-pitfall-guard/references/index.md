# QiuYe UI pitfall index

Read this index first, then open only the detail files that match the task.

| ID | Area | Triggers / symptoms | Detail |
| --- | --- | --- | --- |
| QIUYE-UI-PIT-0001 | Frontend / Motion layout projection | SegmentedControl,layoutId,layoutDependency,dynamic height,indicator lag,vertical drift; unchanged indicators animate from stale ancestor positions after surrounding content reflows. | [scope-segmented-indicator-measurement-to-value-changes.md](scope-segmented-indicator-measurement-to-value-changes.md) |
| QIUYE-UI-PIT-0002 | Frontend / Horizontal scrolling | ResponsiveTabs, iOS Safari, scrollTo/scrollBy, overscroll, pagination arrows; activating an item near the end or tapping pagination can overshoot the horizontal scroll boundary. | [clamp-horizontal-scroll-targets-on-touch.md](clamp-horizontal-scroll-targets-on-touch.md) |
| QIUYE-UI-PIT-0003 | Frontend / Glyph painting | AnimatedNumber, digit-count changes, cross-year, blur disabled, tail jitter; stabilize visual layers independently of width allocation. | [stable-number-glyph-painting.md](stable-number-glyph-painting.md) |
| QIUYE-UI-PIT-0004 | Frontend / Glyph lifecycle | AnimatedNumber, high-frequency updates, repeated digits enter from the wrong side; occurrence identity and independent exit cleanup. | [number-glyph-occurrence-lifecycle.md](number-glyph-occurrence-lifecycle.md) |
| QIUYE-UI-PIT-0005 | Build / Registry generation | update-registry,Windows,core.autocrlf,CRLF,registry-wide diff; every item's files[].content changes only by line endings. | [registry-content-line-endings-on-windows.md](registry-content-line-endings-on-windows.md) |
| QIUYE-UI-PIT-0006 | Build / Registry install | shadcn CLI 4,files[].target,multi-file components flattened into components/,index.ts overwritten,same basename import rewritten to a self-import. | [registry-targets-for-shadcn-cli-4.md](registry-targets-for-shadcn-cli-4.md) |
| QIUYE-UI-PIT-0007 | Build / Consumer compatibility | Vite consumer,tsc -b,noUnusedLocals,styled-jsx,@next/next eslint rule not found,process.env without @types/node. | [framework-neutral-registry-source.md](framework-neutral-registry-source.md) |
| QIUYE-UI-PIT-0008 | Frontend / shadcn style compatibility | radix-nova,TabsList h-8,data-active shadow/bg leaking,h-auto ignored; overrides must use the same variant. | [radix-nova-variant-overrides.md](radix-nova-variant-overrides.md) |
| QIUYE-UI-PIT-0009 | Frontend / Motion physics | inertia,animate(value, value.get()),momentum,rubber band,release does nothing; equal keyframes make Motion skip the animation. | [motion-inertia-needs-distinct-target.md](motion-inertia-needs-distinct-target.md) |
| QIUYE-UI-PIT-0010 | Frontend / Rendering performance | per-frame style.transform,UpdateLayoutTree several ms,rounded-[inherit],button restyle,drag gets janky,CPU near 100%; Playwright mouse drag drift is an artifact. | [per-frame-style-writes-restyle-cost.md](per-frame-style-writes-restyle-cost.md) |
| QIUYE-UI-PIT-0011 | Frontend / Pointer events | touch drag stops after one step when started on an item,iOS,setPointerCapture,lostpointercapture bubbling from implicit capture target. | [touch-implicit-capture-lostpointercapture.md](touch-implicit-capture-lostpointercapture.md) |
