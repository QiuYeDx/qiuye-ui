# QIUYE-UI-PIT-0019: AnimatePresence ignores a removal callback called during the child's layout effect

## Area

Frontend / Motion exit animation

## Triggers

`usePresence()` / `safeToRemove`, custom exit animations driven outside
`motion.*` (WAAPI, direct DOM), children that sometimes have nothing to animate
and finish immediately (never-placed skeletons, items removed before their
first paint), Masonry

## Symptoms

After one immediate exit, every later removed item stays in the DOM forever
(invisible or frozen at its exit pose); AnimatePresence never unmounts the
exiting set.

## Root cause

AnimatePresence records which keys are exiting in its own layout effect, which
runs after the child's layout effect. A `safeToRemove()` call made
synchronously inside the child's layout effect arrives before the key is
registered and is dropped. AnimatePresence waits for all exits of a render to
complete, so one lost completion blocks every later exit.

## Do

- Defer completion to at least a microtask (`queueMicrotask` or a resolved
  promise) even when there is nothing to animate.
- Keep the latest `safeToRemove` in a ref and call that one; the callback
  identity changes when an exiting child is re-added and removed again.

## Avoid

- Calling `safeToRemove()` synchronously from `useLayoutEffect` /
  `useInsertionEffect`.

## Validation

Remove an item that never painted, then remove a normal item: both must leave
the DOM (`document.querySelectorAll('[data-slot=masonry-item]').length`
drops), and the second plays its exit.
