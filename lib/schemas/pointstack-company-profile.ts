import { z } from "zod";
import type {
  PointStackAvailabilityStatus,
  PointStackCompanySizeRange,
} from "@/lib/types";

export const COMPANY_SIZE_OPTIONS = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "500+",
] as const satisfies readonly PointStackCompanySizeRange[];

export const COMPANY_SIZE_NONE = "__none__";

const optionalHttpUrlSchema = z.string().superRefine((value, ctx) => {
  const trimmed = value.trim();
  if (!trimmed) return;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      ctx.addIssue({
        code: "custom",
        message: "URL must start with http:// or https://.",
      });
    }
  } catch {
    ctx.addIssue({
      code: "custom",
      message: "Please enter a valid URL.",
    });
  }
});

export const createCompanyFormSchema = z.object({
  name: z.string().trim().min(1, "Company name is required.").max(120),
  description: z.string().max(1000),
});

export type CreateCompanyFormValues = z.infer<typeof createCompanyFormSchema>;

export const editCompanyFormSchema = z.object({
  name: z.string().trim().min(1, "Company name is required.").max(120),
  description: z.string().max(2000),
  websiteUrl: optionalHttpUrlSchema,
  location: z.string().max(140),
  sizeRange: z.enum([
    COMPANY_SIZE_NONE,
    ...COMPANY_SIZE_OPTIONS,
  ] as const),
  industry: z.string().max(120),
  logoUrl: optionalHttpUrlSchema,
});

export type EditCompanyFormValues = z.infer<typeof editCompanyFormSchema>;

export const AVAILABILITY_OPTIONS = [
  "available",
  "busy",
  "not-looking",
] as const satisfies readonly PointStackAvailabilityStatus[];

const skillSchema = z.string().trim().min(1).max(40);

export const profileEditFormSchema = z.object({
  displayName: z.string().max(120),
  headline: z.string().max(160),
  bio: z.string().max(500, "Bio must be 500 characters or fewer."),
  location: z.string().max(140),
  skills: z.array(skillSchema).max(10, "You can add up to 10 skills."),
  websiteUrl: optionalHttpUrlSchema,
  linkedinUrl: optionalHttpUrlSchema,
  githubUrl: optionalHttpUrlSchema,
  availabilityStatus: z.enum(AVAILABILITY_OPTIONS),
  coverImageUrl: z.string(),
  coverColor: z
    .string()
    .refine(
      (v) => v === "" || /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v),
      "Enter a valid hex color (e.g. #1a1a1a)."
    ),
});

export type ProfileEditFormValues = z.infer<typeof profileEditFormSchema>;

export const onboardingFormSchema = z.object({
  displayName: z.string().max(120),
  headline: z.string().max(160),
  location: z.string().max(140),
  skills: z.array(skillSchema).max(10, "You can add up to 10 skills."),
});

export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;
