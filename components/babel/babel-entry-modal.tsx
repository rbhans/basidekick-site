"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X, Copy } from "@phosphor-icons/react";
import { BabelEntryPageClient } from "./babel-entry-page-client";
import { ROUTES } from "@/lib/routes";
import type { BabelPointEntry, BabelEquipmentEntry } from "@/lib/types";

interface BabelEntryModalProps {
  entry: BabelPointEntry | BabelEquipmentEntry;
  type: "point" | "equipment";
}

export function BabelEntryModal({ entry, type }: BabelEntryModalProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const id =
    type === "point"
      ? (entry as BabelPointEntry).concept.id
      : (entry as BabelEquipmentEntry).id;
  const name =
    type === "point"
      ? (entry as BabelPointEntry).concept.name
      : (entry as BabelEquipmentEntry).name;
  const category =
    type === "point"
      ? (entry as BabelPointEntry).concept.category
      : (entry as BabelEquipmentEntry).category;

  const handleClose = () => router.back();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${ROUTES.ATLAS_ENTRY(id)}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  return (
    <DialogPrimitive.Root open onOpenChange={handleClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-150"
          style={{ background: "rgba(8,8,8,.42)", backdropFilter: "blur(2px)" }}
        />
        <DialogPrimitive.Content
          className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[min(960px,100%)] max-w-full bg-sand border-l border-[var(--sand-line-2)] overflow-y-auto overflow-x-hidden outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-8 data-[state=open]:slide-in-from-right-8 data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200"
          style={{ boxShadow: "-20px 0 40px -10px rgba(0,0,0,.18)" }}
        >
          <DialogPrimitive.Title className="sr-only">{name}</DialogPrimitive.Title>

          {/* Modal header bar */}
          <div className="em-bar">
            <div className="crumbs">
              <span>Atlas</span>
              <span className="sep">/</span>
              <b className="truncate max-w-[140px]">{category.replace("-", " ")}</b>
              <span className="sep">/</span>
              <b className="truncate max-w-[180px]">{id}</b>
            </div>
            <span className="url hidden md:inline">
              basidekick.com/atlas/<b>{id}</b>
            </span>
            <span className="spacer" />
            <button
              type="button"
              onClick={handleCopyLink}
              className="em-action"
              aria-label="Copy link"
            >
              <Copy className="w-3 h-3" weight="regular" />
              {copied ? "Copied!" : "Copy link"}
            </button>
            <DialogPrimitive.Close aria-label="Close" className="em-action em-close">
              <span>Close</span>
              <kbd>esc</kbd>
              <X className="w-3 h-3" weight="bold" />
            </DialogPrimitive.Close>
          </div>

          {/* Body */}
          <div className="px-5 sm:px-8 py-6 sm:py-8">
            <BabelEntryPageClient entry={entry} type={type} hideBackLink />
          </div>

          {/* Modal footer */}
          <div className="em-foot">
            <span>
              URL · <b>basidekick.com/atlas/{id}</b>
            </span>
            <span className="right">
              Press <kbd>esc</kbd> to close
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
