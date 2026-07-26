"use client";

import { CaretDown, MagnifyingGlass } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui";
import { SECTIONS } from "@/lib/calculators";
import type { CalcInput, CalculatorDef } from "@/lib/calculators/types";

export function CalculatorExplorer() {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const sections = useMemo(() => SECTIONS.map((section) => ({ ...section, calculators: section.calculators.filter((calculator) => !normalized || `${section.title} ${calculator.title}`.toLowerCase().includes(normalized)) })).filter((section) => section.calculators.length), [normalized]);
  const count = sections.reduce((sum, section) => sum + section.calculators.length, 0);

  return (
    <>
      <PageHeader eyebrow="TOOLS / CALCULATORS" title="Calculators" description="Live engineering math for controls work, field checks, commissioning, and quick design validation." />
      <div className="explorer-toolbar"><label className="field-search"><MagnifyingGlass size={16} /><input aria-label="Filter calculators" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter calculators…" /></label><span>{count} calculators · {sections.length} sections</span></div>
      <div className="calculator-sections">{sections.map((section, index) => <CalculatorSectionView key={section.num} section={section} defaultOpen={Boolean(normalized) || index === 0} />)}</div>
      {sections.length === 0 && <div className="empty-state"><span className="eyebrow">NO MATCH</span><p>No calculator matches “{query}”.</p></div>}
    </>
  );
}

function CalculatorSectionView({ section, defaultOpen }: { section: (typeof SECTIONS)[number]; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="calculator-section">
      <button className="calculator-section-head" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}><span>{section.num}</span><strong>{section.title}</strong><em>{section.calculators.length}</em><CaretDown size={15} className={open ? "open" : ""} /></button>
      {open && <div className="calculator-grid">{section.calculators.map((calculator) => <CalculatorCard key={calculator.id} calculator={calculator} />)}</div>}
    </section>
  );
}

function defaults(inputs: CalcInput[]) {
  return Object.fromEntries(inputs.map((input) => [input.key, input.default ?? ""]));
}

function CalculatorCard({ calculator }: { calculator: CalculatorDef }) {
  const [values, setValues] = useState<Record<string, string>>(() => defaults(calculator.inputs));
  const output = calculator.compute(values);
  return (
    <article className="calculator-card" id={calculator.id}>
      <h3>{calculator.title}</h3>
      <div className="calc-inputs">{calculator.inputs.map((input) => <CalcField key={input.key} input={input} value={values[input.key] ?? ""} onChange={(value) => setValues((current) => ({ ...current, [input.key]: value }))} />)}</div>
      <div className="calc-output" aria-live="polite">{output.map((row) => <div key={`${row.label}-${row.value}-${row.unit ?? ""}`}><span>{row.label}</span><strong>{row.value}</strong>{row.unit && <em>{row.unit}</em>}</div>)}</div>
      {calculator.note && <p className="calc-note">{calculator.note}</p>}
    </article>
  );
}

function CalcField({ input, value, onChange }: { input: CalcInput; value: string; onChange: (value: string) => void }) {
  return <label><span>{input.label}{"unit" in input && input.unit ? <em>{input.unit}</em> : null}</span>{input.kind === "select" ? <select value={value} onChange={(event) => onChange(event.target.value)}>{input.options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select> : <input type={input.kind === "number" ? "number" : "text"} step={input.kind === "number" ? input.step : undefined} placeholder={input.kind === "text" ? input.placeholder : undefined} value={value} onChange={(event) => onChange(event.target.value)} />}</label>;
}
