# BASidekick App

The zero-based BASidekick rebuild: a public building-automation workspace with an app-like shell, live Supabase reads, protected contribution actions, and a conventional logged-out landing page.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and provide the existing BASidekick Supabase project URL and publishable key. The app remains readable with curated fallback content when those values are absent.

## Validation

```bash
npm run validate
```

This runs lint, TypeScript, calculator and navigation tests, a standard Next.js production build, and rendered route checks against `next start`.

## Architecture

- Next.js App Router deployed through Vercel
- Supabase Auth and existing RLS-backed data contracts
- Geist Sans and Geist Mono
- CSS token system with complete light/dark themes

Project decisions and current implementation status live in [`context/`](context/README.md).
