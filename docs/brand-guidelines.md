# BASidekick — Brand Guidelines

**Version:** 2026-05-25 (post-design-system canonical)
**Supersedes:** `brand-review-2026-04-16.md` (audit of the prior parchment/sage/gold + Fraunces system)
**Companion:** [design.md](../design.md) at repo root — engineering-facing token reference (YAML frontmatter + Google Labs `design.md` format). Both docs must stay in sync; when in doubt, this file owns *rationale*, `design.md` owns *tokens*.

This document is the source of truth for the BASidekick visual + verbal identity. If a component or asset disagrees with this file, the component is wrong — fix it, don't fork the rules.

---

## 1. Positioning

**One-line:** Independent BAS reference, community, and open-source toolkit. Built by a working engineer in Tucson — not a vendor, not a marketing team.

**Why we look the way we look:** Most BAS sites read like trade-show booths. We look like a working drawing — editorial, instrument-panel calm, opinionated but plainspoken. Crimson is the only loud thing on the page, and it earns that role by being scarce.

**Audience:** BAS integrators, controls techs, balancers, FDD engineers, MSI shop owners. People who already know the field. Don't talk down. Don't oversell. Don't use stock photos.

---

## 2. Voice

**Attributes:**
- **Plainspoken.** Short sentences. Concrete nouns.
- **Craft-proud, not boastful.** "Smaller, but still loved." Modesty + obvious care.
- **Anti-hype.** No "revolutionary", no "next-gen", no "AI-powered" unless that's literally what's being described.
- **First-person where it earns it.** Rob signs his work. That's an asset, not a complication.
- **Slightly wry.** "A quiet place to talk shop." "No hot takes."

**Do:**
- "Browse the Atlas →"
- "Pull up a chair →"
- "*built by a working engineer*, independent of any vendor."

**Don't:**
- "Join our community of industry-leading professionals"
- "Revolutionizing building automation through cutting-edge AI"
- Empty enthusiasm: "Welcome!", "Get started in seconds!"

**Page titles:** `{Page} — BASidekick` with em-dash. Suffix on every page.

---

## 3. Logo system

### 3.1 BrandMark (the icon)

A 32×18 horizontal card in crimson, with three cream cutouts representing the toolkit's three modes: **lookup** (square), **lookup-to-answer** (arrow), **reference** (page outline).

Live in code: [components/brand-mark.tsx](../components/brand-mark.tsx). All other usages should embed this SVG path or reference one of the static SVG variants in [public/brand/](../public/brand/), not redraw it.

**Aspect:** 16:9 card, 2px radius. Always horizontal. Never rotated. Never recolored except for the documented variants below.

**Sizes** (props on `<BrandMark size="..." />`):

| Token | Size | Use |
|---|---|---|
| `xs` | 24×14 | Inline next to small text, breadcrumb-scale |
| `sm` | 32×18 | Footer, dense lockups |
| `md` (default) | 38×22 | Navbar, default usage |
| `lg` | 56×32 | Hero lockups, marketing |
| `xl` | 96×54 | Splash, OG / social mocks |

**Color variants** (props on `<BrandMark variant="..." />`):

| Variant | Card | Cutouts | When |
|---|---|---|---|
| `default` | `--punch` | `--sand` | Everywhere by default — light or dark surfaces |
| `mono` | `--ink` | outlined `--sand` strokes | Print, fax, CMYK pipelines where crimson reproduces poorly |
| `inverse` | `--sand` | `--punch` | Only on full-bleed crimson surfaces (rare) |

**The crimson stays crimson.** On dark surfaces, do not invert the crimson card to cream — the mark anchors the page even on `--char`.

### 3.2 Wordmark

`BASidekick` rendered in **Archivo Black 900** with `-0.005em` letter-spacing. No italic, no script variant. The cap-B and "S" of "Sidekick" are not separated by color, weight, or kerning — it reads as one word.

**Lockups:**
- **Primary:** BrandMark + "BASidekick" wordmark on a horizontal axis, ~12px gap.
- **Stacked (avatar / square formats):** BrandMark centered top, wordmark below.
- **Wordmark only:** acceptable in tight inline contexts (footer copy, signatures).
- **Icon only:** acceptable as favicon, app icon, and tab badge.

**Optional tagline tag** (mono, uppercase, tracked +0.18em): `INDEPENDENT BAS TOOLKIT`. Use sparingly — header bar, social cards, OG image. Not in body copy.

### 3.3 Asset directory

All canonical static assets live in [public/brand/](../public/brand/). All are SVG (the X/Twitter header also ships as PNG for upload).

**Lockups**

| File | Use | Size |
|------|-----|------|
| `wordmark-light.svg` | JSON-LD `logo`, light-surface lockups | 480×80 |
| `wordmark-dark.svg` | Dark-surface lockups | 480×80 |
| `wordmark-mono.svg` | Print / CMYK / fax — single near-black fill | 480×80 |

**Mark only**

| File | Use | Size |
|------|-----|------|
| `brandmark.svg` | Standalone crimson mark for third-party embeds | 32×18 native (scalable) |
| `brandmark-mono.svg` | Print / CMYK monochrome | 32×18 native |
| `brandmark-inverse.svg` | Only on full-bleed crimson surfaces | 32×18 native |
| `brandmark-maskable.svg` | PWA `purpose: maskable` icon (40% safe zone) | 512×512 |
| `favicon.svg` | Browser tab icon | 32×32 |

**Avatars**

| File | Use | Size |
|------|-----|------|
| `avatar-light.svg` | Profile avatar, light contexts | 400×400 |
| `avatar-dark.svg` | Profile avatar, dark contexts | 400×400 |

**Social**

| File | Use | Size |
|------|-----|------|
| `social-banner.svg` | Open Graph / Twitter card mockup, 1.91:1 | 1200×630 |
| `social-square.svg` | Instagram, LinkedIn square posts | 1080×1080 |
| `social-twitter-header.svg` / `.png` | X / Twitter banner | 1500×500 |

**Runtime routes (Next.js auto-discovered)**

| File | Output | Purpose |
|------|--------|---------|
| [app/icon.svg](../app/icon.svg) | `/icon` 32×32 | Browser favicon |
| [app/apple-icon.tsx](../app/apple-icon.tsx) | `/apple-icon` 180×180 PNG | iOS home-screen icon |
| [app/opengraph-image.tsx](../app/opengraph-image.tsx) | `/opengraph-image` 1200×630 PNG | Default OG image |
| [app/twitter-image.tsx](../app/twitter-image.tsx) | `/twitter-image` 1200×630 PNG | Twitter card (re-exports OG) |
| [app/manifest.ts](../app/manifest.ts) | `/manifest.webmanifest` | PWA manifest with icon set + theme color |

The runtime OG image is the canonical render because OG crawlers always rasterize from it. `social-banner.svg` is a designer mockup — keep it visually identical, but the runtime wins if they diverge.

### 3.4 Clear space

Minimum clear space around the wordmark = the height of the cap-B. No type, image, or rule may enter that envelope. Around the BrandMark alone, minimum clear space = the height of the card (18 units at native).

### 3.5 Don't

- Don't recolor the BrandMark card to anything other than `--punch` crimson.
- Don't apply gradients, drop shadows, glows, or strokes to the wordmark.
- Don't squish, skew, italicize, or outline the wordmark.
- Don't place the wordmark on photographic backgrounds without a solid block behind it.
- Don't pair the BrandMark with a different typeface — Archivo Black or nothing.

---

## 4. Color

### 4.1 Core palette (used 95% of the time)

| Token | Hex | Role |
|-------|-----|------|
| `--ink` / `--foreground` | `#0a0a0a` | Body text, headings, primary surfaces (dark) |
| `--sand` / `--background` | `#fafaf8` | Page background (light) |
| `--cream` | `#f5f5f5` | Foreground on dark surfaces |
| `--punch` | `#d11a36` | The one accent. Links, CTAs, section markers, dots, focus rings |
| `--punch-2` | `#e8344e` | Brighter crimson — keyword syntax, hover-only states |
| `--ink-2` | `rgba(10,10,10,0.64)` | Secondary text |
| `--ink-3` | `rgba(10,10,10,0.44)` | Mono labels, captions, dividers |
| `--ink-4` | `rgba(10,10,10,0.22)` | Whisper-quiet meta, separators |
| `--border` | `rgba(10,10,10,0.08)` | Default border |

**The crimson rule:** crimson is the only chromatic color on the page. If a thing isn't *the* most important action or signal in its region, it doesn't get crimson. When in doubt, ink-3 or border is the answer.

### 4.2 Supporting palette (used for semantics only)

These exist so that ontology badges, status dots, code syntax, and wiki category accents have a defensible non-crimson home. **Never** use them for chrome, typography, or decoration. If you're tempted to use `--slate` for a heading, you want `--ink` instead.

| Token | Hex | Role |
|-------|-----|------|
| `--ochre` | `#b8762a` | Haystack ontology, troubleshooting category, warning |
| `--ochre-2` | `#d99a5d` | Same family, dark-surface variant |
| `--moss` | `#3a7a3a` | Brick ontology, "best practices" category, system-live status |
| `--moss-2` | `#9ec79a` | Same family, dark-surface variant |
| `--slate` | `#3d5a80` | "How-to" category, guidance |
| `--teal` | `#2d6e6e` | "Reference" category |
| `--plum` | `#6b3a5e` | "Documentation" category |

**Semantic aliases** (prefer these in components):
- `--status-live`, `--ontology-haystack`, `--ontology-brick`
- `--tok-keyword`, `--tok-string`, `--tok-key`, `--tok-fn`, `--tok-comment`, `--tok-dim`
- `--wiki-troubleshooting`, `--wiki-how-to`, `--wiki-best-practices`, `--wiki-documentation`, `--wiki-reference`

If you need a new semantic role, add the alias to [app/globals.css](app/globals.css) — don't drop a raw hex into a component.

### 4.3 Don't

- Don't introduce a second accent. Crimson does that job.
- Don't use Tailwind defaults (`text-blue-500`, `bg-emerald-200`, etc.) — they don't sit alongside crimson cleanly. Use brand tokens.
- Don't use neon, fluorescent, or saturated greens (legacy palette removed `#C4F82A`).
- Don't recolor the supporting palette without updating this doc.

---

## 5. Typography

### 5.1 Families

| Family | Role | Source |
|--------|------|--------|
| **Archivo** | Body sans, weights 400–900 | `next/font/google`, `--font-sans` |
| **Archivo** (heading instance) | Display, weights 600–900 | `--font-heading` |
| **JetBrains Mono** | Section labels, metadata, code, tabular figures | `--font-mono` |

No other fonts ship on the site. Fraunces and Manrope were removed in the May 2026 redesign — if you find them anywhere, it's a regression.

### 5.2 Scale (post-redesign)

- **H1 / display:** 48–64px, Archivo 800/900, `-0.025em` tracking
- **H2 / section:** 28–36px, Archivo 700/800, `-0.015em`
- **H3:** 20–24px, Archivo 600/700
- **Body:** 15–16px, Archivo 400/500, `1.55` line-height
- **Small / caption:** 13–14px, Archivo 500
- **Mono label:** 10.5–12px, JetBrains Mono 400/500, **uppercase**, `+0.14em` to `+0.18em` tracking

### 5.3 Italic

Italic is a flavor, not a system. One italic phrase per heading, maximum. Reserve for:
- The single emphatic phrase in the H1 (*"built by a working engineer"*)
- Bylines (*— Rob, Tucson*)
- The occasional pull quote

Do not italicize: nav links, CTAs, body paragraphs, mono labels, the wordmark.

### 5.4 Don't

- Don't introduce a third font family. If something feels like it wants a serif, you want Archivo Italic instead.
- Don't lowercase mono labels. They're always uppercase.
- Don't justify body text. Always ragged-right.

---

## 6. Motifs & patterns

These visual devices are part of the brand — reuse them deliberately, don't reinvent them per page.

### 6.1 Status strip

A row of mono labels separated by `·` middots. Lives at the top of hero areas and OG cards. Format: `[crimson dot] SYS NOMINAL · INDEPENDENT BAS TOOLKIT`. Mono, uppercase, tracked.

### 6.2 Section numbers

Decimal-prefixed mono numerals: `.01`, `.02`, `.03`. Crimson digit, ink-3 label. Used to give pages editorial rhythm. Don't use plain "01 /" — the leading dot is part of the mark.

### 6.3 Live dot

6px crimson or moss circle, used to indicate a live/active signal. Crimson = primary accent / "now". Moss (`--status-live`) = system-ok / committed. Never a plain green emoji or unicode dot.

### 6.4 Title block strip (legacy)

The engineering-drawing "Drawing / Title / Crates / Drawn by R.H." strip from the prior design is **retired**. Don't reintroduce.

### 6.5 Specimen / featured card

The Atlas "today's specimen" card is the only place museum/specimen language is permitted. Don't extend the metaphor to other product surfaces.

### 6.6 Mono metadata

Anywhere you'd reach for a `<small>` or muted-grey caption — labels, timestamps, badge text, footer rows — use JetBrains Mono uppercase tracked. This is a load-bearing part of the look.

---

## 7. Spacing, radius, shadow

- **Radius:** `--rad-sm` 4px (chips), `--rad` 6px (buttons, inputs), `--rad-lg` 8px (cards). No rounded-full except avatars.
- **Page padding:** `--pad-x: clamp(20px, 4vw, 56px)`. Don't hardcode.
- **Max width:** `--maxw: 1380px`. Hero/content blocks respect this.
- **Shadows:** `--shadow-sm` for floating chips, `--shadow-md` for cards on hover. `--shadow-lg` for modals only. Shadows are subtle by design — if a shadow is doing visual work, the layout is probably wrong.

---

## 8. Iconography

Phosphor Icons at 16/20/24px stroke-weight `regular` or `bold`. Crimson on hover/active, ink-3 at rest. Don't mix in other icon libraries (Lucide, Heroicons) — pick a lane.

The BrandMark is not an icon — don't use it as a list bullet or button affordance.

---

## 9. Accessibility

- **Body contrast:** ink on sand = 19.6:1 ✅
- **Muted body:** `ink-2` (rgba 10,10,10,0.64) on sand ≈ 8.8:1 ✅
- **Caption:** `ink-3` (rgba 10,10,10,0.44) on sand ≈ 4.7:1 — passes for ≥18px, edges close at 11–12px mono. Don't use ink-3 below 12px.
- **Crimson on cream:** `#d11a36` on `#fafaf8` ≈ 5.6:1 ✅ for body, ✅ for large
- **Focus ring:** always `--ring` (crimson), 2px offset, never removed

Crimson is also distinguishable for the most common color-vision conditions (deuteranopia, protanopia) against the cream + ink base — but never use color alone to convey state. Pair with a label or icon.

---

## 10. Code conventions

When working in the codebase, follow these rules so the system stays coherent:

1. **No raw hex in components.** Use `var(--token)` or a Tailwind class that maps to a token. The only exceptions are SVG assets in `public/brand/` (which can't reference CSS vars).
2. **No new color tokens without updating this doc.** Section 4 is the registry.
3. **No new fonts.** Archivo + JetBrains Mono only.
4. **Tokenize semantics, not surfaces.** Prefer `--status-live` over `--moss` in a component; the alias is allowed to change.
5. **Wordmark = Archivo Black, no italic.** Site code already does this — don't override.
6. **Site-redesign HTML mockups** in [site-redesign/](site-redesign/) are reference snapshots, not living source. Treat them as read-only.

---

## 11. Examples — apply / don't apply

**Apply:**

> `<span className="text-punch font-mono uppercase tracking-[0.14em] text-[11px]">.04 — ATLAS</span>`

A section marker. Mono, uppercase, tracked, decimal prefix, crimson digit. ✅

**Don't apply:**

> `<div style={{ background: '#C4F82A', color: '#3f3f46' }}>Equipment</div>`

Off-palette neon + zinc. Replace with `bg-punch-soft text-punch` or `bg-card text-ink border-border`. ❌

**Apply:**

> H1 with single italic emphasis: *"built by a working engineer"*, rest in upright Archivo 800.

**Don't apply:**

> H1, H2, pull quote, link label, and empty-state message all in italic. The rhythm flattens. Pick one.

---

## 12. Open questions

These are intentional debts, flagged so they don't become assumptions:

- **Wordmark SVG fidelity.** The current `wordmark-*.svg` files use `<text>` with `Archivo Black` + Helvetica Neue / Arial fallbacks. Browsers render correctly; social-card raster pipelines may fall back to Arial which is close but not identical. The runtime [app/opengraph-image.tsx](../app/opengraph-image.tsx) now fetches Archivo + Archivo Black woff2 directly so OG cards are pixel-true. If pixel-perfect wordmark across *all* platforms matters (Slack unfurls, third-party scrapers), convert glyphs to paths.
- **Dark mode for the public site.** The supporting palette tokens above include light/dark-surface pairs (`--ochre` / `--ochre-2`, `--moss` / `--moss-2`), so dark-mode wiring is feasible without expanding the palette. Not currently enabled — `.char-section` is the only dark surface today (status strip, hero schematic header, specimen cards). See `design.md § Dark surfaces` for the doctrine.
- **Print stylesheet.** None today. If/when we add one, ink on sand inverts cleanly; crimson reproduces poorly in CMYK — substitute `--ink` for any non-essential crimson before printing. The new `wordmark-mono.svg` + `brandmark-mono.svg` exist for this case (and email signatures, fax pipelines).

---

## 13. Where this is enforced

- Color, spacing, typography tokens: [app/globals.css](../app/globals.css) `:root` block
- Logo component: [components/brand-mark.tsx](../components/brand-mark.tsx) — `<BrandMark />` + `<BrandLockup />`
- Nav lockup: [components/navbar.tsx](../components/navbar.tsx)
- Site metadata + JSON-LD: [app/layout.tsx](../app/layout.tsx)
- Runtime brand routes: [app/opengraph-image.tsx](../app/opengraph-image.tsx), [app/twitter-image.tsx](../app/twitter-image.tsx), [app/icon.svg](../app/icon.svg), [app/apple-icon.tsx](../app/apple-icon.tsx), [app/manifest.ts](../app/manifest.ts)
- Wiki category palette: [lib/wiki-colors.ts](../lib/wiki-colors.ts)
- Atlas graph palette: [components/atlas/atlas-graph.tsx](../components/atlas/atlas-graph.tsx)
- Static brand assets: [public/brand/](../public/brand/)
- Engineering token reference: [design.md](../design.md) at repo root

When in doubt, this doc wins. If this doc is wrong, fix the doc and the implementation in the same change.

---

## 14. Motion, states, tables, accessibility

These topics live in [design.md](../design.md) (the engineering-facing token reference) rather than duplicated here. Quick map:

- **Motion** — duration scale (`fast` 140ms default), easing curves, reduced-motion fallback. See `design.md § Motion`.
- **State patterns** — loading skeletons, empty states, error states, toast. Every data-driven surface ships all four. See `design.md § State patterns`.
- **Tables / data rows** — row anatomy, `tabular-nums`, hover-row behavior for atlas / wiki / pointstack. See `design.md § Tables / data rows`.
- **Accessibility** — contrast ratios per token, focus-ring spec, keyboard map, color-blindness rule, reduced-motion. See `design.md § Accessibility`.
- **Iconography** — Phosphor weights + sizes tracked to the type scale. See `design.md § Iconography`.
- **Forms** — label / input / help / error anatomy. See `design.md § Forms`.
- **Schematic system** — corner brackets, drawing stamps, section numbers as a reusable motif set. See `design.md § Schematic system`.

Tokens (motion durations, breakpoints, voice attributes, component variants) are encoded in the YAML frontmatter of `design.md` so they can be parsed by tooling.

---

## 15. Voice — extended examples

These pair with the rules in §2.

**CTA verb shortlist:** `Browse · Explore · Open · Read · Submit · Sign in · Join · Continue · Start`. Pick from this list. Don't invent "Discover more!" or "Get started in seconds!"

**Forbidden words** (without a real reason): *revolutionary, cutting-edge, next-gen, seamless, leverage, delight, effortless, empower, unlock, amazing, welcome* (as standalone greeting).

**Micro-label conventions:**

- Section numbers: `.01`, `.02`, `.03` — leading decimal, mono, crimson digit, ink-3 label.
- Status taglines: `INDEPENDENT BAS TOOLKIT`, `SYS NOMINAL`, `FEED OK` — mono, uppercase, tracked `0.14–0.18em`.
- Timestamps: `UTC 18:57` (24-hour), `MAY 24, 2026` (mono short month), or relative (`2 minutes ago` — sentence case).
- Counts: `501 points indexed` (tabular numerals), not `500+ points!`.

**Stamp format:** Drawing IDs follow `M-23-700` (prefix · year · sequence). Prefix encodes type: `M` mechanical, `E` electrical, `P` piping, `A` architectural. Never random alphanumeric.
