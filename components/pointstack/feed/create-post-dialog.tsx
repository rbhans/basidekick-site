"use client";

import { useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
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
import { TagInput } from "../shared/tag-input";
import { usePointStackStore } from "../pointstack-store";
import { PointStackPostType } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import { validateTitle, validateContent } from "@/lib/security";

interface CreatePostDialogProps {
  trigger: ReactNode;
  defaultType?: PointStackPostType;
}

const POST_TYPES: { value: PointStackPostType; label: string; description: string }[] = [
  { value: "discussion", label: "Discussion", description: "Start a conversation" },
  { value: "question", label: "Question", description: "Ask the community" },
  { value: "tip", label: "Tip", description: "Share knowledge" },
  { value: "project", label: "Project", description: "Share your work" },
];

const SUGGESTED_TAGS = [
  "niagara",
  "metasys",
  "bacnet",
  "modbus",
  "hvac",
  "vav",
  "ahu",
  "chiller",
  "boiler",
  "programming",
  "graphics",
  "alarms",
  "trends",
  "commissioning",
];

export function CreatePostDialog({ trigger, defaultType = "discussion" }: CreatePostDialogProps) {
  const router = useRouter();
  const { createPost } = usePointStackStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [postType, setPostType] = useState<PointStackPostType>(defaultType);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    const titleValidation = validateTitle(title);
    if (!titleValidation.valid) {
      setError(titleValidation.error || "Invalid title");
      return;
    }

    const contentValidation = validateContent(content);
    if (!contentValidation.valid) {
      setError(contentValidation.error || "Invalid content");
      return;
    }

    setLoading(true);

    try {
      const post = await createPost({
        post_type: postType,
        title: title.trim(),
        content: content.trim(),
        tags,
      });

      setOpen(false);
      // Reset form
      setTitle("");
      setContent("");
      setTags([]);

      // Navigate to the new post
      router.push(ROUTES.POINTSTACK_POST(post.slug));
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Post type */}
          <div className="space-y-2">
            <Label>Post Type</Label>
            <Select value={postType} onValueChange={(v) => setPostType(v as PointStackPostType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POST_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <span className="font-medium">{type.label}</span>
                      <span className="text-muted-foreground ml-2">- {type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                postType === "question"
                  ? "What do you want to know?"
                  : postType === "tip"
                  ? "What's your tip about?"
                  : "Give your post a title"
              }
              maxLength={200}
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                postType === "question"
                  ? "Provide details about your question..."
                  : postType === "tip"
                  ? "Share your tip with the community..."
                  : "Write your post content..."
              }
              rows={6}
              maxLength={50000}
              required
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length.toLocaleString()} / 50,000
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput
              value={tags}
              onChange={setTags}
              placeholder="Add relevant tags..."
              maxTags={5}
              suggestions={SUGGESTED_TAGS}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim() || !content.trim()}>
              {loading ? "Creating..." : "Create Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
