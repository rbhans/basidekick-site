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
import { Textarea } from "@/components/ui/textarea";
import { Warning, CircleNotch, Check } from "@phosphor-icons/react";

export type ReportTargetType =
  | "atlas_point"
  | "atlas_equipment"
  | "wiki_article"
  | "new_atlas_entry";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: ReportTargetType;
  targetId?: string | null;
  targetLabel?: string | null;
  targetUrl?: string | null;
  isAuthenticated: boolean;
}

const HEADINGS: Record<ReportTargetType, { title: string; description: string; placeholder: string; cta: string }> = {
  atlas_point: {
    title: "Report or suggest",
    description: "Tell us what's wrong, what should change, or anything you'd like added.",
    placeholder: "Describe the issue or suggestion…",
    cta: "Send to admin",
  },
  atlas_equipment: {
    title: "Report or suggest",
    description: "Tell us what's wrong, what should change, or anything you'd like added.",
    placeholder: "Describe the issue or suggestion…",
    cta: "Send to admin",
  },
  wiki_article: {
    title: "Report or suggest",
    description: "Flag an issue, suggest an edit, or leave feedback for the admin.",
    placeholder: "Describe the issue or suggestion…",
    cta: "Send to admin",
  },
  new_atlas_entry: {
    title: "Suggest a new Atlas entry",
    description: "Describe the point or piece of equipment that should be added.",
    placeholder: "Name, common aliases, protocols, where you'd expect to find it…",
    cta: "Submit suggestion",
  },
};

export function ReportDialog({
  open,
  onOpenChange,
  targetType,
  targetId,
  targetLabel,
  targetUrl,
  isAuthenticated,
}: ReportDialogProps) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setMessage("");
      setError(null);
      setSuccess(false);
      setSubmitting(false);
    }
    onOpenChange(next);
  };

  const { title, description, placeholder, cta } = HEADINGS[targetType];

  const handleSubmit = async () => {
    setError(null);
    const trimmed = message.trim();
    if (trimmed.length < 1) {
      setError("Please enter a message.");
      return;
    }

    setSubmitting(true);

    const supabase = createClient();
    if (!supabase) {
      setError("Unable to connect to the server");
      setSubmitting(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setError("You must be signed in to submit.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/content-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId ?? null,
          target_label: targetLabel ?? null,
          target_url: targetUrl ?? null,
          message: trimmed,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || "Failed to submit. Please try again.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        handleOpenChange(false);
      }, 1600);
    } catch (err) {
      console.error("report submit error:", err);
      setError("An unexpected error occurred.");
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to submit</DialogTitle>
            <DialogDescription>
              You need to be signed in to send feedback to the admin.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
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

  if (success) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-accent/15">
              <Check className="size-6 text-accent" weight="bold" />
            </div>
            <DialogTitle className="mb-2">Thanks!</DialogTitle>
            <DialogDescription>
              Your message was sent to the admin.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
            {targetLabel && targetType !== "new_atlas_entry" && (
              <>
                {" "}
                <span className="font-medium text-foreground">{targetLabel}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <Textarea
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-32"
          maxLength={5000}
          disabled={submitting}
        />
        <p className="text-xs text-muted-foreground">{message.length} / 5000</p>

        {error && (
          <div className="flex items-center gap-2 rounded border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <Warning className="size-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <CircleNotch className="mr-2 size-4 animate-spin" />
                Submitting…
              </>
            ) : (
              cta
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
