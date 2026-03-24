"use client";

import { useState } from "react";
import { useNewsStore } from "./news-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { validateContent } from "@/lib/security";

interface NewsCommentFormProps {
  articleId: string;
  parentId?: string;
  onSuccess?: () => void;
}

export function NewsCommentForm({ articleId, parentId, onSuccess }: NewsCommentFormProps) {
  const { createComment } = useNewsStore();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateContent(content);
    if (!validation.valid) {
      setError(validation.error || "Invalid content");
      return;
    }

    setLoading(true);

    try {
      await createComment({
        article_id: articleId,
        content: content.trim(),
        parent_id: parentId,
      });
      setContent("");
      onSuccess?.();
    } catch (err) {
      console.error("Error creating comment:", err);
      setError(err instanceof Error ? err.message : "Failed to post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        rows={4}
        maxLength={10000}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading || !content.trim()}>
          {loading ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </form>
  );
}
