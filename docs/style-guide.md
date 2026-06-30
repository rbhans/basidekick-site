# BASidekick Style Guide

Last updated: 2026-05-26

This is the short operational guide for applying the BASidekick visual and editorial system. The deeper source of truth is `docs/brand-guidelines.md`; token details live in `design.md`.

## Core Identity

BASidekick is an independent BAS reference, community, and open-source toolkit. It should feel like a working drawing, field manual, and instrument panel: practical, specific, and calm.

Use:
- Plainspoken copy for BAS people who already know the field.
- Technical artifacts: point names, aliases, Haystack/Brick tags, source metadata, commissioning notes, and repo/tool status.
- Crimson as the only loud brand accent.
- Archivo for body/display and JetBrains Mono for labels, metadata, code, and tabular information.

Avoid:
- Vendor-brochure polish, stock building photos, fake enterprise metrics, and abstract AI graphics.
- Purple gradients, neon accents, generic HVAC blue as the dominant palette, or multiple equal accent colors.
- Grand claims such as "revolutionary", "cutting-edge", "seamless", or "unlock".

## Brand Categories

All related work should be classified into one of these top-level families unless repo or user evidence says otherwise.

| Category | Role | Use for | Style emphasis |
|---|---|---|---|
| BASidekick | Solo BAS tools business and independent BAS resource platform | BASidekick Site, BAS Atlas, OpenCrate, rust-bac, rust-mod, PointStack, Wiki, News, Open Source | Alias Cartography + Field Instrument |
| QA Graphics | Employer/work context and QA Graphics products | QA Graphics, Foxhound, Metassist, employer-facing BAS graphics work | Work-tool clarity, Niagara/Metasys specificity, practical production language |
| Personal | Personal portfolio, experiments, games, and non-work/non-BASidekick projects | Personal Site and personal experiments when not clearly BASidekick or QA Graphics | Quiet portfolio clarity; do not inherit BASidekick crimson-heavy product chrome by default |

If a project is ambiguous, do not guess. Mark it as needing classification in the project context or Obsidian note.

## BASidekick Surface Rules

The BASidekick public site can support several surfaces without becoming several brands:

- Atlas: strongest cartographic expression; alias routes, canonical entries, specimen cards.
- PointStack: quieter trade-desk cues, still inside BASidekick's ruled/map system.
- Wiki: field-manual structure, readable long-form content, strong provenance.
- News: indexed dispatches, source/date/category, why-it-matters summaries.
- Open Source: technical spec sheets, package status, protocol references, commands.

Do not give each surface its own unrelated palette, typography, or illustration style.

## Visual Rules

- Backgrounds: warm paper/sand for long-form surfaces, near-black instrument panels for high-signal areas.
- Accent: crimson only for the most important action or signal in a region.
- Supporting colors: use only for semantics, ontology, status, syntax, or wiki categories.
- Borders: 1px ruled lines and compact metadata rows should organize content.
- Radius: 4px chips, 6px buttons/cards/inputs, 8px large containers; rounded-full only for avatars.
- Motion: purposeful and quiet. Use route drawing, state reveal, slow specimen cycling, or hover provenance. No decorative particles or scroll hijacking.

## Copy Rules

Use:
- "Browse the Atlas"
- "Read the field note"
- "Built by a working engineer, independent of any vendor."
- "Vendor fog -> shared BAS knowledge."

Avoid:
- "Join our community of industry-leading professionals"
- "Revolutionizing building automation"
- "Get started in seconds"
- Empty welcome copy

CTA verbs: Browse, Explore, Open, Read, Submit, Sign in, Join, Continue, Start.

## Implementation Pointers

- Canonical brand rationale: `docs/brand-guidelines.md`
- Token reference: `design.md`
- Category architecture: `docs/brand-architecture.md`
- Brand materials and assets: `docs/brand-materials.md`
- Static assets: `public/brand/`
- Runtime brand routes: `app/opengraph-image.tsx`, `app/twitter-image.tsx`, `app/icon.svg`, `app/apple-icon.tsx`, `app/manifest.ts`
- Logo component: `components/brand-mark.tsx`
