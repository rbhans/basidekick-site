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
import { useProjectStore } from "./project-store";
import { useAuth } from "@/components/providers/auth-provider";

interface CreateCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCompanyDialog({
  open,
  onOpenChange,
}: CreateCompanyDialogProps) {
  const { user } = useAuth();
  const { createCompany, setWorkspace } = useProjectStore();

  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim() || !user?.id) return;

    setIsCreating(true);
    setError(null);

    try {
      const company = await createCompany(name.trim(), user.id);

      // Switch to the new company workspace
      await setWorkspace({
        type: "company",
        companyId: company.id,
        companyName: company.name,
      });

      // Reset and close
      setName("");
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to create company:", err);
      setError("Failed to create company. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setName("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Buildings className="size-5" />
            Create Company
          </DialogTitle>
          <DialogDescription>
            Create a company workspace to collaborate with your team. You can
            invite others to join using a shareable link.
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) {
                  handleCreate();
                }
              }}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
          >
            {isCreating ? "Creating..." : "Create Company"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
