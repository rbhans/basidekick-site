"use client";

import { useEffect, useMemo, useState, ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
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
import { usePointStackStore } from "../pointstack-store";
import { createClient } from "@/lib/supabase/client";
import { PointStackPostType } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import {
  createPostFormSchema,
  CreatePostFormValues,
} from "@/lib/schemas/pointstack-content";

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

function getInitialValues(defaultType: PointStackPostType): CreatePostFormValues {
  return {
    postType: defaultType === "job" ? "discussion" : defaultType,
    title: "",
    content: "",
    tags: [],
    equipmentIds: [],
    isShowcase: false,
    imageUploads: [],
    documentUploads: [],
  };
}

export function CreatePostDialog({ trigger, defaultType = "discussion" }: CreatePostDialogProps) {
  const router = useRouter();
  const { createPost } = usePointStackStore();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [equipmentQuery, setEquipmentQuery] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const { data: atlasData } = useAtlasAll();

  const form = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostFormSchema),
    defaultValues: getInitialValues(defaultType),
  });

  const postType = useWatch({
    control: form.control,
    name: "postType",
    defaultValue: "discussion",
  });
  const content = useWatch({
    control: form.control,
    name: "content",
    defaultValue: "",
  });
  const equipmentIds = useWatch({
    control: form.control,
    name: "equipmentIds",
    defaultValue: [],
  });
  const imageUploads = useWatch({
    control: form.control,
    name: "imageUploads",
    defaultValue: [],
  });
  const documentUploads = useWatch({
    control: form.control,
    name: "documentUploads",
    defaultValue: [],
  });

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

  useEffect(() => {
    if (postType !== "project") {
      form.setValue("isShowcase", false);
      form.setValue("imageUploads", []);
      form.setValue("documentUploads", []);
    }
  }, [postType, form]);

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
    files: FileList,
    folder: string,
    allowedTypes: string[],
    maxSize: number
  ) => {
    if (!user) {
      setSubmitError("You must be signed in to upload files.");
      return [] as { name: string; url: string }[];
    }

    const supabase = createClient();
    if (!supabase) {
      setSubmitError("Upload service not available.");
      return [] as { name: string; url: string }[];
    }

    const uploads: { name: string; url: string }[] = [];
    for (const file of Array.from(files)) {
      if (allowedTypes.length > 0 && file.type && !allowedTypes.includes(file.type)) {
        setSubmitError("Unsupported file type.");
        continue;
      }
      if (file.size > maxSize) {
        setSubmitError("File is too large.");
        continue;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "dat";
      const fileName = `${user.id}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("pointstack-posts")
        .upload(fileName, file);

      if (uploadError) {
        console.error(uploadError);
        setSubmitError("Failed to upload file.");
        continue;
      }

      const { data } = supabase.storage.from("pointstack-posts").getPublicUrl(fileName);
      uploads.push({ name: file.name, url: data.publicUrl });
    }

    return uploads;
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setSubmitError(null);
    setUploadingImages(true);
    const uploads = await uploadFiles(files, "images", IMAGE_TYPES, MAX_IMAGE_SIZE);
    if (uploads.length > 0) {
      form.setValue("imageUploads", [...imageUploads, ...uploads], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
    setUploadingImages(false);
    event.target.value = "";
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setSubmitError(null);
    setUploadingDocuments(true);
    const uploads = await uploadFiles(files, "documents", DOC_TYPES, MAX_DOC_SIZE);
    if (uploads.length > 0) {
      form.setValue("documentUploads", [...documentUploads, ...uploads], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
    setUploadingDocuments(false);
    event.target.value = "";
  };

  const removeImage = (url: string) => {
    form.setValue(
      "imageUploads",
      imageUploads.filter((img) => img.url !== url),
      { shouldDirty: true, shouldTouch: true, shouldValidate: true }
    );
  };

  const removeDocument = (url: string) => {
    form.setValue(
      "documentUploads",
      documentUploads.filter((doc) => doc.url !== url),
      { shouldDirty: true, shouldTouch: true, shouldValidate: true }
    );
  };

  const onSubmit = async (values: CreatePostFormValues) => {
    setSubmitError(null);

    try {
      const images = values.postType === "project" ? values.imageUploads.map((img) => img.url) : [];
      const documents = values.postType === "project" ? values.documentUploads.map((doc) => doc.url) : [];

      const post = await createPost({
        post_type: values.postType,
        title: values.title.trim(),
        content: values.content.trim(),
        tags: values.tags,
        equipment_ids: values.equipmentIds,
        is_showcase: values.postType === "project" ? values.isShowcase : false,
        cover_image_url: values.postType === "project" ? images[0] || null : null,
        images,
        documents,
      });

      setOpen(false);
      setEquipmentQuery("");
      form.reset({
        ...getInitialValues(defaultType),
        postType: values.postType,
      });

      const destination =
        post.post_type === "project"
          ? ROUTES.POINTSTACK_PROJECT(post.slug)
          : post.post_type === "question"
            ? ROUTES.POINTSTACK_QUESTION(post.slug)
            : post.post_type === "job"
              ? ROUTES.POINTSTACK_JOB(post.slug)
              : ROUTES.POINTSTACK_POST(post.slug);

      router.push(destination);
    } catch (error) {
      console.error("Error creating post:", error);
      setSubmitError("Failed to create post. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="postType"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Post Type</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value as PointStackPostType)}
                    >
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="title"
                      placeholder={
                        postType === "question"
                          ? "What do you want to know?"
                          : postType === "tip"
                            ? "What's your tip about?"
                            : "Give your post a title"
                      }
                      maxLength={200}
                    />
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
                    <Textarea
                      {...field}
                      id="content"
                      placeholder={
                        postType === "question"
                          ? "Provide details about your question..."
                          : postType === "tip"
                            ? "Share your tip with the community..."
                            : "Write your post content..."
                      }
                      rows={6}
                      maxLength={50000}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground text-right">
                    {content.length.toLocaleString()} / 50,000
                  </p>
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
                  <TagInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Add relevant tags..."
                    maxTags={5}
                    suggestions={SUGGESTED_TAGS}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {postType === "project" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isShowcase"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Showcase</FormLabel>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(event) => field.onChange(event.target.checked)}
                        />
                        Show in Project Showcase
                      </label>
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label>Project Images (optional)</Label>
                  <input
                    type="file"
                    accept={IMAGE_TYPES.join(",")}
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                  />
                  {uploadingImages && (
                    <p className="text-xs text-muted-foreground">Uploading images...</p>
                  )}
                  {imageUploads.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {imageUploads.map((img) => (
                        <div
                          key={img.url}
                          className="flex items-center gap-2 border border-border rounded px-2 py-1 text-xs"
                        >
                          <span className="truncate max-w-[180px]">{img.name}</span>
                          <button
                            type="button"
                            onClick={() => removeImage(img.url)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Project Documents (optional)</Label>
                  <input
                    type="file"
                    accept={DOC_TYPES.join(",")}
                    multiple
                    onChange={handleDocumentUpload}
                    disabled={uploadingDocuments}
                  />
                  {uploadingDocuments && (
                    <p className="text-xs text-muted-foreground">Uploading documents...</p>
                  )}
                  {documentUploads.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {documentUploads.map((doc) => (
                        <div
                          key={doc.url}
                          className="flex items-center justify-between border border-border rounded px-2 py-1 text-xs"
                        >
                          <span className="truncate">{doc.name}</span>
                          <button
                            type="button"
                            onClick={() => removeDocument(doc.url)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

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
                    onChange={(event) => setEquipmentQuery(event.target.value)}
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

            {submitError && <p className="text-sm text-destructive">{submitError}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || uploadingImages || uploadingDocuments}
              >
                {form.formState.isSubmitting ? "Creating..." : "Create Post"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
