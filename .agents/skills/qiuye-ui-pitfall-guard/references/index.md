# QiuYe UI pitfall index

Read this index first, then open only the detail files that match the task.

| ID | Area | Triggers / symptoms | Detail |
| --- | --- | --- | --- |
| QIUYE-UI-PIT-0001 | Frontend / Motion layout projection | SegmentedControl,layoutId,layoutDependency,dynamic height,indicator lag,vertical drift; unchanged indicators animate from stale ancestor positions after surrounding content reflows. | [scope-segmented-indicator-measurement-to-value-changes.md](scope-segmented-indicator-measurement-to-value-changes.md) |
| QIUYE-UI-PIT-0002 | Frontend / Horizontal scrolling | ResponsiveTabs, iOS Safari, scrollTo/scrollBy, overscroll, pagination arrows; activating an item near the end or tapping pagination can overshoot the horizontal scroll boundary. | [clamp-horizontal-scroll-targets-on-touch.md](clamp-horizontal-scroll-targets-on-touch.md) |
