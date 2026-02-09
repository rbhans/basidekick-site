import { z } from "zod";
import { contentSchema, titleSchema } from "@/lib/schemas/shared";
import type { PointStackExperienceLevel, PointStackJobType } from "@/lib/types";

export const NONE_OPTION = "__none__";

export const JOB_TYPES = [
  "full-time",
  "part-time",
  "contract",
  "freelance",
  "internship",
] as const satisfies readonly PointStackJobType[];

export const EXPERIENCE_LEVELS = [
  "entry",
  "mid",
  "senior",
  "lead",
  "executive",
] as const satisfies readonly PointStackExperienceLevel[];

const optionalContentString = z.string().superRefine((value, ctx) => {
  if (!value.trim()) return;
  const parsed = contentSchema.safeParse(value);
  if (!parsed.success) {
    ctx.addIssue({
      code: "custom",
      message: parsed.error.issues[0]?.message ?? "Invalid content",
    });
  }
});

const optionalUrlString = z.string().trim().superRefine((value, ctx) => {
  if (!value) return;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      ctx.addIssue({
        code: "custom",
        message: "Application URL must be a valid http/https URL.",
      });
    }
  } catch {
    ctx.addIssue({
      code: "custom",
      message: "Application URL must be a valid http/https URL.",
    });
  }
});

const optionalEmailString = z.string().trim().superRefine((value, ctx) => {
  if (!value) return;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    ctx.addIssue({
      code: "custom",
      message: "Application email is invalid.",
    });
  }
});

export const createJobFormSchema = z
  .object({
    title: titleSchema,
    description: contentSchema,
    requirements: optionalContentString,
    jobType: z.enum(JOB_TYPES),
    experienceLevel: z.union([z.enum(EXPERIENCE_LEVELS), z.literal(NONE_OPTION)]),
    location: z.string().max(140, "Location cannot exceed 140 characters."),
    isRemote: z.boolean(),
    salaryMin: z.string(),
    salaryMax: z.string(),
    applicationUrl: optionalUrlString,
    applicationEmail: optionalEmailString,
    companyId: z.string(),
  })
  .superRefine((value, ctx) => {
    if (!value.applicationUrl.trim() && !value.applicationEmail.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Provide either an application URL or application email.",
        path: ["applicationUrl"],
      });
    }

    const salaryMin = value.salaryMin.trim() ? Number(value.salaryMin) : undefined;
    const salaryMax = value.salaryMax.trim() ? Number(value.salaryMax) : undefined;

    if (salaryMin !== undefined && Number.isNaN(salaryMin)) {
      ctx.addIssue({
        code: "custom",
        message: "Salary fields must be valid numbers.",
        path: ["salaryMin"],
      });
    }

    if (salaryMax !== undefined && Number.isNaN(salaryMax)) {
      ctx.addIssue({
        code: "custom",
        message: "Salary fields must be valid numbers.",
        path: ["salaryMax"],
      });
    }

    if (salaryMin !== undefined && salaryMin < 0) {
      ctx.addIssue({
        code: "custom",
        message: "Salary minimum cannot be negative.",
        path: ["salaryMin"],
      });
    }

    if (salaryMax !== undefined && salaryMax < 0) {
      ctx.addIssue({
        code: "custom",
        message: "Salary maximum cannot be negative.",
        path: ["salaryMax"],
      });
    }

    if (
      salaryMin !== undefined &&
      salaryMax !== undefined &&
      !Number.isNaN(salaryMin) &&
      !Number.isNaN(salaryMax) &&
      salaryMin > salaryMax
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Salary minimum cannot be greater than salary maximum.",
        path: ["salaryMin"],
      });
    }
  });

export type CreateJobFormValues = z.infer<typeof createJobFormSchema>;
