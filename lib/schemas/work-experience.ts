import { z } from "zod";
import type { WorkExperienceKind } from "@/lib/types";

export const WORK_EXPERIENCE_KINDS = [
  "work",
  "education",
] as const satisfies readonly WorkExperienceKind[];

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1950;

/** Descending list of selectable years (next year .. 1950). */
export const WORK_EXPERIENCE_YEARS: number[] = Array.from(
  { length: CURRENT_YEAR + 1 - MIN_YEAR + 1 },
  (_, i) => CURRENT_YEAR + 1 - i,
);

const optionalHttpUrlSchema = z.string().superRefine((value, ctx) => {
  const trimmed = value.trim();
  if (!trimmed) return;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      ctx.addIssue({ code: "custom", message: "URL must start with http:// or https://." });
    }
  } catch {
    ctx.addIssue({ code: "custom", message: "Please enter a valid URL." });
  }
});

const tagSchema = z.string().trim().min(1).max(40);

export const workExperienceFormSchema = z
  .object({
    kind: z.enum(WORK_EXPERIENCE_KINDS),
    title: z.string().trim().min(1, "Title is required.").max(160),
    organization: z.string().trim().min(1, "Organization is required.").max(160),
    organizationUrl: optionalHttpUrlSchema,
    location: z.string().max(140),
    startYear: z
      .number({ message: "Start year is required." })
      .int()
      .min(MIN_YEAR)
      .max(CURRENT_YEAR + 1),
    isCurrent: z.boolean(),
    endYear: z
      .number()
      .int()
      .min(MIN_YEAR)
      .max(CURRENT_YEAR + 1)
      .nullable(),
    description: z.string().max(800, "Keep it under 800 characters."),
    tags: z.array(tagSchema).max(8, "You can add up to 8 tags."),
  })
  .superRefine((value, ctx) => {
    if (!value.isCurrent) {
      if (value.endYear == null) {
        ctx.addIssue({
          code: "custom",
          path: ["endYear"],
          message: "Add an end year, or mark this as current.",
        });
      } else if (value.endYear < value.startYear) {
        ctx.addIssue({
          code: "custom",
          path: ["endYear"],
          message: "End year can't be before the start year.",
        });
      }
    }
  });

export type WorkExperienceFormValues = z.infer<typeof workExperienceFormSchema>;
