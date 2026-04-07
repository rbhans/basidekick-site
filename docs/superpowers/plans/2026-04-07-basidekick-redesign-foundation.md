# BASidekick Redesign — Plan 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the new visual foundation — D1 palette, Fraunces/Manrope/JetBrains Mono fonts, kill dark mode, add the hero schematic asset, rewrite the global nav and footer, and rebuild the homepage with the manifesto hero + Atlas-today specimen + PointStack section + "Also here" row + colophon. After this plan ships, the homepage and the global shell read as the new design; every other page still works but renders in the new palette with its old layout (an intentional, acknowledged transitional state per the design spec).

**Architecture:** This is a CSS-token + font-swap + targeted-component-rewrite job inside a Next.js 16 / React 19 / Tailwind v4 codebase. No new libraries, no schema changes, no new routes. The shadcn UI primitives in `components/ui/*` inherit the new palette automatically through the CSS variable changes in `app/globals.css`. The `home-view.tsx` is a `"use client"` component that receives data from the existing async server-side `app/(main)/page.tsx` — that data fetching stays mostly the same with one additional field added (a featured atlas entry).

**Tech Stack:** Next.js 16.1, React 19.2, TypeScript 5, Tailwind CSS v4, shadcn/ui, Phosphor Icons, Supabase, `next/font/google`, `pnpm` 10.29.

**Spec reference:** All decisions in this plan are driven by `docs/superpowers/specs/2026-04-07-basidekick-redesign-design.md` — sections §1 (palette), §2 (typography), §3.2 (homepage structure), §3.5 (title block strip), §4 (imagery), §5.4 (homepage rewrites), §6.7 (font replacement), §6.11 (order of operations).

**Verification model:** This plan does not add unit tests for visual components. The codebase doesn't have a component test framework set up, and TDD-for-CSS is not productive. Each task gates on:

1. **`pnpm build`** succeeds (catches compile + type errors)
2. **`pnpm lint`** succeeds (catches lint + atlas-brand-logo validation)
3. **Manual visual inspection** in the dev server (`pnpm dev`, browse to the affected route, eyeball it)

If any task introduces server-side data logic, that logic gets a real test. None of Task 1–13 in this plan touch server logic deeply enough to need one.

---

## Task 1: Create the working branch and verify clean baseline

**Files:**
- No file changes — git operations only

**Why:** The redesign is a multi-PR effort. We work on a feature branch so the main branch stays shippable, and we confirm the baseline build is green before changing anything so we know any later breakage is ours.

- [ ] **Step 1: Verify the working tree is clean**

Run:
```bash
cd /Users/benhansen/github/basidekick-site
git status
```

Expected output: `nothing to commit, working tree clean` on `branch main`. If there are uncommitted changes (the `M components/footer.tsx` and `?? scripts/improve-wiki-diagrams.mjs` from the initial gitStatus snapshot), confirm with the user whether to stash, commit, or discard them before proceeding. **Do not bulldoze in-progress work.**

- [ ] **Step 2: Create the redesign feature branch**

Run:
```bash
git checkout -b redesign/foundation
```

Expected: `Switched to a new branch 'redesign/foundation'`

- [ ] **Step 3: Run the baseline build to confirm green**

Run:
```bash
pnpm install
pnpm build
```

Expected: build succeeds. If it fails, **stop and surface the failure to the user** — we need a green baseline before any redesign changes.

- [ ] **Step 4: Run the baseline lint**

Run:
```bash
pnpm lint
```

Expected: lint passes. Note that `pnpm lint` includes `validate:atlas-brand-logos` (a custom check for atlas brand logo presence). If it fails because of missing brand logos unrelated to this work, document the failure and ask the user whether to address it now or skip past it.

---

## Task 2: Replace `app/globals.css` color tokens with the D1 palette

**Files:**
- Modify: `app/globals.css`

**Why:** This is the foundational change. Updating the CSS variables changes the entire site's palette in one shot — every component that uses `var(--background)`, `var(--primary)`, etc., picks up the new values automatically. The `.dark` block goes away because we're killing dark mode entirely. The `--wiki-*` category color variables (7 of them) go away because §1.4 eliminates the colored category badge system.

- [ ] **Step 1: Read the current `app/globals.css`**

Run: read the file to confirm the current state matches what the spec assumes. Specifically verify:
- The `:root` block has variables matching the current dark template (lime primary, etc.)
- A `.dark` block exists with dark mode overrides
- The `--wiki-*` variables exist in both `:root` and `.dark`
- A `.gradient-text` and `.gradient-glow` class exist

If any of these don't match, **flag it before proceeding** — the spec was written against a specific snapshot.

- [ ] **Step 2: Replace the `:root` block with the D1 palette**

Find the existing `:root { ... }` block (currently has the white-and-lime light variant) and replace it entirely with:

```css
:root {
  --background: #f1efe6;
  --foreground: #1f2920;
  --card: #fbfaf5;
  --card-foreground: #1f2920;
  --popover: #fbfaf5;
  --popover-foreground: #1f2920;
  --primary: #1f2920;
  --primary-foreground: #f1efe6;
  --secondary: #e2e3d3;
  --secondary-foreground: #1f2920;
  --muted: #e2e3d3;
  --muted-foreground: #5e6b58;
  --accent: #c08621;
  --accent-foreground: #1f2920;
  --destructive: #8b2914;
  --destructive-foreground: #f1efe6;
  --border: #d8d9c5;
  --input: #d8d9c5;
  --ring: #c08621;
  --chart-1: #1f2920;
  --chart-2: #5e6b58;
  --chart-3: #9a7a3a;
  --chart-4: #c08621;
  --chart-5: #a3530c;
  --radius: 0.5rem;
}
```

- [ ] **Step 3: Delete the `.dark` block entirely**

Find the `.dark { ... }` block (it spans roughly 30 lines with all the dark mode overrides plus the `--wiki-*` variants) and delete it completely. **Do not leave a stub.** Dark mode is killed.

- [ ] **Step 4: Delete the `--wiki-*` variables from `:root`**

The current `:root` block also defines `--wiki-networking`, `--wiki-programming`, `--wiki-standards`, `--wiki-commissioning`, `--wiki-cybersecurity`, `--wiki-troubleshooting`, `--wiki-best-practices`. These are not in the new `:root` block above (which is correct — they're being deleted per §1.4). Confirm the new `:root` does not contain any `--wiki-*` lines.

- [ ] **Step 5: Delete the `.gradient-text`, `.gradient-glow`, and `.card-hover-lift` classes**

Find and delete:

```css
.gradient-text { ... }
:is(.dark) .gradient-text { ... }
.gradient-glow { ... }
.card-hover-lift { ... }
.card-hover-lift:hover { ... }
```

These are all replaced by the new italic-mustard hero treatment (§2.3) and border-color hover transitions instead of lift shadows.

- [ ] **Step 6: Delete the `@keyframes marquee-scroll` block**

Find:
```css
@keyframes marquee-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
```

Delete it. It was used by the wiki carousel which is being deleted in Task 11.

- [ ] **Step 7: Replace the dark syntax-highlight theme import**

At the top of the file, find:

```css
@import "highlight.js/styles/atom-one-dark.css";
```

Replace with:

```css
@import "highlight.js/styles/github.css";
```

This is the light-theme equivalent of `atom-one-dark` and harmonizes with cream backgrounds. If `github.css` looks wrong against the new palette during visual inspection, swap to `vs.css` or `stackoverflow-light.css` — both ship with `highlight.js`.

- [ ] **Step 8: Run `pnpm build` to verify nothing exploded**

Run:
```bash
pnpm build
```

Expected: build succeeds. The site will look completely different now — pages render in cream/forest/mustard instead of dark/lime, but no compile errors. **The Atlas, Wiki, News, PointStack pages will look strange (sage palette + old layout). This is the documented transitional state from the plan brief — do not panic.**

- [ ] **Step 9: Commit**

```bash
git add app/globals.css
git commit -m "$(cat <<'EOF'
feat(redesign): swap palette to D1 (sage cream + forest + mustard)

- Replace :root color variables with D1 palette per spec §1.2
- Delete .dark block (dark mode killed per spec §1.1)
- Delete --wiki-* category color variables (7) per spec §1.4
- Delete .gradient-text, .gradient-glow, .card-hover-lift classes
- Delete @keyframes marquee-scroll (orphaned by wiki-carousel deletion)
- Replace atom-one-dark.css highlight theme with github.css

This is a foundational change. Every page on the site now renders in
the new palette but with its old layout. The homepage and shell get
their layout rewrites in subsequent tasks; other pages will be brought
into the new design system in subsequent plans (Atlas, News, Wiki,
PointStack).

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Add new utility classes and the title block strip styles to `app/globals.css`

**Files:**
- Modify: `app/globals.css`

**Why:** §3.5 specifies the title block strip as a recurring graphic pattern, §4.3 specifies the hero schematic placement CSS, and §2.7 specifies the tabular-nums utility. These rules don't fit neatly into existing components and want to live in `globals.css` so they're available everywhere without per-component duplication.

- [ ] **Step 1: Add the title block strip styles to `app/globals.css`**

Append to the bottom of the file (after the `@layer base` block, before any `@media (prefers-reduced-motion)` block):

```css
/* ============ Title block strip — see spec §3.5 ============ */
.title-block {
  background: var(--secondary);
  border-bottom: 1px solid var(--border);
  padding: 14px clamp(1rem, 4vw, 64px);
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
.title-block .live-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  margin-right: 6px;
  vertical-align: middle;
  position: relative;
  top: -1px;
  box-shadow: 0 0 0 0 hsl(from var(--accent) h s l / 0.5);
  animation: bsk-pulse 2.4s ease-out infinite;
}

@keyframes bsk-pulse {
  0% { box-shadow: 0 0 0 0 hsl(from var(--accent) h s l / 0.55); }
  100% { box-shadow: 0 0 0 8px hsl(from var(--accent) h s l / 0); }
}
```

- [ ] **Step 2: Add the hero schematic placement CSS**

Append below the title block styles:

```css
/* ============ Hero schematic background — see spec §4.3 ============ */
.hero-wrap {
  position: relative;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background-image: url('/hero-schematic.jpg');
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
    hsl(from var(--background) h s l / 0.85) 25%,
    hsl(from var(--background) h s l / 0) 55%
  );
}
```

The asset path is `/hero-schematic.jpg` because we're going to add a JPEG version in Task 6 (smaller than PNG, perfectly fine for a 12%-opacity background).

- [ ] **Step 3: Add tabular-nums utility**

Append:

```css
/* ============ Tabular figures — see spec §2.7 ============ */
.tabular-nums {
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 4: Run `pnpm build`**

```bash
pnpm build
```

Expected: build succeeds. None of these new rules are referenced yet, so visually nothing changes. We're staging the styles for the rewrites in Tasks 7–9.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "$(cat <<'EOF'
feat(redesign): add title block strip, hero placement, tabular-nums utilities

- .title-block, .field, .live-dot, @keyframes bsk-pulse per spec §3.5
- .hero-wrap, .hero-bg with multiply blend + cream gradient mask per spec §4.3
- .tabular-nums utility per spec §2.7

These are referenced by the navbar/footer/homepage rewrites that follow.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Replace fonts and remove `<ThemeProvider>` in `app/layout.tsx`

**Files:**
- Modify: `app/layout.tsx`

**Why:** §6.7 mandates the font swap (Space Grotesk → Fraunces, Space Mono → JetBrains Mono, Manrope unchanged). §1.1 mandates removing dark mode entirely, which means removing the `<ThemeProvider>` wrapper. The CSS variable names (`--font-heading`, `--font-sans`, `--font-mono`) stay the same so no Tailwind class names need to change.

- [ ] **Step 1: Read the current `app/layout.tsx`**

Confirm the current state has:
- Line 2: `import { Space_Grotesk, Manrope, Space_Mono } from "next/font/google";`
- Line 4: `import { ThemeProvider } from "@/components/theme-provider";`
- Lines 9–25: three font config blocks
- Line 54: `<html lang="en" suppressHydrationWarning>`
- Lines 83–91: `<ThemeProvider>` wrapper

If the file structure has drifted, adapt the next steps to match.

- [ ] **Step 2: Replace the font import line**

Change line 2 from:
```tsx
import { Space_Grotesk, Manrope, Space_Mono } from "next/font/google";
```

to:
```tsx
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
```

- [ ] **Step 3: Delete the `ThemeProvider` import**

Delete line 4 (`import { ThemeProvider } from "@/components/theme-provider";`).

- [ ] **Step 4: Replace the three font configuration blocks**

Replace lines 9–25 with:

```tsx
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
  variable: "--font-heading",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});
```

Notes:
- Fraunces gets the `opsz` (optical size) and `SOFT` (softness) axes for the `font-variation-settings` rules in §2.4. Italic is enabled because the hero highlight word uses italic.
- Manrope drops weights `300` and `800` (we don't use them in §2.4's type scale) but keeps the rest. Trimming weights reduces font payload.
- JetBrains Mono gets `500` in addition to `400` and `700` because §2.4 specifies `JetBrains Mono 500` for eyebrow labels.

- [ ] **Step 5: Update the body className and remove the `<ThemeProvider>` wrapper**

Find the `<body>` line (currently `className={\`${spaceGrotesk.variable} ${manrope.variable} ${spaceMono.variable} font-sans antialiased\`}`) and replace it with:

```tsx
<body className={`${fraunces.variable} ${manrope.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
```

Then find the `<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>` block (lines ~83–91) and replace it. The new structure inside `<body>` should be:

```tsx
<body className={`${fraunces.variable} ${manrope.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        // ... existing JSON-LD content unchanged
      }),
    }}
  />
  <AuthProvider>{children}</AuthProvider>
  <Toaster />
  <Analytics />
</body>
```

The `<ThemeProvider>` is gone — `<AuthProvider>{children}</AuthProvider>` and `<Toaster />` are now direct children of `<body>` instead of wrapped in the theme provider.

- [ ] **Step 6: Remove `suppressHydrationWarning` from the `<html>` element**

Change line 54 from:
```tsx
<html lang="en" suppressHydrationWarning>
```

to:
```tsx
<html lang="en">
```

`suppressHydrationWarning` was needed because `next-themes` mutates `<html>`'s class attribute on the client and that would otherwise trigger a hydration mismatch. Without dark mode, there's no longer a reason to suppress hydration warnings — and silently suppressing them is bad practice (we want real hydration mismatches to surface).

- [ ] **Step 7: Update the JSON-LD organization description**

The current JSON-LD has `description: "Tools, community, and knowledge for building automation professionals."` (the banned phrase). Update it to match the new colophon copy:

Find:
```tsx
description:
  "Tools, community, and knowledge for building automation professionals.",
```

Replace with:
```tsx
description:
  "BAS info, community, and resources collected from next to the industry. Curated by Rob Hansen in Tucson.",
```

- [ ] **Step 8: Update `metadata.title` and `metadata.description`**

The current metadata has banned phrases like `"Tools for BAS Professionals"` and `"QA tools for building automation professionals. No subscriptions. No bloat. Software that works."`. Update them to match the new voice.

Find:
```tsx
export const metadata: Metadata = {
  title: "BASidekick - Tools for BAS Professionals",
  description: "QA tools for building automation professionals. No subscriptions. No bloat. Software that works.",
  // ...
```

Replace the title and description (keep the rest of the metadata block intact):

```tsx
export const metadata: Metadata = {
  title: "BASidekick — BAS info, community, and resources",
  description: "BAS info, community, and resources collected from next to the industry. Curated by Rob Hansen in Tucson.",
  keywords: ["BAS", "building automation", "Niagara", "Metasys", "BACnet", "atlas", "wiki"],
  metadataBase: new URL("https://basidekick.com"),
  openGraph: {
    title: "BASidekick — BAS info, community, and resources",
    description: "BAS info, community, and resources collected from next to the industry.",
    siteName: "BASidekick",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BASidekick — BAS info, community, and resources",
    description: "BAS info, community, and resources collected from next to the industry.",
  },
  // ... canonical unchanged
};
```

- [ ] **Step 9: Run `pnpm build`**

```bash
pnpm build
```

**Expected: build will likely fail** because `components/ui/sonner.tsx` imports `useTheme` from `next-themes` and that import still works (`next-themes` is still in package.json) but the runtime context provider is no longer present, so `useTheme()` returns `undefined` for the theme prop. Sonner handles this gracefully (defaults to system) but the import is now stale and we should clean it up — that happens in Task 5.

If the build succeeds (which it might, since `next-themes` doesn't strictly require the provider), proceed. If it fails with an actual error, surface it.

- [ ] **Step 10: Commit**

```bash
git add app/layout.tsx
git commit -m "$(cat <<'EOF'
feat(redesign): swap fonts and remove ThemeProvider in layout

- Replace Space_Grotesk → Fraunces (with opsz + SOFT axes + italic)
- Replace Space_Mono → JetBrains_Mono (add weight 500 for eyebrow labels)
- Trim Manrope to weights 400/500/600/700
- Remove ThemeProvider wrapper (dark mode killed per spec §1.1)
- Remove suppressHydrationWarning from <html> (no longer needed)
- Rewrite metadata title, description, and JSON-LD organization
  description to match new copy voice (spec §5.4)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Remove `next-themes` usage from `components/ui/sonner.tsx`

**Files:**
- Modify: `components/ui/sonner.tsx`

**Why:** sonner uses `useTheme()` from `next-themes` to set the toaster's theme. Now that we've removed `<ThemeProvider>`, that hook is unnecessary — and the spec is light-only. Hardcoding `theme="light"` removes the last `next-themes` runtime dependency from the codebase.

- [ ] **Step 1: Read the current `components/ui/sonner.tsx`**

Confirm the file imports `useTheme` from `next-themes` and uses it to compute a `theme` prop on the `<Sonner>` component.

- [ ] **Step 2: Remove the `useTheme` import and usage**

Replace the file's contents with this minimal version:

```tsx
"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
```

If the existing file has additional props or class manipulation beyond what's shown here, preserve those — the only goals are: (a) remove the `useTheme` import, (b) hardcode `theme="light"`, (c) remove any theme-related conditional logic.

- [ ] **Step 3: Run `pnpm build`**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add components/ui/sonner.tsx
git commit -m "$(cat <<'EOF'
chore(redesign): hardcode sonner theme to light, drop useTheme dependency

The site is light-only now. sonner doesn't need next-themes anymore.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Add the hero schematic asset to `/public/`

**Files:**
- Create: `public/hero-schematic.jpg`

**Why:** §4 specifies a single hero image for the homepage. The file needs to live in `/public/` so it's served at `/hero-schematic.jpg`, which matches the URL referenced in the `.hero-bg` CSS we added in Task 3.

The user has the source PNG locally. We resize and convert to JPEG via macOS's built-in `sips` tool — JPEG at quality 85 lands in the 300–600 KB range, which is fine for a once-per-session decorative background. AVIF/WebP optimization can happen as a follow-up.

- [ ] **Step 1: Verify the source file exists**

Run:
```bash
ls -la "/Users/benhansen/Downloads/HVAC_Control_Diagram_This_is_a_schematic_diagram_detailing_the_AHU-1_LeSucSsV.png" 2>/dev/null || ls /tmp/hero-schematic-resized.png 2>/dev/null || echo "NOT FOUND"
```

Expected: at least one of the files exists. If both are missing, ask the user where the source PNG is. If the user has moved it to a different path, use that path in step 2 instead.

- [ ] **Step 2: Resize and convert to JPEG, place in `public/`**

Run:
```bash
SRC="/Users/benhansen/Downloads/HVAC_Control_Diagram_This_is_a_schematic_diagram_detailing_the_AHU-1_LeSucSsV.png"
[ -f "$SRC" ] || SRC="/tmp/hero-schematic-resized.png"

sips -s format jpeg -s formatOptions 85 -Z 2000 "$SRC" --out /Users/benhansen/github/basidekick-site/public/hero-schematic.jpg
```

Expected: command completes silently, produces `public/hero-schematic.jpg`. Verify size with `ls -lh public/hero-schematic.jpg` — should be 300 KB to 1 MB, max dimension 2000px.

If `sips` is not available (non-macOS), substitute:
```bash
# Using ImageMagick
magick "$SRC" -resize 2000x2000\> -quality 85 public/hero-schematic.jpg
```

- [ ] **Step 3: Visually inspect the converted file**

Run:
```bash
file public/hero-schematic.jpg
ls -lh public/hero-schematic.jpg
```

Expected: `JPEG image data, JFIF standard ..., precision 8, 2000x... ` and a sane file size.

Open the file in any image viewer (Preview on macOS) and confirm the content is the same hand-drawn schematic — AHU, VAV boxes, DDC controller, title block in the bottom-right with the coffee stain. If the output looks corrupted, regenerate at lower quality or smaller size.

- [ ] **Step 4: Commit the binary asset**

```bash
git add public/hero-schematic.jpg
git commit -m "$(cat <<'EOF'
feat(redesign): add hero schematic image asset

A vintage HVAC control schematic on aged cream paper, generated per
the prompt in spec §4.4. Used as the faded background of the homepage
hero (12% opacity, multiply blend, right-anchored, left-side gradient
mask). 2000px wide JPEG at quality 85. The aged paper harmonizes with
the D1 cream background via mix-blend-mode.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Rewrite `components/navbar.tsx`

**Files:**
- Modify: `components/navbar.tsx`

**Why:** §3.2 specifies a slim nav with an italic Fraunces brand mark, right-aligned text-only links, mustard active state, and **no theme toggle**. The current navbar has icons inline next to every link, a Sun/Moon theme toggle, and a brand mark in the heading font. We rewrite it but **preserve the functional pieces**: mobile drawer, user menu, NotificationBell, HeaderSearch, sign-in button, admin route check.

- [ ] **Step 1: Read the current `components/navbar.tsx`**

Confirm the structure matches what was captured in the spec drafting session: `useTheme` from `next-themes`, icons inline in `NAV_LINKS`, theme toggle button, mobile drawer, user dropdown.

- [ ] **Step 2: Replace the entire file with the new navbar**

Write the full file contents:

```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { List, X, SignOut, Gear, ShieldCheck } from "@phosphor-icons/react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { NotificationBell } from "@/components/pointstack/notifications/notification-bell";
import { HeaderSearch } from "./header-search";
import { ROUTES } from "@/lib/routes";

const NAV_LINKS: { href: string; label: string }[] = [
  { href: ROUTES.ATLAS, label: "Atlas" },
  { href: ROUTES.POINTSTACK, label: "PointStack" },
  { href: ROUTES.WIKI, label: "Wiki" },
  { href: ROUTES.NEWS, label: "News" },
  { href: ROUTES.OPEN_SOURCE, label: "Open Source" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const supabase = createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setIsAdmin(profile?.role === "admin");
    };
    checkAdmin();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header className="sticky top-0 z-50 px-4 sm:px-6 lg:px-16 py-5 border-b border-border bg-background flex items-center gap-8">
        {/* Brand — italic Fraunces */}
        <Link
          href="/"
          className="font-heading italic text-[22px] font-semibold tracking-tight text-foreground hover:text-accent transition-colors shrink-0"
        >
          BASidekick
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-8 ml-auto">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[14px] font-medium transition-colors ${
                isActive(link.href)
                  ? "text-accent"
                  : "text-foreground hover:text-accent"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster: search, notifications, user menu */}
        <div className="flex items-center gap-3 shrink-0 md:ml-6 ml-auto">
          <div className="hidden sm:block">
            <HeaderSearch />
          </div>

          {user && <NotificationBell />}

          {!authLoading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 relative"
                    aria-label="User menu"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-mono text-xs font-medium">
                      {getUserInitials()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(ROUTES.ACCOUNT)}>
                    <Gear className="w-4 h-4 mr-2" />
                    Account
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => router.push(ROUTES.ADMIN)}>
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <SignOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                onClick={() => router.push(ROUTES.SIGNIN)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm px-4 rounded-md"
              >
                Sign in
              </Button>
            )
          )}

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <List className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-foreground/50" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 z-50 w-[280px] bg-background border-l border-border flex flex-col">
            <div className="px-4 py-5 flex items-center justify-between border-b border-border">
              <span className="font-heading italic text-[20px] font-semibold tracking-tight">BASidekick</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-md text-[15px] font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-accent"
                      : "text-foreground hover:text-accent hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-border">
              <div className="sm:hidden mb-3">
                <HeaderSearch />
              </div>
              {!authLoading && !user && (
                <Button
                  className="w-full"
                  onClick={() => { router.push(ROUTES.SIGNIN); setMobileOpen(false); }}
                >
                  Sign in
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
```

Notes on what changed from the original:
- **Removed:** `useTheme`, `Sun`, `Moon`, all theme toggle button code, all icons inline next to nav links (`GlobeHemisphereWest`, `Newspaper`, `Code`, `UsersThree`, `BookOpenText`)
- **Removed:** the `MagnifyingGlass` icon import (was unused in the original anyway)
- **Removed:** the `Icon` type import from Phosphor (no longer needed since `NAV_LINKS` doesn't carry icons)
- **Reordered:** the link order from `Atlas / News / Open Source / PointStack Social / Wiki` to `Atlas / PointStack / Wiki / News / Open Source` per the homepage mockups
- **Renamed:** `PointStack Social` → `PointStack` (cleaner)
- **Brand mark:** italic Fraunces 22px instead of 18px Space Grotesk in brackets
- **Active state:** mustard text only (no background tint), via `text-accent`
- **Signed-in initial avatar:** changed from heading font to mono font (more consistent with the title block strip vocabulary)
- **Sign in button:** lowercased label, `rounded-md` instead of unspecified
- **Mobile drawer brand:** italic Fraunces 20px (matching the desktop brand)
- **Mobile drawer backdrop:** `bg-foreground/50` instead of `bg-black/50` (uses the new D1 forest as the dimmer)

- [ ] **Step 3: Run `pnpm build`**

```bash
pnpm build
```

Expected: build succeeds. If it fails on an unused import or missing icon, fix and rebuild. Common issue: leaving an unused `Icon` type import — TypeScript will catch this.

- [ ] **Step 4: Run `pnpm dev` and visually inspect the navbar**

Run:
```bash
pnpm dev
```

In a browser, open `http://localhost:3000`. Confirm:
- Brand mark is `BASidekick` in italic Fraunces (serif), not the bracketed Space Grotesk version
- Nav links are right-aligned, text-only (no icons)
- Active route (currently `/`) shows in mustard
- Hover on nav links transitions to mustard
- Sign in button is forest-on-cream
- No theme toggle
- Mobile drawer (resize browser narrow, click hamburger) opens with the same styling

Stop the dev server when satisfied.

- [ ] **Step 5: Commit**

```bash
git add components/navbar.tsx
git commit -m "$(cat <<'EOF'
feat(redesign): rewrite navbar per spec §3.2

- Italic Fraunces brand mark
- Text-only nav links, right-aligned
- Mustard active state, mustard hover
- Remove theme toggle and useTheme dependency
- Reorder links: Atlas / PointStack / Wiki / News / Open Source
- Mobile drawer restyled to match
- Preserve user menu, NotificationBell, HeaderSearch, sign-in flow

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Rewrite `components/footer.tsx` as the colophon

**Files:**
- Modify: `components/footer.tsx`

**Why:** §3.2 ends every page with a colophon — a 3-column JetBrains Mono "who built it / open source line / last updated" pattern. This replaces the current 4-column "Explore / Resources / Community" footer (lines 6–20 of the current file). §5.4 specifies the exact copy. §5.3 explicitly bans `© 2026 BASidekick. All rights reserved.`.

- [ ] **Step 1: Read the current `components/footer.tsx`**

Already read in the spec drafting session. Confirm structure matches: client component, 4-column grid, brand mark, three link sections (Explore / Resources / Community), copyright at the bottom.

- [ ] **Step 2: Replace the file contents**

Write the new file:

```tsx
import Link from "next/link";

export function Footer() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <footer className="border-t border-border bg-secondary mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-14">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_220px] gap-10 font-mono text-[12px] text-muted-foreground leading-relaxed">
          {/* Left: who built it */}
          <div>
            <strong className="text-foreground font-bold">BASidekick</strong>
            <br />
            Built and maintained by
            <br />
            Rob Hansen, Tucson
          </div>

          {/* Middle: open source statement + contact */}
          <div>
            Open source where it matters. Pull requests welcome on every public repo.
            <br />
            <a
              href="https://github.com/rbhans"
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline decoration-accent underline-offset-[3px] hover:text-accent transition-colors"
            >
              github.com/rbhans
            </a>
            {" · "}
            <a
              href="mailto:rob@basidekick.com"
              className="text-foreground underline decoration-accent underline-offset-[3px] hover:text-accent transition-colors"
            >
              rob@basidekick.com
            </a>
          </div>

          {/* Right: last updated + changelog */}
          <div className="md:text-right">
            Last updated · {lastUpdated}
            <br />
            <Link
              href="/changelog"
              className="text-foreground underline decoration-accent underline-offset-[3px] hover:text-accent transition-colors"
            >
              View the changelog
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

Notes:
- **No `"use client"`** — the footer no longer needs client-side state. The `lastUpdated` is computed at render time, which is fine for a server component (it'll be the build/SSR time, not the user's clock — exactly what we want for a "last updated" indicator).
- **Removed:** the brand-mark `font-heading text-[20px]` link, the four `exploreLinks` / `resourcesLinks` / `communityLinks` lists, the bottom row with copyright + email, the entire grid-cols-2/3/4 responsive structure
- **Added:** the 3-column mono colophon
- **Date formatting:** uses `Intl.DateTimeFormat` via `toLocaleDateString` so it renders as `Apr 7, 2026` rather than `2026-04-07`
- **Changelog link:** assumes a `/changelog` route exists. If it doesn't, the link still renders but 404s on click. **Verify after building.** If `/changelog` doesn't exist yet, change to a placeholder href like `#` or remove the link and replace with plain text `Last updated · Apr 7, 2026`.

- [ ] **Step 3: Verify whether `/changelog` route exists**

Run:
```bash
ls /Users/benhansen/github/basidekick-site/app/\(main\)/changelog/page.tsx 2>/dev/null && echo "exists" || echo "missing"
```

If `missing`, edit the just-written footer to remove the changelog link — replace the right column with:

```tsx
<div className="md:text-right">
  Last updated · {lastUpdated}
</div>
```

- [ ] **Step 4: Run `pnpm build`**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 5: Visually inspect the footer**

```bash
pnpm dev
```

Browse to any page (the homepage works), scroll to the bottom. Confirm:
- 3-column layout with mono text
- Brand mark in bold forest
- Link underlines are mustard with 3px offset
- "Last updated · Apr 7, 2026" (or whatever today's date is)
- No copyright line, no `All rights reserved`

- [ ] **Step 6: Commit**

```bash
git add components/footer.tsx
git commit -m "$(cat <<'EOF'
feat(redesign): rewrite footer as 3-column colophon per spec §3.2

- Replace 4-column nav-link footer with mono colophon
- Three columns: who built it / open source line / last updated
- Real last-updated date from build time
- Link underlines in mustard
- Remove copyright (banned per spec §5.3)
- Server component (no client-side state needed)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Rewrite `components/views/home-view.tsx`

**Files:**
- Modify: `components/views/home-view.tsx`

**Why:** This is the biggest single change in Plan 1. §3.2 specifies the entire homepage structure. The current home-view has a centered hero, three feature sections with the eyebrow pattern, a stats card, and a wiki carousel. The new home-view has a left-aligned manifesto hero with the schematic background, an "Atlas, today" specimen card, a PointStack section with mixed cards, an "Also here" row, and the colophon (which the layout already provides via Footer).

- [ ] **Step 1: Read the current `components/views/home-view.tsx`**

Already read. Confirm structure: imports SiteBadge, WikiCarousel, RotatingAtlasCard, HeroBackground, HeroMarks; receives `carouselArticles`, `stats`, `samplePoints`, `sampleEquipment`, `recentNews` props.

- [ ] **Step 2: Replace the file contents**

Write the new file:

```tsx
"use client";

import Link from "next/link";
import { ArrowRight, GithubLogo } from "@phosphor-icons/react";
import { ROUTES } from "@/lib/routes";
import { formatDistanceToNow } from "date-fns";
import type { BabelPointEntry } from "@/lib/types";

// Types ----------------------------------------------------------------

interface FeaturedAtlasEntry {
  name: string;
  aliases: string[];
  description: string | null;
  type: string;
  haystackTags: string[];
  brick: string | null;
  foundOn: string[];
  aliasCount: number;
  url: string;
}

interface RecentPostItem {
  id: string;
  kind: "question" | "project" | "job";
  title: string;
  authorHandle: string;
  createdAt: string;
  meta: { label: string; value: string }[];
  url: string;
}

interface HomeViewProps {
  pulse: {
    newWikiThisWeek: number;
    newAtlasThisWeek: number;
    newPointStackThisWeek: number;
  };
  featuredAtlas: FeaturedAtlasEntry | null;
  pointStackPosts: RecentPostItem[];
  pointStackStats: {
    members: number;
    posts: number;
    openJobs: number;
    onlineNow: number;
  };
  alsoHere: {
    wikiCount: number;
    newsLatest: string | null;
    crateCount: number;
  };
}

// Component ------------------------------------------------------------

export function HomeView({
  pulse,
  featuredAtlas,
  pointStackPosts,
  pointStackStats,
  alsoHere,
}: HomeViewProps) {
  return (
    <div className="min-h-full">
      {/* ============ HERO / MANIFESTO ============ */}
      <div className="hero-wrap">
        <div className="hero-bg" aria-hidden="true" />
        <section className="relative z-[2] container mx-auto px-4 sm:px-6 lg:px-16 py-24 md:py-28 max-w-[1100px]">
          <div className="max-w-[980px]">
            {/* Pulse line */}
            <div className="font-mono text-[11px] uppercase tracking-[1.5px] text-muted-foreground mb-8 flex items-center gap-2">
              <span className="live-dot" aria-hidden="true" />
              <span>
                Updated this week · {pulse.newWikiThisWeek} new wiki entries · {pulse.newAtlasThisWeek} new atlas points · {pulse.newPointStackThisWeek} new PointStack posts
              </span>
            </div>

            <h1 className="font-heading font-semibold text-[34px] md:text-[44px] lg:text-[52px] leading-[1.08] tracking-[-0.015em] text-foreground">
              BAS info, community, and resources —{" "}
              <em className="italic font-medium text-accent">
                collected from next to the industry
              </em>
              , not from inside it.
            </h1>

            <p className="mt-8 text-[17px] md:text-[18px] leading-[1.55] text-foreground max-w-[640px]">
              A growing reference for the people who build, integrate, and operate building automation systems. Open data, open source, and a small community that actually answers questions.
            </p>

            <p className="mt-9 font-heading italic text-[16px] text-muted-foreground">
              — Rob, Tucson
            </p>
          </div>
        </section>
      </div>

      {/* ============ 01 / ATLAS, TODAY ============ */}
      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-20 max-w-[1100px]">
          <div className="font-mono text-[11px] uppercase tracking-[1.4px] text-muted-foreground mb-3">
            <span className="text-accent mr-1.5">01 /</span>
            Atlas, today
          </div>
          <h2 className="font-heading font-semibold text-[28px] md:text-[34px] leading-[1.15] tracking-[-0.01em] text-foreground max-w-[760px]">
            An open reference for points, equipment, and the messy names they show up under.
          </h2>
          <p className="mt-3 text-[16px] text-muted-foreground max-w-[620px] leading-[1.55]">
            Browse 800+ standardized point definitions with Haystack and Brick mappings. Today&apos;s exhibit:
          </p>

          {/* Specimen card */}
          {featuredAtlas && (
            <div className="mt-9 bg-card border border-border rounded-md p-9 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="md:pr-6 md:border-r md:border-border">
                <h3 className="font-heading font-semibold text-[26px] leading-[1.15] text-foreground mb-2">
                  {featuredAtlas.name}
                </h3>
                <div className="font-mono text-[12px] text-muted-foreground leading-[1.6] mb-6">
                  {featuredAtlas.aliases.join(" · ")}
                </div>
                {featuredAtlas.description && (
                  <p className="text-[14px] leading-[1.55] text-foreground">
                    {featuredAtlas.description}
                  </p>
                )}
              </div>

              <div>
                <SpecimenField label="Type" value={featuredAtlas.type} />
                <SpecimenField
                  label="Haystack"
                  value={
                    <div className="flex flex-wrap gap-1">
                      {featuredAtlas.haystackTags.map((t) => (
                        <span
                          key={t}
                          className="inline-block bg-muted px-2 py-0.5 rounded-sm text-[11px]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  }
                />
                {featuredAtlas.brick && (
                  <SpecimenField label="Brick" value={featuredAtlas.brick} />
                )}
                <SpecimenField label="Found on" value={featuredAtlas.foundOn.join(" · ")} />
                <SpecimenField label="Aliases" value={`${featuredAtlas.aliasCount} known variants`} last />
              </div>
            </div>
          )}

          {/* Action row */}
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href={ROUTES.ATLAS}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md text-[14px] font-semibold hover:bg-primary/90 transition-colors"
            >
              Browse the Atlas
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={featuredAtlas?.url ?? ROUTES.ATLAS}
              className="text-[14px] font-semibold text-foreground hover:text-accent transition-colors px-1 py-3"
            >
              Suggest a point
            </Link>
            <span className="md:ml-auto font-heading italic text-[13px] text-muted-foreground">
              Featured manually · changes weekly
            </span>
          </div>
        </div>
      </section>

      {/* ============ 02 / POINTSTACK ============ */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-16 py-24 max-w-[1100px]">
        <div className="font-mono text-[11px] uppercase tracking-[1.4px] text-muted-foreground mb-3">
          <span className="text-accent mr-1.5">02 /</span>
          PointStack
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end mb-11">
          <h2 className="font-heading font-semibold text-[28px] md:text-[34px] leading-[1.15] tracking-[-0.01em] text-foreground">
            A quiet place to talk shop with people who actually <em className="italic text-muted-foreground font-normal">know</em>.
          </h2>
          <div>
            <p className="text-[16px] text-muted-foreground leading-[1.6] mb-4">
              Ask questions, post projects, share the things you learned the hard way. PointStack is small, moderated, and specifically for BAS — not another general engineering forum.
            </p>
            <div className="flex flex-wrap gap-7 font-mono text-[11px] text-muted-foreground uppercase tracking-[1.2px]">
              <PointStackStat label="People" value={pointStackStats.members} />
              <PointStackStat label="Posts" value={pointStackStats.posts} />
              <PointStackStat label="Open jobs" value={pointStackStats.openJobs} />
              <PointStackStat label="Online now" value={pointStackStats.onlineNow} accent />
            </div>
          </div>
        </div>

        {/* Recent posts feed */}
        {pointStackPosts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-9">
            {pointStackPosts.slice(0, 3).map((post) => (
              <Link
                key={post.id}
                href={post.url}
                className="bg-card border border-border rounded-md p-5 flex flex-col gap-2 hover:border-foreground transition-colors"
              >
                <div className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground">
                  {post.kind === "question" && <span className="text-accent mr-0.5">?</span>}
                  {post.kind === "question" ? "Question" : post.kind === "project" ? "Project" : "Job"}
                </div>
                <h4 className="font-heading font-semibold text-[16px] leading-[1.3] text-foreground">
                  {post.title}
                </h4>
                <div className="mt-auto pt-2 font-mono text-[10px] text-muted-foreground tracking-[0.5px]">
                  <span className="text-foreground font-medium">@{post.authorHandle}</span>
                  {" · "}
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  {post.meta[0] && (
                    <>
                      {" · "}
                      {post.meta[0].value} {post.meta[0].label}
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA with rule */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-foreground" />
          <Link
            href={ROUTES.POINTSTACK}
            className="font-heading italic text-[16px] font-medium text-foreground hover:text-accent transition-colors"
          >
            Join the community →
          </Link>
        </div>
      </section>

      {/* ============ ALSO HERE ============ */}
      <section className="bg-secondary border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-20 max-w-[1100px]">
          <h3 className="font-heading font-semibold text-[24px] mb-10 text-foreground">
            Also here. <em className="italic text-muted-foreground font-normal">Smaller, but still loved.</em>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-9">
            <AlsoHereItem
              num="03"
              title="Wiki"
              description={`Field-tested guides on grounding, sequencing, commissioning, and the things nobody writes down. ${alsoHere.wikiCount} articles and counting.`}
              linkLabel="Browse the wiki"
              href={ROUTES.WIKI}
            />
            <AlsoHereItem
              num="04"
              title="News"
              description="A small daily-ish feed of the BAS industry — standards updates, vendor news, security advisories. No hot takes."
              linkLabel="Read the feed"
              href={ROUTES.NEWS}
            />
            <AlsoHereItem
              num="05"
              title="Open Source"
              description={
                <>
                  Rust crates and tools for building BAS software from the ground up. <em>rustbac</em>, <em>rustmod</em>, and an experimental BMS.
                </>
              }
              linkLabel={
                <span className="inline-flex items-center gap-1.5">
                  <GithubLogo className="w-3.5 h-3.5" />
                  View on GitHub
                </span>
              }
              href={ROUTES.OPEN_SOURCE}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

// Sub-components -------------------------------------------------------

function SpecimenField({
  label,
  value,
  last = false,
}: {
  label: string;
  value: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[90px_1fr] gap-3 py-2.5 ${
        last ? "" : "border-b border-muted"
      }`}
    >
      <div className="font-mono text-[11px] uppercase tracking-[1px] text-muted-foreground pt-0.5">
        {label}
      </div>
      <div className="font-mono text-[12px] leading-[1.5] text-foreground">{value}</div>
    </div>
  );
}

function PointStackStat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div>
      <strong className="block font-heading not-italic font-semibold text-[24px] text-foreground tracking-normal normal-case mb-0.5 tabular-nums">
        {value}
      </strong>
      <span className={accent ? "text-accent flex items-center gap-1.5" : ""}>
        {accent && <span className="live-dot" aria-hidden="true" />}
        {label}
      </span>
    </div>
  );
}

function AlsoHereItem({
  num,
  title,
  description,
  linkLabel,
  href,
}: {
  num: string;
  title: string;
  description: React.ReactNode;
  linkLabel: React.ReactNode;
  href: string;
}) {
  return (
    <div className="border-t border-foreground pt-5">
      <div className="font-mono text-[11px] tracking-[1px] text-accent">{num}</div>
      <h4 className="font-heading font-semibold text-[24px] mt-1.5 mb-2 text-foreground leading-[1.2]">
        {title}
      </h4>
      <div className="text-[13px] text-muted-foreground leading-[1.55] mb-4">
        {description}
      </div>
      <Link
        href={href}
        className="text-[13px] font-semibold text-foreground border-b border-foreground pb-px hover:text-accent hover:border-accent transition-colors"
      >
        {linkLabel}
      </Link>
    </div>
  );
}
```

Notes:
- **Removed imports:** SiteBadge, WikiCarousel, RotatingAtlasCard, HeroBackground, HeroMarks, Button, BookOpen, GlobeHemisphereWest, Cpu, Newspaper, ArrowSquareOut, BabelEquipmentEntry. The new home-view depends only on `Link`, `ArrowRight`, `GithubLogo`, `ROUTES`, `formatDistanceToNow`, and the type `BabelPointEntry` (or none of it — if `BabelPointEntry` isn't used in the inline types, drop that import too).
- **The `BabelPointEntry` import** is kept commented because the actual featured atlas data shape may differ — adjust during data wiring (Task 10) if needed.
- **The `Cpu` icon** for rust crates was removed because the new "Also here" row doesn't show icons inside crate cards.
- **The `rustCrates` constant** from the old file is removed entirely — the "Open Source" row in "Also here" doesn't list individual crates; it just links to the open-source page.
- **Styling notes:** all spacing uses arbitrary values (`px-16`, `py-20`, `text-[44px]`, etc.) rather than Tailwind size classes, because the type scale in §2.4 uses specific pixel values that don't map cleanly to the default Tailwind scale.
- **The `<em>` tags** are used for italic mustard emphasis — Fraunces italic + `text-accent`. This is the §2.3 hero highlight treatment.
- **`SpecimenField`, `PointStackStat`, `AlsoHereItem`** are local sub-components defined at the bottom of the file. They're not exported because no other component needs them.
- **The `rustCrates` data** is intentionally not part of `HomeViewProps` — the "Also here" row says "rustbac, rustmod, and an experimental BMS" as inline italic text, not as a list of cards.

- [ ] **Step 3: Run `pnpm build`**

```bash
pnpm build
```

**Expected: build will fail** with a type error in `app/(main)/page.tsx` because the existing page passes `carouselArticles`, `stats`, `samplePoints`, `sampleEquipment`, `recentNews` to HomeView, and HomeView no longer accepts those props. Task 10 fixes the data wiring; for now, the failure is expected.

If you want intermediate confidence that home-view.tsx itself is type-clean, run:
```bash
pnpm tsc --noEmit components/views/home-view.tsx
```

Expected: clean (or at least, no errors inside home-view.tsx itself).

- [ ] **Step 4: Commit (intermediate — page wiring fixed in Task 10)**

```bash
git add components/views/home-view.tsx
git commit -m "$(cat <<'EOF'
feat(redesign): rewrite homepage view per spec §3.2

- Manifesto hero with schematic background, italic mustard highlight,
  '— Rob, Tucson' signoff, mono pulse line with animated dot
- 01 / Atlas, today specimen card with hand-picked entry,
  asymmetric 2-col layout (left text + right field grid)
- 02 / PointStack section: split headline + body + live stats,
  3-card recent feed, italic 'Join the community →' CTA
- 'Also here' row demoting Wiki / News / Open Source to numbered items
- All copy from spec §5.4
- Drops imports for SiteBadge, WikiCarousel, RotatingAtlasCard,
  HeroBackground, HeroMarks (deletion in Task 11)

NOTE: app/(main)/page.tsx still passes the old props shape; Task 10
updates the data fetching to match the new HomeView signature.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Update homepage data fetching in `app/(main)/page.tsx`

**Files:**
- Modify: `app/(main)/page.tsx`

**Why:** The existing page fetches `carouselArticles`, `stats`, `samplePoints`, `sampleEquipment`, `recentNews` and passes them to HomeView. The new HomeView wants `pulse`, `featuredAtlas`, `pointStackPosts`, `pointStackStats`, and `alsoHere`. We rewrite the data fetching to produce the new shape, drawing from the same Supabase tables and the same atlas data layer.

The featured atlas entry is **hard-coded** for now — pick one good entry (Discharge Air Temperature) and feature it manually until a "feature management" UI is added in a follow-up. The spec explicitly allows this in §3.2 ("Featured manually · changes weekly").

- [ ] **Step 1: Read the current `app/(main)/page.tsx`**

Already read in the spec drafting session. Confirm structure: async server component, Supabase client init, parallel fetch of articles + counts + babel data + news, normalize joins, build props for HomeView.

- [ ] **Step 2: Replace the file contents**

```tsx
import { HomeView } from "@/components/views/home-view";
import { createClient } from "@supabase/supabase-js";
import { getBabelData } from "@/lib/data/babel";
import { ROUTES } from "@/lib/routes";

// ISR: Revalidate daily — content updates come via redeployments
export const revalidate = 86400;

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
}

// The featured Atlas entry. Hand-curated; rotate manually.
// To swap: change the slug + the metadata block below.
const FEATURED_ATLAS_SLUG = "discharge-air-temperature";
const FEATURED_ATLAS_FALLBACK = {
  name: "Discharge Air Temperature",
  aliases: ["DAT", "DA-T", "SAT", "SaTemp", "DischrgAirTmp", "DA_TEMP"],
  description:
    "Temperature of the air leaving an air-handling unit or terminal box, after any heating, cooling, or mixing. One of the four most-aliased points in the Atlas — every vendor names it differently.",
  type: "Analog input · °F",
  haystackTags: ["discharge", "air", "temp", "sensor", "point"],
  brick: "brick:Discharge_Air_Temperature_Sensor",
  foundOn: ["AHU", "RTU", "VAV", "FCU", "MAU"],
  aliasCount: 17,
  url: `${ROUTES.ATLAS}/${FEATURED_ATLAS_SLUG}`,
};

async function getHomePageData() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      pulse: { newWikiThisWeek: 0, newAtlasThisWeek: 0, newPointStackThisWeek: 0 },
      featuredAtlas: FEATURED_ATLAS_FALLBACK,
      pointStackPosts: [],
      pointStackStats: { members: 0, posts: 0, openJobs: 0, onlineNow: 0 },
      alsoHere: { wikiCount: 0, newsLatest: null, crateCount: 3 },
    };
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    wikiCountResult,
    wikiThisWeekResult,
    pointStackPostsResult,
    pointStackPostCountResult,
    pointStackJobCountResult,
    pointStackMemberCountResult,
    babelData,
  ] = await Promise.all([
    supabase
      .from("wiki_articles")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase
      .from("wiki_articles")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true)
      .gte("created_at", oneWeekAgo),
    supabase
      .from("pointstack_posts")
      .select("id, kind, title, slug, author_handle, created_at, reply_count")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("pointstack_posts")
      .select("id", { count: "exact", head: true })
      .gte("created_at", oneWeekAgo),
    supabase
      .from("pointstack_jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true }),
    getBabelData().catch(() => null),
  ]);

  // Try to load the featured atlas entry from the babel data, fall back if not found.
  const featuredFromBabel = babelData?.points?.find(
    (p) => p.slug === FEATURED_ATLAS_SLUG,
  );
  const featuredAtlas = featuredFromBabel
    ? {
        name: featuredFromBabel.name ?? FEATURED_ATLAS_FALLBACK.name,
        aliases: featuredFromBabel.aliases ?? FEATURED_ATLAS_FALLBACK.aliases,
        description:
          featuredFromBabel.description ?? FEATURED_ATLAS_FALLBACK.description,
        type:
          featuredFromBabel.dataType ??
          featuredFromBabel.unit ??
          FEATURED_ATLAS_FALLBACK.type,
        haystackTags:
          featuredFromBabel.haystackTags ?? FEATURED_ATLAS_FALLBACK.haystackTags,
        brick: featuredFromBabel.brick ?? FEATURED_ATLAS_FALLBACK.brick,
        foundOn:
          featuredFromBabel.equipmentTypes ?? FEATURED_ATLAS_FALLBACK.foundOn,
        aliasCount:
          featuredFromBabel.aliases?.length ?? FEATURED_ATLAS_FALLBACK.aliasCount,
        url: `${ROUTES.ATLAS}/${FEATURED_ATLAS_SLUG}`,
      }
    : FEATURED_ATLAS_FALLBACK;

  // Map PointStack posts to the HomeView shape
  const pointStackPosts = (pointStackPostsResult.data ?? []).map(
    (post: Record<string, unknown>) => ({
      id: post.id as string,
      kind: ((post.kind as string) === "question"
        ? "question"
        : (post.kind as string) === "job"
          ? "job"
          : "project") as "question" | "project" | "job",
      title: post.title as string,
      authorHandle: (post.author_handle as string) ?? "anonymous",
      createdAt: post.created_at as string,
      meta: [{ label: "replies", value: String(post.reply_count ?? 0) }],
      url: `${ROUTES.POINTSTACK}/posts/${post.slug}`,
    }),
  );

  return {
    pulse: {
      newWikiThisWeek: wikiThisWeekResult.count ?? 0,
      newAtlasThisWeek: 0, // TODO: derive from a "added in last week" query against the babel data layer
      newPointStackThisWeek: pointStackPostCountResult.count ?? 0,
    },
    featuredAtlas,
    pointStackPosts,
    pointStackStats: {
      members: pointStackMemberCountResult.count ?? 0,
      posts: 0, // TODO: total post count if needed
      openJobs: pointStackJobCountResult.count ?? 0,
      onlineNow: 0, // TODO: real presence tracking
    },
    alsoHere: {
      wikiCount: wikiCountResult.count ?? 0,
      newsLatest: null,
      crateCount: 3,
    },
  };
}

export default async function HomePage() {
  const data = await getHomePageData();
  return <HomeView {...data} />;
}
```

Notes:
- **The `FEATURED_ATLAS_FALLBACK`** is a literal hand-curated entry. If `getBabelData()` returns the matching slug, that real data is used; otherwise the fallback ships. **Both shapes must be type-compatible** with `FeaturedAtlasEntry` in home-view.tsx.
- **The query against `pointstack_posts`** assumes the table exists with columns `id, kind, title, slug, author_handle, created_at, reply_count`. **Verify these columns exist** before running the build — the actual schema may differ slightly. If columns are named differently, adapt the SELECT and the mapping.
- **Two `// TODO:` markers** are intentional: `newAtlasThisWeek` and `pointStackStats.posts`/`onlineNow` need data sources that aren't currently tracked. The display shows `0` for now, which is honest and not broken. Real values come in follow-up work.
- **The `revalidate = 86400`** stays — homepage data is rebuilt daily. ISR is fine for the pulse line which is approximate.
- **The `getSupabaseClient`** function is kept verbatim from the original, so falling back to fallback data when env vars are missing still works in local dev / preview environments.

- [ ] **Step 3: Run `pnpm build`**

```bash
pnpm build
```

**Expected: this is the moment of truth.** The build either succeeds or fails with type errors that point to specific places where the data shape doesn't match. Common failures and fixes:

- **`Property 'kind' does not exist on type ...`** — The `pointstack_posts` table doesn't have a `kind` column. Adapt the SELECT to whatever column distinguishes question/project/job (might be `post_type` or live in a separate `post_questions` / `post_projects` / `post_jobs` table — verify schema with `pnpm exec supabase db diff` or by reading `lib/types.ts`).
- **`'pointstack_jobs' does not exist`** — The jobs table might be named differently. Check `app/(main)/pointstack/jobs/page.tsx` to find the actual table name.
- **`Property 'slug' does not exist on type 'BabelPointEntry'`** — The babel data shape might use `id` instead of `slug`. Adapt the lookup.

If the schema doesn't match what's assumed here, **fix the code to match the real schema**, don't change the schema. The data must be preserved exactly.

- [ ] **Step 4: Run `pnpm dev` and visually inspect the homepage**

```bash
pnpm dev
```

Open `http://localhost:3000` in a browser. Confirm:

- **Hero**: cream background, faded schematic visible behind the right side of the hero, italic mustard "collected from next to the industry" highlight, "— Rob, Tucson" signoff in italic Fraunces, pulse dot animating
- **01 / Atlas, today**: numbered prefix in mustard, large Fraunces heading, specimen card with the Discharge Air Temperature entry, asymmetric 2-column layout, "Browse the Atlas" forest button, italic "Featured manually · changes weekly" caption on the right
- **02 / PointStack**: split headline + body + stats, 3 sample posts (or fewer if the DB has fewer), "Join the community →" CTA with the hairline rule
- **Also here**: 3 columns for Wiki / News / Open Source with hairline rules, mustard 03/04/05 prefixes, italic "Smaller, but still loved" subhead
- **Footer (colophon)**: 3-column mono colophon at the bottom

**If the hero schematic doesn't appear**, the most likely cause is that `public/hero-schematic.jpg` is missing or the URL is wrong. Verify with:
```bash
ls -lh public/hero-schematic.jpg
curl -sI http://localhost:3000/hero-schematic.jpg | head -3
```

- [ ] **Step 5: Commit**

```bash
git add app/\(main\)/page.tsx
git commit -m "$(cat <<'EOF'
feat(redesign): rewrite homepage data fetching for new HomeView shape

- Pulse line: weekly counts for wiki/atlas/pointstack
- Featured atlas: hand-picked Discharge Air Temperature with fallback
  if babel data lookup fails
- PointStack stats: members, posts, open jobs, online now
- 'Also here' counts for wiki and crates

Two TODOs preserved for follow-up: real online-now presence tracking,
and 'new atlas points this week' (no current source).

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Delete homepage-only components

**Files:**
- Delete: `components/hero-background.tsx`
- Delete: `components/hero-marks.tsx`
- Delete: `components/rotating-atlas-card.tsx`
- Delete: `components/wiki-carousel.tsx`
- Delete: `components/animated-counter.tsx`

**Why:** All five of these components were imported only by the old `home-view.tsx` (verified with grep during plan drafting). After Task 9 they have zero imports. Leaving them in the codebase as dead code invites confusion and "I'll just bring this back" rot.

**Note:** SiteBadge, PageHero, FeatureCard, StepCard, ProductCard, NewsletterSignup are **NOT deleted in this plan** — they're used by other pages (Atlas, Wiki, News, etc.) that get rewritten in subsequent plans. They get deleted in Plan 6 (Cleanup).

- [ ] **Step 1: Confirm the components have zero remaining imports**

Run:
```bash
grep -rn "HeroBackground\|HeroMarks\|RotatingAtlasCard\|WikiCarousel\|AnimatedCounter" app components --include="*.tsx" --include="*.ts" 2>/dev/null
```

Expected: no matches (the new home-view.tsx doesn't import any of these). If any matches surface, **stop and investigate** before deleting.

- [ ] **Step 2: Delete the five files**

Run:
```bash
rm components/hero-background.tsx
rm components/hero-marks.tsx
rm components/rotating-atlas-card.tsx
rm components/wiki-carousel.tsx
rm components/animated-counter.tsx
```

- [ ] **Step 3: Run `pnpm build`**

```bash
pnpm build
```

Expected: build succeeds. If it fails because something else was importing one of these, restore the file from git (`git checkout HEAD -- components/<filename>.tsx`) and investigate.

- [ ] **Step 4: Commit**

```bash
git add -A components/
git commit -m "$(cat <<'EOF'
chore(redesign): delete homepage-only components

These were only imported by the old home-view.tsx, which was rewritten
in the previous task. Deleting them now prevents dead-code rot.

- components/hero-background.tsx
- components/hero-marks.tsx
- components/rotating-atlas-card.tsx
- components/wiki-carousel.tsx
- components/animated-counter.tsx

SiteBadge, PageHero, FeatureCard, StepCard, ProductCard, and
NewsletterSignup are NOT deleted here — they're used by other pages
(Atlas, Wiki, News, etc.) that get rewritten in later plans.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Delete theme provider files and dead `nav.tsx`

**Files:**
- Delete: `components/theme-provider.tsx`
- Delete: `components/theme-toggle.tsx`
- Delete: `components/nav.tsx`
- Modify: `package.json` (remove `next-themes` dependency)

**Why:** Dark mode is killed (§1.1). Both `theme-provider.tsx` and `theme-toggle.tsx` have no remaining imports after Tasks 4, 5, and 7 — the layout, sonner, and navbar all stopped using them. The `next-themes` package is now an orphan dependency. `components/nav.tsx` (lowercase Nav) is dead code from a previous iteration with zero imports site-wide (verified during plan drafting); deleting it now is opportunistic cleanup.

- [ ] **Step 1: Confirm zero remaining imports for theme files and nav.tsx**

Run:
```bash
grep -rn 'from "@/components/theme-provider"\|from "@/components/theme-toggle"\|from "@/components/nav"' app components --include="*.tsx" --include="*.ts" 2>/dev/null
```

Expected: no matches.

Also verify nothing still imports `next-themes` in source code (the package is in pnpm-lock.yaml but should not be imported):
```bash
grep -rn 'from "next-themes"' app components --include="*.tsx" --include="*.ts" 2>/dev/null
```

Expected: no matches.

- [ ] **Step 2: Delete the three component files**

```bash
rm components/theme-provider.tsx
rm components/theme-toggle.tsx
rm components/nav.tsx
```

- [ ] **Step 3: Remove the `next-themes` dependency**

Run:
```bash
pnpm remove next-themes
```

Expected: `next-themes` is removed from `package.json` `dependencies`, `pnpm-lock.yaml` is updated, and the package is uninstalled.

- [ ] **Step 4: Run `pnpm build`**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 5: Run `pnpm lint`**

```bash
pnpm lint
```

Expected: lint passes. If unused-import warnings surface, fix them.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore(redesign): delete theme provider, theme toggle, dead nav.tsx, drop next-themes

- Delete components/theme-provider.tsx (no longer wraps anything)
- Delete components/theme-toggle.tsx (no longer rendered)
- Delete components/nav.tsx (orphaned, zero imports site-wide)
- pnpm remove next-themes (last user removed in earlier tasks)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Final validation

**Files:**
- No file changes — verification only

**Why:** A final pass to confirm the foundation plan landed cleanly. Catches any issue we missed in the per-task verification.

- [ ] **Step 1: Run the full build**

```bash
pnpm build
```

Expected: clean build, no errors, no warnings about unused imports.

- [ ] **Step 2: Run lint**

```bash
pnpm lint
```

Expected: passes.

- [ ] **Step 3: Run the dev server and walk through the site**

```bash
pnpm dev
```

Walk through every major route (or as many as you reasonably can in 5 minutes):

| Route | What to check |
| --- | --- |
| `/` | New homepage with hero schematic, manifesto, Atlas specimen, PointStack section, Also here, colophon — **the core deliverable of Plan 1** |
| `/atlas` | **Will look weird** — old layout in new palette. Do not fix here; it's Plan 2's job. Just confirm it loads without errors. |
| `/wiki` | Same — old layout, new palette, no errors |
| `/news` | Same |
| `/pointstack` | Same |
| `/open-source` | Same |
| `/signin` | Auth form should still work, restyled passively into new palette |

**No route should produce a runtime error or a broken page.** Pages will look transitional (sage palette + old layout) but functionally everything should work.

- [ ] **Step 4: Verify the colophon footer appears on every page**

The footer is rendered by the layout, so it should appear under every route. Confirm it's present and styled correctly on at least 3 routes (e.g., `/`, `/atlas`, `/signin`).

- [ ] **Step 5: Run the test suite if one exists**

```bash
pnpm test 2>/dev/null || echo "no test script defined — skipping"
```

If a test script is defined and tests fail, surface the failures.

- [ ] **Step 6: Generate a quick summary of changes**

```bash
git log --oneline main..HEAD
```

Expected output: roughly 12 commits, one per task, all on the `redesign/foundation` branch.

- [ ] **Step 7: Commit any leftover changes (should be none)**

```bash
git status
```

Expected: clean working tree.

- [ ] **Step 8: Push the branch (optional — only if user has asked)**

This step requires explicit user permission. Do not run without confirmation.

```bash
# Only after user says "push it":
# git push -u origin redesign/foundation
```

---

## Self-review (post-plan)

**Spec coverage check:** Plan 1 implements §1 palette swap, §2 typography swap, §3.2 homepage layout, §3.5 title block strip styles, §4.3 hero placement CSS, §4.4 hero schematic asset, §5.4 homepage rewrites table, §5.6 colophon signoff, §6.7 font replacement. Spec sections §3.3 (reference page pattern), §3.4 (detail patterns), §3.6 (spacing scale Tailwind tokens — left as inline arbitrary values for now), and the per-page rewrites for Atlas/Wiki/News/PointStack/Open Source are intentionally **not in this plan** — they're scoped into Plans 2–5.

**Placeholder check:** Two `// TODO:` markers in `app/(main)/page.tsx` for `newAtlasThisWeek` and `pointStackStats.posts/onlineNow`. Both are flagged as honest "no current data source" gaps with sane defaults (`0`) shipped. They're not blocking, they're acknowledged tech debt.

**Type consistency:** `FeaturedAtlasEntry` in home-view.tsx and `FEATURED_ATLAS_FALLBACK` in page.tsx must have matching shapes. If the actual `BabelPointEntry` shape from `lib/types.ts` differs from what `getBabelData` returns at runtime, Task 10 step 3 will catch it during build.

**Scope check:** This plan produces a working, shippable site after Task 13. Other pages render in the new palette with old layouts (transitional, intentional, documented in the plan brief). User has confirmed they're OK with this.

---

## Notes for the implementer

- **Each task ends with a commit.** Do not batch tasks before committing — the small commits make rollback trivial if a later task introduces a regression.
- **If `pnpm build` fails for a reason this plan didn't anticipate**, do not paper over it. Read the actual error, understand the cause, and fix the root. Common causes: schema drift between `lib/types.ts` and the actual Supabase tables, missing environment variables in local dev, recent codebase changes that touched files this plan modifies.
- **The featured atlas entry hard-coded slug** (`discharge-air-temperature`) may not match the actual slug format used in `lib/data/babel.ts`. Verify by running `getBabelData()` and inspecting the `points` array — adapt the slug if needed.
- **The `pointstack_*` table names** are best-guesses based on the directory structure under `app/(main)/pointstack/`. Verify with the actual schema before running Task 10's build.
- **Visual verification matters more than build success** for design work. A green build with a broken-looking homepage is a failure. A green build with a homepage that matches the design spec is the success criterion.
