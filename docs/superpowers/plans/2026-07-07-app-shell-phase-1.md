# BASidekick App Shell — Phase 1 Implementation Plan (News + Wiki, read-only)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Real News and Wiki sections in `~/Projects/basidekick-app`, ported from the Supabase-backed implementations in `~/Projects/basidekick-site` and fully redesigned for the app shell — read-only (no submissions, votes, comments, or contributions; those arrive with auth in Phase 3).

**Architecture:** Both sections read from the SAME Supabase project the old site uses (no schema changes, RLS untouched). A null-returning `createClient()` makes every surface degrade gracefully when env vars are absent (local dev has no `.env.local` by design — all local verification exercises the degraded/empty states; real-data verification happens on a deployed preview). Wiki markdown renders through a ported `MarkdownContent` component (react-markdown + gfm + highlight + lazy Mermaid + YouTube embeds), restyled to the new tokens.

**Porting convention (applies to every port task):** The old repo at `/Users/benhansen/Projects/basidekick-site` is READ-ONLY reference. Tasks name exact source files; the implementer reads them and re-authors for the new app: (1) all styling replaced with the new token/utility vocabulary — never copy old class names like `bsk-wrap`, `text-ink-2`, shadcn classes; (2) all write-path code (mutations, auth-gated actions, dialogs, forms) OMITTED entirely; (3) imports rewired to new-app modules; (4) keep data-shape logic (queries, filters, types) as close to verbatim as possible. Every changed line must trace to this plan.

**Design language for Phase 1 pages (binding):**
- Dense professional-tool surfaces: lists are bordered ROWS (`border-line`, hover `bg-sand-2`), not big cards. 13px body, mono micro-labels (uppercase, tracking-[0.14em+], `text-fg-3`) for meta (source domain, dates, counts, facets).
- Punch is the only chrome accent (active states, links, live tags). Wiki category colors come from the semantic accents (ochre/moss/slate/teal/plum) as small dots/chips only.
- Page headers: mono eyebrow + title + one-line description, matching PlaceholderPage's rhythm.
- Lists animate in with `RevealGroup`/`RevealItem`; loading states use `Skeleton`. No new motion values — `lib/motion.ts` only.
- Empty states (no Supabase env, or zero results) are designed, not blank: eyebrow + sentence + optional action, in `text-fg-3`.

**Env contract:** `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`, both optional. With neither set: every route still returns 200 (except detail routes for nonexistent content → 404), rendering designed empty states. This is the primary local acceptance criterion.

---

### Task 1: Supabase foundation + dependencies

**Files:**
- Modify: `package.json` (deps)
- Create: `lib/supabase/client.ts`, `lib/security.ts`

- [ ] **Step 1:** `cd ~/Projects/basidekick-app && pnpm add @supabase/supabase-js @supabase/ssr react-markdown remark-gfm rehype-highlight mermaid`
- [ ] **Step 2:** Create `lib/supabase/client.ts` — port from old repo `lib/supabase/client.ts`: a browser-client factory that returns `null` when either `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is unset (read the old file; preserve its null-pattern exactly, drop anything auth-session-specific that isn't needed to construct the client). Also export a server-side variant if the old repo has one used by news/wiki server components (check `app/(main)/news/page.tsx` — it builds an inline client; centralize that here as `createServerReadClient(): SupabaseClient | null`).
- [ ] **Step 3:** Create `lib/security.ts` — port ONLY `escapeJsonLd` and `sanitizeSearchInput` from old `lib/security.ts` (verbatim logic).
- [ ] **Step 4:** Verify `pnpm exec tsc --noEmit && pnpm lint && pnpm test && pnpm build` green. Commit: `feat: supabase read clients + security helpers`.

### Task 2: Domain types

**Files:** Create `lib/types.ts` (new app)

- [ ] **Step 1:** Port from old `lib/types.ts` ONLY: `NewsArticle`, `NewsArticleComment`, `NewsFeedFilter`, `NewsSortBy` (~lines 991–1044) and `WikiCategory`, `WikiFacetGroup`, `WikiFacet`, `WikiCollection`, `WikiArticle`, `WikiComment` (~lines 144–260; skip deprecated `WikiTag`, skip contribution types — Phase 3). Keep field names/types verbatim (they mirror DB columns).
- [ ] **Step 2:** `pnpm exec tsc --noEmit && pnpm lint` green. Commit: `feat: news + wiki domain types`.

### Task 3: Markdown renderer

**Files:** Create `components/markdown-content.tsx`

- [ ] **Step 1:** Port old `components/markdown-content.tsx` (react-markdown + remark-gfm + rehype-highlight, YouTube auto-embed for link-only paragraphs, lazy Mermaid for ```mermaid fences). Restyle every element override to new tokens (headings tight-tracked Familjen, code in Spline mono on `bg-sand-2`, tables with `border-line` hairlines, blockquote with punch left border `rounded-none`). Import a highlight.js theme via CSS — add `@import "highlight.js/styles/github.css";` to `app/globals.css` (matches old repo) — plus dark-ready note comment.
- [ ] **Step 2:** Verify with a scratch: temporarily render `<MarkdownContent content={SAMPLE}/>` (sample string with heading, table, code fence, mermaid fence, YouTube link) on `/wiki` stub, check in dev server (port 3210), then REMOVE the scratch before committing. `tsc/lint/build` green. Commit: `feat: markdown renderer restyled to app tokens`.

### Task 4: Wiki sub-nav in the shell

**Files:** Modify `lib/nav.ts`, `lib/nav.test.ts`

- [ ] **Step 1:** Give the wiki section children: `[{ label: "All articles", href: "/wiki" }, { label: "Videos", href: "/wiki/videos" }]`. This makes the contextual panel appear on wiki routes.
- [ ] **Step 2:** Update `lib/nav.test.ts`: the intentional-duplicate count in the unique-hrefs test goes from 1 to 2 (wiki "All articles" now also shares its section href); update the comment accordingly. Run `pnpm test` — all pass. Commit: `feat: wiki sub-nav (All articles, Videos)`.

### Task 5: News data layer (read-only)

**Files:** Create `lib/news-api.ts`

- [ ] **Step 1:** Port from old `components/news/news-api.ts` ONLY the read paths, re-based on the null-returning clients from Task 1: `fetchArticles(filter: NewsFeedFilter, limit, offset): Promise<NewsArticle[]>` (top/new/discussed ordering — copy the old query shapes exactly, `is_published` filter included), `fetchArticleBySlug(slug)`, `fetchComments(articleId)`. Every function returns `[]`/`null` when the client is null. NO submit/vote/comment mutations, NO view-count increment (needs RPC + write; Phase 3).
- [ ] **Step 2:** `tsc/lint/test` green. Commit: `feat: read-only news data layer`.

### Task 6: News feed page

**Files:** Create `app/news/page.tsx` (replace stub), `components/news/news-feed.tsx`, `components/news/news-row.tsx`

- [ ] **Step 1:** `app/news/page.tsx` (server component): fetch 30 latest published via Task 5 API (server read client), emit CollectionPage/ItemList JSON-LD (port shape from old `app/(main)/news/page.tsx`, using `escapeJsonLd`), render header (eyebrow "BASidekick · Signal", title "News", one-liner) + `<NewsFeed initialArticles={…}/>`. `export const revalidate = 900` (15 min — new decision: the old page was fully dynamic; a cached feed is fine and makes the page static-friendly).
- [ ] **Step 2:** `NewsFeed` (client): sort tabs Top/New/Discussed (refetch via anon client when available; when null, tabs still render and sort the initial array client-side by upvote_count/published_at/comment_count), search input filtering client-side over title/summary/source/tags (port the filter predicate from old `news-list.tsx`), "Load more" appending via `fetchArticles` offset (hidden when client null). Rows via `NewsRow`: dense bordered row — mono source domain + relative date left, title (links to `/news/[slug]`), tag chips (punch-soft), upvote/comment counts in mono right. RevealGroup stagger on first paint. Designed empty state.
- [ ] **Step 3:** Verify (no env): `/news` 200, header + empty state render, no console errors; `tsc/lint/test/build` green. Commit: `feat: news feed redesigned for app shell`.

### Task 7: News article page

**Files:** Create `app/news/[slug]/page.tsx`, `components/news/news-article.tsx`

- [ ] **Step 1:** Server page: `fetchArticleBySlug`; `generateMetadata` (title/description from article, port from old `[slug]/page.tsx`); TechArticle-style JSON-LD via `escapeJsonLd`; Supabase-null OR missing article → `notFound()` (simplification vs old inconsistent behavior — document in commit body). Render: header block (source domain mono chip linking out via `rel="noopener noreferrer" target="_blank"`, title, published date, tags), summary paragraph, prominent "Read at {source_domain} ↗" punch link, then read-only comments (fetchComments; render count + threaded list, flat styling; no forms). `export const revalidate = 3600`.
- [ ] **Step 2:** Verify (no env): any `/news/foo` → 404 (correct degraded behavior); `tsc/lint/build` green. Commit: `feat: news article page (read-only)`.

### Task 8: Wiki data layer + filters

**Files:** Create `lib/wiki-api.ts`, `lib/wiki-filters.ts`, `lib/wiki-colors.ts`, `lib/wiki-filters.test.ts`

- [ ] **Step 1:** Port `lib/wiki-filters.ts` (parse/serialize/hasActiveFilters/param↔group maps) and `lib/wiki-colors.ts` (map category slugs → the five semantic accent tokens: how-to-niagara→slate, troubleshooting→ochre, documentation→plum, best-practices→moss, reference→teal; replace the old CSS-var scheme with these).
- [ ] **Step 2:** `lib/wiki-api.ts` read-only, null-safe: `fetchCategories()`, `fetchFacetGroups()` (with facets), `fetchFeaturedCollections()`, `fetchArticles(filters: WikiFilterState, page): {articles, count}` (port the old `wiki-view.tsx` query composition: category eq, facet junction AND-filter, `.textSearch("search_vector", sanitizeSearchInput(q), {type:"websearch", config:"english"})`, sort orders, `range()` pagination 20/page), `fetchArticleBySlug(slug)` (with author/category/facets join per old `[slug]/page.tsx`), `fetchFacetBySlug(groupSlugs, slug)`, `fetchArticlesByFacet(facetId)`, `fetchCollectionBySlug(slug)` (with ordered articles).
- [ ] **Step 3:** TDD the pure module: port/adapt the filter parse/serialize behavior into `lib/wiki-filters.test.ts` (round-trip: parse(serialize(state)) === state for a state using every param; unknown params ignored; hasActiveFilters false for empty). Write tests first, watch fail, implement, pass.
- [ ] **Step 4:** `tsc/lint/test/build` green. Commit: `feat: wiki data layer, filters (tested), category colors`.

### Task 9: Wiki index page

**Files:** Replace `app/wiki/page.tsx`, create `components/wiki/wiki-explorer.tsx`, `components/wiki/wiki-article-row.tsx`, `components/wiki/wiki-filter-bar.tsx`

- [ ] **Step 1:** Rebuild the old `wiki-view.tsx` experience read-only and redesigned: header (eyebrow "BASidekick · Knowledge", title "Wiki"), full-text search input, filter bar (category chips colored by `wiki-colors` dots; facet dropdowns per group from `PARAM_TO_GROUP_SLUG`; sort select; active filters reflected in the URL via `wiki-filters` serialize + `useRouter`), article rows (category dot, title → `/wiki/[slug]`, summary line clamped, facet chips mono, updated date), pagination (20/page, Prev/Next). All client-fetched via `lib/wiki-api` reacting to `useSearchParams` (mirror old architecture). Skeleton rows while loading; designed empty state for both "no Supabase" and "no results" (distinct copy).
- [ ] **Step 2:** Verify (no env): `/wiki` 200, header + filter chrome + empty state render, contextual panel shows All articles/Videos, no console errors. `tsc/lint/build` green. Commit: `feat: wiki index redesigned for app shell`.

### Task 10: Wiki article page

**Files:** Create `app/wiki/[slug]/page.tsx`, `components/wiki/wiki-article.tsx`, `components/wiki/related-articles.tsx`

- [ ] **Step 1:** Server page, `export const revalidate = 86400` (preserve old ISR). Fetch via `fetchArticleBySlug`; null client or missing → `notFound()`. `generateMetadata` + TechArticle & BreadcrumbList JSON-LD (port shapes from old `[slug]/page.tsx`). Render: breadcrumb-consistent header (category chip with color dot linking to filtered index, title, summary, author name + updated date in mono), `<MarkdownContent content={article.content}/>` in a measure-limited column (`max-w-3xl`), facet chips footer linking to facet landings, `<RelatedArticles/>` (same category, exclude self, 4 max — simplify old component; server-fetched). NO comments/bookmark/report/suggest-edit (Phase 3).
- [ ] **Step 2:** Verify (no env): `/wiki/anything` → 404. `tsc/lint/build` green. Commit: `feat: wiki article page with markdown + related`.

### Task 11: Facet landings, videos, collections, legacy redirect

**Files:** Create `components/wiki/facet-landing.tsx`, `app/wiki/topic/[slug]/page.tsx`, `app/wiki/protocol/[slug]/page.tsx`, `app/wiki/platform/[slug]/page.tsx`, `app/wiki/videos/page.tsx`, `app/wiki/collections/[slug]/page.tsx`, `app/wiki/tags/[tagSlug]/page.tsx`

- [ ] **Step 1:** ONE generic `FacetLanding` component (facet header w/ group label eyebrow, description, article rows reusing `wiki-article-row`); thin server routes per group with the old allow-list semantics (`topic` accepts topic/system_domain/content_format; protocol/platform restrict to own group — read old routes for the exact `ACCEPTED_GROUP_SLUGS`/`GROUP_ROUTE_MAP` values and copy them). `/wiki/videos` = facet `video` in `content_format`, graceful empty fallback (old behavior). `/wiki/tags/[tagSlug]` = redirect shim to new facet URLs (port `GROUP_ROUTE_MAP` logic). Collections page: ordered article rows under a collection header.
- [ ] **Step 2:** Verify (no env): `/wiki/videos` 200 with empty state; `/wiki/topic/x`, `/wiki/collections/x`, `/wiki/tags/x` → 404. `tsc/lint/build` green. Commit: `feat: wiki facet landings, videos, collections, legacy tag redirects`.

### Task 12: ⌘K federated search

**Files:** Modify `components/shell/command-palette.tsx`

- [ ] **Step 1:** Add a "Content" layer to the palette: when the input has ≥2 chars AND the anon client exists, debounce 250ms and query wiki (`wiki_articles` `.ilike("title", %q%)` `.eq("is_published", true)` limit 5 — same as old `header-search.tsx`) and news (`news_articles` same pattern) in parallel; render as two extra `Command.Group`s ("Wiki", "News") with `Command.Item` per hit navigating to the detail page. Loading state via `Command.Loading`. When client is null, palette behaves exactly as today (nav only). Keep `shouldFilter` semantics correct: remote results must not be filtered away by cmdk's own matcher — set `value` to the matched title so they survive, or use `shouldFilter={false}` with manual nav-item filtering (read cmdk docs in node_modules; pick the approach that keeps nav filtering working, document choice in the commit body).
- [ ] **Step 2:** Verify (no env): palette still opens/filters/navigates exactly as before (nav-only). `tsc/lint/test/build` green. Commit: `feat: federated wiki+news search in command palette`.

### Task 13: Final Phase 1 verification

- [ ] **Step 1:** Full suite: `pnpm test` (all pass incl. new wiki-filters tests), `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build` — green.
- [ ] **Step 2:** Degraded-mode sweep (dev server, no env): `/news` 200 + empty state; `/news/x` 404; `/wiki` 200 + empty state + panel children; `/wiki/videos` 200; `/wiki/x`, `/wiki/topic/x`, `/wiki/collections/x`, `/wiki/tags/x` 404; palette unchanged; zero console errors on every route.
- [ ] **Step 3:** Update `docs/phase-0-debt.md` → rename to reality: append a "Phase 1 notes" section listing deferred items (writes/comments forms, view counts, curation script port, real-data verification pending deploy with env). Commit: `chore: phase 1 verification + deferred notes`.

## Out of scope (do not build)
- Any write path: submissions, votes, comments, contributions, bookmarks, view-count increments.
- `curate-news.mjs` / `wiki-bulk-curate.mjs` ports (ops tooling — ports alongside deploy work, Phase 5).
- Atlas anything (sqlite, prebuild scripts) — Phase 2.
- Sitemap/SEO surfaces beyond per-page metadata + JSON-LD — Phase 5.
- Auth/sign-in sheet — Phase 3.
