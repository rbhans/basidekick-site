# BASidekick App Shell — Phase 0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the fresh `basidekick-app` repo with design tokens, fonts, the full app shell (dark icon rail, collapsible contextual panel, top bar, ⌘K command palette), stubbed section routes, a placeholder dashboard home, and the motion system.

**Architecture:** A Next.js 16 App Router app. The root layout wraps all pages in a client `AppShell` component (rail + panel + top bar + palette + mobile tabs); page content stays server-rendered as `children`. Navigation structure lives in one pure module (`lib/nav.ts`) consumed by rail, panel, breadcrumbs, palette, and mobile tabs. Motion constants live in `lib/motion.ts`; route transitions use `app/template.tsx` (re-mounts per navigation → enter animation only, which is the reliable App Router pattern).

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind 4 (CSS-first `@theme`), `motion` (motion/react), `cmdk`, `@phosphor-icons/react`, `next/font/google` (Familjen Grotesk + Spline Sans Mono), Vitest for logic tests, pnpm.

**Spec:** `docs/superpowers/specs/2026-07-07-app-shell-redesign-design.md` (in `basidekick-site`).

**Conventions (match these throughout):**
- All work happens in `~/Projects/basidekick-app` (created in Task 1). The old repo `~/Projects/basidekick-site` is read-only reference — never modify it.
- Import alias `@/*` → repo root. No `src/` dir.
- Client components start with `"use client"`. Anything using `motion/react`, hooks, or browser APIs is a client component.
- Every interactive/animated component checks `useReducedMotion()` and falls back to static rendering.
- Brand colors are ONLY: ink `#0a0a0a`, sand `#fafaf8`, punch `#d11a36` + the variants defined in Task 3's `globals.css`. Never invent new colors.

## File structure (end state of Phase 0)

```
basidekick-app/
├── app/
│   ├── layout.tsx              # fonts, metadata, <AppShell>
│   ├── template.tsx            # route-transition enter animation
│   ├── globals.css             # design tokens (light + dark pairs), cmdk styles
│   ├── page.tsx                # dashboard home
│   ├── error.tsx               # error UI inside content pane
│   ├── not-found.tsx           # 404 inside content pane
│   ├── atlas/{page,equipment/page,points/page,brands/page,search/page}.tsx
│   ├── wiki/page.tsx  courses/page.tsx  news/page.tsx
│   ├── pointstack/{page,experts/page,jobs/page}.tsx
│   ├── calculators/page.tsx  references/page.tsx  share/page.tsx
├── components/
│   ├── shell/
│   │   ├── app-shell.tsx       # composition + palette open state + ⌘K listener
│   │   ├── rail.tsx            # dark icon rail (desktop)
│   │   ├── context-panel.tsx   # collapsible sub-nav panel
│   │   ├── top-bar.tsx         # breadcrumbs + ⌘K trigger
│   │   ├── command-palette.tsx # cmdk dialog
│   │   ├── mobile-tabs.tsx     # bottom tab bar + "More" sheet (mobile)
│   │   └── placeholder-page.tsx# stub page body
│   └── motion/
│       ├── reveal.tsx          # stagger container + item
│       └── skeleton.tsx        # shimmer placeholder
├── lib/
│   ├── nav.ts                  # NAV sections, activeSection(), breadcrumbsFor()
│   ├── nav.test.ts
│   ├── motion.ts               # duration/spring/stagger tokens
│   └── cn.ts                   # clsx + tailwind-merge
├── hooks/
│   ├── use-persisted-state.ts  # readStored() + usePersistedState()
│   └── use-persisted-state.test.ts
└── package.json, tsconfig.json, postcss.config.mjs, vitest.config.ts, …
```

---

### Task 1: Scaffold the repo

**Files:**
- Create: `~/Projects/basidekick-app/` (entire scaffold via create-next-app)

- [ ] **Step 1: Scaffold with create-next-app**

```bash
cd ~/Projects
pnpm create next-app@latest basidekick-app --typescript --eslint --app --tailwind --no-src-dir --import-alias "@/*" --turbopack --use-pnpm
```

If any flag is rejected (create-next-app flags drift), run `pnpm create next-app@latest basidekick-app` interactively and answer: TypeScript **yes**, ESLint **yes**, Tailwind **yes**, `src/` dir **no**, App Router **yes**, Turbopack **yes**, import alias **@/\***.

Expected: directory created, dependencies installed, git repo initialized with an initial commit (create-next-app does this automatically; if not, run `git init && git add -A && git commit -m "chore: scaffold next app"`).

- [ ] **Step 2: Add runtime + dev dependencies**

```bash
cd ~/Projects/basidekick-app
pnpm add motion cmdk @phosphor-icons/react clsx tailwind-merge
pnpm add -D vitest
```

Expected: `package.json` lists all six; `next` should be 16.x, `tailwindcss` 4.x.

- [ ] **Step 3: Add test script**

In `package.json` `"scripts"`, add:

```json
"test": "vitest run"
```

- [ ] **Step 4: Verify dev server boots**

```bash
pnpm dev &
sleep 6
curl -s http://localhost:3000 | grep -io "next.js" | head -1
kill %1
```

Expected: HTML response containing the default Next.js landing content (grep prints a match). If port 3000 is busy, Next picks 3001 — read the dev server output for the actual port and use it in every later curl.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: add motion, cmdk, phosphor, vitest"
```

---

### Task 2: Fonts + root layout

**Files:**
- Modify: `app/layout.tsx` (replace scaffold version entirely)

- [ ] **Step 1: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Familjen_Grotesk, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";

const familjen = Familjen_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const splineMono = Spline_Sans_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BASidekick — BAS reference, community, and tools",
    template: "%s — BASidekick",
  },
  description:
    "Independent building-automation reference, community, and shared resource hub.",
  metadataBase: new URL("https://basidekick.com"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${familjen.variable} ${splineMono.variable}`}>
      <body className="bg-bg font-sans text-fg antialiased">{children}</body>
    </html>
  );
}
```

(`bg-bg` / `text-fg` utilities come from tokens defined in Task 3. `AppShell` is wired in Task 6.)

- [ ] **Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: wire Familjen Grotesk + Spline Sans Mono via next/font"
```

---

### Task 3: Design tokens (`globals.css`)

**Files:**
- Modify: `app/globals.css` (replace scaffold version entirely)

- [ ] **Step 1: Replace `app/globals.css`**

Every value below comes from the approved palette. Dark values are defined now (dark-ready) but only activate under `.dark`, which nothing sets yet.

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* semantic (theme-flipping) */
  --color-bg: var(--bg);
  --color-fg: var(--fg);
  --color-fg-2: var(--fg-2);
  --color-fg-3: var(--fg-3);
  --color-panel: var(--panel);
  --color-line: var(--line);
  --color-line-2: var(--line-2);

  /* fixed brand */
  --color-ink: #0a0a0a;
  --color-sand: #fafaf8;
  --color-sand-2: #ededeb;
  --color-sand-3: #d8d8d4;
  --color-surface: #ffffff;
  --color-char: #0d0d0d;
  --color-char-2: #161616;
  --color-cream: #f5f5f5;
  --color-cream-2: rgba(245, 245, 245, 0.66);
  --color-cream-3: rgba(245, 245, 245, 0.44);
  --color-punch: #d11a36;
  --color-punch-2: #e8344e;
  --color-punch-soft: rgba(209, 26, 54, 0.12);
  --color-line-dark: rgba(255, 255, 255, 0.08);
  --color-line-dark-2: rgba(255, 255, 255, 0.18);

  /* semantic accents — categories/status only, never chrome */
  --color-ochre: #b8762a;
  --color-moss: #3a7a3a;
  --color-slate: #3d5a80;
  --color-teal: #2d6e6e;
  --color-plum: #6b3a5e;

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
}

:root {
  --bg: #fafaf8;
  --fg: #0a0a0a;
  --fg-2: rgba(10, 10, 10, 0.64);
  --fg-3: rgba(10, 10, 10, 0.44);
  --panel: #ffffff;
  --line: rgba(10, 10, 10, 0.08);
  --line-2: rgba(10, 10, 10, 0.18);
}

.dark {
  --bg: #0d0d0d;
  --fg: #f5f5f5;
  --fg-2: rgba(245, 245, 245, 0.66);
  --fg-3: rgba(245, 245, 245, 0.44);
  --panel: #141414;
  --line: rgba(255, 255, 255, 0.08);
  --line-2: rgba(255, 255, 255, 0.18);
}

/* ---- command palette (cmdk renders attribute-tagged elements) ---- */
[cmdk-overlay] {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 10, 0.4);
  z-index: 50;
}
[cmdk-dialog] {
  position: fixed;
  left: 50%;
  top: 20%;
  transform: translateX(-50%);
  width: min(560px, calc(100vw - 32px));
  z-index: 51;
}
[cmdk-root] {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(10, 10, 10, 0.18);
}
[cmdk-input] {
  width: 100%;
  padding: 14px 16px;
  font-size: 14px;
  border: none;
  border-bottom: 1px solid var(--line);
  outline: none;
  background: transparent;
  color: var(--fg);
}
[cmdk-list] {
  max-height: 320px;
  overflow-y: auto;
  padding: 8px;
}
[cmdk-group-heading] {
  padding: 8px 8px 4px;
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--fg-3);
}
[cmdk-item] {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--fg-2);
  cursor: pointer;
}
[cmdk-item][data-selected="true"] {
  background: var(--bg);
  color: var(--fg);
}
[cmdk-empty] {
  padding: 16px;
  font-size: 13px;
  color: var(--fg-3);
}

/* ---- skeleton shimmer ---- */
@keyframes bsk-shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}
.bsk-skeleton {
  background: linear-gradient(
    90deg,
    var(--line) 25%,
    rgba(10, 10, 10, 0.03) 50%,
    var(--line) 75%
  );
  background-size: 200% 100%;
  animation: bsk-shimmer 1.6s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .bsk-skeleton { animation: none; }
}
```

- [ ] **Step 2: Verify tokens render**

Temporarily replace the body of `app/page.tsx` with:

```tsx
export default function Home() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-semibold text-fg">BASidekick tokens</h1>
      <p className="mt-2 text-sm text-fg-2">Familjen Grotesk body text.</p>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-3">
        SPLINE SANS MONO · EYEBROW
      </p>
      <button className="mt-4 rounded-md bg-punch px-4 py-2 text-sm font-medium text-white">
        Punch button
      </button>
    </div>
  );
}
```

```bash
pnpm dev &
sleep 6
curl -s http://localhost:3000 | grep -o "SPLINE SANS MONO · EYEBROW"
kill %1
```

Expected: grep prints `SPLINE SANS MONO · EYEBROW`. Also open http://localhost:3000 in a browser (or preview tool): sand background, near-black text, crimson button, two distinct typefaces.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css app/page.tsx
git commit -m "feat: design tokens — brand palette, dark-ready semantics, cmdk + skeleton styles"
```

---

### Task 4: Navigation model (`lib/nav.ts`) — TDD

**Files:**
- Create: `lib/nav.ts`, `lib/nav.test.ts`, `vitest.config.ts`, `lib/cn.ts`

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
  test: {
    include: ["**/*.test.ts"],
  },
});
```

- [ ] **Step 2: Write the failing test — `lib/nav.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { NAV, activeSection, breadcrumbsFor } from "@/lib/nav";

describe("NAV", () => {
  it("has 9 sections in rail order, starting with home", () => {
    expect(NAV.map((s) => s.id)).toEqual([
      "home", "atlas", "wiki", "courses", "news",
      "pointstack", "calculators", "references", "share",
    ]);
  });

  it("has unique hrefs across sections and children", () => {
    const hrefs = NAV.flatMap((s) => [
      s.href,
      ...(s.children?.map((c) => c.href) ?? []),
    ]);
    // pointstack Feed intentionally shares the section href
    const unique = new Set(hrefs);
    expect(hrefs.length - unique.size).toBe(1);
  });
});

describe("activeSection", () => {
  it("matches home only on exactly /", () => {
    expect(activeSection("/")?.id).toBe("home");
    expect(activeSection("/atlas")?.id).toBe("atlas");
  });

  it("matches nested paths to their section", () => {
    expect(activeSection("/atlas/points")?.id).toBe("atlas");
    expect(activeSection("/pointstack/jobs")?.id).toBe("pointstack");
  });

  it("does not match prefixes that are not path segments", () => {
    expect(activeSection("/atlassian")).toBeUndefined();
  });

  it("returns undefined for unknown paths", () => {
    expect(activeSection("/nope")).toBeUndefined();
  });
});

describe("breadcrumbsFor", () => {
  it("returns section + child for sub-pages", () => {
    expect(breadcrumbsFor("/atlas/points")).toEqual([
      { label: "Atlas", href: "/atlas" },
      { label: "Points", href: "/atlas/points" },
    ]);
  });

  it("returns only the section for section roots", () => {
    expect(breadcrumbsFor("/pointstack")).toEqual([
      { label: "PointStack", href: "/pointstack" },
    ]);
  });

  it("returns [] for unknown paths", () => {
    expect(breadcrumbsFor("/nope")).toEqual([]);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
pnpm test
```

Expected: FAIL — cannot resolve `@/lib/nav`.

- [ ] **Step 4: Implement `lib/nav.ts`**

```ts
export type NavChild = { label: string; href: string };

export type NavSection = {
  id: string;
  label: string;
  href: string;
  children?: NavChild[];
};

export const NAV: NavSection[] = [
  { id: "home", label: "Home", href: "/" },
  {
    id: "atlas",
    label: "Atlas",
    href: "/atlas",
    children: [
      { label: "Equipment", href: "/atlas/equipment" },
      { label: "Points", href: "/atlas/points" },
      { label: "Brands", href: "/atlas/brands" },
      { label: "Search", href: "/atlas/search" },
    ],
  },
  { id: "wiki", label: "Wiki", href: "/wiki" },
  { id: "courses", label: "Courses", href: "/courses" },
  { id: "news", label: "News", href: "/news" },
  {
    id: "pointstack",
    label: "PointStack",
    href: "/pointstack",
    children: [
      { label: "Feed", href: "/pointstack" },
      { label: "Experts", href: "/pointstack/experts" },
      { label: "Jobs", href: "/pointstack/jobs" },
    ],
  },
  { id: "calculators", label: "Calculators", href: "/calculators" },
  { id: "references", label: "References", href: "/references" },
  { id: "share", label: "Community Share", href: "/share" },
];

export function activeSection(pathname: string): NavSection | undefined {
  if (pathname === "/") return NAV[0];
  return NAV.filter((s) => s.href !== "/").find(
    (s) => pathname === s.href || pathname.startsWith(s.href + "/"),
  );
}

export type Crumb = { label: string; href: string };

export function breadcrumbsFor(pathname: string): Crumb[] {
  const section = activeSection(pathname);
  if (!section) return [];
  const crumbs: Crumb[] = [{ label: section.label, href: section.href }];
  const child = section.children?.find(
    (c) => c.href === pathname && c.href !== section.href,
  );
  if (child) crumbs.push({ label: child.label, href: child.href });
  return crumbs;
}
```

- [ ] **Step 5: Create `lib/cn.ts`**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
pnpm test
```

Expected: PASS (9 tests).

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts lib/nav.ts lib/nav.test.ts lib/cn.ts
git commit -m "feat: navigation model with activeSection/breadcrumbsFor (tested)"
```

---

### Task 5: Motion tokens + persisted-state hook — TDD

**Files:**
- Create: `lib/motion.ts`, `hooks/use-persisted-state.ts`, `hooks/use-persisted-state.test.ts`

- [ ] **Step 1: Create `lib/motion.ts`**

```ts
/** One physics vocabulary for the whole app (seconds). */
export const dur = {
  micro: 0.12,
  base: 0.18,
  large: 0.28,
} as const;

export const spring = {
  snappy: { type: "spring", stiffness: 500, damping: 35 },
  gentle: { type: "spring", stiffness: 260, damping: 30 },
} as const;

export const staggerChildren = 0.05;

/** Vertical rise distance (px) for enter transitions. */
export const rise = 4;
```

- [ ] **Step 2: Write the failing test — `hooks/use-persisted-state.test.ts`**

Tests target the pure helper only (no DOM test framework needed).

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { readStored } from "@/hooks/use-persisted-state";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("readStored", () => {
  it("returns fallback when window is undefined (SSR)", () => {
    expect(readStored("k", true)).toBe(true);
  });

  it("returns parsed value from localStorage", () => {
    vi.stubGlobal("window", {
      localStorage: { getItem: () => JSON.stringify(false) },
    });
    expect(readStored("k", true)).toBe(false);
  });

  it("returns fallback when key is absent", () => {
    vi.stubGlobal("window", {
      localStorage: { getItem: () => null },
    });
    expect(readStored("k", "fb")).toBe("fb");
  });

  it("returns fallback on malformed JSON", () => {
    vi.stubGlobal("window", {
      localStorage: { getItem: () => "{not json" },
    });
    expect(readStored("k", 7)).toBe(7);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
pnpm test
```

Expected: FAIL — cannot resolve `@/hooks/use-persisted-state`.

- [ ] **Step 4: Implement `hooks/use-persisted-state.ts`**

```ts
"use client";

import { useEffect, useState } from "react";

export function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

/**
 * SSR-safe persisted state: renders `fallback` on the server and first
 * client paint (avoids hydration mismatch), then loads the stored value.
 */
export function usePersistedState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(readStored(key, fallback));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable — state still works in-memory */
    }
  }, [key, value, hydrated]);

  return [value, setValue] as const;
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test
```

Expected: PASS (13 tests total).

- [ ] **Step 6: Commit**

```bash
git add lib/motion.ts hooks/use-persisted-state.ts hooks/use-persisted-state.test.ts
git commit -m "feat: motion tokens + SSR-safe persisted state hook (tested)"
```

---

### Task 6: Rail + AppShell skeleton, wired into the layout

**Files:**
- Create: `components/shell/rail.tsx`, `components/shell/app-shell.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create `components/shell/rail.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House, Gauge, BookOpen, GraduationCap, Newspaper,
  ChatsCircle, Calculator, BookmarksSimple, ShareNetwork,
  SignIn, type Icon,
} from "@phosphor-icons/react";
import { NAV, activeSection } from "@/lib/nav";
import { cn } from "@/lib/cn";

const ICONS: Record<string, Icon> = {
  home: House,
  atlas: Gauge,
  wiki: BookOpen,
  courses: GraduationCap,
  news: Newspaper,
  pointstack: ChatsCircle,
  calculators: Calculator,
  references: BookmarksSimple,
  share: ShareNetwork,
};

export function Rail() {
  const pathname = usePathname();
  const active = activeSection(pathname);

  return (
    <nav
      aria-label="Primary"
      className="hidden h-full w-14 shrink-0 flex-col items-center gap-1 border-r border-line-dark bg-char py-3 md:flex"
    >
      <Link
        href="/"
        aria-label="BASidekick home"
        className="mb-2 flex size-8 items-center justify-center rounded-md bg-punch text-sm font-bold text-white"
      >
        B
      </Link>

      {NAV.map((section) => {
        const IconCmp = ICONS[section.id];
        const isActive = active?.id === section.id;
        return (
          <Link
            key={section.id}
            href={section.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative flex size-9 items-center justify-center rounded-md text-cream-3 transition-colors duration-150",
              "hover:bg-white/10 hover:text-cream",
              isActive && "bg-white/10 text-cream",
            )}
          >
            {isActive && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-punch" />
            )}
            <IconCmp size={18} weight={isActive ? "fill" : "regular"} />
            <span
              role="tooltip"
              className="pointer-events-none absolute left-11 z-40 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-cream opacity-0 transition-opacity duration-100 group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              {section.label}
            </span>
          </Link>
        );
      })}

      <div className="flex-1" />

      <Link
        href="/signin"
        aria-label="Sign in"
        className="group relative flex size-9 items-center justify-center rounded-md text-cream-3 transition-colors duration-150 hover:bg-white/10 hover:text-cream"
      >
        <SignIn size={18} />
        <span
          role="tooltip"
          className="pointer-events-none absolute left-11 z-40 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-cream opacity-0 transition-opacity duration-100 group-hover:opacity-100"
        >
          Sign in
        </span>
      </Link>
    </nav>
  );
}
```

(`/signin` is a stub route until Phase 3 — it will 404 for now; that is expected and acceptable in Phase 0.)

- [ ] **Step 2: Create `components/shell/app-shell.tsx`** (panel/top-bar/palette/tabs slots land in later tasks; start minimal)

```tsx
"use client";

import { type ReactNode } from "react";
import { Rail } from "@/components/shell/rail";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden">
      <Rail />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wrap children in `app/layout.tsx`**

In `RootLayout`, add the import and change the body:

```tsx
import { AppShell } from "@/components/shell/app-shell";
```

```tsx
      <body className="bg-bg font-sans text-fg antialiased">
        <AppShell>{children}</AppShell>
      </body>
```

- [ ] **Step 4: Verify in browser**

```bash
pnpm dev
```

Open http://localhost:3000: dark 56px rail on the left with 9 icons + red B logo, active Home icon marked with punch bar, tooltips on hover, token test page content on the right. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add components/shell/rail.tsx components/shell/app-shell.tsx app/layout.tsx
git commit -m "feat: dark icon rail + AppShell scaffold"
```

---

### Task 7: Section route stubs

**Files:**
- Create: `components/shell/placeholder-page.tsx` and 14 stub `page.tsx` routes

- [ ] **Step 1: Create `components/shell/placeholder-page.tsx`**

```tsx
export function PlaceholderPage({
  title,
  note = "This section lands in a later phase.",
}: {
  title: string;
  note?: string;
}) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-3">
        BASidekick
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-fg-2">{note}</p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-md border border-line bg-panel" />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Generate the stub routes**

```bash
cd ~/Projects/basidekick-app
while IFS=: read -r dir title; do
  mkdir -p "app/$dir"
  cat > "app/$dir/page.tsx" <<EOF
import { PlaceholderPage } from "@/components/shell/placeholder-page";

export const metadata = { title: "$title" };

export default function Page() {
  return <PlaceholderPage title="$title" />;
}
EOF
done <<'ROUTES'
atlas:Atlas
atlas/equipment:Equipment
atlas/points:Points
atlas/brands:Brands
atlas/search:Atlas Search
wiki:Wiki
courses:Courses
news:News
pointstack:PointStack
pointstack/experts:Experts
pointstack/jobs:Jobs
calculators:Calculators
references:References
share:Community Share
ROUTES
```

- [ ] **Step 3: Verify every route renders**

```bash
pnpm dev &
sleep 6
for p in atlas atlas/equipment atlas/points atlas/brands atlas/search wiki courses news pointstack pointstack/experts pointstack/jobs calculators references share; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/$p")
  echo "$code /$p"
done
kill %1
```

Expected: `200` for all 14 routes.

- [ ] **Step 4: Commit**

```bash
git add components/shell/placeholder-page.tsx app/atlas app/wiki app/courses app/news app/pointstack app/calculators app/references app/share
git commit -m "feat: stub routes for all Phase 0 sections"
```

---

### Task 8: Contextual sub-nav panel (collapsible, persisted)

**Files:**
- Create: `components/shell/context-panel.tsx`
- Modify: `components/shell/app-shell.tsx`

- [ ] **Step 1: Create `components/shell/context-panel.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { activeSection } from "@/lib/nav";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/cn";

export function ContextPanel() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [open, setOpen] = usePersistedState("bsk:panel-open", true);
  const section = activeSection(pathname);

  if (!section?.children) return null;

  return (
    <div className="relative hidden h-full shrink-0 md:block">
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="panel"
            initial={reduced ? false : { width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={reduced ? undefined : { width: 0, opacity: 0 }}
            transition={reduced ? { duration: 0 } : spring.gentle}
            className="h-full overflow-hidden border-r border-line bg-bg"
          >
            <div className="flex w-[220px] flex-col gap-0.5 px-3 py-4">
              <p className="px-2 pb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-3">
                {section.label}
              </p>
              {section.children.map((child) => {
                const isActive = pathname === child.href;
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "rounded-md px-2 py-1.5 text-[13px] text-fg-2 transition-colors duration-150 hover:bg-sand-2 hover:text-fg",
                      isActive && "bg-panel font-medium text-fg shadow-[inset_2px_0_0_0_var(--color-punch)]",
                    )}
                  >
                    {child.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Collapse section panel" : "Expand section panel"}
        aria-expanded={open}
        className="absolute -right-3 top-4 z-30 flex size-6 items-center justify-center rounded-full border border-line bg-panel text-fg-3 transition-colors duration-150 hover:text-fg"
      >
        {open ? <CaretLeft size={12} /> : <CaretRight size={12} />}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Add the panel to `components/shell/app-shell.tsx`**

```tsx
import { ContextPanel } from "@/components/shell/context-panel";
```

```tsx
    <div className="flex h-dvh overflow-hidden">
      <Rail />
      <ContextPanel />
      <div className="flex min-w-0 flex-1 flex-col">
```

- [ ] **Step 3: Verify in browser**

Run `pnpm dev`, open http://localhost:3000/atlas — panel shows Equipment/Points/Brands/Search; navigate to /atlas/points — Points highlighted with punch inset; collapse via the caret button, reload the page — panel stays collapsed (persistence); visit /news — no panel (no children); visit /pointstack — panel with Feed/Experts/Jobs.

- [ ] **Step 4: Commit**

```bash
git add components/shell/context-panel.tsx components/shell/app-shell.tsx
git commit -m "feat: collapsible contextual sub-nav panel with persisted state"
```

---

### Task 9: Top bar with breadcrumbs + palette trigger state

**Files:**
- Create: `components/shell/top-bar.tsx`
- Modify: `components/shell/app-shell.tsx`

- [ ] **Step 1: Create `components/shell/top-bar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { breadcrumbsFor } from "@/lib/nav";

export function TopBar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const pathname = usePathname();
  const crumbs = breadcrumbsFor(pathname);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-line bg-bg px-4">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px]">
        {crumbs.length === 0 ? (
          <span className="font-medium text-fg">Home</span>
        ) : (
          crumbs.map((crumb, i) => {
            const last = i === crumbs.length - 1;
            return (
              <span key={crumb.href} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-fg-3">/</span>}
                {last ? (
                  <span className="font-medium text-fg">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-fg-2 transition-colors duration-150 hover:text-fg">
                    {crumb.label}
                  </Link>
                )}
              </span>
            );
          })
        )}
      </nav>

      <button
        type="button"
        onClick={onOpenPalette}
        className="flex h-8 items-center gap-2 rounded-md border border-line bg-panel px-3 text-[12px] text-fg-3 transition-colors duration-150 hover:border-line-2 hover:text-fg-2"
      >
        <MagnifyingGlass size={14} />
        <span>Search…</span>
        <kbd className="rounded border border-line bg-bg px-1 font-mono text-[10px] text-fg-3">
          ⌘K
        </kbd>
      </button>
    </header>
  );
}
```

- [ ] **Step 2: Add palette state + top bar to `components/shell/app-shell.tsx`** (full file after this step)

```tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Rail } from "@/components/shell/rail";
import { ContextPanel } from "@/components/shell/context-panel";
import { TopBar } from "@/components/shell/top-bar";

export function AppShell({ children }: { children: ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex h-dvh overflow-hidden">
      <Rail />
      <ContextPanel />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenPalette={() => setPaletteOpen(true)} />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
```

(`paletteOpen` is consumed by the palette in Task 10; until then the button toggles unused state — that is fine for one task.)

- [ ] **Step 3: Verify in browser**

Run `pnpm dev`: top bar shows "Home" at `/`, "Atlas / Points" at `/atlas/points` with Atlas clickable; search pill renders with ⌘K hint.

- [ ] **Step 4: Commit**

```bash
git add components/shell/top-bar.tsx components/shell/app-shell.tsx
git commit -m "feat: top bar with breadcrumbs and palette trigger"
```

---

### Task 10: Command palette (⌘K)

**Files:**
- Create: `components/shell/command-palette.tsx`
- Modify: `components/shell/app-shell.tsx`

- [ ] **Step 1: Create `components/shell/command-palette.tsx`**

```tsx
"use client";

import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { NAV } from "@/lib/nav";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  return (
    <Command.Dialog open={open} onOpenChange={onOpenChange} label="Command menu">
      <Command.Input placeholder="Search sections, or jump to…" autoFocus />
      <Command.List>
        <Command.Empty>No results.</Command.Empty>
        {NAV.map((section) => (
          <Command.Group key={section.id} heading={section.label}>
            <Command.Item value={section.label} onSelect={() => go(section.href)}>
              Go to {section.label}
            </Command.Item>
            {section.children?.map((child) => (
              <Command.Item
                key={child.href}
                value={`${section.label} ${child.label}`}
                onSelect={() => go(child.href)}
              >
                {section.label} → {child.label}
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>
    </Command.Dialog>
  );
}
```

(Styling comes from the `[cmdk-*]` attribute selectors added to `globals.css` in Task 3. Federated content search — atlas/wiki/news — is Phase 1+; Phase 0 palette is navigation only.)

- [ ] **Step 2: Render it in `components/shell/app-shell.tsx`**

```tsx
import { CommandPalette } from "@/components/shell/command-palette";
```

Add inside the root div, after `</div>` closing the flex column:

```tsx
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
```

- [ ] **Step 3: Verify in browser**

Run `pnpm dev`: press ⌘K (or Ctrl+K) — palette opens with grouped commands; type "poi" — filters to PointStack entries; Enter navigates and closes; Escape closes; clicking the top-bar search pill also opens it.

- [ ] **Step 4: Commit**

```bash
git add components/shell/command-palette.tsx components/shell/app-shell.tsx
git commit -m "feat: cmdk command palette with keyboard shortcut"
```

---

### Task 11: Route transitions (`app/template.tsx`)

**Files:**
- Create: `app/template.tsx`

- [ ] **Step 1: Create `app/template.tsx`**

```tsx
"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { dur, rise } from "@/lib/motion";

export default function Template({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: rise }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: dur.base, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

(A `template.tsx` re-mounts on every navigation, so the enter animation replays per route. The shell — rail, panel, top bar — lives in `layout.tsx` and never re-mounts: content moves, chrome doesn't. Exit animations are deliberately omitted; App Router unmounts the old page synchronously.)

- [ ] **Step 2: Verify in browser**

Run `pnpm dev`, click between sections: page content fades in and rises 4px on each navigation; the rail and top bar do not flicker or move. With macOS "Reduce motion" enabled (System Settings → Accessibility → Display), content swaps with no animation.

- [ ] **Step 3: Commit**

```bash
git add app/template.tsx
git commit -m "feat: per-route enter transition via template.tsx"
```

---

### Task 12: Motion primitives + dashboard home

**Files:**
- Create: `components/motion/reveal.tsx`, `components/motion/skeleton.tsx`
- Modify: `app/page.tsx` (replace token test page)

- [ ] **Step 1: Create `components/motion/reveal.tsx`**

```tsx
"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { dur, rise, staggerChildren } from "@/lib/motion";

export function RevealGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren } } }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: rise * 2 },
        show: { opacity: 1, y: 0, transition: { duration: dur.large, ease: "easeOut" } },
      }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Create `components/motion/skeleton.tsx`**

```tsx
import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("bsk-skeleton rounded-md", className)} />;
}
```

- [ ] **Step 3: Replace `app/page.tsx` with the dashboard**

Placeholder data is inline and static — real data sources arrive in Phases 1–3.

```tsx
import Link from "next/link";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Skeleton } from "@/components/motion/skeleton";

export const metadata = { title: "Home" };

const NEWS = [
  { title: "Placeholder: industry signal headline one", tag: "News" },
  { title: "Placeholder: controls market note two", tag: "News" },
  { title: "Placeholder: standards update three", tag: "News" },
];

const THREADS = [
  { title: "Placeholder: trending PointStack question", replies: 12 },
  { title: "Placeholder: project showcase thread", replies: 7 },
  { title: "Placeholder: career advice discussion", replies: 4 },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <RevealGroup>
        <RevealItem>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-3">
            Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Welcome to BASidekick
          </h1>
        </RevealItem>

        <RevealItem className="mt-6">
          <Link
            href="/atlas/search"
            className="flex h-11 w-full max-w-xl items-center gap-2 rounded-md border border-line bg-panel px-4 text-sm text-fg-3 transition-colors duration-150 hover:border-line-2"
          >
            Search the Atlas — points, equipment, brands…
          </Link>
        </RevealItem>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RevealItem>
            <section className="rounded-lg border border-line bg-panel p-5">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold">Latest news</h2>
                <Link href="/news" className="text-[12px] text-punch hover:text-punch-2">
                  View all
                </Link>
              </div>
              <ul className="mt-3 space-y-3">
                {NEWS.map((item) => (
                  <li key={item.title} className="flex items-center gap-3">
                    <span className="rounded bg-punch-soft px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-punch">
                      {item.tag}
                    </span>
                    <span className="truncate text-[13px] text-fg-2">{item.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          </RevealItem>

          <RevealItem>
            <section className="rounded-lg border border-line bg-panel p-5">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold">Trending on PointStack</h2>
                <Link href="/pointstack" className="text-[12px] text-punch hover:text-punch-2">
                  View all
                </Link>
              </div>
              <ul className="mt-3 space-y-3">
                {THREADS.map((t) => (
                  <li key={t.title} className="flex items-center justify-between gap-3">
                    <span className="truncate text-[13px] text-fg-2">{t.title}</span>
                    <span className="shrink-0 font-mono text-[11px] text-fg-3">
                      {t.replies} replies
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </RevealItem>

          <RevealItem>
            <section className="rounded-lg border border-line bg-panel p-5">
              <h2 className="text-sm font-semibold">Jump back in</h2>
              <p className="mt-1 text-[12px] text-fg-3">
                Recently viewed pages appear here once sections come online.
              </p>
              <div className="mt-3 space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-4/5" />
                <Skeleton className="h-8 w-3/5" />
              </div>
            </section>
          </RevealItem>

          <RevealItem>
            <section className="rounded-lg border border-line bg-panel p-5">
              <h2 className="text-sm font-semibold">Explore</h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { label: "Wiki", href: "/wiki" },
                  { label: "Courses", href: "/courses" },
                  { label: "Calculators", href: "/calculators" },
                  { label: "Community Share", href: "/share" },
                ].map((x) => (
                  <Link
                    key={x.href}
                    href={x.href}
                    className="rounded-md border border-line px-3 py-2 text-[13px] text-fg-2 transition-colors duration-150 hover:border-line-2 hover:bg-sand-2 hover:text-fg"
                  >
                    {x.label}
                  </Link>
                ))}
              </div>
            </section>
          </RevealItem>
        </div>
      </RevealGroup>
    </div>
  );
}
```

- [ ] **Step 4: Verify in browser**

Run `pnpm dev`, load `/`: heading + search pill + four cards stagger in (≈50ms apart); "Jump back in" rows shimmer; all links navigate. With reduced motion on: everything renders instantly, no shimmer.

- [ ] **Step 5: Commit**

```bash
git add components/motion/reveal.tsx components/motion/skeleton.tsx app/page.tsx
git commit -m "feat: dashboard home with stagger entrance and skeletons"
```

---

### Task 13: Mobile — bottom tab bar + "More" sheet

**Files:**
- Create: `components/shell/mobile-tabs.tsx`
- Modify: `components/shell/app-shell.tsx`

- [ ] **Step 1: Create `components/shell/mobile-tabs.tsx`**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  House, Gauge, BookOpen, ChatsCircle, DotsThree, X,
} from "@phosphor-icons/react";
import { NAV, activeSection } from "@/lib/nav";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/cn";

const PRIMARY = [
  { id: "home", label: "Home", href: "/", icon: House },
  { id: "atlas", label: "Atlas", href: "/atlas", icon: Gauge },
  { id: "wiki", label: "Wiki", href: "/wiki", icon: BookOpen },
  { id: "pointstack", label: "PointStack", href: "/pointstack", icon: ChatsCircle },
];

export function MobileTabs() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [moreOpen, setMoreOpen] = useState(false);
  const active = activeSection(pathname);
  const rest = NAV.filter((s) => !PRIMARY.some((p) => p.id === s.id));

  return (
    <div className="md:hidden">
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              onClick={() => setMoreOpen(false)}
              className="fixed inset-0 z-40 bg-ink/40"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduced ? undefined : { opacity: 0 }}
            />
            <motion.div
              className="fixed inset-x-0 bottom-14 z-40 rounded-t-lg border-t border-line bg-panel p-4 pb-6"
              initial={reduced ? false : { y: "100%" }}
              animate={{ y: 0 }}
              exit={reduced ? undefined : { y: "100%" }}
              transition={reduced ? { duration: 0 } : spring.gentle}
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-3">
                  All sections
                </p>
                <button type="button" aria-label="Close" onClick={() => setMoreOpen(false)}>
                  <X size={16} className="text-fg-3" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {rest.map((s) => (
                  <Link
                    key={s.id}
                    href={s.href}
                    onClick={() => setMoreOpen(false)}
                    className="rounded-md border border-line px-3 py-2.5 text-[13px] text-fg-2"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-50 flex h-14 items-stretch border-t border-line bg-panel"
      >
        {PRIMARY.map((tab) => {
          const isActive = active?.id === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px]",
                isActive ? "text-punch" : "text-fg-3",
              )}
            >
              <tab.icon size={20} weight={isActive ? "fill" : "regular"} />
              {tab.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] text-fg-3"
        >
          <DotsThree size={20} />
          More
        </button>
      </nav>
    </div>
  );
}
```

- [ ] **Step 2: Add to `components/shell/app-shell.tsx`** and give scrolled content bottom clearance on mobile

```tsx
import { MobileTabs } from "@/components/shell/mobile-tabs";
```

```tsx
        <main className="min-h-0 flex-1 overflow-y-auto pb-14 md:pb-0">{children}</main>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <MobileTabs />
```

- [ ] **Step 3: Verify at mobile width**

Run `pnpm dev`, view at 375px width (devtools or preview resize): rail hidden, bottom bar with Home/Atlas/Wiki/PointStack/More, active tab in punch; "More" springs a sheet up with the remaining sections; overlay tap closes it.

- [ ] **Step 4: Commit**

```bash
git add components/shell/mobile-tabs.tsx components/shell/app-shell.tsx
git commit -m "feat: mobile bottom tab bar with More sheet"
```

---

### Task 14: Error surfaces + final verification

**Files:**
- Create: `app/error.tsx`, `app/not-found.tsx`

- [ ] **Step 1: Create `app/not-found.tsx`**

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-punch">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 text-sm text-fg-2">
        That page doesn&apos;t exist. Try the dashboard or press ⌘K to jump anywhere.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-ink px-4 py-2 text-sm font-medium text-cream"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/error.tsx`**

```tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-punch">Error</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-sm text-fg-2">
        The shell is fine — this page hit an error{error.digest ? ` (${error.digest})` : ""}.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-md bg-ink px-4 py-2 text-sm font-medium text-cream"
      >
        Try again
      </button>
    </div>
  );
}
```

(Because `error.tsx` sits inside the root layout, the rail/top bar survive page errors — per spec §7.)

- [ ] **Step 3: Full verification suite**

```bash
pnpm test        # expected: all tests pass
pnpm lint        # expected: no errors
pnpm build       # expected: build succeeds, all routes compile
```

Then a final browser pass (`pnpm dev`):
1. `/` — dashboard staggers in; ⌘K works; skeletons shimmer.
2. `/atlas/points` — rail active state, panel highlight, breadcrumb "Atlas / Points".
3. Panel collapse persists across reload.
4. `/definitely-not-a-page` — 404 renders inside the shell.
5. 375px width — bottom tabs + More sheet.
6. OS reduced-motion on — no transforms/stagger/shimmer anywhere.

- [ ] **Step 4: Commit**

```bash
git add app/error.tsx app/not-found.tsx
git commit -m "feat: error and 404 surfaces inside the shell"
```

---

## Out of scope for Phase 0 (do not build)

- Real data (news, wiki, atlas, pointstack) — Phases 1–3
- Supabase client, auth, sign-in sheet — Phase 3 (`/signin` 404s for now)
- Federated content search in the palette — Phase 1+
- Dark theme toggle — post-Phase 4 (tokens are already dark-ready)
- SEO surfaces beyond basic metadata — Phase 5
