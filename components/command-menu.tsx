"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  House,
  Wrench,
  BookOpen,
  Calculator,

  BookmarksSimple,
  User,
  Gauge,
  Cpu,
} from "@phosphor-icons/react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ROUTES } from "@/lib/routes";

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
  { id: "atlas", title: "BAS Atlas", description: "Open source points and equipment reference", href: ROUTES.ATLAS, icon: <Gauge className="size-4" />, category: "Resources" },
  { id: "rust", title: "Rust", description: "Open source BAS crates", href: ROUTES.RESOURCES_RUST, icon: <Cpu className="size-4" />, category: "Resources" },
  { id: "calculators", title: "Calculators", description: "HVAC & electrical calculators", href: ROUTES.CALCULATORS, icon: <Calculator className="size-4" />, category: "Resources" },

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

  const groupedItems = useMemo(() => {
    return SEARCH_ITEMS.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, SearchItem[]>);
  }, []);

  const handleSelect = (item: SearchItem) => {
    handleOpenChange(false);
    setQuery("");
    router.push(item.href);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setQuery("");
    }
    onOpenChange(nextOpen);
  };

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Search pages..."
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Object.entries(groupedItems).map(([category, items]) => (
          <CommandGroup key={category} heading={category}>
            {items.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.title} ${item.description} ${item.category}`}
                onSelect={() => handleSelect(item)}
              >
                <span className="text-muted-foreground">{item.icon}</span>
                <span className="font-medium">{item.title}</span>
                <span className="text-muted-foreground text-xs ml-auto">
                  {item.description}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
      <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground flex items-center gap-4">
        <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd> Navigate</span>
        <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↵</kbd> Select</span>
        <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Esc</kbd> Close</span>
      </div>
    </CommandDialog>
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
