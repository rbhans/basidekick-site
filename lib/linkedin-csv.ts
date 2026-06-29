import type { CreateWorkExperienceInput } from "@/lib/types";

/**
 * Parsers for the CSV files in a LinkedIn data export
 * ("Get a copy of your data" → Positions.csv / Education.csv).
 * Pure functions — no DOM, no network — so they can be unit-checked in Node.
 */

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

/** Normalize a LinkedIn date cell to an ISO "YYYY-MM-01" string, or null. */
export function parseLinkedInDate(raw: string): string | null {
  const s = (raw || "").trim();
  if (!s) return null;

  // Pure year: "2019"
  let m = /^(\d{4})$/.exec(s);
  if (m) return `${m[1]}-01-01`;

  // Month name + year: "May 2019", "Sept. 2019", "September 2019"
  m = /([A-Za-z]{3,})\.?\s+(\d{4})/.exec(s);
  if (m) {
    const mon = MONTHS[m[1].slice(0, 3).toLowerCase()];
    if (mon) return `${m[2]}-${String(mon).padStart(2, "0")}-01`;
  }

  // ISO: "2019-05" / "2019-05-21"
  m = /^(\d{4})-(\d{1,2})/.exec(s);
  if (m) return `${m[1]}-${String(Math.min(12, Math.max(1, Number(m[2])))).padStart(2, "0")}-01`;

  // Numeric month/year: "5/2019" or "05/2019"
  m = /^(\d{1,2})\/(\d{4})$/.exec(s);
  if (m) return `${m[2]}-${String(Math.min(12, Math.max(1, Number(m[1])))).padStart(2, "0")}-01`;

  // US date: "5/21/2019"
  m = /^(\d{1,2})\/\d{1,2}\/(\d{4})$/.exec(s);
  if (m) return `${m[2]}-${String(Math.min(12, Math.max(1, Number(m[1])))).padStart(2, "0")}-01`;

  // Fallback: any 4-digit year in the string
  m = /(\d{4})/.exec(s);
  if (m) return `${m[1]}-01-01`;

  return null;
}

/**
 * Minimal RFC-4180 CSV tokenizer. Handles quoted fields, embedded commas /
 * newlines, and "" escaped quotes. Strips a leading UTF-8 BOM.
 */
export function parseCsv(input: string): string[][] {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  let i = 0;
  const n = text.length;

  while (i < n) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\r") {
      i++;
      continue;
    }
    if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += c;
    i++;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export type LinkedInCsvKind = "positions" | "education" | "unknown";

export interface LinkedInImportResult {
  kind: LinkedInCsvKind;
  entries: CreateWorkExperienceInput[];
  /** Rows that were dropped because they lacked the required fields. */
  skipped: number;
}

function makeGetter(headers: string[]) {
  const map = new Map<string, number>();
  headers.forEach((h, i) => map.set(h.trim().toLowerCase(), i));
  return (names: string[]): number => {
    for (const nm of names) {
      const idx = map.get(nm);
      if (idx !== undefined) return idx;
    }
    return -1;
  };
}

/**
 * Parse a single LinkedIn export CSV (Positions or Education) into
 * work_experience candidates. Columns are matched by header name (not order),
 * case-insensitively, and tolerate minor naming variants.
 */
export function parseLinkedInCsv(text: string): LinkedInImportResult {
  const rows = parseCsv(text);
  if (rows.length < 2) return { kind: "unknown", entries: [], skipped: 0 };

  const headers = rows[0];
  const lower = headers.map((h) => h.trim().toLowerCase());
  const get = makeGetter(headers);

  const isPositions = lower.includes("company name") || (lower.includes("title") && lower.includes("started on"));
  const isEducation = lower.includes("school name");
  const kind: LinkedInCsvKind = isPositions ? "positions" : isEducation ? "education" : "unknown";
  if (kind === "unknown") return { kind, entries: [], skipped: 0 };

  const cell = (row: string[], idx: number) => (idx >= 0 && idx < row.length ? row[idx].trim() : "");

  const entries: CreateWorkExperienceInput[] = [];
  let skipped = 0;

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.every((v) => v.trim() === "")) continue;

    if (kind === "positions") {
      const title = cell(row, get(["title"]));
      const organization = cell(row, get(["company name", "company"]));
      const start = parseLinkedInDate(cell(row, get(["started on", "start date"])));
      if (!title || !organization || !start) {
        skipped++;
        continue;
      }
      const finishedRaw = cell(row, get(["finished on", "end date"]));
      entries.push({
        kind: "work",
        title,
        organization,
        organization_url: null,
        location: cell(row, get(["location"])) || null,
        start_date: start,
        end_date: finishedRaw ? parseLinkedInDate(finishedRaw) : null,
        is_current: !finishedRaw,
        description: cell(row, get(["description"])) || null,
        tags: [],
      });
    } else {
      const organization = cell(row, get(["school name", "school"]));
      if (!organization) {
        skipped++;
        continue;
      }
      const startRaw = cell(row, get(["start date", "started on"]));
      const endRaw = cell(row, get(["end date", "finished on"]));
      const start = parseLinkedInDate(startRaw);
      const end = parseLinkedInDate(endRaw);
      const startFinal = start || end;
      if (!startFinal) {
        skipped++;
        continue;
      }
      const degree = cell(row, get(["degree name", "degree"]));
      const field = cell(row, get(["field of study", "field of studies", "field"]));
      const notes = cell(row, get(["notes"]));
      const activities = cell(row, get(["activities", "activities and societies"]));
      entries.push({
        kind: "education",
        title: degree || field || "Studies",
        organization,
        organization_url: null,
        location: null,
        start_date: startFinal,
        end_date: endRaw ? end : null,
        is_current: !endRaw && !start ? false : !endRaw,
        description: [notes, activities].filter(Boolean).join(" — ") || null,
        tags: [],
      });
    }
  }

  return { kind, entries, skipped };
}
