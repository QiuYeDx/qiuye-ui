# QIUYE-UI-PIT-0005: Registry content churns with Windows line endings

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
endings. `scripts/update-registry.mjs` reads the working-tree file verbatim and
embeds it into `files[].content`, so the JSON string gains literal `\r\n`
sequences. Items generated on other machines contain `\n`, and the committed
registry already mixes both styles.

## Do

- Run `pnpm update-registry` as usual, then keep only the registry files that
  belong to the change: the edited component's `public/registry/<id>.json` and
  `public/registry/registry.json` when the index changed.
- Restore every other registry item whose diff is line endings only:
  `git checkout -- public/registry/<other-id>.json`.
- Before restoring, confirm the diff really is line endings only, for example by
  comparing `content.replace(/\r\n/g, "\n")` with the committed version.
- Check the edited item's `content` against its source with line endings
  normalized, not byte for byte.

## Avoid

- Do not commit a registry-wide diff that only changes line endings; it hides
  the real change and churns every item's install payload.
- Do not normalize line endings inside the script or rewrite the whole registry
  as part of an unrelated component change.

## Validation

```text
pnpm update-registry
git status --short public/registry
git diff public/registry/registry.json
```

## Related files

- `scripts/update-registry.mjs`
- `public/registry/*.json`
