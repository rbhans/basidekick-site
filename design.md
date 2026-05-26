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
  field-label:
    fontFamily: mono
    fontSize: 11
    transform: uppercase
    tracking: "0.18em"
    color: "rgba(10,10,10,0.44)"
  field-help:
    fontSize: 12.5
    color: "rgba(10,10,10,0.44)"
  field-error:
    fontSize: 12.5
    color: "#b91d34"
    icon: required
  table-row:
    paddingY: 16
    paddingX: 8
    borderBottom: "rgba(10,10,10,0.08)"
    fontFamily: sans
    fontSize: 14
    numericFont: "tabular-nums"
    hover: { backgroundColor: "rgba(10,10,10,0.025)" }
  thread-row:
    gridTemplate: "avatar 36 · kind 80 · ts 60 · title 1fr · stat 60"
    paddingY: 18
    borderBottom: "rgba(10,10,10,0.08)"
  skeleton:
    backgroundColor: "#ededeb"
    rounded: 4px
    shimmer:
      duration: 1400ms
      easing: ease-in-out
      colors: ["#ededeb", "#f5f5f3", "#ededeb"]
  empty-state:
    paddingY: 56
    textAlign: center
    icon: { size: 32, color: "rgba(10,10,10,0.22)" }
    title: { size: 17, weight: 600 }
    body: { size: 13, color: "rgba(10,10,10,0.44)" }
  toast:
    backgroundColor: "#0a0a0a"
    textColor: "#fafaf8"
    rounded: 6px
    shadow: lg
    fontSize: 14
    duration: 4000ms

motion:
  duration:
    instant: 0ms          # state flips that should feel snappy (checkbox)
    micro: 80ms           # focus-ring fade, ghost hovers
    fast: 140ms           # button hover, link color, default UI tween
    base: 200ms           # card hover lift, dropdown open
    slow: 320ms           # modal enter, panel slide
    long: 600ms           # hero image crossfade
  easing:
    standard: "cubic-bezier(0.4, 0, 0.2, 1)"   # default
    enter: "cubic-bezier(0, 0, 0.2, 1)"        # entering elements
    exit: "cubic-bezier(0.4, 0, 1, 1)"         # leaving elements
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)" # gentle overshoot
  hover-lift:
    transform: "translateY(-1px)"
    shadow: md
    duration: fast
  pulse:
    keyframe: bsk-pulse
    duration: 2400ms
    target: live-dot
  reduced-motion:
    rule: "@media (prefers-reduced-motion: reduce)"
    behavior: "Replace transforms and keyframes with opacity-only or static state."

breakpoints:
  sm: 640px
  md: 720px
  lg: 980px
  xl: 1024px
  2xl: 1380px

icons:
  library: phosphor-icons
  weights:
    default: regular
    emphasis: bold
    forbidden: [thin, light, fill, duotone]
  sizes:
    xs: 12       # inline with text-xs
    sm: 14       # inline with text-sm/base, mono labels
    md: 16       # default UI (buttons, nav, form fields)
    lg: 20       # section headers, primary CTAs
    xl: 24       # empty-state, modal headers
  hover-color: "#d11a36"
  rest-color: "rgba(10,10,10,0.44)"

voice:
  attributes: [plainspoken, anti-hype, craft-proud, first-person, wry]
  cta-verbs: [Browse, Explore, Open, Read, Submit, Sign in, Join, Continue]
  forbidden-words:
    - revolutionary
    - cutting-edge
    - next-gen
    - seamless
    - leverage
    - delight
    - effortless
    - empower
    - unlock
    - amazing
    - welcome  # avoid as standalone greeting
  page-title: "{Section} — BASidekick"
  wiki-title: "{Article} — BASidekick Wiki"
  section-number: ".01"   # not "01 /" or "1." or "#1"
  status-tagline: "INDEPENDENT BAS TOOLKIT"  # mono uppercase tracked

accessibility:
  contrast:
    ink-on-sand: 19.6     # ✓ AAA
    ink-2-on-sand: 8.8    # ✓ AAA
    ink-3-on-sand: 4.7    # ✓ AA large, NOT for body < 12px
    punch-on-sand: 5.6    # ✓ AA body, AAA large
    cream-on-char: 18.2   # ✓ AAA
  focus-ring:
    color: "#d11a36"
    width: 2px
    offset: 2px
    style: solid
    never-removed: true
  min-tap-target: 44      # iOS guidance; mobile buttons + nav
  color-blindness-check: ["deuteranopia", "protanopia"]
  rule: "Never convey state with color alone — pair with label or icon."

og:
  size: { width: 1200, height: 630 }
  twitter-card: summary_large_image
  twitter-header: { width: 1500, height: 500 }
  square: { width: 1080, height: 1080 }
  runtime: app/opengraph-image.tsx
  static: public/brand/social-banner.svg
  manifest: app/manifest.ts
  app-icon: { width: 180, height: 180 }
  pwa-icons:
    - { size: 192, purpose: any }
    - { size: 512, purpose: any }
    - { size: 512, purpose: maskable }
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

## Motion

Motion is restraint. The page should feel like paper that occasionally lifts — never like a stage show.

### Duration scale

| Token | ms | Use |
|---|---|---|
| `instant` | 0 | State flips that should feel snappy (checkbox tick, tab switch) |
| `micro` | 80 | Focus-ring fade, ghost hover background |
| `fast` | 140 | **Default UI tween** — button hover, link color, border darkening |
| `base` | 200 | Card hover lift, dropdown open, popover fade |
| `slow` | 320 | Modal enter/exit, sliding panel |
| `long` | 600 | Hero schematic image crossfade |

`fast` (140ms) is the default. If you can't justify why a transition needs to be slower or faster than 140ms, it should be 140ms.

### Easing

| Token | Curve | Use |
|---|---|---|
| `standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default — any two-way state |
| `enter` | `cubic-bezier(0, 0, 0.2, 1)` | Things appearing |
| `exit` | `cubic-bezier(0.4, 0, 1, 1)` | Things leaving |
| `spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Gentle overshoot — rare, used by `HoverLift` wrapper |

### Animations in the system

- **`.bsk-hover-lift`** — 1px upward translate + shadow tier bump on hover. Wraps cards.
- **`.live-dot` / `.pulse-dot`** — 2.4s `bsk-pulse` keyframe (box-shadow ring expansion). Used on status indicators only.
- **Hero schematic image crossfade** — 600ms `ease` opacity transition between images.
- **`framer-motion`** (via `motion` package v12) — used sparingly: navbar mega-menu, mobile drawer, modal intercept. No scroll-triggered hijinks.

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

`live-dot` should switch to a static crimson disc (no pulse). Hover lifts should be opacity-only.

---

## Voice & Tone

The site reads like a working engineer's notebook: terse, plainspoken, slightly wry, never marketing-y.

### Attributes

- **Plainspoken.** Short sentences. Concrete nouns.
- **Anti-hype.** No "revolutionary", no "cutting-edge", no "AI-powered" unless that's literally what's being described.
- **Craft-proud, not boastful.** "Smaller, but still loved." Modesty + obvious care.
- **First-person where it earns it.** Rob signs his work. That's an asset.
- **Wry.** "A quiet place to talk shop." "No hot takes."

### CTA verb shortlist

`Browse · Explore · Open · Read · Submit · Sign in · Join · Continue · Start`

Pick from this list. Do not invent "Discover more!" or "Get started in seconds!" — they're tells.

### Micro-label conventions

- Section numbers: `.01`, `.02`, `.03` — leading decimal, mono, crimson digit, ink-3 label.
- Status taglines: `INDEPENDENT BAS TOOLKIT`, `SYS NOMINAL`, `FEED OK` — mono, uppercase, tracked `0.14–0.18em`.
- Timestamps: `UTC 18:57` (24-hour), `MAY 24, 2026` (mono short month), or relative (`2 minutes ago` — sentence case).
- Counts: `501 points indexed` (tabular numerals), not `500+ points!` or `over five hundred`.

### Forbidden words

Don't use these without a real reason: *revolutionary, cutting-edge, next-gen, seamless, leverage, delight, effortless, empower, unlock, amazing, welcome* (as standalone greeting).

### Do / Don't

| Do | Don't |
|---|---|
| "Browse the Atlas →" | "Discover our comprehensive equipment library!" |
| "501 points indexed" | "Over 500+ points available now" |
| "*built by a working engineer*" | "Industry-leading expertise" |
| "Pull up a chair →" | "Welcome to our community!" |
| "A quiet place to talk shop" | "Connect with industry leaders" |

### Italic discipline

Italic is a flavor, not a system. One italic phrase per heading, maximum. Reserve for:
- The single emphatic phrase in the H1 (`*"built by a working engineer"*`)
- Bylines (`*— Rob, Tucson*`)
- Pull quotes

Never italicize: nav links, CTAs, body paragraphs, mono labels, the wordmark.

---

## Iconography

**One library only: [Phosphor Icons](https://phosphoricons.com)** (`@phosphor-icons/react`). Mixing icon families breaks the visual rhythm.

### Weights

- **`regular`** — default for all UI.
- **`bold`** — emphasis: section header icons, primary CTA icons, the X on modals.
- **Forbidden:** `thin`, `light`, `fill`, `duotone`. They don't sit alongside Archivo's geometric character.

### Sizes (tracked to type scale)

| Token | px | Use |
|---|---|---|
| `xs` | 12 | Inline with `--text-xs` |
| `sm` | 14 | Inline with body text, mono labels |
| `md` | 16 | **Default UI** — buttons, nav, form fields |
| `lg` | 20 | Section headers, primary CTAs |
| `xl` | 24 | Empty-state placeholders, modal headers |

### Color rules

- Rest: `--ink-3` (rgba(10,10,10,0.44))
- Hover: `--punch`
- Active / brand action: `--punch`
- Inverse surfaces: `--cream-2` rest, `--cream` hover

### `BrandMark` is not an icon

Don't use `<BrandMark />` as a list bullet, a button affordance, or inline next to body text. It's the logo. Use a Phosphor icon instead.

---

## Forms

Forms are stacked, ragged-right, label-above-input. No floating labels, no inline labels, no placeholder-as-label.

### Anatomy

```
┌─ FIELD LABEL (mono, 11px, 0.18em tracked, uppercase, ink-3)
├─ <input> (15px sans, ink, --rad, border --sand-line, focus → --ink border)
├─ Help text (12.5px sans, ink-3) — only when there's something to clarify
└─ Error message (12.5px sans, destructive #b91d34, with required icon)
```

### Rules

- **Label is mandatory.** Even when "obvious." Screen-readers don't see "obvious."
- **Help text is optional.** Add only when it prevents an error.
- **Errors replace help text** in the same slot, with a small icon.
- **Disabled state** uses `--ink-4` (rgba 0.22) for label + value; cursor `not-allowed`.
- **Required mark** is a small `*` in `--punch` next to the label, not "(required)" in copy.
- **Field grouping** uses `--space-3` (24px) between fields, `--space-4` (40px) between groups.
- **Submit button** is `.btn-primary` (ink, not punch) unless this is a primary marketing CTA.

### Search field

`.nw-search` is the canonical pattern — bordered, italic placeholder, ink-focus border, mono kbd hint on the right.

---

## State patterns

Every data-driven surface needs four states: **resting**, **loading**, **empty**, **error**. Document each before shipping.

### Loading — skeleton

```
background: var(--sand-2);
border-radius: var(--rad-sm);
animation: bsk-shimmer 1.4s ease-in-out infinite;
```

Skeleton blocks should mirror the resting-state layout, not be a generic spinner. Use a spinner only for inline button-level loading (`.btn` with a 14px spinner) or after >2s when a skeleton would mislead.

### Empty

Centered, vertical:

1. Phosphor icon (24px, `--ink-4`)
2. Title (17px sans, semibold)
3. One-sentence body (13px sans, `--ink-3`)
4. Optional CTA (`.btn-outline`)

Copy template: *"No \[things\] yet."* + actionable second line ("Be the first to contribute →"). Do **not** apologize or use sad-tone phrasing.

### Error

Centered, same vertical structure as empty, but:
- Icon color: `--destructive` (#b91d34)
- Title: "Something broke" / "Couldn't load \[thing\]" (specific > generic)
- Body: brief reason, then "Try again →" link
- Optional `<details>` for technical detail (collapsed by default, mono font)

### Success / toast

Use `sonner` (already wired in [app/layout.tsx](app/layout.tsx)). Default position: bottom-right desktop, bottom-center mobile. Duration: 4000ms. Never use a toast for an error that requires the user's attention — use an inline error or modal.

---

## Tables / data rows

The site is data-heavy: Atlas points, wiki articles, PointStack threads, news entries. They all use a row-based pattern, not a `<table>` element (except for tabular reference data).

### Anatomy (`.thread-list` / `.atlas-row`)

```
| avatar | kind  | timestamp | title + meta                  | stat |
| 36px   | 80px  | 60px      | flex 1                        | 60px |
```

- **Avatar** (`.avatar`) — 36px circle, mono initials on `--sand-2`.
- **Kind** — `.badge` variant (punch-soft for questions, default for projects, outline for jobs).
- **Timestamp** — mono 11px, `--ink-3`, 24-hour UTC.
- **Title + meta** — title in sans 15px, `--ink`; meta below in sans 12px, `--ink-3` with `tabular-nums` on counts.
- **Stat** — right-aligned numeric (replies, views) in mono `tabular-nums`.

### Hover

Whole row gets `background: rgba(10,10,10,0.025)`. No transform, no shadow — rows are flat. Title color shifts to `--punch` via `group-hover:text-punch`.

### Tabular numerics

Always use `tabular-nums` for any column that can be visually scanned (counts, prices, timestamps, durations):

```css
.tabular-nums {
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}
```

### When to use a real `<table>`

For reference data that must align in columns and may be exported (point-naming standards, equipment specs, API responses). Otherwise use the row pattern — it's more flexible for responsive layouts.

---

## Schematic system

The technical-drawing motifs are a reusable visual system, not one-off hero decoration.

### Components

- **Status strip (`.strip`)** — 32px char-bar, mono UTC + build version + crimson live dot. Site-wide, top of `<body>`.
- **Drawing stamp** — mono header inside dark panels: `DRAWING [id] · REV [n] · SHEET [n / total] · ● LIVE`. Used on hero schematic, atlas specimen, and PointStack featured cards.
- **Corner brackets** — 22px L-shapes in `--punch`, 1.5px stroke, on the four corners of the hero schematic viewport. **Never** apply to other elements.
- **Section numbers** — `.01`, `.02`, `.03` — mono, leading decimal, crimson digit, ink-3 label, `0.22em` tracking.
- **Field rows (`.title-block .field`)** — `LABEL` (mono, ink-3) + `VALUE` (sans, ink). Pipe-separated visually with `border-left: 1px solid var(--sand-line)`.

### Voice in stamps

Drawing IDs follow `M-23-700` format (prefix, year-prefix, sequence). Never use random alphanumeric. The prefix letter encodes type: M = mechanical, E = electrical, P = piping, A = architectural.

### Don't extend

The "specimen" language is permitted **only** on the Atlas "today's specimen" card. Do not generalize to "Specimen of the week" / "Featured specimen" elsewhere.

---

## Dark surfaces

The site is paper. Dark surfaces are panels embedded in paper — not a full dark mode.

### When to flip

Use `.char-section` (`--char` background) for:
- The status strip at the top of every page.
- The hero schematic header strip.
- Specimen / featured cards that warrant a museum-label treatment.
- Block-quote "specimen of \[topic\]" callouts in long-form articles.

Do **not** use it for: full pages, primary cards, hover states, modals.

### Token flipping

Inside `.char-section`, tokens automatically swap:
- `--background` reads as `--char`
- Text reads as `--cream` hierarchy
- Borders read as `--char-line` / `--char-line-2`
- `.btn-primary` flips to cream-on-char
- Badges flip via `.char-section .badge-*` overrides

The `--ochre-2` / `--moss-2` lighter variants exist for badges on dark surfaces — use them automatically when inside `.char-section`.

### Full dark mode

Not enabled. The `@custom-variant dark` directive exists in [app/globals.css](app/globals.css) for future use, but no `.dark` overrides ship today. If the site adds full dark mode later, the existing `--char-*` / `--cream-*` tokens are the foundation.

---

## Accessibility

### Contrast

| Foreground | Background | Ratio | Verdict |
|---|---|---|---|
| `--ink` (#0a0a0a) | `--sand` (#fafaf8) | 19.6:1 | ✅ AAA |
| `--ink-2` (rgba 0.64) | `--sand` | 8.8:1 | ✅ AAA |
| `--ink-3` (rgba 0.44) | `--sand` | 4.7:1 | ✅ AA large only — **do not use below 12px** |
| `--ink-4` (rgba 0.22) | `--sand` | 2.1:1 | Decorative only — never carry meaning |
| `--punch` (#d11a36) | `--sand` | 5.6:1 | ✅ AA body, AAA large |
| `--cream` (#f5f5f5) | `--char` (#0d0d0d) | 18.2:1 | ✅ AAA |
| `--cream-2` (rgba 0.66) | `--char` | 12.0:1 | ✅ AAA |
| `--cream-3` (rgba 0.44) | `--char` | 8.0:1 | ✅ AAA |

### Focus ring

Always visible. Always `--ring` (`--punch`). 2px solid, 2px offset. **Never removed.** If a focus ring clashes with a design, the design is wrong.

```css
*:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

### Touch targets

Minimum 44×44px for any tappable element on mobile (iOS guidance, used as floor). Buttons under that size live only in dense desktop UI (e.g., 30px `.btn-sm` pills in the wiki filter bar).

### Keyboard

- Every interactive element reachable via Tab.
- `cmd-K` opens the global command palette ([components/command-menu.tsx](components/command-menu.tsx)).
- Nav megamenu opens on click (not hover) — keyboard-friendly, no race conditions.
- Modal traps focus, restores it on close.
- `Esc` closes modals, popovers, mobile drawer.

### Color-blindness

Crimson on cream + ink base reads correctly for the most common conditions (deuteranopia, protanopia). **Never convey state with color alone** — always pair with a label, an icon, or position.

### Reduced motion

Honor `prefers-reduced-motion: reduce`. Live dots stop pulsing. Hover lifts become opacity-only. Page transitions become instant.

---

## Open Graph & social

### Runtime images

| File | Output | Purpose |
|---|---|---|
| [app/opengraph-image.tsx](app/opengraph-image.tsx) | 1200×630 PNG | Default OG image, used when a page doesn't set its own |
| [app/twitter-image.tsx](app/twitter-image.tsx) | 1200×630 PNG | Default Twitter card image |
| [app/icon.svg](app/icon.svg) | 32×32 favicon | Browser tab |
| [app/apple-icon.tsx](app/apple-icon.tsx) | 180×180 PNG | iOS home-screen icon |
| [app/manifest.ts](app/manifest.ts) | webmanifest | PWA icon set, name, theme color |

Per-page OG images override the default via `metadata.openGraph.images` in a `page.tsx` `generateMetadata`. The runtime route is canonical because OG crawlers always rasterize from it — if the SVG mockup in `public/brand/` diverges, fix the SVG, not the runtime.

### Static mockups

| File | Size | Use |
|---|---|---|
| `public/brand/social-banner.svg` | 1200×630 | OG/Twitter card mockup; mirrors runtime |
| `public/brand/social-square.svg` | 1080×1080 | Instagram, LinkedIn square posts |
| `public/brand/social-twitter-header.svg` | 1500×500 | X / Twitter banner |
| `public/brand/social-twitter-header.png` | 1500×500 | Same, rasterized for upload |
| `public/brand/wordmark-light.svg` | 480×80 | JSON-LD `logo`, email signatures, light lockups |
| `public/brand/wordmark-dark.svg` | 480×80 | Dark-surface lockups |
| `public/brand/avatar-light.svg` | 400×400 | Profile avatar (light context) |
| `public/brand/avatar-dark.svg` | 400×400 | Profile avatar (dark context) |
| `public/brand/brandmark.svg` | 32×18 native | Standalone mark (no wordmark), any size |
| `public/brand/brandmark-mono.svg` | 32×18 native | Single-color print/email — ink only |
| `public/brand/brandmark-maskable.svg` | 512×512 | PWA maskable icon (40% safe zone) |

### OG image anatomy

```
┌──────────────────────────────────────────┐
│ ● SYS NOMINAL · INDEPENDENT BAS TOOLKIT  │ ← status strip
│                                          │
│ .01 BASIDEKICK                           │ ← section number
│                                          │
│ {Headline — Archivo Black 62px}          │
│ {italic emphasis in crimson}             │
│                                          │
│ ─────────────────────────────────────    │ ← hairline
│ BASIDEKICK · basidekick.com    ATLAS · …  │ ← footer meta
└──────────────────────────────────────────┘
```

### JSON-LD

Org + WebSite types ship from [app/layout.tsx](app/layout.tsx). For wiki articles, add `Article` schema with `headline`, `datePublished`, `dateModified`, `author`. For atlas entries, add `DefinedTerm` with `inDefinedTermSet` pointing to the atlas hub.

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
- ❌ **Don't transition slower than 200ms** for default UI state changes. The site should feel paper-quick.
- ❌ **Don't use `placeholder` as a label.** Labels above inputs, every time.
- ❌ **Don't write a generic "Welcome!" greeting.** Lead with what's actually there.
- ❌ **Don't ship a UI surface without all four states** (resting, loading, empty, error). Skeletons mirror layout, not generic spinners.
- ❌ **Don't pair Phosphor with another icon library** (Lucide, Heroicons, FontAwesome). Pick a lane.
- ❌ **Don't use `BrandMark` as an inline icon** — it's the logo.
- ❌ **Don't extend the "specimen" metaphor** beyond the Atlas Today's Specimen card.
- ❌ **Don't remove the focus ring.** Ever. If it clashes, redesign the surface.
- ❌ **Don't convey state with color alone.** Pair with a label or icon for color-blind users.
