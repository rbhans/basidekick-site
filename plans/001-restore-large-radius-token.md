# Plan 001: Restore the missing large-radius token

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving on. Stop on any condition in “STOP conditions”; do not improvise. When done, update this plan’s row in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 9fba098..HEAD -- app/globals.css tests/rendered-html.test.mjs`
> If either file changed, compare the excerpts below with live code before proceeding.

## Status

- **State**: DONE
- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `9fba098`, 2026-07-25

## Why this matters

Four application surfaces use `var(--radius-lg)`, but no scope defines that custom property. An unresolved custom property invalidates the entire `border-radius` declaration, so activity lists, messages, message bubbles, and engagement panels render with square corners instead of the established 6–9px BASidekick treatment.

## Current state

- `app/globals.css:23` defines only `--radius: 7px`.
- `app/globals.css:565`, `570`, `577`, and `579` use `var(--radius-lg)`.
- The project’s approved rule is restrained 6–8px radii; the command palette and modal currently use 9px at `app/globals.css:587` and `600`.

```css
/* app/globals.css:22-27 — current */
--sidebar-width: 244px;
--radius: 7px;
--fast: 120ms;
--normal: 180ms;
--slow: 280ms;
```

```css
/* app/globals.css:565 — current */
.activity-list { border: 1px solid var(--line); border-radius: var(--radius-lg); overflow: hidden; }
```

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Lint/type/test/build | `npm run validate` | exit 0; existing 117 unit tests and rendered-route tests pass |
| Diff hygiene | `git diff --check` | exit 0, no output |

## Scope

**In scope**

- `app/globals.css`
- `tests/rendered-html.test.mjs`
- `plans/README.md` (status only)

**Out of scope**

- Changing any component markup.
- Changing existing `--radius` or hard-coded 6–9px values.
- Restyling cards or panels.

## Git workflow

- Branch: `codex/001-restore-large-radius-token`
- Use one commit: `Restore missing large radius token`
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Define the token

Add `--radius-lg: 9px;` immediately after `--radius: 7px;` in `:root`. Do not duplicate it in `.dark`; geometry is theme-independent.

**Verify**: `rg -n -- "--radius-lg" app/globals.css` → one definition plus the four existing uses.

### Step 2: Add a regression assertion

In `tests/rendered-html.test.mjs`, add a test near the other visual contract tests that reads `app/globals.css` and asserts:

- `--radius-lg: 9px` is present.
- every `var(--radius-lg)` use has a definition in the same stylesheet.

Use the existing `readFile` import and the asset test at lines 75–100 as the file-reading pattern.

**Verify**: `npm run test` → exit 0.

## Test plan

- The new rendered-contract test must fail if the token definition is removed or misspelled.
- Existing dashboard, messages, and notifications route tests must still pass.

## Done criteria

- [ ] `rg -n -- "--radius-lg: 9px" app/globals.css` returns exactly one line.
- [ ] `npm run validate` exits 0.
- [ ] `git diff --check` exits 0.
- [ ] Only the in-scope files changed.
- [ ] `plans/README.md` row 001 is `DONE`.

## STOP conditions

- The token is already defined at runtime through a stylesheet not present at commit `9fba098`.
- Product direction now requires a value outside the established 6–9px range.
- Verification fails twice after correcting only this change.

## Maintenance notes

Prefer `--radius` for ordinary cards and `--radius-lg` only for larger contained surfaces. Reviewers should ensure the fix is a token restoration, not a broad corner-radius redesign.
