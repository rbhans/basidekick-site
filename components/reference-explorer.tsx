"use client";

import { ArrowSquareOut, CaretDown, MagnifyingGlass } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui";
import { REFERENCE_SECTIONS } from "@/lib/references/data";

export function ReferenceExplorer() {
  const [query, setQuery] = useState("");
  const value = query.trim().toLowerCase();
  const sections = useMemo(() => REFERENCE_SECTIONS.filter((section) => !value || JSON.stringify(section).toLowerCase().includes(value)), [value]);
  return (
    <>
      <PageHeader eyebrow="TOOLS / REFERENCES" title="References" description="Quick protocol, signals, network, psychrometric, and field reference sheets—with sources attached." />
      <div className="explorer-toolbar"><label className="field-search"><MagnifyingGlass size={16} /><input aria-label="Filter references" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter references…" /></label><span>{sections.length} sections</span></div>
      <div className="reference-sections">{sections.map((section, index) => <details key={section.num} open={Boolean(value) || index === 0} id={section.title.toLowerCase().replaceAll(" ", "-")}><summary><span>{section.num}</span><strong>{section.title}</strong><CaretDown size={15} /></summary><div className="reference-body">{section.blocks.map((block, blockIndex) => block.kind === "table" ? <div className="table-wrap" key={blockIndex}>{block.title && <h3>{block.title}</h3>}<table><thead><tr>{block.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody></table></div> : <div className="abbr-list" key={blockIndex}>{block.items.map((item) => <div key={item.abbr}><b>{item.abbr}</b><span><strong>{item.full}</strong>{item.description && <small>{item.description}</small>}</span></div>)}</div>)}{section.note && <p className="reference-note">{section.note}</p>}{section.sources && <div className="reference-sources"><span>Sources</span>{section.sources.map((source) => <a href={source.href} target="_blank" rel="noreferrer" key={source.href}>{source.label}<ArrowSquareOut size={12} /></a>)}</div>}</div></details>)}</div>
    </>
  );
}
