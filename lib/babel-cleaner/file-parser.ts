import type { ParsedFile } from "./types";

// BAS-related keywords for column auto-detection
const BAS_KEYWORDS = [
  "temp", "temperature", "sat", "rat", "oat", "mat", "dat",
  "setpoint", "sp", "cmd", "command", "status", "sts",
  "fan", "pump", "valve", "vlv", "damper", "dmp",
  "alarm", "alm", "pressure", "flow", "humidity",
  "ahu", "vav", "fcu", "rtu", "chw", "hw",
  "supply", "return", "exhaust", "discharge",
  "zone", "room", "space", "building",
  "sensor", "output", "feedback", "enable",
  "cooling", "heating", "boiler", "chiller",
];

/**
 * Parse a CSV string into headers and rows.
 * Handles quoted fields with commas and newlines.
 */
function parseCsvString(text: string): { headers: string[]; rows: string[][] } {
  const lines: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        current.push(field.trim());
        field = "";
      } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
        current.push(field.trim());
        if (current.some((f) => f.length > 0)) {
          lines.push(current);
        }
        current = [];
        field = "";
        if (ch === "\r") i++;
      } else {
        field += ch;
      }
    }
  }

  // Last field
  current.push(field.trim());
  if (current.some((f) => f.length > 0)) {
    lines.push(current);
  }

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  return {
    headers: lines[0],
    rows: lines.slice(1),
  };
}

/**
 * Parse a file (CSV or XLSX) into a structured format.
 */
export async function parseFile(file: File): Promise<ParsedFile> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "csv" || ext === "tsv") {
    const text = await file.text();
    const separator = ext === "tsv" ? "\t" : ",";
    const normalizedText = ext === "tsv" ? text.replace(/\t/g, ",") : text;
    const { headers, rows } = parseCsvString(normalizedText);

    return { headers, rows, fileName: file.name };
  }

  if (ext === "xlsx" || ext === "xls") {
    const xlsx = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json<string[]>(sheet, {
      header: 1,
      defval: "",
    });

    if (data.length === 0) {
      return { headers: [], rows: [], fileName: file.name };
    }

    const headers = data[0].map((h) => String(h));
    const rows = data.slice(1).map((row) => row.map((cell) => String(cell)));

    return { headers, rows, fileName: file.name };
  }

  throw new Error(`Unsupported file format: .${ext}. Please use CSV or XLSX files.`);
}

/**
 * Auto-detect which column most likely contains BAS point names.
 * Returns the column index (0-based), or 0 if no good match found.
 */
export function detectPointNameColumn(headers: string[], rows: string[][]): number {
  // First check headers for obvious column names
  const headerKeywords = [
    "point", "name", "pointname", "point_name", "point name",
    "object", "object_name", "objectname",
    "tag", "label", "descriptor", "description",
  ];

  for (let col = 0; col < headers.length; col++) {
    const headerLower = headers[col].toLowerCase().replace(/[\s_-]+/g, "");
    if (headerKeywords.some((kw) => headerLower.includes(kw.replace(/[\s_-]+/g, "")))) {
      return col;
    }
  }

  // Fall back to content analysis: scan first 10 rows for BAS keywords
  const sampleRows = rows.slice(0, 10);
  let bestCol = 0;
  let bestScore = 0;

  for (let col = 0; col < headers.length; col++) {
    let score = 0;

    for (const row of sampleRows) {
      const value = (row[col] || "").toLowerCase();
      if (!value) continue;

      for (const keyword of BAS_KEYWORDS) {
        if (value.includes(keyword)) {
          score++;
          break;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestCol = col;
    }
  }

  return bestCol;
}

/**
 * Validate a file before parsing.
 */
export function validateFile(file: File): string | null {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedExtensions = ["csv", "tsv", "xlsx", "xls"];

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !allowedExtensions.includes(ext)) {
    return `Unsupported file type: .${ext}. Please use CSV, TSV, or XLSX files.`;
  }

  if (file.size > maxSize) {
    return `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB.`;
  }

  if (file.size === 0) {
    return "File is empty.";
  }

  return null;
}
