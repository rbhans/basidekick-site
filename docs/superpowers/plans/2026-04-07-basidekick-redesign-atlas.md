# BASidekick Redesign — Plan 2: Atlas

**Goal:** Rewrite the main `/atlas` browse page and point/equipment detail modal to match the new design system. Equipment sub-pages and the graph view are out of scope for this plan.

**Spec reference:** `docs/superpowers/specs/2026-04-07-basidekick-redesign-design.md` §3.3 (reference/list pattern), §3.4.1 (modal detail pattern), §3.5 (title block strip), §5.4 (Atlas rewrites).

**Architecture:** The Atlas page flow is:

```
app/(main)/atlas/page.tsx
  → AtlasTabbedView (components/atlas/atlas-tabbed-view.tsx)
      → BabelViewContent (components/babel/babel-view.tsx)
          → BabelSearch (components/babel/babel-search.tsx)
          → BabelSidebar (components/babel/babel-sidebar.tsx)
          → BabelEntryCard (components/babel/babel-entry-card.tsx) [for each row]

app/(main)/atlas/[id]/page.tsx   (full page view)
  → PageHero + BabelEntryPageClient → BabelEntryDetail
app/(main)/atlas/@modal/(.)[id]/page.tsx   (modal intercepting route)
  → BabelEntryModal → BabelEntryPageClient → BabelEntryDetail
```

The `useBabelData` hook and `BabelEntryDetail` (487 lines of equipment-mapping logic) are preserved untouched — we only restyle the shell.

## Tasks

1. **Rewrite `AtlasTabbedView`** — Remove `PageHero`, remove `Tabs` component, remove `SiteBadge` eyebrow. Add title block strip at the top. Render `BabelViewContent` directly, no tabbing layer — scope chips in BabelView replace the Points/Equipment tabs.

2. **Rewrite `BabelView` / `BabelViewShell`** — New layout:
   - Italic Fraunces tagline above the search
   - Big Fraunces-font search input with `⌕` glyph on the left
   - Scope chips row: `All / Points / Equipment` (no separate Brands scope — equipment is enough)
   - Grouped browse: rows grouped by category (Temperature, Pressure, Flow, etc. for points; Air Handling, Terminal Units, etc. for equipment)
   - Empty state: italic Fraunces message
   - Footer row: `A / Recently added` (placeholder), `B / Contribute`, with the GitHub + API access links moved here
   - Colophon: per-page mono colophon

3. **Rewrite `BabelEntryCard` → `BabelEntryRow`** — Convert card to row layout:
   - 3-column grid: name (Fraunces) + aliases (mono) + meta (mono right-aligned)
   - Click opens the modal via `<Link>` to `/atlas/[id]`
   - Hover: background tint, no lift

4. **Delete `BabelSidebar`** if nothing else imports it.

5. **Inline `BabelSearch`** into `BabelView` or simplify. The new search is more than just the input — it's tagline + input + chips + counter.

6. **Rewrite `BabelEntryModal` chrome** — Replace the bare `Dialog` + `DialogContent` with a drawing-styled modal: mini title block strip at the top with a close `×`, cream background, forest border. The inner `BabelEntryDetail` stays but gets wrapped in the new frame.

7. **Update `/atlas/[id]/page.tsx`** — Remove the `PageHero` + `SiteBadge`. Wrap the content in the title block strip. Keep rendering `BabelEntryPageClient` inside.

8. **Validation** — `pnpm build`, walk the atlas page, click an entry, confirm modal opens, confirm URL changes, refresh the URL and confirm full page renders.

## Out of scope (deferred to Plan 2b or later)

- `BabelEntryDetail` redesign (keep its current inner layout; it gets the new palette passively)
- Equipment sub-pages: `/atlas/equipment/[brand]/[type]/[model]`
- Atlas graph view: `/atlas/graph`
- Equipment add form
- Contribution dialog restyling

Those stay in the transitional "new palette + old layout" state until a follow-up plan.

## Verification model

Same as Plan 1: `pnpm build` for type checks, targeted `pnpm exec eslint <changed-files>` for lint, manual dev-server check for visual. No component unit tests (the codebase has none).
