# basidekick-site

## Brand and Style
- Canonical brand guide: `docs/brand-guidelines.md`
- Short style guide: `docs/style-guide.md`
- BASidekick / QA Graphics / Personal category model: `docs/brand-architecture.md`
- Brand material inventory: `docs/brand-materials.md`
- Engineering token reference: `design.md`

## Database (Supabase)
- Source of truth: `supabase/migrations`
- Apply migrations with Supabase CLI (example):
  - `supabase db reset` (local)
  - `supabase db push` (remote)
- `supabase/schema.sql` is a legacy snapshot and may be out of date.
