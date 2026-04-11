# Site Animation Layer — Design Spec

**Date:** 2026-04-10
**Goal:** Add a cohesive, subtle animation layer across the BASidekick site using Motion (Framer Motion) primitives. Vibe: Linear/Stripe — smooth, invisible, everything just *feels* good.

---

## 1. Animation Tokens

Single source of truth in `components/motion/tokens.ts`:

| Token | Value | Use |
|-------|-------|-----|
| `duration.fast` | `0.15` (150ms) | Micro-interactions (press, hover) |
| `duration.normal` | `0.4` (400ms) | Reveals, entrances |
| `duration.slow` | `0.6` (600ms) | Hero elements, page transitions |
| `ease.out` | `[0.25, 0.46, 0.45, 0.94]` | Smooth deceleration for entrances |
| `ease.spring` | `{ type: "spring", stiffness: 300, damping: 30 }` | Interactive feedback |
| `stagger.default` | `0.08` (80ms) | Between children in groups |
| `distance.reveal` | `20` (px) | Default slide-up distance |

---

## 2. Primitive Components

All live in `components/motion/`. All are `"use client"`. All respect `useReducedMotion()`.

### `<Reveal>`
- Fades + slides element into view when entering viewport
- Props: `direction` (`"up"` | `"down"` | `"left"` | `"right"`, default `"up"`), `delay` (seconds), `distance` (px, default from tokens), `once` (boolean, default `true`)
- Uses `whileInView` with `viewport={{ once, amount: 0.2 }}`

### `<StaggerGroup>`
- Wraps children and staggers their entrances
- Props: `stagger` (seconds, default from tokens), `delay` (seconds)
- Uses `staggerChildren` in a `motion.div` variant

### `<HoverLift>`
- Subtle y-translate (-2 to -3px) + shadow expansion on hover, spring physics
- Props: `distance` (px, default 3), `as` (element type, default `"div"`)
- Uses `whileHover` with spring transition

### `<PressScale>`
- Scale to 0.97 on press
- Props: `scale` (number, default 0.97)
- Uses `whileTap`

### `<CountUp>`
- Animates a number from 0 to target when scrolling into view
- Props: `value` (number), `duration` (seconds, default from tokens), `prefix`/`suffix` (string)
- Uses `useInView` + `useSpring` from Motion

### `<PageTransition>`
- Wraps page content with a quick fade on route change
- Uses `AnimatePresence` + `motion.div` keyed on pathname
- Duration: 200ms fade

### Barrel export
`components/motion/index.ts` re-exports all primitives and tokens.

---

## 3. Application Map

### Page Entrances (scroll reveals)
- **Hero section** — Headline, subtitle, CTA stagger in with `<Reveal>` using `duration.slow`
- **Card grids** (Atlas, Wiki, News, PointStack) — Each card in `<StaggerGroup>`
- **Section headings** — `<Reveal>` fade-up
- **Stats/numbers** — Pulse line stats, PointStack stats use `<CountUp>`

### Micro-interactions
- **Cards** — All clickable cards (`article-card`, `feature-card`, `resource-card`, `step-card`) wrapped with `<HoverLift>`
- **Buttons** — Primary/secondary buttons get `<PressScale>`
- **Nav active indicator** — Layout animation (Motion `layoutId`) so the indicator slides between links
- **Tags/badges** — Gentle scale-in

### Transitions
- **Page transitions** — `<PageTransition>` in `app/(main)/layout.tsx`
- **Mobile nav drawer** — Spring-physics slide from right
- **Dropdowns/modals** — Keep Radix defaults, tune to match tokens if needed

### Not animated
- Body text / paragraphs
- Footer
- Form inputs

---

## 4. Implementation Strategy

### File structure
```
components/motion/
  tokens.ts
  reveal.tsx
  stagger-group.tsx
  hover-lift.tsx
  press-scale.tsx
  count-up.tsx
  page-transition.tsx
  index.ts
```

### Integration order
1. Install `motion` package
2. Build primitives in `components/motion/`
3. Add `<PageTransition>` to `app/(main)/layout.tsx`
4. Home page first — hero stagger, card grids, stats countup, card hovers
5. Roll out to Wiki, Atlas, News, PointStack pages
6. Micro-interactions — button press, nav indicator, mobile drawer
7. Remove old CSS keyframe animations from `globals.css`

### Client boundary
All motion primitives are client components. Server components render content; motion wrappers handle entrance animation around it. Existing `"use client"` view components (like `home-view.tsx`) already support this naturally.

### Accessibility
- Every primitive checks `useReducedMotion()` and renders statically when true
- Keep existing `@media (prefers-reduced-motion)` CSS as fallback
- `<Reveal>` with `once: true` means elements don't re-animate on scroll-back

---

## 5. Dependencies

- `motion` (Framer Motion v11+) — ~33KB gzipped
- No other new dependencies

---

## 6. Cleanup

After migration:
- Remove `fade-in-up`, `fade-in`, `scale-in` keyframes from `globals.css`
- Remove `.animate-fade-in-up`, `.animate-fade-in`, `.animate-scale-in` utility classes
- Remove `.animation-delay-*` classes
- Remove `.animate-on-scroll` class
- Keep `bsk-pulse` keyframe (it's a continuously-running indicator, not an entrance animation)
