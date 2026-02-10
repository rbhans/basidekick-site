export interface MatchCandidate {
  pointId: string;
  pointName: string;
  score: number;
  confidence: "high" | "medium" | "low" | "none";
  matchedVia: string;
}

export interface CleanerRow {
  rowIndex: number;
  originalName: string;
  normalizedName: string;
  strippedPrefix: string | null;
  bestMatch: MatchCandidate | null;
  alternateMatches: MatchCandidate[];
  userOverride: { pointId: string; pointName: string } | null;
  flaggedAsNew: boolean;
}

export interface ParsedFile {
  headers: string[];
  rows: string[][];
  fileName: string;
}

export type CleanerStep = "upload" | "column-select" | "results";

export interface CleanerState {
  step: CleanerStep;
  parsedFile: ParsedFile | null;
  selectedColumn: number | null;
  results: CleanerRow[];
  isMatching: boolean;
  matchProgress: number;
  contributionsSubmitted: boolean;
}

export type CleanerAction =
  | { type: "SET_FILE"; payload: ParsedFile }
  | { type: "SET_COLUMN"; payload: number }
  | { type: "SET_RESULTS"; payload: CleanerRow[] }
  | { type: "SET_MATCHING"; payload: boolean }
  | { type: "SET_MATCH_PROGRESS"; payload: number }
  | { type: "UPDATE_ROW_MATCH"; payload: { rowIndex: number; pointId: string; pointName: string } }
  | { type: "FLAG_ROW_NEW"; payload: { rowIndex: number } }
  | { type: "UNFLAG_ROW_NEW"; payload: { rowIndex: number } }
  | { type: "MARK_CONTRIBUTIONS_SUBMITTED" }
  | { type: "RESET" };

export interface AbbreviationsData {
  version: string;
  abbreviations: Record<string, string[]>;
  verboseExpansions: Record<string, string[]>;
}
