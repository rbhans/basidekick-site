"use client";

import { useMemo, useState, ReactNode } from "react";
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
import { useAtlasAll } from "@/components/atlas/use-atlas-data";
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
  const { data: atlasData } = useAtlasAll();
  const [equipmentIds, setEquipmentIds] = useState<string[]>([]);
  const [equipmentQuery, setEquipmentQuery] = useState("");


  const brandById = useMemo(() => {
    return new Map(atlasData?.brands.map((b) => [b.id, b]) || []);
  }, [atlasData]);

  const equipmentMatches = useMemo(() => {
    if (!atlasData || !equipmentQuery.trim()) return [];
    const lower = equipmentQuery.toLowerCase();
    return atlasData.models
      .filter((model) => {
        const brandName = brandById.get(model.brand)?.name || "";
        return (
          model.name.toLowerCase().includes(lower) ||
          model.id.toLowerCase().includes(lower) ||
          (model.slug || "").toLowerCase().includes(lower) ||
          (model.model_numbers || []).some((num) => num.toLowerCase().includes(lower)) ||
          brandName.toLowerCase().includes(lower)
        );
      })
      .filter((model) => !equipmentIds.includes(model.id))
      .slice(0, 6);
  }, [atlasData, equipmentQuery, equipmentIds, brandById]);

  const addEquipment = (id: string) => {
    if (!equipmentIds.includes(id)) {
      setEquipmentIds((prev) => [...prev, id]);
      setEquipmentQuery("");
    }
  };

  const removeEquipment = (id: string) => {
    setEquipmentIds((prev) => prev.filter((item) => item !== id));
  };

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
        equipment_ids: equipmentIds,
      });

      setOpen(false);
      // Reset form
      setTitle("");
      setContent("");
      setTags([]);
      setEquipmentIds([]);
      setEquipmentQuery("");

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

          {/* Equipment Tags */}
          {(postType === "question" || postType === "project") && (
            <div className="space-y-2">
              <Label>Tag equipment (optional)</Label>
              {equipmentIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {equipmentIds.map((id) => {
                    const model = atlasData?.models.find((m) => m.id === id);
                    const brand = model ? brandById.get(model.brand) : null;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-2 px-2 py-1 text-xs bg-muted rounded"
                      >
                        {model?.name || id}
                        {brand?.name ? <span className="text-muted-foreground">· {brand.name}</span> : null}
                        <button
                          type="button"
                          onClick={() => removeEquipment(id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
              <div className="relative">
                <Input
                  value={equipmentQuery}
                  onChange={(e) => setEquipmentQuery(e.target.value)}
                  placeholder="Search equipment..."
                />
                {equipmentQuery.trim() && equipmentMatches.length > 0 && (
                  <div className="absolute z-10 mt-2 w-full border border-border bg-card rounded shadow">
                    {equipmentMatches.map((model) => {
                      const brand = brandById.get(model.brand);
                      return (
                        <button
                          key={model.id}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50"
                          onClick={() => addEquipment(model.id)}
                        >
                          {model.name}
                          {brand?.name ? (
                            <span className="text-xs text-muted-foreground ml-2">{brand.name}</span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

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
