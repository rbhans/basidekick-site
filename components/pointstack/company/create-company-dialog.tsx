"use client";

import { useState } from "react";
import { Buildings } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PointStackCompany } from "@/lib/types";
import * as api from "../pointstack-api";

interface CreateCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (company: PointStackCompany) => void | Promise<void>;
}

export function CreateCompanyDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateCompanyDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setDescription("");
    setError(null);
  };

  const closeDialog = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      const company = await api.createCompany(
        name.trim(),
        description.trim() || undefined
      );

      if (onSuccess) {
        await onSuccess(company);
      }

      closeDialog();
    } catch (err) {
      console.error("Failed to create company:", err);
      setError("Failed to create company. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetForm();
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Buildings className="size-5" />
            Create Company
          </DialogTitle>
          <DialogDescription>
            Create a company profile for your team in the PointStack community.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Company Name
            </label>
            <Input
              placeholder="Enter company name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Description (optional)
            </label>
            <Textarea
              placeholder="Tell the community what your company does"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={1000}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={closeDialog} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim() || isCreating}>
            {isCreating ? "Creating..." : "Create Company"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
