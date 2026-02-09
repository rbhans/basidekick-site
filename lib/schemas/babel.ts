import { z } from "zod";
import type { BabelContributionType } from "@/lib/types";

const CONTRIBUTION_TYPES = [
  "error",
  "edit",
  "new_entry",
] as const satisfies readonly BabelContributionType[];

export const babelContributionFormSchema = z.object({
  type: z.enum(CONTRIBUTION_TYPES),
  title: z.string().trim().min(1, "Please enter a title").max(200),
  description: z
    .string()
    .trim()
    .min(1, "Please describe your suggestion")
    .max(10000),
  suggestedChanges: z.string().max(10000),
});

export type BabelContributionFormValues = z.infer<
  typeof babelContributionFormSchema
>;
