# Brand Architecture

Last updated: 2026-05-26

This document defines the high-level category system for BASidekick-related, QA Graphics-related, and personal material. It is classification guidance, not a new visual identity for every project.

## Top-Level Families

### BASidekick

**Role:** Solo BAS tools business and independent BAS resource platform.

**Evidence in current repo/vault material:**
- The Obsidian BASidekick index describes BASidekick as the solo BAS tools business and related open-source/application projects.
- The BASidekick design standard describes the platform as a knowledgebase, resourcebase, and social space for the BAS industry.
- `basidekick-site` hosts the BAS Atlas API, user authentication, and Supabase-backed application data.

**Includes when evidenced:**
- BASidekick Site
- BAS Atlas
- PointStack
- Wiki
- News
- Open Source surfaces
- OpenCrate BMS
- rust-bac and rust-mod
- BAS-focused tools, references, and experiments

**Style posture:** Alias Cartography + Field Instrument. Use the working-drawing/reference-atlas language from `docs/brand-guidelines.md`.

### QA Graphics

**Role:** Employer/work context and QA Graphics product family.

**Evidence in current repo/vault material:**
- The Obsidian QA Graphics note identifies QA Graphics as a BAS graphics outsourcing company.
- The same note identifies Foxhound as a Niagara-focused desktop tool and Metassist as a Metasys-focused desktop application.

**Includes when evidenced:**
- QA Graphics
- Foxhound
- Metassist
- Work/employer material tied to QA Graphics

**Style posture:** Practical production-tool clarity. Use Niagara/Metasys and BAS graphics specificity. Do not make QA Graphics material look like a BASidekick subproduct unless the user explicitly asks for that relationship.

### Personal

**Role:** Personal portfolio, experiments, and non-work/non-BASidekick projects.

**Evidence in current repo/vault material:**
- The Obsidian Personal Site note identifies the personal site as a personal portfolio/website.
- The vault keeps personal material separate from BASidekick and QA Graphics work.

**Includes when evidenced:**
- Personal Site
- Personal portfolio material
- Personal experiments when they are not clearly BASidekick or QA Graphics

**Style posture:** Quiet portfolio clarity. Keep it authored and specific, but do not automatically inherit BASidekick's crimson-heavy toolkit identity.

## Classification Rules

- Classify from repo-local docs, Obsidian project notes, or explicit user direction.
- If evidence conflicts, repo-local implementation context wins for implementation; Obsidian is supporting context.
- If a project is ambiguous, write "Needs classification" instead of choosing silently.
- Do not merge similarly named projects without a direct decision. Example: `open-bas-agent`, `openbms`, and `openbms-agent` remain separate until explicitly merged.
- Keep category metadata short and current in project `context/` files and Obsidian notes.

## Site Navigation Implication

The BASidekick public site should still present BASidekick as the umbrella product. QA Graphics and Personal are related context categories, not primary BASidekick navigation items unless a future product decision says otherwise.

Use the category split for:
- Internal planning.
- Source attribution.
- Portfolio/cross-project indexes.
- Agent context and project memory.

Do not use it to:
- Add visible site taxonomy without a product need.
- Blend employer work into BASidekick marketing.
- Rebrand personal experiments as BASidekick products without evidence.
