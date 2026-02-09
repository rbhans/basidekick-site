"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TagInput } from "../shared/tag-input";
import { useAtlasAll } from "@/components/atlas/use-atlas-data";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { PointStackCompany, PointStackPost } from "@/lib/types";
import {
  editPostFormSchema,
  EditPostFormValues,
  NONE_COMPANY,
} from "@/lib/schemas/pointstack-content";
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

function getInitialValues(post: PointStackPost): EditPostFormValues {
  return {
    title: post.title,
    content: post.content,
    tags: post.tags || [],
    equipmentIds: post.equipment_ids || [],
    isShowcase: Boolean(post.is_showcase),
    location: post.location || "",
    completionDate: post.completion_date ? String(post.completion_date).slice(0, 10) : "",
    squareFootage: post.square_footage ? String(post.square_footage) : "",
    images: post.images || [],
    documents: post.documents || [],
    companyId: post.company_id || NONE_COMPANY,
  };
}

export function EditPostDialog({
  post,
  open,
  onOpenChange,
  onSaved,
}: EditPostDialogProps) {
  const { user } = useAuth();
  const { data: atlasData } = useAtlasAll();

  const [equipmentQuery, setEquipmentQuery] = useState("");
  const [companies, setCompanies] = useState<PointStackCompany[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<EditPostFormValues>({
    resolver: zodResolver(editPostFormSchema),
    defaultValues: getInitialValues(post),
  });

  const equipmentIds = useWatch({
    control: form.control,
    name: "equipmentIds",
    defaultValue: [],
  });
  const images = useWatch({
    control: form.control,
    name: "images",
    defaultValue: [],
  });
  const documents = useWatch({
    control: form.control,
    name: "documents",
    defaultValue: [],
  });

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
    form.reset(getInitialValues(post));
  }, [post, open, form]);

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
      form.setValue("equipmentIds", [...equipmentIds, id], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setEquipmentQuery("");
    }
  };

  const removeEquipment = (id: string) => {
    form.setValue(
      "equipmentIds",
      equipmentIds.filter((item) => item !== id),
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      }
    );
  };

  const uploadFiles = async (
    fileList: FileList,
    folder: string,
    allowedTypes: string[],
    maxSize: number
  ) => {
    if (!user) {
      setSubmitError("You must be signed in to upload files.");
      return [] as string[];
    }

    const supabase = createClient();
    if (!supabase) {
      setSubmitError("Upload service is unavailable.");
      return [] as string[];
    }

    const uploadedUrls: string[] = [];
    for (const file of Array.from(fileList)) {
      if (allowedTypes.length > 0 && file.type && !allowedTypes.includes(file.type)) {
        setSubmitError(`Unsupported file type: ${file.name}`);
        continue;
      }
      if (file.size > maxSize) {
        setSubmitError(`File too large: ${file.name}`);
        continue;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "dat";
      const fileName = `${user.id}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("pointstack-posts")
        .upload(fileName, file);

      if (uploadError) {
        console.error(uploadError);
        setSubmitError(`Failed to upload ${file.name}`);
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

    setSubmitError(null);
    setUploadingImages(true);
    const urls = await uploadFiles(fileList, "images", IMAGE_TYPES, MAX_IMAGE_SIZE);
    if (urls.length > 0) {
      form.setValue("images", [...images, ...urls], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
    setUploadingImages(false);
    event.target.value = "";
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    setSubmitError(null);
    setUploadingDocuments(true);
    const urls = await uploadFiles(fileList, "documents", DOC_TYPES, MAX_DOC_SIZE);
    if (urls.length > 0) {
      form.setValue("documents", [...documents, ...urls], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
    setUploadingDocuments(false);
    event.target.value = "";
  };

  const onSubmit = async (values: EditPostFormValues) => {
    setSubmitError(null);

    const parsedSquareFootage = values.squareFootage.trim()
      ? Number(values.squareFootage.trim())
      : undefined;

    try {
      const updatedPost = await api.updatePost(post.id, {
        title: values.title.trim(),
        content: values.content.trim(),
        tags: values.tags,
        equipment_ids: values.equipmentIds,
        is_showcase: post.post_type === "project" ? values.isShowcase : undefined,
        cover_image_url: post.post_type === "project" ? values.images[0] || null : undefined,
        images: post.post_type === "project" ? values.images : undefined,
        documents: post.post_type === "project" ? values.documents : undefined,
        location: post.post_type === "project" ? values.location.trim() || undefined : undefined,
        completion_date: post.post_type === "project" ? values.completionDate || undefined : undefined,
        square_footage: post.post_type === "project" ? parsedSquareFootage : undefined,
        company_id:
          post.post_type === "project"
            ? values.companyId === NONE_COMPANY
              ? null
              : values.companyId
            : undefined,
      });

      if (onSaved) {
        await onSaved(updatedPost);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating post:", error);
      setSubmitError("Failed to update post. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {post.post_type === "project" ? "Project" : "Post"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} id="edit-title" maxLength={200} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea {...field} id="edit-content" rows={8} maxLength={50000} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Tags</FormLabel>
                  <TagInput value={field.value} onChange={field.onChange} suggestions={[]} />
                  <FormMessage />
                </FormItem>
              )}
            />

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
                <FormField
                  control={form.control}
                  name="isShowcase"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <input
                          id="edit-showcase"
                          type="checkbox"
                          checked={field.value}
                          onChange={(event) => field.onChange(event.target.checked)}
                          className="size-4"
                        />
                      </FormControl>
                      <FormLabel htmlFor="edit-showcase">Show in showcase</FormLabel>
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input {...field} id="edit-location" placeholder="Optional project location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="completionDate"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Completion Date</FormLabel>
                        <FormControl>
                          <Input {...field} id="edit-completion-date" type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="squareFootage"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Square Footage</FormLabel>
                        <FormControl>
                          <Input {...field} id="edit-square-footage" type="number" min={0} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="No company" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={NONE_COMPANY}>No company</SelectItem>
                              {companies.map((company) => (
                                <SelectItem key={company.id} value={company.id}>
                                  {company.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="Project upload" className="w-full h-32 object-cover" />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2"
                            onClick={() =>
                              form.setValue(
                                "images",
                                images.filter((item) => item !== url),
                                { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                              )
                            }
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
                            onClick={() =>
                              form.setValue(
                                "documents",
                                documents.filter((item) => item !== url),
                                { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                              )
                            }
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

            {submitError && <p className="text-sm text-destructive">{submitError}</p>}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || uploadingImages || uploadingDocuments}
              >
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
