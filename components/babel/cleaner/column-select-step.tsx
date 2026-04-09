"use client";

import { useState, useMemo } from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { detectPointNameColumn } from "@/lib/babel-cleaner";
import type { ParsedFile } from "@/lib/babel-cleaner";

interface ColumnSelectStepProps {
  parsedFile: ParsedFile;
  onColumnSelected: (columnIndex: number) => void;
  onBack: () => void;
}

export function ColumnSelectStep({
  parsedFile,
  onColumnSelected,
  onBack,
}: ColumnSelectStepProps) {
  const detectedColumn = useMemo(
    () => detectPointNameColumn(parsedFile.headers, parsedFile.rows),
    [parsedFile],
  );

  const [selectedColumn, setSelectedColumn] = useState<number>(detectedColumn);
  const previewRows = parsedFile.rows.slice(0, 5);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Select Point Name Column</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Click the column that contains your point names.
          {parsedFile.rows.length} rows found in <span className="font-medium">{parsedFile.fileName}</span>.
        </p>
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {parsedFile.headers.map((header, col) => (
                <th
                  key={col}
                  onClick={() => setSelectedColumn(col)}
                  className={`
                    px-3 py-2 text-left font-medium cursor-pointer transition-colors whitespace-nowrap
                    ${
                      selectedColumn === col
                        ? "bg-secondary text-primary border-b-2 border-primary"
                        : "hover:bg-muted"
                    }
                  `}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{header || `Column ${col + 1}`}</span>
                    {col === detectedColumn && selectedColumn !== col && (
                      <span className="text-[10px] px-1 py-0.5 rounded bg-muted-foreground/10 text-muted-foreground">
                        suggested
                      </span>
                    )}
                    {selectedColumn === col && (
                      <span className="text-[10px] px-1 py-0.5 rounded bg-secondary text-primary">
                        selected
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b last:border-b-0">
                {parsedFile.headers.map((_, col) => (
                  <td
                    key={col}
                    onClick={() => setSelectedColumn(col)}
                    className={`
                      px-3 py-1.5 cursor-pointer transition-colors whitespace-nowrap max-w-[200px] truncate
                      ${selectedColumn === col ? "bg-muted font-medium" : "hover:bg-muted/50"}
                    `}
                  >
                    {row[col] || ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {parsedFile.rows.length > 5 && (
        <p className="text-xs text-muted-foreground">
          Showing 5 of {parsedFile.rows.length} rows
        </p>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} size="sm">
          <ArrowLeft className="size-4 mr-1.5" />
          Back
        </Button>
        <Button onClick={() => onColumnSelected(selectedColumn)}>
          Continue with &ldquo;{parsedFile.headers[selectedColumn] || `Column ${selectedColumn + 1}`}&rdquo;
        </Button>
      </div>
    </div>
  );
}
