"use client";

import { Command as CommandIcon, MagnifyingGlass } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/primitives/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/primitives/dialog";
import {
  searchWorkspace,
  type WorkspaceSearchItem,
} from "@/lib/workspace-search";

export function WorkspaceCommand({
  open,
  onOpenChange,
  trigger,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactElement;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [remoteItems, setRemoteItems] = useState<WorkspaceSearchItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (query.trim().length < 2) {
      Promise.resolve().then(() => setRemoteItems([]));
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : { items: [] }))
        .then((payload) =>
          setRemoteItems(
            (payload as { items?: WorkspaceSearchItem[] }).items ?? [],
          ),
        )
        .catch(() => {});
    }, 140);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const results = useMemo(
    () => searchWorkspace(query, 10, remoteItems),
    [query, remoteItems],
  );
  const selectedValue = results[selectedIndex]
    ? resultValue(results[selectedIndex])
    : "";

  function changeOpen(nextOpen: boolean) {
    if (!nextOpen) {
      setQuery("");
      setRemoteItems([]);
      setSelectedIndex(0);
    }
    onOpenChange(nextOpen);
  }

  function navigate(href: string) {
    changeOpen(false);
    router.push(href);
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="command-palette"
        overlayClassName="palette-backdrop"
        showCloseButton={false}
      >
        <DialogTitle className="visually-hidden">Search workspace</DialogTitle>
        <DialogDescription className="visually-hidden">
          Search BASidekick sections and open a result.
        </DialogDescription>
        <Command
          className="command-palette-inner"
          shouldFilter={false}
          value={selectedValue}
          onValueChange={(value) => {
            const index = results.findIndex((item) => resultValue(item) === value);
            if (index >= 0) setSelectedIndex(index);
          }}
        >
          <label>
            <MagnifyingGlass size={18} />
            <CommandInput
              id="workspace-search"
              aria-label="Search workspace"
              value={query}
              onValueChange={(value) => {
                setQuery(value);
                setSelectedIndex(0);
              }}
              placeholder="Search all of BASidekick…"
              autoFocus
            />
            <span className="palette-count">{results.length}</span>
            <kbd>ESC</kbd>
          </label>
          <CommandList
            className="palette-results"
            id="workspace-search-results"
            aria-label="Workspace search results"
          >
            <CommandEmpty>
              No workspace result matches “{query}”.
            </CommandEmpty>
            {results.map((item, index) => (
              <CommandItem
                className={index === selectedIndex ? "active" : ""}
                value={resultValue(item)}
                key={resultValue(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                onSelect={() => navigate(item.href)}
              >
                <span>
                  <i />
                  {item.label}
                </span>
                <small>{item.kind}</small>
              </CommandItem>
            ))}
          </CommandList>
          <footer>
            <span>
              <CommandIcon size={13} /> K anywhere
            </span>
            <span>All sections · ↑↓ select · Enter open</span>
          </footer>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function resultValue(item: WorkspaceSearchItem) {
  return `${item.kind}:${item.href}`;
}
