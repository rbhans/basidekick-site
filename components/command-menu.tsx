"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlass,
  House,
  Wrench,
  BookOpen,
  Chats,
  Translate,
  Calculator,
  Kanban,
  BookmarksSimple,
  User,
  X,
} from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface SearchItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  category: string;
}

const SEARCH_ITEMS: SearchItem[] = [
  { id: "home", title: "Home", description: "Go to homepage", href: ROUTES.HOME, icon: <House className="size-4" />, category: "Navigation" },
  { id: "tools", title: "Tools", description: "Browse all tools", href: ROUTES.TOOLS, icon: <Wrench className="size-4" />, category: "Navigation" },
  { id: "wiki", title: "Wiki", description: "Knowledge base", href: ROUTES.WIKI, icon: <BookOpen className="size-4" />, category: "Navigation" },
  { id: "forum", title: "Forum", description: "Community discussions", href: ROUTES.FORUM, icon: <Chats className="size-4" />, category: "Navigation" },
  { id: "babel", title: "BAS Babel", description: "Translate BAS terminology", href: ROUTES.BABEL, icon: <Translate className="size-4" />, category: "Resources" },
  { id: "calculators", title: "Calculators", description: "HVAC & electrical calculators", href: ROUTES.CALCULATORS, icon: <Calculator className="size-4" />, category: "Resources" },
  { id: "psk", title: "ProjectSidekick", description: "Project management", href: ROUTES.PSK, icon: <Kanban className="size-4" />, category: "Resources" },
  { id: "references", title: "References", description: "Quick reference sheets", href: ROUTES.REFERENCES, icon: <BookmarksSimple className="size-4" />, category: "Resources" },
  { id: "account", title: "Account", description: "Manage your account", href: ROUTES.ACCOUNT, icon: <User className="size-4" />, category: "Account" },
];

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredItems = SEARCH_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SearchItem[]>);

  const handleSelect = useCallback((item: SearchItem) => {
    onOpenChange(false);
    setQuery("");
    router.push(item.href);
  }, [onOpenChange, router]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            handleSelect(filteredItems[selectedIndex]);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, filteredItems, selectedIndex, handleSelect]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div className="flex items-center border-b border-border px-3">
          <MagnifyingGlass className="size-4 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No results found.
            </p>
          ) : (
            Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="mb-2">
                <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                  {category}
                </p>
                {items.map((item) => {
                  const globalIndex = filteredItems.indexOf(item);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={cn(
                        "w-full flex items-center gap-3 px-2 py-2 text-sm rounded-md transition-colors",
                        globalIndex === selectedIndex
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      <span className="text-muted-foreground">{item.icon}</span>
                      <span className="font-medium">{item.title}</span>
                      <span className="text-muted-foreground text-xs ml-auto">
                        {item.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground flex items-center gap-4">
          <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd> Navigate</span>
          <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↵</kbd> Select</span>
          <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Esc</kbd> Close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to use the command menu globally
export function useCommandMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { open, setOpen };
}
