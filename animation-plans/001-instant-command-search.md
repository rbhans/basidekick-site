# 001 — Make command search immediate

- **Status**: DONE
- **Commit**: `9fba098`
- **Severity**: HIGH
- **Category**: Purpose and frequency
- **Estimated scope**: 1 source file, under 20 changed lines

## Problem

Command search is opened by `Cmd/Ctrl+K` and can be used hundreds of times per day. It currently fades the backdrop over 120ms and moves/scales the palette over 180ms, which adds latency to a keyboard-initiated action that should feel directly attached to the keystroke.

```tsx
/* components/app-shell.tsx:209-220 — current */
<AnimatePresence>
  {paletteOpen && (
    <motion.div
      className="palette-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
      onMouseDown={closePalette}
    >
      <motion.section
        className="command-palette"
        initial={{ opacity: 0, scale: 0.99, y: -6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.99, y: -4 }}
        transition={{ duration: 0.18, ease: [0, 0.4, 0, 1] }}
      >
```

## Target

Render and remove the backdrop and palette synchronously with `paletteOpen`. Use ordinary `div` and `section` elements with no entry/exit properties:

```tsx
{paletteOpen && (
  <div className="palette-backdrop" onMouseDown={closePalette}>
    <section
      ref={paletteRef}
      className="command-palette"
      role="dialog"
      aria-modal="true"
      aria-label="Search workspace"
      onMouseDown={(event) => event.stopPropagation()}
      onKeyDown={trapPaletteFocus}
    >
      {/* existing contents unchanged */}
    </section>
  </div>
)}
```

Do not add CSS animation as a replacement. The instant behavior applies whether the trigger is keyboard or pointer so there is one predictable component.

## Repo conventions to follow

- Keep `MotionConfig reducedMotion="user"` in `components/app-shell.tsx:141`; it still governs the explicitly approved animated sidebar icons.
- Preserve `--fast`, `--normal`, and `--slow` in `app/globals.css:24-26`; they are still used elsewhere.

## Steps

1. In `components/app-shell.tsx`, remove `AnimatePresence` and `motion` from the import at line 5, but keep `MotionConfig`.
2. Replace the two motion wrappers with ordinary `div` and `section` elements.
3. Keep every event handler, ARIA attribute, ref, search input, result row, and footer unchanged.
4. If `plans/002-accessible-overlay-primitives.md` has already executed and the palette lives in `components/workspace-command.tsx`, apply the same target there instead and do not edit stale code. If both files render a palette, STOP and report the duplicate.

## Boundaries

- Do not change search ranking, query debounce, result count, keyboard selection, focus behavior, copy, or appearance.
- Do not remove Motion from `package.json`; course interactions and nav icons still use it.
- Do not change sidebar icon animation.
- Do not add a replacement transition.
- If the source differs beyond having been extracted by plan 002, STOP and report.

## Verification

- **Mechanical**: `npm run validate` → exit 0.
- **Static**: `rg -n "AnimatePresence|motion\\.(div|section)" components/app-shell.tsx components/workspace-command.tsx 2>/dev/null` → no match for the command palette.
- **Feel check**:
  - Open and close with Cmd/Ctrl+K ten times rapidly; the surface must appear and disappear on the same frame as the key event.
  - Hold screen recording at 60fps and step one frame after keydown; the palette must already be at final opacity and position.
  - Arrow navigation and Enter must remain immediate.
  - `prefers-reduced-motion` must not change this behavior because it is already motionless.
- **Done when**: command search has no open/close animation and all existing behavior/tests pass.
