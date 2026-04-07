# BASidekick visual redesign

**Status:** in progress — palette section drafted, other sections to follow
**Started:** 2026-04-07
**Goal:** Make basidekick.com read as a site a person built, not a site a model generated. Replace the current shadcn-default lime-on-black template with a single, considered, light palette and a more editorial visual language.

---

## 1. Color palette

### 1.1 Direction

**D1 · Sage & Ochre** — a warm cream background, deep forest text, and a soft mustard accent that appears only at points of intentional emphasis.

The palette is **light only**. The existing dark mode (lime on near-black) is being removed entirely, not deferred. A site with a strong identity picks a side; carrying two palettes is its own form of generic.

The forest is the workhorse — it sets text, headings, primary buttons, and most borders. The mustard is reserved for **"look here" moments**: a `NEW` badge on a recent wiki article, a `LIVE` dot on the news feed, the highlighted word in the hero headline, the active state in the nav. Forest does the talking; mustard is a finger pointing at one thing at a time.

### 1.2 Core tokens

| Token | Hex | Role |
| --- | --- | --- |
| `--background` | `#f1efe6` | Page background — warm sage cream |
| `--foreground` | `#1f2920` | Body text, headings — deep forest |
| `--card` | `#fbfaf5` | Card surfaces (slightly lighter than the page so cards lift) |
| `--card-foreground` | `#1f2920` | Text on cards |
| `--popover` | `#fbfaf5` | Popovers, dropdowns |
| `--popover-foreground` | `#1f2920` | Text in popovers |
| `--primary` | `#1f2920` | Primary buttons, primary links — **forest, not mustard** |
| `--primary-foreground` | `#f1efe6` | Text on primary buttons |
| `--secondary` | `#e2e3d3` | Secondary surfaces, eyebrow chips, stat backgrounds |
| `--secondary-foreground` | `#1f2920` | Text on secondary surfaces |
| `--muted` | `#e2e3d3` | Muted surfaces (same as secondary) |
| `--muted-foreground` | `#5e6b58` | Body-secondary, captions, timestamps — sage gray |
| `--accent` | `#c08621` | **Mustard** — used only for highlight moments (see § 1.3) |
| `--accent-foreground` | `#1f2920` | Text on mustard surfaces |
| `--destructive` | `#8b2914` | Destructive actions, error states — deep brick (replaces the existing bright orange-red) |
| `--destructive-foreground` | `#f1efe6` | Text on destructive |
| `--border` | `#d8d9c5` | Default 1px borders |
| `--input` | `#d8d9c5` | Form input borders |
| `--ring` | `#c08621` | Focus ring — mustard (the one place mustard is *guaranteed* to appear) |
| `--radius` | `0.5rem` | Unchanged from current |

### 1.3 Where mustard is allowed to appear

A short list. If something isn't on this list, it should be forest, sage, or unstyled.

1. **Focus rings** (`--ring`) — keyboard accessibility, always.
2. **The hero headline highlight word** — replaces the current lime gradient text. Solid color, not a gradient.
3. **`NEW` badge** on wiki articles published within the last N days.
4. **`LIVE` indicator** on the news feed when the curation script has run recently.
5. **Active nav item** — the one route the user is currently on.
6. **Inline link hover** — body-copy links are forest by default; hover transitions to mustard. (This is a small deviation from the strict "highlight only" rule and can be reconsidered later.)
7. **The "01 / 02 / 03" section numerals** if we adopt numbered sections (TBD in § 3 / layout).

Mustard is **not** allowed on:
- Buttons (forest only — except destructive, which uses brick)
- Card borders or backgrounds
- Icons by default
- Any decorative gradient, glow, or radial effect
- Charts (charts get their own scale — see § 1.5)

### 1.4 Wiki category colors

**Eliminated.** The existing 7-category rainbow (`--wiki-networking`, `--wiki-programming`, `--wiki-standards`, `--wiki-commissioning`, `--wiki-cybersecurity`, `--wiki-troubleshooting`, `--wiki-best-practices`) is removed entirely.

Categories are still named and filterable, but they're differentiated **structurally**, not chromatically:

- A small **single-letter glyph** in a `--secondary` square (e.g., `N` for Network, `P` for Programming, `S` for Standards), set in the mono font
- A small **uppercase mono category label** above the article title in `--muted-foreground`

This means:
- Wiki article cards no longer carry a colored badge
- The wiki index page feels more like a table of contents than a tag cloud
- Category filters in the sidebar use checkmarks/text only, not color swatches
- Color-by-scanning is intentionally lost. Filtering still works through the filter UI.

> **Note for review:** I picked single-letter glyphs because they're typographic and consistent with the editorial direction. If two categories collide (e.g., `Standards` and `Security`), they'll need different letters or two-letter abbreviations (`Std` / `Sec`). I'll handle this when I rebuild the wiki views.

### 1.5 Chart colors

> **Decided inline — please review:** The current `--chart-1` through `--chart-5` are five shades of lime. Replacing them with five shades of forest would be monotonous and bad for any chart with more than two series.
>
> Proposal: a **5-step warm scale** that walks from forest through sage through mustard, giving any chart a cohesive feel without leaving the palette.

| Token | Hex | Notes |
| --- | --- | --- |
| `--chart-1` | `#1f2920` | Forest |
| `--chart-2` | `#5e6b58` | Sage gray |
| `--chart-3` | `#9a7a3a` | Bronze (forest + mustard midpoint) |
| `--chart-4` | `#c08621` | Mustard |
| `--chart-5` | `#a3530c` | Burnt sienna (only used when a 5th series is needed) |

If you only ever show 1–2 series, use `--chart-1` and `--chart-4`. Don't reach for chart-5 unless you need it.

### 1.6 Border treatment

> **Decided inline — please review:** Current treatment is `1px solid var(--border)` everywhere on `rounded-xl` corners. This is shadcn-default and contributes to the "AI template" feel.
>
> Proposal:
>
> - Keep 1px borders on cards and inputs — they're working.
> - **Reduce overall radius** from `rounded-xl` (12px) to `rounded-md` (6px) for cards. Sharper corners read as more deliberate.
> - **Drop borders entirely on hero/section blocks.** Section separation comes from background tint shifts (`--background` → `--secondary`), not lines.
> - **Keep one section per page that breaks the rule** — see § 3 / layout.

### 1.7 Migration mapping

When the implementation step happens, the existing CSS variables in `app/globals.css` map as follows. This is a token-only swap; no component class names need to change for the palette to land.

| Old (dark, current default) | New |
| --- | --- |
| `--background: #0A0A0A` | `#f1efe6` |
| `--foreground: #FFFFFF` | `#1f2920` |
| `--card: #18181B` | `#fbfaf5` |
| `--primary: #C4F82A` | `#1f2920` |
| `--secondary: #18181B` | `#e2e3d3` |
| `--muted: #27272A` | `#e2e3d3` |
| `--muted-foreground: #A1A1AA` | `#5e6b58` |
| `--accent: #27272A` | `#c08621` |
| `--destructive: #FA541C` | `#8b2914` |
| `--border: #27272A` | `#d8d9c5` |
| `--ring: #C4F82A` | `#c08621` |
| `--chart-1` … `--chart-5` (lime ramp) | see § 1.5 |
| `--wiki-*` (7 colors) | **deleted** |

The `:root` (light) block in `globals.css` is replaced wholesale; the `.dark` block is **deleted**. The `dark` class can stay as a no-op selector for now to avoid breaking the theme toggle component, but the toggle itself will be removed in a later step.

The `gradient-text`, `gradient-glow`, and `card-hover-lift` classes will be revisited in § 2 / typography and § 3 / layout — they may not survive.

---

## 2. Typography

### 2.1 Direction

The current stack — **Space Grotesk + Manrope + Space Mono** — is one of the top-five most-used pairings on tech landing pages. Both Space Grotesk and Manrope are competent geometric sans faces with no opinion. They're a major part of why the site reads as templated.

The new direction: **a serif heading face with personality, a kept-as-is sans body, and a more neutral mono.** Tech sites almost never use serif headlines, so doing it intentionally — and committing to one with character — stamps the site as *designed*, not *generated*.

### 2.2 The faces

| Role | Face | Why |
| --- | --- | --- |
| Heading | **Fraunces** | A variable serif with three axes (weight, optical size, *softness*). Has visible personality without being precious. Italics are particularly nice and we use them for the hero highlight word. Free, on Google Fonts. |
| Body | **Manrope** | Unchanged from current. Pairs cleanly with Fraunces and switching two faces at once is risky. We'll revisit if it feels wrong after a round of mockups. |
| Mono | **JetBrains Mono** | Replaces Space Mono. Space Mono was specifically designed to pair with Space Grotesk; it no longer makes sense once the heading face changes. JetBrains Mono is neutral, well-hinted, and reads cleanly at small sizes for the eyebrow labels and code blocks. Free, on Google Fonts. |

`app/layout.tsx:2` will change from:

```ts
import { Space_Grotesk, Manrope, Space_Mono } from "next/font/google";
```

to:

```ts
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
```

Variable names (`spaceGrotesk` → `fraunces`, `spaceMono` → `jetbrainsMono`) and the CSS variables (`--font-heading`, `--font-sans`, `--font-mono`) stay the same so component class names don't have to change.

### 2.3 The hero highlight treatment

Instead of the current `gradient-text` class (a lime gradient applied via `-webkit-background-clip`), the highlighted word in the hero is set in **Fraunces italic at a slightly lighter weight** and colored solid mustard (`--accent`).

The contrast between the upright serif of the rest of the headline and the italic of the highlight word is the entire visual idea. No gradients, no glows, no animated underlines.

```html
<h1>BAS info, community, and resources —
  <em>collected from next to the industry</em>, not from inside it.
</h1>
```

```css
h1 em {
  font-style: italic;
  font-weight: 500;        /* lighter than the surrounding 600 */
  color: var(--accent);
  font-feature-settings: "ss01"; /* if Fraunces has a swashier alt for italics */
}
```

The `gradient-text` and `gradient-glow` classes in `app/globals.css` are **deleted**.

### 2.4 Type scale

> **Decided inline — please review.** These are deliberately a touch smaller than the current hero (which is `text-[56px]` at the top breakpoint). Serif headlines work best with a little restraint — Fraunces at 44px reads bigger than Space Grotesk at 56px because the letterforms have more presence per em.

| Use | Size (desktop) | Weight | Line height | Notes |
| --- | --- | --- | --- | --- |
| Hero headline (h1) | `text-[44px]` (mobile: `text-[34px]`) | Fraunces 600 | 1.05 | Set with `tracking-tight` (-0.01em) |
| Section heading (h2) | `text-[28px]` | Fraunces 600 | 1.15 | Replaces current `text-2xl md:text-3xl` |
| Card title (h3) | `text-[16px]` | Fraunces 600 | 1.35 | Used on wiki cards, news cards, atlas cards |
| Sub-title / lede | `text-[17px]` | Manrope 400 | 1.55 | Color: `var(--muted-foreground)` |
| Body | `text-[15px]` | Manrope 400 | 1.6 | Slightly larger than current `text-sm` (14px) for readability |
| Body small | `text-[13px]` | Manrope 400 | 1.5 | Captions, footer, meta strips |
| Eyebrow / label | `text-[10px]` | JetBrains Mono 500 | 1.2 | Uppercase, `tracking: 1.4px`. Used sparingly — see § 2.5. |
| Stat number | `text-[28px]` | Fraunces 600 | 1 | Uses **tabular figures** (`font-feature-settings: "tnum"`) so columns of numbers line up |
| Code | `text-[13px]` | JetBrains Mono 400 | 1.5 | Inline and block |

### 2.5 The eyebrow rule

The current site uses the mono-uppercase eyebrow treatment (`font-mono uppercase tracking-[2px] text-[12px]`) on **every** section: `WIKI`, `NEWS`, `OPEN SOURCE`, `BAS ATLAS`, `EXPLORE`, etc. Repeating it four times on the homepage is a major reason the page reads as patterned.

New rule: **eyebrows appear at most once per page**, and only when they're functionally necessary (e.g., on the wiki article header to label the category). Section headings on the homepage are just headings — no eyebrow above them.

The `SiteBadge` component in `components/site-badge.tsx` is removed from homepage sections. It can stay in the codebase for use in deeper pages but it should not appear on `app/(main)/page.tsx`.

### 2.6 Tracking and rhythm

| Element | Tracking | Notes |
| --- | --- | --- |
| Fraunces headlines | `-0.01em` to `-0.015em` | Tight, but not as tight as the current `tracking-tight` (-0.025em) which is too aggressive for a serif |
| Manrope body | `0` (default) | |
| JetBrains Mono labels | `+0.1em` (uppercase) / `0` (lowercase) | |
| Manrope buttons | `0` | |

### 2.7 Numerals

Fraunces, Manrope, and JetBrains Mono all have **tabular figures**. Anywhere numbers appear in a column or change frequently — stats, tables, code line numbers, timestamps — they should use `font-feature-settings: "tnum"` to prevent layout jitter.

A small utility class:

```css
.tabular-nums { font-feature-settings: "tnum"; font-variant-numeric: tabular-nums; }
```

### 2.8 What gets deleted

- `gradient-text` class
- `gradient-glow` class
- The `font-mono uppercase tracking-[2px]` eyebrow treatment on homepage section headings
- The `text-[12px] font-bold` muted footer category labels (they become regular `text-[13px]` Manrope)
- All hard-coded `text-4xl md:text-5xl lg:text-[56px]` hero sizes — replaced with the table in § 2.4

## 3. Layout & section rhythm

### 3.1 Composition rules (apply everywhere)

Five rules that the current site breaks and the new design follows:

1. **No centered marketing heroes.** Hero text is left-aligned, not centered. Centered heroes with two CTAs are the SaaS-template default and the most recognizable AI-template tell on the web. Every page header in the new design uses left-aligned content inside a constrained max-width container.
2. **No SiteBadge eyebrows on every section.** The current homepage uses the `font-mono uppercase tracking-[2px]` eyebrow pattern four times (`WIKI`, `NEWS`, `OPEN SOURCE`, `BAS ATLAS`). The repetition is what makes the page read as patterned. New rule: **at most one mono eyebrow per page**, and it lives in the title block strip (§3.5), not in section headings.
3. **Asymmetric grids.** The current homepage is built almost entirely on symmetric 2- and 3-column grids. The new homepage breaks this — the Atlas specimen card is asymmetric (left text + right field grid with a vertical divider), the PointStack section uses a 1+2 split (headline left, body+stats right), the colophon uses a 3-column grid with uneven widths.
4. **Section numbering.** Every major section on a long page gets a numbered prefix in the form `01 / Section Name`, with the number rendered in mustard JetBrains Mono and the name in Fraunces. Numbers run sequentially within a page. This is a direct echo of the schematic vocabulary — engineering drawings always number their figures.
5. **One section per page is allowed to break the rhythm.** If every section uses the same scaffold, the page reads as templated. Pick one section per long page that visually deviates — the homepage's Atlas specimen does this (it's the only section with a card-with-internal-divider), the Atlas page's reactive search does this (it's the only "input as hero" treatment).

### 3.2 Homepage structure

Top to bottom:

```
┌──────────────────────────────────────────────────────────────────┐
│  NAV (slim, italic Fraunces brand, links right, mustard active)  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  HERO / MANIFESTO                                                │
│    · Pulse line — animated mustard dot + mono "what's new"       │
│    · h1 in Fraunces 50px, italic mustard highlight word          │
│    · Lede in Manrope 18px                                        │
│    · "— Rob, Tucson" signoff in italic Fraunces            │
│    · Faded control schematic at 12% opacity behind, right-aligned│
│    · Left-side cream gradient mask so text reads cleanly         │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  01 / ATLAS, TODAY                                               │
│    · Background: secondary cream (#e8e6d8) with 1px borders      │
│    · h2 in Fraunces 34px                                         │
│    · Sub line in Manrope 16px                                    │
│    · SPECIMEN CARD: hand-picked entry with a vertical-divider    │
│      2-column layout (left = name + aliases + desc,              │
│      right = field grid with type, haystack, brick, etc)         │
│    · Action row: forest "Browse Atlas →" button,                 │
│      "Suggest a point" secondary, italic "Featured manually ·    │
│      changes weekly" caption on the right                        │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  02 / POINTSTACK                                                 │
│    · Background: page background (no contrast)                   │
│    · 1+2 split: italic headline left, body + stats right         │
│    · ps-feed: 3-column row of recent posts (question / project / │
│      job) — each card with mono kind-label, Fraunces title,      │
│      author handle + time + reply count                          │
│    · "Join the community →" line at the bottom with a hairline   │
│      rule that runs across the section                           │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ALSO HERE. SMALLER, BUT STILL LOVED.                            │
│    · Background: secondary cream                                 │
│    · 3-column grid: 03 Wiki / 04 News / 05 Open Source           │
│    · Each item: numbered prefix, Fraunces title, sage paragraph, │
│      forest text link with a 1px underline that goes mustard on  │
│      hover                                                       │
│    · Items separated only by hairline rules above each one       │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  COLOPHON (3-col mono: who built it / open source / last update) │
└──────────────────────────────────────────────────────────────────┘
```

**Key decisions:**

- The Atlas specimen card is **the showcase**. PointStack/Wiki/News/Open Source are demoted to numbered items in the "Also here" row. This is the manifesto direction (§3 Statement of Intent we discussed during brainstorm) — Atlas is the one big featured thing, everything else is small but still loved.
- The pulse line at the top of the hero is the only "live data" surface on the homepage. It includes wiki count, atlas count, PointStack post count — three integers, comma-separated, in mono. The pulsing mustard dot to its left animates a soft radial pulse.
- The "— Rob, Tucson" signoff is **load-bearing**. It's the single biggest "evidence of a human" element on the homepage. Do not cut it. If the location ever changes (Rob moves), update it; do not depersonalize it.

### 3.3 Reference / list pages (Atlas pattern)

The Atlas page is the **canonical pattern** for any list-of-things page on the site. Wiki, PointStack, News, and Open Source all inherit from this structure with minor per-page adjustments.

```
┌──────────────────────────────────────────────────────────────────┐
│  NAV (active route highlighted in mustard)                       │
├──────────────────────────────────────────────────────────────────┤
│  TITLE BLOCK STRIP (see §3.5)                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SEARCH AREA                                                     │
│    · Single italic Fraunces tagline above the input              │
│      ("A reference of points, equipment, and the names…")       │
│    · BIG search input — 1.5px forest border, cream fill,         │
│      Fraunces 22px text, mono ⌕ glyph on the left,               │
│      italic placeholder, focus ring goes mustard                 │
│    · SCOPE CHIPS row: "Showing All / Points / Equipment /        │
│      Brands" with mono labels and mustard counts;                │
│      live "X shown" results counter on the right                 │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BROWSE                                                          │
│    · Grouped collapsible sections with numbered headers          │
│      (01 / Temperature, 02 / Pressure, 03 / Flow, …)             │
│    · Each row: 280px name (Fraunces) + flex aliases              │
│      (JetBrains Mono) + 220px right-aligned meta                 │
│    · Rows are clickable; click opens the modal (§3.4)            │
│    · Empty state: italic Fraunces ⌕ glyph + helpful message      │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FOOTER ROW (3-col, lettered headers)                            │
│    A / Recently added                                            │
│    B / Popular this week                                         │
│    C / Contribute                                                │
│                                                                  │
│  COLOPHON (per-page identity: "Curated by Rob Hansen /          │
│            Collected from next to the industry")                 │
└──────────────────────────────────────────────────────────────────┘
```

**Reactive search rules:**

- Filter is **client-side, instant, no debounce.** Type → see results.
- Match against name, aliases, and any indexed metadata (haystack tags, equipment types, vendor names).
- When the query is non-empty, **all collapsed groups expand automatically** so matches inside them become visible.
- Groups with zero matching rows are **hidden entirely**, not shown empty.
- The "X shown" counter on the right of the chips row updates live.
- An italic Fraunces empty state appears when nothing matches. Copy: *"Nothing matches that. Try a different alias, vendor name, or part of the description."*
- The scope chips (`Points / Equipment / Brands`) **filter the same view**, they do not navigate to separate pages. URL state lives in `?scope=points` etc.

**Per-page inheritance notes:**

| Page | Browse content | Detail pattern (§3.4) | Footer-row columns |
| --- | --- | --- | --- |
| **Atlas** | Grouped points by type (Temperature, Pressure, Flow…) + equipment scope | **Modal** — drawing-styled point/equipment detail (compact, datasheet shape) | Recently added / Popular / Contribute |
| **Wiki** | Grouped articles by topic (Networking, Programming, Standards…) using the mono+glyph treatment from §1.4 | **Full page** — long-form article body + discussion (long content, discussion-heavy) | Recently published / Most read / Contribute |
| **PointStack** | Grouped posts by kind (Questions, Projects, Jobs, People, Resources). Questions and projects are the primary feed. Jobs and Resources are separate scopes within the same page. | **Full page** — post body + threaded discussion + reply form (long content, discussion-heavy) | Trending / New members / Open jobs |
| **News** | Chronological feed grouped by date (This week / Last week / This month) — each row shows source favicon + title + snippet + tags | **Full page (summary + link-out)** — short editorial summary + "Read original" callout + discussion. BASidekick does not host the full article. | This week / Sources we follow / Submit |
| **Open Source** | **Card grid** of crates and tools — no search input, too few items to warrant one. The title block strip stays. | **Full page** — crate detail with README, docs link, GitHub link, usage examples | Latest releases / Contributing / Sponsor |

The principle: **the title block strip is universal, the search area is universal for any page with > 20 items, the browse layout adapts to the data shape, and the footer row + colophon are universal.**

### 3.4 Detail pattern — modals for reference, pages for long-form

When a user clicks an item on any reference/list page, they either see a **modal** or navigate to a **full page** depending on the shape of the content. There is **one rule** that decides which:

> **Modals for compact reference data with predictable shape. Pages for long-form content with discussions.**

- **Atlas entries** → modal. Each entry is a structured datasheet: ~5–8 fields, ~150 words, known size. The modal flatters the data by making it feel like flipping through a binder of drawings.
- **Wiki articles, PointStack posts, News items** → full pages. The content is variable-length prose + discussion threads + comment forms. Trying to fit that inside a modal fights the content.

**Both patterns use the same intercepting-routes infrastructure.** For Atlas, `/atlas/[id]` renders as a modal overlay when navigating from `/atlas`, and as a standalone page when visited directly — the same component in two render contexts. For Wiki/PointStack/News, there is no intercepting `@modal` route; clicking always navigates to the full page. Both patterns produce **stable, indexable, shareable URLs.**

#### 3.4.1 Modal pattern — Atlas (compact reference data)

The intercepting-route files already exist (`app/(main)/atlas/@modal/(.)[id]/page.tsx`). The new modal content looks like this:

```
┌──────────────────────────────────────────────────────────────┐
│  MODAL TITLE BLOCK STRIP (mini, ~36px tall)                  │
│  DRAWING / SHEET 001 OF 847 / REV / DRAWN BY R.H.   [×]      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Discharge Air Temperature                  ← Fraunces 36px  │
│  DAT · DA-T · SAT · SaTemp · DischrgAirTmp   ← mono aliases  │
│                                                              │
│  Plain prose description (Manrope 15px, max-width)           │
│                                                              │
│  ──────────────────────────────────                          │
│  Type        Analog input · °F                               │
│  Haystack    [discharge] [air] [temp] [sensor] [point]       │
│  Brick       brick:Discharge_Air_Temperature_Sensor          │
│  Found on    AHU · RTU · VAV · FCU · MAU                     │
│  Aliases     17 known variants across 23 vendors             │
│  ──────────────────────────────────                          │
│                                                              │
│  [Suggest an edit]              URL · basidekick.com/atlas/dat │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Modal behavior:**

- **Backdrop**: 55% forest with a slight backdrop-blur, cream card centered with max-width 880px, max-height `calc(100vh - 80px)` and scrollable inside.
- **Mini title block strip** at the top — same field structure as the page-level strip, but per-entry (`SHEET 001 OF 847`, etc).
- **Close button** is a 24px square with a 1px forest border in the top-right of the title block. Hover inverts (forest fill, cream `×`).
- **Esc closes the modal.** Clicking the backdrop closes the modal. Clicking the modal itself doesn't.
- **The URL hint** at the bottom (`URL · basidekick.com/atlas/dat`) tells users this view has a real, copyable URL. This is the only "full page" affordance — there is no separate "Open full page" button. The URL is the share surface.
- **The modal IS the canonical view.** If someone visits `/atlas/dat` directly (from a link or a search result), the same component renders as a standalone page without the Atlas list behind it. One component, two render contexts.
- **Action row** has only one button by default: "Suggest an edit". The drawing strip + URL hint do all the metadata work.

The **specimen field grid** (the bracketed Type/Haystack/Brick/etc. block) is the same pattern as the homepage's "Atlas, today" specimen card, just larger and inside the modal. It's bracketed by 1px forest rules top and bottom — a small visual reference to the way schematic title blocks are bracketed by their borders.

#### 3.4.2 Full-page pattern — Wiki articles & PointStack posts (long-form content)

For long-form content with discussions, clicking an item navigates to a full page:

```
┌──────────────────────────────────────────────────────────────┐
│  NAV                                                         │
│  TITLE BLOCK STRIP (per-article fields)                      │
│  ←  Back to the feed                                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [favicon]  source.domain · Apr 5, 2026      Read original → │
│                                                              │
│  Headline in Fraunces 38px                                   │
│                                                              │
│  Full body in Manrope 16px at 680px max width                │
│  (the prose-max from §3.6).                                  │
│                                                              │
│  Supports h2 subheadings, inline code, code blocks in        │
│  forest-on-cream, blockquotes with a mustard left-rule,      │
│  ordered/unordered lists, and inline links with mustard      │
│  underlines.                                                 │
│                                                              │
│  — Byline in italic Fraunces                                 │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  (secondary cream background)                                │
│  02 / DISCUSSION          7 REPLIES · 23 WATCHING            │
│                                                              │
│  [◯ DW] @dougw · 2h ago                                      │
│          Comment body in Manrope 14px                        │
│          hearts · Reply · Share                              │
│          │                                                   │
│          │  [◯ MT] @marisol.t · 1h ago  [AUTHOR]             │
│          │         Nested reply (left-ruled in mustard)      │
│          │                                                   │
│  [◯ KR] @kenji.r · 4h ago                                    │
│          ...                                                 │
│                                                              │
│  ─────────────────────────                                   │
│  Signed in as @you                                           │
│  [ textarea, Manrope, markdown supported               ]     │
│  [Post reply]   MARKDOWN: **bold** `code` ```lang            │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  COLOPHON                                                    │
└──────────────────────────────────────────────────────────────┘
```

**Full-page behavior:**

- **Prose max width is 680px** (from §3.6 `--space-prose-max`). Classic readable column width — do not make it wider.
- **Article headline uses Fraunces 38px**, smaller than the homepage hero. Long-form reading wants a less imposing headline than a manifesto.
- **Discussion section is on a secondary cream background** (`#e8e6d8`) to visually separate "reading" from "talking." It's numbered `02 / Discussion` (the article is implicitly `01`).
- **Comment thread** uses 28px forest circles with mono initials for avatars (no uploaded images required). Author handles are in JetBrains Mono, bodies are in Manrope. Nested replies get a 20px left-indent and a 2px mustard left-rule.
- **The reply form** is a full-width Manrope textarea with forest border that goes mustard on focus, a forest `Post reply` button, and a small mono markdown hint row.
- **Avatar badges**: an `AUTHOR` badge in mustard text with a mustard outline appears on comments from the article's author, to mark them as the person being replied to.
- **Code blocks** inside comments and article bodies use the same forest-background treatment as the homepage hero `pre` blocks — it matches the schematic-as-drawing aesthetic.

#### 3.4.3 Full-page pattern — News (summary + link-out)

News is a special case: **BASidekick does not host the full article**, it hosts a summary and a discussion. The page is structured as a link post (Hacker News / Reddit model), not a reproduction. The layout:

```
┌──────────────────────────────────────────────────────────────┐
│  NAV                                                         │
│  TITLE BLOCK STRIP                                           │
│    DRAWING / SHEET / TITLE / SOURCE / REV / REPLIES / R.H.   │
│  ←  Back to the news feed                                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [favicon]  source.domain · Apr 5, 2026                      │
│                                                              │
│  Headline in Fraunces 38px                                   │
│                                                              │
│  01 / SUMMARY  ────────────────                              │
│  Italic Fraunces 19px lede sentence                          │
│                                                              │
│  Manrope 15px detail paragraph 1                             │
│  Manrope 15px detail paragraph 2                             │
│  (2–4 paragraphs total, ~150–250 words max)                  │
│                                                              │
│  ┌──────────────────────────────────────────────────┐        │
│  │  [favicon lg]  READ THE FULL ARTICLE             │        │
│  │                ashrae.org                        │        │
│  │                /path/to/article    [Open → ]     │        │
│  └──────────────────────────────────────────────────┘        │
│                                                              │
│  — Summary drawn by the BASidekick news script and           │
│    reviewed by Rob. This is a paraphrase, not the full       │
│    article. Corrections welcome below.                       │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  02 / DISCUSSION (same as 3.4.2)                             │
├──────────────────────────────────────────────────────────────┤
│  COLOPHON                                                    │
└──────────────────────────────────────────────────────────────┘
```

**News page behavior:**

- **Title block strip carries a `SOURCE` field** (e.g., `SOURCE ASHRAE.ORG`) in place of the `WORDS` count used on wiki articles. Source is more relevant when the content is curation.
- **The `01 / Summary` labeled section** makes it explicit that what you're reading is a BASidekick-produced paraphrase, not the original. This matters ethically (it's not our writing, we shouldn't present it as such) and legally (it's a summary, not a reproduction).
- **The summary is short: 2–4 paragraphs, ~150–250 words max.** One italic Fraunces lede sentence followed by one or two Manrope detail paragraphs. If the summary gets longer than this, it's drifting into reproduction territory — ship shorter summaries instead.
- **The "Read the full article" callout card** is the page's primary action. It's a full-width bordered card with a 48px favicon on the left, the source domain in Fraunces 18px, the URL path in small mono, and a forest `Open original →` button on the right. It is deliberately unmissable.
- **The byline explicitly disclaims full-article status**: *"Summary drawn by the BASidekick news script and reviewed by Rob. This is a paraphrase, not the full article. Corrections welcome below."* The bolded clarification is load-bearing.
- **The discussion section is the page's real centerpiece** — the summary is just context for the conversation that happens on BASidekick *about* the article.

#### 3.4.4 Card-grid pattern — Open Source (no search, few items)

For pages with a small number of items that don't warrant a search + browse pattern, use a **card grid** instead. Open Source is the canonical example — currently 3 crates + maybe a few tools, growing slowly. The layout:

```
┌──────────────────────────────────────────────────────────────┐
│  NAV                                                         │
│  TITLE BLOCK STRIP (DRAWING / TITLE / REV / CRATES / GH ⭐)  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Italic Fraunces tagline                                     │
│                                                              │
│  01 / CRATES                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│  │ card       │  │ card       │  │ card       │              │
│  │            │  │            │  │            │              │
│  └────────────┘  └────────────┘  └────────────┘              │
│                                                              │
│  02 / TOOLS                                                  │
│  ┌────────────┐  ┌────────────┐                              │
│  │ card       │  │ card       │                              │
│  └────────────┘  └────────────┘                              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  FOOTER ROW (Latest releases / Contributing / Sponsor)       │
│  COLOPHON                                                    │
└──────────────────────────────────────────────────────────────┘
```

Each card: Fraunces name, mono protocol tag, short description, a `View on GitHub →` or `Open repo →` link, and optional secondary metadata (stars, version, last commit). No reactive search, no chips, no modal. Clicking a card either opens the GitHub repo in a new tab (for crates that live entirely on GitHub) or navigates to a full-page detail (for crates that have a richer on-site presence). Which behavior applies is per-card, picked when the card is added.

### 3.5 The title block strip — the recurring "flavor thread"

This is the **single graphic element that recurs across every non-home page.** It replaces the SiteBadge eyebrow pattern (`RESOURCES`, `WIKI`, `NEWS`, `OPEN SOURCE`) on every page that currently has one.

**Visual specification:**

```html
<div class="title-block">
  <div class="field"><span class="field-label">DRAWING</span><span class="field-value">ATLAS</span></div>
  <div class="field"><span class="field-label">TITLE</span><span class="field-value">POINT &amp; EQUIPMENT REFERENCE</span></div>
  <div class="field"><span class="field-label">REV</span><span class="field-value">2026-04-07</span></div>
  <div class="field"><span class="field-label">POINTS</span><span class="field-value">847</span></div>
  <div class="field"><span class="field-label">MODELS</span><span class="field-value">120</span></div>
  <div class="field"><span class="field-label">BRANDS</span><span class="field-value">23</span></div>
  <div class="spacer"></div>
  <div class="field"><span class="field-label">DRAWN BY</span><span class="field-value">R.H.</span></div>
</div>
```

```css
.title-block {
  background: var(--secondary);          /* #e8e6d8 */
  border-bottom: 1px solid var(--border);
  padding: 14px 64px;
  display: flex;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.4px;
  color: var(--muted-foreground);
}
.title-block .field { display: flex; align-items: center; }
.title-block .field + .field {
  padding-left: 24px;
  margin-left: 24px;
  border-left: 1px solid var(--border);
}
.title-block .field-label { color: var(--accent); margin-right: 8px; }
.title-block .field-value { color: var(--foreground); font-weight: 500; }
.title-block .spacer { flex: 1; }
```

**Field rules:**

- Each field has a **mustard label** (`DRAWING`, `TITLE`, `REV`, etc.) followed by its forest value
- Fields are separated by a 1px vertical rule
- The `DRAWN BY` field is always last and pushed right with a flex spacer
- Fields **encode real metadata** — counts, dates, attribution. They are not decorative placeholders.
- A page with no meaningful data still gets at minimum: `DRAWING / TITLE / REV / DRAWN BY`

**Per-page field sets:**

| Page | Fields |
| --- | --- |
| **Atlas** | DRAWING / TITLE / REV / POINTS / MODELS / BRANDS / DRAWN BY |
| **Wiki** | DRAWING / TITLE / REV / ARTICLES / LAST PUBLISHED / DRAWN BY |
| **PointStack** | DRAWING / TITLE / REV / MEMBERS / POSTS / OPEN JOBS / DRAWN BY |
| **News** | DRAWING / TITLE / REV / ARTICLES THIS WEEK / SOURCES / DRAWN BY |
| **Open Source** | DRAWING / TITLE / REV / CRATES / GITHUB STARS / DRAWN BY |
| **Wiki article (single)** | DRAWING / TITLE / SHEET / REV / WORD COUNT / DRAWN BY |
| **404** | DRAWING / TITLE: ??? / REV: ??? / DRAWN BY: ??? |

**Why this works:**

1. It's the same vocabulary as the schematic title block in the homepage hero — visitors recognize it immediately as part of the same world
2. Each page gets its own version, so it's per-page distinct without needing per-page imagery
3. It encodes real metadata (counts, dates) so it has function, not just decoration
4. It costs nothing to build — pure HTML and CSS, no assets

### 3.6 Spacing scale

| Token | Value | Used for |
| --- | --- | --- |
| `--space-section-y` | `88px` (mobile: `56px`) | Vertical padding inside major sections |
| `--space-section-x` | `64px` (mobile: `24px`) | Horizontal padding for full-width sections |
| `--space-content-max` | `1100px` | Browse / list content max width |
| `--space-prose-max` | `680px` | Article body max width |
| `--space-hero-max` | `980px` | Hero / search area max width |
| `--space-row-y` | `14px` | Vertical padding on list rows |
| `--space-card` | `24px–36px` | Inner padding on cards |

These are recommended defaults — Tailwind classes can use whatever lines up with these. The numbers are deliberate: `64px` horizontal section padding is generous enough to feel editorial, `1100px` max width keeps long lines from getting hard to scan, `680px` prose max width is the classic readable column.

---

## 4. Imagery

### 4.1 Direction

**One image, used in one place.** The hero schematic on the homepage is the entire imagery system. Every other page relies on typography, color, layout, and the title block strip (§3.5) for its visual identity.

This is the most restrained possible direction and it matches the "tasteful, not overdone" intent. The hero schematic does its job once, on the front door, where it sets the visual language for the whole site. Visitors carry that impression with them into other pages even without seeing more schematics — the title block strip and the section-numbering convention are the *typographic* echoes of the same vocabulary.

**Explicit guardrail: no spot illustrations.** No decorative SVG icons next to section headings, no portrait of Rob in the colophon, no second schematic anywhere on the site, no per-page background watermarks. If a *specific* page eventually needs a *specific* image (an empty state, a 404, an embedded diagram inside a single wiki article), generate that one piece on its own — don't build a "spot illustration library."

The **Phosphor icons currently used in the codebase stay.** They're functional iconography (search, github, arrows, close), not decorative imagery. The "less AI" goal is about generated decorative imagery, not about functional icons.

### 4.2 The hero schematic — production rules

| Property | Value |
| --- | --- |
| Source | AI-generated (Midjourney v6 / Flux / DALL-E 3) using the prompt in §4.4 |
| Format | AVIF preferred, WebP fallback. **Not raw PNG.** |
| File size target | < 300 KB at quality 60 |
| Max dimension | 2000px wide |
| Color treatment | **None.** Use the aged-paper output as-is. The cream paper harmonizes with `#f1efe6` via `mix-blend-mode: multiply`. Do not desaturate or recolor. |
| File location | `/public/hero-schematic.avif` (with `.webp` fallback) |
| Storage | Committed to the repo — it's a small static asset, not user-generated |

### 4.3 The hero placement CSS

Exact placement that matches the approved mockup:

```css
.hero-wrap {
  position: relative;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background-image: url('/hero-schematic.avif');
  background-size: 90% auto;
  background-repeat: no-repeat;
  background-position: right -2% center;
  opacity: 0.12;
  mix-blend-mode: multiply;
}
.hero-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    var(--background) 0%,
    rgba(241, 239, 230, 0.85) 25%,
    rgba(241, 239, 230, 0) 55%
  );
}
.hero {
  position: relative;
  z-index: 2;
  /* normal padding */
}
```

**Rules:**

- Opacity is `0.12`. Not `0.10`, not `0.18`. Tested at all three.
- The `::after` cream gradient masks the left third of the schematic so the headline text reads cleanly. Do not remove this — without it, the AHU/I-O blocks fight with the headline.
- `mix-blend-mode: multiply` is what lets us use the raw aged-paper image without recoloring. Do not change to `normal` or `screen`.
- Position is `right -2% center` — anchored to the right edge with a tiny overshoot so the title block in the corner of the schematic pushes slightly off-screen.

### 4.4 The prompt that generated the working hero

Save this in the repo as `docs/imagery-prompts.md` so it's not lost:

```
A detailed hand-drawn HVAC control schematic diagram,
showing an air handling unit (AHU) with labeled filter, heating coil,
cooling coil, and supply fan, connected to ductwork running to VAV boxes
and zone dampers, with small circular temperature and pressure sensors
labeled with codes like DAT, SAT, ZN-101, dashed control wiring connecting
every sensor to a central DDC controller with labeled I/O terminals,
a title block in the bottom right corner showing project info and
a hand-written signature, engineering notes in the top right corner,
black ink line drawing on aged cream paper, thin precise lines with
occasional ink blots and hand-lettered labels in all caps,
flat 2D orthographic view (not isometric, not perspective, not 3D rendered),
looks like a page torn from a 1980s ASHRAE service manual,
wide horizontal composition, room for text on the left third
--ar 16:9 --style raw --v 6
```

**Load-bearing phrases — do not edit:**

- `flat 2D orthographic view (not isometric, not perspective, not 3D rendered)` — kills Midjourney's default isometric bias
- `hand-lettered labels in all caps` — reduces garbled AI text
- `aged cream paper` — gives the texture for free, no recolor needed
- `wide horizontal composition, room for text on the left third` — Midjourney v6 respects this
- `--style raw` — strips Midjourney's house style

**If we ever need to regenerate** (e.g., for a 404 page or an empty state), use the same style block above and only swap the *subject paragraph* (the first 6–8 lines describing what's drawn).

### 4.5 What does *not* exist in this design

This is the explicit list of imagery patterns that are **rejected** so future temptation has a written answer:

- ❌ Per-page background schematics (one schematic per page type)
- ❌ Spot illustrations next to section headings
- ❌ Custom illustration of Rob in the colophon
- ❌ Background gradients, glows, radial effects, animated SVG patterns
- ❌ Stock photography
- ❌ Hero photography
- ❌ Decorative dividers other than 1px hairlines
- ❌ Animated backgrounds (the existing `HeroBackground`, `HeroMarks`, `CircuitBackground`, `HeroGraph` components are all deleted in §6)

The single allowed exception is **a small set of hand-drawn SVG glyphs** (5–6 marks: section divider, end-of-article mark, custom arrow, etc.) drawn in Figma in the same line-art style. **This is currently deferred** — not part of the initial implementation. If the site feels too plain after the redesign ships, we add the glyphs as a follow-up. They are not in scope for the first pass.

---

## 5. Copy voice

### 5.1 The voice

BASidekick sounds like **one specific person** — Rob Hansen, in Tucson, who has been collecting BAS information, resources, and connections from a side-of-the-industry vantage point for years. The homepage is signed `— Rob, Tucson`; every other piece of copy on the site should sound like it came from the same person who wrote that signoff.

**Important: Rob is not a controls technician.** He works alongside the BAS industry — doing graphics work for controls projects — which has given him unusual cross-customer breadth but not first-hand installation or commissioning experience. The voice reflects this honestly. Rob is a **curator and host**, not a practitioner. The site is **collected** and **gathered**, not **built from field experience**. Contributors and community members are the ones with field experience; Rob is the person who made the place for them to put it.

The voice is:

- **Opinionated.** "*Not another general engineering forum.*" "*No hot takes.*" "*The things nobody writes down.*" Real opinions, stated plainly, are a signal of humanity that AI templates can't replicate.
- **Specific.** "847 points" not "hundreds of points." "Drawn from 47 vendors" not "trusted by industry leaders." "Field-tested guides on grounding, sequencing, commissioning" not "various BAS topics." (Note: phrases like "field-tested" can describe *content* or *contributors*, never Rob himself.)
- **Curatorial, not authoritative.** Rob collects, curates, and hosts — he does not claim authorship of the field knowledge on the site. The wiki articles come from contributors. The news is summarized from real publications. The atlas is built from published standards, vendor docs, and community submissions. Rob's role is to assemble and keep the place running, and the copy reflects that.
- **Honest about limits.** When something is AI-assisted, say so (`curated by Rob and an AI first-pass`). When something is a summary, label it as such (`This is a paraphrase, not the full article`). When the community is small, own it as a feature (`A quiet place to talk shop`). When Rob isn't the expert, don't pretend otherwise. Understating works; overstating destroys trust instantly.
- **Direct, not chatty.** Short sentences. Active voice. Contractions. Strong verbs. Avoid hedging words like *perhaps*, *might help*, *can assist with*.
- **Dry, occasionally.** A deadpan joke is better than no personality. `Also here. Smaller, but still loved.` The joke doesn't have to land — it has to *try*.

The voice is **not**:

- Formal (no "We are pleased to announce")
- Breathless (no "revolutionary", "cutting-edge", "game-changing")
- Generic (no "for BAS professionals", "all in one place")
- Hedging (no "we think maybe this might help")
- Marketing (no "trusted by", "join thousands of", "get started today")

### 5.2 Rules

Nine rules to follow. Every piece of copy on the site should pass all nine.

1. **Contractions are encouraged.** Write `we're`, `it's`, `don't`, `you'll`, `that's`. The current site avoids contractions, which is a major part of why it feels stiff.
2. **Use real numbers, never ranges or hedges.** `847 points` not `hundreds of points` or `800+ points` (the `+` is fine if the data is growing, but prefer the real number where possible). `52 articles` not `dozens of articles`. `23 vendors` not `many vendors`.
3. **Use real names.** `Rob Hansen` not `the team`. `Tridium` not `a leading vendor`. `ASHRAE 135-2024` not `the new BACnet standard`.
4. **Use real dates.** `Last updated Apr 7, 2026` not `recently updated`. `Published Oct 15, 1985` not `several decades ago`.
5. **Use italics for emphasis, never ALL CAPS and never bold.** Fraunces italic does real emphatic work and it's the one of the main reasons we picked Fraunces. ALL CAPS is reserved for the JetBrains Mono labels in the title block strip and nowhere else. Bold is for functional weight (headings, buttons), not emphasis inside body copy.
6. **Don't use "we" as a royal we.** If a thing was done by Rob alone, the copy says "I" or names him directly. "We" is reserved for genuine plurals — Rob + contributors, or Rob + AI-assisted workflow explicitly.
7. **State what the thing is, not what it aspires to be.** `PointStack is small, moderated, and specifically for BAS` is honest. `PointStack is the #1 destination for BAS professionals` is marketing. The first builds trust; the second burns it.
8. **When in doubt, cut.** A sentence you're unsure about is almost always cuttable. The current homepage has about 3× more words than it needs; the new design should have 30% of the word count and feel twice as substantial.
9. **Not a manifesto.** BASidekick is a personal curator project, not a grand industry initiative. Lean into *collected*, *gathered*, and *curated* — not *built*, *created*, *digging out*, or any framing that positions the site as Doing Something Important About An Industry Problem. It's a reference, a feed, and a community, assembled by someone with a specific vantage point. Self-deprecating wit is fine; grandiose claims about purpose are not. If you catch yourself writing a headline that could work for a Vercel product launch, rewrite it smaller.

### 5.3 Banned phrases

These phrases exist on the current site (or are clichés the new copy must not drift into). **Do not use any of them in the new design.** When you feel the urge to write one, write the opposite.

| Banned | Why it's banned | Replacement pattern |
| --- | --- | --- |
| `for BAS professionals` | Used 3 times on the current homepage as a lazy qualifier. It's who the audience is, not what the thing does. | Say what the thing *is*, not who it's for. |
| `actively growing` | Tells me nothing and sounds like a startup. | A real number + a real date. `52 articles · last published 04-04.` |
| `community-driven` | Generic virtue signal. | Show, don't tell. `Open source on GitHub. PRs welcome.` |
| `all in one place` | Every SaaS tagline ever. | Delete it. No replacement needed. |
| `open source, community-driven reference` | Stacks three generic virtues in a row. | `An open reference for points, equipment, and the messy names they show up under.` |
| `cutting-edge` / `revolutionary` / `world-class` / `game-changing` | AI-template vocabulary. | Say the specific thing the feature does. |
| `powerful` / `robust` / `seamless` | Adjectives that mean nothing. | Show the specific behavior instead of claiming it. |
| `trusted by thousands` / `trusted by industry leaders` | Trust is earned, not claimed. | A real attribution. `Curated by Rob Hansen in Tucson.` |
| `All rights reserved.` | Nobody writes this anymore unless forced to. | `Last updated · Apr 7, 2026` or `Built and maintained by Rob Hansen, Tucson`. |
| `© 2026 BASidekick` on its own | Dead copyright boilerplate. | Pair it with something real or delete it. |
| `Get started today` / `Sign up free` | SaaS conversion vocabulary. | Action-specific verbs: `Browse the Atlas`, `Join the community`, `Post a question`. |
| `Explore` as a CTA | Meaningless fluff. | `Browse [thing]` with a specific object: `Browse the Atlas`, `Browse the wiki`. |
| `Learn more →` | The #1 generic CTA. | Tell me *what* I'll learn: `Read the summary`, `See the field guide`, `View the changelog`. |
| `Built on Haystack and Brick standards` | Technically true but currently used as a marketing bullet. | Mention it only inside the Atlas where it's functional context, not as a homepage brag. |
| `Assistive tools, shared knowledge, and a community` | Current homepage sub — three nouns with the Oxford-comma template. | See the new lede in §5.4. |
| `Tools, community, and knowledge` | Current hero — same template, nothing said. | See the new hero in §5.4. |

### 5.4 Rewrites — current copy → new copy

Every piece of visible copy on the current homepage, atlas page, and footer, with the replacement. When implementing, work from this table.

#### Homepage

| Surface | Current | New |
| --- | --- | --- |
| Hero h1 | `Tools, community, and knowledge.` (with lime gradient on "knowledge") | `BAS info, community, and resources — <em>collected from next to the industry</em>, not from inside it.` (italic mustard on "collected from next to the industry") |
| Hero sub | `Assistive tools, shared knowledge, and a community for BAS professionals.` | `A growing reference for the people who build, integrate, and operate building automation systems. Open data, open source, and a small community that actually answers questions.` |
| Hero signoff | *(none)* | `— Rob, Tucson` (italic Fraunces, required) |
| Pulse line | *(none)* | `Updated this week · 6 new wiki entries · 23 new atlas points · 12 new PointStack posts` (JetBrains Mono, with mustard pulsing dot) |
| Stats bar (3 numbers in glass card) | `50+ Wiki Articles · 500+ Point Definitions · 100+ Equipment Models` | **Removed.** The data moves into the pulse line. |
| Atlas section heading | `An open source, community-driven reference for BAS professionals` | `An open reference for points, equipment, and the messy names they show up under.` |
| Atlas section body | `Browse standardized point definitions with Haystack and Brick mappings, explore equipment from major manufacturers, and clean up messy point names — all in one place. BAS Atlas is open source and actively growing with community contributions.` | `Browse 800+ standardized point definitions with Haystack and Brick mappings. Today's exhibit:` |
| Atlas featured caption | *(none)* | `Featured manually · changes weekly` (italic Fraunces, sage gray) |
| Atlas primary CTA | `Explore Atlas` | `Browse the Atlas →` |
| Atlas secondary CTA | `Equipment Catalog` | `Suggest a point` |
| Wiki carousel section heading | `Latest from the Wiki` | *(removed — the carousel is replaced by the "Also here" row)* |
| Wiki carousel sub | `Guides, tutorials, and reference documentation for BAS professionals.` | *(removed)* |
| News section heading | `Industry News` | *(removed from homepage — News lives in the "Also here" row only)* |
| News section sub | `The latest in building automation, curated by AI and the community.` | *(removed — the "curated by AI" line specifically must not return; see §5.2 rule 7)* |
| Open Source heading | `Rust Crates for BAS` | *(removed from homepage — Open Source lives in the "Also here" row only)* |
| Open Source sub | `Protocol-first crates for open source BAS software development.` | *(removed)* |
| "Also here" section heading | *(none)* | `Also here. <em>Smaller, but still loved.</em>` (Fraunces, "Smaller, but still loved" in italic sage) |
| Wiki item in "Also here" | `Guides, tutorials, and reference documentation for BAS professionals.` | `Field-tested guides on grounding, sequencing, commissioning, and the things nobody writes down. 52 articles and counting.` |
| News item in "Also here" | `The latest in building automation, curated by AI and the community.` | `A small daily-ish feed of the BAS industry — standards updates, vendor news, security advisories. No hot takes.` |
| Open Source item in "Also here" | `Protocol-first crates for open source BAS software development.` | `Rust crates and tools for building BAS software from the ground up. <em>rustbac</em>, <em>rustmod</em>, and an experimental BMS.` |
| "Also here" Wiki link label | `Browse All` | `Browse the wiki` |
| "Also here" News link label | `All News` | `Read the feed` |
| "Also here" Open Source link label | `View All` | `View on GitHub` |

#### Atlas page

| Surface | Current | New |
| --- | --- | --- |
| Hero eyebrow | `RESOURCES` (SiteBadge) | **Removed** — replaced by the title block strip (§3.5) |
| Hero headline | `BAS Atlas` | **Removed** — the page name lives in the title block strip |
| Hero description | `An open source, community-driven reference for point definitions, equipment catalogs, and naming conventions. Built on Haystack and Brick standards — actively growing with your contributions.` | `A reference of points, equipment, and the names they show up under.` (italic Fraunces tagline, one sentence, above the search input) |
| Primary CTA | `Add Equipment` button | Demoted to `Suggest a point →` in the `C / Contribute` footer column |
| Tabs | `Point Definitions` / `Equipment Catalog` | Replaced by scope chips: `All · Points · Equipment · Brands` |
| Search placeholder | *(current placeholder unknown)* | `Search points, aliases, equipment, brands…` (italic Fraunces 22px) |
| Empty state | *(current unknown)* | `Nothing matches that. Try a different alias, vendor name, or part of the description.` (italic Fraunces) |
| Footer section A | *(none)* | `A / Recently added` |
| Footer section B | *(none)* | `B / Popular this week` |
| Footer section C | *(none)* | `C / Contribute` |
| Colophon left | *(current footer uses generic language)* | `Atlas / Curated by Rob Hansen / Collected from next to the industry` |
| Colophon middle | *(current footer)* | `Sources: Project Haystack, Brick Schema, vendor docs, community submissions.` |

#### News (feed and article pages)

| Surface | Current | New |
| --- | --- | --- |
| Page headline | *(current is `News` with generic subhead)* | **Removed** — page name lives in title block strip |
| Page tagline (above search) | *(none)* | `A daily-ish feed of what's moving in the industry. Read the summary here, read the original there.` (italic Fraunces) |
| Empty state on search | *(current unknown)* | `Nothing from that week. Try "this month" instead.` |
| Article-page summary label | *(none)* | `01 / Summary` (mono, mustard `01 /`) |
| Article-page read-original label | *(none)* | `Read the full article` (mono) + `Open original →` (forest button) |
| Article-page byline | *(none)* | `— Summary drawn by the BASidekick news script and reviewed by Rob. This is a paraphrase, not the full article. Corrections welcome below.` |
| Discussion heading | *(none)* | `02 / Discussion` + meta: `{n} REPLIES · {n} WATCHING` |
| Reply textarea placeholder | *(current unknown)* | `Share what you know. Code blocks welcome. Be kind.` |
| Reply button | *(current unknown)* | `Post reply` (not `Submit comment`, not `Send`) |
| News colophon left | *(current)* | `News / Curated daily-ish by Rob / and an AI first-pass` |

#### PointStack

| Surface | Current | New |
| --- | --- | --- |
| Page description (metadata) | `Connect with BAS professionals, share projects, find work, and grow your network.` | `A quiet place to talk shop with people who actually <em>know</em>.` |
| Title block strip live field | *(none)* | `LIVE · 12 ONLINE NOW` (with pulsing mustard dot) |
| Ticker label | *(none)* | `RIGHT NOW` |
| Ticker format | *(none)* | `@author verb'd the thing · N min ago` (see §3.3 for full pattern) |

#### Footer / colophon (used across all pages)

| Surface | Current | New |
| --- | --- | --- |
| Column 1 heading | `[BASidekick]` | `BASidekick` (no brackets in colophon — brackets only in the nav brand) |
| Column 1 tagline | `Tools, community, and knowledge for building automation professionals.` | `Built and maintained by Rob Hansen, Tucson` |
| Column 2 heading | `Explore` | *(removed — no column headings, just real content)* |
| Column 3 heading | `Resources` | *(removed)* |
| Column 4 heading | `Community` | *(removed)* |
| Column 2 middle content | *(current is a list of nav links duplicated from the header)* | `Open source where it matters. Pull requests welcome on every public repo.` with `github.com/rbhans` and `rob@basidekick.com` inline |
| Column 3 right content | *(current is more nav links)* | `Last updated · Apr 7, 2026` + `View the changelog` link |
| Copyright | `© 2026 BASidekick. All rights reserved.` | **Removed.** |

### 5.5 Per-surface guidance

Short rules for copy on specific element types. Use these as defaults unless a rewrite in §5.4 overrides.

**Headlines (h1)**
- One sentence, stating something specific. Never a generic tagline.
- Italicize the single most important phrase. That's the only emphasis tool.
- Mobile version can be the same or shorter, never longer.
- Max length: 100 characters.

**Section headings (h2)**
- One clause, stating what the section is. Never a question, never a command.
- Good: `An open reference for points, equipment, and the messy names they show up under.`
- Bad: `Discover our powerful Atlas` or `Looking for a point?`

**Subheads / ledes**
- One sentence. One idea. Drop the obvious stuff.
- Good: `Browse 800+ standardized point definitions with Haystack and Brick mappings. Today's exhibit:`
- Bad: `Our comprehensive Atlas contains everything you need to navigate the complex world of BAS point naming conventions.`

**Buttons and CTAs**
- 2–4 words. Action verb + specific object. Arrow glyph (`→`) on forward-motion actions.
- Good: `Browse the Atlas →`, `Post reply`, `Suggest a point`, `Read original →`
- Bad: `Explore`, `Learn more →`, `Get started`, `Click here`, `Submit`

**Placeholders**
- A sentence or phrase in italic Fraunces (for large search inputs) or italic Manrope (for textareas).
- Must tell the user what to type, not what the field is.
- Good: `Search points, aliases, equipment, brands…` / `Share what you know. Code blocks welcome. Be kind.`
- Bad: `Search` / `Your comment here`

**Empty states**
- One sentence. Italic Fraunces. Says what went wrong *and* what to try.
- Good: `Nothing matches that. Try a different alias, vendor name, or part of the description.`
- Bad: `No results found.` / `Sorry, nothing here.`

**Error messages**
- One sentence. Says what failed and what to do about it. No exclamation points.
- Good: `Couldn't save that comment. The database is slow right now — try again in a few seconds.`
- Bad: `Error! Something went wrong. Please try again later.`

**Success messages**
- Short and quiet. No `!`.
- Good: `Saved.` / `Comment posted.` / `Thanks — added.`
- Bad: `Success! Your comment has been posted!`

**Toast notifications**
- Follow the error/success rules. Auto-dismiss after 3–4 seconds.

**Form labels**
- Noun phrase, normal case, no colon.
- Good: `Your name`, `Point name`, `Equipment model`
- Bad: `NAME:` / `Name (required):`

**Tooltips and helper text**
- One sentence, sage gray, mono if it's a short label, Manrope if it's a sentence.
- No hedging. Tell the user the actual rule.
- Good: `Case-insensitive. Partial matches allowed.` / `Must be unique across the atlas.`
- Bad: `Tip: You can use partial matches too!`

**404 page**
- A short italic Fraunces line acknowledging the miss, followed by a few specific places to go.
- The title block strip carries `DRAWING / TITLE: ??? / REV: ??? / DRAWN BY: ???` per §3.5.
- Good: `This drawing isn't in the set. Try the atlas or the wiki instead.` + three text links
- Bad: `404 — Page Not Found` / `Oops! We couldn't find that page.`

**Colophons (footer per-page)**
- Three short JetBrains Mono columns: who / what / when.
- Every page's colophon should be slightly different so it reflects what's on the page.
- Always include a real last-updated date. Never include `© YEAR`, `All rights reserved`, or nav-link repeats.

### 5.6 The signoff rule

The homepage hero ends with `— Rob, Tucson`. This is the single most important piece of copy on the entire site because it tells the visitor a specific person, in a specific place, is accountable for what they're reading.

**Three rules around the signoff:**

1. **It does not change without a reason.** Rob moves → update the city. Rob hands the project to someone else → update the name. Nothing else changes it.
2. **It does not get parallel copies.** Only the homepage hero has a signoff. Putting "— Rob, Tucson" on every page would make it wallpaper. The signoff is scarce; that's what makes it load-bearing.
3. **The colophon line "Built and maintained by Rob Hansen, Tucson" is the signoff's quiet cousin.** It appears on every page (in the colophon's first column), it's set in JetBrains Mono instead of italic Fraunces, and it's the only other place Rob's name + city appears on the site. The two together tell a consistent story: *this page you're on is signed; this site you're on has someone's name on it.*

### 5.7 Voice checklist (for future PRs)

When writing or reviewing any new copy during implementation, run this checklist:

- [ ] Could this same sentence appear on Notion, Linear, Stripe, Vercel? → **rewrite to be specific to BAS and to Rob's voice**
- [ ] Does it contain any phrase from §5.3 (banned list)? → **rewrite**
- [ ] Does it hedge (`might`, `perhaps`, `may help`)? → **rewrite as a direct statement**
- [ ] Does it use "we" when it means "I" or "this software"? → **rewrite**
- [ ] Does it have a real number, name, date, or source where one would be more specific than a generic? → **add the specific**
- [ ] Is it at least 30% shorter than the first draft? → **cut more**
- [ ] Does it have contractions where a person would use them? → **add them**
- [ ] Is it italicizing the one right word and nothing else? → **fix the emphasis**

## 6. Removal list

### 6.1 Scope and guarantees

This is the explicit inventory of what gets deleted, what gets rewritten, and what stays untouched when the redesign lands. The overall principle:

> **All content stays. All data stays. All infrastructure stays. Nothing design-wise is being salvaged.**

Rob has already confirmed there is nothing in the current visual design he wants to preserve. This means every visual component is fair game — but every piece of stored content, every database table, every Supabase migration, every content-loading function, every API route, and every auth/infra primitive **must survive the redesign untouched** or be explicitly migrated with all data preserved.

#### 6.1.1 Hard guarantees — do not delete

The following are **out of scope** for the redesign. Do not modify, do not delete, do not "improve while we're here":

- **All Supabase tables and rows**
  - `wiki_articles`, `wiki_categories`, `wiki_tags`
  - `news_articles`, news metadata
  - PointStack tables: `posts`, `questions`, `projects`, `jobs`, `companies`, `messages`, `comments`, `users`, `profiles`
  - Auth tables (managed by Supabase)
  - Any bookmarks, reactions, votes, notifications tables
- **All existing Supabase migrations** in `supabase/migrations/` — do not roll back, do not squash
- **All Atlas data** in `/data/` (point definitions, equipment models, brands) — this is a build-time-fetched dataset, not stored in the DB
- **All content-loading functions** in `lib/data/` — `getBabelData`, `getBabelEntry`, `getAtlasData`, etc.
- **All server actions and API routes** under `app/api/`
- **All auth flows** — sign-in, sign-up, forgot-password, reset-password, onboarding
- **All middleware.ts logic** — route gating, auth checks
- **All hooks** in `hooks/`
- **All lib utilities** in `lib/` — types, routes, data fetchers, Supabase clients
- **All scripts** in `scripts/` — news curation, BAS news script, wiki diagram improver, atlas migration scripts
- **The intercepting-routes structure** at `app/(main)/atlas/@modal/(.)[id]/page.tsx` — the routing infrastructure stays; only the modal component's visual contents get rewritten

If something in the table below conflicts with these guarantees, the guarantee wins. When in doubt, **preserve first, delete second**.

### 6.2 Components to delete outright

The following components embody the "AI template" patterns we're moving away from. They can be deleted from the codebase entirely in the first PR, with no replacement needed — either their function disappears with the redesign, or a new component from §6.5 replaces them.

| Component | Why it's being deleted |
| --- | --- |
| `components/hero-background.tsx` | §4.1: no animated / decorative backgrounds. Replaced by the faded hero schematic image. |
| `components/hero-marks.tsx` | §4.5: no animated SVG patterns. Deleted outright. |
| `components/hero-graph.tsx` | §4.5: animated graph in hero area. Deleted outright. |
| `components/circuit-background.tsx` | §4.5: decorative background, not used in new design. |
| `components/rotating-atlas-card.tsx` | §3.2: the homepage "Atlas, today" is a single hand-picked specimen, not a rotating card. The rotation pattern itself is gone. |
| `components/animated-counter.tsx` | §3.2: the stats-trio card is removed entirely from the homepage; data lives in the pulse line. |
| `components/wiki-carousel.tsx` | §3.2: the homepage wiki carousel is replaced by the "Also here" numbered row. No carousel anywhere on the new site. |
| `components/site-badge.tsx` | §2.5: the `RESOURCES / WIKI / NEWS` eyebrow pattern is killed. At most one mono eyebrow per page, and it lives in the title block strip. |
| `components/page-hero.tsx` | §3.1 rule 1: no centered marketing heroes. Every page that used `<PageHero>` gets a new layout. |
| `components/hero-search.tsx` | §3.2: no centered hero search on the homepage. The Atlas page has its own search implementation (§3.3). |
| `components/feature-card.tsx` | §3.2: the feature-grid pattern is removed from the homepage. |
| `components/step-card.tsx` | §3.2: step-by-step sections are not in the new design. |
| `components/product-card.tsx` | §3.2: product card pattern is deleted; the "Also here" row uses its own minimal markup. |
| `components/theme-provider.tsx` | §1.1: dark mode is deleted entirely. No theme provider needed. |
| `components/theme-toggle.tsx` | §1.1: no theme toggle in the nav. |
| `components/changelog.tsx` | §3.2: the homepage changelog widget is not in the new design. Changelog content moves to a dedicated `/changelog` route (stays) that the colophon links to. |
| `components/example.tsx` | Demo/scratch file. Delete. |
| `components/component-example.tsx` | Demo/scratch file. Delete. |
| `components/newsletter-signup.tsx` | §5.2 rule 7: newsletter signup is SaaS-template vocabulary and doesn't fit the curator voice. The site doesn't currently have a mailing list and won't be adding one in the redesign. If this component is wired somewhere, remove the wiring and delete the component. |
| `components/section-label.tsx` | §2.5: the mono-uppercase section label treatment is killed. If this component is just the eyebrow wrapper, it goes with `SiteBadge`. **Verify before deleting** — if it's used for a different functional purpose in any wiki/atlas page, keep it and restyle. |

**Verification note:** Before deleting any component in this table, grep for imports of it. Delete the imports and any markup that references it first, then delete the component file. Do not leave orphaned imports in rewritten files.

### 6.3 Components to rewrite (shell stays, contents change)

These components keep their file path and their name (so imports don't break during the transition), but their internals are rewritten completely to match the new design. Every `tsx` file in this list gets a new body in the first PR.

| Component | What it does now | What it becomes |
| --- | --- | --- |
| `components/navbar.tsx` | Current nav with brand mark, links, theme toggle | §3.2 nav: italic Fraunces brand, right-aligned links, active item in mustard, **no theme toggle**, **no search icon** (search moves into the Atlas page itself — the nav stays quiet) |
| `components/footer.tsx` | Current 4-column `Explore / Resources / Community` footer | §5.4 colophon: 3-column JetBrains Mono "who / what / when" pattern, no copyright, no nav-link duplication |
| `components/logo.tsx` | Current brand mark | Italic Fraunces `BASidekick` (no brackets inside the logo; brackets are only in the nav brand if used at all — TBD during implementation) |
| `components/views/home-view.tsx` | Current 3-section templated homepage | §3.2 full rewrite: manifesto hero + Atlas specimen + PointStack + "Also here" + colophon |
| `components/atlas/atlas-tabbed-view.tsx` | Current tabbed Atlas with `PageHero` + tabs | §3.3 full rewrite: title block strip + search + scope chips + grouped browse + footer row |
| `components/babel/babel-entry-card.tsx` | Current point-detail modal | §3.4.1 drawing-styled modal with mini title block strip, specimen field grid, action row, URL hint. **Same data, new chrome.** |
| `components/babel/babel-search.tsx` | Current search input | §3.3 reactive search implementation — client-side filter, matches name + aliases, auto-expands collapsed groups, live "X shown" counter |
| `components/babel/babel-sidebar.tsx` | Current sidebar | Either rewritten to the new category listing style or deleted if the grouped browse view makes it redundant. **Verify during implementation.** |
| `components/wiki/wiki-article-row.tsx` | Current wiki article row | §1.4 mono-glyph treatment: single-letter category glyph + mono category label + Fraunces title + sage snippet. No colored badges. |
| `components/wiki/wiki-tag-view.tsx` | Current tag view | Restyled to match the grouped browse pattern with the new typography and title block strip |
| `components/markdown-content.tsx` | Current wiki/article body renderer | Retypographed per §2.4 (Fraunces h2/h3, Manrope body, forest-on-cream code blocks, mustard blockquote rules, mustard link underlines) |
| `components/article-card.tsx` | Current article card | New compact row style for the wiki and news lists (see §3.3 per-page table) |
| `components/resource-card.tsx` | Current resource card | Restyled to the new card pattern; used in the Open Source and Resources pages |
| `components/header-search.tsx` | Current nav search | Either rewritten to a smaller inline search or removed from the nav entirely and replaced by the page-specific search on Atlas. **Verify during implementation.** |
| `components/alarm-banner.tsx` | Current alarm/notice banner | Restyled to the new color palette. Keep functionally — if this is a real notice/alert system it's valuable. **Verify during implementation.** |
| `components/nav.tsx` | Current mobile nav / menu | Restyled to match the new nav typography |
| `components/sidebar-footer.tsx` | Current sidebar footer (used on PointStack?) | Restyled. **Verify whether it's needed at all in the new PointStack layout.** |
| `components/atlas/atlas-breadcrumb.tsx` | Current Atlas breadcrumb | Restyled — the breadcrumb pattern is kept because nested equipment pages need it |
| `components/atlas/equipment-brand-view.tsx`, `equipment-type-view.tsx`, `equipment-model-view.tsx`, `equipment-browse-view.tsx` | Current equipment catalog views | Restyled to match the Atlas page's grouped browse + drawing modal pattern |
| `components/pointstack/feed/*.tsx` | Current PointStack feed components | §3.3 PointStack section: mixed card types (question / project / job), animated pulse on active items, live timestamps, activity ticker |
| `components/pointstack/questions/question-detail.tsx` | Current question detail page | §3.4.2 full-page pattern with threaded discussion |
| `components/pointstack/projects/project-detail.tsx` | Current project detail page | Same pattern as questions, with project-specific metadata |
| `components/pointstack/jobs/job-detail.tsx` | Current job detail page | Same pattern, with job-specific action (Apply) |

**Note:** All `components/pointstack/*` data components (form dialogs, messaging, notifications, avatars) are **preserved functionally** — they drive real features and their business logic doesn't change. They're restyled only. The drawing-strip vocabulary and the new palette apply.

### 6.4 Components that stay untouched

These don't need visual changes and have no "AI template" problems. Leave them alone.

- `components/ui/*` — shadcn primitives. The underlying Radix components keep working; they inherit the new palette via the globals.css variable changes in §6.5.
- `components/auth/*` — sign-in, sign-up, forgot-password, reset-password forms. Functional. Restyling happens passively through the new tokens.
- `components/pointstack/messenger/*` — real-time messaging, backend-heavy, visual changes come from the new palette
- `components/pointstack/notifications/notification-bell.tsx` — functional, restyled passively
- `components/pointstack/onboarding/onboarding-flow.tsx` — functional, restyled passively
- `components/pointstack/shared/*` — tag input, user avatar, vote button (all functional primitives)
- `components/babel/cleaner/*` — the point cleaner tool is a fully-functional workflow that has its own internal logic. Out of scope for the redesign; it gets the new palette automatically through the globals.css changes but no further work.
- `components/atlas/equipment-add-form.tsx`, `equipment-image-upload.tsx`, `equipment-notes.tsx`, `atlas-brand-logo.tsx` — functional forms and primitives
- `components/avatar-upload.tsx`, `components/user-avatar.tsx`, `components/bookmark-button.tsx`, `components/command-menu.tsx`, `components/kbd-hint.tsx` — utility components
- `components/providers/auth-provider.tsx` — auth context provider, infrastructure
- `components/views/account-view.tsx`, `calculators-view.tsx`, `references-view.tsx`, `tools-view.tsx`, `tool-detail-view.tsx`, `qrsidekick-privacy-view.tsx` — view components for pages that aren't in scope for this redesign

### 6.5 CSS — delete from `app/globals.css`

Delete these lines/blocks entirely. They're all replaced by tokens in §1.2 or made obsolete by the direction changes in §1–§4.

| What | Why |
| --- | --- |
| The entire `.dark { ... }` block (lines ~82–115) | §1.1: dark mode is killed |
| The `--wiki-*` variables (7 lines) in both `:root` and `.dark` | §1.4: wiki category colors are eliminated |
| `.gradient-text` class | §2.3: italic mustard replaces gradient text |
| `:is(.dark) .gradient-text` variant | same |
| `.gradient-glow` class | §4.5: no radial glows |
| `.card-hover-lift` class and its `:hover` rule | §3.1: lift-on-hover is a generic SaaS pattern; the new design uses border-color transitions instead. **Verify during implementation** — if removing it breaks cards that really need lift, keep it and restyle the shadow to use forest tokens. |
| `@keyframes marquee-scroll` | Used by the deleted `wiki-carousel.tsx`. Orphaned after that component is deleted. |
| `@keyframes fade-in-up`, `fade-in`, `scale-in` | **Verify before deleting.** These are generic entrance animations. They may still be used elsewhere. If so, keep. If only used by deleted components, remove. |
| `.animation-delay-*` utility classes (5 lines) | Same — verify usage, delete if orphaned |
| `.animate-on-scroll` class | Same — verify usage |
| The `:root` color variables from the current palette (lines ~45–79) | Replaced wholesale with the new D1 values from §1.2 |
| The `@import "highlight.js/styles/atom-one-dark.css";` line | The site is light-only now; the dark syntax-highlight theme doesn't match. Replace with a light theme: `@import "highlight.js/styles/github.css";` or similar. Pick the specific theme during implementation. |

### 6.6 CSS — add to `app/globals.css`

New rules to add, pulled from §1.2, §3.5, and §3.6:

- The full D1 palette in `:root` (§1.2)
- The title block strip styles (§3.5)
- The hero schematic placement CSS (§4.3)
- The `.tabular-nums` utility (§2.7)
- The spacing scale CSS variables (§3.6)
- Light-theme code highlighting (replace `atom-one-dark.css` import)

### 6.7 Fonts — replace in `app/layout.tsx`

Line 2 change:

```diff
- import { Space_Grotesk, Manrope, Space_Mono } from "next/font/google";
+ import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
```

And the font configuration:

- Replace `Space_Grotesk` → `Fraunces` with the `opsz`, `SOFT`, and weight axes enabled (Fraunces is a variable font)
- `Manrope` stays unchanged
- Replace `Space_Mono` → `JetBrains_Mono` with weights `400`, `500`, `700`
- CSS variable names stay the same (`--font-heading`, `--font-sans`, `--font-mono`) so no component class changes are needed
- Remove `<ThemeProvider>` from the body wrapper (§1.1: no dark mode)

### 6.8 Assets to add

- `/public/hero-schematic.avif` (and `.webp` fallback) — the AI-generated schematic from §4.4, resized to 2000px max dimension and converted to AVIF at quality 60 (target: < 300 KB)
- That is the only net-new binary asset the redesign requires.

### 6.9 Assets to remove

- Any image assets in `/public/` referenced only by deleted components — audit during implementation
- Old favicon / brand mark assets if they're being replaced; **verify before deleting** — keep the existing favicon unless Rob explicitly wants a new one

### 6.10 Things to verify during implementation

Items I couldn't confirm from the spec alone. Each needs a 30-second grep or read before making the delete/rewrite decision:

1. **Is `components/section-label.tsx` just the eyebrow wrapper, or does it have a functional use?** If functional, keep and restyle. If just a decorative label, delete with `SiteBadge`.
2. **Is `components/changelog.tsx` used anywhere besides the homepage widget?** If used on a dedicated `/changelog` page, rewrite instead of delete.
3. **Is `components/newsletter-signup.tsx` actually wired up anywhere?** If yes, determine whether the mailing list is real or aspirational. If aspirational, delete. If real, keep and restyle.
4. **Is `components/header-search.tsx` used in the nav?** If yes, decide whether to keep an inline nav search or remove it in favor of the Atlas-page search only.
5. **Are any of `.animate-fade-in-up`, `.animate-fade-in`, `.animate-scale-in`, `.animation-delay-*`, `.animate-on-scroll` still referenced by components that aren't being deleted?** If yes, keep the CSS. If no, delete.
6. **Is `.card-hover-lift` used on any cards in the new design?** Default is no — border-color transitions replace it. But verify before deleting the class.
7. **Is there a theme toggle component referenced outside `components/theme-toggle.tsx`?** Some layouts pass the toggle as a child or render it in the nav directly. Find all references and remove them alongside the provider.
8. **Do any current components rely on the deleted `--wiki-*` category color variables?** If yes, those references become dead code after the variables are removed. Grep for `wiki-networking`, `wiki-programming`, etc., before deleting the CSS variables, and clean up any inline style references.
9. **Does the current `SiteBadge` usage span more than just eyebrows?** If it's used for any per-item tagging elsewhere (e.g., badges on atlas cards), that needs a different replacement than just "delete entirely."
10. **Are there any routes or pages not mentioned in §3.3's inheritance table that also use `PageHero`?** (e.g., `calculators`, `references`, `tools`, `qrsidekick`.) Those pages are out of scope for the redesign but they import `PageHero` — deleting `PageHero` will break them. Either leave `PageHero` as a transitional shim that renders the new title-block-strip layout, or skip deleting it and come back to it in a follow-up PR that brings those pages into the new system.

### 6.11 Order of operations for the first PR

A suggested sequence for the implementation PR so nothing breaks mid-merge:

1. **Add new CSS tokens and fonts** — update `globals.css` with the D1 palette + delete `.dark` block, switch fonts in `layout.tsx`. Site will visually shift immediately (dark mode stops working, colors change) but no components break.
2. **Add the hero schematic asset** to `/public/`.
3. **Rewrite `navbar.tsx` and `footer.tsx`** — the shell components first, since every page depends on them.
4. **Rewrite `views/home-view.tsx`** — the homepage, including the new hero with schematic, specimen card, PointStack section, "Also here" row, colophon.
5. **Rewrite the Atlas pages** — `atlas-tabbed-view.tsx`, `babel-entry-card.tsx`, `babel-search.tsx`, equipment views. This is the largest single chunk of work.
6. **Rewrite News pages** — feed + article page (summary + link-out).
7. **Rewrite Wiki pages** — index, article pages, category views.
8. **Rewrite PointStack pages** — feed, question/project/job details, activity ticker.
9. **Delete all §6.2 components and their orphaned CSS.** Save for last so intermediate PRs still build.
10. **Do the §6.10 verification pass** — grep for each uncertain item, make the keep/delete call, commit.

Steps 3–8 can each be its own smaller PR if the first-PR change feels too large. The only strict dependency is that step 1 happens before everything else so the visual foundation is in place.
