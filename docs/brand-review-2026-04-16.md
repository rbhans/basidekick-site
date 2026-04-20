# BASidekick — Brand Review

**Reviewed:** April 16, 2026
**Scope:** Full brand audit (visual, voice, information architecture)
**Reviewer:** Claude, from repo source at `basidekick-site@0.1.0` (no live-site access this session — the Chrome extension was offline, so all findings come from source: `app/layout.tsx`, `app/globals.css`, `components/views/home-view.tsx`, `components/navbar.tsx`, `components/logo.tsx`, `components/brand-logo.tsx`, `public/brand/*`, and page metadata across `app/(main)/`.)

---

## Summary

**Overall:** The brand is distinctive, opinionated, and coherent in a way most BAS sites aren't. The editorial-meets-engineering-drawing aesthetic (Fraunces italic + JetBrains Mono field labels + parchment/sage/gold palette + numbered sections + "specimen" cards + `title-block` strip) creates a point of view you don't see anywhere else in this category. The voice — warm, plainspoken, slightly wry, signed by Rob — is the site's biggest asset.

**Biggest strengths:** A cohesive, unusual visual system with consistent type pairing, a tight color palette, and a voice that sounds like a person rather than a vendor. Numbered sections (01 / 02 / 03) give the home page real editorial rhythm.

**Most important improvements:** (1) Resolve the logo ambiguity — two different wordmarks live in the codebase and it's not clear which is canonical. (2) The tagline "*collected from next to the industry, not from inside it*" is poetic but risks alienating the actual BAS insiders who are your target audience — reframe as independence *from vendors*, not distance from the industry. (3) Fix inconsistent page-title patterns and a few accessibility edges (muted text contrast, missing `logo` in Organization JSON-LD).

---

## Brand system (as decoded)

**Name/lockup:** BASidekick, rendered in Fraunces italic semibold, with the `BA` in gold (`#c08621`) and `Sidekick` in dark sage (`#1f2920`). An alternate `Logo` component renders `[BASidekick]` in JetBrains Mono with a typing animation on hover.

**Palette:**
- Background parchment `#f1efe6`
- Foreground / primary dark sage `#1f2920`
- Secondary sage `#e2e3d3`
- Accent gold `#c08621`
- Muted sage `#5e6b58`
- Border `#d8d9c5`
- Destructive rust `#8b2914`

**Typography:**
- **Heading:** Fraunces (variable, italic-capable, Semibold 600 for display)
- **Body:** Manrope
- **Mono:** JetBrains Mono — used for section labels, pulse line, tabular figures, field metadata

**Voice attributes (inferred):**
- Plainspoken, craft-proud, slightly understated
- Modest pride: "*Smaller, but still loved.*", "*A quiet place to talk shop*", "*No hot takes*"
- Anti-corporate / anti-hype: "*the things nobody writes down*", "*specifically for BAS — not another general engineering forum*"
- First-person, personal: "— Rob, Tucson"
- Concrete and technical: "*800+ standardized point definitions with Haystack and Brick mappings*"

**Visual motifs:**
- Engineering-drawing "title block" strips (Drawing / Title / Crates / Drawn by R.H.)
- Numbered sections (`01 /`, `02 /`, `03 /`…)
- "Specimen" card (museum metaphor for the Atlas point on display)
- Live-dot pulse (gold, animated), count-ups, text-scramble on atlas names
- Hero schematic as 12%-opacity multiply backdrop

---

## Detailed findings

| # | Issue | Location | Severity | Suggestion |
|---|-------|----------|----------|------------|
| 1 | Two competing wordmarks in the codebase — `BrandLogo` (Fraunces italic, gold `BA`) and `Logo` (JetBrains Mono `[BASidekick]` with typing animation). Navbar uses the former; the latter still ships. | `components/logo.tsx`, `components/brand-logo.tsx`, `components/navbar.tsx` | **High** | Pick one canonical lockup. The italic `BrandLogo` is the stronger, more distinctive mark and matches the SVG brand assets in `public/brand/`. Delete `Logo`, or explicitly document it as a secondary/console-only variant. |
| 2 | Tagline frames the brand as "*collected from next to the industry, not from inside it*". This polarizes your actual audience (BAS integrators, controls techs, balancers) — they *are* inside the industry. The intent seems to be "independent of vendors", but that's not what it says. | `app/(main)/page.tsx` (via `home-view.tsx` H1) | **High** | Reframe as independence from vendors, not distance from practitioners. Draft: "*independent, not vendor-captured*" or "*built by a working BAS engineer, not a vendor*". |
| 3 | Page `<title>` patterns are inconsistent. Some use " | BASidekick" suffix, some don't, and casing/punctuation drifts ("BAS Atlas - Points & Equipment | BASidekick" vs. "PointStack - BAS Community" vs. "Open Source - BASidekick"). | `app/(main)/atlas/page.tsx`, `pointstack/page.tsx`, `wiki/page.tsx`, `open-source/page.tsx`, `news/page.tsx` | **Medium** | Adopt one pattern everywhere: `{Page} — BASidekick`. Use the em-dash (already used in the site tagline) and keep the suffix on every page for SEO and tab recognition. |
| 4 | Organization JSON-LD is missing `logo` and `sameAs` fields. Google and other search engines use these for knowledge panels and rich results. | `app/layout.tsx` (JSON-LD `@graph`) | **Medium** | Add `"logo": "https://basidekick.com/brand/wordmark-light.svg"` and a `"sameAs": [...]` array with GitHub and any other public profiles. |
| 5 | Muted text color `#5e6b58` on parchment `#f1efe6` at 11–12px mono type approaches the WCAG AA minimum for small text. Pulse line, field labels, and footer copy all use this combination. | `app/globals.css` (`--muted-foreground`), footer, title-block | **Medium** | Darken muted text ~5–8% toward `#4a5648` or similar. Re-run a contrast check — 4.5:1 for body text under 18px. |
| 6 | Fraunces italic is the site's signature, but it's used for H1, H2, pull quotes, link labels, empty-state messages, and byline. That's a lot of italic. Rhythm starts to flatten. | `components/views/home-view.tsx`, `components/pointstack/feed/feed-view.tsx` | **Medium** | Reserve italic for (a) the wordmark, (b) the one emphatic phrase per heading, and (c) marginalia/bylines. Upright Fraunces semibold or Manrope 600 is fine for everything else. |
| 7 | The product-name set (PointStack, Atlas, Babel, QRsidekick, pencilsite) skews inside-baseball. "Atlas" in particular doesn't telegraph "naming-standards reference" — it sounds geographic. | Nav links, home-view section headers | **Medium** | In the nav, pair each product name with a four-word descriptor on hover (or in a dropdown): "Atlas — point & equipment reference", "PointStack — community Q&A", etc. On the Atlas page itself, add one sentence under the H1 that explains what it is. |
| 8 | The "specimen / today's exhibit" museum metaphor is charming but unexplained. A first-time visitor has to infer why a BAS reference uses cabinet-of-curiosities language. | `home-view.tsx` §01, atlas card | **Low** | Add a single sentence somewhere visible ("We publish one atlas point a day — today's specimen:") or keep the metaphor and move on. Either decision is better than the current halfway state. |
| 9 | Homepage byline "*— Rob, Tucson*" is charming but creates ambiguity on first visit: is this a personal blog or a product? Footer clarifies ("Built and maintained by Rob Hansen, Tucson") but the hero doesn't. | `home-view.tsx` hero | **Low** | Either (a) drop the byline from the hero and let the footer do that work, or (b) make it explicit: "*— Rob Hansen, BASidekick's sole maintainer, Tucson*". |
| 10 | Meta `keywords` array in layout metadata. Search engines stopped using meta keywords a long time ago; it's inert at best, and looks dated. | `app/layout.tsx` | **Low** | Remove the `keywords` array. Trust the title, description, H1, and body copy to rank. |
| 11 | Footer has no Privacy, Terms, or Contact link (only an email and a personal site). PointStack takes auth and user posts, which usually triggers a minimum-viable privacy page. | `components/footer.tsx` | **Medium** | Add "Privacy", "Terms" (even short, honest ones) and link the existing qrsidekick privacy view from a top-level `/privacy`. |
| 12 | Accent gold is used for section-number "01 /", active nav state, live-dot, underline-decoration, hover link color, brand mark prefix, and field labels in the specimen card. That's a lot of jobs for one color. It reads coherently because the palette is tight, but the accent is doing heavy lifting. | throughout | **Low** | Audit: is there a second accent (muted sage, or a warmer brass) that could carry "metadata / label" roles, leaving gold for action/emphasis only? This is taste, not a defect. |
| 13 | "Join the community →" CTA under the PointStack section is the most generic SaaS sentence on the page. Every other CTA has voice ("Browse the Atlas", "Read the feed", "View on GitHub"). | `home-view.tsx` §02 | **Low** | Replace with something voicier: "*See what's on PointStack →*" or "*Pull up a chair →*". |
| 14 | Navbar brand link has no accessible name beyond the SVG wordmark (good), but the wordmark ships as text nodes inside `BrandLogo` with `aria-label="BASidekick"`. OK for text. Screen-reader testing on the whole navbar would still be worthwhile. | `components/navbar.tsx`, `brand-logo.tsx` | **Low** | When you run an a11y pass, include a focus-order check and verify that the live-dot pulse is marked `aria-hidden` (it is — good). |
| 15 | News page description ("The latest building automation news, curated by AI and the community") is the only place the site explicitly names AI curation. Not wrong, but inconsistent with the otherwise human-made framing elsewhere. | `app/(main)/news/page.tsx` | **Low** | Decide: is AI involvement part of the brand story, or a behind-the-scenes detail? Either amplify it honestly ("*LLM-sorted, human-reviewed*") or soften it. |
| 16 | Two independent Chrome-control MCPs suggest past tooling experimentation, but from a brand standpoint: the favicon/apple-icon are programmatically generated (`app/icon.tsx`, `app/apple-icon.tsx`). Worth checking that they render the same `BA` + `Sidekick` split you use in `BrandLogo` — otherwise the browser-tab brand doesn't match. | `app/icon.tsx`, `apple-icon.tsx`, `opengraph-image.tsx` | **Medium** | Verify icon + og image match the `BrandLogo` mark. `public/brand/social-banner.svg` looks correct; make sure `opengraph-image.tsx` renders or serves that asset. |

---

## Revised sections (before → after)

### 1. Hero H1

**Before:**
> BAS info, community, and resources — *collected from next to the industry*, not from inside it.

**After (option A — independence framing):**
> BAS info, community, and resources — *built by a working engineer*, independent of any vendor.

**After (option B — plainer):**
> The BAS reference, community, and toolkit *nobody got around to making*. So I did.

**Why:** Keeps the one-italicized-phrase rhythm you've already set. Option A converts "outsider" into "independent", which is the defensible claim. Option B leans into the personal-project honesty that the byline already hints at and makes the single-maintainer story an asset rather than a complication.

### 2. PointStack section CTA

**Before:**
> Join the community →

**After:**
> See what's on PointStack →

**Why:** Matches the voice of surrounding CTAs ("Browse the Atlas", "Read the feed"). "Join the community" is what every generic SaaS says; the rest of your copy is better than that.

### 3. "Also here" header

**Before:**
> Also here. *Smaller, but still loved.*

**After:** Keep it. This line is one of the best on the site — lowercase humility + unapologetic fondness. No change recommended.

### 4. Page title pattern

**Before (current mix):**
- `"BAS Atlas - Points & Equipment | BASidekick"`
- `"PointStack - BAS Community"`
- `"BAS Wiki - Knowledge Base | BASidekick"`
- `"Open Source - BASidekick"`

**After (canonical):**
- `"Atlas — BASidekick"`
- `"PointStack — BASidekick"`
- `"Wiki — BASidekick"`
- `"Open Source — BASidekick"`
- `"News — BASidekick"`

**Why:** Em-dash matches your hero typography. Uniform suffix helps tab recognition and brand repetition in SERPs. The "Points & Equipment" / "Knowledge Base" qualifiers belong in the meta description, not the title — they clutter the tab.

### 5. Organization JSON-LD

**Before:**
```json
{
  "@type": "Organization",
  "@id": "https://basidekick.com/#organization",
  "name": "BASidekick",
  "url": "https://basidekick.com",
  "description": "BAS info, community, and resources collected from next to the industry. Curated by Rob Hansen in Tucson."
}
```

**After:**
```json
{
  "@type": "Organization",
  "@id": "https://basidekick.com/#organization",
  "name": "BASidekick",
  "url": "https://basidekick.com",
  "logo": "https://basidekick.com/brand/wordmark-light.svg",
  "description": "Independent BAS reference, community, and open-source toolkit. Maintained by Rob Hansen in Tucson.",
  "founder": {
    "@type": "Person",
    "name": "Rob Hansen"
  },
  "sameAs": [
    "https://github.com/rbhans",
    "https://rbhans.github.io"
  ]
}
```

---

## Legal / compliance flags

None of these are showstoppers, but they're worth a pass before any paid advertising or growth push.

**Unsubstantiated superlatives.** None found in the homepage copy — the tone is already modest. Good.

**Privacy.** PointStack takes accounts, stores posts, and the site uses Vercel Analytics and Supabase. There's no `/privacy` linked from the footer. A short, honest privacy page ("what we collect, why, and how to delete it") is the minimum for a community platform. You have `components/views/qrsidekick-privacy-view.tsx` suggesting the awareness exists — extend it site-wide.

**Claims around "open source".** The footer says "Open source where it matters. Pull requests welcome on every public repo." Verify this is true for the repos you name (rustbac, rustmod, experimental BMS) and that each has a visible license file. If the BASidekick site itself is not open source, the wording could read as broader than intended.

**Testimonials.** None found, so nothing to flag. If you add any, make sure they're attributed with consent.

---

## After this review

Would you like me to:

- **Apply the high-severity fixes directly** — resolve the duplicate logo, update the hero H1, standardize page titles, and patch the Organization JSON-LD?
- **Write a short brand style guide** (1–2 pages) capturing the voice attributes, palette, type scale, and "do/don't" examples so future copy can be checked against something concrete?
- **Focus on accessibility** — run a proper contrast + focus-order audit on the live site once the Chrome extension is reachable?
- **Go deeper on one section** — e.g., a full content review of the Wiki or Atlas landing pages?

---

[View this report](computer:///Users/benhansen/github/basidekick-site/docs/brand-review-2026-04-16.md)
