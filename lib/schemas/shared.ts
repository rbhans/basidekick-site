import { z } from "zod";
import { validateContent, validateTitle } from "@/lib/security";

export const titleSchema = z
  .string()
  .superRefine((value, ctx) => {
    const validation = validateTitle(value);
    if (!validation.valid) {
      ctx.addIssue({
        code: "custom",
        message: validation.error ?? "Invalid title",
      });
    }
  })
  .transform((value) => validateTitle(value).sanitized);

export const contentSchema = z
  .string()
  .superRefine((value, ctx) => {
    const validation = validateContent(value);
    if (!validation.valid) {
      ctx.addIssue({
        code: "custom",
        message: validation.error ?? "Invalid content",
      });
    }
  })
  .transform((value) => validateContent(value).sanitized);
