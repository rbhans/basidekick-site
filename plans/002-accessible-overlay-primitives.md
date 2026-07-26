# Plan 002: Replace hand-built overlays with accessible primitives

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving on. Stop on any condition in “STOP conditions”; do not improvise. When done, update this plan’s row in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 9fba098..HEAD -- components.json package.json package-lock.json lib/utils.ts components/app-shell.tsx components/providers.tsx app/globals.css`
> If any in-scope file changed, compare the excerpts below with live code before proceeding.

## Status

- **State**: DONE
- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: `plans/001-restore-large-radius-token.md`
- **Category**: migration
- **Planned at**: commit `9fba098`, 2026-07-25

## Why this matters

The command palette, sign-in gate, and mobile navigation currently reimplement focus trapping, Escape behavior, focus restoration, outside-click handling, and modal semantics. The command palette and sign-in gate cover only selected cases, while the mobile drawer has no focus trap, Escape close, or scroll lock. Adopting shadcn-owned Radix primitives for these three behavior-heavy surfaces improves keyboard and assistive-technology behavior without changing BASidekick’s visual language.

## Current state

- `components.json:14-19` points `ui` to `@/components/ui`, which is already a shared component file. Do not overwrite that file.
- `components/app-shell.tsx:41-42` stores manual palette focus refs; lines 125–138 implement a manual Tab trap.
- `components/app-shell.tsx:144-177` renders the desktop/mobile sidebar directly; lines 207–220 implement the scrim and palette manually.
- `components/providers.tsx:80-95` manually restores focus; lines 100–113 implement another manual Tab trap.
- `app/globals.css:585-602` contains the approved overlay appearance. Preserve it.

```tsx
/* components/app-shell.tsx:125-138 — current */
function trapPaletteFocus(event: React.KeyboardEvent<HTMLElement>) {
  if (event.key !== "Tab") return;
  const focusable = Array.from(
    paletteRef.current?.querySelectorAll<HTMLElement>(
      "input, button, [href], [tabindex]:not([tabindex='-1'])",
    ) ?? [],
  ).filter((element) => !element.hasAttribute("disabled"));
  // manual first/last focus wrapping
}
```

```tsx
/* components/providers.tsx:115-116 — current */
<div className="modal-backdrop" role="presentation" onMouseDown={auth.closeSignIn}>
  <section ref={panelRef} tabIndex={-1} className="modal-panel"
    role="dialog" aria-modal="true" aria-labelledby="signin-gate-title">
```

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Generate primitives | `npx shadcn@latest add dialog sheet command` | exit 0; files created under `components/primitives/` |
| Validate | `npm run validate` | exit 0 |
| Audit scope | `git diff --check` | exit 0, no output |

## Suggested executor toolkit

- Use the `vercel:shadcn` skill if available. Treat generated code as owned source and edit it to match the existing CSS-variable system.
- Use a real browser keyboard pass after mechanical checks.

## Scope

**In scope**

- `components.json`
- `package.json`
- `package-lock.json`
- `lib/utils.ts`
- `components/primitives/dialog.tsx` (create)
- `components/primitives/sheet.tsx` (create)
- `components/primitives/command.tsx` (create)
- `components/workspace-command.tsx` (create)
- `components/mobile-workspace-nav.tsx` (create)
- `components/app-shell.tsx`
- `components/providers.tsx`
- `app/globals.css`
- focused tests created for these primitives
- `plans/README.md` (status only)

**Out of scope**

- `components/ui.tsx`; it is BASidekick’s existing PageHeader/DenseRow/Pill module.
- Visual restyling of the sidebar, palette, sign-in gate, cards, or forms.
- Search ranking, API contracts, Supabase behavior, navigation routes, or auth return paths.
- Replacing ordinary native controls with shadcn components.
- Motion changes beyond preserving current behavior; the separate animation plan governs command-palette timing.

## Git workflow

- Branch: `codex/002-accessible-overlays`
- Commit generated primitives separately from the migration when practical.
- Match existing imperative commit messages, for example `Migrate workspace overlays to accessible primitives`.
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Give generated primitives an unambiguous home

Change `components.json` alias `ui` from `@/components/ui` to `@/components/primitives`. Keep every other alias unchanged. Run the shadcn command above. If the generator attempts to overwrite `components/ui.tsx`, answer no and STOP; do not rename or delete it.

The generated primitives may add `cmdk`, Radix packages, and `tailwind-merge`. Update `lib/utils.ts` to the standard shadcn `cn()` shape only if generated files require merge semantics:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Verify**: `test -f components/primitives/dialog.tsx && test -f components/primitives/sheet.tsx && test -f components/primitives/command.tsx` → exit 0.

### Step 2: Migrate the sign-in gate

Use the generated Dialog root, portal, overlay, content, title, and description in `components/providers.tsx`. The `open` value remains `auth.signInOpen`; `onOpenChange(false)` calls `auth.closeSignIn()`. Remove `panelRef`, `previousFocusRef`, the Escape listener, and `trapFocus`; Radix owns those behaviors.

Apply existing class names (`modal-backdrop`, `modal-panel`, `modal-actions`) through primitive `className` props so dimensions, colors, and typography do not change. Keep the current sign-in URL and requested action copy exactly.

**Verify**: `npm run typecheck` → exit 0.

### Step 3: Migrate mobile navigation to Sheet

Extract only the mobile presentation of the sidebar into `components/mobile-workspace-nav.tsx`. Use Sheet with `open={mobileOpen}` and `onOpenChange={setMobileOpen}`. The desktop `<aside>` remains in `components/app-shell.tsx`; do not render duplicate `id="workspace-navigation"` values.

The mobile Sheet must:

- close on Escape and outside interaction;
- trap focus while open and restore focus to the More/menu trigger;
- lock background scrolling;
- retain the same links, auth filtering, theme toggle, sign-out action, and animated icons;
- use the existing 235–244px sidebar width, left edge, and mobile scrim appearance.

Remove the manual `.mobile-scrim` button after Sheet’s overlay is wired.

**Verify**: `npm run typecheck` → exit 0.

### Step 4: Migrate command search to Dialog plus Command

Extract the palette into `components/workspace-command.tsx`. Preserve:

- `Cmd/Ctrl+K`, Escape, ArrowUp/ArrowDown, Enter, and focus return;
- the `/api/search?q=` debounce and abort behavior;
- `searchWorkspace(query, 10, remoteItems)` ranking;
- the single topbar search trigger;
- result labels, kind labels, result count, and all-section footer copy.

Use Command with filtering disabled (`shouldFilter={false}` or the current equivalent), because `searchWorkspace` remains authoritative. Use stable item values based on `kind` plus `href`. Remove `paletteRef`, `previousFocusRef`, and `trapPaletteFocus` from `app-shell.tsx`.

Do not introduce a second search field or search trigger.

**Verify**: `npm run typecheck` → exit 0.

### Step 5: Reapply BASidekick appearance and tests

Adapt generated data-attribute selectors in `app/globals.css` so the current `.palette-backdrop`, `.command-palette`, `.modal-backdrop`, and `.modal-panel` appearance remains unchanged. Use `--paper`, `--line`, `--line-strong`, `--shadow`, `--radius`, and `--radius-lg`; do not introduce shadcn neutral palette tokens.

Add focused tests that verify:

- opening the sign-in gate moves focus inside; Tab wraps; Escape closes; focus returns;
- opening mobile navigation traps focus, Escape closes it, and focus returns;
- Cmd/Ctrl+K opens one palette; arrows change the selected result; Enter navigates;
- the Tools page still has exactly one `.topbar-search`.

If the repo lacks a DOM test environment, add the smallest Vitest + jsdom + Testing Library setup needed for these tests; do not add Playwright solely for this plan.

**Verify**: `npm run validate` → exit 0.

## Test plan

- Model server-rendered route assertions after `tests/rendered-html.test.mjs`.
- Put interactive overlay tests beside the extracted component files as `*.test.tsx`.
- Cover mouse/outside click, keyboard Escape, Tab containment, focus restoration, and one command navigation.
- Run `npm run validate`; all old tests and all new tests must pass.

## Done criteria

- [ ] No manual focus trap remains in `components/app-shell.tsx` or `components/providers.tsx`.
- [ ] `rg -n "trapPaletteFocus|trapFocus|mobile-scrim" components app/globals.css` returns no matches.
- [ ] `components/ui.tsx` is unchanged.
- [ ] One global search trigger remains on `/tools`.
- [ ] `npm run validate` exits 0.
- [ ] Only in-scope files changed.
- [ ] `plans/README.md` row 002 is `DONE`.

## STOP conditions

- The shadcn generator targets or overwrites `components/ui.tsx`.
- The installed primitive version cannot retain controlled `open` state or focus restoration.
- Preserving search ranking requires replacing `searchWorkspace` or changing `/api/search`.
- The migration changes Supabase calls, auth redirect URLs, route structure, or approved visual tokens.
- Any interactive test fails twice after a scoped correction.

## Maintenance notes

Future overlays should use the same primitives instead of introducing another focus trap. Reviewers should inspect keyboard behavior and verify that generated neutral/tailwind defaults did not leak into BASidekick’s visual system.
