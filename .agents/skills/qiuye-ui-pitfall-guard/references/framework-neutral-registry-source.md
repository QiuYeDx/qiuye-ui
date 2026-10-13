# QIUYE-UI-PIT-0007: Registry source must compile outside Next.js

## Area

Build / Consumer compatibility

## Triggers

Vite consumers, `tsc -b`, `noUnusedLocals`, `types: ["vite/client"]`,
styled-jsx `<style jsx global>`, `eslint-disable @next/next/*`,
`process.env.NODE_ENV`, unused `import React`

## Symptoms

Installed components build in this Next.js repo but fail in a
`shadcn init -t vite` project:

- TS6133 `'React' is declared but its value is never read`
- TS2580 `Cannot find name 'process'`. A `typeof process` guard does not help,
  because the identifier itself is still untyped.
- `Definition for rule '@next/next/no-img-element' was not found` from ESLint
- `<style jsx global>` renders a `jsx` attribute and loses deduplication
  without the styled-jsx Babel/SWC transform

## Root cause

Next.js supplies styled-jsx, the `@next/next` ESLint plugin, and `@types/node`.
Its default tsconfig is also less strict. The Vite template provides none of
these.

## Do

- Use `<style href="unique-id" precedence="default">` (React 19) for static
  global CSS. React hoists it into `<head>` and dedupes it by `href`.
- For `process.env.NODE_ENV`, declare it at module scope and read it inside
  `try/catch`. The declaration is type-only, so bundlers still replace the
  literal expression:

  ```ts
  declare const process: { env: { NODE_ENV?: string } };
  function isDevelopment() {
    try {
      return process.env.NODE_ENV === "development";
    } catch {
      return false;
    }
  }
  ```

- Remove unused `React` default imports, and use `import type` for type-only
  imports.
- Turn off Next-only lint rules for `components/qiuye-ui/**` in
  `eslint.config.mjs` instead of using inline disable comments.

## Avoid

- Do not add `/// <reference types="node" />` or ask consumers to install
  `@types/node` just for `NODE_ENV`.
- Do not use `next/*` imports in registry components.

## Validation

Install the item into a fresh Vite project and run `npx tsc -b` (see
QIUYE-UI-PIT-0006 for the setup).

## Related files

- `components/qiuye-ui/code-block/code-block-root.tsx`
- `components/qiuye-ui/matrix-effect/matrix-effect.tsx`
- `components/qiuye-ui/markdown-renderer/widgets/WidgetErrorBoundary.tsx`
- `eslint.config.mjs`
