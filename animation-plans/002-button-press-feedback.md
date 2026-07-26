# 002 — Make button press feedback win

- **Status**: DONE
- **Commit**: `9fba098`
- **Severity**: MEDIUM
- **Category**: Physicality and feedback
- **Estimated scope**: 1 stylesheet, under 20 changed lines

## Problem

The shared button has a 1px downward active state, but the later and equally specific primary-hover rule keeps the button translated upward while it is pressed. Primary calls to action therefore lose their physical press response under a mouse—the exact controls that should feel most responsive.

```css
/* app/globals.css:69-73 — current */
.button {
  transition: background var(--fast) var(--ease-out),
    border-color var(--fast) var(--ease-out),
    transform var(--fast) var(--ease-out),
    box-shadow var(--fast) var(--ease-out);
}
.button:active { transform: translateY(1px); }
.button.primary:hover {
  box-shadow: 0 4px 8px color-mix(in srgb, var(--crimson) 22%, transparent);
  transform: translateY(-1px);
}
```

## Target

Keep hover lift but place a definitive press rule after it:

```css
.button:active:not(:disabled) {
  transform: scale(0.97);
}

.button.primary:active:not(:disabled) {
  transform: scale(0.97);
  box-shadow: none;
}
```

The existing `--fast: 120ms` and `--ease-out` already meet the 100–160ms button-feedback budget. Disabled buttons remain motionless.

## Repo conventions to follow

- Motion durations and curves live in `:root` at `app/globals.css:24-28`.
- The shared `.button` owns interaction behavior; do not copy active rules into individual features.

## Steps

1. Replace the old `.button:active` translation with the target `scale(0.97)` rule.
2. Add the primary active override after `.button.primary:hover`.
3. Keep the current background, border, and hover lift.
4. Add a stylesheet contract assertion near the visual tests in `tests/rendered-html.test.mjs` that catches removal of the active scale and disabled guard.

## Boundaries

- Do not change button sizes, colors, shadows at rest, hover color, or typography.
- Do not add press scaling to nav icons; they already provide explicit animated feedback.
- Do not change disabled opacity or cursor behavior.
- Do not add a dependency.

## Verification

- **Mechanical**: `npm run validate` → exit 0.
- **Static**: `rg -n "\\.button.*active.*disabled|scale\\(0\\.97\\)" app/globals.css` → both target rules are present.
- **Feel check**:
  - Press and hold the landing “Open workspace” button with a mouse; it must move inward, not remain lifted.
  - Press a quiet secondary button; it must use the same 0.97 scale.
  - Press a disabled button; it must not scale.
  - At 10% playback, release must retarget smoothly from the held scale without a jump.
  - With reduced motion enabled, the global 0.01ms rule makes the state immediate.
- **Done when**: primary and ordinary buttons give the same visible press acknowledgment and disabled buttons do not move.
