"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BabelSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  resultCount: number;
  totalCount: number;
}

export function BabelSearch({
  query,
  onQueryChange,
  resultCount,
  totalCount,
}: BabelSearchProps) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search points, equipment, or aliases..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => onQueryChange("")}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {query ? (
          <>
            Found <span className="font-medium">{resultCount}</span> results for &quot;{query}&quot;
          </>
        ) : (
          <>
            <span className="font-medium">{totalCount}</span> entries available
          </>
        )}
      </p>
    </div>
  );
}
