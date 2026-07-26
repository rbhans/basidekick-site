# Plan 003: Distinguish PointStack load failures from empty accounts

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving on. Stop on any condition in “STOP conditions”; do not improvise. When done, update this plan’s row in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 9fba098..HEAD -- app/'(workspace)'/pointstack/notifications/page.tsx app/'(workspace)'/pointstack/messages/page.tsx components/account-activity.tsx`
> If any in-scope file changed, compare the excerpts below with live code before proceeding.

## Status

- **State**: DONE
- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `9fba098`, 2026-07-25

## Why this matters

The signed-in notifications and messages pages convert read failures into empty arrays. A Supabase outage or RLS/query regression therefore tells the user “No notifications yet” or “No conversations,” which is materially false and hides backend wiring problems during the replacement launch.

## Current state

```tsx
/* app/(workspace)/pointstack/notifications/page.tsx:11-13 — current */
let notifications: PointStackNotification[] = [];
try { notifications = await fetchNotifications(client, data.user.id); } catch {}
return <NotificationsPanel initialNotifications={notifications} />;
```

```tsx
/* app/(workspace)/pointstack/messages/page.tsx:11-14 — current */
let conversations: PointStackConversation[] = [];
try { conversations = await fetchConversations(client, data.user.id); } catch {}
const { data: people } = await client!.from("profiles")...
return <MessagesPanel userId={data.user.id}
  initialConversations={conversations} people={people ?? []} />;
```

`components/account-activity.tsx:38` and `124` already have legitimate empty-account states. Preserve those states for successful empty queries.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Validate | `npm run validate` | exit 0 |
| Diff hygiene | `git diff --check` | exit 0, no output |

## Scope

**In scope**

- `app/(workspace)/pointstack/notifications/page.tsx`
- `app/(workspace)/pointstack/messages/page.tsx`
- `components/account-activity.tsx`
- focused tests for these states
- `plans/README.md` (status only)

**Out of scope**

- Supabase schema, RLS, functions, or query contracts.
- Public PointStack fallback behavior.
- Retry queues, observability vendors, or global error architecture.
- Copy changes outside these two pages.

## Git workflow

- Branch: `codex/003-pointstack-load-failure-states`
- Use one commit: `Show PointStack account load failures`
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Preserve the failure signal in server pages

In each page, add a local `loadFailed` boolean initialized to `false`; set it to `true` in the existing catch block. For the profiles query on the messages page, also treat a returned Supabase `error` as a load failure while keeping any successfully loaded conversations.

Pass the boolean to the client panel. Do not pass raw database errors or display RLS details.

**Verify**: `npm run typecheck` → exit 0.

### Step 2: Render explicit unavailable states

Add optional `loadFailed?: boolean` props to `NotificationsPanel` and `MessagesPanel`.

When true, render the normal PageHeader followed by the existing `EmptyState` component:

- label: `TEMPORARILY UNAVAILABLE`
- notifications copy: `Notifications could not be loaded. Refresh this page to try again.`
- messages copy: `Messages could not be loaded. Refresh this page to try again.`

The failure branch must run before the empty-array branch. Do not expose exception messages.

**Verify**: `npm run typecheck` → exit 0.

### Step 3: Test failure versus empty

Add focused component tests proving:

- `loadFailed=true` renders `TEMPORARILY UNAVAILABLE` and does not render `ALL CAUGHT UP` or `NO CONVERSATIONS`;
- `loadFailed=false` with an empty array preserves the current legitimate empty copy.

Use the existing Vitest configuration. If DOM helpers are absent and plan 002 has not added them, prefer a small server-render assertion with `react-dom/server` over adding a new test stack for these static branches.

**Verify**: `npm run validate` → exit 0.

## Done criteria

- [ ] No empty catch remains in the two page files.
- [ ] Failed reads and successful empty reads render distinct text.
- [ ] No raw Supabase error reaches user-visible copy.
- [ ] `npm run validate` exits 0.
- [ ] Only in-scope files changed.
- [ ] `plans/README.md` row 003 is `DONE`.

## STOP conditions

- The page’s query contract changed since `9fba098`.
- A failure state would require a Supabase schema or RLS change.
- The executor cannot test both static branches without changing unrelated test infrastructure.

## Maintenance notes

This is intentionally local, not a global error abstraction. If the same pattern appears on three more authenticated pages, a later plan may extract a shared load-result type.
