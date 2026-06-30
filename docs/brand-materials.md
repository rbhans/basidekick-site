# Brand Materials

Last updated: 2026-05-26

This inventory lists the repo-local brand and style material that agents should use before consulting external notes.

## Canonical Repo Files

| File | Purpose |
|---|---|
| `docs/brand-guidelines.md` | Canonical BASidekick visual and verbal identity rationale |
| `docs/style-guide.md` | Short operational style guide for applying the brand |
| `docs/brand-architecture.md` | BASidekick / QA Graphics / Personal category model |
| `design.md` | Engineering-facing token reference and parseable design-system frontmatter |
| `docs/brand-kit.html` | Local visual brand kit artifact |
| `docs/brand-review-2026-04-16.md` | Historical audit of the prior visual system |
| `components/brand-mark.tsx` | Runtime BrandMark and BrandLockup component |
| `public/brand/` | Static SVG brand assets |
| `app/opengraph-image.tsx` | Runtime canonical Open Graph render |
| `app/twitter-image.tsx` | Twitter card route |
| `app/icon.svg` | Browser icon |
| `app/apple-icon.tsx` | Apple touch icon route |
| `app/manifest.ts` | PWA manifest and icon metadata |

## Static Brand Assets

Use assets from `public/brand/` rather than redrawing the mark.

Current static assets include:
- `brandmark.svg`
- `brandmark-inverse.svg`
- `brandmark-maskable.svg`
- `brandmark-mono.svg`

If additional exported wordmarks, social images, or avatar assets are added, document them here and in `docs/brand-guidelines.md`.

## Supporting Obsidian Notes

Obsidian is supporting context only. Use these when the vault files are available:

- `/Users/benhansen/wiki/04-shared/design/product-guides/basidekick-design-standard.md`
- `/Users/benhansen/wiki/04-shared/design/product-guides/basidekick-site-brand-mood.md`
- `/Users/benhansen/wiki/04-shared/design/product-guides/basidekick-styleframe-reset-2026-04-24.md`
- `/Users/benhansen/wiki/01-work/qa-graphics.md`
- `/Users/benhansen/wiki/02-basidekick.md`
- `/Users/benhansen/wiki/02-basidekick/projects/basidekick-site.md`
- `/Users/benhansen/wiki/02-basidekick/projects/personal-site.md`

Do not require Obsidian access at runtime. If a design rule matters to implementation, copy the concise rule into repo-local docs or code comments where appropriate.

## Maintenance Rules

- Keep `docs/brand-guidelines.md`, `docs/style-guide.md`, `docs/brand-architecture.md`, and `design.md` in sync when brand rules change.
- Do not add new color tokens, fonts, or logo variants without updating the docs.
- Do not add generated or exploratory images as canonical assets unless the user explicitly accepts them.
- Mark historical material as historical rather than deleting it when it may explain prior implementation choices.
