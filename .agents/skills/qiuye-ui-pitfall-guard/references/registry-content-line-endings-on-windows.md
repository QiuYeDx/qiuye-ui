# QIUYE-UI-PIT-0005: Registry content churns with Windows line endings

## Status

Resolved in the generator. Since 2026-10-13 `scripts/update-registry.mjs`
normalizes source content to LF before embedding it, and every committed
registry item stores LF content. Keep this entry for diagnosing regressions.

## Area

Build / Registry generation

## Triggers

`pnpm update-registry`, Windows, `core.autocrlf=true`, `public/registry/*.json`,
large unrelated registry diffs

## Symptoms

After adding or editing one component, `pnpm update-registry` reports that
almost every registry item was updated. `git status` lists every
`public/registry/<id>.json` as modified, and each diff only replaces `\n` with
`\r\n` inside `files[].content`.

## Root cause

With `core.autocrlf=true`, Windows checkouts store source files with CRLF line
endings. The generator used to read the working-tree file verbatim and embed it
into `files[].content`, so the JSON string gained literal `\r\n` sequences while
items generated on other machines contained `\n`.

## Do

- Keep the `.replace(/\r\n/g, "\n")` normalization in
  `tryReadFileByCandidates()` of `scripts/update-registry.mjs`.
- On Windows, expect `pnpm update-registry` to report updates only for items
  whose source really changed. If unrelated items show up, check that the
  normalization is still in place before committing.
- Compare an item's `content` with its source after normalizing line endings,
  not byte for byte.

## Avoid

- Do not commit a registry-wide diff that only changes line endings; it hides
  the real change and churns every item's install payload.
- Do not remove the normalization or write `content` from a path that bypasses
  it.

## Validation

```text
pnpm update-registry
git status --short public/registry
git diff public/registry/registry.json
```

## Related files

- `scripts/update-registry.mjs`
- `public/registry/*.json`
