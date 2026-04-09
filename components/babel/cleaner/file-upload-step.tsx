"use client";

import { useCallback, useRef, useState } from "react";
import { UploadSimple, File as FileIcon, Warning } from "@phosphor-icons/react";
import { validateFile, parseFile } from "@/lib/babel-cleaner";
import type { ParsedFile } from "@/lib/babel-cleaner";

interface FileUploadStepProps {
  onFileReady: (parsed: ParsedFile) => void;
}

export function FileUploadStep({ onFileReady }: FileUploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsParsing(true);
      try {
        const parsed = await parseFile(file);
        if (parsed.headers.length === 0 || parsed.rows.length === 0) {
          setError("File appears to be empty or has no data rows.");
          return;
        }
        onFileReady(parsed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse file.");
      } finally {
        setIsParsing(false);
      }
    },
    [onFileReady],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Upload Point Names</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a CSV or Excel file containing BAS point names. The tool will match
          them against Atlas terms and suggest standardized names.
        </p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12
          cursor-pointer transition-colors
          ${isDragging ? "border-primary bg-muted" : "border-border hover:border-foreground hover:bg-muted/50"}
          ${isParsing ? "pointer-events-none opacity-60" : ""}
        `}
      >
        {isParsing ? (
          <div className="flex flex-col items-center gap-2">
            <FileIcon className="size-10 text-muted-foreground animate-pulse" weight="duotone" />
            <p className="text-sm text-muted-foreground">Parsing file...</p>
          </div>
        ) : (
          <>
            <UploadSimple className="size-10 text-muted-foreground" weight="duotone" />
            <div className="text-center">
              <p className="text-sm font-medium">
                Drop your file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                CSV, TSV, XLSX, or XLS (max 5MB)
              </p>
            </div>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.tsv,.xlsx,.xls"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <Warning className="size-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
