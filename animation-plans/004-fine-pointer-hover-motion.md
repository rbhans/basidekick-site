# 004 — Restrict geometric hover motion to precise pointers

- **Status**: DONE
- **Commit**: `9fba098`
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 1 stylesheet, roughly 35 changed lines

## Problem

Several cards, arrows, accent rules, and the landing artwork move under bare `:hover` selectors. Touch browsers can synthesize or retain hover after a tap, so geometric motion can stick on mobile even though it was designed as desktop pointer feedback.

```css
/* app/globals.css:379-380 — current */
.directory-grid > a,
.tool-card-grid > a {
  transition: background var(--fast), border-color var(--fast), transform var(--fast);
}
.directory-grid > a:hover,
.tool-card-grid > a:hover {
  background: var(--hover);
  border-color: var(--line-strong);
  transform: translateY(-1px);
}
```

```css
/* app/globals.css:646,650 — current */
.landing-feature-grid > a:hover { transform: translateY(-2px); }
.landing-feature-grid > a:hover::after { transform: scaleX(2); }
.landing-feature-grid a:hover em svg { transform: translateX(3px); }
.landing-feature-grid a:hover .feature-art::before { transform: scale(1.018); }
```

The same pattern appears for dense-row accent bars (`156-160`), compact-feed arrows (`179-180`), tool-shortcut arrows (`184-185`), and profile project cards (`435-436`).

## Target

Keep non-geometric hover feedback (background, border, color) available, but move every listed transform-only hover rule into:

```css
@media (hover: hover) and (pointer: fine) {
  .dense-row:hover::before { transform: scaleY(1); }
  .compact-feed a:hover .post-route { transform: translateX(0); }
  .tool-shortcuts a:hover > svg:last-child { transform: translateX(3px); }
  .directory-grid > a:hover,
  .tool-card-grid > a:hover { transform: translateY(-1px); }
  .profile-project-grid > a:hover { transform: translateY(-2px); }
  .landing-feature-grid > a:hover { transform: translateY(-2px); }
  .landing-feature-grid > a:hover::after { transform: scaleX(2); }
  .landing-feature-grid a:hover em svg { transform: translateX(3px); }
  .landing-feature-grid a:hover .feature-art::before { transform: scale(1.018); }
}
```

For selectors that also change background/border/color, leave a base hover rule containing only those non-geometric properties.

## Repo conventions to follow

- The existing reduced-motion block at `app/globals.css:712-715` remains unchanged.
- Keep all existing duration tokens and transition property lists.
- Mobile-specific CSS begins at `app/globals.css:665`; place the fine-pointer block before the reduced-motion block so the accessibility override remains last.

## Steps

1. Split the listed compound hover rules into non-geometric base rules and transform-only fine-pointer rules.
2. Add one `@media (hover: hover) and (pointer: fine)` block near the end of `app/globals.css`, before reduced motion.
3. Do not move animated sidebar icon handlers; they use actual pointer/focus events and are a settled design choice.
4. Add a stylesheet contract assertion that the fine-pointer query exists and contains the landing artwork selector.

## Boundaries

- Do not remove background, border, or color hover feedback.
- Do not change transform distances or durations.
- Do not add JavaScript pointer detection.
- Do not alter course/assessment hover behavior; this plan targets the general workspace and landing styles only.
- Do not touch nav-icon animation.

## Verification

- **Mechanical**: `npm run validate` → exit 0.
- **Static**: `rg -n "@media \\(hover: hover\\) and \\(pointer: fine\\)|feature-art::before" app/globals.css` → the media query and target selector are present.
- **Feel check**:
  - With a mouse, card lift, accent growth, arrow travel, and artwork scale look unchanged.
  - In responsive device mode with touch emulation, tap each surface and confirm no translated/scaled state remains stuck.
  - Use keyboard focus; focus outlines remain visible and no hover motion is required to understand the target.
  - With reduced motion enabled, spatial transitions resolve immediately.
- **Done when**: geometric hover motion occurs only for precise hover-capable pointers while color/border feedback remains available everywhere.
