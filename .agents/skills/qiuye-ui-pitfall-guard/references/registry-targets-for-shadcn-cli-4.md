# QIUYE-UI-PIT-0006: shadcn CLI 4 flattens registry files without target

## Area

Build / Registry install

## Triggers

`shadcn add @qiuye-ui/<id>`, shadcn CLI 4, multi-file components
(`code-block/`, `markdown-renderer/`, `matrix-effect/`), `files[].target`,
files with the same basename in one item

## Symptoms

In a consumer project, `code-block/index.ts`, `matrix-effect/types.ts`, and
similar files land directly in `src/components/`. Same-named files overwrite
each other, and `@/components/qiuye-ui/...` and relative imports no longer
resolve.

Separately, an import such as `@/lib/animated-number` inside
`components/qiuye-ui/animated-number.tsx` gets rewritten to
`@/components/qiuye-ui/animated-number`, so the component imports itself.

## Root cause

- Without `target`, CLI 4 places each file by its `type` alone and drops the
  subdirectory from `path`.
- The CLI rewrites `@/` imports by matching file basenames inside the item.
  Two files with the same basename (`animated-number.tsx` and
  `animated-number.ts`) are ambiguous, and the import resolves to the wrong one.

## Do

- Let `scripts/update-registry.mjs` write `target` equal to `path` for every
  file. In `src/` projects the CLI adds the `src/` prefix on its own, for
  example `src/components/qiuye-ui/...` and `src/lib/...`.
- Give every file in an item a unique basename, for example
  `lib/animated-number-tokens.ts`.

## Avoid

- Do not hand-write or hand-edit `target`.
- Do not trust a Next.js install of this repo as proof. Verify in a fresh
  `shadcn init -t vite` project.
- Do not verify by installing every item into one project. Items install each
  other's dependencies, which hides undeclared ones. `scrollable-dialog` once
  imported `scroll-area` and `motion` without declaring them, and only a
  single-item install exposed it. Install each item into its own clean copy,
  with `node_modules` pruned back to the base lockfile.

## Validation

```text
pnpm update-registry
python -m http.server 4517 --directory public
# in a fresh `pnpm dlx shadcn@latest init -t vite -b radix -p nova` project,
# set registries["@qiuye-ui"] = "http://127.0.0.1:4517/registry/{name}.json"
pnpm dlx shadcn@latest add @qiuye-ui/<id> -y
git status --porcelain -uall   # nothing directly under src/components/*.ts(x)
npx tsc -b
```

## Related files

- `scripts/update-registry.mjs`
- `public/registry/*.json`
