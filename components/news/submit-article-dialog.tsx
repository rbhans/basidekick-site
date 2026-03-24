"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TagInput } from "@/components/pointstack/shared/tag-input";
import { useNewsStore } from "./news-store";
import { Plus } from "@phosphor-icons/react";

const TAG_SUGGESTIONS = [
  "hvac", "bacnet", "modbus", "niagara", "tridium", "smart-building",
  "iot", "energy", "controls", "commissioning", "analytics", "ai",
  "cybersecurity", "retrofit", "sustainability", "ddc", "ashrae",
];

export function SubmitArticleDialog() {
  const { submitArticle } = useNewsStore();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractedDomain = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("URL is required");
      return;
    }

    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (title.trim().length < 5) {
      setError("Title must be at least 5 characters");
      return;
    }

    setLoading(true);

    try {
      await submitArticle(url.trim(), title.trim(), tags);
      setUrl("");
      setTitle("");
      setTags([]);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Submit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit Article</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="article-url">URL</Label>
            <Input
              id="article-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              type="url"
            />
            {extractedDomain && (
              <p className="text-xs text-muted-foreground/60">
                Source: {extractedDomain}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="article-title">Title</Label>
            <Input
              id="article-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags (optional)</Label>
            <TagInput
              value={tags}
              onChange={setTags}
              placeholder="Add tags..."
              maxTags={5}
              suggestions={TAG_SUGGESTIONS}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
