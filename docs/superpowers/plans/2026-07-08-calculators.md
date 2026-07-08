# BASidekick App — Calculators vertical (plan)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use `- [ ]`.

**Goal:** Port the ~35 BAS engineering calculators into `~/Projects/basidekick-app`, redesigned for the app shell and re-architected as a **data-driven, unit-tested registry** (each calculator = a typed config with a pure `compute` function). Fully client-side, no backend, no auth — buildable and verifiable end-to-end locally.

**Why re-architect (not copy):** the old `~/Projects/basidekick-site/components/views/calculators-view.tsx` is one 1543-line client component with 35 inline `useState`+IIFE calc blocks and legacy `.title-block`/`.field` CSS. The redesign extracts the math into pure functions (formulas are exactly where a wrong constant is a silent bug → **test them**), renders every calculator through shared restyled UI, and adds instant client-side search over all calculators.

**Source of truth:** the old file above IS the spec for every formula, input, label, unit, select preset, and note. Porting subagents READ IT IN FULL and reproduce the math EXACTLY (same constants, same rounding, same output strings). Do not "improve" formulas.

**Stack:** React 19 client components, `motion/react` (existing `lib/motion.ts`), app design tokens, vitest. No new deps (phosphor already present; no math/KaTeX libs needed).

## Architecture

```
lib/calculators/
  types.ts            # CalcInput union, CalcOutputRow, CalculatorDef, CalcSection
  psychrometrics.ts   # STANDARD_ATMOSPHERE_PSI, saturationVaporPressurePsi,
                      # getHumidityRatio, getMoistAirEnthalpy, hasInvalidNumbers, thermistorPresets, wireGaugeTable
  psychrometrics.test.ts
  sections/
    01-sensor-signal.ts        (+ .test.ts)
    02-airside.ts              (+ .test.ts)
    03-network.ts              (+ .test.ts)
    04-hydronic.ts             (+ .test.ts)
    05-electrical.ts           (+ .test.ts)
    06-psychrometrics.ts       (+ .test.ts)
    07-scheduling.ts           (+ .test.ts)
    08-commissioning.ts        (+ .test.ts)
    09-energy.ts               (+ .test.ts)
    10-controls.ts             (+ .test.ts)
    11-conversions.ts          (+ .test.ts)
  index.ts            # SECTIONS: CalcSection[] (ordered 01..11); ALL_CALCULATORS flat list
components/calculators/
  calculator-card.tsx     # renders one CalculatorDef: inputs (local state) → live outputs + note
  calculator-section.tsx  # collapsible accordion (spring), defaultOpen for 01
  calc-fields.tsx         # NumberField, SelectField, TextField, OutputRow primitives
  calculators-explorer.tsx# client page body: search/filter + sections
app/calculators/page.tsx  # server page: header + <CalculatorsExplorer/> + optional JSON-LD
```

### Types (Task 1 defines these exactly; later tasks conform)
```ts
export type NumberInput = { key: string; kind: "number"; label: string; unit?: string; default?: string; step?: string };
export type SelectInput = { key: string; kind: "select"; label: string; options: { value: string; label: string }[]; default: string };
export type TextInput   = { key: string; kind: "text"; label: string; placeholder?: string; default?: string };
export type CalcInput   = NumberInput | SelectInput | TextInput;

export type CalcOutputRow = { label: string; value: string; unit?: string };

/** compute receives RAW string values keyed by input.key; parses internally;
 *  returns output rows. On invalid/blank input, return rows with value "—". */
export type CalculatorDef = {
  id: string;            // stable slug (matches old anchors where they exist, e.g. "btu-from-flow-calculator")
  title: string;
  note?: string;
  inputs: CalcInput[];
  compute: (v: Record<string, string>) => CalcOutputRow[];
};

export type CalcSection = { num: string; title: string; calculators: CalculatorDef[] };
```

### Design language (binding)
Same dense app-shell vocabulary as News/Wiki/Atlas. Card = `rounded-lg border border-line bg-panel p-5`; card title mono uppercase micro-label (`font-mono text-[11px] uppercase tracking-[0.14em] text-fg-3`); inputs are compact bordered fields (`h-9`, label in `text-[13px] text-fg-2`, unit suffix chip mono); outputs in a `bg-sand-2 rounded-md` block, value `text-[15px] font-medium text-fg` (mono for numbers) + unit; note italic `text-[12px] text-fg-3`. Section accordion header: mono `NN` index + title, caret; punch accent only. Page header eyebrow `BASIDEKICK · TOOLS`, title "Calculators", one-line description.

### Motion/interaction (the redesign's point)
- Section accordion open/close = `spring.gentle` height/opacity; caret rotates.
- Output value: on change, a brief punch-tinted highlight (opacity/bg fade over `dur.base`) so live recalculation is felt. Reduced-motion (shell `MotionConfig reducedMotion="user"`) strips transforms automatically — keep output legible with no motion.
- Explorer search: instant client-side filter over calculator title + section title; empty-query shows all; matches auto-expand their section; zero matches → designed empty state ("No calculator matches …").
- Deep links: each card `id={def.id}` with `scroll-mt-20` so `/calculators#btu-from-flow-calculator` works.

## Tasks

### Task 1: Registry types + psychrometric helpers (TDD)
**Files:** `lib/calculators/types.ts`, `lib/calculators/psychrometrics.ts`, `lib/calculators/psychrometrics.test.ts`
- Port `types.ts` exactly as specified above.
- Port helpers VERBATIM from old file lines 136–172: `STANDARD_ATMOSPHERE_PSI`, `thermistorPresets`, `wireGaugeTable`, `hasInvalidNumbers`, `saturationVaporPressurePsi`, `getHumidityRatio`, `getMoistAirEnthalpy` (same constants: 77.345, 0.0057, 7235, 8.2, 0.62198, 0.24, 1061, 0.444). Export all.
- TDD: write `psychrometrics.test.ts` first — assert `saturationVaporPressurePsi(70)`, `getHumidityRatio(75, 50)`, `getMoistAirEnthalpy(75, 50)` against values computed from the exact formulas (compute expected numbers yourself to ~4 sig figs and `toBeCloseTo`); assert `getHumidityRatio` returns NaN when vapor pressure ≥ ambient; `hasInvalidNumbers([NaN])` true, `([1,2])` false. Run → fail → implement → pass.
- Verify tsc/lint/test green. Commit `feat: calculator registry types + tested psychrometric helpers`.

### Task 2: Calculator UI engine (card, section, fields) + 2 sample defs
**Files:** `components/calculators/calc-fields.tsx`, `calculator-card.tsx`, `calculator-section.tsx`; a throwaway sample wiring on `app/calculators/page.tsx` (reverted before commit) OR a tiny temporary sample section to visually verify.
- `calc-fields.tsx`: `NumberField`, `SelectField`, `TextField` (controlled, string value, onChange), `OutputRow` (label/value/unit, "—" when blank, punch-highlight on value change via motion — respect reduced motion). Restyled to tokens.
- `calculator-card.tsx` (`"use client"`): takes `def: CalculatorDef`; holds `values` state seeded from each input's `default ?? ""`; renders inputs; computes `def.compute(values)` each render; renders output rows + note; `id={def.id}` + `scroll-mt-20`.
- `calculator-section.tsx` (`"use client"`): `{ section: CalcSection; defaultOpen?: boolean; forceOpen?: boolean }` accordion with spring; grid of cards (`sm:grid-cols-2`).
- Verify in browser (preview tools, port via shared launch config): render 2 real sample calculators (e.g. Analog Input Scaling + Mixed Air Temp — port their defs inline temporarily), confirm live recompute + accordion + highlight; then remove the temporary page wiring so the commit contains only the components. tsc/lint/test/build green. Commit `feat: calculator card/section/field UI engine`.

### Tasks 3–5: Calculator definitions (port math, TDD the non-trivial ones)
Each task: read the ENTIRE old `components/views/calculators-view.tsx`, port the assigned sections into `lib/calculators/sections/NN-*.ts` as `CalcSection` objects with pure `compute` fns matching the old IIFE logic EXACTLY (inputs, labels, units, selects/presets, notes, rounding, composite output strings). Write `NN-*.test.ts` covering at least the non-trivial formulas per section (2–4 assertions each, expected values derived from the old formula; use `toBeCloseTo` for floats). Blank/invalid inputs → outputs `"—"` (mirror old guard behavior via `hasInvalidNumbers`).

- [ ] **Task 3:** sections 01 Sensor & signal scaling (old JSX ~1003), 02 Airside (~1048), 03 Network & integration (~1098), 04 Hydronic (~1138). Note: IP Subnet (03) and Pump Head/Hazen-Williams (04) and Expansion Tank (04) are the fiddly ones — test them. Commit `feat: calculators — sensor, airside, network, hydronic (tested)`.
- [ ] **Task 4:** 05 Electrical & power (~1193), 06 Psychrometrics (~1236, reuse helpers), 07 Scheduling & time (~1276), 08 Commissioning (~1365). Test: 24VAC wire-gauge selection, wet-bulb, holiday nth-weekday date, duct static fan-law. Commit `feat: calculators — electrical, psychrometrics, scheduling, commissioning (tested)`.
- [ ] **Task 5:** 09 Energy & equipment (~1398), 10 Controls math (~1433), 11 Unit conversions (~1461). Test: VFD cube-law savings, PID Ziegler-Nichols, OAT reset interpolation, each conversion round-trips. Commit `feat: calculators — energy, controls, conversions (tested)`.

Each task ends tsc/lint/test/build green (test count grows).

### Task 6: index + explorer + page + polish + verification
**Files:** `lib/calculators/index.ts`, `components/calculators/calculators-explorer.tsx`, `app/calculators/page.tsx`
- `index.ts`: `SECTIONS: CalcSection[]` in order 01–11 (import each section); `ALL_CALCULATORS` flat.
- `calculators-explorer.tsx` (`"use client"`): search input (instant filter over calc title + section title; empty → all), renders `CalculatorSection` per section with matches (section 01 defaultOpen; any section with active-search matches forceOpen); zero matches → designed empty state; result count micro-label.
- `app/calculators/page.tsx`: server component, `export const metadata = { title: "Calculators", description: "…" }`, header (eyebrow/title/desc) + `<CalculatorsExplorer/>`. Optional lightweight CollectionPage JSON-LD via a ported `escapeJsonLd` (only if trivial; else skip).
- Full verification: tsc/lint/test/build green; dev server (preview tools) — `/calculators` 200; all 11 sections present; type into a calc → live output; search "btu" filters + expands; a deep link `#btu-from-flow-calculator` scrolls; reduced-motion pass; zero console errors; screenshot for record. Commit `feat: calculators explorer + page (search, all sections)`.

## Out of scope
- References section (separate follow-on; also static).
- Any per-calculator route (single page + anchors, matching old).
- KaTeX/formula typesetting (old showed formulas as plain notes; keep that).
- Saved/pinned calculations, history (old had none).
