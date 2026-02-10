import type { BabelData, BabelPointEntry } from "@/lib/types";
import type { CleanerRow } from "./types";

/**
 * Export cleaner results as a CSV file download.
 */
export function exportResultsCsv(results: CleanerRow[], data: BabelData): void {
  const pointMap = new Map<string, BabelPointEntry>();
  for (const point of data.points) {
    pointMap.set(point.concept.id, point);
  }

  const headers = [
    "Original Name",
    "Matched Name",
    "Matched ID",
    "Confidence",
    "Equipment Prefix",
    "Point Function",
    "Haystack",
    "Brick",
  ];

  const rows = results.map((row) => {
    const matchId = row.userOverride?.pointId ?? row.bestMatch?.pointId ?? "";
    const matchName = row.userOverride?.pointName ?? row.bestMatch?.pointName ?? "UNMATCHED";
    const point = matchId ? pointMap.get(matchId) : null;

    return [
      csvEscape(row.originalName),
      csvEscape(matchName),
      csvEscape(matchId),
      row.userOverride ? "manual" : (row.bestMatch?.confidence ?? "none"),
      csvEscape(row.strippedPrefix ?? ""),
      csvEscape(point?.concept.point_function ?? ""),
      csvEscape(point?.concept.haystack ?? ""),
      csvEscape(point?.concept.brick ?? ""),
    ].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "cleaned-point-names.csv";
  a.click();

  URL.revokeObjectURL(url);
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
