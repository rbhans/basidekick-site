# BASidekick app-shell redesign — design spec

**Date:** 2026-07-07
**Status:** Approved pending user review
**Outcome:** A fresh repository (`~/Projects/basidekick-app`) containing an app-like rebuild of BASidekick. Same core content and data, entirely new presentation: side-nav app shell, dashboard home, top-tier motion. When mature, it replaces `basidekick-site` in production.

## 1. Goals and constraints

- The site should feel like a product you're *using* (Linear × Vercel dashboard), not a website you're reading.
- Fully usable logged out (read everything); interactions (bookmark, post, endorse, profile) gate behind sign-in.
- Carry over **only** the color palette and logo from the current design system ([design.md](../../../design.md)). Typography, spacing, radii, elevation, and voice of the chrome are all new.
- Motion/animation/interaction quality is the headline requirement: "crisp + signature moments" tier.
- No schema or RLS changes in Supabase. The new app points at the same project (`cwdoklplunlaqakiyagb`); RLS remains the authz boundary.
- Old site stays live and untouched until cutover.

## 2. Foundation

- New repo: `~/Projects/basidekick-app`, own git history, pnpm.
- Stack: Next.js 16 (App Router), TypeScript, Tailwind 4, `motion` (motion/react), Base UI/Radix primitives, `cmdk` for the palette, `@supabase/ssr` + `supabase-js`.
- Data plumbing is **ported per section as that section is built** (Atlas SQLite pipeline + fetch scripts, MDX wiki content, news curation, PointStack queries), not migrated wholesale up front. Source of truth for ported logic is the current repo's `lib/`, `scripts/`, and route handlers.
- Local dev keeps the current convention: no `.env.local` committed; Supabase-backed surfaces degrade gracefully when env is absent.

## 3. Design system (new)

**Colors (carried over verbatim):** ink `#0a0a0a`, sand `#fafaf8`, punch `#d11a36` + their documented variants, surface/line scales, and the five semantic accents (ochre/moss/slate/teal/plum) for categories and status. Logo carried over.

**Typography (new):** Familjen Grotesk for all UI and headings; Spline Sans Mono for point names, tags, eyebrows, data values, and keyboard hints. App-density scale: ~13–14px base UI text, ~19–24px page headings, mono micro-labels uppercase and letterspaced.

**Structure:** 4px spacing grid, radii 6–10px, hairline (`rgba(10,10,10,0.08)`) borders as the primary elevation device, shadows minimal.

**Theming:** every token defined as a light/dark pair from day one (CSS variables). Light theme ships first; a dark theme toggle lands after sections stabilize. The rail is always ink-dark regardless of theme.

## 4. App shell

Layout (desktop): `[rail 56px | contextual panel ~220px (collapsible) | content pane]` with a slim top bar over the content pane.

- **Rail (ink-dark):** logo top; icon per top-level section with hover tooltip flyouts; active section marked with punch accent; avatar (signed in) or sign-in affordance at bottom.
- **Top-level sections (rail order):** Home, Atlas, Wiki, Courses, News, PointStack, Calculators, References, Community Share.
  - Community Share is promoted to its own top-level section (downloads, apps, software, community links — expected to grow).
  - Babel, QRSidekick, Resources, and the generic Tools page are **not** in the new IA.
  - Equipment lives inside Atlas's sub-nav, not as its own section.
- **Contextual panel:** sub-nav for the active section (e.g. Atlas → Equipment / Points / Brands / Search; PointStack → Feed / Experts / Jobs; Wiki → categories). Collapsible; collapse state persists (localStorage). Sections with no sub-pages (e.g. News) render without the panel.
- **Top bar:** breadcrumb, page-level actions, ⌘K trigger.
- **Command palette (⌘K):** navigate to any section/sub-page + federated search across Atlas, Wiki, and News.
- **Auth states:** logged out, all content readable; interactive affordances render normally but open a sign-in sheet on use. Signed in, avatar menu exposes profile/account/admin (role-gated).
- **Mobile:** rail becomes a bottom tab bar (Home, Atlas, Wiki, PointStack + "More"); contextual panel becomes a slide-up sheet; ⌘K becomes a search button.
- **Homepage (`/`):** a dashboard inside the shell — latest news, trending PointStack, atlas quick-search, recently viewed / jump-back-in. No separate marketing landing.

## 5. Motion system

Single physics vocabulary via a token layer consumed by both CSS and `motion/react`:

- Durations: 120ms (micro), 180ms (base), 280ms (large surfaces). Two spring presets: snappy (nav, buttons) and gentle (panels, sheets).
- **Micro-interactions (everywhere):** nav hover/active glide, button press scale, panel collapse spring, focus rings, list stagger on first paint, skeleton shimmer while data loads.
- **Signature moments:** route transitions inside the content pane only (content fades/rises ~4px; the shell never moves), command-palette open, dashboard entrance sequence.
- `prefers-reduced-motion` strips transforms and staggers globally; opacity-only fallbacks.

## 6. Build order

| Phase | Scope | Verify |
|---|---|---|
| 0 | Repo scaffold, tokens, fonts, full shell with all sections stubbed, ⌘K nav, dashboard home (static/placeholder data), motion system | Shell navigable in browser, transitions correct, reduced-motion pass |
| 1 | News + Wiki (content-heavy, least plumbing) | Real content renders, search in palette |
| 2 | Atlas (port SQLite pipeline, fetch/postbuild scripts, equipment/points/brands) | Atlas browse + search parity with old site |
| 3 | Auth, profile, account, PointStack (feed, experts, jobs) | Sign-in sheet flow, RLS-gated writes work |
| 4 | Calculators, References, Community Share, admin | Feature parity for kept sections |
| 5 | SEO surfaces (sitemap, robots, OG images, llms.txt), analytics, domain cutover | Production deploy replaces old site |

Each phase is verified in the browser (preview tools) before the next begins. Note: framer-motion freezes in screenshot-capture contexts, so visual verification relies on live preview/snapshot rather than static screenshots.

## 7. Error handling & testing

- Route-level `error.tsx` and `not-found.tsx` inside the shell (errors render in the content pane; the shell survives).
- Supabase-degraded mode (no env locally): auth-dependent UI renders logged-out state, no crashes.
- Lint + `next build` green per phase; existing node test scripts come along with the modules they test (news curation, LinkedIn CSV).

## 8. Out of scope

- Any Supabase schema/RLS/edge-function changes.
- Babel, QRSidekick, Resources, Tools landing page (dropped from the new IA; old routes can 301 to nearest equivalents at cutover).
- Dark theme toggle UI (tokens are dark-ready; the toggle ships post-Phase 4).
- New content authoring — content migrates as-is.
