"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { PointStackCompany, PointStackPost } from "@/lib/types";
import { validateContent, validateTitle } from "@/lib/security";
import * as api from "../pointstack-api";

interface EditPostDialogProps {
  post: PointStackPost;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (post: PointStackPost) => void | Promise<void>;
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_DOC_SIZE = 20 * 1024 * 1024;
const NONE = "__none__";

export function EditPostDialog({
  post,
  open,
  onOpenChange,
  onSaved,
}: EditPostDialogProps) {
  const { user } = useAuth();
  const { data: atlasData } = useAtlasAll();

  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [tags, setTags] = useState<string[]>(post.tags || []);
  const [equipmentIds, setEquipmentIds] = useState<string[]>(post.equipment_ids || []);
  const [equipmentQuery, setEquipmentQuery] = useState("");
  const [isShowcase, setIsShowcase] = useState(Boolean(post.is_showcase));
  const [location, setLocation] = useState(post.location || "");
  const [completionDate, setCompletionDate] = useState(
    post.completion_date ? String(post.completion_date).slice(0, 10) : ""
  );
  const [squareFootage, setSquareFootage] = useState(
    post.square_footage ? String(post.square_footage) : ""
  );
  const [images, setImages] = useState<string[]>(post.images || []);
  const [documents, setDocuments] = useState<string[]>(post.documents || []);
  const [companies, setCompanies] = useState<PointStackCompany[]>([]);
  const [companyId, setCompanyId] = useState(post.company_id || NONE);

  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const brandById = useMemo(() => {
    return new Map(atlasData?.brands.map((b) => [b.id, b]) || []);
  }, [atlasData]);

  const selectedEquipmentNames = useMemo(() => {
    if (!atlasData) return [];
    const modelById = new Map(atlasData.models.map((m) => [m.id, m]));
    return equipmentIds
      .map((id) => {
        const model = modelById.get(id);
        if (!model) return null;
        const brand = brandById.get(model.brand);
        return {
          id,
          name: brand ? `${brand.name} ${model.name}` : model.name,
        };
      })
      .filter(Boolean) as { id: string; name: string }[];
  }, [atlasData, equipmentIds, brandById]);

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

  useEffect(() => {
    setTitle(post.title);
    setContent(post.content);
    setTags(post.tags || []);
    setEquipmentIds(post.equipment_ids || []);
    setEquipmentQuery("");
    setIsShowcase(Boolean(post.is_showcase));
    setLocation(post.location || "");
    setCompletionDate(post.completion_date ? String(post.completion_date).slice(0, 10) : "");
    setSquareFootage(post.square_footage ? String(post.square_footage) : "");
    setImages(post.images || []);
    setDocuments(post.documents || []);
    setCompanyId(post.company_id || NONE);
    setError(null);
  }, [post, open]);

  useEffect(() => {
    const loadCompanies = async () => {
      if (!user || !open || post.post_type !== "project") return;
      try {
        const data = await api.fetchUserCompanies(user.id);
        setCompanies(data);
      } catch (fetchError) {
        console.error("Error loading companies for edit:", fetchError);
      }
    };
    void loadCompanies();
  }, [user, open, post.post_type]);

  const addEquipment = (id: string) => {
    if (!equipmentIds.includes(id)) {
      setEquipmentIds((prev) => [...prev, id]);
      setEquipmentQuery("");
    }
  };

  const removeEquipment = (id: string) => {
    setEquipmentIds((prev) => prev.filter((item) => item !== id));
  };

  const uploadFiles = async (
    fileList: FileList,
    folder: string,
    allowedTypes: string[],
    maxSize: number
  ) => {
    if (!user) {
      setError("You must be signed in to upload files.");
      return [] as string[];
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Upload service is unavailable.");
      return [] as string[];
    }

    const uploadedUrls: string[] = [];
    for (const file of Array.from(fileList)) {
      if (allowedTypes.length > 0 && file.type && !allowedTypes.includes(file.type)) {
        setError(`Unsupported file type: ${file.name}`);
        continue;
      }
      if (file.size > maxSize) {
        setError(`File too large: ${file.name}`);
        continue;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "dat";
      const fileName = `${user.id}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("pointstack-posts")
        .upload(fileName, file);

      if (uploadError) {
        console.error(uploadError);
        setError(`Failed to upload ${file.name}`);
        continue;
      }

      const { data } = supabase.storage.from("pointstack-posts").getPublicUrl(fileName);
      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    setError(null);
    setUploadingImages(true);
    const urls = await uploadFiles(fileList, "images", IMAGE_TYPES, MAX_IMAGE_SIZE);
    if (urls.length > 0) {
      setImages((prev) => [...prev, ...urls]);
    }
    setUploadingImages(false);
    event.target.value = "";
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    setError(null);
    setUploadingDocuments(true);
    const urls = await uploadFiles(fileList, "documents", DOC_TYPES, MAX_DOC_SIZE);
    if (urls.length > 0) {
      setDocuments((prev) => [...prev, ...urls]);
    }
    setUploadingDocuments(false);
    event.target.value = "";
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

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

    const parsedSquareFootage = squareFootage.trim() ? Number(squareFootage) : undefined;
    if (parsedSquareFootage !== undefined && (!Number.isFinite(parsedSquareFootage) || parsedSquareFootage < 0)) {
      setError("Square footage must be a positive number.");
      return;
    }

    setSubmitting(true);
    try {
      const updatedPost = await api.updatePost(post.id, {
        title: title.trim(),
        content: content.trim(),
        tags,
        equipment_ids: equipmentIds,
        is_showcase: post.post_type === "project" ? isShowcase : undefined,
        cover_image_url: post.post_type === "project" ? images[0] || null : undefined,
        images: post.post_type === "project" ? images : undefined,
        documents: post.post_type === "project" ? documents : undefined,
        location: post.post_type === "project" ? location.trim() || undefined : undefined,
        completion_date: post.post_type === "project" ? completionDate || undefined : undefined,
        square_footage: post.post_type === "project" ? parsedSquareFootage : undefined,
        company_id: post.post_type === "project" ? (companyId === NONE ? null : companyId) : undefined,
      });

      if (onSaved) {
        await onSaved(updatedPost);
      }
      onOpenChange(false);
    } catch (saveError) {
      console.error("Error updating post:", saveError);
      setError("Failed to update post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {post.post_type === "project" ? "Project" : "Post"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-content">Content</Label>
            <Textarea
              id="edit-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={8}
              maxLength={50000}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput value={tags} onChange={setTags} suggestions={[]} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment-search">Equipment</Label>
            <Input
              id="equipment-search"
              value={equipmentQuery}
              onChange={(event) => setEquipmentQuery(event.target.value)}
              placeholder="Search models, brands, or IDs..."
            />
            {equipmentMatches.length > 0 && (
              <div className="border border-border rounded-md max-h-48 overflow-auto">
                {equipmentMatches.map((model) => {
                  const brandName = brandById.get(model.brand)?.name;
                  return (
                    <button
                      key={model.id}
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-muted text-sm"
                      onClick={() => addEquipment(model.id)}
                    >
                      <span className="font-medium">{model.name}</span>
                      {brandName && (
                        <span className="text-muted-foreground ml-2">{brandName}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            {selectedEquipmentNames.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedEquipmentNames.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted text-sm"
                  >
                    {item.name}
                    <button
                      type="button"
                      onClick={() => removeEquipment(item.id)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={`Remove ${item.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {post.post_type === "project" && (
            <>
              <div className="flex items-center gap-2">
                <input
                  id="edit-showcase"
                  type="checkbox"
                  checked={isShowcase}
                  onChange={(event) => setIsShowcase(event.target.checked)}
                  className="size-4"
                />
                <Label htmlFor="edit-showcase">Show in showcase</Label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Optional project location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-completion-date">Completion Date</Label>
                  <Input
                    id="edit-completion-date"
                    type="date"
                    value={completionDate}
                    onChange={(event) => setCompletionDate(event.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-square-footage">Square Footage</Label>
                  <Input
                    id="edit-square-footage"
                    type="number"
                    min={0}
                    value={squareFootage}
                    onChange={(event) => setSquareFootage(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Select value={companyId} onValueChange={setCompanyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="No company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>No company</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Images</Label>
                <Input
                  type="file"
                  accept={IMAGE_TYPES.join(",")}
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                />
                {images.length > 0 && (
                  <div className="grid gap-2 md:grid-cols-2">
                    {images.map((url) => (
                      <div key={url} className="relative border border-border rounded-md overflow-hidden">
                        <img src={url} alt="Project upload" className="w-full h-32 object-cover" />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => setImages((prev) => prev.filter((item) => item !== url))}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Documents</Label>
                <Input
                  type="file"
                  accept={DOC_TYPES.join(",")}
                  multiple
                  onChange={handleDocumentUpload}
                  disabled={uploadingDocuments}
                />
                {documents.length > 0 && (
                  <div className="space-y-2">
                    {documents.map((url) => (
                      <div
                        key={url}
                        className="flex items-center justify-between rounded-md border border-border p-2 text-sm"
                      >
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                          {url}
                        </a>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setDocuments((prev) => prev.filter((item) => item !== url))}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || uploadingImages || uploadingDocuments}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
