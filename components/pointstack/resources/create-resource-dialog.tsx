"use client";

import { ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import {
  CreatePointStackResourceInput,
  PointStackResourceCategory,
  PointStackResourceListing,
} from "@/lib/types";
import { validateContent, validateTitle } from "@/lib/security";
import * as api from "../pointstack-api";

interface CreateResourceDialogProps {
  trigger: ReactNode;
  onCreated?: (resource: PointStackResourceListing) => void | Promise<void>;
}

const CATEGORIES: { value: PointStackResourceCategory; label: string }[] = [
  { value: "template", label: "Template" },
  { value: "script", label: "Script" },
  { value: "document", label: "Document" },
  { value: "guide", label: "Guide" },
  { value: "tool", label: "Tool" },
  { value: "other", label: "Other" },
];

export function CreateResourceDialog({ trigger, onCreated }: CreateResourceDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<PointStackResourceCategory>("template");
  const [fileUrl, setFileUrl] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [isFree, setIsFree] = useState(true);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("template");
    setFileUrl("");
    setExternalLink("");
    setIsFree(true);
    setError(null);
  };

  const validateOptionalUrl = (value: string): boolean => {
    if (!value.trim()) return true;
    try {
      const parsed = new URL(value.trim());
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    const titleValidation = validateTitle(title);
    if (!titleValidation.valid) {
      setError(titleValidation.error || "Invalid title.");
      return;
    }
    if (description.trim()) {
      const descriptionValidation = validateContent(description);
      if (!descriptionValidation.valid) {
        setError(descriptionValidation.error || "Invalid description.");
        return;
      }
    }
    if (!fileUrl.trim() && !externalLink.trim()) {
      setError("Provide either a file URL or an external link.");
      return;
    }
    if (!validateOptionalUrl(fileUrl)) {
      setError("File URL must be a valid http/https URL.");
      return;
    }
    if (!validateOptionalUrl(externalLink)) {
      setError("External link must be a valid http/https URL.");
      return;
    }

    const input: CreatePointStackResourceInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      file_url: fileUrl.trim() || undefined,
      external_link: externalLink.trim() || undefined,
      is_free: isFree,
    };

    setSubmitting(true);
    try {
      const resource = await api.createResource(input);
      if (onCreated) {
        await onCreated(resource);
      }
      setOpen(false);
      resetForm();
    } catch (submitError) {
      console.error("Error creating resource:", submitError);
      setError("Failed to share resource. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share a Resource</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resource-title">Title</Label>
            <Input
              id="resource-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="BACnet Startup Script Template"
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resource-description">Description (Optional)</Label>
            <Textarea
              id="resource-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe what this resource is and how to use it..."
              rows={4}
              maxLength={10000}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as PointStackResourceCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 pt-8">
              <input
                id="resource-free"
                type="checkbox"
                checked={isFree}
                onChange={(event) => setIsFree(event.target.checked)}
                className="size-4"
              />
              <Label htmlFor="resource-free">Free resource</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resource-file-url">File URL</Label>
            <Input
              id="resource-file-url"
              type="url"
              value={fileUrl}
              onChange={(event) => setFileUrl(event.target.value)}
              placeholder="https://example.com/files/template.zip"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resource-external-link">External Link</Label>
            <Input
              id="resource-external-link"
              type="url"
              value={externalLink}
              onChange={(event) => setExternalLink(event.target.value)}
              placeholder="https://github.com/user/bas-tools"
            />
            <p className="text-xs text-muted-foreground">
              Provide a file URL, an external link, or both.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !title.trim()}>
              {submitting ? "Sharing..." : "Share Resource"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
