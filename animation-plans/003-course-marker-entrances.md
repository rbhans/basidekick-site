# 003 — Give course target markers physical entrances

- **Status**: DONE
- **Commit**: `9fba098`
- **Severity**: MEDIUM
- **Category**: Physicality and origin
- **Estimated scope**: 2 components, 8 property edits

## Problem

The generic hotspot assessment and Intro to BAS “find the spot” illustration create click markers and revealed targets from `scale: 0`. That makes feedback appear from nothing and feels more like a generic UI effect than a physical marker being placed on a diagram.

```tsx
/* components/learn/assessment/hotspot.tsx:109-114 — current */
<motion.span
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.2 }}
>
```

```tsx
/* components/learn/illustrations/intro-to-bas/ahu-find-the-spot.tsx:101-106 — current */
<motion.span
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.2 }}
>
```

Both files repeat the same `scale: 0` shape for the revealed dashed target at `hotspot.tsx:126-136` and `ahu-find-the-spot.tsx:118-128`.

## Target

All four markers start visibly formed at 90% scale and use the strong ease-out curve:

```tsx
initial={{ scale: 0.9, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
```

Keep their centered transform origin: these markers emerge at the click/target point and are not trigger-anchored popovers.

## Repo conventions to follow

- Course state transitions already use Motion and 180–280ms durations.
- `components/learn/assessment/hotspot.tsx` is the reusable behavior; the AHU file is its specialized schematic counterpart. Keep them visually identical.
- The workspace shell wraps course content in `MotionConfig reducedMotion="user"` at `components/app-shell.tsx:141`.

## Steps

1. In `components/learn/assessment/hotspot.tsx`, change both initial scales from `0` to `0.9`.
2. Add `ease: [0.23, 1, 0.32, 1]` to both 200ms transitions; add the missing transition to the dashed-target marker.
3. Apply the same two edits in `components/learn/illustrations/intro-to-bas/ahu-find-the-spot.tsx`.
4. Add a source-contract unit test or focused static assertion that neither file contains `initial={{ scale: 0, opacity: 0 }}`.

## Boundaries

- Do not change scoring, click coordinates, target radius, colors, copy, or reset behavior.
- Do not add bounce or a spring; the course UI is crisp, not playful.
- Do not change text-feedback fades.
- Do not alter other course diagrams without a separate finding.

## Verification

- **Mechanical**: `npm run validate` → exit 0.
- **Static**: `rg -n "initial=\\{\\{ scale: 0," components/learn/assessment/hotspot.tsx components/learn/illustrations/intro-to-bas/ahu-find-the-spot.tsx` → no output.
- **Feel check**:
  - In the hotspot assessment, click correct and incorrect regions; each marker should feel placed, not inflated from nothing.
  - Reveal the dashed target after a miss; it should be readable immediately with a brief settle.
  - At 10% playback, confirm the marker starts at 90% of final diameter.
  - Enable reduced motion; the marker must appear without spatial motion while the state remains understandable.
- **Done when**: all four marker entrances use 0.9 → 1 scale with the exact strong ease-out curve.
