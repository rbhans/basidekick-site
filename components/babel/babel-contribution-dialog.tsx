"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
import { Label } from "@/components/ui/label";
import {
  Warning,
  Bug,
  PencilSimple,
  Plus,
  CircleNotch,
  Check,
} from "@phosphor-icons/react";
import type { BabelContributionType } from "@/lib/types";

interface BabelContributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: BabelContributionType;
  entryId?: string;
  entryType?: "point" | "equipment";
  entryCategory?: string;
  entryName?: string;
  isAuthenticated: boolean;
}

export function BabelContributionDialog({
  open,
  onOpenChange,
  initialType = "edit",
  entryId,
  entryType,
  entryCategory,
  entryName,
  isAuthenticated,
}: BabelContributionDialogProps) {
  const [type, setType] = useState<BabelContributionType>(initialType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [suggestedChanges, setSuggestedChanges] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSuggestedChanges("");
    setError(null);
    setIsSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    setType(initialType);
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }
    if (!description.trim()) {
      setError("Please describe your suggestion");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Unable to connect to the database");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be signed in to submit a contribution");
        setIsSubmitting(false);
        return;
      }

      const contribution = {
        user_id: user.id,
        type,
        entry_id: type !== "new_entry" ? entryId : null,
        entry_type: type !== "new_entry" ? entryType : null,
        entry_category: type !== "new_entry" ? entryCategory : null,
        title: title.trim(),
        description: description.trim(),
        suggested_changes: type === "edit" && suggestedChanges.trim()
          ? { changes: suggestedChanges.trim() }
          : null,
      };

      const { error: insertError } = await supabase
        .from("babel_contributions")
        .insert(contribution);

      if (insertError) {
        console.error("Insert error:", insertError);
        setError("Failed to submit contribution. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error("Submit error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeOptions: { value: BabelContributionType; label: string; description: string; icon: typeof Bug }[] = [
    {
      value: "error",
      label: "Report Error",
      description: "Something is incorrect or misleading",
      icon: Bug,
    },
    {
      value: "edit",
      label: "Suggest Edit",
      description: "Improve existing information",
      icon: PencilSimple,
    },
    {
      value: "new_entry",
      label: "Request New Entry",
      description: "Add a missing point or equipment",
      icon: Plus,
    },
  ];

  if (!isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to Contribute</DialogTitle>
            <DialogDescription>
              You need to be signed in to submit contributions to BAS Babel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button asChild>
              <a href="/signin">Sign In</a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <Check className="size-6 text-green-500" weight="bold" />
            </div>
            <DialogTitle className="mb-2">Thank you!</DialogTitle>
            <DialogDescription>
              Your contribution has been submitted and will be reviewed by our team.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contribute to BAS Babel</DialogTitle>
          <DialogDescription>
            {entryName ? (
              <>Help improve the entry for <span className="font-medium text-foreground">{entryName}</span></>
            ) : (
              "Share your knowledge to help improve BAS Babel"
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contribution Type */}
          <div className="space-y-3">
            <Label>What would you like to do?</Label>
            <div className="space-y-2">
              {typeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = type === option.value;
                // Hide "Request New Entry" when viewing a specific entry
                if (option.value === "new_entry" && entryId) return null;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setType(option.value)}
                    className={`w-full flex items-start gap-3 p-3 text-left border rounded transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className={`mt-0.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isSelected ? "text-primary" : ""}`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              {type === "error" ? "What's wrong?" : type === "edit" ? "What should change?" : "What's missing?"}
            </Label>
            <Input
              id="title"
              placeholder={
                type === "error"
                  ? "e.g., Incorrect unit shown"
                  : type === "edit"
                  ? "e.g., Add more common aliases"
                  : "e.g., Add supply air damper position"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {type === "error" ? "Describe the issue" : type === "edit" ? "Describe your suggestion" : "Describe the new entry"}
            </Label>
            <Textarea
              id="description"
              placeholder={
                type === "error"
                  ? "Explain what's incorrect and what the correct information should be..."
                  : type === "edit"
                  ? "Explain what should be changed or added..."
                  : "Describe the point or equipment, including any common names or aliases..."
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24"
            />
          </div>

          {/* Suggested Changes (edit type only) */}
          {type === "edit" && (
            <div className="space-y-2">
              <Label htmlFor="changes">Suggested changes (optional)</Label>
              <Textarea
                id="changes"
                placeholder="List specific changes, e.g.:&#10;- Add alias: 'ZAT'&#10;- Update description to include..."
                value={suggestedChanges}
                onChange={(e) => setSuggestedChanges(e.target.value)}
                className="min-h-20 font-mono text-xs"
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded text-sm text-destructive">
              <Warning className="size-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <CircleNotch className="size-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Contribution"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
