"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, UploadSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { WorkExperience, CreateWorkExperienceInput } from "@/lib/types";
import { parseLinkedInCsv } from "@/lib/linkedin-csv";
import * as api from "../pointstack-api";

interface Candidate {
  input: CreateWorkExperienceInput;
  dupe: boolean;
}

interface LinkedInImportProps {
  existing: WorkExperience[];
  onImported: () => void;
  onCancel: () => void;
}

function dedupeKey(kind: string, title: string, organization: string, startDate: string): string {
  return `${kind}|${title.trim().toLowerCase()}|${organization.trim().toLowerCase()}|${startDate.slice(0, 4)}`;
}

function yearRange(input: CreateWorkExperienceInput): string {
  const start = input.start_date.slice(0, 4);
  const end = input.is_current ? "Now" : input.end_date?.slice(0, 4) ?? "—";
  return `${start} — ${end}`;
}

export function LinkedInImport({ existing, onImported, onCancel }: LinkedInImportProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [skipped, setSkipped] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [parsed, setParsed] = useState(false);

  const existingKeys = useMemo(
    () => new Set(existing.map((e) => dedupeKey(e.kind, e.title, e.organization, e.start_date))),
    [existing]
  );

  const selectedCount = selected.filter(Boolean).length;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    const all: Candidate[] = [];
    let skip = 0;
    let recognized = 0;

    for (const file of Array.from(fileList)) {
      let text: string;
      try {
        text = await file.text();
      } catch {
        setError(`Couldn't read "${file.name}".`);
        continue;
      }
      const res = parseLinkedInCsv(text);
      if (res.kind === "unknown") continue;
      recognized++;
      skip += res.skipped;
      for (const input of res.entries) {
        all.push({
          input,
          dupe: existingKeys.has(dedupeKey(input.kind, input.title, input.organization, input.start_date)),
        });
      }
    }

    setParsed(true);
    setSkipped(skip);
    setCandidates(all);
    setSelected(all.map((c) => !c.dupe));

    if (recognized === 0) {
      setError("That doesn't look like a LinkedIn Positions.csv or Education.csv export. Make sure you upload the CSV from your data archive.");
    } else if (all.length === 0) {
      setError("No importable entries were found in that file.");
    }
  };

  const toggle = (i: number) => setSelected((s) => s.map((v, idx) => (idx === i ? !v : v)));
  const setAll = (value: boolean) => setSelected((s) => s.map(() => value));

  const doImport = async () => {
    setImporting(true);
    let ok = 0;
    let fail = 0;
    for (let i = 0; i < candidates.length; i++) {
      if (!selected[i]) continue;
      try {
        await api.createWorkExperience(candidates[i].input);
        ok++;
      } catch (e) {
        console.error("LinkedIn import failed for entry:", candidates[i].input.title, e);
        fail++;
      }
    }
    setImporting(false);
    if (ok > 0) toast.success(`Imported ${ok} ${ok === 1 ? "entry" : "entries"}.`);
    if (fail > 0) toast.error(`${fail} ${fail === 1 ? "entry" : "entries"} couldn't be imported.`);
    if (ok === 0 && fail === 0) toast.message("Nothing selected to import.");
    onImported();
  };

  return (
    <div className="space-y-3 rounded-md border border-border p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Import from LinkedIn</h4>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
      </div>

      <ol className="list-decimal space-y-1 pl-5 text-[12.5px] leading-relaxed text-muted-foreground">
        <li>On LinkedIn: Settings &amp; Privacy → Data privacy → <strong className="font-medium text-foreground">Get a copy of your data</strong>.</li>
        <li>Select <strong className="font-medium text-foreground">Positions</strong> (and <strong className="font-medium text-foreground">Education</strong>), request the archive, and download it when ready.</li>
        <li>Unzip it and upload <code className="font-mono text-[11px]">Positions.csv</code> / <code className="font-mono text-[11px]">Education.csv</code> below.</li>
      </ol>

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-input bg-card px-4 py-6 text-[13px] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
        <UploadSimple className="h-4 w-4" />
        Choose CSV file(s)
        <input
          type="file"
          accept=".csv,text/csv"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {error && <p className="text-[12.5px] text-destructive">{error}</p>}

      {candidates.length > 0 && (
        <>
          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            <span>
              <strong className="font-semibold text-foreground tabular-nums">{selectedCount}</strong> of {candidates.length} selected
              {skipped > 0 && ` · ${skipped} skipped`}
            </span>
            <span className="flex gap-3">
              <button type="button" className="hover:text-foreground" onClick={() => setAll(true)}>
                All
              </button>
              <button type="button" className="hover:text-foreground" onClick={() => setAll(false)}>
                None
              </button>
            </span>
          </div>

          <ul className="max-h-64 divide-y divide-border overflow-y-auto rounded-md border border-border">
            {candidates.map((c, i) => (
              <li key={i}>
                <label className="flex cursor-pointer items-start gap-3 px-3 py-2.5">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 shrink-0"
                    checked={selected[i] ?? false}
                    onChange={() => toggle(i)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-[14px] font-medium text-foreground">{c.input.title}</span>
                      <span className="shrink-0 rounded-[3px] border border-input px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                        {c.input.kind === "education" ? "Education" : "Work"}
                      </span>
                      {c.dupe && (
                        <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-accent">
                          Already added
                        </span>
                      )}
                    </span>
                    <span className="block truncate font-mono text-[11px] text-muted-foreground">
                      {c.input.organization} · {yearRange(c.input)}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </>
      )}

      {parsed && (
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={doImport} disabled={importing || selectedCount === 0}>
            {importing
              ? "Importing…"
              : `Import ${selectedCount > 0 ? selectedCount : ""} ${selectedCount === 1 ? "entry" : "entries"}`.trim()}
          </Button>
        </div>
      )}
    </div>
  );
}
