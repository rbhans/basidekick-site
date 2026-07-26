# Decisions

- 2026-07-14: Rebuild presentation code from zero in a parallel repository.
- 2026-07-14: Use Library as the canonical successor to Community Share and PointStack Resources.
- 2026-07-14: Keep public reading account-free; gate writes with reusable sign-in prompts and server verification.
- 2026-07-14: Preserve the live Supabase schema and RLS unless a replacement requirement genuinely needs an additive change.
- 2026-07-14: Use a private preview before domain cutover.
- 2026-07-14: Keep the workspace productive and restrained while using BAS-specific field-instrument details and a more expressive technical-editorial landing page for personality.
- 2026-07-23: Adopt the Optical Balance BrandMark refinement across runtime and static assets. Preserve the crimson 32×18 card and lookup → answer → reference concept while tightening spacing, corner radii, and stroke weight.
- 2026-07-25: Treat `Intro to BAS` as one course with ten lessons. Preserve the original MDX lesson content, diagrams, and interaction types; use the existing `course_progress` contract for account completion and local storage for in-lesson interaction state.
- 2026-07-25: Atlas is a replacement rather than a compatibility migration. Its current page and API route communicate rebuild status without advertising the retired endpoint structure.
- 2026-07-25: With no active user migration risk, apply a bounded additive Supabase migration for account-backed saves, recent views, Library tags, direct-message creation, and moderation. Keep RLS authoritative and remove obsolete or unintended public RPC and storage-listing access where verified safe.
- 2026-07-25: Target standard Next.js on Vercel, matching the existing site's hosting platform. Keep Supabase as the authoritative backend and preserve all current route and data contracts during the hosting conversion.
- 2026-07-25: Use shadcn-compatible Radix primitives selectively for behavior-heavy overlays and command navigation, while keeping the custom BASidekick visual system and existing feature components.
- 2026-07-25: Keep command search open and close behavior immediate. Use motion for clear feedback and course state changes, retain the approved animated sidebar icons, and limit decorative geometric hover movement to precise pointers.
- 2026-07-25: Consolidate the approved replacement into the original `rbhans/basidekick-site` repository so the existing GitHub integration, Vercel project, environment configuration, domains, and rollback history remain authoritative. Preserve the retired site through a remote archive branch, tags, and a portable bundle.
- 2026-07-25: Retain historical Supabase migrations during the presentation replacement. The backend history and RLS contracts are not retired site presentation code.
