"use client";

import Link from "next/link";
import { ArrowSquareOut, MagnifyingGlass, Plus } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { useAuth } from "@/components/providers";
import { PageHeader, Pill } from "@/components/ui";
import { curatedCommunityShareEntries } from "@/lib/data/community-share";
import type { CommunityShareEntry } from "@/lib/data/community-share";

export function LibraryExplorer({ initialEntries = curatedCommunityShareEntries }: { initialEntries?: CommunityShareEntry[] }) {
  const auth = useAuth();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("All");
  const [access, setAccess] = useState("All access");
  const kinds = ["All", ...Array.from(new Set(initialEntries.map((entry) => entry.kind)))];
  const entries = useMemo(() => {
    const value = query.trim().toLowerCase();
    return initialEntries.filter((entry) => (kind === "All" || entry.kind === kind) && (access === "All access" || (access === "Free" ? entry.access === "Open source" || entry.access === "File" : entry.access === "Project site")) && (!value || JSON.stringify(entry).toLowerCase().includes(value)));
  }, [access, initialEntries, kind, query]);
  return (
    <>
      <PageHeader eyebrow="TOOLS / LIBRARY" title="Library" description="Apps, software, modules, scripts, templates, guides, PDFs, and external resources useful to BAS work." actions={<button className="button primary" type="button" onClick={() => auth.user ? location.assign("/library/submit") : auth.requestSignIn("submit a Library entry")}><Plus size={15} /> Submit</button>} />
      <div className="library-notice"><strong>Useful first.</strong><span>Free and paid resources can be listed. Paid items link to the creator—BASidekick does not process the transaction.</span></div>
      <div className="explorer-toolbar wrap"><label className="field-search"><MagnifyingGlass size={16} /><input aria-label="Filter Library entries" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter this directory…" /></label><select aria-label="Filter Library by type" value={kind} onChange={(event) => setKind(event.target.value)}>{kinds.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Filter Library by access" value={access} onChange={(event) => setAccess(event.target.value)}><option>All access</option><option>Free</option><option>Paid externally</option></select><span>{entries.length} entries</span></div>
      <div className="library-list">{entries.map((entry) => <article key={entry.id}><div className="library-icon">{entry.title.slice(0, 2).toUpperCase()}</div><div className="library-main"><span><Pill tone={entry.stage === "Active" ? "success" : "neutral"}>{entry.stage}</Pill><Pill>{entry.kind}</Pill><Pill tone={entry.access === "Open source" ? "accent" : "neutral"}>{entry.access === "Project site" ? "External" : entry.access}</Pill></span><Link href={`/library/${entry.id}`}>{entry.title}</Link><p>{entry.summary}</p><small>{entry.owner} · {entry.protocol} · {entry.language}</small></div><div className="library-end"><span>{entry.tags.slice(0, 3).join(" · ")}</span>{entry.links[0] && <a href={entry.links[0].href} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>{entry.links[0].label}<ArrowSquareOut size={13} /></a>}</div></article>)}</div>
    </>
  );
}
