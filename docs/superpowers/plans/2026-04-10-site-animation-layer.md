# Site Animation Layer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a cohesive, subtle animation layer across BASidekick using Motion (Framer Motion) primitives — scroll reveals, hover lifts, press scales, animated counters, page transitions, and a spring-physics mobile drawer.

**Architecture:** A set of thin `"use client"` wrapper components in `components/motion/` that share timing/easing tokens. Pages compose these primitives around existing content. All primitives respect `prefers-reduced-motion`.

**Tech Stack:** Next.js 16, React 19, Motion (framer-motion v11+), Tailwind CSS 4

**Spec:** `docs/superpowers/specs/2026-04-10-site-animation-layer-design.md`

---

## File Structure

```
components/motion/
  tokens.ts          — shared duration/easing/distance constants
  reveal.tsx         — <Reveal> scroll-triggered entrance
  stagger-group.tsx  — <StaggerGroup> staggered children entrances
  hover-lift.tsx     — <HoverLift> hover y-translate + shadow
  press-scale.tsx    — <PressScale> tap scale feedback
  count-up.tsx       — <CountUp> animated number
  page-transition.tsx — <PageTransition> route-change fade
  index.ts           — barrel export
```

---

### Task 1: Install Motion

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the motion package**

```bash
pnpm add motion
```

- [ ] **Step 2: Verify installation**

```bash
pnpm ls motion
```

Expected: `motion` appears in dependencies.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add motion (framer-motion) dependency"
```

---

### Task 2: Animation Tokens

**Files:**
- Create: `components/motion/tokens.ts`

- [ ] **Step 1: Create the tokens file**

```ts
// components/motion/tokens.ts

export const duration = {
  fast: 0.15,
  normal: 0.4,
  slow: 0.6,
} as const;

export const ease = {
  out: [0.25, 0.46, 0.45, 0.94] as const,
  spring: { type: "spring" as const, stiffness: 300, damping: 30 },
} as const;

export const stagger = {
  default: 0.08,
} as const;

export const distance = {
  reveal: 20,
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add components/motion/tokens.ts
git commit -m "feat(motion): add shared animation tokens"
```

---

### Task 3: `<Reveal>` Component

**Files:**
- Create: `components/motion/reveal.tsx`

- [ ] **Step 1: Create the Reveal component**

```tsx
// components/motion/reveal.tsx
"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { duration, ease, distance as distanceTokens } from "./tokens";

type Direction = "up" | "down" | "left" | "right";

interface RevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  distance?: number;
  duration?: number;
  once?: boolean;
  className?: string;
}

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
};

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  distance = distanceTokens.reveal,
  duration: dur = duration.normal,
  once = true,
  className,
}: RevealProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const offset = offsets[direction];

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: offset.x * distance, y: offset.y * distance }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{ duration: dur, ease: ease.out as unknown as number[], delay }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify it renders without errors**

Start dev server (`pnpm dev`) and temporarily import `<Reveal>` in `home-view.tsx` around the hero `<h1>`. Confirm the heading fades and slides up on page load. Remove the temporary import after verifying.

- [ ] **Step 3: Commit**

```bash
git add components/motion/reveal.tsx
git commit -m "feat(motion): add Reveal scroll-entrance component"
```

---

### Task 4: `<StaggerGroup>` Component

**Files:**
- Create: `components/motion/stagger-group.tsx`

- [ ] **Step 1: Create the StaggerGroup component**

```tsx
// components/motion/stagger-group.tsx
"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { duration, ease, stagger as staggerTokens, distance } from "./tokens";

interface StaggerGroupProps {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  className?: string;
  once?: boolean;
}

export function StaggerGroup({
  children,
  stagger: staggerDelay = staggerTokens.default,
  delay = 0,
  className,
  once = true,
}: StaggerGroupProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.1 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// Wrap each child in this to participate in the stagger
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: distance.reveal },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: duration.normal, ease: ease.out as unknown as number[] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/motion/stagger-group.tsx
git commit -m "feat(motion): add StaggerGroup and StaggerItem components"
```

---

### Task 5: `<HoverLift>` Component

**Files:**
- Create: `components/motion/hover-lift.tsx`

- [ ] **Step 1: Create the HoverLift component**

```tsx
// components/motion/hover-lift.tsx
"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ease } from "./tokens";

interface HoverLiftProps {
  children: ReactNode;
  distance?: number;
  className?: string;
}

export function HoverLift({
  children,
  distance = 3,
  className,
}: HoverLiftProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileHover={{
        y: -distance,
        boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.08)",
      }}
      transition={ease.spring}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/motion/hover-lift.tsx
git commit -m "feat(motion): add HoverLift hover interaction component"
```

---

### Task 6: `<PressScale>` Component

**Files:**
- Create: `components/motion/press-scale.tsx`

- [ ] **Step 1: Create the PressScale component**

```tsx
// components/motion/press-scale.tsx
"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ease } from "./tokens";

interface PressScaleProps {
  children: ReactNode;
  scale?: number;
  className?: string;
}

export function PressScale({
  children,
  scale = 0.97,
  className,
}: PressScaleProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileTap={{ scale }}
      transition={ease.spring}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/motion/press-scale.tsx
git commit -m "feat(motion): add PressScale tap interaction component"
```

---

### Task 7: `<CountUp>` Component

**Files:**
- Create: `components/motion/count-up.tsx`

- [ ] **Step 1: Create the CountUp component**

```tsx
// components/motion/count-up.tsx
"use client";

import { useEffect, useRef } from "react";
import {
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";
import { duration } from "./tokens";

interface CountUpProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({
  value,
  duration: dur = duration.slow,
  prefix = "",
  suffix = "",
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReduced = useReducedMotion();
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    duration: dur * 1000,
  });
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, motionValue, value]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Math.round(latest)}${suffix}`;
      }
    });
    return unsubscribe;
  }, [springValue, prefix, suffix]);

  if (prefersReduced) {
    return <span className={className}>{prefix}{value}{suffix}</span>;
  }

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/motion/count-up.tsx
git commit -m "feat(motion): add CountUp animated number component"
```

---

### Task 8: `<PageTransition>` Component

**Files:**
- Create: `components/motion/page-transition.tsx`

- [ ] **Step 1: Create the PageTransition component**

```tsx
// components/motion/page-transition.tsx
"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/motion/page-transition.tsx
git commit -m "feat(motion): add PageTransition route-change fade component"
```

---

### Task 9: Barrel Export

**Files:**
- Create: `components/motion/index.ts`

- [ ] **Step 1: Create the barrel export**

```ts
// components/motion/index.ts
export { Reveal } from "./reveal";
export { StaggerGroup, StaggerItem } from "./stagger-group";
export { HoverLift } from "./hover-lift";
export { PressScale } from "./press-scale";
export { CountUp } from "./count-up";
export { PageTransition } from "./page-transition";
export { duration, ease, stagger, distance } from "./tokens";
```

- [ ] **Step 2: Commit**

```bash
git add components/motion/index.ts
git commit -m "feat(motion): add barrel export for motion primitives"
```

---

### Task 10: Add PageTransition to Main Layout

**Files:**
- Modify: `app/(main)/layout.tsx`

- [ ] **Step 1: Wrap children in PageTransition**

In `app/(main)/layout.tsx`, import `PageTransition` and wrap the `{children}` inside `<main>`:

```tsx
// Add to imports:
import { PageTransition } from "@/components/motion";

// Change the <main> contents from:
<main id="main-content" className="flex-1" tabIndex={-1}>
  {children}
</main>

// To:
<main id="main-content" className="flex-1" tabIndex={-1}>
  <PageTransition>{children}</PageTransition>
</main>
```

- [ ] **Step 2: Verify page fade works**

Run `pnpm dev`, navigate between pages. Each page should fade in smoothly over 200ms.

- [ ] **Step 3: Commit**

```bash
git add app/\(main\)/layout.tsx
git commit -m "feat(motion): add page transition to main layout"
```

---

### Task 11: Animate the Home Page Hero

**Files:**
- Modify: `components/views/home-view.tsx`

- [ ] **Step 1: Add Reveal to hero elements**

Import at the top of `home-view.tsx`:

```tsx
import { Reveal } from "@/components/motion";
```

Wrap the three hero elements inside the `<section>` (the pulse line, the `<h1>`, and the `<p>` + attribution). Replace lines 69-93:

```tsx
{/* Pulse line */}
<Reveal delay={0}>
  <div className="font-mono text-[11px] uppercase tracking-[1.5px] text-muted-foreground mb-8 flex items-center gap-2">
    <span className="live-dot" aria-hidden="true" />
    <span>
      Updated this week · {pulse.newWikiThisWeek} new wiki entries · {pulse.newAtlasThisWeek} new atlas points · {pulse.newPointStackThisWeek} new PointStack posts
    </span>
  </div>
</Reveal>

<Reveal delay={0.1} duration={0.6}>
  <h1 className="font-heading font-semibold text-[34px] md:text-[44px] lg:text-[52px] leading-[1.08] tracking-[-0.015em] text-foreground">
    BAS info, community, and resources —{" "}
    <em className="italic font-medium text-accent">
      collected from next to the industry
    </em>
    , not from inside it.
  </h1>
</Reveal>

<Reveal delay={0.2} duration={0.6}>
  <p className="mt-8 text-[17px] md:text-[18px] leading-[1.55] text-foreground max-w-[640px]">
    A growing reference for the people who build, integrate, and operate building automation systems. Open data, open source, and a small community that actually answers questions.
  </p>

  <p className="mt-9 font-heading italic text-[16px] text-muted-foreground">
    — Rob, Tucson
  </p>
</Reveal>
```

- [ ] **Step 2: Verify hero animation**

Run `pnpm dev`, load the home page. The pulse line, heading, and body text should stagger in with subtle fade-up animations.

- [ ] **Step 3: Commit**

```bash
git add components/views/home-view.tsx
git commit -m "feat(motion): animate home page hero with staggered reveals"
```

---

### Task 12: Animate Home Page Sections

**Files:**
- Modify: `components/views/home-view.tsx`

- [ ] **Step 1: Add Reveal to section headings and CountUp to stats**

Add `CountUp` to the import:

```tsx
import { Reveal, CountUp } from "@/components/motion";
```

Wrap the "01 / Atlas, today" section heading block (lines 99-108) with `<Reveal>`:

```tsx
<Reveal>
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
</Reveal>
```

Wrap the specimen card (lines 111-151) with `<Reveal delay={0.1}>`:

```tsx
<Reveal delay={0.1}>
  {featuredAtlas && (
    <div className="mt-9 bg-card border border-border rounded-md p-9 grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* ... existing specimen card content unchanged ... */}
    </div>
  )}
</Reveal>
```

Wrap the "02 / PointStack" section heading (lines 177-179) with `<Reveal>`:

```tsx
<Reveal>
  <div className="font-mono text-[11px] uppercase tracking-[1.4px] text-muted-foreground mb-3">
    <span className="text-accent mr-1.5">02 /</span>
    PointStack
  </div>
</Reveal>
```

Replace the `PointStackStat` values with `CountUp`. In the stats row (lines 191-194), change the `<PointStackStat>` calls to pass the component:

```tsx
<PointStackStat label="People" value={pointStackStats.members} />
<PointStackStat label="Posts" value={pointStackStats.posts} />
<PointStackStat label="Open jobs" value={pointStackStats.openJobs} />
<PointStackStat label="Online now" value={pointStackStats.onlineNow} accent />
```

And update the `PointStackStat` sub-component (around line 313) to use `CountUp`:

```tsx
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
        <CountUp value={value} />
      </strong>
      <span className={accent ? "text-accent flex items-center gap-1.5" : ""}>
        {accent && <span className="live-dot" aria-hidden="true" />}
        {label}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Verify section animations**

Run `pnpm dev`, scroll through the home page. Each section heading should reveal on scroll. PointStack stats should count up from 0 when they enter the viewport.

- [ ] **Step 3: Commit**

```bash
git add components/views/home-view.tsx
git commit -m "feat(motion): animate home page sections with reveals and countup stats"
```

---

### Task 13: Animate Home Page Card Grids

**Files:**
- Modify: `components/views/home-view.tsx`

- [ ] **Step 1: Add StaggerGroup to post cards and AlsoHere grid**

Add `StaggerGroup`, `StaggerItem`, and `HoverLift` to the import:

```tsx
import { Reveal, CountUp, StaggerGroup, StaggerItem, HoverLift } from "@/components/motion";
```

Wrap the PointStack posts grid (lines 201-229). Replace the grid container:

```tsx
{pointStackPosts.length > 0 && (
  <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-9">
    {pointStackPosts.slice(0, 3).map((post) => (
      <StaggerItem key={post.id}>
        <HoverLift>
          <Link
            href={post.url}
            className="bg-card border border-border rounded-md p-5 flex flex-col gap-2 hover:border-foreground transition-colors h-full"
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
        </HoverLift>
      </StaggerItem>
    ))}
  </StaggerGroup>
)}
```

Wrap the "Also here" grid (lines 250-282):

```tsx
<StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-9">
  <StaggerItem>
    <AlsoHereItem
      num="03"
      title="Wiki"
      description={`Field-tested guides on grounding, sequencing, commissioning, and the things nobody writes down. ${alsoHere.wikiCount} articles and counting.`}
      linkLabel="Browse the wiki"
      href={ROUTES.WIKI}
    />
  </StaggerItem>
  <StaggerItem>
    <AlsoHereItem
      num="04"
      title="News"
      description="A small daily-ish feed of the BAS industry — standards updates, vendor news, security advisories. No hot takes."
      linkLabel="Read the feed"
      href={ROUTES.NEWS}
    />
  </StaggerItem>
  <StaggerItem>
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
  </StaggerItem>
</StaggerGroup>
```

- [ ] **Step 2: Verify card animations**

Run `pnpm dev`, scroll to the PointStack posts and "Also here" sections. Cards should stagger in and lift on hover.

- [ ] **Step 3: Commit**

```bash
git add components/views/home-view.tsx
git commit -m "feat(motion): animate home page card grids with stagger and hover lift"
```

---

### Task 14: Animate the Navbar (Active Indicator + Mobile Drawer)

**Files:**
- Modify: `components/navbar.tsx`

- [ ] **Step 1: Add layout animation to nav active indicator**

Add imports at the top of `components/navbar.tsx`:

```tsx
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ease } from "@/components/motion";
```

Replace the desktop nav link rendering (lines 80-93) with a version that uses `layoutId` for the active underline:

```tsx
<nav className="hidden md:flex items-center gap-8 ml-auto">
  {NAV_LINKS.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      className={`relative text-[14px] font-medium transition-colors ${
        isActive(link.href)
          ? "text-accent"
          : "text-foreground hover:text-accent"
      }`}
    >
      {link.label}
      {isActive(link.href) && (
        <motion.span
          layoutId="nav-active"
          className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-accent"
          transition={ease.spring}
        />
      )}
    </Link>
  ))}
</nav>
```

- [ ] **Step 2: Animate the mobile drawer**

Replace the mobile drawer overlay and panel (lines 165-206) with animated versions:

```tsx
<AnimatePresence>
  {mobileOpen && (
    <>
      <motion.div
        className="fixed inset-0 z-50 bg-foreground/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => setMobileOpen(false)}
      />
      <motion.div
        className="fixed top-0 right-0 bottom-0 z-50 w-[280px] bg-background border-l border-border flex flex-col"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={ease.spring}
      >
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
      </motion.div>
    </>
  )}
</AnimatePresence>
```

Note: The outer `{mobileOpen && (...)}` conditional is replaced by `<AnimatePresence>` wrapping a `{mobileOpen && (...)}` block, which allows the exit animation to play before unmounting.

- [ ] **Step 3: Verify navbar animations**

Run `pnpm dev`. Click between nav links — the accent underline should slide between them. On mobile viewport, open the hamburger menu — the drawer should spring in from the right and the overlay should fade in. Closing should reverse.

- [ ] **Step 4: Commit**

```bash
git add components/navbar.tsx
git commit -m "feat(motion): animate nav active indicator and mobile drawer"
```

---

### Task 15: Add HoverLift to Card Components

**Files:**
- Modify: `components/article-card.tsx`
- Modify: `components/feature-card.tsx`

- [ ] **Step 1: Wrap ArticleCard content with HoverLift**

In `components/article-card.tsx`, add the import:

```tsx
import { HoverLift } from "@/components/motion";
```

Wrap the returned `<Link>` with `<HoverLift>`:

```tsx
export function ArticleCard({ /* ...props... */ }: ArticleCardProps) {
  const color = accentColor || getWikiCategoryColor(category, categorySlug);
  const displayFacets = facets?.slice(0, 2);

  return (
    <HoverLift>
      <Link
        href={ROUTES.WIKI_ARTICLE(slug)}
        className={`group block bg-card border border-border rounded-md p-5 hover:border-foreground transition-all h-full ${className || ""}`}
        style={{ borderLeftWidth: "3px", borderLeftColor: color }}
      >
        {/* ...existing content unchanged... */}
      </Link>
    </HoverLift>
  );
}
```

- [ ] **Step 2: Wrap FeatureCard with HoverLift**

In `components/feature-card.tsx`, add the import:

```tsx
import { HoverLift } from "@/components/motion";
```

Wrap the returned `<div>` with `<HoverLift>`:

```tsx
export function FeatureCard({ title, description, icon, className }: FeatureCardProps) {
  return (
    <HoverLift>
      <div
        className={cn(
          "p-5 border border-border rounded-md bg-card hover:border-foreground transition-all",
          className
        )}
      >
        {/* ...existing content unchanged... */}
      </div>
    </HoverLift>
  );
}
```

- [ ] **Step 3: Verify card hover lifts**

Run `pnpm dev`, navigate to Wiki and hover over article cards. They should subtly lift with a shadow expansion. Same for feature cards wherever they appear.

- [ ] **Step 4: Commit**

```bash
git add components/article-card.tsx components/feature-card.tsx
git commit -m "feat(motion): add hover lift to article and feature cards"
```

---

### Task 16: Add PressScale to Buttons

**Files:**
- Modify: `components/ui/button.tsx`

- [ ] **Step 1: Wrap Button output with PressScale**

In `components/ui/button.tsx`, add the import:

```tsx
import { PressScale } from "@/components/motion"
```

Wrap the returned component with `<PressScale>`. Update the `Button` function:

```tsx
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  // Don't apply press scale to icon buttons or link variants
  const skipPress = variant === "link" || variant === "ghost";

  const button = (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );

  if (skipPress || asChild) return button;
  return <PressScale>{button}</PressScale>;
}
```

- [ ] **Step 2: Verify button press feedback**

Run `pnpm dev`, click any primary or secondary button. It should scale down slightly on press.

- [ ] **Step 3: Commit**

```bash
git add components/ui/button.tsx
git commit -m "feat(motion): add press scale to primary and secondary buttons"
```

---

### Task 17: Clean Up Old CSS Animations

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Check for usage of old animation classes**

Search the codebase to confirm nothing still uses the old classes:

```bash
grep -r "animate-fade-in-up\|animate-fade-in\|animate-scale-in\|animate-on-scroll\|animation-delay" --include="*.tsx" --include="*.ts" components/ app/
```

If any files still use them, either wrap those elements with motion primitives or leave the CSS for now and address in a follow-up.

- [ ] **Step 2: Remove old CSS keyframes and utilities**

In `app/globals.css`, remove lines 85-153 (the `/* Entrance Animations */` block through the `@media (prefers-reduced-motion)` block). Keep the `bsk-pulse` keyframe and everything else.

The section to remove:

```css
/* Entrance Animations */
@keyframes fade-in-up { ... }
@keyframes fade-in { ... }
@keyframes scale-in { ... }
.animate-fade-in-up { ... }
.animate-fade-in { ... }
.animate-scale-in { ... }
.animation-delay-100 { ... }
.animation-delay-200 { ... }
.animation-delay-300 { ... }
.animation-delay-400 { ... }
.animation-delay-500 { ... }
.animate-on-scroll { ... }
@media (prefers-reduced-motion: reduce) { ... }
```

- [ ] **Step 3: Verify nothing is broken**

Run `pnpm dev`, navigate through all main pages. Nothing should look broken or flash.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "chore: remove old CSS entrance animations replaced by motion primitives"
```

---

### Task 18: Verify Full Animation Layer

- [ ] **Step 1: Full walkthrough**

Run `pnpm dev` and do a complete walkthrough:

1. **Home page load** — Hero text staggers in, section headings reveal on scroll, stats count up, post cards stagger in, "Also here" cards stagger in
2. **Card hovers** — Post cards, article cards, and feature cards lift on hover
3. **Button presses** — Primary/secondary buttons scale on click
4. **Nav** — Active underline slides between links, mobile drawer springs in/out
5. **Page transitions** — Navigate between pages, each fades in smoothly
6. **Reduced motion** — Open System Settings > Accessibility > Reduce Motion, reload. All animations should be disabled; content renders statically

- [ ] **Step 2: Build check**

```bash
pnpm build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit any fixes**

If any issues were found and fixed during the walkthrough, commit them:

```bash
git add -A
git commit -m "fix(motion): address issues found during animation walkthrough"
```
