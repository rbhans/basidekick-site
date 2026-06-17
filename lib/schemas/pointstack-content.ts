import { z } from "zod";
import type {
  PointStackPostType,
  PointStackResourceCategory,
} from "@/lib/types";
import { contentSchema, titleSchema } from "@/lib/schemas/shared";

export const POST_TYPES = [
  "discussion",
  "question",
  "tip",
  "project",
] as const satisfies readonly PointStackPostType[];

export const RESOURCE_CATEGORIES = [
  "template",
  "script",
  "document",
  "guide",
  "tool",
  "other",
] as const satisfies readonly PointStackResourceCategory[];

export const NONE_COMPANY = "__none__";

const optionalContentString = z.string().superRefine((value, ctx) => {
  if (!value.trim()) return;
  const parsed = contentSchema.safeParse(value);
  if (!parsed.success) {
    ctx.addIssue({
      code: "custom",
      message: parsed.error.issues[0]?.message ?? "Invalid content.",
    });
  }
});

const optionalHttpUrl = z.string().trim().superRefine((value, ctx) => {
  if (!value) return;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      ctx.addIssue({
        code: "custom",
        message: "URL must be a valid http/https URL.",
      });
    }
  } catch {
    ctx.addIssue({
      code: "custom",
      message: "URL must be a valid http/https URL.",
    });
  }
});

const optionalHttpUrlList = z.string().trim().superRefine((value, ctx) => {
  if (!value) return;

  const urls = value
    .split(/\r?\n|,/)
    .map((url) => url.trim())
    .filter(Boolean);

  urls.forEach((url) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        ctx.addIssue({
          code: "custom",
          message: "Each image URL must be a valid http/https URL.",
        });
      }
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "Each image URL must be a valid http/https URL.",
      });
    }
  });
});

export const createPostFormSchema = z.object({
  postType: z.enum(POST_TYPES),
  title: titleSchema,
  content: contentSchema,
  tags: z.array(z.string()).max(5),
  equipmentIds: z.array(z.string()),
  isShowcase: z.boolean(),
  imageUploads: z.array(
    z.object({
      name: z.string(),
      url: z.string().url(),
    })
  ),
  documentUploads: z.array(
    z.object({
      name: z.string(),
      url: z.string().url(),
    })
  ),
});

export type CreatePostFormValues = z.infer<typeof createPostFormSchema>;

export const editPostFormSchema = z
  .object({
    title: titleSchema,
    content: contentSchema,
    tags: z.array(z.string()).max(5),
    equipmentIds: z.array(z.string()),
    isShowcase: z.boolean(),
    location: z.string(),
    completionDate: z.string(),
    squareFootage: z.string(),
    images: z.array(z.string().url()),
    documents: z.array(z.string().url()),
    companyId: z.string(),
  })
  .superRefine((value, ctx) => {
    const parsed = value.squareFootage.trim()
      ? Number(value.squareFootage.trim())
      : undefined;

    if (parsed !== undefined && (!Number.isFinite(parsed) || parsed < 0)) {
      ctx.addIssue({
        code: "custom",
        message: "Square footage must be a positive number.",
        path: ["squareFootage"],
      });
    }
  });

export type EditPostFormValues = z.infer<typeof editPostFormSchema>;

export const createResourceFormSchema = z
  .object({
    title: titleSchema,
    description: optionalContentString,
    category: z.enum(RESOURCE_CATEGORIES),
    tags: z.array(z.string().trim().min(1).max(40)).max(8),
    imageUrls: optionalHttpUrlList,
    fileUrl: optionalHttpUrl,
    externalLink: optionalHttpUrl,
    isFree: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (!value.fileUrl.trim() && !value.externalLink.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Provide either a file link or a project/reference link.",
        path: ["fileUrl"],
      });
    }
  });

export type CreateResourceFormValues = z.infer<typeof createResourceFormSchema>;
