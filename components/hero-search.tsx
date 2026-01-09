"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, Command } from "@phosphor-icons/react";
import { ROUTES } from "@/lib/routes";

interface HeroSearchProps {
  onCommandMenuOpen?: () => void;
}

export function HeroSearch({ onCommandMenuOpen }: HeroSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Search in Babel by default
      router.push(`${ROUTES.BABEL}?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-md w-full">
      <div className="relative">
        <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search BAS terms, wiki, forum..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-12 pl-12 pr-24 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
        <button
          type="button"
          onClick={onCommandMenuOpen}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground bg-muted rounded hover:bg-muted/80 transition-colors"
        >
          <Command className="size-3" />
          <span>K</span>
        </button>
      </div>
    </form>
  );
}
