# basidekick-site

## BAS Data Program
- Design anchor: [bas-babel/DESIGN.md](https://github.com/rbhans/bas-babel/blob/main/DESIGN.md)
- BAS Babel and BAS Atlas dataset wrapper endpoints are documented in `API.md`.

## Database (Supabase)
- Source of truth: `supabase/migrations`
- Apply migrations with Supabase CLI (example):
  - `supabase db reset` (local)
  - `supabase db push` (remote)
- `supabase/schema.sql` is a legacy snapshot and may be out of date.
