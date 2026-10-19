# QIUYE-UI-PIT-0014: An arbitrary class written in a comment or doc breaks the CSS build

## Area

Build / Tailwind CSS

## Triggers

Tailwind v4 automatic source detection, JSDoc or comments that quote Tailwind
classes, Markdown under `docs/` or `.agents/`, arbitrary-value classes with a
placeholder value (an ellipsis, `…`, `xxx`)

## Symptoms

Every page returns 500 in `pnpm dev` (and `pnpm build` fails) with
`./app/globals.css: Module not found: Can't resolve '…'`. The failing rule in
the generated CSS is an arbitrary-value utility nobody uses in markup, for
example a cursor utility whose value is `url(…)`.

## Root cause

`@import "tailwindcss"` in `app/globals.css` scans every file that is not
gitignored, including comments, string literals and Markdown, and emits CSS for
anything that parses as a class candidate. A placeholder such as `url(…)`
becomes a real `url()` that the bundler tries to resolve as a module. Turbopack
keeps serving the broken result after the text is removed, until the dev server
restarts.

## Do

- In comments and docs, describe arbitrary-value classes in words, or use a
  value that is valid CSS (for example a real keyword such as `help`).
- After fixing the text, restart the dev server before concluding the fix did
  not work.

## Avoid

- Placeholder values inside square brackets anywhere in tracked files,
  including design docs and pitfall notes.

## Validation

`grep -rnF --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=out -e "-[url(" .`
returns nothing except this note, and `pnpm dev` serves `/components` with status 200 after a restart.
