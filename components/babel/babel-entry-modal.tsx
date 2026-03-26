"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { BabelEntryPageClient } from "./babel-entry-page-client";
import type { BabelPointEntry, BabelEquipmentEntry } from "@/lib/types";

interface BabelEntryModalProps {
  entry: BabelPointEntry | BabelEquipmentEntry;
  type: "point" | "equipment";
}

export function BabelEntryModal({ entry, type }: BabelEntryModalProps) {
  const router = useRouter();

  const name =
    type === "point"
      ? (entry as BabelPointEntry).concept.name
      : (entry as BabelEquipmentEntry).name;

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6 sm:p-8">
        <DialogTitle className="sr-only">{name}</DialogTitle>
        <BabelEntryPageClient entry={entry} type={type} hideBackLink />
      </DialogContent>
    </Dialog>
  );
}
