---
version: "1.0"
name: BASidekick
description: Editorial-technical design system for an independent building-automation reference site. Cream paper, near-black ink, crimson stamp.
colors:
  # Core triad — drives ~95% of chrome
  primary: "#0a0a0a"          # ink — primary text, primary buttons
  secondary: "#fafaf8"         # sand — page background, light fill on dark
  tertiary: "#d11a36"          # punch — single accent: links, CTAs, live indicators, hover

  # Surfaces
  surface: "#ffffff"           # card
  surface-2: "#ededeb"         # sand-2 — secondary fills, muted
  surface-3: "#d8d8d4"         # sand-3 — tertiary fills, dividers in dense layouts
  surface-dark: "#0d0d0d"      # char — inverse panel background
  surface-dark-2: "#161616"    # char-2 — raised on dark
  surface-dark-card: "#141414" # char-card — card surface on dark

  # Ink hierarchy (text on light)
  ink: "#0a0a0a"
  ink-2: "rgba(10,10,10,0.64)" # body secondary
  ink-3: "rgba(10,10,10,0.44)" # muted, eyebrows
  ink-4: "rgba(10,10,10,0.22)" # disabled

  # Cream hierarchy (text on dark)
  cream: "#f5f5f5"
  cream-2: "rgba(245,245,245,0.66)"
  cream-3: "rgba(245,245,245,0.44)"

  # Punch variants
  punch: "#d11a36"
  punch-2: "#e8344e"               # hover / lighter on dark
  punch-soft: "rgba(209,26,54,0.12)" # tinted background — badges, icon wells

  # Lines
  line: "rgba(10,10,10,0.08)"      # hairline on light
  line-2: "rgba(10,10,10,0.18)"    # stronger on light
  line-dark: "rgba(255,255,255,0.08)"
  line-dark-2: "rgba(255,255,255,0.18)"

  # Semantic accents — ONLY for ontologies, status, wiki categories, syntax.
  # Never use these for chrome or typography.
  ochre: "#b8762a"                  # Haystack / warmth / warning
  moss: "#3a7a3a"                   # Brick / system-live / positive
  slate: "#3d5a80"                  # how-to guidance
  teal: "#2d6e6e"                   # reference
  plum: "#6b3a5e"                   # documentation

typography:
  fontFamily-sans: "Archivo, system-ui, sans-serif"
  fontFamily-heading: "Archivo, system-ui, sans-serif"
  fontFamily-mono: "JetBrains Mono, ui-monospace, monospace"
  display: { size: "clamp(48px, 7vw, 96px)", weight: 800, lineHeight: 0.9, letterSpacing: "-0.035em" }
  h1:      { size: "clamp(30px, 4.4vw, 48px)", weight: 600, lineHeight: 1.08, letterSpacing: "-0.018em" }
  h2:      { size: "28px", weight: 700, lineHeight: 1.2, letterSpacing: "-0.01em" }
  h3:      { size: "22px", weight: 700, lineHeight: 1.2 }
  h4:      { size: "17px", weight: 600, lineHeight: 1.3 }
  body:    { size: "15px", weight: 400, lineHeight: 1.55 }
  small:   { size: "13px", weight: 400, lineHeight: 1.5 }
  micro:   { size: "11px", weight: 500, family: mono, lineHeight: 1.4, transform: uppercase, tracking: "0.18em" }
  tagline: { size: "17px", weight: 400, lineHeight: 1.5, style: italic, color: ink-2 }

rounded:
  none: 0
  sm: 4px       # buttons, badges, pills, chips
  md: 6px       # cards, inputs, panels
  lg: 8px       # large containers, modal corners
  full: 9999px  # avatars only

spacing:
  1: 8px        # tight gap (icon + label)
  2: 16px       # default content gap
  3: 24px       # row gap, paragraph break
  4: 40px       # group separator
  5: 56px       # section padding (mobile)
  6: 88px       # section padding (desktop)
  7: 128px      # major separator

container:
  page: 1380px       # bsk-wrap — navbar, footer, hero strip
  content: 1100px    # bsk-wrap-content — most page bodies
  narrow: 1000px     # bsk-wrap-narrow — directory lists, forms
  prose: 760px       # bsk-wrap-prose — long-form reading
  padding-x: "clamp(20px, 4vw, 56px)"

elevation:
  none: "none"
  sm: "0 1px 2px rgb(0 0 0 / 0.05)"
  md: "0 1px 3px rgb(0 0 0 / 0.06), 0 4px 12px -2px rgb(0 0 0 / 0.08)"
  lg: "0 4px 6px rgb(0 0 0 / 0.04), 0 12px 24px -4px rgb(0 0 0 / 0.10)"
  dark-md: "0 2px 4px rgb(0 0 0 / 0.5), 0 8px 24px -4px rgb(0 0 0 / 0.6)"

components:
  button-primary:
    backgroundColor: "#0a0a0a"
    textColor: "#fafaf8"
    rounded: 6px
    padding: "0 16px"
    height: 36
    fontFamily: sans
    fontWeight: 600
    fontSize: 13.5
    hover: { backgroundColor: "#0d0d0d" }
  button-secondary:
    backgroundColor: "#ededeb"
    textColor: "#0a0a0a"
    rounded: 6px
    hover: { backgroundColor: "#d8d8d4" }
  button-punch:
    backgroundColor: "#d11a36"
    textColor: "#fafaf8"
    rounded: 6px
    shadow: "0 1px 2px rgba(209,26,54,0.3)"
    hover: { backgroundColor: "#e8344e", shadow: "0 2px 8px rgba(209,26,54,0.35)" }
  button-outline:
    backgroundColor: "#ffffff"
    borderColor: "rgba(10,10,10,0.18)"
    textColor: "#0a0a0a"
    rounded: 6px
    hover: { borderColor: "#0a0a0a" }
  button-ghost:
    backgroundColor: "transparent"
    textColor: "rgba(10,10,10,0.64)"
    rounded: 6px
    hover: { backgroundColor: "#ededeb", textColor: "#0a0a0a" }
  card:
    backgroundColor: "#ffffff"
    borderColor: "rgba(10,10,10,0.08)"
    rounded: 6px
    shadow: sm
    padding: 20
    hover: { borderColor: "rgba(10,10,10,0.44)", shadow: md }
  badge-default:
    backgroundColor: "#0a0a0a"
    textColor: "#fafaf8"
    rounded: 4px
    padding: "0 8px"
    height: 22
    fontFamily: mono
    fontSize: 10.5
    transform: uppercase
    tracking: "0.12em"
  badge-punch:
    backgroundColor: "#d11a36"
    textColor: "#fafaf8"
    rounded: 4px
  badge-punch-soft:
    backgroundColor: "rgba(209,26,54,0.12)"
    textColor: "#d11a36"
    borderColor: "rgba(209,26,54,0.24)"
    rounded: 4px
  badge-outline:
    backgroundColor: "transparent"
    borderColor: "rgba(10,10,10,0.18)"
    textColor: "rgba(10,10,10,0.64)"
    rounded: 4px
  input:
    backgroundColor: "#ffffff"
    borderColor: "rgba(10,10,10,0.08)"
    rounded: 6px
    padding: "11px 14px"
    fontFamily: sans
    fontSize: 14
    focus: { borderColor: "#0a0a0a", shadow: sm }
    placeholder: { color: "rgba(10,10,10,0.44)", style: italic }
  pill:
    backgroundColor: "transparent"
    borderColor: "rgba(10,10,10,0.18)"
    rounded: 4px
    padding: "6px 11px"
    fontFamily: mono
    fontSize: 10.5
    transform: uppercase
    hover: { borderColor: "#0a0a0a", textColor: "#0a0a0a" }
    selected: { backgroundColor: "#0a0a0a", textColor: "#fafaf8" }
  status-strip:
    backgroundColor: "#0d0d0d"
    textColor: "rgba(245,245,245,0.44)"
    height: 32
    fontFamily: mono
    fontSize: 10.5
    transform: uppercase
    tracking: "0.14em"
  navbar:
    backgroundColor: "rgba(250,250,248,0.85)"
    backdropFilter: "blur(6px)"
    borderColor: "rgba(10,10,10,0.08)"
    height: 68
    height-mobile: 60
---

## Overview

BASidekick is an independent reference site for building automation systems — point-naming standards, equipment catalogs, field-tested wiki, community Q&A. It is not a marketing site, not a SaaS dashboard, not a developer-tool landing page. The voice is **editorial-technical**: terse, knowledgeable, no marketing fluff, no growth-hack flourishes. Pages read like a working engineer's notebook with a graphic designer's discipline.

**Three brand cues anchor the system:**

1. **Cream paper.** The default background is `--sand` (#fafaf8), warm off-white that reads like a reference manual.
2. **Near-black ink.** Body and headings are `--ink` (#0a0a0a), one step short of pure black to keep the page calm at long reading times.
3. **Crimson stamp.** `--punch` (#d11a36) is the only accent for chrome — links, hover, CTAs, live indicators, the corner brackets on the hero schematic. Used sparingly so it actually means something.

Surrounding these three, a quieter semantic palette (`--ochre`, `--moss`, `--slate`, `--teal`, `--plum`) is reserved for ontology classification (Project Haystack, Brick), status colors, wiki category accents, and code-syntax highlighting. **These accents never touch chrome or typography.**

Typography pairs **Archivo** (sans + heading) with **JetBrains Mono** for system labels: timestamps, eyebrows, code, micro-tags, drawing IDs. The mono is the schematic-callout cue.

Visual cues borrow from technical drawings — corner brackets on the hero viewport, mono "DRAWING / REV / SHEET" stamp, monospace "01 /" section indices, pulsing live dot in `--punch`. None of it is skeuomorphic. It's restraint, not decoration.

---

## Colors

### Core triad

| Token | Hex | Role |
|---|---|---|
| `--ink` (primary) | `#0a0a0a` | Primary text, primary button background, divider on cards |
| `--sand` (secondary) | `#fafaf8` | Page background, light text on dark surfaces |
| `--punch` (tertiary) | `#d11a36` | Links, CTAs, live indicators, hover state for interactive text |

These three handle ~95% of the page. If you reach for a fourth, stop and check whether you actually need an accent or whether you need a semantic color instead.

### Surfaces

| Token | Hex | Use |
|---|---|---|
| `--card` | `#ffffff` | Card surface, popover, hero schematic frame |
| `--sand-2` | `#ededeb` | Secondary fill, muted background, button-secondary, footer |
| `--sand-3` | `#d8d8d4` | Tertiary fill, hover state for button-secondary |
| `--char` | `#0d0d0d` | Inverse panels (specimen section, status strip, hero schematic header) |
| `--char-2` / `--char-card` | `#161616` / `#141414` | Raised surfaces on dark |

### Ink scale (text on light)

| Token | Use |
|---|---|
| `--ink` | Primary text |
| `--ink-2` (0.64α) | Body secondary, descriptions, meta |
| `--ink-3` (0.44α) | Eyebrows, captions, placeholder text |
| `--ink-4` (0.22α) | Disabled state, decorative |

### Cream scale (text on dark)

| Token | Use |
|---|---|
| `--cream` | Primary text on `--char` surfaces |
| `--cream-2` (0.66α) | Secondary text on dark |
| `--cream-3` (0.44α) | Eyebrows on dark, status-strip body |

### Punch variants

| Token | Use |
|---|---|
| `--punch` | One accent color — links, CTAs, live dots, hover |
| `--punch-2` | Hover state for punch surfaces; punch on dark backgrounds |
| `--punch-soft` | Tinted backgrounds for badges, icon wells, soft pills |

### Semantic accents (use sparingly)

These five exist for one purpose: classification. Never use them for branding, page chrome, or typography.

| Token | Hex | Semantic role |
|---|---|---|
| `--ochre` | `#b8762a` | Project Haystack ontology · warmth · warning |
| `--moss` | `#3a7a3a` | Brick ontology · system-live · positive · best-practices |
| `--slate` | `#3d5a80` | How-to guidance |
| `--teal` | `#2d6e6e` | Reference material |
| `--plum` | `#6b3a5e` | Documentation |

Wiki category accents are aliased: `--wiki-troubleshooting`, `--wiki-how-to`, `--wiki-best-practices`, `--wiki-documentation`, `--wiki-reference`.

---

## Typography

**Two families.** Archivo for everything readable. JetBrains Mono for system labels and code.

### Scale

| Token | Size | Use |
|---|---|---|
| `--text-xs` (11px) | Micro labels, eyebrows, footer chrome |
| `--text-sm` (13px) | Captions, meta, table cells |
| `--text-base` (15px) | Body, card titles |
| `--text-md` (17px) | Tagline, lede |
| `--text-lg` (22px) | h3, sidebar section heads |
| `--text-xl` (28px) | h2 |
| `--text-2xl` `clamp(30, 4.4vw, 48)` | h1, hero manifesto |
| `--text-3xl` `clamp(48, 7vw, 96)` | Display, feed-h, marketing headline |

### Line-height

`--lh-tight` (1.08) for display and h1. `--lh-snug` (1.2) for h2–h4. `--lh-body` (1.55) for body and tagline.

### Letter-spacing rules

- Display + h1: `-0.018em` to `-0.035em` (slight tighten — Archivo's natural width is generous).
- Body: default (0).
- Mono eyebrows: `0.14em`–`0.22em` uppercase tracking — gives the technical-drawing feel.

### Italic usage

Reserved. Use italic for:
- Editorial taglines (`.nw-tagline`) — sets reading temperature for a page.
- Hero manifesto inline highlights paired with `--punch`.
- Author signoffs (`— Rob, Tucson`).

Don't use italic for definitions, emphasis, foreign words, or generic stylistic flourish.

### Mono usage

JetBrains Mono is the technical-callout cue. Use it for:
- Eyebrows ("01 /", "DRAWING", "UTC 18:57")
- Drawing IDs and timestamps
- Code, syntax tokens, badges, pills
- Micro-tags (10.5px, 0.14em tracking, uppercase)

Do not use mono for body text, headings, or button labels.

---

## Layout

### Containers

| Class | Max-width | Use |
|---|---|---|
| `.bsk-wrap` | 1380px | Navbar, footer, status strip, hero feed |
| `.bsk-wrap-content` | 1100px | Most page bodies (wiki, news, atlas detail) |
| `.bsk-wrap-narrow` | 1000px | Directory lists, forms, account, resources |
| `.bsk-wrap-prose` | 760px | Long-form reading, legal pages |

All four share the same `--pad-x` of `clamp(20px, 4vw, 56px)`. Pick by content type, not by gut feel. **Never introduce a fifth width.**

### Spacing scale

| Token | Value | Use |
|---|---|---|
| `--space-1` | 8px | Tight gap (icon + label) |
| `--space-2` | 16px | Default content gap |
| `--space-3` | 24px | Row gap, paragraph break |
| `--space-4` | 40px | Group separator |
| `--space-5` | 56px | Section padding (mobile) |
| `--space-6` | 88px | Section padding (desktop) |
| `--space-7` | 128px | Major separator |

`.section { padding-block: var(--space-6) calc(var(--space-6) + var(--space-1)) }` is the canonical section. Hero is one notch lighter: `var(--space-6)` top, `calc(var(--space-6) - var(--space-1))` bottom.

### Breakpoints

- Mobile: ≤720px (section padding drops to `--space-5`).
- Tablet: 721–980px (hero grid collapses to single column).
- Desktop: ≥981px.

### Grid

Hero uses `grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr)` (left text slightly narrower than right schematic) with `56px` gap. Stat rows: `repeat(3, 1fr)` for 3-up, `repeat(auto-fill, minmax(180px, 1fr))` for wiki category grids.

---

## Elevation & Depth

Four shadow tiers. No others.

| Token | Use |
|---|---|
| `--shadow-sm` | Card resting state; input focus halo |
| `--shadow-md` | Card hover; popover; nw-submit panel |
| `--shadow-lg` | Hero schematic; modal |
| `--shadow-dark-md` | Cards on `--char` surfaces |

Cards lift exactly one tier on hover (`sm → md`). Combine with `.bsk-hover-lift` for a 1px `translateY(-1px)` transform.

**Do not** apply shadows to text, icons, individual buttons (`.btn-punch` carries its own), or page-level chrome (navbar, footer). The page is paper, not Material Design.

---

## Shapes

Three radius values. Pick by component category, not by personal preference.

| Token | Value | Use |
|---|---|---|
| `--rad-sm` | 4px | Buttons (sm), badges, pills, chips, input chrome |
| `--rad` | 6px | Cards, default inputs, panels |
| `--rad-lg` | 8px | Large panels, modal corners |

Avatars use `border-radius: 50%`. The hero schematic viewport has **sharp corners** with `--punch` corner brackets — do not round it.

No pill shapes for buttons. No rounded-full anywhere except avatars and live dots.

---

## Components

Each component lives in `app/globals.css` as a `.bsk-*` or `.btn`/`.badge` utility class, or in `components/ui/*` as a React primitive.

### Button

Five variants. All share `.btn` base (36px height, `--rad`, 13.5px sans semibold).

| Variant | Surface | Use |
|---|---|---|
| `.btn-primary` | `--ink` bg | Default action |
| `.btn-punch` | `--punch` bg | Primary marketing CTA — one per viewport |
| `.btn-secondary` | `--sand-2` bg | Secondary action |
| `.btn-outline` | `--card` bg, line border | Tertiary action, dismissive |
| `.btn-ghost` | transparent | Lowest-emphasis, icon-only |

Sizes: `.btn-sm` (30px, `--rad-sm`), default (36px), `.btn-lg` (44px). Active state: `translateY(1px)`.

In `.char-section`, primary becomes cream-on-char.

### Card

Single source: `.bsk-card`. Combines `--card` background, `--sand-line` border, `--rad` corners, `--shadow-sm` resting → `--shadow-md` hover with border darkening to `--ink-3`. Pair with `.bsk-hover-lift` for the transform.

### Badge

`.badge` base (22px height, `--rad-sm`, mono 10.5px uppercase tracked 0.12em). Variants: default (ink/sand), punch, punch-soft, punch-outline, secondary, outline.

Wiki category badges use the semantic palette: `--wiki-troubleshooting` (ochre), `--wiki-how-to` (slate), `--wiki-best-practices` (moss), `--wiki-documentation` (plum), `--wiki-reference` (teal).

### Input + search

`.nw-search` is the canonical search input — bordered, ink-focused, italic placeholder. Default inputs inherit the same border/focus behavior via the shadcn `<Input>` primitive.

### Page hero / title-block

Two patterns, mutually exclusive on a page:
- **`.nw-head`** — full eyebrow head with `.num` ("01 /"), `.id`, live dot. Use on Wiki, News, PointStack, Atlas index.
- **`.title-block`** — legacy field-row format ("DRAWING / TITLE / SHEET" mono fields). Use on tools, resources, references, calculators.

The home page uses the bespoke `.hero` block (one of a kind — do not replicate).

### Section + section-bar

Wrap content with `<section class="sand-section">` (or `char-section` for inverse), then `<div class="bsk-wrap section">`. Each section opens with `.section-bar`: `.num` + `<h2>` + `.controls` on the right.

### Nav

`<Navbar>` is sticky (`bg-background/85` + 6px blur), 68px desktop / 60px mobile. Mega-menu groups: **Learn**, **Community**, **Build**.

### Status strip

`.strip` — 32px char-bar with mono UTC clock, build version, live dot. Site-wide, top of `<body>`.

### Live dot

`.live-dot` / `.pulse-dot` — 6–7px punch circle with 2.4s `bsk-pulse` keyframe (box-shadow ring). Use to signal real-time/online state.

---

## Do's and Don'ts

### Do

- ✅ **Use `--punch` for exactly one CTA per viewport.** It's the brand stamp; if it appears three times, it means nothing.
- ✅ **Reach for `--ink` for primary buttons by default.** Punch is for marketing CTAs and links, not "every primary action."
- ✅ **Use the four canonical containers** (`.bsk-wrap`, `-content`, `-narrow`, `-prose`). Pick by content type.
- ✅ **Use the `--text-*` and `--space-*` tokens** for any new sizing. If you need a value not in the scale, push back on the design.
- ✅ **Use mono for system labels** (timestamps, IDs, badges, eyebrows). It's the technical-drawing cue.
- ✅ **Use `text-punch` for hover state on interactive text** (links, nav, card titles). One hover color, everywhere.
- ✅ **Use the semantic palette (ochre/moss/slate/teal/plum) for classification only** — wiki categories, ontologies, syntax, status.
- ✅ **Title pattern:** `"{Section} — BASidekick"` (em-dash). Wiki article pages: `"{Article} — BASidekick Wiki"`.

### Don't

- ❌ **Don't tint backgrounds with `--punch`.** Punch belongs on type, lines, dots, and one button. Tinted punch backgrounds belong to `--punch-soft` only (badges, icon wells).
- ❌ **Don't introduce hardcoded `#fff` or `#000`.** Use `var(--card)`, `var(--char)`, `var(--sand)`, `var(--cream)`. If a value is truly bespoke, add a token first.
- ❌ **Don't invent a fifth container width.** If 1000/1100/1380 don't fit, the layout is wrong — not the system.
- ❌ **Don't apply the semantic palette to chrome.** No moss buttons, no teal headings. They mean *what something is*, not *that it's interactive*.
- ❌ **Don't use `text-accent` in new code** — the alias resolves to punch, but grep-clarity matters. Use `text-punch`.
- ❌ **Don't add shadows to text, icons, or page chrome.** Cards lift; the page does not.
- ❌ **Don't round the hero schematic viewport.** Corner brackets only.
- ❌ **Don't use italic for emphasis.** Reserve it for taglines, hero highlights, and signoffs.
- ❌ **Don't separate page-title segments with a pipe (`|`).** Em-dash only.
- ❌ **Don't write button hover states with hardcoded hex** (`hover:bg-[#000]`). Use shadcn `<Button>` defaults or `.btn-*` utility classes.
