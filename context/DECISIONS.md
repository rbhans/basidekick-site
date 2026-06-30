# Decisions

Use short dated entries.

## 2026-05-26 - Project memory scaffold initialized
Decision:
- Direct Obsidian project note exists at `/Users/benhansen/wiki/02-basidekick/projects/basidekick-site.md` and is supporting context only.

Reason:
- Add repo-local Markdown context for ongoing AI-assisted work.

Tradeoffs:
- Context files summarize evidence and avoid guessing missing product direction.

## 2026-05-26 - Brand category model documented repo-locally
Decision:
- Use three top-level related-work categories: BASidekick, QA Graphics, and Personal.
- Keep BASidekick's canonical style guide and category model in this repo under `docs/`.

Reason:
- The user asked for style guide, branding information, and materials to live in the BASidekick Site repo.
- Repo-local docs should be available without assuming direct Obsidian access.

Tradeoffs:
- Obsidian remains supporting context; implementation guidance should come from repo-local docs.
- Ambiguous project classification should be marked rather than guessed.
