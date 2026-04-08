"use client";

import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "@phosphor-icons/react";
import { BabelEntryPageClient } from "./babel-entry-page-client";
import type { BabelPointEntry, BabelEquipmentEntry } from "@/lib/types";

interface BabelEntryModalProps {
  entry: BabelPointEntry | BabelEquipmentEntry;
  type: "point" | "equipment";
}

export function BabelEntryModal({ entry, type }: BabelEntryModalProps) {
  const router = useRouter();

  const id =
    type === "point"
      ? (entry as BabelPointEntry).concept.id
      : (entry as BabelEquipmentEntry).id;
  const name =
    type === "point"
      ? (entry as BabelPointEntry).concept.name
      : (entry as BabelEquipmentEntry).name;

  const handleClose = () => router.back();

  return (
    <DialogPrimitive.Root open onOpenChange={handleClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-foreground/55 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-100"
        />
        <DialogPrimitive.Content
          className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-32px)] max-w-4xl max-h-[90vh] bg-card border-[1.5px] border-foreground rounded-md overflow-hidden flex flex-col outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-100"
        >
          <DialogPrimitive.Title className="sr-only">{name}</DialogPrimitive.Title>

          {/* Mini title block strip */}
          <div className="title-block !py-3 !px-6 shrink-0">
            <div className="field">
              <span className="field-label">Drawing</span>
              <span className="field-value">Atlas</span>
            </div>
            <div className="field">
              <span className="field-label">Sheet</span>
              <span className="field-value truncate max-w-[220px]">{id}</span>
            </div>
            <div className="field hidden sm:flex">
              <span className="field-label">Type</span>
              <span className="field-value">{type === "point" ? "Point" : "Equipment"}</span>
            </div>
            <div className="spacer" />
            <div className="field">
              <span className="field-label">Drawn by</span>
              <span className="field-value">R.H.</span>
            </div>
            <DialogPrimitive.Close
              aria-label="Close"
              className="ml-4 w-6 h-6 border border-foreground rounded-sm flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-colors shrink-0"
            >
              <X className="w-3 h-3" weight="bold" />
            </DialogPrimitive.Close>
          </div>

          {/* Body — the existing BabelEntryDetail content, scrollable */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            <BabelEntryPageClient entry={entry} type={type} hideBackLink />
          </div>

          {/* URL hint footer */}
          <div className="shrink-0 border-t border-border bg-secondary px-6 py-3 font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground flex items-center justify-between">
            <span>
              URL · <span className="text-foreground normal-case tracking-normal">basidekick.com/atlas/{id}</span>
            </span>
            <span className="hidden sm:inline">Press ESC to close</span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
