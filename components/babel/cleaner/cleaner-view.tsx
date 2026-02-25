"use client";

import { useReducer, useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowCounterClockwise } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteBadge } from "@/components/site-badge";
import { useBabelAll } from "@/components/babel/use-babel-data";
import { matchAllPoints } from "@/lib/babel-cleaner";
import { abbreviationData } from "@/lib/babel-cleaner/abbreviation-data";
import { ROUTES } from "@/lib/routes";
import { FileUploadStep } from "./file-upload-step";
import { ColumnSelectStep } from "./column-select-step";
import { ResultsTable } from "./results-table";
import { CleanerSummary } from "./cleaner-summary";
import { createClient } from "@/lib/supabase/client";
import type { CleanerState, CleanerAction, ParsedFile } from "@/lib/babel-cleaner/types";
import Link from "next/link";

const initialState: CleanerState = {
  step: "upload",
  parsedFile: null,
  selectedColumn: null,
  results: [],
  isMatching: false,
  matchProgress: 0,
  contributionsSubmitted: false,
};

function reducer(state: CleanerState, action: CleanerAction): CleanerState {
  switch (action.type) {
    case "SET_FILE":
      return { ...state, step: "column-select", parsedFile: action.payload };
    case "SET_COLUMN":
      return { ...state, selectedColumn: action.payload };
    case "SET_RESULTS":
      return { ...state, step: "results", results: action.payload, isMatching: false };
    case "SET_MATCHING":
      return { ...state, isMatching: action.payload };
    case "SET_MATCH_PROGRESS":
      return { ...state, matchProgress: action.payload };
    case "UPDATE_ROW_MATCH":
      return {
        ...state,
        contributionsSubmitted: false,
        results: state.results.map((row) =>
          row.rowIndex === action.payload.rowIndex
            ? {
                ...row,
                userOverride: { pointId: action.payload.pointId, pointName: action.payload.pointName },
                flaggedAsNew: false,
              }
            : row,
        ),
      };
    case "FLAG_ROW_NEW":
      return {
        ...state,
        contributionsSubmitted: false,
        results: state.results.map((row) =>
          row.rowIndex === action.payload.rowIndex
            ? { ...row, flaggedAsNew: true, userOverride: null }
            : row,
        ),
      };
    case "UNFLAG_ROW_NEW":
      return {
        ...state,
        results: state.results.map((row) =>
          row.rowIndex === action.payload.rowIndex
            ? { ...row, flaggedAsNew: false }
            : row,
        ),
      };
    case "MARK_CONTRIBUTIONS_SUBMITTED":
      return { ...state, contributionsSubmitted: true };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export function CleanerView() {
  const { data, loading: dataLoading, error: dataError } = useBabelAll();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth status
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      if (!supabase) return;

      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    }
    checkAuth();
  }, []);

  const handleFileReady = useCallback((parsed: ParsedFile) => {
    dispatch({ type: "SET_FILE", payload: parsed });
  }, []);

  const handleColumnSelected = useCallback(
    async (columnIndex: number) => {
      if (!data || !state.parsedFile) return;

      dispatch({ type: "SET_COLUMN", payload: columnIndex });
      dispatch({ type: "SET_MATCHING", payload: true });

      // Extract point names from the selected column
      const pointNames = state.parsedFile.rows
        .map((row) => row[columnIndex] || "")
        .filter((name) => name.trim().length > 0);

      // Deduplicate for matching, then map back
      const uniqueNames = [...new Set(pointNames)];

      const results = await matchAllPoints(
        uniqueNames,
        data,
        abbreviationData,
        (progress) => dispatch({ type: "SET_MATCH_PROGRESS", payload: progress }),
      );

      // Map results back to include duplicates with correct row indices
      const resultMap = new Map(results.map((r) => [r.originalName, r]));
      const fullResults = pointNames.map((name, idx) => {
        const match = resultMap.get(name);
        if (match) {
          return { ...match, rowIndex: idx };
        }
        return {
          rowIndex: idx,
          originalName: name,
          normalizedName: name.toLowerCase(),
          strippedPrefix: null,
          bestMatch: null,
          alternateMatches: [],
          userOverride: null,
          flaggedAsNew: false,
        };
      });

      dispatch({ type: "SET_RESULTS", payload: fullResults });
    },
    [data, state.parsedFile],
  );

  const handleBack = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  if (dataError) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load Atlas data</p>
          <p className="text-sm text-muted-foreground mt-1">{dataError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.15} colorGradient />
        <div className="container mx-auto px-4 relative z-10">
          <SectionLabel variant="resources">resources</SectionLabel>

          <div className="mt-6 flex items-center gap-3">
            <Link
              href={ROUTES.ATLAS}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              BAS Atlas
            </Link>
          </div>

          <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
            Point Name Cleaner
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Upload a file with BAS point names and match them against Atlas terms.
            Correct any mismatches to help grow the database with new aliases.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {dataLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : state.step === "upload" ? (
            <FileUploadStep onFileReady={handleFileReady} />
          ) : state.step === "column-select" && state.parsedFile ? (
            <ColumnSelectStep
              parsedFile={state.parsedFile}
              onColumnSelected={handleColumnSelected}
              onBack={handleBack}
            />
          ) : state.step === "results" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Results</h2>
                  <p className="text-sm text-muted-foreground">
                    {state.results.length} point names processed from {state.parsedFile?.fileName}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleBack}>
                  <ArrowCounterClockwise className="size-4 mr-1.5" />
                  Start Over
                </Button>
              </div>

              {data && (
                <CleanerSummary
                  results={state.results}
                  data={data}
                  isAuthenticated={isAuthenticated}
                  contributionsSubmitted={state.contributionsSubmitted}
                  onContributionsSubmitted={() =>
                    dispatch({ type: "MARK_CONTRIBUTIONS_SUBMITTED" })
                  }
                />
              )}

              {data && (
                <ResultsTable
                  results={state.results}
                  data={data}
                  onUpdateMatch={(rowIndex, pointId, pointName) =>
                    dispatch({
                      type: "UPDATE_ROW_MATCH",
                      payload: { rowIndex, pointId, pointName },
                    })
                  }
                  onFlagNew={(rowIndex) =>
                    dispatch({ type: "FLAG_ROW_NEW", payload: { rowIndex } })
                  }
                  onUnflagNew={(rowIndex) =>
                    dispatch({ type: "UNFLAG_ROW_NEW", payload: { rowIndex } })
                  }
                />
              )}
            </div>
          ) : state.isMatching ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${state.matchProgress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Matching point names... {Math.round(state.matchProgress)}%
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
