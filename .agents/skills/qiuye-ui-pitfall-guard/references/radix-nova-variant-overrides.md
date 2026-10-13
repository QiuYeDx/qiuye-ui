# QIUYE-UI-PIT-0008: radix-nova styles need same-variant overrides

## Area

Frontend / shadcn style compatibility

## Triggers

`style: "radix-nova"`, `TabsList`, `TabsTrigger`, `h-auto` ignored,
active tab shadow or background leaking through, ResponsiveTabs,
ClipPathTabs

## Symptoms

In a radix-nova project the tab list renders at 32px while its content is
38-46px tall. Animated-highlight triggers also show nova's own active
background and shadow under the motion highlight.

## Root cause

new-york sets plain utilities such as `h-9` and `data-[state=active]:shadow-sm`,
so a plain `h-auto` or `data-[state=active]:shadow-none` from the component
wins through tailwind-merge. radix-nova sets the same properties under other
variants: `group-data-horizontal/tabs:h-8`,
`group-data-[variant=default]/tabs-list:data-active:shadow-sm`, and
`data-active:bg-background`. tailwind-merge only dedupes classes with the same
variant, so nova's classes survive and take effect.

## Do

- Add the override under the exact variant the style uses, next to the
  existing one:
  `group-data-horizontal/tabs:h-auto`,
  `group-data-[variant=default]/tabs-list:data-active:shadow-none`,
  `data-active:bg-transparent dark:data-active:bg-transparent dark:data-active:border-transparent`.
- Keep the `data-[state=active]:*` overrides for new-york. The extra nova
  classes match nothing there.
- Check the installed `components/ui/*.tsx` of each style you support before
  overriding a base component's classes.

## Avoid

- Do not use `!important` utilities to win over nova. They also break
  consumer `className` overrides.

## Validation

Render the component in both a new-york project (this repo) and a radix-nova
project. Compare the list height with its content height, and check that an
active trigger has no box-shadow or background when the animated highlight
is on.

## Related files

- `components/qiuye-ui/responsive-tabs.tsx`
- `components/qiuye-ui/clip-path-tabs.tsx`
