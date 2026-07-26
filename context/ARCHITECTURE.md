# Architecture

- App Router pages render through standard Next.js and target Vercel's native Next.js runtime.
- `components/app-shell.tsx` owns desktop and mobile workspace navigation.
- `lib/supabase/` owns browser, server, and session-refresh clients. Existing Supabase schema and RLS are authoritative.
- Server pages fetch public News, Wiki, PointStack, and Library data and pass serializable view models to client explorers. Curated fallback data keeps public pages resilient.
- Pure calculator and reference data is isolated under `lib/calculators/` and `lib/references/`.
- Atlas UI routes redirect to `/atlas`. `/api/atlas` reports rebuild status only; the retired API structure is not a compatibility target.
