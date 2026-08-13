# QIUYE-UI-PIT-0001: Scope segmented indicator measurement to value changes

## Area

Frontend / Motion layout projection

## Triggers

SegmentedControl,layoutId,layoutDependency,dynamic height,indicator lag,vertical drift

## Symptoms

When surrounding content is inserted or removed, later segmented-control tracks
move immediately while their selected indicators animate from stale positions.
The indicator appears detached even though that control's value did not change.

## Root cause

The indicator uses Motion `layoutId` without a `layoutDependency`. Unrelated
React renders and ancestor reflows can therefore participate in layout
projection as if the selected segment had changed.

## Do

- Set `layoutDependency` to the resolved selected value.
- Preserve horizontal spring animation when the value changes.
- Run the registry generator after changing the component source.
- Verify generated `files[].content` exactly matches the source file.

## Avoid

- Do not fix this in downstream pages with fixed-height placeholders.
- Do not animate every dynamic parent as a workaround.
- Do not disable the indicator transition globally.
- Do not hand-edit generated registry content.

## Validation

```text
node_modules/.bin/tsc --noEmit
node_modules/.bin/eslint components/qiuye-ui/segmented-control.tsx
node scripts/update-registry.mjs --dir public/registry --base .
node scripts/update-registry.mjs --dir public/registry --base . --dry
node_modules/.bin/next build
```

## Related files

- `components/qiuye-ui/segmented-control.tsx`
- `public/registry/segmented-control.json`
- `public/registry/registry.json`
